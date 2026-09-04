# pyrefly: ignore [missing-import]
from django.contrib import admin
from .models import CustomUser, Category, Product, Cart, CartItem, Order, OrderItem, StoreSetting


@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ('email', 'full_name', 'mobile', 'role', 'city', 'created_at')
    list_filter = ('role', 'is_staff', 'is_superuser')
    search_fields = ('email', 'full_name', 'mobile')


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'hindi_name', 'slug', 'display_order', 'is_active')
    list_editable = ('display_order', 'is_active')
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'hindi_name', 'category', 'price', 'unit', 'stock_quantity', 'is_available', 'is_featured')
    list_filter = ('category', 'is_available', 'is_featured', 'unit')
    list_editable = ('price', 'stock_quantity', 'is_available', 'is_featured')
    search_fields = ('name', 'hindi_name', 'description')
    prepopulated_fields = {'slug': ('name',)}


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        'order_id', 'customer_name', 'customer_phone', 'total_amount',
        'payment_method', 'payment_status', 'transaction_id', 'status', 'paid_at', 'created_at'
    )
    list_filter = ('status', 'payment_status', 'payment_method', 'payment_gateway', 'created_at')
    search_fields = ('order_id', 'customer_name', 'customer_phone', 'transaction_id', 'gateway_order_id', 'delivery_address')
    readonly_fields = ('order_id', 'paid_at', 'gateway_order_id', 'payment_signature', 'created_at', 'updated_at')
    inlines = [OrderItemInline]



admin.site.register(Cart)
admin.site.register(CartItem)
admin.site.register(StoreSetting)
