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
export type TransactionType = 'membership' | 'deposit' | 'withdraw' | 'level-purchase' | 'quest-reward' | 'payout' | 'connect' | 'disconnect' | 'item-purchase' | 'item-sale' | 'crypto-swap';
export type TransactionStatus = 'success' | 'pending' | 'failed' | 'approved' | 'completed' | 'rejected';

// FIX: This interface was incorrectly defined in the user's version, causing conflicts.
// This is the clean, correct definition.
export interface InventoryItem {
  itemId: string;
  acquiredAt: Timestamp;
  isListed?: boolean;
}
export interface ItemDefinition {
  id: string;
  itemName: string;
  itemType: 'weapon' | 'armor' | 'consumable' | 'character_skin' | 'title';
  rarity: 'E-Rank' | 'D-Rank' | 'C-Rank' | 'B-Rank' | 'A-Rank' | 'S-Rank';
  description: string;
  levelRequirement?: number;
  stats?: { [key: string]: number };
  visuals?: { prefabName: string; iconName: string; };
  price?: { [key in SupportedCurrency]?: number } & { USD?: number };
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
  character: { selectedID: string; skin: string; } | null;
  inventory: {
    equipped: { weapon: string | null; armor: string | null; };
    items: { [instanceId: string]: InventoryItem; };
  } | null;
  profilePictureUrl?: string | null; // <-- FIX: Added for 2D Avatar
}

// FIX: This interface was incorrectly defined, causing type conflicts.
// This is the clean, correct definition.
export interface Transaction {
  id?: string; // Optional doc ID
  transactionId: string;
  userId: string;
  amount: number;
  currency: SupportedCurrency | 'USD';
  transactionType: TransactionType;
  status: TransactionStatus;
  timestamp: Timestamp | FieldValue;
  itemId?: string | null;
  paymentGatewayId?: string | null;
  smartContractAddress?: string;
  transactionHash?: `0x${string}`;
}
export interface Quest {
  id: string;
  title: string;
  progress: number;
  goal: number;
  rewardJOULES: number; // <-- FIX: Corrected typo
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
// FIX: Added ChatMessage and ShopListing types
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
  itemId: string; // The ID from ItemDefinitions
  name: string;
  description: string;
  imageUrl: string;
  priceUSD: number;
  itemType: string;
  rarity: string;
  createdAt: Timestamp | FieldValue;
}


// ==========================================================
// Component & Page Prop Interfaces (Alphabetized)
// ==========================================================
// Most of these are now empty as components are self-sufficient.

export interface ActionButtonsPanelProps {} // No props needed
export interface AuthModalProps {
  setShowMessage: (message: string) => void;
}
export interface BottomNavProps {} // No props needed
export interface CommunityFeaturesProps {} // No props needed
export interface CommunityHeroProps {} // No props needed
export interface CommunityRankingsProps {} // No props needed
export interface CoreFeaturesShowcaseProps {} // No props needed
export interface FeaturedCardsProps {} // No props needed
export interface InventoryItemCardProps {
  instance: InventoryItem;
  definition: ItemDefinition;
  onListForSale: () => void;
  onEquipToggle: () => void;
  onUseConsumable: () => void;
  isEquipped: boolean;
  isListed: boolean;
  instanceId: string; // Need this to pass to modal
}
export interface ListForSaleModalProps {
  itemInstance: InventoryItem;
  itemDefinition: ItemDefinition;
  instanceId: string;
  onClose: () => void;
  onSuccess: (instanceId: string) => void;
}
export interface LoadingScreenProps {
  message: string;
}
export interface LoadingSpinnerProps {
  message?: string; fullScreen?: boolean;
}
export interface MembershipBenefitsProps {}
export interface MembershipStatusOverviewProps {} // No props needed
export interface MessageDisplayProps {} // No props needed
export interface PageProps {} // This is now empty, all pages use hooks
export interface PaymentModalProps {
  // We can add props here if we want to pass a specific item to buy
  defaultAmount?: number;
  defaultItemId?: string;
  defaultDepositType?: TransactionType;
}
export interface QuickAccessGamesProps {} // No props needed
export interface RecentPurchasesProps {} // No props needed
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
export interface SwytchLevelsGridProps {} // No props needed
export interface TopNavProps {} // No props needed
export interface TrustMarketHeroProps {} // No props needed
export interface TrustProgressionProps {} // No props needed
export interface TrustMarketCTAProps {} // No props needed
export interface TrustRewardTiersProps {}
export interface UserInventoryDisplayProps {} // No props needed
export interface UserOverviewCardProps {} // No props needed
export interface VaultMembershipBenefitsProps {}
export interface VaultMembershipPackagesProps {} // No props needed
export interface VaultRulesProps {}
export interface VaultWalletInfoProps {
  isConnected: boolean;
  address: `0x${string}` | undefined;
  chainId: number | undefined;
  ensName: string | null;
  blockNumber: bigint | null;
  gasPrice: bigint | undefined;
  // FIX: Added symbol and decimals to fix the error
  usdtBalance: {
    formatted: string;
    value: bigint;
    symbol: string;
    decimals: number;
  } | undefined;
}
export interface WalletSwapFormsProps {} // No props needed
export interface YieldCalculatorProps {} // No props needed

