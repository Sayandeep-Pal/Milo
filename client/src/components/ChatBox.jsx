import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { useUser } from '../context/UserContext';
import { Send, Smile, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ChatBox = ({ partnerId, isConnected }) => {
  const socket = useSocket();
  const { userId } = useUser();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isPartnerTyping]);

  useEffect(() => {
    if (!socket) return;

    socket.on('receive_message', (data) => {
      setMessages(prev => [...prev, { ...data, sender: 'stranger' }]);
    });

    socket.on('stranger_typing', ({ isTyping }) => {
      setIsPartnerTyping(isTyping);
    });

    // Reset messages when a new partner connects
    if (partnerId) {
      setMessages([]);
      setIsPartnerTyping(false);
    }

    return () => {
      socket.off('receive_message');
      socket.off('stranger_typing');
    };
  }, [socket, partnerId]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || !isConnected) return;

    const messageData = {
      text: input,
      senderId: userId,
      timestamp: new Date().toISOString()
    };

    socket.emit('send_message', messageData);
    setMessages(prev => [...prev, { ...messageData, sender: 'you' }]);
    setInput('');
    
    // Stop typing indicator
    socket.emit('typing', { isTyping: false });
  };

  const handleTyping = (e) => {
    setInput(e.target.value);
    
    if (!socket || !isConnected) return;

    socket.emit('typing', { isTyping: true });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing', { isTyping: false });
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full bg-dark/20 md:bg-transparent">
      {/* Header */}
      <div className="p-3 md:p-4 border-b border-white/5 flex items-center justify-between bg-white/5 md:bg-transparent backdrop-blur-md md:backdrop-blur-none">
        <h3 className="font-bold text-sm md:text-base flex items-center gap-2">
          Chat with Stranger
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'}`} />
        </h3>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4 scrollbar-hide">
        {!isConnected && messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 text-xs italic text-center px-4">
            <MessageSquare size={32} className="mb-2 opacity-20" />
            Waiting for someone to connect...
          </div>
        )}
        
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={`flex ${msg.sender === 'you' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] md:max-w-[80%] px-4 py-2.5 rounded-2xl shadow-sm ${
              msg.sender === 'you' 
                ? 'bg-gradient-to-br from-primary to-primary/80 text-dark font-semibold rounded-tr-none' 
                : 'bg-white/10 text-white rounded-tl-none border border-white/5 backdrop-blur-sm'
            }`}>
              <p className="text-sm md:text-base leading-relaxed">{msg.text}</p>
            </div>
          </motion.div>
        ))}
        
        <AnimatePresence>
          {isPartnerTyping && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex justify-start"
            >
              <div className="bg-white/5 text-gray-400 px-4 py-2 rounded-2xl flex gap-1 items-center border border-white/5">
                <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 md:p-4 border-t border-white/5 bg-white/5 md:bg-transparent backdrop-blur-md md:backdrop-blur-none">
        <form onSubmit={handleSend} className="flex gap-2 items-center">
          <button type="button" className="p-2 text-gray-500 hover:text-white transition-colors hidden sm:block">
            <Smile size={20} />
          </button>
          <input
            type="text"
            placeholder={isConnected ? "Type a message..." : "Connecting..."}
            value={input}
            onChange={handleTyping}
            disabled={!isConnected}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary/50 transition-all disabled:opacity-50 text-sm md:text-base"
          />
          <button 
            type="submit"
            disabled={!input.trim() || !isConnected}
            className="p-2.5 bg-primary text-dark rounded-xl hover:bg-white transition-all disabled:opacity-50 disabled:grayscale shadow-lg active:scale-95 flex items-center justify-center"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatBox;
