// src/components/context/PlayerContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { User } from 'firebase/auth';
import { doc, onSnapshot, updateDoc, addDoc, collection, serverTimestamp, setDoc, Timestamp, FieldValue } from 'firebase/firestore';
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
  idToken: string | null; 
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
  updatePlayerFirestore: (updates: Partial<PlayerData>) => Promise<void>;
  logTransaction: (txData: Omit<Transaction, 'id' | 'timestamp'>) => Promise<void>;
  updatePlayerCharacter: (avatarId: string) => Promise<void>; 

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

const createNewPlayerData = (user: User, walletAddress: `0x${string}` | undefined): PlayerData => {
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
        
        // FIX 1: Match the default object from AuthManager.cs
        character: { 
          selectedID: "Hunter", 
          skin: "default" 
        },
        // FIX 2: Match the default object from AuthManager.cs
        inventory: { 
          equipped: { weapon: null, armor: null }, 
          items: {} 
        },
        
        createdAt: now as Timestamp,
        updatedAt: now as Timestamp,
        profilePictureUrl: '',

        // FIX 3: Add the session map
        session: {
          webToken: null,
          webTokenCreatedAt: null
        }
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

  const userId = firebaseUser?.uid || null;

  // --- ID TOKEN STATE (NEW) ---
  const [idToken, setIdToken] = useState<string | null>(null);
  
  useEffect(() => {
    if (firebaseUser) {
        // Fetch the ID token whenever the user object changes
        firebaseUser.getIdToken().then(token => {
            setIdToken(token);
        }).catch(err => {
            console.error("Failed to fetch ID token:", err);
            setIdToken(null);
        });
    } else {
        setIdToken(null);
    }
  }, [firebaseUser]);
  // --- END OF ID TOKEN STATE ---


  // --- DATA FETCHING LOGIC ---
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [isPETMember, setIsPETMember] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [initialAuthCheckComplete, setInitialAuthCheckComplete] = useState(false);

  useEffect(() => {
    if (firebaseLoading) {
      return; 
    }
    
    if (!userId) {
      setPlayerData(null);
      setIsPETMember(false);
      setDataLoading(false);
      setInitialAuthCheckComplete(true);
      return;
    }

    setDataLoading(true);
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
        if (firebaseUser) {
            // This case should be rare, but handles Firestore doc deletion
            const newPlayerData = createNewPlayerData(firebaseUser, wagmiAddress);
            setDoc(playerRef, newPlayerData);
            // setPlayerData will be updated by the next snapshot event
        }
      }
      setDataLoading(false);
      setInitialAuthCheckComplete(true);
    }, (error) => {
      console.error("Firestore snapshot error:", error); 
      setDataLoading(false);
    });

    return () => unsubscribe();
  }, [userId, firebaseUser, wagmiAddress, firebaseLoading, navigate]);

  // --- CORE FUNCTIONS ---
  const updatePlayerFirestore = useCallback(async (updates: Partial<PlayerData>) => {
    if (!userId) return;
    // Use FieldValue.serverTimestamp() for updatedAt, as defined in types.ts
    await updateDoc(doc(db, 'Players', userId), { ...updates, updatedAt: serverTimestamp() as FieldValue });
  }, [userId]);

  const logTransaction = useCallback(async (txData: Omit<Transaction, 'id' | 'timestamp'>) => {
    if (!userId) return;
    await addDoc(collection(db, 'Transactions'), { 
      ...txData, 
      timestamp: serverTimestamp() as FieldValue 
    });
  }, [userId]);

  const updatePlayerCharacter = useCallback(async (avatarId: string) => {
    if (!userId) {
      console.error("No user logged in to update character.");
      throw new Error("User not authenticated");
    }
    
    const playerRef = doc(db, 'Players', userId);
    await updateDoc(playerRef, {
      'character.selectedID': avatarId,
      'updatedAt': serverTimestamp()
    });
  }, [userId]); 


  // --- FINAL CONTEXT VALUE ---
  const value = useMemo(() => ({
    // Auth State
    firebaseUser,
    wagmiAddress,
    userId: userId ?? null,
    idToken,
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
    updatePlayerCharacter, 
    
    // Auth Functions
    signInWithGoogle,
    signOutUser,
    registerWithEmail,
    signInWithEmail,
    sendPasswordReset,
    isAuthenticated,
    isAdmin,
  }), [
    firebaseUser, wagmiAddress, userId, idToken, firebaseLoading, authError, initialAuthCheckComplete,
    playerData, isPETMember, setIsPETMember, dataLoading,
    updatePlayerFirestore, logTransaction, updatePlayerCharacter, 
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