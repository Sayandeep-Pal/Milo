import React, { useEffect, useRef, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { Mic, MicOff, Video, VideoOff, Activity } from 'lucide-react';

const VideoRoom = ({ partnerId, initiator }) => {
  const socket = useSocket();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  
  const [debugStatus, setDebugStatus] = useState('Initializing...');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

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
      }
    };

    pc.onconnectionstatechange = () => {
      log(`Connection state: ${pc.connectionState}`);
      if (pc.connectionState === 'connected') setDebugStatus('Connected');
      if (pc.connectionState === 'failed') setDebugStatus('Connection Failed - Try Refreshing');
    };

    pc.oniceconnectionstatechange = () => {
      log(`ICE state: ${pc.iceConnectionState}`);
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

    // --- Start Media & Signaling ---
    const start = async () => {
      try {
        log('Requesting Camera...');
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (isCanceled) { stream.getTracks().forEach(t => t.stop()); return; }
        
        localStreamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        stream.getTracks().forEach(track => pc.addTrack(track, stream));
        log('Media tracks added');

        if (initiator) {
          log('Creating offer...');
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit('signal:offer', { to: partnerId, offer });
          log('Offer sent');
        }
      } catch (e) {
        log(`Media Error: ${e.name}`);
        alert(`Camera error: ${e.name}. Ensure you are on HTTPS or localhost.`);
      }
    };

    start();

    return () => {
      isCanceled = true;
      socket.off('signal:offer', handleOffer);
      socket.off('signal:answer', handleAnswer);
      socket.off('signal:ice-candidate', handleIceCandidate);
      if (pcRef.current) pcRef.current.close();
      if (localStreamRef.current) localStreamRef.current.getTracks().forEach(t => t.stop());
    };
  }, [socket, partnerId, initiator]);

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden">
      {/* Remote Video */}
      <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />

      {/* Local Video */}
      <div className="absolute bottom-24 right-6 w-32 md:w-48 aspect-video glass-card overflow-hidden shadow-2xl z-20 border-2 border-primary/30 bg-dark">
        <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
        {isVideoOff && <div className="absolute inset-0 bg-dark/80 flex items-center justify-center"><VideoOff size={24} className="text-gray-500" /></div>}
      </div>

      {/* Debug Status Overlay */}
      <div className="absolute top-6 left-6 flex items-center gap-2 px-3 py-1 bg-black/50 backdrop-blur-md rounded-full border border-white/10 z-40 text-[10px] text-primary uppercase tracking-widest font-bold">
        <Activity size={12} className="animate-pulse" />
        {debugStatus}
      </div>

      {/* Media Controls */}
      <div className="absolute bottom-6 left-6 flex items-center gap-3 z-30">
        <button onClick={() => { localStreamRef.current.getAudioTracks()[0].enabled = isMuted; setIsMuted(!isMuted); }} className={`p-3 rounded-full transition-all ${isMuted ? 'bg-red-500/20 text-red-500 border border-red-500' : 'bg-white/10 text-white border border-white/10'}`}>
          {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
        </button>
        <button onClick={() => { localStreamRef.current.getVideoTracks()[0].enabled = isVideoOff; setIsVideoOff(!isVideoOff); }} className={`p-3 rounded-full transition-all ${isVideoOff ? 'bg-red-500/20 text-red-500 border border-red-500' : 'bg-white/10 text-white border border-white/10'}`}>
          {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
        </button>
      </div>
    </div>
  );
};

export default VideoRoom;
