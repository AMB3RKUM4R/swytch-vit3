// src/components/context/PlayerContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { User } from 'firebase/auth';
import { doc, onSnapshot, updateDoc, addDoc, collection, serverTimestamp, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import { useAuthUserFirebase } from '@/hooks/useAuthUserFirebase';
import { useAuthUserWagmi } from '@/hooks/useAuthUserWagmi';
import { PlayerData, Transaction } from '@/lib/types';
import { useNavigate } from 'react-router-dom';

// 1. Define the shape of the data our context will provide
interface PlayerContextType {
  // Auth State
  firebaseUser: User | null;
  wagmiAddress: `0x${string}` | undefined;
  userId: string | null;
  authLoading: boolean;
  initialAuthCheckComplete: boolean;

  // Player Data State
  playerData: PlayerData | null;
  isPETMember: boolean;
  setIsPETMember: React.Dispatch<React.SetStateAction<boolean>>; // Added for pages that use it
  joulesBalance: number;
  goldBalance: number;
  currentLevel: number;
  dataLoading: boolean;

  // Core Functions
  updatePlayerFirestore: (updates: Partial<PlayerData>) => Promise<void>;
  logTransaction: (txData: Omit<Transaction, 'transactionId' | 'timestamp'>) => Promise<void>;
}

// 2. Create the context
const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

// Helper function to create new player data
// (This is the same function from your App.tsx [cite: App.tsx])
const createNewPlayerData = (user: User, walletAddress: string | null = null): PlayerData => {
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
        walletAddress: walletAddress,
        character: null,
        inventory: null,
        createdAt: now,
        updatedAt: now,
        profilePictureUrl: '', // Default empty string  
    };
};

// 3. Create the Provider component
export const PlayerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const navigate = useNavigate();

  // --- AUTH LOGIC (Moved from App.tsx [cite: App.tsx]) ---
  const { user: firebaseUser, loading: firebaseLoading } = useAuthUserFirebase();
  const { address: wagmiAddress, isConnected: wagmiIsConnected } = useAuthUserWagmi();
  const userId = firebaseUser?.uid || (wagmiIsConnected ? wagmiAddress : null);

  // --- DATA FETCHING LOGIC (Moved from App.tsx [cite: App.tsx]) ---
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [isPETMember, setIsPETMember] = useState(false);
  const [dataLoading, setDataLoading] = useState(true); // Separate from authLoading
  const [initialAuthCheckComplete, setInitialAuthCheckComplete] = useState(false);

  useEffect(() => {
    if (firebaseLoading) {
      return; // Wait for Firebase auth to be ready
    }
    
    if (!userId) {
      setPlayerData(null);
      setIsPETMember(false);
      setDataLoading(false);
      setInitialAuthCheckComplete(true);
      return;
    }

    setDataLoading(true);
    const playerRef = doc(db, 'Players', userId as string);
    const unsubscribe = onSnapshot(playerRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as PlayerData;
        setPlayerData(data);
        setIsPETMember(data.isPETMember || false);
        // If user is on landing page, move them to home
        if (window.location.pathname === '/') {
            navigate('/home');
        }
      } else {
        // Auto-create user document if it doesn't exist [cite: App.tsx]
        if (firebaseUser) {
            const newPlayerData = createNewPlayerData(firebaseUser, wagmiAddress);
            setDoc(playerRef, newPlayerData);
        } else if (wagmiIsConnected && wagmiAddress) {
            // This logic is for wallet-only login
            const wagmiUser: User = { uid: wagmiAddress, isAnonymous: false } as User;
            const newPlayerData = createNewPlayerData(wagmiUser, wagmiAddress);
            setDoc(playerRef, newPlayerData);
        }
      }
      setDataLoading(false);
      setInitialAuthCheckComplete(true);
    }, (error) => {
      console.error("Firestore snapshot error:", error);
      setDataLoading(false);
    });

    return () => unsubscribe();
  }, [userId, firebaseUser, wagmiAddress, wagmiIsConnected, firebaseLoading, navigate]);

  // --- CORE FUNCTIONS (Moved from App.tsx [cite: App.tsx]) ---
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
    initialAuthCheckComplete,

    // Player Data State
    playerData,
    isPETMember,
    setIsPETMember, // Provide the setter
    joulesBalance: playerData?.joules ?? 0,
    goldBalance: playerData?.gold ?? 0,
    currentLevel: playerData?.level ?? 0,
    dataLoading,

    // Core Functions
    updatePlayerFirestore,
    logTransaction,
  }), [
    firebaseUser, wagmiAddress, userId, firebaseLoading, initialAuthCheckComplete,
    playerData, isPETMember, setIsPETMember, dataLoading,
    updatePlayerFirestore, logTransaction
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
