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
    <div className="h-screen-dynamic flex flex-col overflow-hidden bg-dark">
      <Navbar />
      
      <div className="flex-1 flex flex-col md:flex-row pt-16 md:pt-20 px-2 md:px-4 pb-2 md:pb-4 gap-2 md:gap-4">
        {/* Left Panel: Video */}
        <div className="flex-[1.2] md:flex-[3] relative glass-card overflow-hidden min-h-[40vh] md:min-h-0">
          {status === 'WAITING' && <WaitingScreen onCancel={handleStop} />}
          
          {status === 'CONNECTED' && roomData && (
            <VideoRoom 
              partnerId={roomData.partnerId}
              initiator={roomData.initiator}
              onNext={handleNext}
              onStop={handleStop}
              onReport={() => setIsReportModalOpen(true)}
            />
          )}

          {status === 'DISCONNECTED' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/80 backdrop-blur-md z-30">
              <h2 className="text-xl md:text-2xl font-bold mb-4 text-white tracking-tight">Stranger has left</h2>
              <button 
                onClick={handleNext} 
                className="btn-primary flex items-center gap-2"
              >
                <SkipForward size={20} /> Find Next
              </button>
            </div>
          )}

          {/* Mobile Chat Toggle - Only show if not already showing chat below */}
          <button 
            onClick={() => setShowChatMobile(!showChatMobile)}
            className="md:hidden absolute top-4 right-4 p-2.5 glass-card text-primary z-20 shadow-lg border-primary/20"
          >
            <MessageCircle size={20} />
          </button>
        </div>

        {/* Right Panel: Chat */}
        <div className={`flex-[1] md:flex-[1.2] glass-card overflow-hidden transition-all duration-300 ${
          showChatMobile 
            ? 'fixed inset-0 z-50 m-0 rounded-none' 
            : 'hidden md:block'
        }`}>
          {showChatMobile && (
             <div className="absolute top-4 right-4 z-50">
               <button 
                  onClick={() => setShowChatMobile(false)}
                  className="p-2 bg-dark/50 backdrop-blur-md rounded-full text-gray-400 hover:text-white border border-white/10"
               >
                 <X size={20} />
               </button>
             </div>
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
