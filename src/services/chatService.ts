
import { db } from 'app/config/firebase';
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

export interface Message {
  id?: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: any;
  read: boolean;
  type: 'text' | 'offer'; 
  offerAmount?: number; 
  offerStatus?: 'pending' | 'accepted' | 'rejected'; 
}

export interface Chat {
  id: string;
  participantIds: string[];
  participants: Array<{
    userId: string;
    name: string;
    email: string;
    username: string;
  }>;
  itemId?: string; 
  itemTitle?: string; 
  lastMessage?: string;
  lastMessageTime?: any;
  createdAt: any;
}

export const getOrCreateChat = async (
  currentUserId: string, 
  otherUserId: string, 
  otherUserName: string, 
  otherUserEmail: string,
  currentUserName: string,
  itemId?: string, 
  itemTitle?: string 
) => {
  if (itemId) {
    const chatsRef = collection(db, 'chats');
    const q = query(
      chatsRef, 
      where('participantIds', 'array-contains', currentUserId),
      where('itemId', '==', itemId)
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
  } else {
    const chatsRef = collection(db, 'chats');
    const q = query(
      chatsRef, 
      where('participantIds', 'array-contains', currentUserId)
    );
    
    const querySnapshot = await getDocs(q);
    
    let existingChat: Chat | null = null;
    
    querySnapshot.forEach((doc) => {
      const chatData = doc.data();
      if (chatData.participantIds.includes(otherUserId) && !chatData.itemId) {
        existingChat = { id: doc.id, ...chatData } as Chat;
      }
    });
    
    if (existingChat) {
      return existingChat;
    }
  }
  
  const newChat = {
    participantIds: [currentUserId, otherUserId],
    participants: [
      {
        userId: currentUserId,
        name: currentUserName,
        email: '', 
        username: currentUserName
      },
      {
        userId: otherUserId,
        name: otherUserName,
        email: otherUserEmail,
        username: otherUserName
      }
    ],
    itemId: itemId || null,
    itemTitle: itemTitle || null,
    createdAt: serverTimestamp()
  };
  console.log('Nuevo chat creado:', newChat);
  const docRef = await addDoc(collection(db, 'chats'), newChat);
  return { id: docRef.id, ...newChat } as Chat;
};

export const sendMessage = async (
  chatId: string, 
  text: string, 
  senderId: string, 
  senderName: string,
  type: 'text' | 'offer' = 'text', 
  offerAmount?: number 
) => {
  const messagesRef = collection(db, 'chats', chatId, 'messages');
  
  const messageData: any = {
    text,
    senderId,
    senderName,
    timestamp: serverTimestamp(),
    read: false,
    type 
  };

  if (type === 'offer' && offerAmount) {
    messageData.offerAmount = offerAmount;
    messageData.offerStatus = 'pending';
  }
  
  await addDoc(messagesRef, messageData);
  
  const chatRef = doc(db, 'chats', chatId);
  await updateDoc(chatRef, {
    lastMessage: type === 'offer' ? `Oferta: Bs ${offerAmount}` : text,
    lastMessageTime: serverTimestamp()
  });
};

export const updateOfferStatus = async (
  chatId: string, 
  messageId: string, 
  status: 'accepted' | 'rejected'
) => {
  const messageRef = doc(db, 'chats', chatId, 'messages', messageId);
  await updateDoc(messageRef, {
    offerStatus: status
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