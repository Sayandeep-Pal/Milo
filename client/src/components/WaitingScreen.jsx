import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

const WaitingScreen = ({ onCancel }) => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-dark/80 backdrop-blur-md z-10">
      <div className="relative mb-12">
        {/* Pulsing Sonar Effect */}
        <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping scale-150" />
        <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping scale-200 opacity-50" />
        <motion.div 
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="relative w-32 h-32 bg-primary/20 border-2 border-primary rounded-full flex items-center justify-center"
        >
          <div className="w-4 h-4 bg-primary rounded-full animate-pulse" />
        </motion.div>
      </div>

      <h2 className="text-3xl font-bold mb-2 tracking-tight">Finding a stranger{dots}</h2>
      <p className="text-gray-400 mb-8">Looking for someone with similar interests</p>

      <button 
        onClick={onCancel}
        className="flex items-center gap-2 px-6 py-2 border border-white/10 rounded-full hover:bg-white/5 transition-colors text-gray-400"
      >
        <X size={18} /> Cancel
      </button>
      
      <div className="mt-12 text-sm text-gray-500 font-medium flex items-center gap-2">
        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
        1,542 people chatting right now
      </div>
    </div>
  );
};

export default WaitingScreen;
