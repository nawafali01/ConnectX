const mongoose = require('mongoose');
const User = require('../models/User');
const Message = require('../models/Message');
const store = require('../config/store');

const setupSocketIO = (io) => {
  // Track online users: socketId -> user info
  const onlineUsers = new Map();

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // Join general room immediately on connection
    socket.join('general');

    // ─── User joins the room ───────────────────────────────────────
    socket.on('user:join', async ({ userId, name, avatar, customPhoto }) => {
      try {
        if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(userId)) {
          await User.findByIdAndUpdate(userId, { isOnline: true, socketId: socket.id }).catch(() => {});
        }

        onlineUsers.set(socket.id, { userId, name, avatar, customPhoto });

        // Ensure in general room
        socket.join('general');

        // Broadcast to all that this user is online
        io.emit('users:online', Array.from(onlineUsers.values()));

        console.log(`👤 ${name || 'User'} joined the room`);
      } catch (err) {
        console.error('user:join error:', err.message);
      }
    });

    // ─── Join specific room (group or DM) ───────────────────────────
    socket.on('room:join', ({ room }) => {
      if (room) {
        socket.join(room);
        console.log(`🚪 Socket ${socket.id} joined room: ${room}`);
      }
    });

    socket.on('room:leave', ({ room }) => {
      if (room) {
        socket.leave(room);
        console.log(`🚪 Socket ${socket.id} left room: ${room}`);
      }
    });

    // ─── Verified conversation room join ────────────────────────────
    socket.on('join_conversation', (conversationId) => {
      const roomId = typeof conversationId === 'object' && conversationId !== null
        ? (conversationId.conversationId || conversationId.room)
        : conversationId;

      if (roomId) {
        socket.join(String(roomId));
        console.log(`🚪 Socket ${socket.id} joined conversation: ${roomId}`);
      }
    });

    // ─── Send a new message ────────────────────────────────────────
    socket.on('message:send', async (data) => {
      try {
        const { senderId, senderName, senderAvatar, senderCustomPhoto, text, mediaUrl, mediaType, audioDuration, room = 'general' } = data;

        let msgObj;
        if (mongoose.connection.readyState === 1) {
          const doc = await Message.create({
            senderId,
            senderName,
            senderAvatar,
            senderCustomPhoto,
            text: text || '',
            mediaUrl: mediaUrl || null,
            mediaType: mediaType || (mediaUrl ? 'image' : null),
            audioDuration: audioDuration || null,
            room,
            status: 'sent',
          });
          msgObj = doc.toObject();
        } else {
          msgObj = {
            _id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
            senderId,
            senderName,
            senderAvatar,
            senderCustomPhoto,
            text: text || '',
            mediaUrl: mediaUrl || null,
            mediaType: mediaType || (mediaUrl ? 'image' : null),
            audioDuration: audioDuration || null,
            room,
            status: 'sent',
            createdAt: new Date().toISOString(),
          };
          store.addMessage(msgObj);
        }

        msgObj.id = (msgObj._id || msgObj.id).toString();

        // Broadcast to everyone in the room
        io.to(room).emit('message:new', msgObj);

        // Mark as delivered after short delay
        setTimeout(async () => {
          if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(msgObj._id)) {
            await Message.findByIdAndUpdate(msgObj._id, { status: 'delivered' }).catch(() => {});
          } else {
            msgObj.status = 'delivered';
            store.updateMessage(msgObj.id, { status: 'delivered' });
          }
          io.to(room).emit('message:status', { messageId: msgObj.id, status: 'delivered' });
        }, 400);

        // Mark as read after delay
        setTimeout(async () => {
          if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(msgObj._id)) {
            await Message.findByIdAndUpdate(msgObj._id, { status: 'read' }).catch(() => {});
          } else {
            msgObj.status = 'read';
            store.updateMessage(msgObj.id, { status: 'read' });
          }
          io.to(room).emit('message:status', { messageId: msgObj.id, status: 'read' });
        }, 1000);

      } catch (err) {
        console.error('message:send error:', err.message);
        socket.emit('error', { message: err.message });
      }
    });

    // ─── Edit a message ────────────────────────────────────────────
    socket.on('message:edit', async ({ messageId, text, room = 'general' }) => {
      try {
        let updatedMsg = null;
        if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(messageId)) {
          const doc = await Message.findByIdAndUpdate(
            messageId,
            { text, edited: true },
            { new: true }
          );
          if (doc) updatedMsg = doc.toObject();
        } else {
          updatedMsg = store.updateMessage(messageId, { text, edited: true });
        }

        if (updatedMsg) {
          updatedMsg.id = (updatedMsg._id || updatedMsg.id).toString();
          io.to(room).emit('message:edited', updatedMsg);
        } else {
          // If message wasn't found in memory/db, still broadcast edit
          io.to(room).emit('message:edited', { id: messageId, text, edited: true });
        }
      } catch (err) {
        console.error('message:edit error:', err.message);
        socket.emit('error', { message: err.message });
      }
    });

    // ─── Delete a message ──────────────────────────────────────────
    socket.on('message:delete', async ({ messageId, room = 'general' }) => {
      try {
        if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(messageId)) {
          await Message.findByIdAndUpdate(messageId, { deletedAt: new Date() }).catch(() => {});
        } else {
          store.deleteMessage(messageId);
        }
        io.to(room).emit('message:deleted', { messageId });
      } catch (err) {
        console.error('message:delete error:', err.message);
        socket.emit('error', { message: err.message });
      }
    });

    // ─── Clear all messages ────────────────────────────────────────
    socket.on('messages:clear', async ({ room = 'general' } = {}) => {
      try {
        if (mongoose.connection.readyState === 1) {
          await Message.updateMany({ room, deletedAt: null }, { deletedAt: new Date() }).catch(() => {});
        }
        store.clearMessages(room);
        io.to(room).emit('messages:cleared');
      } catch (err) {
        console.error('messages:clear error:', err.message);
      }
    });

    // ─── Typing indicator ──────────────────────────────────────────
    socket.on('typing:start', ({ name, room = 'general' }) => {
      socket.to(room).emit('typing:show', { name });
    });

    socket.on('typing:stop', ({ room = 'general' }) => {
      socket.to(room).emit('typing:hide');
    });

    // ─── Disconnect ────────────────────────────────────────────────
    socket.on('disconnect', async () => {
      const user = onlineUsers.get(socket.id);
      if (user) {
        if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(user.userId)) {
          await User.findByIdAndUpdate(user.userId, { isOnline: false, socketId: null }).catch(() => {});
        }
        onlineUsers.delete(socket.id);
        io.emit('users:online', Array.from(onlineUsers.values()));
        console.log(`👋 ${user.name || 'User'} disconnected`);
      } else {
        console.log(`🔌 Socket disconnected: ${socket.id}`);
      }
    });
  });
};

module.exports = setupSocketIO;
