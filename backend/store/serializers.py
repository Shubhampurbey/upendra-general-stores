from decimal import Decimal
from rest_framework import serializers, exceptions
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import CustomUser, Category, Product, Cart, CartItem, Order, OrderItem, StoreSetting


class UserProfileSerializer(serializers.ModelSerializer):
    is_admin = serializers.BooleanField(source='is_admin_user', read_only=True)
    profile_image = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = CustomUser
        fields = (
            'id', 'mobile', 'email', 'full_name', 'role', 'is_admin',
            'address', 'village_area', 'city', 'state', 'pincode',
            'profile_image', 'created_at'
        )
        read_only_fields = ('id', 'role', 'is_admin', 'created_at')


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
        # Create a mutable copy if QueryDict or dict
        mutable_data = data.copy() if hasattr(data, 'copy') else dict(data)
        
        # Handle image field in multipart / json payloads
        if 'image' in mutable_data:
            image_val = mutable_data.get('image')
            # If image_val is string (existing path/URL, empty string), pop it so the existing image file is preserved
            if isinstance(image_val, str) or image_val is None or image_val == '':
                mutable_data.pop('image', None)

        # Handle boolean strings from FormData
        for bool_field in ('is_available', 'is_featured'):
            if bool_field in mutable_data:
                val = mutable_data.get(bool_field)
                if isinstance(val, str):
                    mutable_data[bool_field] = val.lower() in ('true', '1', 'yes', 'on')

        return super().to_internal_value(mutable_data)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.image and instance.image.name:
            image_str = str(instance.image)
            if image_str.startswith(('http://', 'https://', '/assets/')):
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
