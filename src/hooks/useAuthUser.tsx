import { useEffect, useState, useCallback } from 'react';
import {
  GoogleAuthProvider,
  FacebookAuthProvider,
  TwitterAuthProvider,
  GithubAuthProvider,
  OAuthProvider,
  signInWithPopup,
  signOut,
  User,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth as firebaseAuth, db } from '@/lib/firebaseConfig';

type MembershipTier = 'membership_basic' | 'membership_pro' | 'membership_premium';
type MembershipStatus = MembershipTier | 'none' | null;

interface AuthUserHook {
  user: User | null;
  membership: MembershipStatus;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  signInWithTwitter: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  signInWithMicrosoft: () => Promise<void>;
  signOutUser: () => Promise<void>;
}

export const useAuthUser = (): AuthUserHook => {
  const [user, setUser] = useState<User | null>(null);
  const [membership, setMembership] = useState<MembershipStatus>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const googleProvider = new GoogleAuthProvider();
  const facebookProvider = new FacebookAuthProvider();
  const twitterProvider = new TwitterAuthProvider();
  const githubProvider = new GithubAuthProvider();
  const microsoftProvider = new OAuthProvider('microsoft.com');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      firebaseAuth,
      async (u) => {
        try {
          setLoading(true);
          setUser(u);
          if (u) {
            const userRef = doc(db, 'users', u.uid);
            const userSnap = await getDoc(userRef);
            if (!userSnap.exists()) {
              await setDoc(userRef, {
                userId: u.uid,
                Name: u.displayName || 'User',
                email: u.email || '',
                PhoneNumber: u.phoneNumber || '',
                WalletBalance: 0,
                IsAdmin: false,
                CreatedAt: serverTimestamp(),
                membership: 'none',
              });
            } else {
              const userData = userSnap.data();
              setMembership((userData?.membership as MembershipStatus) || 'none');
            }
          } else {
            setMembership(null);
          }
          setError(null);
        } catch (err: any) {
          setError(err.message || 'Failed to fetch authentication state');
          console.error('Auth state error:', err);
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setError(err.message || 'Authentication error occurred');
        setLoading(false);
        console.error('onAuthStateChanged error:', err);
      }
    );

    return () => unsubscribe();
  }, []);

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

  const signInWithTwitter = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithPopup(firebaseAuth, twitterProvider);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Twitter');
      console.error('Twitter sign-in error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const signInWithGithub = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithPopup(firebaseAuth, githubProvider);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with GitHub');
      console.error('GitHub sign-in error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const signInWithMicrosoft = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithPopup(firebaseAuth, microsoftProvider);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Microsoft');
      console.error('Microsoft sign-in error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const signOutUser = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await signOut(firebaseAuth);
      setUser(null);
      setMembership(null);
    } catch (err: any) {
      setError(err.message || 'Failed to sign out');
      console.error('Sign-out error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    user,
    membership,
    loading,
    error,
    signInWithGoogle,
    signInWithFacebook,
    signInWithTwitter,
    signInWithGithub,
    signInWithMicrosoft,
    signOutUser,
  };
};