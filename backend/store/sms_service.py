import re
import logging
import requests
from django.conf import settings

logger = logging.getLogger(__name__)


def clean_indian_phone(phone_str):
    """
    Cleans and returns a standard 10-digit Indian mobile number.
    """
    if not phone_str:
        return ''
    digits = re.sub(r'[^0-9]', '', str(phone_str))
    # Remove leading country code if 12 digits (91XXXXXXXXXX) or 11 digits (0XXXXXXXXXX)
    if len(digits) == 12 and digits.startswith('91'):
        digits = digits[2:]
    elif len(digits) == 11 and digits.startswith('0'):
        digits = digits[1:]
    return digits[-10:] if len(digits) >= 10 else digits


def send_otp_sms(mobile, otp_code, purpose="login"):
    """
    Dispatches 6-digit OTP to mobile number via configured SMS gateway.
    
    Supported Providers:
    - Fast2SMS (Indian SMS Gateway - https://www.fast2sms.com)
    - Twilio (International/Indian SMS Gateway - https://www.twilio.com)
    - Development / Sandbox Console Mode (when OTP_TEST_MODE=True)

    Returns:
        dict: {'success': bool, 'message': str, 'error': str (optional), 'provider': str}
    """
    clean_mobile = clean_indian_phone(mobile)
    if not clean_mobile or len(clean_mobile) != 10:
        return {
            'success': False,
            'error': f"Invalid mobile number format: '{mobile}'. Must be a 10-digit Indian mobile number."
        }

    # 1. DEVELOPMENT / TEST MODE (When OTP_TEST_MODE=True in .env)
    if getattr(settings, 'OTP_TEST_MODE', True):
        logger.info(f"[DEV OTP DISPATCH] Mobile: {clean_mobile} | OTP: {otp_code} | Purpose: {purpose}")
        print("\n" + "="*65, flush=True)
        print(">> UPENDRA GENERAL STORES - DEVELOPMENT OTP DISPATCH", flush=True)
        print(f"   Mobile Number  : {clean_mobile}", flush=True)
        print(f"   6-Digit OTP    : {otp_code}", flush=True)
        print(f"   Purpose        : {purpose}", flush=True)
        print("   Mode           : DEVELOPMENT (OTP_TEST_MODE=True in .env)", flush=True)
        print("   Validity       : 5 Minutes (300 seconds)", flush=True)
        print("="*65 + "\n", flush=True)

        return {
            'success': True,
            'provider': 'development_console',
            'message': f"OTP generated and logged to backend development console for {clean_mobile}."
        }

    # 2. LIVE PRODUCTION SMS PROVIDERS (When OTP_TEST_MODE=False)
    provider = getattr(settings, 'OTP_PROVIDER', 'fast2sms').lower()

    if provider == 'fast2sms':
        api_key = getattr(settings, 'FAST2SMS_API_KEY', '').strip()
        if not api_key:
            err_msg = (
                "SMS delivery failed: FAST2SMS_API_KEY is not configured in backend .env. "
                "Add your Fast2SMS API Key or enable OTP_TEST_MODE=True for development."
            )
            logger.error(err_msg)
            return {'success': False, 'error': err_msg}

        try:
            url = "https://www.fast2sms.com/dev/bulkV2"
            headers = {
                "authorization": api_key,
                "Content-Type": "application/json"
            }
            payload = {
                "route": "otp",
                "variables_values": str(otp_code),
                "numbers": clean_mobile
            }
            response = requests.post(url, json=payload, headers=headers, timeout=12)
            res_data = response.json() if response.content else {}

            if response.status_code == 200 and res_data.get('return') is True:
                logger.info(f"Fast2SMS OTP sent successfully to {clean_mobile}. Request ID: {res_data.get('request_id')}")
                return {
                    'success': True,
                    'provider': 'fast2sms',
                    'message': f"SMS OTP dispatched successfully to {clean_mobile} via Fast2SMS."
                }
            else:
                err_text = res_data.get('message', [f"HTTP status {response.status_code}"])[0] if isinstance(res_data.get('message'), list) else res_data.get('message', f"HTTP status {response.status_code}")
                logger.error(f"Fast2SMS API returned error: {err_text}")
                return {
                    'success': False,
                    'error': f"Fast2SMS gateway error: {err_text}"
                }
        except Exception as e:
            logger.exception("Exception during Fast2SMS dispatch")
            return {
                'success': False,
                'error': f"Fast2SMS network or connection error: {str(e)}"
            }

    elif provider == 'twilio':
        account_sid = getattr(settings, 'TWILIO_ACCOUNT_SID', '').strip()
        auth_token = getattr(settings, 'TWILIO_AUTH_TOKEN', '').strip()
        from_number = getattr(settings, 'TWILIO_PHONE_NUMBER', '').strip()

        if not (account_sid and auth_token and from_number):
            err_msg = "Twilio credentials (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER) are incomplete in backend .env."
            logger.error(err_msg)
            return {'success': False, 'error': err_msg}

        try:
            twilio_url = f"https://api.twilio.com/2010-04-01/Accounts/{account_sid}/Messages.json"
            to_number = f"+91{clean_mobile}"
            body_text = f"Your Upendra General Stores verification code is {otp_code}. Valid for 5 minutes."

            response = requests.post(
                twilio_url,
                data={'From': from_number, 'To': to_number, 'Body': body_text},
                auth=(account_sid, auth_token),
                timeout=12
            )
            if response.status_code in (200, 201):
                logger.info(f"Twilio OTP sent successfully to {to_number}")
                return {
                    'success': True,
                    'provider': 'twilio',
                    'message': f"SMS OTP dispatched successfully to {to_number} via Twilio."
                }
            else:
                res_data = response.json() if response.content else {}
                err_text = res_data.get('message', f"HTTP {response.status_code}")
                logger.error(f"Twilio API returned error: {err_text}")
                return {
                    'success': False,
                    'error': f"Twilio gateway error: {err_text}"
                }
        except Exception as e:
            logger.exception("Exception during Twilio dispatch")
            return {
                'success': False,
                'error': f"Twilio connection error: {str(e)}"
            }

    else:
        err_msg = f"Unknown or unsupported SMS provider '{provider}'. Supported: fast2sms, twilio, or set OTP_TEST_MODE=True."
        logger.error(err_msg)
        return {'success': False, 'error': err_msg}
