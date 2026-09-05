export const INITIAL_BOT_USER = {
  id: 'user-connectx-bot',
  name: 'ConnectX AI',
  phone: '+1 (800) 555-0199',
  bio: 'Automated lounge assistant. Ready to connect and welcome everyone!',
  avatar: {
    id: 'avatar-bot',
    name: 'ConnectX AI',
    gradient: 'linear-gradient(135deg, #6d28d9 0%, #a855f7 100%)',
    emoji: '🤖',
    border: '#c084fc',
  },
  joinedAt: new Date(Date.now() - 3600000).toISOString(),
  isOnline: true,
  isSystem: true,
};

export const INITIAL_MESSAGES = [
  {
    id: 'msg-seed-1',
    senderId: 'user-connectx-bot',
    senderName: 'ConnectX AI',
    text: '👋 Welcome to ConnectX! Create your profile or add another user to start a live conversation.',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    status: 'read',
  },
  {
    id: 'msg-seed-2',
    senderId: 'user-connectx-bot',
    senderName: 'ConnectX AI',
    text: '💡 Pro-tip: You can tap "Add / Switch User" at the top to simulate two users talking in the same room right from your browser!',
    timestamp: new Date(Date.now() - 900000).toISOString(),
    status: 'read',
  },
];
