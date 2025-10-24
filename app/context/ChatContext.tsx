import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Chat, getOrCreateChat, Message, sendMessage, subscribeToMessages, subscribeToUserChats, updateOfferStatus } from '../../src/services/chatService';
import { UserProfile } from 'firebase/auth';
import { getUserProfile, searchUsersByUsername } from '@src/services/userService';
import { updateProductStatus } from '@src/services/productService';


interface ChatContextType {
  chats: Chat[];
  currentChat: Chat | null;
  messages: Message[];
  loading: boolean;
  users: UserProfile[];
  searchResults: UserProfile[];
  setCurrentChat: (chat: Chat | null) => void;
  startChat: (
    otherUserId: string, 
    otherUserName: string, 
    otherUserEmail: string,
    itemId?: string, 
    itemTitle?: string,
  ) => Promise<void>;
  sendMessage: (text: string, type?: 'text' | 'offer', offerAmount?: number) => Promise<void>; // ← ACTUALIZADO
  searchUsers: (username: string) => Promise<void>;
  clearSearch: () => void;
  acceptOffer: (messageId: string) => Promise<void>; 
  rejectOffer: (messageId: string) => Promise<void>; 
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
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    console.log('User:',user);
    if (!user) return;

    const unsubscribe = subscribeToUserChats(user.uid, (userChats) => {
      setChats(userChats);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);
  
  const isString = (value: unknown): value is string => {
    return typeof value === 'string';
  };

  const isNumber = (value: unknown): value is number => {
    return typeof value === 'number';
  };
  const getParamAsString = (record: Record<string, unknown>, key: string): string | null => {
    const value = record[key];
    
    if (isString(value)) {
      return value;
    }
    const handleAcceptOffer = async (messageId: string) => {
        if (!currentChat || !user) {
        throw new Error('No hay chat activo o usuario no autenticado');
        }

        try {
        console.log('Aceptando oferta...', { messageId, chatId: currentChat.id });

        const isSeller = currentChat.participants[0]?.userId === user.uid;
        if (!isSeller) {
            throw new Error('Solo el vendedor puede aceptar ofertas');
        }

        if (!currentChat.itemId) {
            throw new Error('Este chat no está asociado a un producto');
        }

        await updateOfferStatus(currentChat.id, messageId, 'accepted');
        console.log('Estado de oferta actualizado a "accepted"');

        await updateProductStatus(currentChat.itemId, 'reserved');
        console.log('Producto actualizado a status: "reserved"');

        const userProfile = await getUserProfile(user.uid);
        const username = userProfile?.username || user.displayName || 'Vendedor';
        
        await sendMessage(
            currentChat.id, 
            `He aceptado tu oferta. El producto ha sido reservado para ti.`,
            user.uid, 
            username,
            'text'
        );

        console.log('🎉 Oferta aceptada exitosamente');

        } catch (error) {
        console.error('Error aceptando oferta:', error);
        throw error;
        }
    };
    const handleRejectOffer = async (messageId: string) => {
        if (!currentChat || !user) {
        throw new Error('No hay chat activo o usuario no autenticado');
        }

        try {
        console.log('Rechazando oferta...', { messageId, chatId: currentChat.id });

        const isSeller = currentChat.participants[0]?.userId === user.uid;
        if (!isSeller) {
            throw new Error('Solo el vendedor puede rechazar ofertas');
        }

        await updateOfferStatus(currentChat.id, messageId, 'rejected');
        console.log('Estado de oferta actualizado a "rejected"');

        const userProfile = await getUserProfile(user.uid);
        const username = userProfile?.username || user.displayName || 'Vendedor';
        
        await sendMessage(
            currentChat.id, 
            `He rechazado tu oferta. Puedes hacer otra oferta si lo deseas.`,
            user.uid, 
            username,
            'text'
        );

        console.log('Oferta rechazada exitosamente');

        } catch (error) {
        console.error('Error rechazando oferta:', error);
        throw error;
        }
    };
    
    if (value !== undefined && value !== null) {
      return String(value);
    }
    
    return null;
  };

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

  const startChat = async (
    otherUserId: string, 
    otherUserName: string, 
    otherUserEmail: string,
    itemId?: string,
    itemTitle?: string
  ) => {
    if (!user) return;

    const currentUserProfile = await getUserProfile(user.uid);
    const username = getParamAsString(currentUserProfile || {}, 'username') || 'Usuario';
    const chat = await getOrCreateChat(
      user.uid, 
      otherUserId, 
      otherUserName, 
      otherUserEmail,
      username,
      itemId, 
      itemTitle,
    );
    setCurrentChat(chat);
  };

  const handleSendMessage = async (
    text: string, 
    type: 'text' | 'offer' = 'text', 
    offerAmount?: number
  ) => {
    if (!currentChat || !user) return;

    const userProfile = await getUserProfile(user.uid);
    const username = getParamAsString(userProfile || {}, 'username') || user.displayName || 'Usuario';

    await sendMessage(currentChat.id, text, user.uid, username, type, offerAmount);
  };

  const handleAcceptOffer = async (messageId: string) => {
    if (!currentChat) return;
    
    try {
      await updateOfferStatus(currentChat.id, messageId, 'accepted');
      
    } catch (error) {
      console.error('Error accepting offer:', error);
    }
  };

  const handleRejectOffer = async (messageId: string) => {
    if (!currentChat) return;
    
    try {
      await updateOfferStatus(currentChat.id, messageId, 'rejected');
    } catch (error) {
      console.error('Error rejecting offer:', error);
    }
  };

  const handleSearchUsers = async (username: string) => {
    if (!username.trim()) {
      setSearchResults([]);
      return;
    }

    const results = await searchUsersByUsername(username.trim());
    const filteredResults = results.filter(u => u.uid !== user?.uid);
    setSearchResults(filteredResults);
  };

  const clearSearch = () => {
    setSearchResults([]);
  };

  const value: ChatContextType = {
    chats,
    currentChat,
    messages,
    loading,
    users,
    searchResults,
    setCurrentChat,
    startChat,
    sendMessage: handleSendMessage,
    searchUsers: handleSearchUsers,
    clearSearch,
    acceptOffer: handleAcceptOffer,
    rejectOffer: handleRejectOffer
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};