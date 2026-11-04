import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, setAuthToken, getAuthToken } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCurrentUser = async () => {
    const token = getAuthToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const data = await api.getMe();
      setUser(data.user);
    } catch (err) {
      console.error('Failed to load authenticated user profile:', err);
      setAuthToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();

    const handleAuthExpired = () => {
      setUser(null);
    };
    window.addEventListener('cu-auth-expired', handleAuthExpired);
    return () => window.removeEventListener('cu-auth-expired', handleAuthExpired);
  }, []);

  const login = async (identifier, password) => {
    setError(null);
    try {
      const data = await api.login(identifier, password);
      setAuthToken(data.access_token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      setError(err.message || 'Login failed. Please verify your credentials.');
      throw err;
    }
  };

  const register = async (formData) => {
    setError(null);
    try {
      const data = await api.register(formData);
      setAuthToken(data.access_token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      setError(err.message || 'Registration failed.');
      throw err;
    }
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    try {
      const data = await api.updateProfile(profileData);
      setUser(data.user);
      return data.user;
    } catch (err) {
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      login,
      register,
      logout,
      updateProfile,
      refreshUser: fetchCurrentUser,
      isStudent: user?.role === 'STUDENT',
      isAdmin: user?.role === 'ADMIN',
      isFaculty: user?.role === 'FACULTY'
    }}>
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
