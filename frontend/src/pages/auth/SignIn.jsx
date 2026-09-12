import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Store, Phone, Lock, Eye, EyeOff, ArrowRight, RefreshCw, AlertCircle, ShieldCheck, UserPlus, KeyRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const SignIn = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Navigation target after login
  const from = location.state?.from?.pathname || '/';

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // If already authenticated, redirect
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanIdent = identifier.trim();
    if (!cleanIdent) {
      const err = 'Please enter your registered mobile number or email.';
      setErrorMessage(err);
      toast.error(err);
      return;
    }

    if (!password) {
      const err = 'Please enter your password.';
      setErrorMessage(err);
      toast.error(err);
      return;
    }

    try {
      setLoading(true);
      await login(cleanIdent, password);
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.detail || 'Invalid mobile number/email or password.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-kirana-sand/20 to-kirana-cream">
      <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-10 border border-kirana-beige shadow-kirana space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-kirana-orange to-kirana-orange-dark text-white flex items-center justify-center mx-auto shadow-md font-black shadow-kirana-orange/20">
            <Store className="w-7 h-7" />
          </div>

          <h1 className="font-outfit font-black text-2xl sm:text-3xl text-kirana-brown-dark tracking-tight">
            Customer Sign In
          </h1>
          
          <p className="text-xs text-kirana-brown-light leading-relaxed">
            Namaste! Enter your mobile number or email and password to access your account.
          </p>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="p-3.5 bg-red-50 rounded-2xl border border-red-200 flex items-start gap-2.5 text-xs text-red-800 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Sign In Failed</span>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Sign In Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Mobile / Email */}
          <div>
            <label className="block text-xs font-bold text-kirana-brown-dark uppercase tracking-wider mb-1.5">
              Mobile Number or Email *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-kirana-brown-muted" />
              <input
                type="text"
                required
                autoFocus
                placeholder="e.g. 9876543210 or your@email.com"
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                className="w-full bg-kirana-sand/40 focus:bg-white border border-kirana-beige focus:border-kirana-orange rounded-2xl py-2.5 pl-10 pr-4 text-xs sm:text-sm font-medium text-kirana-brown-dark outline-none transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-kirana-brown-dark uppercase tracking-wider mb-1.5">
              Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-kirana-brown-muted" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Enter your account password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !identifier.trim() || !password}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-kirana-orange to-kirana-orange-dark hover:from-kirana-orange-dark hover:to-kirana-orange text-white text-xs sm:text-sm font-black tracking-wide shadow-md shadow-kirana-orange/20 flex items-center justify-center gap-2 transition-all btn-press disabled:opacity-50 mt-4 cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <span>Sign In to Your Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Create Account Link */}
        <div className="p-4 bg-kirana-sand/40 rounded-2xl border border-kirana-beige text-center space-y-2">
          <p className="text-xs text-kirana-brown-dark">
            Don't have an account yet?
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-1.5 font-bold text-xs text-kirana-green hover:text-kirana-green-dark transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create New Customer Account</span>
          </Link>
        </div>

        {/* Security & Admin Footer Notice */}
        <div className="pt-3 border-t border-kirana-sand text-center space-y-3">
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-kirana-brown-muted">
            <ShieldCheck className="w-3.5 h-3.5 text-kirana-green flex-shrink-0" />
            <span>100% Secure Password Authentication</span>
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
