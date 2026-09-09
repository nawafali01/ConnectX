import { io } from 'socket.io-client';
// Normalize Socket URL: always points to the server root (stripping trailing slash or /api)
const RAW_URL = (import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000').replace(/\/+$/, '');
const BACKEND_URL = RAW_URL.endsWith('/api') ? RAW_URL.slice(0, -4) : RAW_URL;

let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(BACKEND_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 15,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('✅ Connected to ConnectX backend Socket.IO (ID:', socket.id, ')');
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 Disconnected from Socket.IO:', reason);
    });

    socket.on('connect_error', (err) => {
      console.warn('⚠️ Socket.IO connection error:', err.message);
    });
  }
  return socket;
};

export default getSocket;
