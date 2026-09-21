import React, { useState } from 'react';
import { Agentation } from 'agentation';
import { WelcomeScreen } from './components/presentation/WelcomeScreen';
import { UserFormScreen } from './components/presentation/UserFormScreen';
import { ProfileScreen } from './components/presentation/ProfileScreen';
import { ChatRoomScreen } from './components/presentation/ChatRoomScreen';
import { ThemeCustomizer } from './components/presentation/ThemeCustomizer';
import { ToastProvider } from './context/ToastContext';
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
      const activeId = localStorage.getItem('connectx_active_user_id');
      const savedUsers = localStorage.getItem('connectx_users');
      // Fresh Chrome window or new session -> start with Profile Creation screen
      if (!activeId || !savedUsers) {
        return SCREENS.FORM;
      }
      const savedScreen = localStorage.getItem('connectx_current_screen');
      if (savedScreen && Object.values(SCREENS).includes(savedScreen)) {
        return savedScreen;
      }
    } catch (e) {}
    return SCREENS.FORM;
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
    groups,
    registerUser,
    addVerifiedContact,
    updateUserProfile,
    switchActiveUser,
    createGroup,
    leaveGroup,
    deleteUser,
  } = useUserManagement();

  // If no registered human active user exists, force profile creation screen first
  React.useEffect(() => {
    if (!activeUser || activeUser.isSystem) {
      setCurrentScreen(SCREENS.FORM);
    }
  }, [activeUser]);

  const {
    messages,
    activeMessages,
    activeConversationId,
    selectConversation,
    onlineUsers,
    unreadCounts,
    sendMessage,
    deleteMessage,
    editMessage,
    toggleReaction,
    clearChat,
    isTyping,
    typingUserName,
    sendTypingStart,
    sendTypingStop,
  } = useChat(activeUser, users);

  // Flow Navigation Handlers
  const handleWelcomeNext = () => {
    setCurrentScreen(SCREENS.FORM);
    setIsSecondUserMode(false);
  };

  const handleFormSubmit = async (formData) => {
    await registerUser(formData, true);
    setIsSecondUserMode(false);
    setCurrentScreen(SCREENS.CHAT);
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
    <ToastProvider>
      <div className="w-screen h-[100dvh] overflow-hidden bg-slate-950 text-slate-100 flex flex-col relative font-sans">
        {/* Floating Theme Customizer - accessible from settings/corner */}
        <ThemeCustomizer
          theme={theme}
          onSetColors={setColors}
          onApplyPreset={applyPreset}
        />

        {/* Main Screen Router */}
        <main className="w-full h-full flex flex-col overflow-hidden">
          {currentScreen === SCREENS.WELCOME && (
            <div className="w-full h-full flex items-center justify-center p-4 bg-slate-950">
              <div className="w-full max-w-md glass-container p-6 rounded-3xl">
                <WelcomeScreen onNext={handleWelcomeNext} />
              </div>
            </div>
          )}

          {currentScreen === SCREENS.FORM && (
            <div className="w-full h-full flex items-center justify-center p-4 bg-slate-950">
              <div className="w-full max-w-lg glass-container p-6 rounded-3xl">
                <UserFormScreen
                  onSubmit={handleFormSubmit}
                  onBack={
                    activeUser && !activeUser.isSystem
                      ? () => {
                          setIsSecondUserMode(false);
                          setCurrentScreen(SCREENS.CHAT);
                        }
                      : null
                  }
                  initialValues={!isSecondUserMode && activeUser ? activeUser : null}
                  isSecondUser={isSecondUserMode}
                />
              </div>
            </div>
          )}

          {currentScreen === SCREENS.PROFILE && (
            <div className="w-full h-full flex items-center justify-center p-4 bg-slate-950">
              <div className="w-full max-w-md glass-container p-6 rounded-3xl">
                <ProfileScreen
                  user={activeUser}
                  onEnterChat={handleProfileEnterChat}
                  onEditProfile={handleEditProfile}
                />
              </div>
            </div>
          )}

          {currentScreen === SCREENS.CHAT && (
            <ChatRoomScreen
              activeUser={activeUser}
              users={users}
              groups={groups}
              messages={messages}
              activeMessages={activeMessages}
              activeConversationId={activeConversationId}
              onSelectConversation={selectConversation}
              onlineUsers={onlineUsers}
              unreadCounts={unreadCounts}
              isTyping={isTyping}
              typingUserName={typingUserName}
              onTypingStart={sendTypingStart}
              onTypingStop={sendTypingStop}
              onSendMessage={sendMessage}
              onSwitchUser={switchActiveUser}
              onAddNewUser={registerUser}
              onAddContact={addVerifiedContact}
              onSaveProfile={(updatedData) => {
                if (activeUser) updateUserProfile(activeUser.id, updatedData);
              }}
              onDeleteMessage={deleteMessage}
              onEditMessage={editMessage}
              onToggleReaction={toggleReaction}
              onClearChat={clearChat}
              onCreateGroup={createGroup}
              onLeaveGroup={leaveGroup}
              onDeleteUser={deleteUser}
            />
          )}
        </main>

        {/* Agentation Visual Feedback Layer for AI Agents (in dev mode) */}
        {(import.meta.env?.DEV || process.env.NODE_ENV === 'development') && <Agentation />}
      </div>
    </ToastProvider>
  );
}
