import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Store, User, Lock, Phone, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

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

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (formData.password !== formData.confirm_password) {
      setErrorMessage('Passwords do not match. Please verify your password.');
      toast.error('Passwords do not match. Please verify your password.');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      toast.error('Password must be at least 6 characters long.');
      return;
    }

    const cleanMobile = formData.mobile.replace(/[^0-9]/g, '');
    if (cleanMobile.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      toast.error('Please enter a valid 10-digit mobile number.');
      return;
    }

    try {
      setLoading(true);
      await register({
        ...formData,
        mobile: cleanMobile,
        email: formData.email.trim().toLowerCase(),
      });
      navigate('/');
    } catch (err) {
      console.error('Registration error:', err);
      const errData = err.response?.data;
      let msg = 'Registration failed. Please check your inputs.';
      if (errData) {
        if (typeof errData === 'object') {
          msg = Object.entries(errData)
            .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(' ') : val}`)
            .join(' | ');
        } else if (typeof errData === 'string') {
          msg = errData;
        }
      }
      setErrorMessage(msg);
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
              <span className="font-bold block">Registration Incomplete</span>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Sign Up Form */}
        <form onSubmit={handleSubmitForm} className="space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  className="w-full bg-kirana-sand/40 focus:bg-white border border-kirana-beige focus:border-kirana-orange rounded-2xl py-2.5 pl-10 pr-4 text-xs text-kirana-brown-dark outline-none transition-all"
                />
              </div>
            </div>

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
                  className="w-full bg-kirana-sand/40 focus:bg-white border border-kirana-beige focus:border-kirana-orange rounded-2xl py-2.5 pl-10 pr-4 text-xs text-kirana-brown-dark outline-none transition-all"
                />
              </div>
            </div>
          </div>

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
              className="w-full bg-kirana-sand/40 focus:bg-white border border-kirana-beige focus:border-kirana-orange rounded-2xl py-2.5 px-4 text-xs text-kirana-brown-dark outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  className="w-full bg-kirana-sand/40 focus:bg-white border border-kirana-beige focus:border-kirana-orange rounded-2xl py-2.5 pl-10 pr-4 text-xs text-kirana-brown-dark outline-none transition-all"
                />
              </div>
            </div>

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
                  className="w-full bg-kirana-sand/40 focus:bg-white border border-kirana-beige focus:border-kirana-orange rounded-2xl py-2.5 pl-10 pr-4 text-xs text-kirana-brown-dark outline-none transition-all"
                />
              </div>
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
