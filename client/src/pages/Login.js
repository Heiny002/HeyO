/**
 * Login Component
 * Handles user authentication and login functionality
 * Provides a form for users to enter their credentials
 * Includes error handling and loading states
 */
import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { FaUser, FaLock, FaExclamationCircle, FaInfoCircle } from 'react-icons/fa';

const Login = () => {
  // Navigation hook for redirecting after successful login
  const navigate = useNavigate();
  
  // Authentication context hook
  const { login, isAuthenticated, error, clearError, allUsers } = useContext(AuthContext);
  
  // Form state
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  
  // UI state
  const [showError, setShowError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // If user is already authenticated, redirect to games page
    if (isAuthenticated) {
      navigate('/games');
    }
    
    // Show error if it exists
    if (error) {
      setShowError(true);
      const timer = setTimeout(() => {
        setShowError(false);
        clearError();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, navigate, error, clearError]);
  
  /**
   * Handles form input changes
   * Updates the form state with new values
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Handles form submission
   * Attempts to log in the user with provided credentials
   * Shows error messages if login fails
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowError(false);
    setIsLoading(true);

    try {
      await login(formData);
      navigate('/games');
    } catch (err) {
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = (username) => {
    setFormData({
      username,
      password: 'password'
    });
  };
  
  return (
    <div className="page-container flex flex-col items-center justify-center">
      {/* Login form container with animation */}
      <motion.div 
        className="w-full max-w-md"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header section with logo and title */}
        <motion.div 
          className="text-center mb-8"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h1 className="text-5xl font-extrabold mb-2 logo-text bg-gradient-animated">Hey-O!</h1>
          <p className="text-xl text-gray-600">Log in to start playing</p>
        </motion.div>
        
        {/* Error message display */}
        {showError && (
          <motion.div 
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <FaExclamationCircle className="mr-2" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Login form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username input */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="input-field mt-1"
              placeholder="Enter your username"
            />
          </div>

          {/* Password input */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="input-field mt-1"
              placeholder="Enter your password"
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full"
          >
            {isLoading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        {/* Registration link */}
        <p className="mt-4 text-center text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary hover:text-primary-dark">
            Register here
          </Link>
        </p>

        {/* Demo Users Section */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center mb-3">
            <FaInfoCircle className="text-primary mr-2" />
            <h3 className="text-lg font-medium text-gray-800">Simulation Accounts</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            You can use any of these accounts with password: <strong>password</strong>
          </p>
          <div className="grid grid-cols-2 gap-2">
            {allUsers.map(demoUser => (
              <motion.button
                key={demoUser.id}
                className="flex items-center p-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                onClick={() => fillDemoCredentials(demoUser.username)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <img 
                  src={demoUser.avatar} 
                  alt={`${demoUser.username} avatar`}
                  className="w-8 h-8 rounded-full mr-2"
                />
                <div className="text-left">
                  <div className="font-medium text-gray-800">{demoUser.username}</div>
                  <div className="text-xs text-gray-500">
                    {demoUser.isAdmin ? 'Admin User' : 'Regular User'}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login; 