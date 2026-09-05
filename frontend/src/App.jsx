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

const SCREENS = {
  WELCOME: 'welcome',
  FORM: 'form',
  PROFILE: 'profile',
  CHAT: 'chat',
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState(SCREENS.WELCOME);
  const [isSecondUserMode, setIsSecondUserMode] = useState(false);

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
    sendMessage,
    isTyping,
    typingUserName,
  } = useChat(activeUser);

  // Flow Navigation Handlers
  const handleWelcomeNext = () => {
    // If a user profile already exists, we can still let them view/edit or go to form
    setCurrentScreen(SCREENS.FORM);
    setIsSecondUserMode(false);
  };

  const handleFormSubmit = (formData) => {
    const newUser = registerUser(formData);
    if (isSecondUserMode) {
      // Return straight to chat room with new user registered!
      setIsSecondUserMode(false);
      setCurrentScreen(SCREENS.CHAT);
    } else {
      // First user flow: go to profile review screen
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
            onSendMessage={sendMessage}
            onSwitchUser={switchActiveUser}
            onAddNewUser={handleAddNewUserFromChat}
            onViewProfile={() => setCurrentScreen(SCREENS.PROFILE)}
          />
        )}
      </main>
    </div>
  );
}
