import React from 'react';
import { motion } from 'framer-motion';

/**
 * LoadingSpinner Component
 * A visually appealing loading indicator with nested animated circles
 * Uses Framer Motion for smooth animations and transitions
 */
const LoadingSpinner = () => {
  // Animation configuration for the spinning circles
  const spinTransition = {
    repeat: Infinity,
    ease: "linear",
    duration: 2
  };
  
  return (
    // Main container with gradient background
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-animated bg-opacity-5">
      {/* Container for the nested spinning circles */}
      <div className="relative">
        {/* Outer spinning circle - Red */}
        <motion.div
          className="w-24 h-24 border-8 border-red-500 rounded-full border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{ ...spinTransition, duration: 1.5 }}
        />
        {/* Middle spinning circle - Blue */}
        <motion.div
          className="w-16 h-16 border-6 border-blue-500 rounded-full border-t-transparent absolute top-4 left-4"
          animate={{ rotate: 360 }}
          transition={{ ...spinTransition, duration: 2, repeatType: "reverse" }}
        />
        {/* Inner spinning circle - Yellow */}
        <motion.div
          className="w-8 h-8 border-4 border-yellow-500 rounded-full border-t-transparent absolute top-8 left-8"
          animate={{ rotate: 360 }}
          transition={{ ...spinTransition, duration: 1 }}
        />
      </div>
      {/* Loading text with pulsing animation */}
      <motion.p 
        className="mt-6 text-2xl font-bold bg-gradient-text"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        Loading...
      </motion.p>
    </div>
  );
};

export default LoadingSpinner; 