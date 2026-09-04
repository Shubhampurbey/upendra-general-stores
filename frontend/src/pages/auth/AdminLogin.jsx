import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, Lock, User, ArrowRight, KeyRound, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const AdminLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const from = location.state?.from?.pathname || '/admin/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!email || !password) return;

    try {
      setLoading(true);
      const loggedUser = await login(email.trim(), password, 'admin');
      if (loggedUser.role === 'admin' || loggedUser.is_admin) {
        navigate(from, { replace: true });
      } else {
        setErrorMessage('Access Denied: You do not possess administrator privileges.');
        toast.error('Access Denied: You do not possess administrator privileges.');
      }
    } catch (err) {
      console.error('Admin login error:', err);
      const msg = err.response?.data?.detail || 'Invalid admin credentials.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-kirana-sand/40 to-kirana-cream">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border-2 border-kirana-brown-dark/20 shadow-2xl space-y-6 relative overflow-hidden">
        
        {/* Top security accent stripe */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-kirana-orange via-amber-600 to-kirana-brown-dark"></div>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-kirana-brown-dark text-kirana-orange flex items-center justify-center mx-auto shadow-lg font-black">
            <KeyRound className="w-7 h-7" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-[10px] font-extrabold uppercase tracking-wider border border-amber-300">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
            <span>Store Admin Portal • Restricted</span>
          </div>
          <h1 className="font-outfit font-black text-2xl sm:text-3xl text-kirana-brown-dark">
            Admin Sign In
          </h1>
          <p className="text-xs text-kirana-brown-light">
            Authorized management portal for inventory, orders & store administration
          </p>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="p-3.5 bg-red-50 rounded-2xl border border-red-200 flex items-start gap-2.5 text-xs text-red-800 animate-in fade-in">
            <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Authorization Rejected</span>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-kirana-brown-dark uppercase tracking-wider mb-1.5">
              Admin Email Address
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-3.5 text-kirana-brown-muted" />
              <input
                type="email"
                required
                placeholder="xyz@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-kirana-sand/40 focus:bg-white border border-kirana-beige focus:border-kirana-orange rounded-2xl py-2.5 pl-10 pr-4 text-xs text-kirana-brown-dark outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-kirana-brown-dark uppercase tracking-wider mb-1.5">
              Admin Master Password
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-kirana-brown-dark to-black hover:from-black hover:to-kirana-brown-dark text-white text-xs sm:text-sm font-black tracking-wide shadow-xl flex items-center justify-center gap-2 transition-all btn-press disabled:opacity-50"
          >
            {loading ? (
              <span>Authenticating Administrator...</span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-kirana-orange" />
                <span>Open Admin Suite</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Security Warning & Customer Back Link */}
        <div className="pt-3 border-t border-kirana-sand text-center space-y-2 text-xs">
          <p className="text-[11px] text-kirana-brown-muted">
            Are you a grocery customer?{' '}
            <Link to="/signin" className="font-bold text-kirana-orange hover:underline">
              Customer Sign In Here
            </Link>
          </p>
          <div className="p-2 bg-kirana-sand/40 rounded-xl text-[10px] text-kirana-brown-muted flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-kirana-green flex-shrink-0" />
            <span>Protected by Strict Role Security & Session Tokens</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
