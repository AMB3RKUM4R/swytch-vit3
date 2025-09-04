// src/lib/types.ts
import { Dispatch, SetStateAction } from 'react';
import { Timestamp } from 'firebase/firestore';

// ==========================================================
// Core Application & Global Data Types
// ==========================================================

export type MembershipTier = 'ecosystem' | 'gamers' | 'gold' | 'none';

export const MEMBERSHIP_TIERS = {
  ecosystem: { level: 1, name: 'Ecosystem Explorer', usdAmount: 5, contentRoute: '/ecosystem-content' },
  gamers: { level: 2, name: 'Gamer Elite', usdAmount: 15, contentRoute: '/gamers-content' },
  gold: { level: 3, name: 'Gold Sovereign', usdAmount: 50, contentRoute: '/gold-content' },
} as const;

export type SupportedCurrency = 'ETH' | 'JEWELS' | 'USDT' | 'INR';

export type TransactionType = 'membership' | 'deposit' | 'withdraw' | 'level-purchase' | 'quest-reward' | 'payout' | 'connect' | 'disconnect' | 'item-purchase' | 'item-sale' | 'crypto-swap';
export type TransactionStatus = 'success' | 'pending' | 'failed' | 'approved' | 'completed' | 'rejected';

// ==========================================================
// Firestore Document Interfaces
// ==========================================================

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  type: 'armor' | 'weapon' | 'consumable' | 'collectible';
  stats?: { attack?: number; defense?: number; energyBoost?: number; manaBoost?: number; };
  isEquipped?: boolean;
  ownerId: string;
  isListedForSale: boolean;
  listingPriceCrypto?: number | null;
  listingCurrency?: SupportedCurrency | null;
  tokenId?: string | null;
  contractAddress?: string | null;
  mintedAt?: Timestamp | null;
}

export interface PlayerData {
  userId: string;
  username: string;
  email: string | null;
  phoneNumber: string | null;
  jewels: number;
  gold: number;
  level: number;
  isPETMember: boolean;
  membership: MembershipTier;
  walletAddress: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  character: { selectedID: string; skin: string; } | null;
  chest: string | null;
  energy: number;
  mana: number;
  xp: number;
  key: string | null;
  inventory: { equipped: { armor: string; weapon: string; }; items: Record<string, InventoryItem>; } | null;
  lastBonusTime: Timestamp | null;
  quests?: Quest[];
  transactions?: Transaction[];
}

export interface Transaction {
  transactionId: string;
  userId: string;
  amount: number;
  currency: SupportedCurrency;
  transactionType: TransactionType;
  status: TransactionStatus;
  timestamp: Timestamp;
  itemId?: string | null;
  game?: string | null;
  adminId?: string | null;
  walletAddress?: string | null;
  updatedAt?: Timestamp | null;
  receivedAmount?: number;
}

// ==========================================================
// App & Page Props
// ==========================================================

export interface PageProps {
  userId: string | null;
  activeModal: string | null;
  setActiveModal: Dispatch<SetStateAction<string | null>>;
  setShowMessage: Dispatch<SetStateAction<string>>;
  setIsPETMember: Dispatch<SetStateAction<boolean>>;
  updatePlayerFirestore: (updates: Partial<PlayerData>) => Promise<void>;
  jewelsBalance: number;
  goldBalance: number;
  currentLevel: number;
  isPending: boolean;
  authLoading: boolean;
  initialAuthCheckComplete: boolean;
  isPETMember: boolean;
  logTransaction: (txData: Omit<Transaction, 'transactionId' | 'timestamp'>) => Promise<void>;
  playerData: PlayerData | null;
}

// ==========================================================
// Component Props
// ==========================================================

export interface TopNavProps {
  userId: string | null;
  jewelsBalance: number;
  isPETMember: boolean;
  setShowMessage: Dispatch<SetStateAction<string>>;
  setActiveAuthModal: (modalName: 'auth' | null) => void;
  setShowPaymentModal: (show: boolean) => void;
}

export interface BottomNavProps {
    userId: string | null;
    setShowMessage: React.Dispatch<React.SetStateAction<string>>;
    jewelsBalance: number;
    isPETMember: boolean;
    globalMessage: string;
}

export interface Quest {
  id: string;
  title: string;
  progress: number;
  goal: number;
  rewardJEWELS: number;
  rewardXP: number;
  completed: boolean;
}

// --- Shop Page Components ---

// This Purchase type is defined to match your new RecentPurchases.tsx component
export interface Purchase {
  id: string;
  avatar: string;
  address: string;
  amount: string;
  timestamp: Date | string; // Allowing string for flexibility
}

export interface RecentPurchasesProps {
  recentPurchases: Purchase[];
}
export interface PaymentModalProps {
  userId: string | null;
  setShowMessage: (message: string) => void;
  setActiveModal: (modalName: string | null) => void;
}
export interface PaymentModalProps {
  userId: string | null;
  setShowMessage: (message: string) => void;
  setActiveModal: (modalName: string | null) => void;
  activeModal: string | null; // FIX: Add this property
}