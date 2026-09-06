import React, { useState } from 'react';
import { WelcomeScreen } from './components/presentation/WelcomeScreen';
import { UserFormScreen } from './components/presentation/UserFormScreen';
import { ProfileScreen } from './components/presentation/ProfileScreen';
import { ChatRoomScreen } from './components/presentation/ChatRoomScreen';
import { ThemeCustomizer } from './components/presentation/ThemeCustomizer';
import { useUserManagement } from './hooks/useUserManagement';
import { useChat } from './hooks/useChat';
import { useTheme } from './hooks/useTheme';
import './styles/index.css';
import './styles/onboarding.css';
import './styles/chat.css';
import './styles/theme-customizer.css';
import './styles/modals.css';

const SCREENS = {
  WELCOME: 'welcome',
  FORM: 'form',
  PROFILE: 'profile',
  CHAT: 'chat',
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState(() => {
    try {
      const savedScreen = localStorage.getItem('connectx_current_screen');
      const savedUserId = localStorage.getItem('connectx_active_user_id');
      if (savedScreen && Object.values(SCREENS).includes(savedScreen)) {
        if (savedScreen === SCREENS.CHAT && !savedUserId) {
          return SCREENS.WELCOME;
        }
        return savedScreen;
      }
      if (savedUserId) return SCREENS.CHAT;
    } catch (e) {}
    return SCREENS.WELCOME;
  });

  const [isSecondUserMode, setIsSecondUserMode] = useState(false);

  // Save currentScreen in localStorage
  React.useEffect(() => {
    try {
      localStorage.setItem('connectx_current_screen', currentScreen);
    } catch (e) {}
  }, [currentScreen]);

  // Theme Management
  const { theme, setColors, applyPreset } = useTheme();

  const {
    users,
    humanUsers,
    activeUser,
    registerUser,
    updateUserProfile,
    switchActiveUser,
  } = useUserManagement();

  const {
    messages,
    onlineUsers,
    sendMessage,
    deleteMessage,
    editMessage,
    isTyping,
    typingUserName,
    sendTypingStart,
    sendTypingStop,
  } = useChat(activeUser);

  // Flow Navigation Handlers
  const handleWelcomeNext = () => {
    setCurrentScreen(SCREENS.FORM);
    setIsSecondUserMode(false);
  };

  const handleFormSubmit = async (formData) => {
    await registerUser(formData);
    if (isSecondUserMode) {
      setIsSecondUserMode(false);
      setCurrentScreen(SCREENS.CHAT);
    } else {
      setCurrentScreen(SCREENS.PROFILE);
    }
  };

  const handleProfileEnterChat = () => {
    setCurrentScreen(SCREENS.CHAT);
  };

  const handleEditProfile = () => {
    setIsSecondUserMode(false);
    setCurrentScreen(SCREENS.FORM);
  };

  const handleAddNewUserFromChat = () => {
    setIsSecondUserMode(true);
    setCurrentScreen(SCREENS.FORM);
  };

  return (
    <div className="app-viewport">
      {/* Background ambient lighting effects — commented out */}
      {/* <div className="bg-ambient-orb orb-top-left" /> */}
      {/* <div className="bg-ambient-orb orb-bottom-right" /> */}

      {/* Floating Theme Customizer */}
      <ThemeCustomizer
        theme={theme}
        onSetColors={setColors}
        onApplyPreset={applyPreset}
      />

      {/* Main Glassmorphism Card Frame */}
      <main className="glass-container">
        {currentScreen === SCREENS.WELCOME && (
          <WelcomeScreen onNext={handleWelcomeNext} />
        )}

        {currentScreen === SCREENS.FORM && (
          <UserFormScreen
            onSubmit={handleFormSubmit}
            onBack={
              isSecondUserMode
                ? () => {
                    setIsSecondUserMode(false);
                    setCurrentScreen(SCREENS.CHAT);
                  }
                : () => setCurrentScreen(SCREENS.WELCOME)
            }
            initialValues={!isSecondUserMode && activeUser ? activeUser : null}
            isSecondUser={isSecondUserMode}
          />
        )}

        {currentScreen === SCREENS.PROFILE && (
          <ProfileScreen
            user={activeUser}
            onEnterChat={handleProfileEnterChat}
            onEditProfile={handleEditProfile}
          />
        )}

        {currentScreen === SCREENS.CHAT && (
          <ChatRoomScreen
            activeUser={activeUser}
            users={users}
            messages={messages}
            onlineUsers={onlineUsers}
            isTyping={isTyping}
            typingUserName={typingUserName}
            onTypingStart={sendTypingStart}
            onTypingStop={sendTypingStop}
            onSendMessage={sendMessage}
            onSwitchUser={switchActiveUser}
            onAddNewUser={handleAddNewUserFromChat}
            onViewProfile={() => setCurrentScreen(SCREENS.PROFILE)}
            onSaveProfile={(updatedData) => {
              if (activeUser) updateUserProfile(activeUser.id, updatedData);
            }}
            onDeleteMessage={deleteMessage}
            onEditMessage={editMessage}
          />
        )}
      </main>
    </div>
  );
}
