import os
import secrets
import re
from datetime import timedelta
from decimal import Decimal
from django.db.models import Sum, Count, Q
from django.utils import timezone
from django.conf import settings
from django.contrib.auth.hashers import make_password, check_password
from rest_framework import status, views, viewsets, permissions
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework_simplejwt.tokens import RefreshToken

from .models import CustomUser, Category, Product, Cart, CartItem, Order, OrderItem, StoreSetting, OTPVerification
from .serializers import (
    UserProfileSerializer,
    CategorySerializer,
    ProductSerializer,
    CartSerializer,
    CartItemSerializer,
    OrderSerializer,
    StoreSettingSerializer,
)
from .permissions import IsAdminUserOrReadOnly, IsAdminRole, IsOwnerOrAdmin, check_is_admin, get_admin_email, get_admin_mobile
from .sms_service import SMSService, clean_indian_mobile
from .payment_gateway import (
    create_gateway_order,
    verify_payment_signature,
    verify_payment_with_gateway,
    verify_webhook_signature,
)
import json
import logging

logger = logging.getLogger(__name__)


# =====================================================================
# Customer Password-Based Authentication Views (Login & Registration)
# =====================================================================

class UserLoginView(views.APIView):
    """
    Standard Customer & User Login Endpoint.
    Authenticates users via Mobile Number or Email + Password.
    Returns JWT access & refresh tokens and user profile.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        identifier = (
            request.data.get('mobile', '')
            or request.data.get('email', '')
            or request.data.get('username', '')
            or request.data.get('identifier', '')
        )
        password = request.data.get('password', '')

        if not identifier or not password:
            return Response({
                'success': False,
                'message': 'Mobile number / Email and password are required.'
            }, status=status.HTTP_400_BAD_REQUEST)

        ident_str = str(identifier).strip()
        clean_mob = clean_indian_mobile(ident_str)

        user = None
        if clean_mob:
            user = CustomUser.objects.filter(mobile=clean_mob).first()
        if not user:
            user = CustomUser.objects.filter(email__iexact=ident_str.lower()).first()
        if not user and not clean_mob:
            user = CustomUser.objects.filter(mobile=ident_str).first()

        if not user:
            return Response({
                'success': False,
                'message': 'No account found with this mobile number or email. Please check your credentials or create an account.'
            }, status=status.HTTP_400_BAD_REQUEST)

        if not user.check_password(password):
            return Response({
                'success': False,
                'message': 'Incorrect password. Please try again.'
            }, status=status.HTTP_400_BAD_REQUEST)

        if not user.is_active:
            return Response({
                'success': False,
                'message': 'Your account has been deactivated. Please contact store management.'
            }, status=status.HTTP_403_FORBIDDEN)

        # Ensure customer cart exists
        Cart.objects.get_or_create(user=user)

        # Issue JWT Access & Refresh Tokens
        refresh = RefreshToken.for_user(user)
        user_data = UserProfileSerializer(user).data

        return Response({
            'success': True,
            'message': f"Namaste, {user.full_name}! Login successful.",
            'tokens': {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            },
            'user': user_data
        }, status=status.HTTP_200_OK)


class UserRegisterView(views.APIView):
    """
    Standard Customer Registration Endpoint.
    Registers a new user with Full Name, 10-digit Mobile Number, and Password.
    Returns JWT access & refresh tokens and logs in the new user immediately.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        full_name = request.data.get('full_name', '').strip()
        raw_mobile = request.data.get('mobile', '')
        password = request.data.get('password', '')
        email = request.data.get('email', '').strip()
        address = request.data.get('address', '').strip()
        village_area = request.data.get('village_area', '').strip()
        city = request.data.get('city', '').strip() or 'Benipatti'
        state = request.data.get('state', '').strip() or 'Bihar'
        pincode = request.data.get('pincode', '').strip() or '847213'

        if not full_name or len(full_name) < 2:
            return Response({
                'success': False,
                'message': 'Please enter your valid full name.'
            }, status=status.HTTP_400_BAD_REQUEST)

        clean_mobile = clean_indian_mobile(raw_mobile)
        if not clean_mobile or len(clean_mobile) != 10 or not clean_mobile[0] in '6789':
            return Response({
                'success': False,
                'message': 'Please enter a valid 10-digit Indian mobile number (starts with 6, 7, 8, or 9).'
            }, status=status.HTTP_400_BAD_REQUEST)

        if not password or len(password) < 6:
            return Response({
                'success': False,
                'message': 'Password must be at least 6 characters long.'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Check existing mobile
        if CustomUser.objects.filter(mobile=clean_mobile).exists():
            return Response({
                'success': False,
                'message': 'An account with this mobile number already exists. Please sign in with your password.'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Check existing email if provided
        email_clean = None
        if email:
            email_clean = email.lower()
            if CustomUser.objects.filter(email__iexact=email_clean).exists():
                return Response({
                    'success': False,
                    'message': 'An account with this email address already exists.'
                }, status=status.HTTP_400_BAD_REQUEST)

        # Create user
        user = CustomUser(
            mobile=clean_mobile,
            email=email_clean,
            full_name=full_name,
            role='customer',
            is_staff=False,
            is_superuser=False,
            address=address,
            village_area=village_area,
            city=city,
            state=state,
            pincode=pincode
        )
        user.set_password(password)
        user.save()

        Cart.objects.get_or_create(user=user)

        # Issue JWT Access & Refresh Tokens
        refresh = RefreshToken.for_user(user)
        user_data = UserProfileSerializer(user).data

        return Response({
            'success': True,
            'message': f"Welcome to Upendra General Stores, {user.full_name}! Your account is ready.",
            'tokens': {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            },
            'user': user_data
        }, status=status.HTTP_201_CREATED)


# =====================================================================
# Customer Phone + Real OTP Authentication Views
# =====================================================================

class SendOTPView(views.APIView):
    """
    Step 1: Customer enters a 10-digit Indian mobile number.
    Generates a cryptographically random 6-digit OTP, securely hashes it,
    dispatches a REAL SMS to the customer's phone via configured SMS provider,
    and returns a unique session_token.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        raw_mobile = request.data.get('mobile', '')
        full_name = request.data.get('full_name', '').strip()

        clean_mobile = clean_indian_mobile(raw_mobile)
        if not clean_mobile:
            return Response({
                'success': False,
                'message': 'Please enter a valid 10-digit Indian mobile number (e.g. 9876543210).'
            }, status=status.HTTP_400_BAD_REQUEST)

        # 1. Check Rate Limiting & 60s Resend Cooldown
        one_minute_ago = timezone.now() - timedelta(seconds=60)
        recent_otp = OTPVerification.objects.filter(
            mobile=clean_mobile,
            created_at__gte=one_minute_ago,
            is_verified=False
        ).first()

        if recent_otp:
            time_left = int(60 - (timezone.now() - recent_otp.created_at).total_seconds())
            return Response({
                'success': False,
                'message': f'Please wait {max(1, time_left)} seconds before requesting a new OTP.',
                'cooldown_seconds': max(1, time_left)
            }, status=status.HTTP_429_TOO_MANY_REQUESTS)

        # 2. Prevent Abuse (Max 5 requests per hour)
        one_hour_ago = timezone.now() - timedelta(hours=1)
        hourly_count = OTPVerification.objects.filter(
            mobile=clean_mobile,
            created_at__gte=one_hour_ago
        ).count()

        if hourly_count >= 6:
            return Response({
                'success': False,
                'message': 'Too many OTP requests for this number. Please try again after 1 hour.'
            }, status=status.HTTP_429_TOO_MANY_REQUESTS)

        # 3. Generate 6-Digit Cryptographic OTP
        otp_code = str(secrets.randbelow(900000) + 100000)
        session_token = secrets.token_hex(32)
        otp_hash = make_password(otp_code)

        # 4. Dispatch Real SMS via SMS Provider
        sms_sent, sms_msg = SMSService.send_otp_sms(clean_mobile, otp_code)
        if not sms_sent:
            return Response({
                'success': False,
                'message': sms_msg or 'Failed to send OTP SMS. Please check mobile number or try again later.'
            }, status=status.HTTP_400_BAD_REQUEST)

        # 5. Invalidate older unverified OTP records for this mobile
        OTPVerification.objects.filter(mobile=clean_mobile, is_verified=False).delete()

        # 6. Save new OTP verification record (5 min expiry)
        OTPVerification.objects.create(
            session_token=session_token,
            mobile=clean_mobile,
            otp_code=otp_hash,
            purpose='login',
            role='customer',
            payload={'full_name': full_name} if full_name else {},
            expires_at=timezone.now() + timedelta(minutes=5)
        )

        is_existing_customer = CustomUser.objects.filter(mobile=clean_mobile).exists()

        return Response({
            'success': True,
            'message': f'OTP has been sent via SMS to +91 {clean_mobile[:5]} {clean_mobile[5:]}.',
            'session_token': session_token,
            'is_new_user': not is_existing_customer,
            'expires_in': 300
        }, status=status.HTTP_200_OK)


class VerifyOTPView(views.APIView):
    """
    Step 2: Verifies the 6-digit OTP code against the backend hashed record.
    On successful verification:
    - Authenticates the customer
    - Creates the customer account if new
    - Logs in the customer if already registered
    - Returns JWT access & refresh tokens
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        session_token = request.data.get('session_token', '').strip()
        raw_mobile = request.data.get('mobile', '')
        otp_entered = str(request.data.get('otp', '')).strip()
        full_name_input = request.data.get('full_name', '').strip()

        clean_mobile = clean_indian_mobile(raw_mobile)
        if not clean_mobile:
            return Response({
                'success': False,
                'message': 'Please enter a valid 10-digit Indian mobile number.'
            }, status=status.HTTP_400_BAD_REQUEST)

        if not otp_entered or len(otp_entered) != 6 or not otp_entered.isdigit():
            return Response({
                'success': False,
                'message': 'Please enter the valid 6-digit OTP received on your mobile.'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Look up OTP verification session
        otp_record = None
        if session_token:
            otp_record = OTPVerification.objects.filter(
                session_token=session_token,
                mobile=clean_mobile
            ).first()

        if not otp_record:
            # Fallback lookup by mobile if session_token was lost
            otp_record = OTPVerification.objects.filter(
                mobile=clean_mobile,
                is_verified=False
            ).order_by('-created_at').first()

        if not otp_record:
            return Response({
                'success': False,
                'message': 'No active OTP request found for this mobile number. Please request a new OTP.'
            }, status=status.HTTP_400_BAD_REQUEST)

        if otp_record.is_verified:
            return Response({
                'success': False,
                'message': 'This OTP has already been used. Please request a new OTP.'
            }, status=status.HTTP_400_BAD_REQUEST)

        if otp_record.is_expired():
            return Response({
                'success': False,
                'message': 'OTP has expired. Please request a new OTP.'
            }, status=status.HTTP_400_BAD_REQUEST)

        if otp_record.attempts >= otp_record.max_attempts:
            otp_record.delete()
            return Response({
                'success': False,
                'message': 'Maximum OTP verification attempts exceeded. Please request a new OTP.'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Validate OTP using constant-time cryptographic hash verification
        is_valid_otp = check_password(otp_entered, otp_record.otp_code)
        if not is_valid_otp:
            otp_record.attempts += 1
            otp_record.save(update_fields=['attempts'])
            remaining = otp_record.max_attempts - otp_record.attempts
            return Response({
                'success': False,
                'message': f'Invalid OTP code. {remaining} {"attempt" if remaining == 1 else "attempts"} remaining.'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Mark OTP as verified & consumed
        otp_record.is_verified = True
        otp_record.save(update_fields=['is_verified'])

        # Create or fetch Customer User
        user = CustomUser.objects.filter(mobile=clean_mobile).first()
        is_new = False

        if not user:
            is_new = True
            name = full_name_input or otp_record.payload.get('full_name') or f"Customer {clean_mobile[-4:]}"
            user = CustomUser(
                mobile=clean_mobile,
                email=None,
                full_name=name,
                role='customer',
                is_staff=False,
                is_superuser=False,
                city='Benipatti',
                state='Bihar',
                pincode='847213'
            )
            user.save()
            Cart.objects.get_or_create(user=user)
        else:
            # If customer previously had default name and provided a real name
            if full_name_input and ('Customer' in user.full_name or len(user.full_name) <= 3):
                user.full_name = full_name_input
                user.save(update_fields=['full_name', 'updated_at'])
            Cart.objects.get_or_create(user=user)

        # Clean up verified OTP records
        OTPVerification.objects.filter(mobile=clean_mobile).delete()

        # Issue JWT Access & Refresh Tokens
        refresh = RefreshToken.for_user(user)
        user_data = UserProfileSerializer(user).data

        welcome_msg = (
            f"Welcome to Upendra General Stores, {user.full_name}!"
            if is_new else
            f"Namaste, {user.full_name}! Login successful."
        )

        return Response({
            'success': True,
            'message': welcome_msg,
            'tokens': {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            },
            'user': user_data
        }, status=status.HTTP_200_OK)


class ResendOTPView(views.APIView):
    """
    Resends a new OTP to the customer's phone with cooldown protection.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        session_token = request.data.get('session_token', '').strip()
        raw_mobile = request.data.get('mobile', '')

        clean_mobile = clean_indian_mobile(raw_mobile)
        if not clean_mobile:
            return Response({
                'success': False,
                'message': 'Please enter a valid 10-digit Indian mobile number.'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Check 60-second cooldown
        last_otp = OTPVerification.objects.filter(mobile=clean_mobile).order_by('-created_at').first()
        if last_otp:
            elapsed = (timezone.now() - last_otp.last_resend_at).total_seconds()
            if elapsed < 60:
                time_left = int(60 - elapsed)
                return Response({
                    'success': False,
                    'message': f'Please wait {time_left} seconds before requesting a new OTP.',
                    'cooldown_seconds': time_left
                }, status=status.HTTP_429_TOO_MANY_REQUESTS)

        # Generate new OTP
        otp_code = str(secrets.randbelow(900000) + 100000)
        new_session_token = secrets.token_hex(32)
        otp_hash = make_password(otp_code)

        # Dispatch Real SMS
        sms_sent, sms_msg = SMSService.send_otp_sms(clean_mobile, otp_code)
        if not sms_sent:
            return Response({
                'success': False,
                'message': sms_msg or 'Failed to send SMS OTP. Please try again.'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Invalidate old and create new
        OTPVerification.objects.filter(mobile=clean_mobile).delete()
        OTPVerification.objects.create(
            session_token=new_session_token,
            mobile=clean_mobile,
            otp_code=otp_hash,
            purpose='login',
            role='customer',
            expires_at=timezone.now() + timedelta(minutes=5)
        )

        return Response({
            'success': True,
            'message': 'A new OTP has been sent to your mobile number via SMS.',
            'session_token': new_session_token,
            'expires_in': 300
        }, status=status.HTTP_200_OK)


# =====================================================================
# Admin Direct Authentication View (Separate from Customer OTP)
# =====================================================================

class AdminLoginView(views.APIView):
    """
    Dedicated Administrator Login Endpoint.
    Authenticates store administrator using admin credentials (email or mobile + password)
    and verifies active admin role/permissions on the backend.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email_or_mobile = request.data.get('email', '') or request.data.get('username', '') or request.data.get('mobile', '')
        password = request.data.get('password', '')

        if not email_or_mobile or not password:
            return Response({
                'detail': 'Admin username/email and password are required.'
            }, status=status.HTTP_400_BAD_REQUEST)

        ident = str(email_or_mobile).strip().lower()
        clean_mob = clean_indian_mobile(ident)

        # Find admin user by email or mobile
        user = None
        if clean_mob:
            user = CustomUser.objects.filter(mobile=clean_mob).first()
        if not user:
            user = CustomUser.objects.filter(email__iexact=ident).first()

        if not user or not user.check_password(password):
            return Response({
                'detail': 'Invalid administrator credentials.'
            }, status=status.HTTP_401_UNAUTHORIZED)

        if not (user.role == 'admin' or user.is_staff or user.is_superuser):
            return Response({
                'detail': 'Access Denied: You do not possess administrator privileges.'
            }, status=status.HTTP_403_FORBIDDEN)

        refresh = RefreshToken.for_user(user)
        user_data = UserProfileSerializer(user).data

        return Response({
            'message': f'Welcome to Upendra General Stores Admin Suite, {user.full_name}!',
            'tokens': {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            },
            'user': user_data
        }, status=status.HTTP_200_OK)


# =====================================================================
# Customer Profile View
# =====================================================================

class UserProfileView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        return self._update_profile(request)

    def patch(self, request):
        return self._update_profile(request)

    def delete(self, request):
        """Removes the profile image for the authenticated user"""
        user = request.user
        if user.profile_image:
            user.profile_image.delete(save=False)
            user.profile_image = None
            user.save(update_fields=['profile_image'])
        serializer = UserProfileSerializer(user)
        return Response(serializer.data)

    def _update_profile(self, request):
        user = request.user
        # Handle explicit removal of profile image
        remove_image = request.data.get('remove_profile_image')
        if remove_image in [True, 'true', '1', 1] or ('profile_image' in request.data and not request.data.get('profile_image')):
            if user.profile_image:
                user.profile_image.delete(save=False)
                user.profile_image = None
                user.save(update_fields=['profile_image'])

        serializer = UserProfileSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# =====================================================================
# Store Catalog & Product CRUD ViewSets
# =====================================================================

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminUserOrReadOnly]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    lookup_field = 'id'

    def get_queryset(self):
        qs = Category.objects.all()
        if not check_is_admin(self.request.user):
            qs = qs.filter(is_active=True)
        return qs


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAdminUserOrReadOnly]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    lookup_field = 'id'

    def get_queryset(self):
        qs = Product.objects.select_related('category').all()
        
        # Filtering for customers vs admin
        is_admin = check_is_admin(self.request.user)
        if not is_admin:
            qs = qs.filter(is_available=True)

        # Category filter (by id or slug)
        category = self.request.query_params.get('category')
        if category:
            if category.isdigit():
                qs = qs.filter(category_id=int(category))
            else:
                qs = qs.filter(category__slug=category)

        # Search filter
        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(
                Q(name__icontains=search) |
                Q(hindi_name__icontains=search) |
                Q(description__icontains=search) |
                Q(category__name__icontains=search)
            )

        # Featured filter
        featured = self.request.query_params.get('featured')
        if featured == 'true':
            qs = qs.filter(is_featured=True)

        # Price range filter
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        if min_price:
            qs = qs.filter(price__gte=min_price)
        if max_price:
            qs = qs.filter(price__lte=max_price)

        # Sorting
        ordering = self.request.query_params.get('ordering', '-is_featured')
        if ordering in ['price', '-price', 'name', '-name', 'created_at', '-created_at', '-is_featured']:
            qs = qs.order_by(ordering)

        return qs


# =====================================================================
# Shopping Cart Views
# =====================================================================

class CartView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        serializer = CartSerializer(cart)
        return Response(serializer.data)


class CartItemAddView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        product_id = request.data.get('product_id')
        quantity = Decimal(str(request.data.get('quantity', 1)))
        unit = request.data.get('unit', 'kg')

        if not product_id:
            return Response({'error': 'product_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            product = Product.objects.get(id=product_id, is_available=True)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found or unavailable'}, status=status.HTTP_404_NOT_FOUND)

        cart, _ = Cart.objects.get_or_create(user=request.user)

        # Calculate unit_price based on unit
        if unit == 'g':
            if product.unit == 'kg':
                unit_price = (Decimal(str(product.price)) * quantity / Decimal('1000')).quantize(Decimal('0.01'))
            else:
                unit_price = (Decimal(str(product.price)) * quantity).quantize(Decimal('0.01'))
        else:
            unit_price = (Decimal(str(product.price)) * quantity).quantize(Decimal('0.01'))

        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            unit=unit,
            defaults={
                'quantity': quantity,
                'unit_price': unit_price,
                'subtotal': unit_price,
            }
        )

        if not created:
            cart_item.quantity += quantity
            cart_item.save()

        serializer = CartSerializer(cart)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CartItemUpdateView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, item_id):
        quantity = Decimal(str(request.data.get('quantity', 1)))
        try:
            cart_item = CartItem.objects.get(id=item_id, cart__user=request.user)
        except CartItem.DoesNotExist:
            return Response({'error': 'Cart item not found'}, status=status.HTTP_404_NOT_FOUND)

        if quantity <= 0:
            cart_item.delete()
        else:
            cart_item.quantity = quantity
            cart_item.save()

        cart = Cart.objects.get(user=request.user)
        serializer = CartSerializer(cart)
        return Response(serializer.data)

    def delete(self, request, item_id):
        try:
            cart_item = CartItem.objects.get(id=item_id, cart__user=request.user)
            cart_item.delete()
        except CartItem.DoesNotExist:
            return Response({'error': 'Cart item not found'}, status=status.HTTP_404_NOT_FOUND)

        cart = Cart.objects.get(user=request.user)
        serializer = CartSerializer(cart)
        return Response(serializer.data)


class CartClearView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        cart.items.all().delete()
        serializer = CartSerializer(cart)
        return Response(serializer.data)


# =====================================================================
# Order Processing Views
# =====================================================================

class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'order_id'

    def get_queryset(self):
        user = self.request.user
        if check_is_admin(user):
            qs = Order.objects.prefetch_related('items').all()
            status_filter = self.request.query_params.get('status')
            if status_filter:
                qs = qs.filter(status=status_filter)
            return qs
        return Order.objects.filter(user=user).prefetch_related('items')

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        items_data = data.pop('items', [])

        if not items_data:
            return Response({'error': 'Order must contain at least one item.'}, status=status.HTTP_400_BAD_REQUEST)

        # Calculate subtotal & delivery charges
        store_settings, _ = StoreSetting.objects.get_or_create(id=1)
        subtotal = Decimal('0.00')

        for item in items_data:
            item_subtotal = Decimal(str(item.get('subtotal', 0)))
            subtotal += item_subtotal

        delivery_charge = Decimal('0.00')
        if data.get('payment_method') != 'store_pickup':
            if subtotal < store_settings.free_delivery_above:
                delivery_charge = store_settings.delivery_charge

        total_amount = subtotal + delivery_charge

        user_obj = request.user if request.user.is_authenticated else None

        order = Order.objects.create(
            user=user_obj,
            customer_name=data.get('customer_name', request.user.full_name if user_obj else 'Customer'),
            customer_email=data.get('customer_email', request.user.email or '' if user_obj else ''),
            customer_phone=data.get('customer_phone', request.user.mobile if user_obj else ''),
            delivery_address=data.get('delivery_address', ''),
            village_area=data.get('village_area', ''),
            city=data.get('city', 'Benipatti'),
            state=data.get('state', 'Bihar'),
            pincode=data.get('pincode', '847213'),
            latitude=data.get('latitude'),
            longitude=data.get('longitude'),
            subtotal=subtotal,
            delivery_charge=delivery_charge,
            total_amount=total_amount,
            payment_method=data.get('payment_method', 'cod'),
            payment_status='pending',
            notes=data.get('notes', ''),
        )

        for item_data in items_data:
            product = None
            if item_data.get('product_id'):
                try:
                    product = Product.objects.get(id=item_data['product_id'])
                except Product.DoesNotExist:
                    pass

            OrderItem.objects.create(
                order=order,
                product=product,
                product_name=item_data.get('product_name', product.name if product else 'Item'),
                category_name=item_data.get('category_name', ''),
                quantity=Decimal(str(item_data.get('quantity', 1))),
                unit=item_data.get('unit', 'kg'),
                unit_price=Decimal(str(item_data.get('unit_price', 0))),
                subtotal=Decimal(str(item_data.get('subtotal', 0))),
                product_image=item_data.get('product_image', ''),
            )

        serializer = OrderSerializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class OrderStatusUpdateView(views.APIView):
    permission_classes = [IsAdminRole]

    def put(self, request, order_id):
        try:
            order = Order.objects.get(order_id=order_id)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get('status')
        new_payment_status = request.data.get('payment_status')

        if new_status:
            order.status = new_status
        if new_payment_status:
            order.payment_status = new_payment_status
            if new_payment_status == 'paid' and not order.paid_at:
                order.paid_at = timezone.now()

        order.save()
        serializer = OrderSerializer(order)
        return Response(serializer.data)


# =====================================================================
# Admin Dashboard & Management Views
# =====================================================================

class AdminDashboardView(views.APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        today = timezone.now().date()
        today_orders = Order.objects.filter(created_at__date=today)
        all_orders = Order.objects.all()

        total_sales = all_orders.filter(payment_status='paid').aggregate(total=Sum('total_amount'))['total'] or Decimal('0.00')
        today_sales = today_orders.filter(payment_status='paid').aggregate(total=Sum('total_amount'))['total'] or Decimal('0.00')

        total_orders_count = all_orders.count()
        today_orders_count = today_orders.count()
        pending_orders_count = all_orders.filter(status='pending').count()
        total_products = Product.objects.count()
        low_stock_products = Product.objects.filter(stock_quantity__lte=5, is_available=True).count()
        total_customers = CustomUser.objects.filter(role='customer').count()

        recent_orders = Order.objects.prefetch_related('items').order_by('-created_at')[:8]
        recent_orders_data = OrderSerializer(recent_orders, many=True).data

        return Response({
            'total_sales': total_sales,
            'today_sales': today_sales,
            'total_orders': total_orders_count,
            'today_orders': today_orders_count,
            'pending_orders': pending_orders_count,
            'total_products': total_products,
            'low_stock_products': low_stock_products,
            'total_customers': total_customers,
            'recent_orders': recent_orders_data,
        })


class AdminCustomerListView(views.APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        customers = CustomUser.objects.filter(role='customer').annotate(
            order_count=Count('orders'),
            total_spent=Sum('orders__total_amount')
        ).order_by('-created_at')

        data = [
            {
                'id': c.id,
                'full_name': c.full_name,
                'mobile': c.mobile,
                'email': c.email or '',
                'address': c.address,
                'village_area': c.village_area,
                'city': c.city,
                'pincode': c.pincode,
                'order_count': c.order_count,
                'total_spent': c.total_spent or Decimal('0.00'),
                'created_at': c.created_at,
            }
            for c in customers
        ]
        return Response(data)


class AdminQuickPriceStockUpdateView(views.APIView):
    permission_classes = [IsAdminRole]

    def put(self, request, product_id):
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

        price = request.data.get('price')
        stock = request.data.get('stock_quantity')
        is_available = request.data.get('is_available')

        if price is not None:
            product.price = Decimal(str(price))
        if stock is not None:
            product.stock_quantity = Decimal(str(stock))
            if product.stock_quantity <= 0:
                product.is_available = False
        if is_available is not None:
            product.is_available = bool(is_available)

        product.save()
        serializer = ProductSerializer(product, context={'request': request})
        return Response(serializer.data)


class StoreSettingView(views.APIView):
    permission_classes = [IsAdminUserOrReadOnly]

    def get(self, request):
        settings_obj, _ = StoreSetting.objects.get_or_create(id=1)
        serializer = StoreSettingSerializer(settings_obj)
        return Response(serializer.data)

    def put(self, request):
        settings_obj, _ = StoreSetting.objects.get_or_create(id=1)
        serializer = StoreSettingSerializer(settings_obj, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ImageUploadView(views.APIView):
    permission_classes = [IsAdminRole]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        file_obj = request.FILES.get('image')
        if not file_obj:
            return Response({'error': 'No image file provided'}, status=status.HTTP_400_BAD_REQUEST)

        media_dir = os.path.join(settings.MEDIA_ROOT, 'products')
        os.makedirs(media_dir, exist_ok=True)
        
        file_path = os.path.join(media_dir, file_obj.name)
        with open(file_path, 'wb+') as destination:
            for chunk in file_obj.chunks():
                destination.write(chunk)

        image_url = f"/media/products/{file_obj.name}"
        return Response({'url': image_url, 'filename': file_obj.name}, status=status.HTTP_201_CREATED)


# =====================================================================
# Payment Gateway Views (Razorpay / UPI)
# =====================================================================

class CreatePaymentOrderView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        order_id = request.data.get('order_id')
        payment_method = request.data.get('payment_method', 'upi')

        if not order_id:
            return Response({'error': 'order_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            if str(order_id).isdigit():
                order = Order.objects.get(id=order_id)
            else:
                order = Order.objects.get(order_id=order_id)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

        if request.user.is_authenticated and order.user and order.user != request.user and not check_is_admin(request.user):
            return Response({'error': 'Unauthorized to initialize payment for this order'}, status=status.HTTP_403_FORBIDDEN)

        if order.payment_status == 'paid':
            return Response({
                'error': 'This order has already been paid for.',
                'order': OrderSerializer(order).data
            }, status=status.HTTP_400_BAD_REQUEST)

        order.payment_method = payment_method
        order.payment_status = 'processing'
        order.save(update_fields=['payment_method', 'payment_status', 'updated_at'])

        gateway_data = create_gateway_order(order, method_hint=payment_method)
        return Response(gateway_data, status=status.HTTP_200_OK)


class VerifyPaymentView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        order_id = request.data.get('order_id')
        razorpay_order_id = request.data.get('razorpay_order_id')
        razorpay_payment_id = request.data.get('razorpay_payment_id')
        razorpay_signature = request.data.get('razorpay_signature')

        if not order_id:
            return Response({'error': 'order_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            if str(order_id).isdigit():
                order = Order.objects.get(id=order_id)
            else:
                order = Order.objects.get(order_id=order_id)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

        if order.payment_status == 'paid' and order.transaction_id == razorpay_payment_id:
            return Response({
                'success': True,
                'message': 'Payment already verified.',
                'order': OrderSerializer(order).data
            }, status=status.HTTP_200_OK)

        is_valid_sig, sig_msg = verify_payment_signature(
            razorpay_order_id=razorpay_order_id or order.gateway_order_id,
            razorpay_payment_id=razorpay_payment_id,
            razorpay_signature=razorpay_signature
        )

        if not is_valid_sig:
            order.payment_status = 'failed'
            order.save(update_fields=['payment_status', 'updated_at'])
            return Response({
                'success': False,
                'error': f'Payment signature verification failed: {sig_msg}'
            }, status=status.HTTP_400_BAD_REQUEST)

        is_verified_gw, gw_msg = verify_payment_with_gateway(
            payment_id=razorpay_payment_id,
            expected_amount=order.total_amount,
            expected_order_id=order.gateway_order_id
        )

        if not is_verified_gw:
            order.payment_status = 'failed'
            order.save(update_fields=['payment_status', 'updated_at'])
            return Response({
                'success': False,
                'error': f'Payment gateway verification failed: {gw_msg}'
            }, status=status.HTTP_400_BAD_REQUEST)

        order.payment_status = 'paid'
        order.transaction_id = razorpay_payment_id
        order.payment_signature = razorpay_signature or ''
        order.paid_at = timezone.now()
        order.status = 'confirmed'
        order.save(update_fields=['payment_status', 'transaction_id', 'payment_signature', 'paid_at', 'status', 'updated_at'])

        return Response({
            'success': True,
            'message': 'Payment successfully verified!',
            'order': OrderSerializer(order).data
        }, status=status.HTTP_200_OK)


class PaymentFailureView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        order_id = request.data.get('order_id')
        reason = request.data.get('reason', 'Payment cancelled or failed.')

        if not order_id:
            return Response({'error': 'order_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            if str(order_id).isdigit():
                order = Order.objects.get(id=order_id)
            else:
                order = Order.objects.get(order_id=order_id)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

        if order.payment_status != 'paid':
            order.payment_status = 'failed'
            order.notes = f"{order.notes or ''}\n[Payment Failure: {reason}]".strip()
            order.save(update_fields=['payment_status', 'notes', 'updated_at'])

        return Response({
            'success': True,
            'message': 'Failure logged',
            'order': OrderSerializer(order).data
        }, status=status.HTTP_200_OK)


class PaymentWebhookView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        raw_body = request.body.decode('utf-8')
        received_signature = request.headers.get('X-Razorpay-Signature', '')

        is_valid = verify_webhook_signature(raw_body, received_signature)
        if not is_valid:
            return Response({'error': 'Invalid webhook signature'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            event_data = json.loads(raw_body)
            event_type = event_data.get('event')
            payload = event_data.get('payload', {}).get('payment', {}).get('entity', {})
            razorpay_order_id = payload.get('order_id')
            razorpay_payment_id = payload.get('id')
            payment_status = payload.get('status')

            if razorpay_order_id:
                order = Order.objects.filter(gateway_order_id=razorpay_order_id).first()
                if order:
                    if event_type == 'payment.captured' or payment_status == 'captured':
                        order.payment_status = 'paid'
                        order.transaction_id = razorpay_payment_id
                        order.paid_at = timezone.now()
                        order.status = 'confirmed'
                        order.save()
                    elif event_type == 'payment.failed':
                        order.payment_status = 'failed'
                        order.save()
        except Exception as e:
            logger.error(f"Error handling payment webhook: {str(e)}")

        return Response({'status': 'ok'}, status=status.HTTP_200_OK)
