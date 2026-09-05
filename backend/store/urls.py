from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    LoginInitView,
    RegisterInitView,
    CustomTokenObtainPairView,
    AdminTokenObtainPairView,
    RegisterView,
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
    # Direct Auth endpoints
    path('auth/login-init/', LoginInitView.as_view(), name='auth_login_init'),
    path('auth/register-init/', RegisterInitView.as_view(), name='auth_register_init'),
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/admin-login/', AdminTokenObtainPairView.as_view(), name='admin_token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/register/', RegisterView.as_view(), name='user_register'),
    path('auth/profile/', UserProfileView.as_view(), name='user_profile'),

    # Cart endpoints
    path('cart/', CartView.as_view(), name='cart_view'),
    path('cart/add/', CartItemAddView.as_view(), name='cart_add'),
    path('cart/items/<int:item_id>/', CartItemUpdateView.as_view(), name='cart_item_detail'),
    path('cart/clear/', CartClearView.as_view(), name='cart_clear'),

    # Admin endpoints
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

