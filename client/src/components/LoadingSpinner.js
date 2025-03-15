import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = () => {
  const spinTransition = {
    repeat: Infinity,
    ease: "linear",
    duration: 1
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <motion.div
        className="w-20 h-20 border-4 border-primary rounded-full border-t-transparent"
        animate={{ rotate: 360 }}
        transition={spinTransition}
      />
      <motion.p 
        className="mt-4 text-xl font-medium text-primary"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        Loading...
      </motion.p>
    </div>
  );
};

export default LoadingSpinner; 