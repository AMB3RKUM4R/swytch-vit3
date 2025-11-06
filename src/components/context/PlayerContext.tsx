// src/components/context/PlayerContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { User } from 'firebase/auth';
import { doc, onSnapshot, updateDoc, addDoc, collection, serverTimestamp, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import { useAuthUserFirebase } from '@/hooks/useAuthUserFirebase';
import { useAuthUserWagmi } from '@/hooks/useAuthUserWagmi';
import { PlayerData, Transaction } from '@/lib/types';
import { useNavigate } from 'react-router-dom';

// 1. DEFINE THE SHAPE OF THE CONTEXT
interface PlayerContextType {
  // Auth State
  firebaseUser: User | null;
  wagmiAddress: `0x${string}` | undefined;
  userId: string | null;
  authLoading: boolean;
  authError: string | null; 
  initialAuthCheckComplete: boolean;

  // Player Data State
  playerData: PlayerData | null;
  isPETMember: boolean;
  setIsPETMember: React.Dispatch<React.SetStateAction<boolean>>;
  joulesBalance: number;
  goldBalance: number;
  currentLevel: number;
  dataLoading: boolean;

  // Core Functions
  updatePlayerFirestore: (updates: { [key: string]: any }) => Promise<void>;
  logTransaction: (txData: Omit<Transaction, 'transactionId' | 'timestamp'>) => Promise<void>;

  // Auth Functions
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  registerWithEmail: (email: string, password: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
}

// 2. CREATE THE CONTEXT
const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

// Helper function
const createNewPlayerData = (user: User, walletAddress: `0x${string}` | undefined): PlayerData => {
    const now = Timestamp.now();
    return {
        userId: user.uid,
        username: user.displayName || user.email?.split('@')[0] || `Hunter${Math.floor(1000 + Math.random() * 9000)}`,
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
        walletAddress: walletAddress || null, // Link wallet if available
        character: null,
        inventory: null,
        createdAt: now,
        updatedAt: now,
        profilePictureUrl: '',
    };
};

// 3. CREATE THE PROVIDER
export const PlayerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const navigate = useNavigate();

  // --- AUTH LOGIC ---
  const { address: wagmiAddress, disconnect: disconnectWagmi } = useAuthUserWagmi();
  
  const { 
    user: firebaseUser, 
    loading: firebaseLoading,
    error: authError,
    signInWithGoogle,
    signOutUser,
    registerWithEmail,
    signInWithEmail,
    sendPasswordReset,
    isAuthenticated,
    isAdmin,
  } = useAuthUserFirebase({ disconnectWagmi });

  // --- FIX: The userId *MUST* come from Firebase to satisfy your rules ---
  const userId = firebaseUser?.uid || null;

  // --- DATA FETCHING LOGIC ---
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [isPETMember, setIsPETMember] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [initialAuthCheckComplete, setInitialAuthCheckComplete] = useState(false);

  useEffect(() => {
    if (firebaseLoading) {
      return; // Wait for Firebase auth to be ready
    }
    
    // If no Firebase user, do nothing. This respects the security rules.
    if (!userId) {
      setPlayerData(null);
      setIsPETMember(false);
      setDataLoading(false);
      setInitialAuthCheckComplete(true);
      return;
    }

    setDataLoading(true);
    // This snapshot listener will now have a valid, authenticated UID
    const playerRef = doc(db, 'Players', userId);
    const unsubscribe = onSnapshot(playerRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as PlayerData;
        setPlayerData(data);
        setIsPETMember(data.isPETMember || false);
        if (window.location.pathname === '/') {
            navigate('/home');
        }
      } else {
        // Auto-create user document ONLY for a valid Firebase user
        if (firebaseUser) {
            const newPlayerData = createNewPlayerData(firebaseUser, wagmiAddress);
            // This create operation will be allowed by your rules
            setDoc(playerRef, newPlayerData);
        }
      }
      setDataLoading(false);
      setInitialAuthCheckComplete(true);
    }, (error) => {
      // This error should no longer be a permission error
      console.error("Firestore snapshot error:", error); 
      setDataLoading(false);
    });

    return () => unsubscribe();
  // We no longer depend on wagmiIsConnected for this effect
  }, [userId, firebaseUser, wagmiAddress, firebaseLoading, navigate]);

  // --- CORE FUNCTIONS (Moved from App.tsx) ---
  const updatePlayerFirestore = useCallback(async (updates: Partial<PlayerData>) => {
    if (!userId) return;
    await updateDoc(doc(db, 'Players', userId as string), { ...updates, updatedAt: serverTimestamp() });
  }, [userId]);

  const logTransaction = useCallback(async (txData: Omit<Transaction, 'transactionId' | 'timestamp'>) => {
    if (!userId) return;
    await addDoc(collection(db, 'Transactions'), { ...txData, timestamp: serverTimestamp() });
  }, [userId]);

  // --- FINAL CONTEXT VALUE ---
  const value = useMemo(() => ({
    // Auth State
    firebaseUser,
    wagmiAddress,
    userId: userId ?? null,
    authLoading: firebaseLoading,
    authError: authError, 
    initialAuthCheckComplete,

    // Player Data State
    playerData,
    isPETMember,
    setIsPETMember, 
    joulesBalance: playerData?.joules ?? 0,
    goldBalance: playerData?.gold ?? 0,
    currentLevel: playerData?.level ?? 0,
    dataLoading,

    // Core Functions
    updatePlayerFirestore,
    logTransaction,
    
    // Auth Functions
    signInWithGoogle,
    signOutUser,
    registerWithEmail,
    signInWithEmail,
    sendPasswordReset,
    isAuthenticated,
    isAdmin,
  }), [
    firebaseUser, wagmiAddress, userId, firebaseLoading, authError, initialAuthCheckComplete,
    playerData, isPETMember, setIsPETMember, dataLoading,
    updatePlayerFirestore, logTransaction,
    signInWithGoogle, signOutUser, registerWithEmail, signInWithEmail, sendPasswordReset, isAuthenticated, isAdmin
  ]);

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
};

// 4. Create the custom hook to use this context
export const usePlayer = (): PlayerContextType => {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};