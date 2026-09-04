import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Store, User, Lock, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const SignIn = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const from = location.state?.from?.pathname || '/';

  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!email || !password) return;

    try {
      setLoading(true);
      const loggedUser = await login(email.trim(), password, role);
      if (loggedUser.role === 'admin' || loggedUser.is_admin) {
        navigate('/admin');
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      console.error('Sign In error:', err);
      const msg = err.response?.data?.detail || 'Invalid email address or password. Please try again.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-kirana-beige shadow-kirana space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className={`w-12 h-12 rounded-2xl ${role === 'admin' ? 'bg-kirana-brown-dark text-kirana-sand' : 'bg-kirana-orange text-white'} flex items-center justify-center mx-auto shadow-md font-black transition-colors`}>
            {role === 'admin' ? <ShieldCheck className="w-6 h-6" /> : <Store className="w-6 h-6" />}
          </div>
          <h1 className="font-outfit font-black text-2xl text-kirana-brown-dark">
            {role === 'admin' ? 'Admin Sign In' : 'Customer Sign In'}
          </h1>
          <p className="text-xs text-kirana-brown-light">
            {role === 'admin' 
              ? 'Access store management, inventory, orders & settings' 
              : 'Sign in to access your cart, place orders, and track deliveries'}
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
        <form onSubmit={handleSignInSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-kirana-brown-dark uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-3.5 text-kirana-brown-muted" />
              <input
                type="email"
                required
                placeholder={role === 'admin' ? 'xyz@gmail.com' : 'yourname@gmail.com'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-kirana-sand/40 focus:bg-white border border-kirana-beige focus:border-kirana-orange rounded-2xl py-2.5 pl-10 pr-4 text-xs text-kirana-brown-dark outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-kirana-brown-dark uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-kirana-brown-muted" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-kirana-sand/40 focus:bg-white border border-kirana-beige focus:border-kirana-orange rounded-2xl py-2.5 pl-10 pr-4 text-xs text-kirana-brown-dark outline-none transition-all"
              />
            </div>
          </div>

          {/* LOGIN AS DROPDOWN (Immediately after Password) */}
          <div>
            <label className="block text-xs font-bold text-kirana-brown-dark uppercase tracking-wider mb-1.5">
              Login As
            </label>
            <div className="relative">
              <ShieldCheck className="w-4 h-4 absolute left-3.5 top-3.5 text-kirana-brown-muted" />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-kirana-sand/40 focus:bg-white border border-kirana-beige focus:border-kirana-orange rounded-2xl py-2.5 pl-10 pr-4 text-xs text-kirana-brown-dark font-semibold outline-none transition-all cursor-pointer"
              >
                <option value="customer">Customer / User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-kirana-brown-light font-medium">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded text-kirana-orange focus:ring-kirana-orange"
              />
              <span>Remember Me</span>
            </label>
            <span className="text-kirana-orange font-semibold hover:underline cursor-pointer">
              Forgot Password?
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 px-6 rounded-2xl text-white text-xs sm:text-sm font-black tracking-wide shadow-md flex items-center justify-center gap-2 transition-all btn-press disabled:opacity-50 ${
              role === 'admin'
                ? 'bg-gradient-to-r from-kirana-brown-dark to-black hover:opacity-95 shadow-kirana-brown-dark/30'
                : 'bg-gradient-to-r from-kirana-orange to-kirana-orange-dark hover:from-kirana-orange-dark hover:to-kirana-orange shadow-kirana-orange/30'
            }`}
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>{role === 'admin' ? 'Sign In as Admin' : 'Sign In to Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        {role !== 'admin' && (
          <div className="text-center pt-2 border-t border-kirana-sand text-xs text-kirana-brown-light">
            Don't have an account yet?{' '}
            <Link to="/signup" className="font-bold text-kirana-orange hover:underline">
              Create Account
            </Link>
          </div>
        )}

      </div>
    </div>
  );
};

export default SignIn;
