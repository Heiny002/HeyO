import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

// Define mock users for simulation
const mockUsers = [
  {
    id: 1,
    username: 'JHarvey',
    email: 'jharvey@example.com',
    avatar: 'https://i.pravatar.cc/150?img=11',
    isAdmin: true
  },
  {
    id: 2,
    username: 'Taylor',
    email: 'taylor@example.com',
    avatar: 'https://i.pravatar.cc/150?img=5',
    isAdmin: false
  },
  {
    id: 3,
    username: 'Alex',
    email: 'alex@example.com',
    avatar: 'https://i.pravatar.cc/150?img=3',
    isAdmin: false
  },
  {
    id: 4,
    username: 'Jordan',
    email: 'jordan@example.com',
    avatar: 'https://i.pravatar.cc/150?img=7',
    isAdmin: false
  }
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSimulatedUser, setIsSimulatedUser] = useState(false);
  const [allUsers] = useState(mockUsers);

  useEffect(() => {
    // Check if user is logged in on app load
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('token');
      const simulatedUserId = localStorage.getItem('simulatedUserId');
      
      if (simulatedUserId) {
        // Load simulated user
        const simulatedUser = mockUsers.find(u => u.id === parseInt(simulatedUserId));
        if (simulatedUser) {
          setUser(simulatedUser);
          setIsAuthenticated(true);
          setIsSimulatedUser(true);
          setIsLoading(false);
          return;
        }
      }
      
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

  // Switch to simulate a different user
  const switchUser = (userId) => {
    const selectedUser = mockUsers.find(u => u.id === userId);
    
    if (selectedUser) {
      setUser(selectedUser);
      setIsAuthenticated(true);
      setIsSimulatedUser(true);
      localStorage.setItem('simulatedUserId', userId.toString());
      
      // Clear any previous error messages when switching users
      setError(null);
      
      // Make sure auth state is updated immediately
      if (!isAuthenticated) {
        // Add a simulated token to maintain consistency with the rest of the app
        localStorage.setItem('token', 'simulated-token-' + Date.now());
      }
    }
  };

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
      // For demo purposes, allow login with any mock user credentials
      const mockUser = mockUsers.find(u => 
        u.email === userData.email || u.username === userData.email
      );
      
      if (mockUser && userData.password === 'password') {
        // Simulate successful login with mock user
        setUser(mockUser);
        setIsAuthenticated(true);
        setIsLoading(false);
        return true;
      }
      
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
    localStorage.removeItem('simulatedUserId');
    delete axios.defaults.headers.common['Authorization'];
    
    setUser(null);
    setIsAuthenticated(false);
    setIsSimulatedUser(false);
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
        isSimulatedUser,
        allUsers,
        login,
        register,
        logout,
        clearError,
        switchUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 