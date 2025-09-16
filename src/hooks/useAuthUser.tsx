import { useEffect, useState, useCallback } from 'react';
import {
  GoogleAuthProvider,
  FacebookAuthProvider,
  TwitterAuthProvider,
  GithubAuthProvider,
  OAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User,
  onAuthStateChanged,
  signInWithPhoneNumber,
  ConfirmationResult,
  ApplicationVerifier,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth as firebaseAuth, db } from '@/lib/firebaseConfig';
import { useAccount } from 'wagmi';
import { PlayerData, MembershipTier } from '@/lib/types';

interface AuthUserHook {
  user: User | null;
  membership: MembershipTier | null;
  isPETMember: boolean;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  signInWithTwitter: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  signInWithMicrosoft: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name?: string) => Promise<void>;
  signInWithPhone: (phoneNumber: string, appVerifier: ApplicationVerifier) => Promise<ConfirmationResult>;
  signOutUser: () => Promise<void>;
}

export const useAuthUser = (): AuthUserHook => {
  const [user, setUser] = useState<User | null>(null);
  const [membership, setMembership] = useState<MembershipTier | null>(null);
  const [isPETMember, setIsPETMember] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { address } = useAccount();

  const googleProvider = new GoogleAuthProvider();
  const facebookProvider = new FacebookAuthProvider();
  const twitterProvider = new TwitterAuthProvider();
  const githubProvider = new GithubAuthProvider();
  const microsoftProvider = new OAuthProvider('microsoft.com');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (u) => {
      try {
        setLoading(true);
        setUser(u);
        if (u) {
          const userRef = doc(db, 'Players', u.uid);
          const userSnap = await getDoc(userRef);
          if (!userSnap.exists()) {
            // FIX: Updated `newPlayerData` to strictly match the Firestore rules
            const newPlayerData: PlayerData = {
              userId: u.uid,
              username: u.displayName || u.email?.split('@')[0] || 'New Player',
              email: u.email || null,
              phoneNumber: u.phoneNumber || null,
              joules: 0,
              gold: 0,
              level: 1,
              isPETMember: true,
              membership: 'ecosystem',
              walletAddress: address || null,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
              character: null,
              energy: 100,
              mana: 100,
              xp: 0,
              inventory: null, // As per rules, inventory is not created on first login
            };
            await setDoc(userRef, newPlayerData);
            setMembership('ecosystem');
            setIsPETMember(true);
          } else {
            const userData = userSnap.data() as PlayerData;
            setMembership(userData.membership || 'none');
            setIsPETMember(userData.isPETMember || false);
            if (address && userData.walletAddress !== address) {
              await setDoc(userRef, { walletAddress: address, updatedAt: serverTimestamp() }, { merge: true });
            }
          }
        } else {
          setMembership(null);
          setIsPETMember(false);
        }
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch authentication state');
        console.error('Auth state error:', err);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [address]);

  const handleSignInPopup = async (provider: any) => {
    setLoading(true);
    setError(null);
    try {
      await signInWithPopup(firebaseAuth, provider);
    } catch (err: any) {
      setError(err.message || 'Sign-in failed');
      console.error('Popup sign-in error:', err);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = () => handleSignInPopup(googleProvider);
  const signInWithFacebook = () => handleSignInPopup(facebookProvider);
  const signInWithTwitter = () => handleSignInPopup(twitterProvider);
  const signInWithGithub = () => handleSignInPopup(githubProvider);
  const signInWithMicrosoft = () => handleSignInPopup(microsoftProvider);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(firebaseAuth, email, password);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with email');
      console.error('Email sign-in error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const signUpWithEmail = useCallback(async (email: string, password: string, name?: string) => {
    setLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      const newUser = userCredential.user;
      const userRef = doc(db, 'Players', newUser.uid);
      // FIX: Updated `newPlayerData` to strictly match the Firestore rules
      const newPlayerData: PlayerData = {
        userId: newUser.uid,
        username: name || newUser.email?.split('@')[0] || 'New Player',
        email: newUser.email || null,
        phoneNumber: newUser.phoneNumber || null,
        joules: 0,
        gold: 0,
        level: 1,
        isPETMember: true,
        membership: 'ecosystem',
        walletAddress: address || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        character: null,
        energy: 100,
        mana: 100,
        xp: 0,
        inventory: null,
      };
      await setDoc(userRef, newPlayerData);
    } catch (err: any) {
      setError(err.message || 'Failed to sign up with email');
      console.error('Email sign-up error:', err);
    } finally {
      setLoading(false);
    }
  }, [address]);

  const signInWithPhone = useCallback(async (phoneNumber: string, appVerifier: ApplicationVerifier) => {
    setLoading(true);
    setError(null);
    try {
      const confirmationResult = await signInWithPhoneNumber(firebaseAuth, phoneNumber, appVerifier);
      return confirmationResult;
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with phone number');
      console.error('Phone sign-in error:', err);
      throw err;
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
      setIsPETMember(false);
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
    isPETMember,
    loading,
    error,
    signInWithGoogle,
    signInWithFacebook,
    signInWithTwitter,
    signInWithGithub,
    signInWithMicrosoft,
    signInWithEmail,
    signUpWithEmail,
    signInWithPhone,
    signOutUser,
  };
};