import { Timestamp, FieldValue } from 'firebase/firestore';

// --- ECONOMY CONSTANTS ---
export const GAME_COST = 30; 
export const MEMBERSHIP_BONUS_GOLD = 100; 

export type TransactionType = 'deposit' | 'withdraw' | 'item-purchase' | 'membership' | 'game-reward' | 'quest-reward' | 'game-fee';
export type SupportedCurrency = 'USD' | 'INR' | 'ETH' | 'JOULES' | 'GOLD';
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'success';

export type Rarity = 'E-Rank' | 'D-Rank' | 'C-Rank' | 'B-Rank' | 'A-Rank' | 'S-Rank' | 'Common' | 'Rare' | 'Legendary' | 'System_Admin';

export type MembershipTier = 'none' | 'ecosystem' | 'lifetime';

export interface PlayerData {
  userId: string;
  username: string;
  email: string;
  profilePictureUrl?: string;
  joules: number;
  gold: number;
  level: number;
  xp: number;
  energy: number;
  mana: number;
  membership: MembershipTier; 
  isPETMember: boolean;
  inventory: {
    items: Record<string, InventoryItem>;
    equipped: {
      weapon?: string;
      armor?: string;
    };
  };
  character: {
    selectedID: string;
    unlocked: string[];
  };
  walletAddress?: string;
  stats: Record<string, number>;
  achievements: string[];
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
  lastActive: Timestamp | FieldValue;
  isAdmin?: boolean;
}

export interface InventoryItem {
  itemId: string;
  obtainedAt: Timestamp;
  isListed?: boolean;
  listingPrice?: string;
  instanceId?: string; 
}

export interface ItemDefinition {
  id: string;
  itemName: string;
  itemType: 'weapon' | 'armor' | 'consumable' | 'artifact' | 'yield_boost' | 'insurance' | 'access_key' | 'cosmetic';
  rarity: Rarity;
  description: string;
  levelRequirement: number;
  stats?: Record<string, number>;
  visuals: {
    prefabName?: string;
    iconName?: string; 
    iconPath?: string; 
  };
  price: {
    gold?: number;
    usd?: number;    
    eth?: number;
    joules?: number; 
  };
}

export interface Transaction {
  id?: string; // Optional for creation, added by Firestore
  transactionId?: string;
  userId: string;
  amount: number;
  currency: SupportedCurrency;
  transactionType: TransactionType;
  status: TransactionStatus;
  timestamp?: Timestamp | FieldValue; // Optional for creation
  itemId?: string;
  paymentGatewayId?: string;
  transactionHash?: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  profilePictureUrl?: string | null;
  text: string;
  timestamp: Timestamp | FieldValue | null; 
}

export interface Quest {
  id: string;
  title: string;
  progress: number;
  goal: number;
  rewardJOULES: number;
  rewardXP: number;
  completed: boolean;
}

export interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
}

export interface SwytchErrorBoundaryProps {
  children: React.ReactNode;
  setShowMessage: (msg: string) => void;
  setActiveModal: (modal: any) => void;
}

export interface VaultWalletInfoProps {
  isConnected: boolean;
  address?: string;
  chainId?: number;
  blockNumber?: bigint | null;
  gasPrice?: bigint;
  usdtBalance?: { formatted: string; symbol: string; value: bigint };
  ensName?: string | null;
}

export interface UserInventoryDisplayProps {
  playerData: PlayerData | null;
  onListForSale: (instance: InventoryItem, def: ItemDefinition, instanceId: string) => void;
}

export interface ListForSaleModalProps {
  itemDefinition: ItemDefinition;
  instanceId: string;
  onClose: () => void;
  onSuccess: (id: string) => void;
}

export const MEMBERSHIP_TIERS: Record<string, { name: string; usdAmount: number }> = {
  ecosystem: { name: 'Ecosystem Member', usdAmount: 9.99 },
  lifetime: { name: 'Lifetime Elite', usdAmount: 29.99 },
};