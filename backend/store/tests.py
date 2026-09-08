from unittest.mock import patch
from datetime import timedelta
from decimal import Decimal
from django.test import TestCase
from django.utils import timezone
from django.contrib.auth.hashers import make_password
from rest_framework.test import APIClient
from rest_framework import status

from store.models import CustomUser, Category, Product, OTPVerification, StoreSetting
from store.sms_service import SMSService, clean_indian_mobile


class SMSServiceTestCase(TestCase):
    def test_clean_indian_mobile(self):
        self.assertEqual(clean_indian_mobile('9876543210'), '9876543210')
        self.assertEqual(clean_indian_mobile('+91 98765 43210'), '9876543210')
        self.assertEqual(clean_indian_mobile('919876543210'), '9876543210')
        self.assertEqual(clean_indian_mobile('09876543210'), '9876543210')
        self.assertEqual(clean_indian_mobile('12345'), '')  # Short
        self.assertEqual(clean_indian_mobile('5876543210'), '')  # Invalid starting digit (not 6,7,8,9)
        self.assertEqual(clean_indian_mobile('abcdefghij'), '')

    def test_unconfigured_sms_provider_fails_strictly_without_fake_otp(self):
        with patch.dict('os.environ', {'SMS_PROVIDER': '', 'FAST2SMS_API_KEY': '', 'MSG91_AUTH_KEY': '', 'TWOFACTOR_API_KEY': '', 'TWILIO_ACCOUNT_SID': ''}, clear=True):
            success, msg = SMSService.send_otp_sms('9876543210', '123456')
            self.assertFalse(success)
            self.assertIn('SMS service is not configured', msg)


class CustomerOTPAuthTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.category = Category.objects.create(name='Pulses & Dal', slug='pulses-dal')

    def test_send_otp_invalid_mobile_rejected(self):
        # 1. Letters / empty
        response = self.client.post('/api/auth/send-otp/', {'mobile': 'abc'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data.get('success'))

        # 2. Short number
        response = self.client.post('/api/auth/send-otp/', {'mobile': '98765'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # 3. Invalid leading digit (5)
        response = self.client.post('/api/auth/send-otp/', {'mobile': '5876543210'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @patch.object(SMSService, 'send_otp_sms', return_value=(True, 'OTP sent'))
    def test_send_otp_success_flow(self, mock_sms):
        response = self.client.post('/api/auth/send-otp/', {'mobile': '9876543210', 'full_name': 'Aakash Kumar'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data.get('success'))
        self.assertIn('session_token', response.data)
        self.assertTrue(response.data.get('is_new_user'))
        
        # Verify OTP record is in database and NEVER exposed in response
        self.assertNotIn('otp', response.data)
        self.assertNotIn('otp_code', response.data)
        otp_rec = OTPVerification.objects.get(mobile='9876543210')
        self.assertEqual(otp_rec.payload.get('full_name'), 'Aakash Kumar')
        self.assertFalse(otp_rec.is_verified)

    @patch.object(SMSService, 'send_otp_sms', return_value=(True, 'OTP sent'))
    def test_send_otp_cooldown_enforced(self, mock_sms):
        # First request
        self.client.post('/api/auth/send-otp/', {'mobile': '9876543210'})
        # Immediate second request within 60s
        response = self.client.post('/api/auth/send-otp/', {'mobile': '9876543210'})
        self.assertEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)
        self.assertIn('Please wait', response.data.get('message'))

    def test_verify_otp_wrong_code_and_attempt_limit(self):
        otp_hash = make_password('654321')
        otp_rec = OTPVerification.objects.create(
            session_token='test-token-123',
            mobile='9876543210',
            otp_code=otp_hash,
            expires_at=timezone.now() + timedelta(minutes=5)
        )

        # 1. Wrong OTP
        response = self.client.post('/api/auth/verify-otp/', {
            'session_token': 'test-token-123',
            'mobile': '9876543210',
            'otp': '111111'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Invalid OTP code', response.data.get('message'))
        
        otp_rec.refresh_from_db()
        self.assertEqual(otp_rec.attempts, 1)

    def test_verify_otp_success_creates_customer_account_and_jwt(self):
        otp_hash = make_password('889900')
        OTPVerification.objects.create(
            session_token='test-valid-token',
            mobile='9876543210',
            otp_code=otp_hash,
            payload={'full_name': 'Ravi Shankar'},
            expires_at=timezone.now() + timedelta(minutes=5)
        )

        response = self.client.post('/api/auth/verify-otp/', {
            'session_token': 'test-valid-token',
            'mobile': '9876543210',
            'otp': '889900',
            'full_name': 'Ravi Shankar'
        })

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data.get('success'))
        self.assertIn('tokens', response.data)
        self.assertIn('access', response.data['tokens'])
        self.assertIn('refresh', response.data['tokens'])

        user = CustomUser.objects.get(mobile='9876543210')
        self.assertEqual(user.full_name, 'Ravi Shankar')
        self.assertEqual(user.role, 'customer')
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)


class AdminAuthAndPermissionsTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.category = Category.objects.create(name='Spices', slug='spices')
        self.product = Product.objects.create(
            name='Haldi Powder',
            category=self.category,
            price=Decimal('200.00'),
            stock_quantity=Decimal('50.0'),
            unit='kg'
        )
        self.customer = CustomUser.objects.create_user(
            mobile='9811111111',
            full_name='Customer John',
            role='customer'
        )
        self.admin = CustomUser.objects.create_superuser(
            mobile='7050830610',
            email='admin@upendrastore.in',
            password='AdminPassword123!',
            full_name='Admin Owner',
            role='admin'
        )

    def test_customer_cannot_call_admin_endpoints(self):
        # Authenticate as normal customer
        self.client.force_authenticate(user=self.customer)

        # Attempt to create product -> 403 Forbidden
        create_resp = self.client.post('/api/products/', {
            'name': 'Hacked Product',
            'category': self.category.id,
            'price': '10.00',
            'unit': 'kg'
        })
        self.assertEqual(create_resp.status_code, status.HTTP_403_FORBIDDEN)

        # Attempt to update product -> 403 Forbidden
        update_resp = self.client.patch(f'/api/products/{self.product.id}/', {
            'price': '5.00'
        })
        self.assertEqual(update_resp.status_code, status.HTTP_403_FORBIDDEN)

        # Attempt to access admin dashboard -> 403 Forbidden
        dash_resp = self.client.get('/api/admin/dashboard/')
        self.assertEqual(dash_resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_update_product_price_and_stock(self):
        # Authenticate as Admin
        self.client.force_authenticate(user=self.admin)

        # Update product price
        update_resp = self.client.patch(f'/api/products/{self.product.id}/', {
            'name': 'Pure Haldi Powder (Special)',
            'price': '250.00',
            'stock_quantity': '80.0',
            'category': self.category.id
        })
        self.assertEqual(update_resp.status_code, status.HTTP_200_OK)

        self.product.refresh_from_db()
        self.assertEqual(self.product.name, 'Pure Haldi Powder (Special)')
        self.assertEqual(self.product.price, Decimal('250.00'))
        self.assertEqual(self.product.stock_quantity, Decimal('80.0'))

    def test_admin_login_endpoint(self):
        # 1. Admin login with correct password
        response = self.client.post('/api/auth/admin-login/', {
            'email': '7050830610',
            'password': 'AdminPassword123!'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('tokens', response.data)
        self.assertTrue(response.data['user']['is_admin'])

        # 2. Customer trying admin login -> rejected
        cust_resp = self.client.post('/api/auth/admin-login/', {
            'email': '9811111111',
            'password': 'any'
        })
        self.assertEqual(cust_resp.status_code, status.HTTP_401_UNAUTHORIZED)
