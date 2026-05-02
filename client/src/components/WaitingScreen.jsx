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
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-dark/90 backdrop-blur-xl z-30">
      <div className="relative mb-16">
        {/* Pulsing Sonar Effect */}
        <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping scale-[2] opacity-20" />
        <div className="absolute inset-0 bg-secondary/10 rounded-full animate-ping scale-[2.5] opacity-10" style={{ animationDelay: '1s' }} />
        
        <motion.div 
          animate={{ 
            scale: [1, 1.05, 1],
            boxShadow: [
              '0 0 20px rgba(0,212,255,0.2)',
              '0 0 40px rgba(0,212,255,0.4)',
              '0 0 20px rgba(0,212,255,0.2)'
            ]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="relative w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/30 rounded-full flex items-center justify-center backdrop-blur-md"
        >
          <div className="w-4 h-4 md:w-6 md:h-6 bg-primary rounded-full animate-pulse shadow-[0_0_15px_rgba(0,212,255,0.8)]" />
          
          {/* Orbital element */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute inset-2 border-t-2 border-primary/40 rounded-full"
          />
        </motion.div>
      </div>

      <div className="text-center px-6">
        <h2 className="text-2xl md:text-4xl font-extrabold mb-3 tracking-tight text-white">
          Finding a stranger<span className="text-primary">{dots}</span>
        </h2>
        <p className="text-gray-400 text-sm md:text-lg mb-10 max-w-xs mx-auto leading-relaxed">
          Looking for someone who matches your interests...
        </p>
      </div>

      <button 
        onClick={onCancel}
        className="flex items-center gap-2 px-8 py-2.5 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all text-gray-300 hover:text-white group"
      >
        <X size={18} className="group-hover:rotate-90 transition-transform" /> 
        <span className="font-medium">Cancel Search</span>
      </button>
      
      {/* <div className="mt-16 text-xs md:text-sm text-gray-500 font-semibold flex items-center gap-2 bg-white/5 px-4 py-1.5 rounded-full border border-white/5">
        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
        1,542 people chatting right now
      </div> */}
    </div>
  );
};

export default WaitingScreen;
