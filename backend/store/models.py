import uuid
from decimal import Decimal
from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.utils.text import slugify
from django.utils import timezone


class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email address is mandatory')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'admin')
        return self.create_user(email, password, **extra_fields)


class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('customer', 'Customer'),
        ('admin', 'Admin / Shopkeeper'),
    )

    username = None
    email = models.EmailField('Email Address', unique=True)
    full_name = models.CharField('Full Name', max_length=150)
    mobile = models.CharField('Mobile Number', max_length=15, unique=True, null=True, blank=True)
    role = models.CharField('Role', max_length=20, choices=ROLE_CHOICES, default='customer')
    address = models.TextField('Address Line', blank=True)
    village_area = models.CharField('Village / Area', max_length=150, blank=True)
    city = models.CharField('City / Town', max_length=100, blank=True)
    state = models.CharField('State', max_length=100, default='State')
    pincode = models.CharField('PIN Code', max_length=10, blank=True)
    profile_image = models.ImageField(upload_to='profiles/', blank=True, null=True, max_length=500)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name']

    def __str__(self):
        return f"{self.full_name} ({self.email}) - {self.role}"

    @property
    def is_admin_user(self):
        return self.role == 'admin' or self.is_staff or self.is_superuser


class Category(models.Model):
    name = models.CharField(max_length=100)
    hindi_name = models.CharField(max_length=100, blank=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    description = models.TextField(blank=True)
    image = models.CharField(max_length=500, blank=True)
    icon = models.CharField(max_length=50, blank=True)
    display_order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['display_order', 'name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} {f'({self.hindi_name})' if self.hindi_name else ''}"


class Product(models.Model):
    UNIT_CHOICES = (
        ('kg', 'kg (Kilogram)'),
        ('g', 'g (Gram)'),
        ('piece', 'Piece / Unit'),
        ('packet', 'Packet / Pouch'),
        ('box', 'Box'),
        ('liter', 'Liter'),
        ('bottle', 'Bottle'),
    )

    name = models.CharField(max_length=200)
    hindi_name = models.CharField(max_length=200, blank=True)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    category = models.ForeignKey(Category, related_name='products', on_delete=models.CASCADE)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)  # Base price per unit (e.g. ₹400 for 1kg)
    unit = models.CharField(max_length=20, choices=UNIT_CHOICES, default='kg')
    min_weight_grams = models.IntegerField(default=100)  # For weight products, min step (e.g. 100g)
    stock_quantity = models.DecimalField(max_digits=10, decimal_places=2, default=50.0)
    is_available = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    image = models.ImageField(upload_to="products/", blank=True, null=True, max_length=500)
    badge = models.CharField(max_length=50, blank=True)  # e.g. "Bestseller", "Fresh Arrival", "Pure Desi"
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-is_featured', 'category', 'name']

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name)
            slug = base_slug
            counter = 1
            while Product.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        if self.stock_quantity <= 0:
            self.is_available = False
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} - ₹{self.price}/{self.unit}"


class Cart(models.Model):
    user = models.OneToOneField(CustomUser, related_name='cart', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def total_amount(self):
        return sum((item.subtotal for item in self.items.all()), Decimal('0.00'))

    def __str__(self):
        return f"Cart of {self.user.email}"


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.DecimalField(max_digits=10, decimal_places=2, default=1.0)
    unit = models.CharField(max_length=20, default='kg')
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('cart', 'product', 'unit', 'quantity')

    def save(self, *args, **kwargs):
        # Calculate subtotal based on unit
        if self.unit == 'g':
            # Price is stored per kg
            if self.product.unit == 'kg':
                self.subtotal = (Decimal(str(self.product.price)) * Decimal(str(self.quantity)) / Decimal('1000')).quantize(Decimal('0.01'))
                self.unit_price = (Decimal(str(self.product.price)) * Decimal(str(self.quantity)) / Decimal('1000')).quantize(Decimal('0.01'))
            else:
                self.subtotal = (Decimal(str(self.product.price)) * Decimal(str(self.quantity))).quantize(Decimal('0.01'))
        elif self.unit == 'kg':
            self.subtotal = (Decimal(str(self.product.price)) * Decimal(str(self.quantity))).quantize(Decimal('0.01'))
        else:
            self.subtotal = (Decimal(str(self.product.price)) * Decimal(str(self.quantity))).quantize(Decimal('0.01'))
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.product.name} ({self.quantity} {self.unit}) - ₹{self.subtotal}"


class Order(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('preparing', 'Preparing'),
        ('out_for_delivery', 'Out for Delivery'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    )

    PAYMENT_CHOICES = (
        ('cod', 'Cash on Delivery / Pay at Delivery'),
        ('upi', 'UPI (QR Code / Apps)'),
        ('card', 'Debit / Credit Card (Gateway)'),
        ('store_pickup', 'Pay at Store / Store Pickup'),
        ('upi_cod', 'UPI on Delivery'),
    )

    PAYMENT_STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
        ('refunded', 'Refunded'),
    )

    order_id = models.CharField(max_length=32, unique=True, editable=False)
    user = models.ForeignKey(CustomUser, related_name='orders', on_delete=models.SET_NULL, null=True, blank=True)
    customer_name = models.CharField(max_length=150)
    customer_email = models.EmailField(blank=True)
    customer_phone = models.CharField(max_length=20)
    delivery_address = models.TextField(blank=True)
    village_area = models.CharField(max_length=150, blank=True)
    city = models.CharField(max_length=100, default='Local Area', blank=True)
    state = models.CharField(max_length=100, default='State', blank=True)
    pincode = models.CharField(max_length=10, blank=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    delivery_charge = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=30, choices=PAYMENT_CHOICES, default='cod')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    payment_gateway = models.CharField(max_length=50, default='none', blank=True)
    gateway_order_id = models.CharField(max_length=100, blank=True, null=True)
    transaction_id = models.CharField(max_length=100, blank=True, null=True)
    payment_signature = models.CharField(max_length=255, blank=True, null=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='pending')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.order_id:
            year = self.created_at.year if self.created_at else 2026
            unique_seq = uuid.uuid4().hex[:6].upper()
            self.order_id = f"UPG-{year}-{unique_seq}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.order_id} - {self.customer_name} (₹{self.total_amount})"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True)
    product_name = models.CharField(max_length=200)
    category_name = models.CharField(max_length=100, blank=True)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.CharField(max_length=20)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    product_image = models.CharField(max_length=500, blank=True)

    def __str__(self):
        return f"{self.product_name} x {self.quantity}{self.unit} (₹{self.subtotal})"


class StoreSetting(models.Model):
    store_name = models.CharField(max_length=150, default='Upendra General Stores')
    tagline = models.CharField(max_length=200, default='Your Trusted Local Grocery Store')
    phone = models.CharField(max_length=20, default='7295077559')
    alt_phone = models.CharField(max_length=20, default='+91 72950 77559')
    upi_id = models.CharField(max_length=100, default='7050830610@ptsbi')
    address = models.TextField(default='Near Mahavir Chowk Ganguli, Benipatti')
    opening_hours = models.CharField(max_length=100, default='7:00 AM - 9:30 PM (All 7 Days)')
    delivery_charge = models.DecimalField(max_digits=6, decimal_places=2, default=30.00)
    free_delivery_above = models.DecimalField(max_digits=8, decimal_places=2, default=249.00)
    is_store_open = models.BooleanField(default=True)
    announcement = models.CharField(max_length=300, default='✨ Welcome to Upendra General Stores • Fresh Groceries & Spices Delivered to Your Doorstep!')

    def __str__(self):
        return self.store_name


class OTPVerification(models.Model):
    PURPOSE_CHOICES = (
        ('login', 'Login'),
        ('register', 'Register'),
    )
    ROLE_CHOICES = (
        ('customer', 'Customer'),
        ('admin', 'Admin'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session_token = models.CharField(max_length=64, unique=True, db_index=True)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, null=True, blank=True, related_name='otp_verifications')
    email = models.EmailField(db_index=True)
    mobile = models.CharField(max_length=20)
    otp_code = models.CharField(max_length=10)
    purpose = models.CharField(max_length=20, choices=PURPOSE_CHOICES, default='login')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='customer')
    payload = models.JSONField(default=dict, blank=True)
    attempts = models.IntegerField(default=0)
    max_attempts = models.IntegerField(default=5)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    last_resend_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def is_expired(self):
        return timezone.now() > self.expires_at

    def __str__(self):
        return f"OTP ({self.purpose}) for {self.email} / {self.mobile} - Verified: {self.is_verified}"

