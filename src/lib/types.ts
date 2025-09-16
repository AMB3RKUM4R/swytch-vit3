import { Dispatch, SetStateAction, ReactNode, FormEvent } from 'react';
import { Timestamp, FieldValue } from 'firebase/firestore';

// ==========================================================
// Core Application & Global Data Types (PETverse Aligned)
// ==========================================================

export type MembershipTier = 'ecosystem' | 'gamers' | 'gold' | 'none';

export const MEMBERSHIP_TIERS = {
  ecosystem: { level: 1, name: 'Ecosystem Explorer', usdAmount: 10, contentRoute: '/ecosystem-content' },
  gamers: { level: 2, name: 'Gamer Elite', usdAmount: 25, contentRoute: '/gamers-content' },
  gold: { level: 3, name: 'Gold Sovereign', usdAmount: 100, contentRoute: '/gold-content' },
} as const;

export type SupportedCurrency = 'ETH' | 'JOULES' | 'USDT' | 'INR';

export type TransactionType = 'membership' | 'deposit' | 'withdraw' | 'level-purchase' | 'quest-reward' | 'payout' | 'connect' | 'disconnect' | 'item-purchase' | 'item-sale' | 'crypto-swap';
export type TransactionStatus = 'success' | 'pending' | 'failed' | 'approved' | 'completed' | 'rejected';

// ==========================================================
// Firestore Document Interfaces (PETverse Aligned)
// ==========================================================

// This represents a unique item INSTANCE in a player's inventory.
export interface InventoryItem {
  itemId: string;       // Reference to the blueprint in /ItemDefinitions
  acquiredAt: Timestamp;
  isListed?: boolean;
}

// This is the blueprint for an item, fetched from the /ItemDefinitions collection.
export interface ItemDefinition {
  id: string; // The document ID
  itemName: string;
  itemType: 'weapon' | 'armor' | 'consumable' | 'character_skin' | 'title';
  rarity: 'E-Rank' | 'D-Rank' | 'C-Rank' | 'B-Rank' | 'A-Rank' | 'S-Rank';
  description: string;
  gc2PlayerType?: string | null;
  levelRequirement?: number;
  stats?: { [key: string]: number };
  visuals?: {
    prefabName: string;
    iconName: string;
  };
}

export interface PlayerData {
  userId: string;
  username: string;
  email: string | null;
  phoneNumber: string | null;
  joules: number;
  gold: number;
  level: number;
  xp: number;
  isPETMember: boolean;
  membership: MembershipTier;
  walletAddress: string | null;
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
  energy: number;
  mana: number;
  character: {
    selectedID: string;
    skin: string;
  } | null;
  inventory: {
    equipped: {
      weapon: string | null;
      armor: string | null;
    };
    items: {
      [instanceId: string]: InventoryItem;
    };
  } | null;
}

export interface Transaction {
  transactionId: string;
  userId: string;
  amount: number;
  currency: SupportedCurrency | 'USD';
  transactionType: TransactionType;
  status: TransactionStatus;
  timestamp: Timestamp | FieldValue;
  itemId?: string | null;
  paymentGatewayId?: string | null;
  
  // NEW: Fields for smart contract integration
  smartContractAddress?: string; // Address of the contract involved
  transactionHash?: `0x${string}`; // On-chain transaction hash
}

// ==========================================================
// Component & Page Props
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

export interface AuthModalProps {
  setShowMessage: (message: string) => void;
}

export interface PaymentModalProps {
  userId: string | null;
  setShowMessage: (message: string) => void;
  setActiveModal: (modalName: string | null) => void;
  activeModal: string | null;
}

export interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
}

export interface SwytchCardProps {
  children: ReactNode;
  gradient: string;
  className?: string;
  onClick?: () => void;
}

export interface ListForSaleModalProps {
  item: InventoryItem;
  userId: string | null;
  onClose: () => void;
  onSuccess: (item: InventoryItem) => void;
  setShowMessage: (message: string) => void;
}

export interface ChatMessage {
  id: string;
  user: string;
  avatar: string;
  message: string;
  timestamp: Timestamp;
  userId: string;
}

export interface YieldCalculatorProps {
  userId: string | null;
  handleCalculateYield: (e: FormEvent) => Promise<void>;
  setShowMessage: Dispatch<SetStateAction<string>>;
  setActiveModal: Dispatch<SetStateAction<string | null>>;
}

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

export interface Purchase {
  id: string;
  avatar: string;
  address: string;
  amount: string;
  timestamp: Date | string;
}

export interface RecentPurchasesProps {
  recentPurchases: Purchase[];
}

export interface CryptoSwapModalProps {
  onClose: () => void;
  setShowMessage: (message: string) => void;
  userId: string | null;
}