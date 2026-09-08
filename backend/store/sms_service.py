import os
import re
import json
import logging
import urllib.request
import urllib.parse
import urllib.error

logger = logging.getLogger(__name__)


def clean_indian_mobile(mobile_str):
    """
    Cleans and standardizes an Indian mobile number.
    Returns a 10-digit string starting with 6, 7, 8, or 9, or empty string if invalid.
    """
    if not mobile_str:
        return ''
    digits = re.sub(r'\D', '', str(mobile_str))
    if len(digits) == 12 and digits.startswith('91'):
        digits = digits[2:]
    elif len(digits) == 11 and digits.startswith('0'):
        digits = digits[1:]
    if len(digits) == 10 and digits[0] in '6789':
        return digits
    return ''


class SMSService:
    """
    Production-ready Indian SMS Gateway integration service.
    Supported providers:
    - fast2sms (Fast2SMS Quick Transactional / OTP route)
    - msg91 (MSG91 OTP API)
    - 2factor / twofactor (2Factor.in SMS OTP API)
    - twilio (Twilio REST API)
    - custom (Custom webhook / HTTP API)

    All credentials are read from environment variables.
    Strictly prohibits fake OTP fallback in production.
    """

    @classmethod
    def get_provider_name(cls):
        provider = os.environ.get('SMS_PROVIDER', '').strip().lower()
        if not provider:
            # Auto-detect provider based on available environment variables
            if os.environ.get('FAST2SMS_API_KEY') or os.environ.get('FAST2SMS_KEY'):
                return 'fast2sms'
            elif os.environ.get('MSG91_AUTH_KEY') or os.environ.get('MSG91_KEY'):
                return 'msg91'
            elif os.environ.get('TWOFACTOR_API_KEY') or os.environ.get('2FACTOR_API_KEY'):
                return '2factor'
            elif os.environ.get('TWILIO_ACCOUNT_SID'):
                return 'twilio'
        return provider or 'none'

    @classmethod
    def send_otp_sms(cls, mobile, otp_code):
        """
        Dispatches a real OTP SMS to the customer's Indian mobile number.
        Returns: (success: bool, message: str)
        """
        clean_mobile = clean_indian_mobile(mobile)
        if not clean_mobile:
            return False, "Invalid Indian mobile number. Please enter a valid 10-digit number."

        provider = cls.get_provider_name()

        if provider == 'fast2sms':
            return cls._send_fast2sms(clean_mobile, otp_code)
        elif provider == 'msg91':
            return cls._send_msg91(clean_mobile, otp_code)
        elif provider in ('2factor', 'twofactor'):
            return cls._send_twofactor(clean_mobile, otp_code)
        elif provider == 'twilio':
            return cls._send_twilio(clean_mobile, otp_code)
        elif provider == 'custom':
            return cls._send_custom(clean_mobile, otp_code)
        else:
            # No valid provider configured
            err_msg = (
                "SMS service is not configured. Please set SMS_PROVIDER and provider API keys "
                "(such as FAST2SMS_API_KEY, MSG91_AUTH_KEY, or TWOFACTOR_API_KEY) in server environment variables."
            )
            logger.error(f"[SMS Provider Error] No valid SMS provider configured for {clean_mobile[:2]}******{clean_mobile[-2:]}.")
            return False, err_msg

    @classmethod
    def _send_fast2sms(cls, mobile, otp_code):
        api_key = os.environ.get('FAST2SMS_API_KEY') or os.environ.get('SMS_API_KEY', '')
        if not api_key:
            return False, "Fast2SMS API key (FAST2SMS_API_KEY) is missing in server configuration."

        url = "https://www.fast2sms.com/dev/bulkV2"
        # Fast2SMS OTP route
        headers = {
            'authorization': api_key.strip(),
            'Content-Type': 'application/json',
            'User-Agent': 'UpendraGeneralStores/1.0',
        }
        
        # Check if custom DLT sender and template is configured
        sender_id = os.environ.get('SMS_SENDER_ID', '').strip()
        template_id = os.environ.get('SMS_TEMPLATE_ID', '').strip()

        if sender_id and template_id:
            payload = {
                "route": "dlt",
                "sender_id": sender_id,
                "message": template_id,
                "variables_values": str(otp_code),
                "flash": 0,
                "numbers": mobile
            }
        else:
            payload = {
                "variables_values": str(otp_code),
                "route": "otp",
                "numbers": mobile
            }

        try:
            req_data = json.dumps(payload).encode('utf-8')
            req = urllib.request.Request(url, data=req_data, headers=headers, method='POST')
            with urllib.request.urlopen(req, timeout=10) as response:
                resp_body = response.read().decode('utf-8')
                resp_json = json.loads(resp_body) if resp_body else {}
                
                if resp_json.get('return') is True or response.status in (200, 201):
                    logger.info(f"Fast2SMS OTP successfully dispatched to {mobile[:2]}******{mobile[-2:]}")
                    return True, "OTP has been sent to your mobile number via SMS."
                else:
                    msg = resp_json.get('message', ['Failed to send SMS'])[0] if isinstance(resp_json.get('message'), list) else resp_json.get('message', 'SMS sending failed')
                    logger.warning(f"Fast2SMS returned error: {msg}")
                    return False, f"SMS Gateway error: {msg}"
        except urllib.error.HTTPError as e:
            error_body = e.read().decode('utf-8') if e.fp else str(e)
            logger.error(f"Fast2SMS HTTP Error {e.code}: {error_body}")
            return False, f"SMS Gateway communication error (HTTP {e.code}). Please try again."
        except Exception as e:
            logger.error(f"Fast2SMS request failed: {str(e)}")
            return False, "Failed to connect to SMS Gateway. Please try again shortly."

    @classmethod
    def _send_msg91(cls, mobile, otp_code):
        auth_key = os.environ.get('MSG91_AUTH_KEY') or os.environ.get('SMS_API_KEY', '')
        template_id = os.environ.get('MSG91_TEMPLATE_ID') or os.environ.get('SMS_TEMPLATE_ID', '')
        if not auth_key:
            return False, "MSG91 Auth key (MSG91_AUTH_KEY) is missing in server configuration."

        url = "https://control.msg91.com/api/v5/otp"
        headers = {
            'authkey': auth_key.strip(),
            'Content-Type': 'application/json',
        }
        payload = {
            "template_id": template_id,
            "mobile": f"91{mobile}",
            "otp": str(otp_code),
        }

        try:
            req_data = json.dumps(payload).encode('utf-8')
            req = urllib.request.Request(url, data=req_data, headers=headers, method='POST')
            with urllib.request.urlopen(req, timeout=10) as response:
                resp_body = response.read().decode('utf-8')
                resp_json = json.loads(resp_body) if resp_body else {}
                if resp_json.get('type') == 'success' or response.status in (200, 201):
                    logger.info(f"MSG91 OTP successfully dispatched to {mobile[:2]}******{mobile[-2:]}")
                    return True, "OTP has been sent to your mobile number via SMS."
                else:
                    msg = resp_json.get('message', 'SMS sending failed')
                    return False, f"MSG91 Error: {msg}"
        except Exception as e:
            logger.error(f"MSG91 request failed: {str(e)}")
            return False, "Failed to connect to MSG91 SMS gateway."

    @classmethod
    def _send_twofactor(cls, mobile, otp_code):
        api_key = os.environ.get('TWOFACTOR_API_KEY') or os.environ.get('SMS_API_KEY', '')
        if not api_key:
            return False, "2Factor API key (TWOFACTOR_API_KEY) is missing in server configuration."

        template = os.environ.get('SMS_TEMPLATE_ID', 'OTP1')
        url = f"https://2factor.in/API/V1/{api_key.strip()}/SMS/{mobile}/{otp_code}/{template}"

        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'UpendraGeneralStores/1.0'})
            with urllib.request.urlopen(req, timeout=10) as response:
                resp_body = response.read().decode('utf-8')
                resp_json = json.loads(resp_body) if resp_body else {}
                if resp_json.get('Status') == 'Success':
                    logger.info(f"2Factor OTP successfully dispatched to {mobile[:2]}******{mobile[-2:]}")
                    return True, "OTP has been sent to your mobile number via SMS."
                else:
                    return False, f"2Factor Error: {resp_json.get('Details', 'SMS failed')}"
        except Exception as e:
            logger.error(f"2Factor request failed: {str(e)}")
            return False, "Failed to connect to 2Factor SMS gateway."

    @classmethod
    def _send_twilio(cls, mobile, otp_code):
        account_sid = os.environ.get('TWILIO_ACCOUNT_SID', '').strip()
        auth_token = os.environ.get('TWILIO_AUTH_TOKEN', '').strip()
        from_number = os.environ.get('TWILIO_PHONE_NUMBER', '').strip()

        if not (account_sid and auth_token and from_number):
            return False, "Twilio credentials (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER) are incomplete."

        url = f"https://api.twilio.com/2010-04-01/Accounts/{account_sid}/Messages.json"
        to_number = f"+91{mobile}"
        body = f"Your Upendra General Stores verification code is: {otp_code}. Valid for 5 minutes. Do not share this OTP."

        data = urllib.parse.urlencode({
            'To': to_number,
            'From': from_number,
            'Body': body,
        }).encode('utf-8')

        # Basic Auth for Twilio
        import base64
        auth_header = "Basic " + base64.b64encode(f"{account_sid}:{auth_token}".encode('utf-8')).decode('utf-8')

        try:
            req = urllib.request.Request(url, data=data, headers={'Authorization': auth_header}, method='POST')
            with urllib.request.urlopen(req, timeout=10) as response:
                if response.status in (200, 201):
                    logger.info(f"Twilio OTP successfully dispatched to {mobile[:2]}******{mobile[-2:]}")
                    return True, "OTP has been sent to your mobile number via SMS."
                return False, f"Twilio returned status {response.status}."
        except Exception as e:
            logger.error(f"Twilio request failed: {str(e)}")
            return False, "Failed to connect to Twilio SMS gateway."

    @classmethod
    def _send_custom(cls, mobile, otp_code):
        gateway_url = os.environ.get('SMS_GATEWAY_URL', '').strip()
        if not gateway_url:
            return False, "SMS_GATEWAY_URL is missing in server configuration."
        
        final_url = gateway_url.replace('{MOBILE}', mobile).replace('{OTP}', str(otp_code))
        try:
            req = urllib.request.Request(final_url, headers={'User-Agent': 'UpendraGeneralStores/1.0'})
            with urllib.request.urlopen(req, timeout=10) as response:
                if response.status in (200, 201):
                    return True, "OTP has been sent to your mobile number via SMS."
                return False, f"Custom gateway returned status {response.status}."
        except Exception as e:
            logger.error(f"Custom SMS Gateway request failed: {str(e)}")
            return False, "Failed to connect to custom SMS gateway."
