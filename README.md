# ConnectX 🚀

ConnectX is a modern, full-stack real-time chat application built with React, Node.js, Socket.IO, and MongoDB. It supports instant messaging, voice messages, group chats, user management, and customizable visual themes.

## 🌟 Key Features

- 💬 **Real-time Messaging**: Powered by Socket.IO for instantaneous message delivery and live typing indicators.
- 🎙️ **Voice Messages**: Record and share audio messages directly in chat using the MediaRecorder API.
- 👥 **User & Group Management**: Add contacts via email, create group chats, view online status, and manage user profiles.
- 🎨 **Theme Customization**: Choose from multiple color palettes and pre-built visual presets.
- 🔔 **Interactive UI**: Toast notifications, message reactions, rich media rendering, and clean modals.
- 🔒 **Authentication**: Secure JWT-based authentication with protected routes.

## 📁 Repository Structure

```
ConnectX/
├── backend/    # Node.js, Express, Socket.IO & MongoDB backend API
└── frontend/   # React + Vite frontend SPA
```

## 🛠️ Quick Start

### Prerequisites

- Node.js v18+
- MongoDB instance (local or Atlas)

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env   # fill in your environment variables
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env   # fill in your environment variables
npm run dev
```

## 🧰 Tech Stack

| Layer     | Technology                      |
|-----------|---------------------------------|
| Frontend  | React, Vite, CSS                |
| Backend   | Node.js, Express.js             |
| Realtime  | Socket.IO                       |
| Database  | MongoDB + Mongoose              |
| Auth      | JWT (JSON Web Tokens)           |

## 📜 License

MIT License.

---

*Last updated: October 2026*

