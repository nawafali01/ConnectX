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
    bg: '#ede9fe',
    color: '#7c3aed',
  },
  joinedAt: new Date().toISOString(),
  isOnline: true,
  isSystem: true,
};

export const INITIAL_GROUPS = [
  {
    id: 'general',
    name: '🚀 ConnectX General Lounge',
    description: 'Welcome to ConnectX! Real-time community discussion room.',
    isGroup: true,
    avatar: {
      emoji: '🚀',
      bg: '#ede9fe',
      gradient: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)',
    },
    members: [],
    admins: [],
    createdAt: new Date().toISOString(),
  },
];

export const INITIAL_MESSAGES = [];
