import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, Lock, Home, KeyRound, UserCheck, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AccessDenied = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full bg-white rounded-3xl p-8 sm:p-12 border-2 border-red-200 shadow-2xl text-center space-y-6 relative overflow-hidden">
        
        {/* Security Alert Header */}
        <div className="relative mx-auto w-20 h-20 rounded-3xl bg-red-100 border border-red-300 flex items-center justify-center text-red-600 shadow-inner">
          <ShieldAlert className="w-10 h-10 animate-bounce" />
          <div className="absolute -bottom-2 -right-2 bg-kirana-brown-dark text-white rounded-full p-1.5 shadow">
            <Lock className="w-4 h-4 text-kirana-orange" />
          </div>
        </div>

        <div>
          <span className="inline-block bg-red-100 text-red-800 text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-red-200">
            HTTP 403 • Access Forbidden
          </span>
          <h1 className="font-outfit font-black text-2xl sm:text-3xl text-kirana-brown-dark mt-3">
            Administrator Access Restricted
          </h1>
          <p className="text-xs sm:text-sm text-kirana-brown-light max-w-md mx-auto mt-2 leading-relaxed">
            You do not have store administrator permissions to access this management dashboard or API.
          </p>
        </div>

        {/* Current status display */}
        <div className="bg-kirana-sand/60 p-4 rounded-2xl border border-kirana-beige text-left text-xs space-y-1.5">
          <div className="flex justify-between items-center text-kirana-brown-muted">
            <span>Current Session:</span>
            <span className="font-bold text-kirana-brown-dark">
              {isAuthenticated ? user?.email : 'Anonymous / Guest'}
            </span>
          </div>
          <div className="flex justify-between items-center text-kirana-brown-muted">
            <span>Role Assigned:</span>
            <span className="font-extrabold uppercase text-amber-800 bg-amber-100 px-2 py-0.5 rounded text-[10px]">
              {user?.role || 'None'}
            </span>
          </div>
        </div>

        {/* Navigation Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to="/"
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-kirana-orange hover:bg-kirana-orange-dark text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>

          <Link
            to="/admin-login"
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-kirana-brown-dark hover:bg-black text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
          >
            <KeyRound className="w-4 h-4 text-kirana-orange" />
            <span>Admin Sign In</span>
          </Link>

          {isAuthenticated && (
            <Link
              to="/profile"
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-kirana-sand hover:bg-kirana-beige text-kirana-brown-dark text-xs font-bold transition-all"
            >
              My Profile
            </Link>
          )}
        </div>

        <p className="text-[10px] text-kirana-brown-muted pt-2 border-t border-kirana-sand">
          Upendra General Stores Security System • All unauthorized attempts are logged
        </p>

      </div>
    </div>
  );
};

export default AccessDenied;
