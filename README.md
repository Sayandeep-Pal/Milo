# Milo - Random Video Chat Application

Milo is a modern, dark-themed random video chat application inspired by Omegle, built with the MERN stack and ZegoCloud.

## Features
- **Anonymous Chat:** No login required.
- **Random Matchmaking:** Connect with strangers instantly.
- **Interest-based Matching:** Match with people who share your interests.
- **Real-time Video & Text:** Custom WebRTC implementation for high-quality video/voice and instant messaging via Socket.IO.
- **Responsive UI:** Fully optimized for desktop and mobile.
- **Safety Tools:** Reporting system to keep the community safe.

## Tech Stack
- **Frontend:** React, TailwindCSS, Framer Motion, Lucide Icons.
- **Backend:** Node.js, Express, Socket.IO.
- **Database:** MongoDB (via Mongoose).
- **Video Logic:** Native WebRTC API.

## Installation

### Prerequisites
- Node.js & npm
- MongoDB (local or Atlas)

### Steps

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd Milo
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install server dependencies
   cd server && npm install
   
   # Install client dependencies
   cd ../client && npm install
   ```

3. **Configure Environment Variables**
   
   Create `.env` in the `server` directory:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_uri
   CLIENT_URL=http://localhost:5173
   ```

   Create `.env` in the `client` directory:
   ```env
   VITE_SERVER_URL=http://localhost:5000
   ```

4. **Run the application**
   From the root directory:
   ```bash
   npm run dev
   ```

## WebRTC Implementation
The video chat uses a custom WebRTC implementation with Socket.IO for signaling. 
- **STUN Servers:** Uses Google's public STUN servers for NAT traversal.
- **Signaling:** Handles SDP offer/answer exchange and ICE candidate trickle.
- **Media:** Captures camera and microphone using `getUserMedia`.

## Design
The application features a modern "Glassmorphism" design with neon accents:
- **Primary Color:** Electric Blue (`#00D4FF`)
- **Secondary Color:** Violet (`#8B5CF6`)
- **Background:** Deep Space Black (`#0A0A0F`)

## Safety & Moderation
Users can report inappropriate behavior. Reports are stored in the database, and reported users' counts are tracked. In-memory rate limiting prevents report spamming.
