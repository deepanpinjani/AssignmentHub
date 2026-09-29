import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('assignmenthub_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('assignmenthub_token') || null;
  });

  const [loading, setLoading] = useState(true);

  // Verify token on initial app load
  useEffect(() => {
    const verifyUser = async () => {
      const storedToken = localStorage.getItem('assignmenthub_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await apiService.getMe();
        if (response.success && response.user) {
          setUser(response.user);
          localStorage.setItem('assignmenthub_user', JSON.stringify(response.user));
        } else {
          logout();
        }
      } catch (err) {
        console.warn('Session verification failed, logging out:', err.message);
        logout();
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
  }, []);

  const login = (authToken, authUser) => {
    setToken(authToken);
    setUser(authUser);
    localStorage.setItem('assignmenthub_token', authToken);
    localStorage.setItem('assignmenthub_user', JSON.stringify(authUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('assignmenthub_token');
    localStorage.removeItem('assignmenthub_user');
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'admin',
    isStudent: user?.role === 'student',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
