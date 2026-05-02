import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

const FilterModal = ({ isOpen, onClose, preferences, setPreferences }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md glass-card p-6"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Chat Filters</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm text-gray-400 mb-3">Chat Mode</label>
            <div className="grid grid-cols-3 gap-3">
              {['video', 'text', 'both'].map(m => (
                <button
                  key={m}
                  onClick={() => setPreferences({ ...preferences, mode: m })}
                  className={`py-2 rounded-lg border capitalize transition-all ${
                    preferences.mode === m 
                      ? 'bg-primary/20 border-primary text-primary' 
                      : 'border-white/10 text-gray-400 hover:border-white/30'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-3">Interests</label>
            <input 
              type="text"
              placeholder="e.g. music, tech, travel"
              defaultValue={preferences.interests.join(', ')}
              onBlur={(e) => {
                const interests = e.target.value.split(',').map(i => i.trim()).filter(i => i !== '');
                setPreferences({ ...preferences, interests });
              }}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary text-white"
            />
          </div>
        </div>

        <button 
          onClick={onClose}
          className="w-full mt-8 py-3 bg-primary text-dark rounded-xl font-bold hover:bg-white transition-colors"
        >
          Apply Filters
        </button>
      </motion.div>
    </div>
  );
};

export default FilterModal;
