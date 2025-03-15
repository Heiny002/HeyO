import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { FaUser, FaLock, FaExclamationCircle } from 'react-icons/fa';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showError, setShowError] = useState(false);
  
  const { login, isAuthenticated, error, clearError } = useContext(AuthContext);
  const navigate = useNavigate();
  
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
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const success = await login(formData);
    if (success) {
      navigate('/games');
    }
  };
  
  return (
    <div className="page-container flex flex-col items-center justify-center">
      <motion.div 
        className="w-full max-w-md"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="text-center mb-8"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h1 className="text-5xl font-extrabold mb-2 logo-text bg-gradient-animated">Hey-O!</h1>
          <p className="text-xl text-gray-600">Log in to start playing</p>
        </motion.div>
        
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
        
        <div className="bg-white shadow-lg rounded-2xl p-8">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="username">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="text-gray-400" />
                </div>
                <input
                  type="text"
                  id="username"
                  name="username"
                  className="input-field pl-10"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 mb-2" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-gray-400" />
                </div>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="input-field pl-10"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <motion.button
              type="submit"
              className="w-full btn-primary mb-4"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              Log In
            </motion.button>
            
            <div className="text-center">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <Link to="/register" className="text-primary font-medium hover:underline">
                  Register
                </Link>
              </p>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Login; 