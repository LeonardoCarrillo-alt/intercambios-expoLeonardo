import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../app/config/firebase';

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
