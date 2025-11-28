import {Dispatch, SetStateAction, ReactNode} from 'react';
import {Timestamp, FieldValue} from 'firebase/firestore';

// ==========================================================
// Core & Firestore Types
// ==========================================================
export type MembershipTier = 'ecosystem' | 'gamers' | 'gold' | 'none';
export const MEMBERSHIP_TIERS = {
  ecosystem: {level: 1, name: 'Ecosystem Explorer', usdAmount: 10, contentRoute: '/ecosystem-content'},
  gamers: {level: 2, name: 'Gamer Elite', usdAmount: 25, contentRoute: '/gamers-content'},
  gold: {level: 3, name: 'Gold Sovereign', usdAmount: 100, contentRoute: '/gold-content'},
} as const;

export type SupportedCurrency = 'ETH' | 'JOULES' | 'USDT' | 'INR';
export type TransactionType = 'membership' | 'deposit' | 'withdraw' | 'level-purchase' | 'quest-reward' | 'payout' | 'connect' | 'disconnect' | 'item-purchase' | 'item-sale' | 'crypto-swap' | 'ad_reward' | 'loot_drop' | 'game_reward';
export type TransactionStatus = 'success' | 'pending' | 'failed' | 'approved' | 'completed' | 'rejected' | 'withdrawal_processing' | 'withdrawal_pending' | 'withdrawal_failed';

export interface InventoryItem {
  itemId: string;
  acquiredAt: Timestamp | FieldValue; // Use FieldValue for consistency in Functions
  isListed?: boolean;
}
export interface ItemDefinition {
  id: string;
  itemName: string;
  itemType: 'weapon' | 'armor' | 'consumable' | 'character_skin' | 'title';
  rarity: 'E-Rank' | 'D-Rank' | 'C-Rank' | 'B-Rank' | 'A-Rank' | 'S-Rank';
  description: string;
  levelRequirement?: number;
  stats?: {[key: string]: number};
  visuals?: {prefabName: string; iconName: string;};
  price?: {[key in SupportedCurrency]?: number} & {USD?: number};
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
  character: {selectedID: string; skin: string;} | null;
  inventory: {
    equipped: {weapon: string | null; armor: string | null;};
    items: {[instanceId: string]: InventoryItem;};
  } | null;
  profilePictureUrl?: string | null;
  session?: { // Optional on server, but typically defined on create
    webToken: string | null;
    webTokenCreatedAt: Timestamp | FieldValue | null;
  }
}

export interface Transaction {
  id?: string;
  transactionId: string;
  userId: string;
  amount: number;
  currency: SupportedCurrency | 'USD' | 'INR';
  transactionType: TransactionType;
  status: TransactionStatus;
  timestamp: Timestamp | FieldValue;
  itemId?: string | null;
  paymentGatewayId?: string | null;
  smartContractAddress?: string;
  transactionHash?: string; // Changed to string for server-side compatibility
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
export interface Purchase {
  id: string;
  avatar: string;
  address: string;
  amount: string;
  timestamp: Date | string;
}
export interface Level {
  id: string;
  name: string;
  cost: number;
  contentRoute: string;
  level: number;
}
export interface LeaderboardEntry {
  rank: number;
  name: string;
  level: number;
  joules: number;
  avatar: string;
}
export interface ChatMessage {
  id?: string;
  userId: string;
  username: string;
  profilePictureUrl: string | null;
  text: string;
  timestamp: Timestamp | FieldValue;
}
export interface ShopListing {
  priceInJoules: number;
  type: ReactNode;
  id?: string;
  itemId: string;
  name: string;
  description: string;
  imageUrl: string;
  priceUSD: number;
  itemType: string;
  rarity: string;
  createdAt: Timestamp | FieldValue;
}


// ==========================================================
// Component & Page Prop Interfaces (Excluded from Functions build, but defined for completeness)
// ==========================================================

export interface ActionButtonsPanelProps {} 
export interface AuthModalProps { setShowMessage: (message: string) => void; }
export interface BottomNavProps {} 
export interface CommunityFeaturesProps {} 
export interface CommunityHeroProps {} 
export interface CommunityRankingsProps {} 
export interface CoreFeaturesShowcaseProps {} 
export interface FeaturedCardsProps {} 
export interface InventoryItemCardProps {
  instance: InventoryItem;
  definition: ItemDefinition;
  onListForSale: () => void;
  onEquipToggle: () => void;
  onUseConsumable: () => void;
  isEquipped: boolean;
  isListed: boolean;
  instanceId: string; 
}
export interface ListForSaleModalProps {
  itemInstance: InventoryItem;
  itemDefinition: ItemDefinition;
  instanceId: string;
  onClose: () => void;
  onSuccess: (instanceId: string) => void;
}
export interface LoadingScreenProps { message: string; }
export interface LoadingSpinnerProps { message?: string; fullScreen?: boolean; }
export interface MembershipBenefitsProps {}
export interface MembershipStatusOverviewProps {} 
export interface MessageDisplayProps {} 
export interface PageProps {} 
export interface PaymentModalProps {
  defaultAmount?: number;
  defaultItemId?: string;
  defaultDepositType?: TransactionType;
}
export interface QuickAccessGamesProps {} 
export interface RecentPurchasesProps {} 
export interface SwytchCardProps {
  children: ReactNode;
  variant: 'default' | 'holographic';
  className?: string;
  onClick?: () => void;
}
export interface SwytchErrorBoundaryProps {
  children: ReactNode;
  setShowMessage: Dispatch<SetStateAction<string>>;
  setActiveModal: Dispatch<SetStateAction<string | null>>;
}
export interface SwytchLevelsGridProps {} 
export interface TopNavProps {} 
export interface TrustMarketHeroProps {} 
export interface TrustProgressionProps {} 
export interface TrustMarketCTAProps {} 
export interface TrustRewardTiersProps {}
export interface UserInventoryDisplayProps {} 
export interface UserOverviewCardProps {} 
export interface VaultMembershipBenefitsProps {}
export interface VaultMembershipPackagesProps {} 
export interface VaultRulesProps {}
export interface VaultWalletInfoProps {
  isConnected: boolean;
  address: `0x${string}` | undefined;
  chainId: number | undefined;
  ensName: string | null;
  blockNumber: bigint | null;
  gasPrice: bigint | undefined;
  usdtBalance: {
    formatted: string;
    value: bigint;
    symbol: string;
    decimals: number;
  } | undefined;
}
export interface WalletSwapFormsProps {} 
export interface YieldCalculatorProps {}