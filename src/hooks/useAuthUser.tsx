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
import { PlayerData, MembershipTier } from '@/lib/types'; // Import PlayerData and MembershipTier

interface AuthUserHook {
  user: User | null;
  membership: MembershipTier | null; // Use MembershipTier for consistency
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
  const [membership, setMembership] = useState<MembershipTier | null>(null); // Use MembershipTier
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
            // Create new player document with default values based on Firestore rules
            const newPlayerData: PlayerData = {
              userId: u.uid,
              username: u.displayName || u.email?.split('@')[0] || 'New Player', // Improved default username
              email: u.email || null,
              phoneNumber: u.phoneNumber || null,
              jewels: 0,
              gold: 0,
              level: 0,
              isPETMember: false,
              membership: 'none',
              walletAddress: address || null,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
              character: null, // Default to null as per rules
              chest: null, // Default to null as per rules
              energy: 100, // Default to 100 as per rules
              mana: 100, // Default to 100 as per rules
              xp: 0, // Default to 0 as per rules
              key: null, // Default to null as per rules
              inventory: { equipped: { armor: '', weapon: '' }, items: {} }, // Default empty inventory
              lastBonusTime: null, // Default to null
            };
            await setDoc(userRef, newPlayerData);
            setMembership('none');
            setIsPETMember(false);
          } else {
            const userData = userSnap.data() as PlayerData; // Cast to PlayerData
            setMembership(userData.membership || 'none');
            setIsPETMember(userData.isPETMember || false);
            // Update walletAddress if connected and different
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
  }, [address]); // Added address as dependency to react to wallet changes

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
      const newPlayerData: PlayerData = {
        userId: newUser.uid,
        username: name || newUser.email?.split('@')[0] || 'New Player',
        email: newUser.email || null,
        phoneNumber: newUser.phoneNumber || null,
        jewels: 0,
        gold: 0,
        level: 0,
        isPETMember: false,
        membership: 'none',
        walletAddress: address || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        character: null,
        chest: null,
        energy: 100,
        mana: 100,
        xp: 0,
        key: null,
        inventory: { equipped: { armor: '', weapon: '' }, items: {} },
        lastBonusTime: null,
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
