// src/hooks/useAuthUserFirebase.tsx
import { useEffect, useState, useCallback } from 'react';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  User,
  onAuthStateChanged,
  // --- NEW IMPORTS ---
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore'; // Removed FieldValue
import { auth as firebaseAuth, db } from '@/lib/firebaseConfig';
import { PlayerData } from '@/lib/types';

interface FirebaseAuthHookProps {
  disconnectWagmi?: () => void;
}

// --- NEW FUNCTIONS ADDED TO THE HOOK'S RETURN TYPE ---
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

// createNewPlayerData is now only defined in PlayerContext
// We'll create a local version for the auth check
const createNewPlayerData = (user: User, name?: string): PlayerData => {
  const now = Timestamp.now(); // Use Timestamp.now() for client-side
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
    profilePictureUrl: '', // Added new field from our types
    session: {
      webToken: null,
      webTokenCreatedAt: null,
    },
  };
};

const ADMIN_UID = '0CfobCbXnPZsJwT662H4OhDrXk33'; // As seen in Players collection

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
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // --- NEW FUNCTION ---
  const registerWithEmail = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      await createUserWithEmailAndPassword(firebaseAuth, email, password);
      // The onAuthStateChanged listener will handle creating the user document
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // --- NEW FUNCTION ---
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
  
  // --- NEW FUNCTION ---
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
    registerWithEmail, // <-- NEW
    signInWithEmail,   // <-- NEW
    sendPasswordReset, // <-- NEW
    isAuthenticated,
    isAdmin,
  };
};
