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

// Ensure this local function matches the logic in PlayerContext for new users
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
    
    // FIX 1 & 2: Initial data structures for character and inventory
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
    
    // FIX 3: Add the session map
    session: {
      webToken: null,
      webTokenCreatedAt: null
    },
  };
};

const ADMIN_UID = '0CfobCbXnPZsJwT662H4OhDrXk33';

export const useAuthUserFirebase = ({ disconnectWagmi }: FirebaseAuthHookProps = {}): FirebaseAuthHook => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const googleProvider = new GoogleAuthProvider();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (u) => {
      setLoading(true);
      if (u) {
        const userRef = doc(db, 'Players', u.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          // This logic is critical for new sign-ups (Google or Email)
          const newPlayerData = createNewPlayerData(u, null);
          await setDoc(userRef, newPlayerData);
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

  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithPopup(firebaseAuth, googleProvider);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  const registerWithEmail = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      await createUserWithEmailAndPassword(firebaseAuth, email, password);
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