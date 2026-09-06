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

export const INITIAL_MESSAGES = [];
