import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  api,
  getAuthToken,
  setAuthToken,
  removeAuthToken,
  getStoredUser,
  setStoredUser,
  removeStoredUser,
} from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = getAuthToken();
      if (token) {
        try {
          const res = await api.getMe();
          if (res.success && res.user) {
            setUser(res.user);
            setStoredUser(res.user);
          }
        } catch (err) {
          console.error('Session validation error:', err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();

    const handleExternalLogout = () => {
      setUser(null);
    };
    window.addEventListener('auth:logout', handleExternalLogout);

    return () => {
      window.removeEventListener('auth:logout', handleExternalLogout);
    };
  }, []);

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    if (res.success && res.token) {
      setAuthToken(res.token);
      setStoredUser(res.user);
      setUser(res.user);
      return res.user;
    }
    throw new Error(res.message || 'Login failed.');
  };

  const signup = async (name, email, password, address) => {
    const res = await api.signup({ name, email, password, address });
    if (res.success && res.token) {
      setAuthToken(res.token);
      setStoredUser(res.user);
      setUser(res.user);
      return res.user;
    }
    throw new Error(res.message || 'Signup failed.');
  };

  const logout = () => {
    removeAuthToken();
    removeStoredUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
