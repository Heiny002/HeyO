import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { FaSignOutAlt } from 'react-icons/fa';

const Header = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <motion.header 
      className="bg-white shadow-md py-4 rainbow-border"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to={isAuthenticated ? '/games' : '/login'}>
          <motion.h1 
            className="text-3xl font-heading font-extrabold bg-gradient-text"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Hey-O!
          </motion.h1>
        </Link>
        
        {isAuthenticated ? (
          <div className="flex items-center gap-4">
            <motion.span 
              className="text-gray-700"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Welcome, <span className="font-bold text-primary">{user?.username}</span>
            </motion.span>
            
            <motion.button
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white hover:bg-primary-dark transition-colors shadow-md"
              onClick={handleLogout}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaSignOutAlt /> Logout
            </motion.button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Link to="/login">
              <motion.button 
                className="btn-secondary pop-out"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Login
              </motion.button>
            </Link>
            <Link to="/register">
              <motion.button 
                className="btn-primary pop-out"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Register
              </motion.button>
            </Link>
          </div>
        )}
      </div>
    </motion.header>
  );
};

export default Header; 