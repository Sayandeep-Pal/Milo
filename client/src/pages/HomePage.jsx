import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { motion } from 'framer-motion';
import { Video, MessageSquare, Shield, Users, Globe } from 'lucide-react';
import Navbar from '../components/Navbar';

const HomePage = () => {
  const navigate = useNavigate();
  const { preferences, setPreferences } = useUser();
  const [onlineCount, setOnlineCount] = useState(1542);
  const [interestsInput, setInterestsInput] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineCount(prev => prev + Math.floor(Math.random() * 10) - 5);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleStart = (mode) => {
    const interests = interestsInput.split(',').map(i => i.trim()).filter(i => i !== '');
    setPreferences({ ...preferences, mode, interests });
    navigate('/chat');
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <Navbar />
      
      {/* Hero Section */}
      <main className="container mx-auto px-6 pt-24 pb-12 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Meet Strangers.<br />Make Connections.
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            The ultimate anonymous video and text chat platform. Modern, fast, and secure. Talk to anyone, anywhere, instantly.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-6 mb-12">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleStart('video')}
            className="btn-neon-primary flex items-center justify-center gap-3 text-xl px-10 py-4"
          >
            <Video size={24} />
            Video Chat
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleStart('text')}
            className="btn-neon-secondary flex items-center justify-center gap-3 text-xl px-10 py-4"
          >
            <MessageSquare size={24} />
            Text Chat
          </motion.button>
        </div>

        {/* Interests Input */}
        <div className="w-full max-w-md mb-16">
          <label className="block text-gray-500 text-sm mb-2 text-left">Add your interests (comma separated)</label>
          <input
            type="text"
            placeholder="e.g. music, gaming, tech"
            value={interestsInput}
            onChange={(e) => setInterestsInput(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors text-white"
          />
        </div>

        {/* Online Stats */}
        <div className="flex items-center gap-2 text-primary font-medium mb-20">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          <span>{onlineCount.toLocaleString()} people online now</span>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
          <FeatureCard 
            icon={<Shield className="text-primary" />}
            title="Safe & Private"
            desc="Anonymous sessions. No login required. Your data is never stored."
          />
          <FeatureCard 
            icon={<Globe className="text-secondary" />}
            title="Global Reach"
            desc="Connect with people from all over the world in an instant."
          />
          <FeatureCard 
            icon={<Users className="text-primary" />}
            title="Interest Matching"
            desc="Find people who share your hobbies and passions."
          />
        </div>
      </main>

      <footer className="mt-auto py-8 border-t border-white/5 text-center text-gray-600 text-sm">
        <p>&copy; 2026 Milo Video Chat. For users 18+. Please chat responsibly.</p>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
  <div className="glass-card p-8 text-left hover:border-primary/30 transition-colors">
    <div className="mb-4">{icon}</div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-gray-500 text-sm">{desc}</p>
  </div>
);

export default HomePage;
