const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');

const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST']
    }
  });

  const waitingQueue = [];
  const activePairs = new Map(); // socketId -> partnerSocketId

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Broadcast updated count to all
    io.emit('online_count', io.engine.clientsCount);

    socket.on('get_online_count', () => {
      socket.emit('online_count', io.engine.clientsCount);
    });

    socket.on('find_match', ({ userId, interests }) => {
      console.log(`User ${socket.id} looking for match with interests:`, interests);
      
      // Basic matchmaking: just pick the first person in queue
      if (waitingQueue.length > 0) {
        const partnerSocket = waitingQueue.shift();
        
        if (partnerSocket.id === socket.id) {
          waitingQueue.push(socket);
          return;
        }

        const roomId = uuidv4();
        
        activePairs.set(socket.id, partnerSocket.id);
        activePairs.set(partnerSocket.id, socket.id);

        socket.join(roomId);
        partnerSocket.join(roomId);

        io.to(socket.id).emit('match_found', { 
          roomId, 
          partnerId: partnerSocket.id,
          initiator: true
        });
        
        io.to(partnerSocket.id).emit('match_found', { 
          roomId, 
          partnerId: socket.id,
          initiator: false
        });

        console.log(`Match found between ${socket.id} and ${partnerSocket.id} in room ${roomId}`);
      } else {
        waitingQueue.push(socket);
        socket.emit('waiting', { status: 'waiting' });
      }
    });

    // WebRTC Signaling
    socket.on('signal:offer', ({ to, offer }) => {
      io.to(to).emit('signal:offer', { from: socket.id, offer });
    });

    socket.on('signal:answer', ({ to, answer }) => {
      io.to(to).emit('signal:answer', { from: socket.id, answer });
    });

    socket.on('signal:ice-candidate', ({ to, candidate }) => {
      io.to(to).emit('signal:ice-candidate', { from: socket.id, candidate });
    });

    socket.on('send_message', (data) => {
      const partnerId = activePairs.get(socket.id);
      if (partnerId) {
        io.to(partnerId).emit('receive_message', data);
      }
    });

    socket.on('typing', ({ isTyping }) => {
      const partnerId = activePairs.get(socket.id);
      if (partnerId) {
        io.to(partnerId).emit('stranger_typing', { isTyping });
      }
    });

    socket.on('next_stranger', () => {
      handleDisconnect(socket);
      // Logic to put back into queue should be handled by client re-emitting find_match
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      handleDisconnect(socket);
      io.emit('online_count', io.engine.clientsCount);
    });

    function handleDisconnect(s) {
      const partnerId = activePairs.get(s.id);
      if (partnerId) {
        io.to(partnerId).emit('stranger_left');
        activePairs.delete(partnerId);
        activePairs.delete(s.id);
      }
      
      const index = waitingQueue.findIndex(qSocket => qSocket.id === s.id);
      if (index !== -1) {
        waitingQueue.splice(index, 1);
      }
    }
  });

  return io;
};

module.exports = setupSocket;
