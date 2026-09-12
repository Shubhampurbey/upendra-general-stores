import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Store, User, Phone, Lock, Eye, EyeOff, MapPin, ArrowRight, RefreshCw, AlertCircle, ShieldCheck, LogIn } from 'lucide-react';
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

const SignUp = () => {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    city: 'Benipatti',
    address: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // If already authenticated, redirect
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'mobile') {
      setFormData((prev) => ({ ...prev, mobile: cleanIndianPhone(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      const err = 'Please enter your full name.';
      setErrorMessage(err);
      toast.error(err);
      return;
    }

    const cleanMobile = cleanIndianPhone(formData.mobile);
    if (cleanMobile.length !== 10 || !/^[6-9]/.test(cleanMobile)) {
      const err = 'Please enter a valid 10-digit Indian mobile number (starts with 6, 7, 8, or 9).';
      setErrorMessage(err);
      toast.error(err);
      return;
    }

    if (!formData.password || formData.password.length < 6) {
      const err = 'Password must be at least 6 characters long.';
      setErrorMessage(err);
      toast.error(err);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      const err = 'Passwords do not match. Please recheck.';
      setErrorMessage(err);
      toast.error(err);
      return;
    }

    try {
      setLoading(true);
      await register({
        full_name: formData.fullName.trim(),
        mobile: cleanMobile,
        password: formData.password,
        city: formData.city.trim() || 'Benipatti',
        address: formData.address.trim(),
      });
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.detail || 'Registration failed. Please check details.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-kirana-sand/20 to-kirana-cream">
      <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-10 border border-kirana-beige shadow-kirana space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-kirana-green to-kirana-green-dark text-white flex items-center justify-center mx-auto shadow-md font-black shadow-kirana-green/20">
            <Store className="w-7 h-7" />
          </div>

          <h1 className="font-outfit font-black text-2xl sm:text-3xl text-kirana-brown-dark tracking-tight">
            Create Account
          </h1>
          
          <p className="text-xs text-kirana-brown-light leading-relaxed">
            Join Upendra General Stores for fast local grocery ordering with fresh grains, dals, and kirana essentials.
          </p>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="p-3.5 bg-red-50 rounded-2xl border border-red-200 flex items-start gap-2.5 text-xs text-red-800 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Registration Error</span>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-kirana-brown-dark uppercase tracking-wider mb-1.5">
              Full Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-3.5 text-kirana-brown-muted" />
              <input
                type="text"
                required
                autoFocus
                name="fullName"
                placeholder="e.g. Ramesh Sharma"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full bg-kirana-sand/40 focus:bg-white border border-kirana-beige focus:border-kirana-orange rounded-2xl py-2.5 pl-10 pr-4 text-xs sm:text-sm font-medium text-kirana-brown-dark outline-none transition-all"
              />
            </div>
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-xs font-bold text-kirana-brown-dark uppercase tracking-wider mb-1.5">
              10-Digit Mobile Number *
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3 flex items-center gap-1.5 border-r border-kirana-beige pr-2 text-xs font-extrabold text-kirana-brown-dark select-none pointer-events-none">
                <span className="text-base">🇮🇳</span>
                <span>+91</span>
              </div>
              <input
                type="tel"
                required
                maxLength={10}
                name="mobile"
                placeholder="98765 43210"
                value={formData.mobile}
                onChange={handleChange}
                className="w-full bg-kirana-sand/40 focus:bg-white border border-kirana-beige focus:border-kirana-orange rounded-2xl py-2.5 pl-20 pr-4 text-xs sm:text-sm font-bold tracking-wider text-kirana-brown-dark outline-none transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-kirana-brown-dark uppercase tracking-wider mb-1.5">
              Create Password (min 6 chars) *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-kirana-brown-muted" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                name="password"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-kirana-sand/40 focus:bg-white border border-kirana-beige focus:border-kirana-orange rounded-2xl py-2.5 pl-10 pr-11 text-xs sm:text-sm font-medium text-kirana-brown-dark outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-kirana-brown-muted hover:text-kirana-brown-dark transition-colors cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-bold text-kirana-brown-dark uppercase tracking-wider mb-1.5">
              Confirm Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-kirana-brown-muted" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                name="confirmPassword"
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full bg-kirana-sand/40 focus:bg-white border border-kirana-beige focus:border-kirana-orange rounded-2xl py-2.5 pl-10 pr-11 text-xs sm:text-sm font-medium text-kirana-brown-dark outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-3 text-kirana-brown-muted hover:text-kirana-brown-dark transition-colors cursor-pointer"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* City / Area */}
          <div>
            <label className="block text-xs font-bold text-kirana-brown-dark uppercase tracking-wider mb-1.5">
              Town / City <span className="text-[10px] font-normal text-kirana-brown-muted lowercase">(optional)</span>
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3.5 top-3.5 text-kirana-brown-muted" />
              <input
                type="text"
                name="city"
                placeholder="e.g. Benipatti, Madhubani"
                value={formData.city}
                onChange={handleChange}
                className="w-full bg-kirana-sand/40 focus:bg-white border border-kirana-beige focus:border-kirana-orange rounded-2xl py-2.5 pl-10 pr-4 text-xs sm:text-sm font-medium text-kirana-brown-dark outline-none transition-all"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !formData.fullName.trim() || formData.mobile.length < 10 || !formData.password}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-kirana-green to-kirana-green-dark hover:from-kirana-green-dark hover:to-kirana-green text-white text-xs sm:text-sm font-black tracking-wide shadow-md shadow-kirana-green/20 flex items-center justify-center gap-2 transition-all btn-press disabled:opacity-50 mt-4 cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Creating Your Account...</span>
              </>
            ) : (
              <>
                <span>Register & Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Existing Account Link */}
        <div className="p-4 bg-kirana-sand/40 rounded-2xl border border-kirana-beige text-center space-y-2">
          <p className="text-xs text-kirana-brown-dark">
            Already have an account?
          </p>
          <Link
            to="/signin"
            className="inline-flex items-center gap-1.5 font-bold text-xs text-kirana-orange hover:text-kirana-orange-dark transition-colors"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In to Existing Account</span>
          </Link>
        </div>

        {/* Security Notice */}
        <div className="pt-3 border-t border-kirana-sand text-center">
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-kirana-brown-muted">
            <ShieldCheck className="w-3.5 h-3.5 text-kirana-green flex-shrink-0" />
            <span>100% Direct Account Access • No OTP Delays</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SignUp;
