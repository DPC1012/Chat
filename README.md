# Chat - Real-time Secure Messaging

A minimalist, high-performance real-time chat application built with React, Node.js, and WebSockets. Designed for private, ephemeral room-based communication.

## 🚀 Features

- **Private Rooms**: Create or join specific rooms using unique 6-character codes.
- **Real-time Messaging**: Instant communication powered by WebSockets.
- **Presence Tracking**: See when others join or leave your chat room.
- **Typing Indicators**: Know when your partner is typing a message.
- **Minimalist UI**: Clean, dark-themed interface built with Tailwind CSS v4.
- **Secure by Design**: Ephemeral rooms limited to 2 participants for focused communication.
- **Toast Notifications**: Interactive feedback for room events and connection status.

## 🛠️ Tech Stack

### Frontend
- **React 19**: Modern UI development with functional components and hooks.
- **Vite**: Ultra-fast build tool and development server.
- **Tailwind CSS v4**: Utility-first styling with the latest features.
- **React Router Dom v7**: Smooth client-side navigation.
- **TypeScript**: Type-safe development for better maintainability.

### Backend
- **Node.js**: Robust runtime environment.
- **WebSockets (`ws`)**: Low-latency, bidirectional communication.
- **TypeScript**: Shared types between frontend and backend for end-to-end safety.

## 🏃 Getting Started

### Prerequisites
- Node.js (v18 or later recommended)
- npm or yarn

### 1. Clone the repository
```bash
git clone <repository-url>
cd Chat
```

### 2. Setup Backend
```bash
cd backend
npm install
npm run dev
```
The backend will start on port `5050` by default.

### 3. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```
The frontend will start on port `5173` (default Vite port).

## ⚙️ Configuration

### Frontend Environment Variables
Create a `.env` file in the `frontend` directory:
```env
VITE_WS_URL=ws://localhost:5050
```

### Backend Environment Variables
Create a `.env` file in the `backend` directory (optional):
```env
PORT=5050
```
