import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthService } from '../api/services';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('upendra_user');
    const token = localStorage.getItem('upendra_access_token');
    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('upendra_user');
        localStorage.removeItem('upendra_access_token');
        localStorage.removeItem('upendra_refresh_token');
      }
    }
    setLoading(false);
  }, []);

  // Customer & User Password-Based Login
  const login = async (identifier, password) => {
    try {
      const res = await AuthService.login(identifier, password);
      const { tokens, user: userData, message } = res;

      if (tokens?.access) {
        localStorage.setItem('upendra_access_token', tokens.access);
        localStorage.setItem('upendra_refresh_token', tokens.refresh);
        localStorage.setItem('upendra_user', JSON.stringify(userData));
        setUser(userData);
      }

      toast.success(message || `Namaste, ${userData.full_name}! Login successful.`);
      return userData;
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.detail || 'Invalid mobile number/email or password.';
      toast.error(msg);
      throw err;
    }
  };

  // Customer Password-Based Registration
  const register = async (userData) => {
    try {
      const res = await AuthService.register(userData);
      const { tokens, user: userDataProfile, message } = res;

      if (tokens?.access) {
        localStorage.setItem('upendra_access_token', tokens.access);
        localStorage.setItem('upendra_refresh_token', tokens.refresh);
        localStorage.setItem('upendra_user', JSON.stringify(userDataProfile));
        setUser(userDataProfile);
      }

      toast.success(message || `Welcome to Upendra General Stores, ${userDataProfile.full_name}!`);
      return userDataProfile;
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.detail || 'Registration failed. Please check details.';
      toast.error(msg);
      throw err;
    }
  };

  // Customer Step 1: Send OTP (Legacy fallback)
  const sendOtp = async (mobile, fullName = '') => {
    try {
      const res = await AuthService.sendOtp(mobile, fullName);
      if (res.message) {
        toast.success(res.message);
      }
      return res;
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.detail || 'Failed to send OTP. Please check your mobile number.';
      toast.error(msg);
      throw err;
    }
  };

  // Customer Step 2: Verify OTP (Legacy fallback)
  const verifyOtp = async (sessionToken, mobile, otp, fullName = '') => {
    try {
      const res = await AuthService.verifyOtp(sessionToken, mobile, otp, fullName);
      const { tokens, user: userData, message } = res;

      if (tokens?.access) {
        localStorage.setItem('upendra_access_token', tokens.access);
        localStorage.setItem('upendra_refresh_token', tokens.refresh);
        localStorage.setItem('upendra_user', JSON.stringify(userData));
        setUser(userData);
      }

      toast.success(message || `Welcome to Upendra General Stores!`);
      return userData;
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.detail || 'Invalid or expired OTP. Please try again.';
      toast.error(msg);
      throw err;
    }
  };

  // Customer Resend OTP (Legacy fallback)
  const resendOtp = async (sessionToken, mobile) => {
    try {
      const res = await AuthService.resendOtp(sessionToken, mobile);
      toast.success(res.message || 'New OTP sent to your mobile via SMS.');
      return res;
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.detail || 'Could not resend OTP. Please wait before trying again.';
      toast.error(msg);
      throw err;
    }
  };

  // Dedicated Admin Login
  const adminLogin = async (emailOrMobile, password) => {
    try {
      const res = await AuthService.adminLogin(emailOrMobile, password);
      const { tokens, user: userData, message } = res;

      if (tokens?.access) {
        localStorage.setItem('upendra_access_token', tokens.access);
        localStorage.setItem('upendra_refresh_token', tokens.refresh);
        localStorage.setItem('upendra_user', JSON.stringify(userData));
        setUser(userData);
      }

      toast.success(message || `Welcome to Admin Suite, ${userData.full_name}!`);
      return userData;
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.message || 'Invalid administrator credentials or unauthorized account.';
      toast.error(msg);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('upendra_access_token');
    localStorage.removeItem('upendra_refresh_token');
    localStorage.removeItem('upendra_user');
    setUser(null);
    toast.success('You have been logged out.');
  };

  const updateUserProfile = async (updatedData) => {
    try {
      const res = await AuthService.updateProfile(updatedData);
      const newUser = { ...user, ...res };
      setUser(newUser);
      localStorage.setItem('upendra_user', JSON.stringify(newUser));
      toast.success('Profile updated successfully!');
      return newUser;
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.detail || 'Failed to update profile.';
      toast.error(msg);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isAdmin: !!(user?.role === 'admin' || user?.is_admin),
        login,
        register,
        sendOtp,
        verifyOtp,
        resendOtp,
        adminLogin,
        logout,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
