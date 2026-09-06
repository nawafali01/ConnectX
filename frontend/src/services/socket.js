import { io } from 'socket.io-client';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

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
