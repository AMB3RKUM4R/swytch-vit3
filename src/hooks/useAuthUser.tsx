// src/hooks/useAuthUser.ts
import { useEffect, useState, useCallback } from 'react';
import {
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  signOut,
  User,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth as firebaseAuth } from '../lib/firebaseConfig'; // Renamed to avoid naming conflict

// Define types for the hook's return value
interface AuthUserHook {
  user: User | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  signOutUser: () => Promise<void>;
}

export const useAuthUser = (): AuthUserHook => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth providers
  const googleProvider = new GoogleAuthProvider();
  const facebookProvider = new FacebookAuthProvider();

  // Monitor authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (u) => {
      try {
        setUser(u);
        setLoading(false);
        setError(null);
      } catch (err) {
        setError('Failed to fetch authentication state');
        setLoading(false);
        console.error('Auth state error:', err);
      }
    }, (err) => {
      // Handle errors from onAuthStateChanged
      setError(err.message || 'Authentication error occurred');
      setLoading(false);
      console.error('onAuthStateChanged error:', err);
    });

    return () => unsubscribe();
  }, []);

  // Sign in with Google
  const signInWithGoogle = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithPopup(firebaseAuth, googleProvider);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
      console.error('Google sign-in error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Sign in with Facebook
  const signInWithFacebook = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithPopup(firebaseAuth, facebookProvider);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Facebook');
      console.error('Facebook sign-in error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Sign out
  const signOutUser = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await signOut(firebaseAuth);
      setUser(null);
    } catch (err: any) {
      setError(err.message || 'Failed to sign out');
      console.error('Sign-out error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    user,
    loading,
    error,
    signInWithGoogle,
    signInWithFacebook,
    signOutUser,
  };
};