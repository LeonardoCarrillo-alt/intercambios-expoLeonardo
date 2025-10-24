import { doc, getDoc, setDoc, serverTimestamp, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../app/config/firebase';
import { UserProfile } from 'firebase/auth';

export const createUserDocIfNotExists = async (payload: { uid: string; email?: string | null; displayName?: string | null }) => {
  const ref = doc(db, 'users', payload.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      email: payload.email || null,
      displayName: payload.displayName || null,
      role: 'user',
      createdAt: serverTimestamp()
    });
  }
};

export const getUserDoc = async (uid: string) => {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data();
};

export const setUserRole = async (uid: string, role: 'user' | 'admin') => {
  const ref = doc(db, 'users', uid);
  await setDoc(ref, { role }, { merge: true });
};

// services/userService.ts - AGREGAR esta función
// Obtener usuario por username
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() } as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

// Buscar usuarios por username
export const searchUsersByUsername = async (username: string): Promise<UserProfile[]> => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(
      usersRef, 
      where('username', '>=', username),
      where('username', '<=', username + '\uf8ff')
    );
    
    const querySnapshot = await getDocs(q);
    const users: UserProfile[] = [];
    
    querySnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() } as UserProfile);
    });
    
    return users;
  } catch (error) {
    console.error('Error searching users:', error);
    return [];
  }
};

// Obtener múltiples usuarios por IDs
export const getUsersByIds = async (userIds: string[]): Promise<UserProfile[]> => {
  try {
    const users: UserProfile[] = [];
    
    for (const userId of userIds) {
      const userProfile = await getUserProfile(userId);
      if (userProfile) {
        users.push(userProfile);
      }
    }
    
    return users;
  } catch (error) {
    console.error('Error getting users by IDs:', error);
    return [];
  }
};
