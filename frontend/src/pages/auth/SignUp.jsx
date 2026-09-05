import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Store, User, Lock, Phone, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const EMAIL_REGEX = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/;

const cleanIndianPhone = (raw) => {
  if (!raw) return '';
  let digits = String(raw).replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    digits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.slice(1);
  }
  if (digits.length === 10 && /^[6-9]/.test(digits)) {
    return digits;
  }
  return '';
};

const SignUp = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    mobile: '',
    password: '',
    confirm_password: '',
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear the specific field error on edit
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (errorMessage) {
      setErrorMessage('');
    }
  };

  const validateForm = () => {
    const errors = {};

    // 1. Full Name
    const trimmedName = formData.full_name.trim();
    if (!trimmedName) {
      errors.full_name = 'Full name is required.';
    } else if (trimmedName.length < 2) {
      errors.full_name = 'Full name must be at least 2 characters long.';
    }

    // 2. Email Address
    const trimmedEmail = formData.email.trim().toLowerCase();
    if (!trimmedEmail) {
      errors.email = 'Email address is required.';
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      errors.email = 'Please enter a valid email address (e.g. name@example.com).';
    }

    // 3. Mobile Number
    const cleanedMobile = cleanIndianPhone(formData.mobile);
    if (!formData.mobile.trim()) {
      errors.mobile = 'Mobile number is required.';
    } else if (!cleanedMobile) {
      errors.mobile = 'Please enter a valid 10-digit Indian mobile number (e.g. 9876543210).';
    }

    // 4. Password
    if (!formData.password) {
      errors.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long.';
    }

    // 5. Confirm Password
    if (!formData.confirm_password) {
      errors.confirm_password = 'Confirm password is required.';
    } else if (formData.password !== formData.confirm_password) {
      errors.confirm_password = 'Passwords do not match. Please verify your password.';
    }

    return errors;
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setFieldErrors({});

    const clientErrors = validateForm();
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      const firstMsg = Object.values(clientErrors)[0];
      setErrorMessage('Registration failed. Please check your email, phone number, and password and try again.');
      toast.error(firstMsg);
      return;
    }

    const cleanedMobile = cleanIndianPhone(formData.mobile);
    const cleanedEmail = formData.email.trim().toLowerCase();

    try {
      setLoading(true);
      await register({
        full_name: formData.full_name.trim(),
        email: cleanedEmail,
        mobile: cleanedMobile,
        password: formData.password,
        confirm_password: formData.confirm_password,
      });
      navigate('/');
    } catch (err) {
      console.error('Registration error:', err);
      const errData = err.response?.data;
      const newFieldErrors = {};
      let topMsg = 'Registration failed. Please check your email, phone number, and password and try again.';

      if (errData && typeof errData === 'object') {
        // Check structured 'errors' dict from API
        const errorSource = errData.errors || errData;
        Object.entries(errorSource).forEach(([key, val]) => {
          if (['full_name', 'email', 'mobile', 'password', 'confirm_password'].includes(key)) {
            newFieldErrors[key] = Array.isArray(val) ? val[0] : String(val);
          }
        });

        if (errData.message && typeof errData.message === 'string') {
          topMsg = errData.message;
        } else if (errData.detail && typeof errData.detail === 'string') {
          topMsg = errData.detail;
        } else if (Object.keys(newFieldErrors).length > 0) {
          topMsg = Object.values(newFieldErrors)[0];
        }
      } else if (typeof errData === 'string' && !errData.includes('<!DOCTYPE')) {
        topMsg = errData;
      }

      setFieldErrors(newFieldErrors);
      setErrorMessage(topMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full bg-white rounded-3xl p-8 sm:p-10 border border-kirana-beige shadow-kirana space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-kirana-green text-white flex items-center justify-center mx-auto shadow-md font-black">
            <Store className="w-6 h-6" />
          </div>
          <h1 className="font-outfit font-black text-2xl sm:text-3xl text-kirana-brown-dark">
            Create Customer Account
          </h1>
          <p className="text-xs text-kirana-brown-light">
            Join Upendra General Stores to order fresh groceries with doorstep delivery
          </p>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="p-3.5 bg-red-50 rounded-2xl border border-red-200 flex items-start gap-2.5 text-xs text-red-800 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Registration Problem</span>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Sign Up Form */}
        <form onSubmit={handleSubmitForm} className="space-y-4" noValidate>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-kirana-brown-dark uppercase tracking-wider mb-1.5">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3.5 text-kirana-brown-muted" />
                <input
                  type="text"
                  name="full_name"
                  required
                  placeholder="e.g. Ramesh Sharma"
                  value={formData.full_name}
                  onChange={handleChange}
                  className={`w-full bg-kirana-sand/40 focus:bg-white border ${
                    fieldErrors.full_name ? 'border-red-500 focus:border-red-500' : 'border-kirana-beige focus:border-kirana-orange'
                  } rounded-2xl py-2.5 pl-10 pr-4 text-xs text-kirana-brown-dark outline-none transition-all`}
                />
              </div>
              {fieldErrors.full_name && (
                <p className="text-red-600 text-[11px] font-medium mt-1 pl-1">{fieldErrors.full_name}</p>
              )}
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-bold text-kirana-brown-dark uppercase tracking-wider mb-1.5">
                Mobile Number *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-kirana-brown-muted" />
                <input
                  type="tel"
                  name="mobile"
                  required
                  placeholder="e.g. 9876543210"
                  value={formData.mobile}
                  onChange={handleChange}
                  className={`w-full bg-kirana-sand/40 focus:bg-white border ${
                    fieldErrors.mobile ? 'border-red-500 focus:border-red-500' : 'border-kirana-beige focus:border-kirana-orange'
                  } rounded-2xl py-2.5 pl-10 pr-4 text-xs text-kirana-brown-dark outline-none transition-all`}
                />
              </div>
              {fieldErrors.mobile && (
                <p className="text-red-600 text-[11px] font-medium mt-1 pl-1">{fieldErrors.mobile}</p>
              )}
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-bold text-kirana-brown-dark uppercase tracking-wider mb-1.5">
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              required
              placeholder="e.g. ramesh@gmail.com"
              value={formData.email}
              onChange={handleChange}
              className={`w-full bg-kirana-sand/40 focus:bg-white border ${
                fieldErrors.email ? 'border-red-500 focus:border-red-500' : 'border-kirana-beige focus:border-kirana-orange'
              } rounded-2xl py-2.5 px-4 text-xs text-kirana-brown-dark outline-none transition-all`}
            />
            {fieldErrors.email && (
              <p className="text-red-600 text-[11px] font-medium mt-1 pl-1">{fieldErrors.email}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-kirana-brown-dark uppercase tracking-wider mb-1.5">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-kirana-brown-muted" />
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="Min 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full bg-kirana-sand/40 focus:bg-white border ${
                    fieldErrors.password ? 'border-red-500 focus:border-red-500' : 'border-kirana-beige focus:border-kirana-orange'
                  } rounded-2xl py-2.5 pl-10 pr-4 text-xs text-kirana-brown-dark outline-none transition-all`}
                />
              </div>
              {fieldErrors.password && (
                <p className="text-red-600 text-[11px] font-medium mt-1 pl-1">{fieldErrors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold text-kirana-brown-dark uppercase tracking-wider mb-1.5">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-kirana-brown-muted" />
                <input
                  type="password"
                  name="confirm_password"
                  required
                  placeholder="Re-enter password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  className={`w-full bg-kirana-sand/40 focus:bg-white border ${
                    fieldErrors.confirm_password ? 'border-red-500 focus:border-red-500' : 'border-kirana-beige focus:border-kirana-orange'
                  } rounded-2xl py-2.5 pl-10 pr-4 text-xs text-kirana-brown-dark outline-none transition-all`}
                />
              </div>
              {fieldErrors.confirm_password && (
                <p className="text-red-600 text-[11px] font-medium mt-1 pl-1">{fieldErrors.confirm_password}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-kirana-green to-kirana-green-dark hover:from-kirana-green-dark hover:to-kirana-green text-white text-xs sm:text-sm font-black tracking-wide shadow-md shadow-kirana-green/30 flex items-center justify-center gap-2 transition-all btn-press disabled:opacity-50 mt-4"
          >
            {loading ? (
              <span>Creating Customer Account...</span>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center pt-2 border-t border-kirana-sand text-xs text-kirana-brown-light">
          Already have an account?{' '}
          <Link to="/signin" className="font-bold text-kirana-orange hover:underline">
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
};

export default SignUp;

