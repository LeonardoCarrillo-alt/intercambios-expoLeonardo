import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Chat, getOrCreateChat, Message, sendMessage, subscribeToMessages, subscribeToUserChats } from '../../src/services/chatService';


interface ChatContextType {
  chats: Chat[];
  currentChat: Chat | null;
  messages: Message[];
  loading: boolean;
  setCurrentChat: (chat: Chat | null) => void;
  startChat: (otherUserId: string, otherUserName: string, otherUserEmail: string) => Promise<void>;
  sendMessage: (text: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { user } = useAuth();

  // Escuchar chats del usuario
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToUserChats(user.uid, (userChats) => {
      setChats(userChats);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  // Escuchar mensajes del chat actual
  useEffect(() => {
    if (!currentChat) {
      setMessages([]);
      return;
    }

    const unsubscribe = subscribeToMessages(currentChat.id, (chatMessages) => {
      setMessages(chatMessages);
    });

    return unsubscribe;
  }, [currentChat]);

  const startChat = async (otherUserId: string, otherUserName: string, otherUserEmail: string) => {
    if (!user) return;

    const chat = await getOrCreateChat(user.uid, otherUserId, otherUserName, otherUserEmail);
    setCurrentChat(chat);
  };

  const handleSendMessage = async (text: string) => {
    if (!currentChat || !user) return;

    await sendMessage(currentChat.id, text, user.uid, user.displayName || 'Usuario');
  };

  const value: ChatContextType = {
    chats,
    currentChat,
    messages,
    loading,
    setCurrentChat,
    startChat,
    sendMessage: handleSendMessage
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};