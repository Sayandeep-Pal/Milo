import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { useUser } from '../context/UserContext';
import { Send, Smile } from 'lucide-react';
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
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <h3 className="font-bold flex items-center gap-2">
          Chat with Stranger
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
        </h3>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {!isConnected && messages.length === 0 && (
          <div className="h-full flex items-center justify-center text-gray-500 text-sm italic">
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
            <div className={`max-w-[80%] px-4 py-2 rounded-2xl ${
              msg.sender === 'you' 
                ? 'bg-primary text-dark font-medium rounded-tr-none' 
                : 'bg-white/10 text-white rounded-tl-none border border-white/5'
            }`}>
              {msg.text}
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
              <div className="bg-white/5 text-gray-400 px-4 py-2 rounded-2xl flex gap-1">
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
      <div className="p-4 border-t border-white/10">
        <form onSubmit={handleSend} className="flex gap-2">
          <button type="button" className="p-2 text-gray-400 hover:text-white transition-colors">
            <Smile size={20} />
          </button>
          <input
            type="text"
            placeholder={isConnected ? "Type a message..." : "Waiting to connect..."}
            value={input}
            onChange={handleTyping}
            disabled={!isConnected}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
          />
          <button 
            type="submit"
            disabled={!input.trim() || !isConnected}
            className="p-2 bg-primary text-dark rounded-xl hover:bg-white transition-all disabled:opacity-50 disabled:grayscale"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatBox;
