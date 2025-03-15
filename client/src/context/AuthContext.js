import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is logged in on app load
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const res = await axios.get('/api/user');
          
          setUser(res.data.user);
          setIsAuthenticated(true);
        } catch (err) {
          // If token is invalid or expired, clear it
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
          setError('Session expired. Please log in again.');
        }
      }
      
      setIsLoading(false);
    };

    checkAuthStatus();
  }, []);

  // Register user
  const register = async (userData) => {
    setError(null);
    setIsLoading(true);
    
    try {
      const res = await axios.post('/api/register', userData);
      
      localStorage.setItem('token', res.data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      
      setUser(res.data.user);
      setIsAuthenticated(true);
      
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred during registration');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Login user
  const login = async (userData) => {
    setError(null);
    setIsLoading(true);
    
    try {
      const res = await axios.post('/api/login', userData);
      
      localStorage.setItem('token', res.data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      
      setUser(res.data.user);
      setIsAuthenticated(true);
      
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    
    setUser(null);
    setIsAuthenticated(false);
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        error,
        login,
        register,
        logout,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 