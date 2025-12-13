import { createContext, useContext, useState, useEffect, ReactNode, FC } from 'react';
import { useAuthUserWagmi } from '@/hooks/useAuthUserWagmi';
import { useAuthUserFirebase } from '@/hooks/useAuthUserFirebase';
import { PlayerData, Transaction } from '@/lib/types'; 
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp, updateDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';

interface PlayerContextType {
  userId: string | null;
  playerData: PlayerData | null;
  joulesBalance: number;
  goldBalance: number;
  currentLevel: number;
  isPETMember: boolean;
  isAdmin: () => boolean;
  dataLoading: boolean;
  authLoading: boolean;
  idToken: string; // Kept for compatibility if used elsewhere, currently empty
  updatePlayerCharacter: (charId: string) => Promise<void>;
  updatePlayerFirestore: (updates: Partial<PlayerData>) => Promise<void>;
  logTransaction: (tx: Partial<Transaction>) => Promise<void>;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { address } = useAuthUserWagmi();
  const { user, loading: authLoading, isAdmin } = useAuthUserFirebase({});
  
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  // Sync Firebase User to Firestore Player Document
  useEffect(() => {
    let unsubscribe: () => void;

    const syncPlayer = async () => {
      if (user) {
        const userRef = doc(db, 'Players', user.uid);
        const snapshot = await getDoc(userRef);

        if (!snapshot.exists()) {
          // Initialize New Player with strict Type compliance
          const newPlayer: PlayerData = {
            userId: user.uid,
            username: user.displayName || `OP-${user.uid.slice(0, 4)}`,
            email: user.email || "unknown@void.net", // FIX: Fallback
            profilePictureUrl: user.photoURL || undefined,
            joules: 0,
            gold: 0,
            level: 1,
            xp: 0,
            energy: 100,
            mana: 100,
            membership: 'none',
            isPETMember: false,
            inventory: { 
                items: {}, 
                equipped: {} // FIX: Empty object is valid
            },
            character: { selectedID: "cyber_samurai", unlocked: ["cyber_samurai"] }, // FIX: Removed skin
            walletAddress: address || undefined, // FIX: Undefined if null
            stats: {},
            achievements: [],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            lastActive: serverTimestamp(),
          };
          await setDoc(userRef, newPlayer);
        } else {
            // Update Wallet if changed
            if (address && snapshot.data().walletAddress !== address) {
                await updateDoc(userRef, { walletAddress: address });
            }
        }

        // Realtime Listener
        unsubscribe = onSnapshot(userRef, (doc) => {
          if (doc.exists()) {
            setPlayerData(doc.data() as PlayerData);
          }
          setDataLoading(false);
        });
      } else {
        setPlayerData(null);
        setDataLoading(false);
      }
    };

    if (!authLoading) {
      syncPlayer();
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user, authLoading, address]);

  const updatePlayerCharacter = async (charId: string) => {
      if(!user) return;
      const userRef = doc(db, 'Players', user.uid);
      await updateDoc(userRef, {
          "character.selectedID": charId
      });
  }

  const updatePlayerFirestore = async (updates: Partial<PlayerData>) => {
      if(!user) return;
      const userRef = doc(db, 'Players', user.uid);
      await updateDoc(userRef, updates);
  }

  const logTransaction = async (tx: Partial<Transaction>) => {
      if(!user) return;
      await addDoc(collection(db, 'Transactions'), {
          ...tx,
          userId: user.uid,
          timestamp: serverTimestamp()
      });
  }

  return (
    <PlayerContext.Provider value={{
      userId: user ? user.uid : null,
      playerData,
      joulesBalance: playerData?.joules || 0,
      goldBalance: playerData?.gold || 0,
      currentLevel: playerData?.level || 1,
      isPETMember: playerData?.isPETMember || false,
      isAdmin,
      dataLoading,
      authLoading,
      idToken: "", // Placeholder if not strictly needed by current logic
      updatePlayerCharacter,
      updatePlayerFirestore,
      logTransaction
    }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};