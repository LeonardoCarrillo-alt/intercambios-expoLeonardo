import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  getDocs 
} from 'firebase/firestore';
import { db } from '../../app/config/firebase';

export interface Message {
  id?: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: any;
  read: boolean;
}

export interface Chat {
  id: string;
  participantIds: string[];
  participants: Array<{
    userId: string;
    name: string;
    email: string;
  }>;
  lastMessage?: string;
  lastMessageTime?: any;
  createdAt: any;
}

export const getOrCreateChat = async (currentUserId: string, otherUserId: string, otherUserName: string, otherUserEmail: string) => {
  const chatsRef = collection(db, 'chats');
  const q = query(
    chatsRef, 
    where('participantIds', 'array-contains', currentUserId)
  );
  
  const querySnapshot = await getDocs(q);
  
  let existingChat: Chat | null = null;
  
  querySnapshot.forEach((doc) => {
    const chatData = doc.data();
    if (chatData.participantIds.includes(otherUserId)) {
      existingChat = { id: doc.id, ...chatData } as Chat;
    }
  });
  
  if (existingChat) {
    return existingChat;
  }
  
  const newChat = {
    participantIds: [currentUserId, otherUserId],
    participants: [
      {
        userId: currentUserId,
        name: 'Tú', // Esto se puede mejorar obteniendo el nombre real
        email: '' // Se puede obtener del auth
      },
      {
        userId: otherUserId,
        name: otherUserName,
        email: otherUserEmail
      }
    ],
    createdAt: serverTimestamp()
  };
  
  const docRef = await addDoc(collection(db, 'chats'), newChat);
  return { id: docRef.id, ...newChat } as Chat;
};

export const sendMessage = async (chatId: string, text: string, senderId: string, senderName: string) => {
  const messagesRef = collection(db, 'chats', chatId, 'messages');
  
  const messageData = {
    text,
    senderId,
    senderName,
    timestamp: serverTimestamp(),
    read: false
  };
  
  await addDoc(messagesRef, messageData);
  
  const chatRef = doc(db, 'chats', chatId);
  await updateDoc(chatRef, {
    lastMessage: text,
    lastMessageTime: serverTimestamp()
  });
};

export const subscribeToMessages = (chatId: string, callback: (messages: Message[]) => void) => {
  const messagesRef = collection(db, 'chats', chatId, 'messages');
  const q = query(messagesRef, orderBy('timestamp', 'asc'));
  
  return onSnapshot(q, (snapshot) => {
    const messages: Message[] = [];
    snapshot.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() } as Message);
    });
    callback(messages);
  });
};

export const subscribeToUserChats = (userId: string, callback: (chats: Chat[]) => void) => {
  const chatsRef = collection(db, 'chats');
  const q = query(
    chatsRef, 
    where('participantIds', 'array-contains', userId),
    orderBy('lastMessageTime', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const chats: Chat[] = [];
    snapshot.forEach((doc) => {
      chats.push({ id: doc.id, ...doc.data() } as Chat);
    });
    callback(chats);
  });
};