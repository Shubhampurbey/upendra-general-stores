from decimal import Decimal
from rest_framework import serializers, exceptions
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import CustomUser, Category, Product, Cart, CartItem, Order, OrderItem, StoreSetting


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'email'

    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = {
            'id': self.user.id,
            'email': self.user.email,
            'full_name': self.user.full_name,
            'mobile': self.user.mobile,
            'role': self.user.role,
            'is_admin': self.user.is_admin_user,
            'address': self.user.address,
            'village_area': self.user.village_area,
            'city': self.user.city,
            'pincode': self.user.pincode,
            'profile_image': self.user.profile_image.url if self.user.profile_image else None,
        }
        return data


class AdminTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'email'

    def validate(self, attrs):
        data = super().validate(attrs)
        if not self.user.is_admin_user:
            raise exceptions.AuthenticationFailed('Access Denied: You do not have administrator permissions.')
        data['user'] = {
            'id': self.user.id,
            'email': self.user.email,
            'full_name': self.user.full_name,
            'mobile': self.user.mobile,
            'role': self.user.role,
            'is_admin': True,
            'address': self.user.address,
            'village_area': self.user.village_area,
            'city': self.user.city,
            'pincode': self.user.pincode,
            'profile_image': self.user.profile_image.url if self.user.profile_image else None,
        }
        return data


class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    confirm_password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = CustomUser
        fields = ('id', 'email', 'full_name', 'mobile', 'password', 'confirm_password', 'address', 'village_area', 'city', 'pincode')
        extra_kwargs = {
            'address': {'required': False, 'allow_blank': True},
            'village_area': {'required': False, 'allow_blank': True},
            'city': {'required': False, 'allow_blank': True},
            'pincode': {'required': False, 'allow_blank': True},
        }

    def validate_email(self, value):
        from .views import is_valid_email
        email_clean = value.strip().lower()
        if not is_valid_email(email_clean):
            raise serializers.ValidationError("Please enter a valid email address (e.g. name@example.com).")
        if CustomUser.objects.filter(email__iexact=email_clean).exists():
            raise serializers.ValidationError("An account with this email address already exists. Please sign in instead.")
        return email_clean

    def validate_mobile(self, value):
        from .views import clean_indian_phone
        clean_mobile = clean_indian_phone(value)
        if not clean_mobile:
            raise serializers.ValidationError("Please enter a valid 10-digit Indian mobile number.")
        if CustomUser.objects.filter(mobile=clean_mobile).exists():
            raise serializers.ValidationError("An account with this mobile number already exists.")
        return clean_mobile

    def validate(self, attrs):
        if attrs.get('password') != attrs.get('confirm_password'):
            raise serializers.ValidationError({"password": "Passwords do not match."})
        if len(attrs.get('password', '')) < 6:
            raise serializers.ValidationError({"password": "Password must be at least 6 characters long."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password', None)
        password = validated_data.pop('password')
        email = validated_data.pop('email')
        # Strictly enforce customer role and standard user privileges on public registration
        validated_data['role'] = 'customer'
        validated_data['is_staff'] = False
        validated_data['is_superuser'] = False
        user = CustomUser.objects.create_user(
            email=email,
            password=password,
            **validated_data
        )
        Cart.objects.get_or_create(user=user)
        return user



class UserProfileSerializer(serializers.ModelSerializer):
    is_admin = serializers.BooleanField(source='is_admin_user', read_only=True)
    profile_image = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = CustomUser
        fields = ('id', 'email', 'full_name', 'mobile', 'role', 'is_admin', 'address', 'village_area', 'city', 'state', 'pincode', 'profile_image', 'created_at')
        read_only_fields = ('id', 'email', 'role', 'is_admin', 'created_at')


class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.IntegerField(source='products.count', read_only=True)

    class Meta:
        model = Category
        fields = ('id', 'name', 'hindi_name', 'slug', 'description', 'image', 'icon', 'display_order', 'is_active', 'product_count')


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_hindi = serializers.CharField(source='category.hindi_name', read_only=True)
    image = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Product
        fields = (
            'id', 'name', 'hindi_name', 'slug', 'category', 'category_name', 'category_hindi',
            'description', 'price', 'unit', 'min_weight_grams', 'stock_quantity',
            'is_available', 'is_featured', 'image', 'badge', 'created_at', 'updated_at'
        )

    def to_internal_value(self, data):
        mutable_data = data.copy() if hasattr(data, 'copy') else dict(data)
        if 'image' in mutable_data:
            image_val = mutable_data.get('image')
            # If image_val is string (existing path/URL or empty), pop it so existing file is kept on update
            if isinstance(image_val, str) or image_val is None or image_val == '':
                mutable_data.pop('image', None)
        return super().to_internal_value(mutable_data)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.image:
            image_str = str(instance.image)
            if image_str.startswith('http://') or image_str.startswith('https://'):
                data['image'] = image_str
            elif image_str.startswith('/assets/'):
                data['image'] = image_str
            elif hasattr(instance.image, 'url'):
                request = self.context.get('request')
                if request:
                    data['image'] = request.build_absolute_uri(instance.image.url)
                else:
                    data['image'] = instance.image.url
            elif image_str.startswith('/media/'):
                data['image'] = image_str
            elif image_str.startswith('products/'):
                data['image'] = f"/media/{image_str}"
            else:
                data['image'] = f"/media/products/{image_str}"
        else:
            data['image'] = '/assets/images/spices.jpg'
        return data


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), source='product', write_only=True
    )

    class Meta:
        model = CartItem
        fields = ('id', 'product', 'product_id', 'quantity', 'unit', 'unit_price', 'subtotal', 'created_at')


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_amount = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    item_count = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ('id', 'items', 'total_amount', 'item_count', 'updated_at')

    def get_item_count(self, obj):
        return obj.items.count()


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ('id', 'product', 'product_name', 'category_name', 'quantity', 'unit', 'unit_price', 'subtotal', 'product_image')


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = (
            'id', 'order_id', 'user', 'customer_name', 'customer_email', 'customer_phone',
            'delivery_address', 'village_area', 'city', 'state', 'pincode',
            'latitude', 'longitude', 'subtotal', 'delivery_charge', 'total_amount',
            'payment_method', 'payment_status', 'payment_gateway', 'gateway_order_id',
            'transaction_id', 'paid_at', 'status', 'notes', 'items', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'order_id', 'created_at', 'updated_at', 'paid_at', 'gateway_order_id')



class StoreSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = StoreSetting
        fields = '__all__'
