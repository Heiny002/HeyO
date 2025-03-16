import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSignOutAlt, FaUserCircle, FaChevronDown, FaCheck, FaSignInAlt } from 'react-icons/fa';

const Header = () => {
  const { isAuthenticated, user, logout, allUsers, switchUser, isSimulatedUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef(null);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSwitchUser = (userId) => {
    switchUser(userId);
    setShowUserMenu(false);
    
    // If not authenticated, navigate to games after selecting a user
    if (!isAuthenticated) {
      navigate('/games');
    }
  };
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  return (
    <motion.header 
      className="bg-white shadow-md py-4 rainbow-border relative z-10"
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
        
        <div className="flex items-center gap-4">
          {/* User Simulator - Available on all pages */}
          <div className="relative" ref={menuRef}>
            <motion.button
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors shadow-sm"
              onClick={() => setShowUserMenu(!showUserMenu)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex items-center">
                {isAuthenticated ? (
                  <>
                    <img 
                      src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.username}`} 
                      alt="User avatar" 
                      className="w-8 h-8 rounded-full mr-2"
                    />
                    <span>
                      {user?.username}
                      {isSimulatedUser && <span className="text-xs text-gray-500 ml-1">(Simulated)</span>}
                    </span>
                  </>
                ) : (
                  <>
                    <FaUserCircle className="w-6 h-6 mr-2 text-gray-600" />
                    <span className="text-gray-700">Simulate User</span>
                  </>
                )}
              </div>
              <FaChevronDown className={`transform transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
            </motion.button>
            
            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg overflow-hidden z-20"
                >
                  <div className="p-3 bg-gray-50 border-b border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700">Simulating Users</h3>
                    <p className="text-xs text-gray-500">Select a user to simulate</p>
                  </div>
                  <div className="py-1">
                    {allUsers.map((switchableUser) => (
                      <button
                        key={switchableUser.id}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center justify-between"
                        onClick={() => handleSwitchUser(switchableUser.id)}
                      >
                        <div className="flex items-center">
                          <img 
                            src={switchableUser.avatar} 
                            alt={`${switchableUser.username} avatar`} 
                            className="w-6 h-6 rounded-full mr-2"
                          />
                          <span>
                            {switchableUser.username}
                            {switchableUser.isAdmin && <span className="text-xs text-blue-500 ml-1">(Admin)</span>}
                          </span>
                        </div>
                        {user?.id === switchableUser.id && <FaCheck className="text-green-500" />}
                      </button>
                    ))}
                  </div>
                  <div className="p-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
                    <p>All users can log in with password: "password"</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
            
          {isAuthenticated ? (
            <>
              <motion.span 
                className="text-gray-700 hidden md:inline-block"
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
                <FaSignOutAlt /> <span className="hidden md:inline">Logout</span>
              </motion.button>
            </>
          ) : (
            <div className="flex gap-2">
              <Link to="/login">
                <motion.button 
                  className="btn-secondary pop-out flex items-center gap-1"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaSignInAlt className="mr-1" /> Login
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
      </div>
    </motion.header>
  );
};

export default Header; 