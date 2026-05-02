import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useSocket } from '../context/SocketContext';
import { motion } from 'framer-motion';
import { Video, MessageSquare } from 'lucide-react';
import Navbar from '../components/Navbar';

const HomePage = () => {
  const navigate = useNavigate();
  const socket = useSocket();
  const { userId, preferences, setPreferences } = useUser();
  const [onlineCount, setOnlineCount] = useState(0);
  const [interestsInput, setInterestsInput] = useState('');

  useEffect(() => {
    if (!socket) return;

    socket.emit('get_online_count');
    socket.on('online_count', (count) => {
      setOnlineCount(count);
    });

    return () => {
      socket.off('online_count');
    };
  }, [socket]);

  const handleStart = (mode) => {
    const interests = interestsInput.split(',').map(i => i.trim()).filter(i => i !== '');
    setPreferences({ ...preferences, mode, interests });
    navigate('/chat');
  };

  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <main className="flex-1 container mx-auto px-6 pt-32 md:pt-40 pb-20 flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl"
        >
          {/* <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            {onlineCount.toLocaleString()} Users Online
          </div> */}

          <h1 className="text-5xl md:text-8xl font-bold mb-8 tracking-tighter leading-[1] md:leading-[0.9]">
            Connect with<br />
            <span className="text-gradient">the world.</span>
          </h1>
          <p className="text-zinc-400 text-lg md:text-xl max-w-xl mx-auto mb-12 font-medium leading-relaxed">
            The minimal anonymous video platform. Talk to anyone, anywhere, with total privacy.
          </p>
        </motion.div>

        {/* Interests & Actions */}
        <div className="w-full max-w-lg mb-12">
          <div className="glass-card p-2 flex flex-col md:flex-row gap-2 mb-6">
            <input
              type="text"
              placeholder="Add your interests (gaming, music...)"
              value={interestsInput}
              onChange={(e) => setInterestsInput(e.target.value)}
              className="flex-1 bg-transparent px-4 py-3 focus:outline-none text-white placeholder:text-zinc-600 text-sm md:text-base font-medium"
            />
            <div className="flex gap-2">
              <button
                onClick={() => handleStart('video')}
                className="btn-primary flex-1 md:flex-none flex items-center justify-center gap-2 text-sm whitespace-nowrap"
              >
                <Video size={18} />
                Video Chat
              </button>
              {/* <button
                onClick={() => handleStart('text')}
                className="btn-secondary flex-1 md:flex-none flex items-center justify-center gap-2 text-sm whitespace-nowrap"
              >
                <MessageSquare size={18} />
                Text Chat
              </button> */}
            </div>
          </div>
          <p className="text-zinc-500 text-xs">No registration. No logs. Just connection.</p>
        </div>

        {/* Minimal Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl">
          <MinimalCard title="Secure" desc="Peer-to-peer connection with WebRTC" />
          <MinimalCard title="Anonymous" desc="No data is stored on our servers" />
          <MinimalCard title="Interests" desc="Match with people like you" />
        </div>
      </main>

      <footer className="py-2 text-center">
        <p className="text-zinc-600 text-xs font-medium uppercase tracking-widest">Milo &copy; 2026</p>
      </footer>
    </div>
  );
};

const MinimalCard = ({ title, desc }) => (
  <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] text-left hover:border-white/10 transition-colors">
    <h3 className="text-sm font-bold text-white mb-1">{title}</h3>
    <p className="text-zinc-500 text-xs leading-relaxed">{desc}</p>
  </div>
);

export default HomePage;
