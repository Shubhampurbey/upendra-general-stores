from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    UserLoginView,
    UserRegisterView,
    SendOTPView,
    VerifyOTPView,
    ResendOTPView,
    AdminLoginView,
    UserProfileView,
    CategoryViewSet,
    ProductViewSet,
    CartView,
    CartItemAddView,
    CartItemUpdateView,
    CartClearView,
    OrderViewSet,
    OrderStatusUpdateView,
    AdminDashboardView,
    AdminCustomerListView,
    AdminQuickPriceStockUpdateView,
    StoreSettingView,
    ImageUploadView,
    CreatePaymentOrderView,
    VerifyPaymentView,
    PaymentFailureView,
    PaymentWebhookView,
)

router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'products', ProductViewSet, basename='product')
router.register(r'orders', OrderViewSet, basename='order')

urlpatterns = [
    # Customer Password-based Authentication endpoints
    path('auth/login/', UserLoginView.as_view(), name='user_login'),
    path('auth/register/', UserRegisterView.as_view(), name='user_register'),
    path('auth/customer-login/', UserLoginView.as_view(), name='customer_login'),

    # Customer Phone + Real OTP Authentication endpoints (legacy/backup)
    path('auth/send-otp/', SendOTPView.as_view(), name='auth_send_otp'),
    path('auth/verify-otp/', VerifyOTPView.as_view(), name='auth_verify_otp'),
    path('auth/resend-otp/', ResendOTPView.as_view(), name='auth_resend_otp'),

    # Admin Dedicated Authentication endpoint
    path('auth/admin-login/', AdminLoginView.as_view(), name='admin_login'),

    # JWT Token Refresh & Profile
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/profile/', UserProfileView.as_view(), name='user_profile'),

    # Cart endpoints
    path('cart/', CartView.as_view(), name='cart_view'),
    path('cart/add/', CartItemAddView.as_view(), name='cart_add'),
    path('cart/items/<int:item_id>/', CartItemUpdateView.as_view(), name='cart_item_detail'),
    path('cart/clear/', CartClearView.as_view(), name='cart_clear'),

    # Admin Dashboard & Product endpoints
    path('admin/dashboard/', AdminDashboardView.as_view(), name='admin_dashboard'),
    path('admin/customers/', AdminCustomerListView.as_view(), name='admin_customers'),
    path('admin/orders/<str:order_id>/status/', OrderStatusUpdateView.as_view(), name='admin_order_status'),
    path('admin/products/<int:product_id>/quick-update/', AdminQuickPriceStockUpdateView.as_view(), name='admin_quick_update'),
    path('admin/upload-image/', ImageUploadView.as_view(), name='admin_upload_image'),

    # Store settings
    path('store-settings/', StoreSettingView.as_view(), name='store_settings'),

    # Payment Gateway endpoints
    path('payments/create-order/', CreatePaymentOrderView.as_view(), name='payment_create_order'),
    path('payments/verify/', VerifyPaymentView.as_view(), name='payment_verify'),
    path('payments/fail/', PaymentFailureView.as_view(), name='payment_fail'),
    path('payments/webhook/', PaymentWebhookView.as_view(), name='payment_webhook'),

    # Router endpoints (categories, products, orders)
    path('', include(router.urls)),
]
