import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useUser } from '../context/UserContext';
import Navbar from '../components/Navbar';
import VideoRoom from '../components/VideoRoom';
import ChatBox from '../components/ChatBox';
import WaitingScreen from '../components/WaitingScreen';
import ReportModal from '../components/ReportModal';
import { SkipForward, X, Flag, MessageCircle } from 'lucide-react';
import axios from 'axios';

const ChatPage = () => {
  const socket = useSocket();
  const { userId, preferences } = useUser();
  const navigate = useNavigate();

  const [status, setStatus] = useState('WAITING'); // WAITING, CONNECTED, DISCONNECTED
  const [roomData, setRoomData] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [showChatMobile, setShowChatMobile] = useState(false);

  const findMatch = useCallback(() => {
    if (!socket) return;
    setStatus('WAITING');
    setRoomData(null);
    socket.emit('find_match', { userId, interests: preferences.interests });
  }, [socket, userId, preferences.interests]);

  useEffect(() => {
    if (!socket) return;

    socket.on('match_found', ({ roomId, partnerId, initiator }) => {
      console.log('Match found:', roomId, partnerId, initiator);
      setRoomData({ roomId, partnerId, initiator });
      setStatus('CONNECTED');
    });

    socket.on('stranger_left', () => {
      setStatus('DISCONNECTED');
    });

    findMatch();

    return () => {
      socket.off('match_found');
      socket.off('stranger_left');
    };
  }, [socket, findMatch]);

  const handleNext = () => {
    socket.emit('next_stranger');
    findMatch();
  };

  const handleStop = () => {
    socket.emit('next_stranger');
    navigate('/');
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-dark">
      <Navbar />
      
      <div className="flex-1 flex flex-col md:flex-row pt-20 px-4 pb-4 gap-4">
        {/* Left Panel: Video */}
        <div className="flex-[3] relative glass-card overflow-hidden">
          {status === 'WAITING' && <WaitingScreen onCancel={handleStop} />}
          
          {status === 'CONNECTED' && roomData && (
            <VideoRoom 
              partnerId={roomData.partnerId}
              initiator={roomData.initiator}
            />
          )}

          {status === 'DISCONNECTED' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-10">
              <h2 className="text-2xl font-bold mb-4">Stranger has left the chat</h2>
              <button onClick={handleNext} className="btn-neon-primary flex items-center gap-2">
                <SkipForward size={20} /> Find New Stranger
              </button>
            </div>
          )}

          {/* Video Controls Overlay */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 z-20">
            <button 
              onClick={handleStop}
              className="p-4 bg-red-500/20 border border-red-500 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-[0_0_15px_rgba(239,68,68,0.3)]"
              title="Stop"
            >
              <X size={24} />
            </button>
            <button 
              onClick={handleNext}
              className="p-4 bg-primary/20 border border-primary text-primary rounded-full hover:bg-primary hover:text-dark transition-all shadow-[0_0_15px_rgba(0,212,255,0.3)]"
              title="Next Stranger"
            >
              <SkipForward size={24} />
            </button>
            <button 
              onClick={() => setIsReportModalOpen(true)}
              className="p-4 bg-gray-500/20 border border-gray-500 text-gray-500 rounded-full hover:bg-gray-500 hover:text-white transition-all"
              title="Report"
            >
              <Flag size={24} />
            </button>
          </div>

          {/* Mobile Chat Toggle */}
          <button 
            onClick={() => setShowChatMobile(!showChatMobile)}
            className="md:hidden absolute top-4 right-4 p-3 glass-card text-primary z-20"
          >
            <MessageCircle size={24} />
          </button>
        </div>

        {/* Right Panel: Chat (Desktop) */}
        <div className={`flex-[1.5] glass-card overflow-hidden transition-all duration-300 ${showChatMobile ? 'fixed inset-0 z-50 m-0 rounded-none' : 'hidden md:block'}`}>
          {showChatMobile && (
             <button 
                onClick={() => setShowChatMobile(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white z-10"
             >
               <X size={24} />
             </button>
          )}
          <ChatBox partnerId={roomData?.partnerId} isConnected={status === 'CONNECTED'} />
        </div>
      </div>

      {isReportModalOpen && (
        <ReportModal 
          reportedId={roomData?.partnerId} 
          onClose={() => setIsReportModalOpen(false)} 
        />
      )}
    </div>
  );
};

export default ChatPage;
