import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Store, Phone, ShieldCheck, ArrowRight, RefreshCw, AlertCircle, CheckCircle2, User, KeyRound, Edit3 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const cleanIndianPhone = (raw) => {
  if (!raw) return '';
  let digits = String(raw).replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    digits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.slice(1);
  }
  return digits.slice(0, 10);
};

const SignIn = () => {
  const { sendOtp, verifyOtp, resendOtp, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Navigation target after login
  const from = location.state?.from?.pathname || '/';

  // Step 1: 'phone_entry', Step 2: 'otp_verification'
  const [step, setStep] = useState('phone_entry');
  const [mobile, setMobile] = useState('');
  const [fullName, setFullName] = useState('');
  const [otp, setOtp] = useState('');
  const [sessionToken, setSessionToken] = useState('');
  
  // Timers & Loading States
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [isNewUser, setIsNewUser] = useState(false);

  const otpInputRef = useRef(null);

  // If already authenticated, redirect
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  // Handle Resend Cooldown Countdown
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  // Focus OTP input when moving to Step 2
  useEffect(() => {
    if (step === 'otp_verification' && otpInputRef.current) {
      otpInputRef.current.focus();
    }
  }, [step]);

  const handleMobileChange = (e) => {
    const cleaned = cleanIndianPhone(e.target.value);
    setMobile(cleaned);
    if (errorMessage) setErrorMessage('');
  };

  const handleOtpChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(val);
    if (errorMessage) setErrorMessage('');
  };

  // Step 1: Send OTP to Mobile
  const handleSendOtpSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanNumber = cleanIndianPhone(mobile);
    if (cleanNumber.length !== 10 || !/^[6-9]/.test(cleanNumber)) {
      const err = 'Please enter a valid 10-digit Indian mobile number (starts with 6, 7, 8, or 9).';
      setErrorMessage(err);
      toast.error(err);
      return;
    }

    try {
      setLoading(true);
      const res = await sendOtp(cleanNumber, fullName.trim());
      setSessionToken(res.session_token || '');
      setIsNewUser(!!res.is_new_user);
      setCooldown(60);
      setStep('otp_verification');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.detail || 'Failed to send OTP. Please check your mobile number.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtpSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (otp.length !== 6) {
      const err = 'Please enter the complete 6-digit OTP code.';
      setErrorMessage(err);
      toast.error(err);
      return;
    }

    try {
      setLoading(true);
      await verifyOtp(sessionToken, mobile, otp, fullName.trim());
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.detail || 'Invalid OTP code. Please try again.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP handler
  const handleResendOtp = async () => {
    if (cooldown > 0 || loading) return;
    setErrorMessage('');

    try {
      setLoading(true);
      const res = await resendOtp(sessionToken, mobile);
      if (res.session_token) {
        setSessionToken(res.session_token);
      }
      setCooldown(60);
      setOtp('');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.detail || 'Failed to resend OTP.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleEditMobileNumber = () => {
    setStep('phone_entry');
    setOtp('');
    setErrorMessage('');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-10 border border-kirana-beige shadow-kirana space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-kirana-orange to-kirana-orange-dark text-white flex items-center justify-center mx-auto shadow-md font-black shadow-kirana-orange/20">
            <Store className="w-7 h-7" />
          </div>

          <h1 className="font-outfit font-black text-2xl sm:text-3xl text-kirana-brown-dark tracking-tight">
            {step === 'phone_entry' ? 'Login / Create Account' : 'Verify Mobile Number'}
          </h1>
          
          <p className="text-xs text-kirana-brown-light leading-relaxed">
            {step === 'phone_entry' 
              ? 'Enter your Indian mobile number to receive a secure login OTP via SMS' 
              : `Enter the 6-digit OTP code sent to +91 ${mobile.slice(0, 5)} ${mobile.slice(5)}`}
          </p>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="p-3.5 bg-red-50 rounded-2xl border border-red-200 flex items-start gap-2.5 text-xs text-red-800 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Action Required</span>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* STEP 1: Phone Entry Form */}
        {step === 'phone_entry' && (
          <form onSubmit={handleSendOtpSubmit} className="space-y-4">
            
            {/* Full Name (Optional for first-time onboarding) */}
            <div>
              <label className="block text-xs font-bold text-kirana-brown-dark uppercase tracking-wider mb-1.5">
                Your Name <span className="text-[10px] font-normal text-kirana-brown-muted lowercase">(optional)</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3.5 text-kirana-brown-muted" />
                <input
                  type="text"
                  placeholder="e.g. Ramesh Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-kirana-sand/40 focus:bg-white border border-kirana-beige focus:border-kirana-orange rounded-2xl py-2.5 pl-10 pr-4 text-xs text-kirana-brown-dark outline-none transition-all"
                />
              </div>
            </div>

            {/* Mobile Number with Non-editable +91 country badge */}
            <div>
              <label className="block text-xs font-bold text-kirana-brown-dark uppercase tracking-wider mb-1.5">
                Mobile Number *
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3 flex items-center gap-1.5 border-r border-kirana-beige pr-2 text-xs font-extrabold text-kirana-brown-dark select-none pointer-events-none">
                  <span className="text-base">🇮🇳</span>
                  <span>+91</span>
                </div>
                <input
                  type="tel"
                  required
                  autoFocus
                  maxLength={10}
                  placeholder="98765 43210"
                  value={mobile}
                  onChange={handleMobileChange}
                  className="w-full bg-kirana-sand/40 focus:bg-white border border-kirana-beige focus:border-kirana-orange rounded-2xl py-2.5 pl-20 pr-4 text-xs sm:text-sm font-bold tracking-wider text-kirana-brown-dark outline-none transition-all"
                />
              </div>
              <span className="text-[10px] text-kirana-brown-muted block mt-1 pl-1">
                Standard 10-digit Indian mobile number
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || mobile.length < 10}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-kirana-orange to-kirana-orange-dark hover:from-kirana-orange-dark hover:to-kirana-orange text-white text-xs sm:text-sm font-black tracking-wide shadow-md shadow-kirana-orange/20 flex items-center justify-center gap-2 transition-all btn-press disabled:opacity-50 mt-4 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Sending OTP SMS...</span>
                </>
              ) : (
                <>
                  <span>Send Verification OTP</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: OTP Verification Form */}
        {step === 'otp_verification' && (
          <form onSubmit={handleVerifyOtpSubmit} className="space-y-5 animate-in fade-in slide-in-from-right-2">
            
            {/* Phone Info & Change Number Pill */}
            <div className="p-3 bg-kirana-sand/60 rounded-2xl border border-kirana-beige flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                <Phone className="w-4 h-4 text-kirana-orange flex-shrink-0" />
                <span className="font-bold text-kirana-brown-dark">
                  +91 {mobile.slice(0, 5)} {mobile.slice(5)}
                </span>
              </div>
              <button
                type="button"
                onClick={handleEditMobileNumber}
                className="text-[11px] font-bold text-kirana-orange hover:underline flex items-center gap-1"
              >
                <Edit3 className="w-3 h-3" />
                <span>Change</span>
              </button>
            </div>

            {/* 6-Digit OTP Input */}
            <div>
              <label className="block text-xs font-bold text-kirana-brown-dark uppercase tracking-wider mb-2 text-center">
                Enter 6-Digit OTP Code
              </label>
              <div className="flex justify-center">
                <input
                  ref={otpInputRef}
                  type="text"
                  required
                  maxLength={6}
                  placeholder="• • • • • •"
                  value={otp}
                  onChange={handleOtpChange}
                  className="w-48 text-center bg-kirana-sand/40 focus:bg-white border-2 border-kirana-beige focus:border-kirana-orange rounded-2xl py-3 px-4 text-xl font-mono font-black tracking-[0.5em] text-kirana-brown-dark outline-none transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Resend OTP with Cooldown */}
            <div className="text-center text-xs">
              {cooldown > 0 ? (
                <span className="text-kirana-brown-muted font-medium">
                  Resend OTP in <strong className="text-kirana-orange font-bold">{cooldown}s</strong>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="font-bold text-kirana-orange hover:underline flex items-center gap-1.5 mx-auto transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>Resend OTP via SMS</span>
                </button>
              )}
            </div>

            {/* Verify Button */}
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-kirana-green to-kirana-green-dark hover:from-kirana-green-dark hover:to-kirana-green text-white text-xs sm:text-sm font-black tracking-wide shadow-md shadow-kirana-green/20 flex items-center justify-center gap-2 transition-all btn-press disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying OTP...</span>
                </>
              ) : (
                <>
                  <span>Verify & Continue</span>
                  <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Security & Admin Footer Notice */}
        <div className="pt-3 border-t border-kirana-sand text-center space-y-3">
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-kirana-brown-muted">
            <ShieldCheck className="w-3.5 h-3.5 text-kirana-green flex-shrink-0" />
            <span>100% Secure Instant SMS Authentication</span>
          </div>

          <p className="text-[11px] text-kirana-brown-muted">
            Store Administrator?{' '}
            <Link to="/admin-login" className="font-bold text-kirana-orange hover:underline">
              Sign In to Admin Suite →
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default SignIn;
