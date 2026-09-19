import React, { useState, useEffect, useMemo } from 'react';
import { TopNav } from '../chat/TopNav';
import { Sidebar } from '../chat/Sidebar';
import { ChatArea } from '../chat/ChatArea';
import { ChatDetails } from '../chat/ChatDetails';
import { GroupModal } from '../chat/GroupModal';
import { AddUserModal } from '../chat/AddUserModal';
import { EditProfileModal } from '../modals/EditProfileModal';
import { EditMessageModal } from '../modals/EditMessageModal';
import { MediaViewerModal } from '../modals/MediaViewerModal';
import { useToast } from '../../context/ToastContext';
import { isFakeUser } from '../../functions/storage';

export const ChatRoomScreen = ({
  activeUser,
  users = [],
  groups = [],
  messages = [],
  activeMessages = [],
  activeConversationId = 'general',
  onSelectConversation,
  onlineUsers = [],
  unreadCounts = {},
  isTyping = false,
  typingUserName = '',
  onTypingStart,
  onTypingStop,
  onSendMessage,
  onSwitchUser,
  onAddNewUser,
  onSaveProfile,
  onDeleteMessage,
  onEditMessage,
  onToggleReaction,
  onClearChat,
  onCreateGroup,
  onLeaveGroup,
  onDeleteUser,
}) => {
  const { toast, confirm } = useToast();
  // Mobile responsive view mode: 'list' (sidebar) | 'chat' (active conversation) | 'details' (drawer)
  const [mobileView, setMobileView] = useState(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return 'list';
    }
    return 'chat';
  });
  // Desktop collapsible details panel
  const [showDetails, setShowDetails] = useState(true);

  // Modals state
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [viewingMediaUrl, setViewingMediaUrl] = useState(null);

  // Resolve active conversation object
  const activeConversation = useMemo(() => {
    const activeId = String(activeUser?.id || activeUser?._id || '');

    // 1. Match DM if activeConversationId starts with 'dm_'
    if (activeConversationId && activeConversationId.startsWith('dm_')) {
      const targetUser = users.find((u) => {
        if (!u || isFakeUser(u)) return false;
        const uId = String(u.id || u._id || '');
        if (!uId || uId === activeId) return false;
        return activeConversationId.includes(uId);
      });

      if (targetUser) {
        return {
          id: activeConversationId,
          targetUser,
          name: targetUser.name,
          avatar: targetUser.avatar,
          customPhoto: targetUser.customPhoto,
          isGroup: false,
        };
      }
    }

    // 2. Match custom group if activeConversationId is a specific group (not 'general' fallback)
    if (activeConversationId && activeConversationId !== 'general') {
      const foundGroup = groups.find((g) => g.id === activeConversationId);
      if (foundGroup) {
        return {
          ...foundGroup,
          isGroup: true,
        };
      }
    }

    // 3. Fallback: If there is a direct contact user, default to showing their chat!
    const otherUser = users.find((u) => {
      if (!u || isFakeUser(u) || u.isSystem) return false;
      const uId = String(u.id || u._id || '');
      const uName = u.name?.trim().toLowerCase();
      const myName = activeUser?.name?.trim().toLowerCase();
      return uId !== activeId && (!myName || uName !== myName);
    });

    if (otherUser && activeId) {
      const dmId = `dm_${[activeId, otherUser.id || otherUser._id].sort().join('_')}`;
      return {
        id: dmId,
        targetUser: otherUser,
        name: otherUser.name,
        avatar: otherUser.avatar,
        customPhoto: otherUser.customPhoto,
        isGroup: false,
      };
    }

    // 4. Fallback to general or first group
    const foundGeneral = groups.find((g) => g.id === activeConversationId);
    if (foundGeneral) {
      return {
        ...foundGeneral,
        isGroup: true,
      };
    }
    return groups[0] || null;
  }, [activeConversationId, groups, users, activeUser]);

  // Keep activeConversationId in sync if fallback resolved to a contact's DM
  useEffect(() => {
    if (activeConversation?.id && activeConversationId !== activeConversation.id) {
      onSelectConversation?.(activeConversation.id);
    }
  }, [activeConversation?.id, activeConversationId, onSelectConversation]);

  const handleSelectConversation = (convId) => {
    onSelectConversation?.(convId);
    setMobileView('chat');
  };

  const handleBackToList = () => {
    setMobileView('list');
  };

  const handleToggleDetails = () => {
    // On mobile, switch view mode to details
    if (window.innerWidth < 768) {
      setMobileView('details');
    } else {
      setShowDetails((prev) => !prev);
    }
  };

  const handleCloseDetails = () => {
    if (window.innerWidth < 768) {
      setMobileView('chat');
    } else {
      setShowDetails(false);
    }
  };

  const handleCreateGroup = (groupData) => {
    const created = onCreateGroup?.(groupData);
    if (created?.id) {
      onSelectConversation?.(created.id);
      setMobileView('chat');
    }
    setShowGroupModal(false);
  };

  const handleDeleteUser = async (targetUser) => {
    if (!targetUser) return;
    const targetUserId = targetUser.id || targetUser._id;
    const targetUserName = targetUser.name || 'this user';

    confirm({
      title: `Delete ${targetUserName}?`,
      message: `Are you sure you want to delete user "${targetUserName}"? This will permanently remove the user and their direct chat history.`,
      confirmText: 'Delete User',
      type: 'danger',
      onConfirm: async () => {
        await onDeleteUser?.(targetUserId);
        toast.success('User Deleted', `User "${targetUserName}" has been removed.`);
        onSelectConversation?.('general');
        if (mobileView === 'details') {
          setMobileView('chat');
        }
      },
    });
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* 1. Global Centered Header */}
      <TopNav
        activeUser={activeUser}
        onOpenProfile={() => setShowEditProfile(true)}
      />

      {/* 2. Main 3-Column WhatsApp-Style Responsive Work Area */}
      <div className="flex-1 flex overflow-hidden relative w-full h-[calc(100dvh-3.5rem)]">
        {/* Left Column: Sidebar (Navigation, Search, DM/Group tabs, Chat List) */}
        <div
          className={`h-full md:flex md:w-80 lg:w-96 flex-shrink-0 transition-all duration-200 ${
            mobileView === 'list' ? 'w-full flex' : 'hidden md:flex'
          }`}
        >
          <Sidebar
            activeUser={activeUser}
            users={users}
            groups={groups}
            messages={messages}
            activeConversationId={activeConversationId}
            onSelectConversation={handleSelectConversation}
            unreadCounts={unreadCounts}
            onOpenGroupModal={() => setShowGroupModal(true)}
            onOpenAddUserModal={() => setShowAddUserModal(true)}
            onOpenSettings={() => setShowEditProfile(true)}
            onlineUsers={onlineUsers}
            className="w-full"
          />
        </div>

        {/* Center Column: Chat Area (Active Conversation Feed & Input) */}
        <div
          className={`h-full flex-1 flex flex-col min-w-0 transition-all duration-200 ${
            mobileView === 'chat'
              ? 'w-full flex'
              : mobileView === 'list'
              ? 'hidden md:flex'
              : 'hidden md:flex'
          }`}
        >
          <ChatArea
            conversation={activeConversation}
            activeUser={activeUser}
            messages={activeMessages}
            isTyping={isTyping}
            typingUserName={typingUserName}
            onSendMessage={onSendMessage}
            onTypingStart={onTypingStart}
            onTypingStop={onTypingStop}
            onDeleteMessage={onDeleteMessage}
            onEditMessage={(msg) => setEditingMessage(msg)}
            onToggleReaction={onToggleReaction}
            onViewMedia={(url) => setViewingMediaUrl(url)}
            onBackToList={handleBackToList}
            onToggleDetails={handleToggleDetails}
            onDeleteUser={handleDeleteUser}
            onLeaveGroup={onLeaveGroup}
            onClearChat={onClearChat}
            onlineUsers={onlineUsers}
          />
        </div>

        {/* Right Column: Details Drawer (Member list with Admin/Member badges, media, actions) */}
        {/* On Desktop: conditional 3rd column */}
        {showDetails && activeConversation && (
          <div className="hidden md:flex md:w-80 lg:w-88 flex-shrink-0 h-full animate-in slide-in-from-right duration-200">
            <ChatDetails
              conversation={activeConversation}
              activeUser={activeUser}
              users={users}
              messages={activeMessages}
              onClose={() => setShowDetails(false)}
              onLeaveGroup={onLeaveGroup}
              onClearChat={onClearChat}
              onDeleteUser={handleDeleteUser}
              onViewMedia={(url) => setViewingMediaUrl(url)}
              onlineUsers={onlineUsers}
              className="w-full"
            />
          </div>
        )}

        {/* On Mobile: Slide-over drawer when mobileView === 'details' */}
        {mobileView === 'details' && activeConversation && (
          <div className="fixed inset-0 z-40 md:hidden w-full h-full bg-slate-900 animate-in slide-in-from-right duration-200">
            <ChatDetails
              conversation={activeConversation}
              activeUser={activeUser}
              users={users}
              messages={activeMessages}
              onClose={handleCloseDetails}
              onLeaveGroup={onLeaveGroup}
              onClearChat={onClearChat}
              onDeleteUser={handleDeleteUser}
              onViewMedia={(url) => setViewingMediaUrl(url)}
              onlineUsers={onlineUsers}
              className="w-full h-full"
            />
          </div>
        )}
      </div>

      {/* 3. Group Creation Modal */}
      {showGroupModal && (
        <GroupModal
          users={users}
          activeUser={activeUser}
          onCreateGroup={handleCreateGroup}
          onClose={() => setShowGroupModal(false)}
        />
      )}

      {/* 3b. Add User Modal */}
      {showAddUserModal && (
        <AddUserModal
          isOpen={showAddUserModal}
          onClose={() => setShowAddUserModal(false)}
          onAddUser={onAddNewUser}
          onSelectConversation={onSelectConversation}
          currentUserId={activeUser?.id || activeUser?._id}
        />
      )}

      {/* 4. Edit Profile Modal */}
      {showEditProfile && (
        <EditProfileModal
          user={activeUser}
          onSave={(updatedData) => {
            onSaveProfile?.(updatedData);
            setShowEditProfile(false);
          }}
          onClose={() => setShowEditProfile(false)}
        />
      )}

      {/* 5. Edit Message Modal */}
      {editingMessage && (
        <EditMessageModal
          message={editingMessage}
          onSave={(msgId, newText) => {
            onEditMessage?.(msgId, newText);
          }}
          onClose={() => setEditingMessage(null)}
        />
      )}

      {/* 6. Lightbox Media Viewer */}
      {viewingMediaUrl && (
        <MediaViewerModal
          mediaUrl={viewingMediaUrl}
          onClose={() => setViewingMediaUrl(null)}
        />
      )}
    </div>
  );
};
