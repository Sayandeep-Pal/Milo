import React, { useEffect, useRef, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { Mic, MicOff, Video, VideoOff, Activity, SkipForward, X, Flag } from 'lucide-react';

const VideoRoom = ({ partnerId, initiator, onNext, onStop, onReport, localStream }) => {
  const socket = useSocket();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);
  
  const [debugStatus, setDebugStatus] = useState('Initializing...');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(true);

  useEffect(() => {
    if (!socket || !partnerId) return;

    let isCanceled = false;
    const log = (msg) => {
      console.log(`[WebRTC] ${msg}`);
      setDebugStatus(msg);
    };

    log(`Setting up ${initiator ? 'Initiator' : 'Receiver'}...`);

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ]
    });
    pcRef.current = pc;

    // --- PC Event Handlers ---
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        log('Sending ICE candidate');
        socket.emit('signal:ice-candidate', { to: partnerId, candidate: event.candidate });
      }
    };

    pc.ontrack = (event) => {
      log('Remote track received!');
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
        remoteVideoRef.current.play().catch(e => log(`Autoplay block: ${e.message}`));
      }
    };

    pc.onconnectionstatechange = () => {
      log(`Connection state: ${pc.connectionState}`);
      if (pc.connectionState === 'connected') {
        setDebugStatus('Connected');
        if (remoteVideoRef.current) {
          remoteVideoRef.current.play().catch(e => log(`Autoplay block: ${e.message}`));
        }
      }
      if (pc.connectionState === 'failed') setDebugStatus('Connection Failed - Try Refreshing');
    };

    // --- Signaling Handlers ---
    const handleOffer = async ({ from, offer }) => {
      if (from !== partnerId || isCanceled) return;
      log('Offer received');
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('signal:answer', { to: partnerId, answer });
        log('Answer sent');
      } catch (e) { log(`Offer Error: ${e.message}`); }
    };

    const handleAnswer = async ({ from, answer }) => {
      if (from !== partnerId || isCanceled) return;
      log('Answer received');
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        log('Remote description set');
      } catch (e) { log(`Answer Error: ${e.message}`); }
    };

    const handleIceCandidate = async ({ from, candidate }) => {
      if (from !== partnerId || isCanceled) return;
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) { /* Ignore candidates if remote description not yet set */ }
    };

    socket.on('signal:offer', handleOffer);
    socket.on('signal:answer', handleAnswer);
    socket.on('signal:ice-candidate', handleIceCandidate);

    // --- Start Signaling with pre-acquired localStream ---
    const start = async () => {
      try {
        if (!localStream) {
          log('Waiting for media...');
          return;
        }

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
          localVideoRef.current.play().catch(e => log(`Local play block: ${e.message}`));
        }

        localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
        log('Media tracks added');

        if (initiator) {
          log('Creating offer...');
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit('signal:offer', { to: partnerId, offer });
          log('Offer sent');
        }
      } catch (e) {
        log(`Setup Error: ${e.name}`);
      }
    };

    start();

    return () => {
      isCanceled = true;
      socket.off('signal:offer', handleOffer);
      socket.off('signal:answer', handleAnswer);
      socket.off('signal:ice-candidate', handleIceCandidate);
      if (pcRef.current) pcRef.current.close();
    };
  }, [socket, partnerId, initiator, localStream]);

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden">
      {/* Remote Video */}
      <video ref={remoteVideoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover z-0" />

      {/* Local Video - Repositioned to not overlap bottom controls */}
      <div className="absolute top-4 left-4 w-28 md:w-48 aspect-video glass-card overflow-hidden shadow-2xl z-30 border border-primary/30 bg-dark">
        <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
        {isVideoOff && <div className="absolute inset-0 bg-dark/80 flex items-center justify-center"><VideoOff size={20} className="text-gray-500" /></div>}
        <div className="absolute bottom-1 right-1 text-[8px] bg-black/50 px-1 rounded text-white uppercase">You</div>
      </div>

      {/* Debug Status Overlay - Made more subtle and repositioned */}
      <div className="absolute top-4 right-4 md:right-auto md:left-56 flex items-center gap-2 px-2 py-1 bg-black/30 backdrop-blur-sm rounded-lg border border-white/5 z-30 text-[9px] text-gray-400 uppercase tracking-wider">
        <Activity size={10} className={pcRef.current?.connectionState === 'connected' ? 'text-green-500' : 'text-primary animate-pulse'} />
        {debugStatus}
      </div>

      {/* Unified Control Toolbar */}
      <div className="absolute inset-x-0 bottom-6 md:bottom-8 flex items-center gap-2 md:gap-4 z-50 px-4 justify-center pointer-events-none">
        {/* Media Controls Group */}
        <div className="flex items-center gap-2 p-1.5 bg-zinc-900/50 backdrop-blur-xl rounded-2xl border border-white/5 shadow-2xl pointer-events-auto">
          <button 
            onClick={() => { 
              if (localStream) {
                localStream.getAudioTracks().forEach(t => t.enabled = !t.enabled);
              }
              setIsMuted(!isMuted); // Visually update state even if no stream
            }} 
            className={`p-2.5 md:p-3 rounded-xl transition-all ${isMuted ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'hover:bg-white/5 text-zinc-400 hover:text-white'}`}
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
          <button 
            onClick={() => { 
              if (localStream) {
                localStream.getVideoTracks().forEach(t => t.enabled = !t.enabled);
              }
              setIsVideoOff(!isVideoOff); // Visually update state even if no stream
            }} 
            className={`p-2.5 md:p-3 rounded-xl transition-all ${isVideoOff ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'hover:bg-white/5 text-zinc-400 hover:text-white'}`}
            title={isVideoOff ? "Turn Video On" : "Turn Video Off"}
          >
            {isVideoOff ? <VideoOff size={18} /> : <Video size={18} />}
          </button>
        </div>

        {/* Session Controls Group */}
        <div className="flex items-center gap-2 p-1.5 bg-zinc-900/50 backdrop-blur-xl rounded-2xl border border-white/5 shadow-2xl pointer-events-auto">
          <button 
            onClick={onStop}
            className="p-2.5 md:p-3 hover:bg-red-500/10 text-zinc-500 hover:text-red-500 rounded-xl transition-all"
            title="Stop Chat"
          >
            <X size={18} />
          </button>
          <button 
            onClick={onNext}
            className="p-2.5 md:p-3 bg-white text-black rounded-xl hover:bg-zinc-200 transition-all font-semibold flex items-center gap-2"
            title="Next Stranger"
          >
            <SkipForward size={18} />
            <span className="hidden md:inline text-xs uppercase tracking-wider">Next</span>
          </button>
          <button 
            onClick={onReport}
            className="p-2.5 md:p-3 hover:bg-white/5 text-zinc-600 hover:text-white rounded-xl transition-all"
            title="Report Stranger"
          >
            <Flag size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoRoom;
