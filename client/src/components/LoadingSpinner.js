import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = () => {
  const spinTransition = {
    repeat: Infinity,
    ease: "linear",
    duration: 2
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-animated bg-opacity-5">
      <div className="relative">
        <motion.div
          className="w-24 h-24 border-8 border-red-500 rounded-full border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{ ...spinTransition, duration: 1.5 }}
        />
        <motion.div
          className="w-16 h-16 border-6 border-blue-500 rounded-full border-t-transparent absolute top-4 left-4"
          animate={{ rotate: 360 }}
          transition={{ ...spinTransition, duration: 2, repeatType: "reverse" }}
        />
        <motion.div
          className="w-8 h-8 border-4 border-yellow-500 rounded-full border-t-transparent absolute top-8 left-8"
          animate={{ rotate: 360 }}
          transition={{ ...spinTransition, duration: 1 }}
        />
      </div>
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