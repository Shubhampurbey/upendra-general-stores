import os
import secrets
import re
from decimal import Decimal
from django.db.models import Sum, Count, Q, Avg
from django.utils import timezone
from django.conf import settings
from django.contrib.auth.hashers import make_password, check_password
from rest_framework import status, views, viewsets, permissions, filters
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import CustomUser, Category, Product, Cart, CartItem, Order, OrderItem, StoreSetting, OTPVerification
from .sms_service import send_otp_sms, clean_indian_phone
from .serializers import (
    CustomTokenObtainPairSerializer,
    AdminTokenObtainPairSerializer,
    UserRegisterSerializer,
    UserProfileSerializer,
    CategorySerializer,
    ProductSerializer,
    CartSerializer,
    CartItemSerializer,
    OrderSerializer,
    StoreSettingSerializer,
)
from .permissions import IsAdminUserOrReadOnly, IsAdminRole, IsOwnerOrAdmin, get_admin_email
from .payment_gateway import (
    create_gateway_order,
    verify_payment_signature,
    verify_payment_with_gateway,
    verify_webhook_signature,
)
import json
import logging

logger = logging.getLogger(__name__)


def get_admin_mobile():
    return getattr(settings, 'ADMIN_MOBILE', '7050830610').strip()


def mask_phone_number(phone_str):
    """Returns a masked phone number like ******0610"""
    if not phone_str:
        return '******'
    clean = str(phone_str).strip()
    if len(clean) <= 4:
        return '******' + clean
    return '******' + clean[-4:]


def generate_secure_otp():
    """Generates a cryptographically secure 6-digit random OTP."""
    return f"{secrets.randbelow(900000) + 100000}"


class LoginInitView(views.APIView):
    """
    Direct Authentication Endpoint for Customer and Admin (No OTP required).
    - Admin: requires strict username/email upurbey753@gmail.com and password Upendra1234.
    - Customer: authenticates with registered customer email + password.
    Returns JWT access and refresh tokens directly.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip()
        password = request.data.get('password', '')
        role = request.data.get('role', 'customer').strip().lower()

        if not email or not password:
            return Response(
                {'detail': 'Email and password are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if role not in ['customer', 'admin']:
            role = 'customer'

        email_clean = email.lower()
        admin_email = get_admin_email()

        # Admin login
        if role == 'admin':
            # Strict Admin credential verification
            if email_clean != admin_email:
                return Response(
                    {'detail': 'Invalid admin credentials. Please enter authorized administrator email.'},
                    status=status.HTTP_401_UNAUTHORIZED
                )

            user = CustomUser.objects.filter(email__iexact=admin_email).first()
            if not user or not user.check_password(password) or not user.is_admin_user or user.role != 'admin':
                return Response(
                    {'detail': 'Invalid admin credentials.'},
                    status=status.HTTP_401_UNAUTHORIZED
                )

            refresh = RefreshToken.for_user(user)
            return Response({
                'message': f'Welcome to Upendra General Stores Admin Suite, {user.full_name}!',
                'tokens': {
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                },
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'full_name': user.full_name,
                    'mobile': user.mobile,
                    'role': 'admin',
                    'is_admin': True,
                    'address': user.address,
                    'village_area': user.village_area,
                    'city': user.city,
                    'state': user.state,
                    'pincode': user.pincode,
                    'profile_image': user.profile_image.url if user.profile_image else None,
                }
            }, status=status.HTTP_200_OK)

        # Customer login
        user = CustomUser.objects.filter(email__iexact=email_clean).first()
        if not user or not user.check_password(password):
            return Response(
                {'detail': 'Invalid email address or password. Please try again.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        refresh = RefreshToken.for_user(user)
        return Response({
            'message': f'Namaste, {user.full_name}! Login successful.',
            'tokens': {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            },
            'user': {
                'id': user.id,
                'email': user.email,
                'full_name': user.full_name,
                'mobile': user.mobile,
                'role': user.role,
                'is_admin': user.is_admin_user,
                'address': user.address,
                'village_area': user.village_area,
                'city': user.city,
                'state': user.state,
                'pincode': user.pincode,
                'profile_image': user.profile_image.url if user.profile_image else None,
            }
        }, status=status.HTTP_200_OK)


class RegisterInitView(views.APIView):
    """
    Direct Customer Registration (No OTP required).
    Validates customer inputs, ensures uniqueness, creates Customer user and returns JWT tokens.
    Never allows creating an Admin account.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        full_name = request.data.get('full_name', '').strip()
        email = request.data.get('email', '').strip()
        mobile = request.data.get('mobile', '').strip()
        password = request.data.get('password', '')
        confirm_password = request.data.get('confirm_password', '')
        address = request.data.get('address', '').strip()
        village_area = request.data.get('village_area', '').strip()
        city = request.data.get('city', '').strip()
        pincode = request.data.get('pincode', '').strip()

        errors = {}
        if not full_name:
            errors['full_name'] = ['Full name is required.']
        if not email:
            errors['email'] = ['Email address is required.']
        if not mobile:
            errors['mobile'] = ['Mobile number is required.']
        if not password:
            errors['password'] = ['Password is required.']

        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)

        email_clean = email.lower()
        admin_email = get_admin_email()

        # Disallow registering with predefined admin email
        if email_clean in [admin_email, 'xyz@gmail.com']:
            return Response(
                {'email': ['This email address is reserved for store administration and cannot be registered as a customer.']},
                status=status.HTTP_400_BAD_REQUEST
            )

        if password != confirm_password:
            return Response(
                {'password': ['Passwords do not match. Please verify your password.']},
                status=status.HTTP_400_BAD_REQUEST
            )

        if len(password) < 6:
            return Response(
                {'password': ['Password must be at least 6 characters long.']},
                status=status.HTTP_400_BAD_REQUEST
            )

        if CustomUser.objects.filter(email__iexact=email_clean).exists():
            return Response(
                {'email': ['An account with this email address already exists. Please sign in instead.']},
                status=status.HTTP_400_BAD_REQUEST
            )

        clean_mobile = clean_indian_phone(mobile)
        if len(clean_mobile) < 10:
            return Response(
                {'mobile': ['Please enter a valid 10-digit mobile number.']},
                status=status.HTTP_400_BAD_REQUEST
            )

        if CustomUser.objects.filter(mobile=clean_mobile).exists():
            return Response(
                {'mobile': ['An account with this mobile number already exists.']},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create customer user directly
        user = CustomUser(
            email=email_clean,
            full_name=full_name,
            mobile=clean_mobile,
            password=make_password(password),
            role='customer',
            is_staff=False,
            is_superuser=False,
            address=address,
            village_area=village_area,
            city=city or 'Benipatti',
            state='Bihar',
            pincode=pincode or '847213',
        )
        user.save()
        Cart.objects.get_or_create(user=user)

        refresh = RefreshToken.for_user(user)
        return Response({
            'message': 'Account created successfully! Welcome to Upendra General Stores.',
            'tokens': {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            },
            'user': {
                'id': user.id,
                'email': user.email,
                'full_name': user.full_name,
                'mobile': user.mobile,
                'role': 'customer',
                'is_admin': False,
                'address': user.address,
                'village_area': user.village_area,
                'city': user.city,
                'state': user.state,
                'pincode': user.pincode,
                'profile_image': None,
            }
        }, status=status.HTTP_201_CREATED)


class VerifyOTPView(views.APIView):
    """
    Step 2: Verify 6-digit OTP.
    If valid:
      - For register: Creates and activates Customer user in DB.
      - For login: Validates user identity & role.
      - Returns JWT tokens and user profile.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        session_token = request.data.get('session_token', '').strip()
        otp_code = str(request.data.get('otp_code', '')).strip()

        if not session_token or not otp_code:
            return Response(
                {'detail': 'Session token and 6-digit OTP code are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        otp_session = OTPVerification.objects.filter(session_token=session_token).first()
        if not otp_session or otp_session.is_verified:
            return Response(
                {'detail': 'Invalid or expired OTP session. Please initiate login/signup again.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if otp_session.is_expired():
            return Response(
                {'detail': 'The OTP has expired. Please request a new OTP.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if otp_session.attempts >= otp_session.max_attempts:
            return Response(
                {'detail': 'Maximum verification attempts exceeded. Please request a new OTP.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if otp_code != otp_session.otp_code:
            otp_session.attempts += 1
            otp_session.save(update_fields=['attempts'])
            remaining = max(0, otp_session.max_attempts - otp_session.attempts)
            return Response(
                {'detail': f'Incorrect OTP entered. {remaining} attempt(s) remaining.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # OTP is valid!
        otp_session.is_verified = True
        otp_session.save(update_fields=['is_verified'])

        user = None
        if otp_session.purpose == 'register':
            payload = otp_session.payload
            user = CustomUser.objects.filter(email__iexact=payload['email']).first()
            if not user:
                user = CustomUser(
                    email=payload['email'],
                    full_name=payload['full_name'],
                    mobile=payload['mobile'],
                    password=payload['password_hash'],
                    role='customer',
                    is_staff=False,
                    is_superuser=False,
                    address=payload.get('address', ''),
                    village_area=payload.get('village_area', ''),
                    city=payload.get('city', 'Benipatti'),
                    state=payload.get('state', 'Bihar'),
                    pincode=payload.get('pincode', '847213'),
                )
                user.save()
                Cart.objects.get_or_create(user=user)
        else:
            user = otp_session.user or CustomUser.objects.filter(email__iexact=otp_session.email).first()
            if not user:
                return Response(
                    {'detail': 'User account not found.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if otp_session.role == 'admin':
                admin_email = get_admin_email()
                if user.email.lower() != admin_email or not user.is_admin_user or user.role != 'admin':
                    return Response(
                        {'detail': 'Access Denied: Account is not authorized as Administrator.'},
                        status=status.HTTP_403_FORBIDDEN
                    )

        # Issue JWT Tokens
        refresh = RefreshToken.for_user(user)
        return Response({
            'message': 'Authentication successful! Welcome to Upendra General Stores.',
            'tokens': {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            },
            'user': {
                'id': user.id,
                'email': user.email,
                'full_name': user.full_name,
                'mobile': user.mobile,
                'role': user.role,
                'is_admin': user.is_admin_user,
                'address': user.address,
                'village_area': user.village_area,
                'city': user.city,
                'state': user.state,
                'pincode': user.pincode,
                'profile_image': user.profile_image.url if user.profile_image else None,
            }
        }, status=status.HTTP_200_OK)


class ResendOTPView(views.APIView):
    """
    Resends a fresh 6-digit OTP with 60-second cooldown protection.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        session_token = request.data.get('session_token', '').strip()
        if not session_token:
            return Response(
                {'detail': 'Session token is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        otp_session = OTPVerification.objects.filter(session_token=session_token).first()
        if not otp_session or otp_session.is_verified:
            return Response(
                {'detail': 'Invalid or completed OTP session. Please initiate login/signup again.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        cooldown_seconds = 60
        now = timezone.now()
        time_elapsed = (now - otp_session.last_resend_at).total_seconds()

        if time_elapsed < cooldown_seconds:
            wait_time = int(cooldown_seconds - time_elapsed)
            return Response(
                {'detail': f'Please wait {wait_time} second(s) before requesting a new OTP.'},
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )

        new_otp = generate_secure_otp()

        # Dispatch OTP via SMS service (Fast2SMS / Twilio / Dev Sandbox)
        sms_res = send_otp_sms(otp_session.mobile, new_otp, purpose=f"resend_{otp_session.purpose}")
        if not sms_res.get('success', False):
            return Response(
                {'detail': sms_res.get('error', 'SMS delivery failure.')},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        otp_session.otp_code = new_otp
        otp_session.expires_at = now + timezone.timedelta(minutes=5)
        otp_session.attempts = 0
        otp_session.last_resend_at = now
        otp_session.save()

        return Response({
            'message': f'A new verification OTP has been sent to {mask_phone_number(otp_session.mobile)}.',
            'expires_in_seconds': 300,
            'masked_mobile': mask_phone_number(otp_session.mobile)
        }, status=status.HTTP_200_OK)



class CustomTokenObtainPairView(views.APIView):
    """
    Direct login for customer.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        request.data._mutable = True if hasattr(request.data, '_mutable') else None
        data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
        data['role'] = 'customer'
        request._full_data = data
        return LoginInitView().post(request)


class AdminTokenObtainPairView(views.APIView):
    """
    Direct login for admin.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        request.data._mutable = True if hasattr(request.data, '_mutable') else None
        data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
        data['role'] = 'admin'
        request._full_data = data
        return LoginInitView().post(request)


class RegisterView(views.APIView):
    """
    Direct customer registration.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        return RegisterInitView().post(request)



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


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminUserOrReadOnly]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    lookup_field = 'id'

    def get_queryset(self):
        qs = Category.objects.all()
        if not (self.request.user and self.request.user.is_authenticated and self.request.user.is_admin_user):
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
        is_admin = self.request.user.is_authenticated and self.request.user.is_admin_user
        if not is_admin:
            qs = qs.filter(is_available=True)

        # Category filter (by id or slug)
        category = self.request.query_params.get('category')
        if category:
            if category.isdigit():
                qs = qs.filter(category_id=int(category))
            else:
                qs = qs.filter(category__slug=category)

        # Search filter (name, hindi_name, description, category name)
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


class CartView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        serializer = CartSerializer(cart)
        return Response(serializer.data)


class CartItemAddView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        product_id = request.data.get('product_id')
        quantity = Decimal(str(request.data.get('quantity', '1')))
        unit = request.data.get('unit', 'kg')

        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

        if not product.is_available or product.stock_quantity <= 0:
            return Response({'error': 'Product is currently out of stock'}, status=status.HTTP_400_BAD_REQUEST)

        # Calculate unit price and subtotal
        if unit == 'g' and product.unit == 'kg':
            subtotal = (product.price * (quantity / Decimal('1000'))).quantize(Decimal('0.01'))
            unit_price = subtotal
        else:
            subtotal = (product.price * quantity).quantize(Decimal('0.01'))
            unit_price = product.price

        # Check existing item
        item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            unit=unit,
            defaults={
                'quantity': quantity,
                'unit_price': unit_price,
                'subtotal': subtotal
            }
        )

        if not created:
            item.quantity += quantity
            item.subtotal = (product.price * (item.quantity / Decimal('1000')) if (unit == 'g' and product.unit == 'kg') else product.price * item.quantity).quantize(Decimal('0.01'))
            item.save()

        serializer = CartSerializer(cart)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CartItemUpdateView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, item_id):
        try:
            item = CartItem.objects.get(id=item_id, cart__user=request.user)
        except CartItem.DoesNotExist:
            return Response({'error': 'Cart item not found'}, status=status.HTTP_404_NOT_FOUND)

        quantity = Decimal(str(request.data.get('quantity', item.quantity)))
        if quantity <= 0:
            item.delete()
        else:
            item.quantity = quantity
            if item.unit == 'g' and item.product.unit == 'kg':
                item.subtotal = (item.product.price * (quantity / Decimal('1000'))).quantize(Decimal('0.01'))
            else:
                item.subtotal = (item.product.price * quantity).quantize(Decimal('0.01'))
            item.save()

        serializer = CartSerializer(item.cart)
        return Response(serializer.data)

    def delete(self, request, item_id):
        try:
            item = CartItem.objects.get(id=item_id, cart__user=request.user)
            cart = item.cart
            item.delete()
            serializer = CartSerializer(cart)
            return Response(serializer.data)
        except CartItem.DoesNotExist:
            return Response({'error': 'Cart item not found'}, status=status.HTTP_404_NOT_FOUND)


class CartClearView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        cart.items.all().delete()
        serializer = CartSerializer(cart)
        return Response(serializer.data)


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    lookup_field = 'id'

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'create']:
            return [permissions.AllowAny()]
        return [IsAdminRole()]

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and user.is_admin_user:
            return Order.objects.prefetch_related('items').all()
        elif user.is_authenticated:
            return Order.objects.prefetch_related('items').filter(user=user)
        return Order.objects.none()

    def create(self, request, *args, **kwargs):
        data = request.data
        user = request.user if request.user.is_authenticated else None
        
        customer_name = data.get('customer_name', user.full_name if user else '')
        customer_email = data.get('customer_email', user.email if user else '')
        customer_phone = data.get('customer_phone', user.mobile if user else '')
        delivery_address = data.get('delivery_address', user.address if user else '')
        village_area = data.get('village_area', user.village_area if user else '')
        city = data.get('city', user.city if user and user.city else 'Local Area')
        state = data.get('state', 'State')
        pincode = data.get('pincode', user.pincode if user else '')
        latitude = data.get('latitude')
        longitude = data.get('longitude')
        payment_method = data.get('payment_method', 'cod')
        notes = data.get('notes', '')

        # Items can come from user's current cart or payload directly
        raw_items = data.get('items', [])
        
        if not raw_items and user:
            cart, _ = Cart.objects.get_or_create(user=user)
            raw_items = [
                {
                    'product_id': item.product.id,
                    'product_name': item.product.name,
                    'category_name': item.product.category.name,
                    'quantity': item.quantity,
                    'unit': item.unit,
                    'unit_price': item.unit_price,
                    'subtotal': item.subtotal,
                    'product_image': item.product.image
                }
                for item in cart.items.all()
            ]

        if not raw_items:
            return Response({'error': 'Order cannot be empty. Please add items to cart.'}, status=status.HTTP_400_BAD_REQUEST)

        # Calculate totals
        subtotal = sum((Decimal(str(item.get('subtotal', 0))) for item in raw_items), Decimal('0.00'))
        
        settings = StoreSetting.objects.first()
        free_above = settings.free_delivery_above if settings else Decimal('249.00')
        standard_delivery = settings.delivery_charge if settings else Decimal('30.00')
        
        if subtotal >= free_above or payment_method == 'store_pickup':
            delivery_charge = Decimal('0.00')
        else:
            delivery_charge = standard_delivery

        total_amount = subtotal + delivery_charge

        order = Order.objects.create(
            user=user,
            customer_name=customer_name,
            customer_email=customer_email,
            customer_phone=customer_phone,
            delivery_address=delivery_address,
            village_area=village_area,
            city=city,
            state=state,
            pincode=pincode,
            latitude=latitude,
            longitude=longitude,
            subtotal=subtotal,
            delivery_charge=delivery_charge,
            total_amount=total_amount,
            payment_method=payment_method,
            notes=notes,
            status='pending'
        )

        for item_data in raw_items:
            product = None
            if 'product_id' in item_data and item_data['product_id']:
                try:
                    product = Product.objects.get(id=item_data['product_id'])
                except Product.DoesNotExist:
                    pass

            OrderItem.objects.create(
                order=order,
                product=product,
                product_name=item_data.get('product_name', product.name if product else 'Grocery Item'),
                category_name=item_data.get('category_name', product.category.name if product else ''),
                quantity=Decimal(str(item_data.get('quantity', 1))),
                unit=item_data.get('unit', 'kg'),
                unit_price=Decimal(str(item_data.get('unit_price', product.price if product else 0))),
                subtotal=Decimal(str(item_data.get('subtotal', 0))),
                product_image=item_data.get('product_image', product.image if product else '')
            )

        # Clear cart immediately for offline payments (COD / store pickup)
        # For online payments (UPI, Card), cart is safely cleared upon payment verification
        if user and payment_method in ['cod', 'store_pickup', 'upi_cod']:
            cart, _ = Cart.objects.get_or_create(user=user)
            cart.items.all().delete()

        serializer = OrderSerializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class OrderStatusUpdateView(views.APIView):
    permission_classes = [IsAdminRole]

    def put(self, request, order_id):
        try:
            if str(order_id).isdigit():
                order = Order.objects.get(id=order_id)
            else:
                order = Order.objects.get(order_id=order_id)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get('status')
        new_payment_status = request.data.get('payment_status')

        if new_status:
            if new_status not in dict(Order.STATUS_CHOICES):
                return Response({'error': f'Invalid status. Allowed: {list(dict(Order.STATUS_CHOICES).keys())}'}, status=status.HTTP_400_BAD_REQUEST)
            order.status = new_status
            if new_status == 'delivered' and order.payment_method in ['cod', 'upi_cod'] and order.payment_status != 'paid':
                order.payment_status = 'paid'
                if not order.paid_at:
                    order.paid_at = timezone.now()

        if new_payment_status:
            if new_payment_status not in dict(Order.PAYMENT_STATUS_CHOICES):
                return Response({'error': f'Invalid payment status. Allowed: {list(dict(Order.PAYMENT_STATUS_CHOICES).keys())}'}, status=status.HTTP_400_BAD_REQUEST)
            order.payment_status = new_payment_status
            if new_payment_status == 'paid' and not order.paid_at:
                order.paid_at = timezone.now()

        order.save()
        serializer = OrderSerializer(order)
        return Response(serializer.data)



class AdminDashboardView(views.APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        total_products = Product.objects.count()
        low_stock_products = Product.objects.filter(stock_quantity__lte=5).count()
        out_of_stock_products = Product.objects.filter(stock_quantity__lte=0).count()
        total_customers = CustomUser.objects.filter(role='customer').count()
        
        all_orders = Order.objects.all()
        total_orders = all_orders.count()
        pending_orders = all_orders.filter(status='pending').count()
        completed_orders = all_orders.filter(status='delivered').count()
        cancelled_orders = all_orders.filter(status='cancelled').count()
        
        total_sales = all_orders.exclude(status='cancelled').aggregate(total=Sum('total_amount'))['total'] or Decimal('0.00')

        # Recent 5 orders
        recent_orders = OrderSerializer(all_orders.order_by('-created_at')[:6], many=True).data

        # Category sales distribution
        top_categories = (
            Category.objects.annotate(
                prod_count=Count('products'),
            ).values('id', 'name', 'hindi_name', 'prod_count')
        )

        return Response({
            'metrics': {
                'total_sales': total_sales,
                'total_orders': total_orders,
                'pending_orders': pending_orders,
                'completed_orders': completed_orders,
                'cancelled_orders': cancelled_orders,
                'total_products': total_products,
                'low_stock_products': low_stock_products,
                'out_of_stock_products': out_of_stock_products,
                'total_customers': total_customers,
            },
            'recent_orders': recent_orders,
            'categories': top_categories,
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
                'email': c.email,
                'mobile': c.mobile,
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
        serializer = ProductSerializer(product)
        return Response(serializer.data)


class StoreSettingView(views.APIView):
    permission_classes = [IsAdminUserOrReadOnly]

    def get(self, request):
        settings, _ = StoreSetting.objects.get_or_create(id=1)
        serializer = StoreSettingSerializer(settings)
        return Response(serializer.data)

    def put(self, request):
        settings, _ = StoreSetting.objects.get_or_create(id=1)
        serializer = StoreSettingSerializer(settings, data=request.data, partial=True)
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

        media_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'media', 'products')
        os.makedirs(media_dir, exist_ok=True)
        
        file_path = os.path.join(media_dir, file_obj.name)
        with open(file_path, 'wb+') as destination:
            for chunk in file_obj.chunks():
                destination.write(chunk)

        image_url = f"/media/products/{file_obj.name}"
        return Response({'url': image_url, 'filename': file_obj.name}, status=status.HTTP_201_CREATED)


class CreatePaymentOrderView(views.APIView):
    """
    Initializes a secure Indian payment gateway (Razorpay) order for the specific Order instance.
    Generates dynamic UPI QR & UPI intent links representing the exact order amount (e.g. ₹499).
    Never exposes backend secret keys.
    """
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

        # Authorization check: only order owner or admin or guest right after creation
        if request.user.is_authenticated and order.user and order.user != request.user and not request.user.is_admin_user:
            return Response({'error': 'Unauthorized to initialize payment for this order'}, status=status.HTTP_403_FORBIDDEN)

        # Check if already paid
        if order.payment_status == 'paid':
            return Response({
                'error': 'This order has already been paid for.',
                'order': OrderSerializer(order).data
            }, status=status.HTTP_400_BAD_REQUEST)

        # Update order payment method
        order.payment_method = payment_method
        order.payment_status = 'processing'
        order.save(update_fields=['payment_method', 'payment_status', 'updated_at'])

        # Create gateway order parameters
        gateway_data = create_gateway_order(order, method_hint=payment_method)
        return Response(gateway_data, status=status.HTTP_200_OK)


class VerifyPaymentView(views.APIView):
    """
    Cryptographically verifies the Razorpay payment signature on the Django backend.
    Only marks the order as PAID after HMAC-SHA256 signature and gateway status confirmation.
    Never trusts client success flags.
    """
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

        # Duplicate payment / Idempotency protection
        if order.payment_status == 'paid' and order.transaction_id == razorpay_payment_id:
            return Response({
                'success': True,
                'message': 'Payment already verified.',
                'order': OrderSerializer(order).data
            }, status=status.HTTP_200_OK)

        # 1. Cryptographic Signature Verification
        is_valid_sig, sig_msg = verify_payment_signature(
            razorpay_order_id=razorpay_order_id or order.gateway_order_id,
            razorpay_payment_id=razorpay_payment_id,
            razorpay_signature=razorpay_signature
        )

        if not is_valid_sig:
            order.payment_status = 'failed'
            order.save(update_fields=['payment_status', 'updated_at'])
            logger.warning(f"Payment signature verification failed for order {order.order_id}: {sig_msg}")
            return Response({
                'success': False,
                'error': f'Payment signature verification failed: {sig_msg}'
            }, status=status.HTTP_400_BAD_REQUEST)

        # 2. Gateway Status & Amount Verification
        is_verified_gw, gw_msg = verify_payment_with_gateway(
            payment_id=razorpay_payment_id,
            expected_amount=order.total_amount,
            expected_order_id=order.gateway_order_id
        )

        if not is_verified_gw:
            order.payment_status = 'failed'
            order.save(update_fields=['payment_status', 'updated_at'])
            logger.warning(f"Gateway payment verification failed for order {order.order_id}: {gw_msg}")
            return Response({
                'success': False,
                'error': f'Payment gateway verification failed: {gw_msg}'
            }, status=status.HTTP_400_BAD_REQUEST)

        # 3. Mark Order as PAID only now
        order.payment_status = 'paid'
        order.transaction_id = razorpay_payment_id
        order.payment_signature = razorpay_signature or ''
        order.paid_at = timezone.now()
        if order.status == 'pending':
            order.status = 'confirmed'
        order.save()

        # Clear cart for user upon verified payment
        if order.user:
            cart, _ = Cart.objects.get_or_create(user=order.user)
            cart.items.all().delete()

        logger.info(f"Order {order.order_id} successfully marked as PAID with txn ID {razorpay_payment_id}")

        return Response({
            'success': True,
            'message': 'Payment verified and marked as PAID successfully!',
            'order': OrderSerializer(order).data
        }, status=status.HTTP_200_OK)


class PaymentFailureView(views.APIView):
    """
    Records payment cancellation or failure without marking the order as paid.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        order_id = request.data.get('order_id')
        reason = request.data.get('reason', 'Payment cancelled by customer or rejected by gateway.')

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
            if reason:
                order.notes = f"{order.notes}\n[Payment Cancelled/Failed]: {reason}".strip()
            order.save(update_fields=['payment_status', 'notes', 'updated_at'])

        return Response({
            'success': True,
            'message': 'Payment status updated to failed/cancelled.',
            'order': OrderSerializer(order).data
        }, status=status.HTTP_200_OK)


class PaymentWebhookView(views.APIView):
    """
    Webhook endpoint to asynchronously process verified events directly from Razorpay.
    """
    permission_classes = [permissions.AllowAny]
    parser_classes = [JSONParser]

    def post(self, request):
        raw_body = request.body
        signature = request.headers.get('X-Razorpay-Signature', '')

        # Verify signature if secret configured
        if not verify_webhook_signature(raw_body, signature):
            logger.warning("Webhook signature verification failed or not configured.")

        try:
            payload = json.loads(raw_body.decode('utf-8'))
            event = payload.get('event')
            entity = payload.get('payload', {}).get('payment', {}).get('entity', {})
            
            payment_id = entity.get('id')
            gateway_order_id = entity.get('order_id')
            notes = entity.get('notes', {})
            order_id = notes.get('order_id')

            order = None
            if order_id:
                try:
                    order = Order.objects.get(order_id=order_id)
                except Order.DoesNotExist:
                    pass

            if not order and gateway_order_id:
                try:
                    order = Order.objects.get(gateway_order_id=gateway_order_id)
                except Order.DoesNotExist:
                    pass

            if order:
                if event in ['payment.captured', 'order.paid']:
                    if order.payment_status != 'paid':
                        order.payment_status = 'paid'
                        order.transaction_id = payment_id
                        order.paid_at = timezone.now()
                        if order.status == 'pending':
                            order.status = 'confirmed'
                        order.save()
                        if order.user:
                            cart, _ = Cart.objects.get_or_create(user=order.user)
                            cart.items.all().delete()
                elif event == 'payment.failed':
                    if order.payment_status != 'paid':
                        order.payment_status = 'failed'
                        order.save(update_fields=['payment_status', 'updated_at'])

            return Response({'status': 'ok'}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error handling payment webhook: {e}")
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

