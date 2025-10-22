import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
  signInWithCredential
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { useGoogleAuth } from '../config/googleAuth';

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
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { request, response, promptAsync } = useGoogleAuth();

  const signUp = async (email: string, password: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
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
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const signInWithGoogle = async () => {
    try {
      if (!request) {
        return { success: false, error: 'Google auth no está listo' };
      }

      const result = await promptAsync();
      
      if (result.type !== 'success') {
        return { success: false, error: 'Inicio de sesión cancelado' };
      }

      const { id_token } = result.params;
      
      if (!id_token) {
        return { success: false, error: 'No se recibió el token de Google' };
      }

      const googleCredential = GoogleAuthProvider.credential(id_token);
      const userCredential = await signInWithCredential(auth, googleCredential);
      
      return { success: true };
    } catch (error: any) {
      console.error('Error en Google Sign-In:', error);
      return { success: false, error: error.message };
    }
  };

  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    user,
    signUp,
    signIn,
    logout,
    loading,
    signInWithGoogle
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};