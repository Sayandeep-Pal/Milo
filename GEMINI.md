# Milo - Random Video Chat Application

## Overview
A full-stack random video chat web application (Omegle clone) using the MERN stack and ZegoCloud.

## Tech Stack
- **Frontend:** React (Vite), TailwindCSS, Framer Motion, React Router v6
- **Backend:** Node.js, Express.js, Socket.IO
- **Database:** MongoDB
- **Video Calling:** Native WebRTC (RTCPeerConnection) with STUN servers.

## Architecture & Conventions
- **UI:** Modern, dark-themed, glassmorphism-inspired.
- **Colors:**
  - Primary: #00D4FF (Electric Blue)
  - Secondary: #8B5CF6 (Violet)
  - Dark: #0A0A0F
  - Glass: rgba(255,255,255,0.05)
- **Folder Structure:**
  - `/client`: React frontend
  - `/server`: Node.js backend
- **State Management:** Context API (SocketContext, UserContext)
- **Real-time:** Socket.IO for matchmaking and WebRTC signaling.

## WebRTC Signaling Flow
1. **match_found:** Server notifies both users; one is assigned as `initiator`.
2. **offer/answer:** Initiator creates an SDP offer; partner responds with an SDP answer via `signal:offer` and `signal:answer`.
3. **ICE candidates:** Both users exchange network information via `signal:ice-candidate`.

## Setup
1. `npm install` in root, client, and server.
2. Configure `.env` files in root, client, and server.
3. `npm run dev` to start both client and server.
