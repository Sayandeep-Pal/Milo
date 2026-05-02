import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const Toast = () => {
  const [toasts, setToasts] = useState([]);

  // Mock global toast function (usually you'd use a context or a custom hook)
  window.showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  return (
    <div className="fixed top-6 right-6 z-[200] space-y-4">
      <AnimatePresence>
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-lg border ${
              toast.type === 'success' ? 'bg-green-500/20 border-green-500/50 text-green-500' :
              toast.type === 'error' ? 'bg-red-500/20 border-red-500/50 text-red-500' :
              'bg-primary/20 border-primary/50 text-primary'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle size={20} /> :
             toast.type === 'error' ? <AlertCircle size={20} /> :
             <Info size={20} />}
            <span className="font-medium">{toast.message}</span>
            <button onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}>
              <X size={16} className="ml-2 opacity-50 hover:opacity-100" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default Toast;
