// src/hooks/useAuthUserFirebase.tsx
import { useEffect, useState, useCallback } from 'react';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  User,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { auth as firebaseAuth, db } from '@/lib/firebaseConfig';
import { PlayerData } from '@/lib/types';

interface FirebaseAuthHookProps {
  disconnectWagmi?: () => void;
}

interface FirebaseAuthHook {
  user: User | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  registerWithEmail: (email: string, password: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
}

const ADMIN_UID = '0CfobCbXnPZsJwT662H4OhDrXk33';

// Helper to generate the initial player state
const createNewPlayerData = (user: User, walletAddress?: `0x${string}` | null): PlayerData => {
  const now = Timestamp.now();
  return {
    userId: user.uid,
    username: user.displayName || user.email?.split('@')[0] || `Hunter${Math.floor(1000 + Math.random() * 9000)}`,
    email: user.email,
    phoneNumber: user.phoneNumber || null,
    joules: 0,
    gold: 0,
    level: 1,
    xp: 0,
    energy: 100,
    mana: 100,
    isPETMember: true,
    membership: 'ecosystem',
    walletAddress: walletAddress || null,
    character: { 
      selectedID: "Hunter", 
      skin: "default" 
    },
    inventory: { 
      equipped: { weapon: null, armor: null }, 
      items: {} 
    },
    createdAt: now,
    updatedAt: now,
    profilePictureUrl: '',
    session: {
      webToken: null,
      webTokenCreatedAt: null
    },
  };
};

export const useAuthUserFirebase = ({ disconnectWagmi }: FirebaseAuthHookProps = {}): FirebaseAuthHook => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const googleProvider = new GoogleAuthProvider();

  // 1. SYNC AUTH STATE
  // This is still needed for page reloads / session restoration
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (u) => {
      setLoading(true);
      if (u) {
        // Safety check: Ensure DB doc exists on reload
        const userRef = doc(db, 'Players', u.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          // If missing on reload, create it
          await setDoc(userRef, createNewPlayerData(u, null));
        }
        setUser(u);
      } else {
        setUser(null);
      }
      setError(null);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. GOOGLE SIGN IN (Fixed Race Condition)
  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(firebaseAuth, googleProvider);
      
      // FIX: Explicitly check/create DB Doc BEFORE resolving
      const userRef = doc(db, 'Players', result.user.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        await setDoc(userRef, createNewPlayerData(result.user, null));
      }
      
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // 3. EMAIL REGISTRATION (Fixed Race Condition)
  const registerWithEmail = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      
      // FIX: Explicitly create DB Doc BEFORE resolving
      // We don't need to check if it exists; we just created the Auth User, so it's new.
      const userRef = doc(db, 'Players', result.user.uid);
      await setDoc(userRef, createNewPlayerData(result.user, null));
      
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  const signInWithEmail = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(firebaseAuth, email, password);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  const sendPasswordReset = async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      await sendPasswordResetEmail(firebaseAuth, email);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOutUser = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await signOut(firebaseAuth);
      setUser(null);
      if (disconnectWagmi) {
        disconnectWagmi();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [disconnectWagmi]);

  const isAuthenticated = useCallback(() => !!user, [user]);
  const isAdmin = useCallback(() => isAuthenticated() && user?.uid === ADMIN_UID, [user, isAuthenticated]);

  return {
    user,
    loading,
    error,
    signInWithGoogle,
    signOutUser,
    registerWithEmail,
    signInWithEmail,
    sendPasswordReset,
    isAuthenticated,
    isAdmin,
  };
};