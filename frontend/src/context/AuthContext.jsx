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

  const login = async (email, password, role = 'customer') => {
    try {
      const res = await AuthService.loginInit(email, password, role);
      const { tokens, user: userData, message } = res;

      if (tokens?.access) {
        localStorage.setItem('upendra_access_token', tokens.access);
        localStorage.setItem('upendra_refresh_token', tokens.refresh);
        localStorage.setItem('upendra_user', JSON.stringify(userData));
        setUser(userData);
      }

      if (userData?.role === 'admin' || userData?.is_admin) {
        toast.success(message || `Welcome to Admin Suite, ${userData.full_name}!`);
      } else {
        toast.success(message || `Namaste, ${userData.full_name}! Welcome.`);
      }
      return userData;
    } catch (err) {
      const msg = err.response?.data?.detail || 'Invalid credentials or unauthorized account. Please check email and password.';
      toast.error(msg);
      throw err;
    }
  };

  const loginInit = login;

  const register = async (userData) => {
    try {
      const res = await AuthService.registerInit(userData);
      const { tokens, user: newUser, message } = res;

      if (tokens?.access) {
        localStorage.setItem('upendra_access_token', tokens.access);
        localStorage.setItem('upendra_refresh_token', tokens.refresh);
        localStorage.setItem('upendra_user', JSON.stringify(newUser));
        setUser(newUser);
      }

      toast.success(message || 'Account created successfully! Welcome to Upendra General Stores.');
      return newUser;
    } catch (err) {
      const errData = err.response?.data;
      let msg = 'Registration failed. Please check your inputs.';
      if (errData) {
        if (typeof errData === 'object') {
          if (errData.message && typeof errData.message === 'string') {
            msg = errData.message;
          } else if (errData.detail && typeof errData.detail === 'string') {
            msg = errData.detail;
          } else {
            msg = Object.entries(errData)
              .filter(([k]) => k !== 'errors' && k !== 'success')
              .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(' ') : val}`)
              .join(' | ');
          }
        } else if (typeof errData === 'string' && !errData.includes('<!DOCTYPE')) {
          msg = errData;
        }
      }
      toast.error(msg);
      throw err;
    }
  };


  const registerInit = register;

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
      toast.error('Failed to update profile');
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
        loginInit,
        register,
        registerInit,
        logout,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

