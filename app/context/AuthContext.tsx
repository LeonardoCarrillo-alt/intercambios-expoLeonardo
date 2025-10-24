import React, { createContext, useState, useContext, useEffect } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, User, GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from "../config/firebase";
import { useGoogleAuth } from "../config/googleAuth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebase";
import { useProfileStore } from "../../src/store/useProfileStore";

interface AuthContextType {
  user: User | null;
  signUp: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<{ success: boolean; error?: string }>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { request, response, promptAsync } = useGoogleAuth();
  const setProfile = useProfileStore((s) => s.setProfile);

  const signUp = async (email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      const userRef = doc(db, "users", uid);
      const snap = await getDoc(userRef);
      if (!snap.exists()) await setDoc(userRef, { email: email || null, displayName: null, role: "user", createdAt: serverTimestamp() });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setProfile({ uid: null, displayName: null, isAdmin: false });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const signInWithGoogle = async () => {
    try {
      if (!request) return { success: false, error: "Google auth no está listo" };
      const result = await promptAsync();
      if (result.type !== "success") return { success: false, error: "Inicio de sesión cancelado" };
      const { id_token } = result.params;
      if (!id_token) return { success: false, error: "No se recibió el token de Google" };
      const googleCredential = GoogleAuthProvider.credential(id_token);
      await signInWithCredential(auth, googleCredential);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userRef = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userRef);
          if (!userSnap.exists()) {
            await setDoc(userRef, { email: currentUser.email || null, displayName: currentUser.displayName || null, role: "user", createdAt: serverTimestamp() });
            setProfile({ uid: currentUser.uid, displayName: currentUser.displayName ?? currentUser.email ?? null, isAdmin: false });
          } else {
            const data = userSnap.data();
            setProfile({ uid: currentUser.uid, displayName: data.displayName ?? currentUser.displayName ?? currentUser.email ?? null, isAdmin: data.role === "admin" });
          }
        } catch {
          setProfile({ uid: currentUser.uid, displayName: currentUser.displayName ?? currentUser.email ?? null, isAdmin: false });
        }
      } else {
        setProfile({ uid: null, displayName: null, isAdmin: false });
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return <AuthContext.Provider value={{ user, signUp, signIn, signInWithGoogle, logout, loading }}>{!loading && children}</AuthContext.Provider>;
};
