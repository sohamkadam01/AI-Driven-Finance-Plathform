import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      console.log('Checking auth - token exists:', !!token);
      console.log('Checking auth - stored user:', storedUser);
      
      if (token && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          console.log('User restored from localStorage');
        } catch (e) {
          console.error('Failed to parse stored user:', e);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  const login = async (credentials) => {
    try {
      console.log('Attempting login with:', credentials.email);
      const response = await api.post('/auth/login', credentials);
      console.log('Login response:', response.data);
      
      // Handle response format
      let token = null;
      let userData = null;
      
      if (response.data.token) {
        token = response.data.token;
        userData = {
          userId: response.data.userId,
          name: response.data.name,
          email: response.data.email
        };
      } else if (response.data.data && response.data.data.token) {
        token = response.data.data.token;
        userData = response.data.data.user;
      } else {
        // Fallback - assume the whole response is the user object with token
        token = response.data.token || response.data.accessToken;
        userData = {
          userId: response.data.userId || response.data.id,
          name: response.data.name,
          email: response.data.email
        };
      }
      
      if (token && userData) {
        // Clean token
        const cleanToken = token.replace(/^["'](.+(?=["']$))["']$/, '$1');
        
        localStorage.setItem('token', cleanToken);
        localStorage.setItem('user', JSON.stringify(userData));
        
        setUser(userData);
        console.log('Login successful, user set:', userData);
        
        return { success: true, data: response.data };
      } else {
        console.error('Invalid response format - missing token or user data');
        return { success: false, error: 'Invalid server response' };
      }
      
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.response?.data?.error || 'Login failed. Please check your credentials.'
      };
    }
  };

  const register = async (userData) => {
    try {
      console.log('Attempting registration for:', userData.email);
      const response = await api.post('/auth/register', userData);
      console.log('Register response:', response.data);
      
      let token = null;
      let user = null;
      
      if (response.data.token) {
        token = response.data.token;
        user = {
          userId: response.data.userId,
          name: response.data.name,
          email: response.data.email
        };
      } else if (response.data.data && response.data.data.token) {
        token = response.data.data.token;
        user = response.data.data.user;
      }
      
      if (token && user) {
        const cleanToken = token.replace(/^["'](.+(?=["']$))["']$/, '$1');
        
        localStorage.setItem('token', cleanToken);
        localStorage.setItem('user', JSON.stringify(user));
        
        setUser(user);
        console.log('Registration successful, user set:', user);
        
        return { success: true, data: response.data };
      }
      
      return { success: false, error: response.data.message || 'Registration failed' };
      
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed. Please try again.'
      };
    }
  };

  const logout = () => {
    console.log('Logging out...');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user && !!localStorage.getItem('token'),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};