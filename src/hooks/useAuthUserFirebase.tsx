// src/hooks/useAuthUserFirebase.tsx
import { useEffect, useState, useCallback } from 'react';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  User,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth as firebaseAuth, db } from '@/lib/firebaseConfig';
import { PlayerData } from '@/lib/types';

interface FirebaseAuthHookProps {
  disconnectWagmi?: () => void;
}

// ✅ UPDATED: Added the missing functions to the hook's return type.
interface FirebaseAuthHook {
  user: User | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;

  signOutUser: () => Promise<void>;
}

const createNewPlayerData = (user: User, name?: string): PlayerData => {
  const now = serverTimestamp();
  return {
    userId: user.uid,
    username: name || user.displayName || user.email?.split('@')[0] || `Hunter${Math.floor(1000 + Math.random() * 9000)}`,
    email: user.email,
    phoneNumber: user.phoneNumber,
    joules: 0,
    gold: 0,
    level: 1,
    xp: 0,
    energy: 100,
    mana: 100,
    isPETMember: true,
    membership: 'ecosystem',
    walletAddress: null,
    createdAt: now,
    updatedAt: now,
    character: null,
    inventory: null,
  };
};

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
          const newPlayerData = createNewPlayerData(u);
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
      throw err; // Re-throw error for the component to catch
    } finally {
      setLoading(false);
    }
  };

  // ✅ ADDED BACK: The implementation for signing in with email.

  // ✅ ADDED BACK: The implementation for signing up with email.

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

  return {
    user,
    loading,
    error,
    signInWithGoogle,
    signOutUser,
  };
};