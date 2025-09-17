// src/lib/types.ts
import { Dispatch, SetStateAction, ReactNode, FormEvent } from 'react';
import { Timestamp, FieldValue } from 'firebase/firestore';

// ==========================================================
// Core & Firestore Types
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

export interface InventoryItem {
  uid: string;
    walletAddress: string | null;
    displayName: string;
    email: string;
    photoURL: string;
    isPETMember: boolean;
    createdAt: Timestamp;
    updatedAt: Timestamp;
  itemId: string;
  acquiredAt: Timestamp;
  isListed?: boolean;
}
export interface ItemDefinition {
  id: string; itemName: string; itemType: 'weapon' | 'armor' | 'consumable' | 'character_skin' | 'title'; rarity: 'E-Rank' | 'D-Rank' | 'C-Rank' | 'B-Rank' | 'A-Rank' | 'S-Rank'; description: string; levelRequirement?: number; stats?: { [key: string]: number }; visuals?: { prefabName: string; iconName: string; };
}
export interface PlayerData {
  userId: string; username: string; email: string | null; phoneNumber: string | null; joules: number; gold: number; level: number; xp: number; isPETMember: boolean; membership: MembershipTier; walletAddress: string | null; createdAt: Timestamp | FieldValue; updatedAt: Timestamp | FieldValue; energy: number; mana: number; character: { selectedID: string; skin: string; } | null; inventory: { equipped: { weapon: string | null; armor: string | null; }; items: { [instanceId: string]: InventoryItem; }; } | null;
}
export interface Transaction {
  transactionId: string; userId: string; amount: number; currency: SupportedCurrency | 'USD'; transactionType: TransactionType; status: TransactionStatus; timestamp: Timestamp | FieldValue; itemId?: string | null; paymentGatewayId?: string | null; smartContractAddress?: string; transactionHash?: `0x${string}`;
}
export interface Quest {
  id: string; title: string; progress: number; goal: number; rewardJEWELS: number; rewardXP: number; completed: boolean;
}
export interface Purchase {
  id: string; avatar: string; address: string; amount: string; timestamp: Date | string;
}
export interface Level {
  id: string; name: string; cost: number; contentRoute: string; level: number;
}
export interface LeaderboardEntry {
  rank: number; name: string; level: number; joules: number; avatar: string;
}

// ==========================================================
// Component & Page Prop Interfaces (Alphabetized)
// ==========================================================
export interface ActionButtonsPanelProps {
  userId: string | null; setActiveModal: (modalName: string | null) => void; setShowMessage: (message: string) => void; handleShareOnX: () => Promise<void>;
}
export interface AuthModalProps {
  setShowMessage: (message: string) => void;
}
export interface BottomNavProps {
  userId: string | null; setShowMessage: Dispatch<SetStateAction<string>>;
}
export interface CommunityFeaturesProps {
  userId: string | null; setActiveModal: (modalName: string | null) => void; setShowMessage: (message: string) => void;
}
export interface CommunityHeroProps {
  userId: string | null; jewelsBalance?: number; setActiveModal: (modalName: string | null) => void; setShowMessage: (message: string) => void;
}
export interface CommunityRankingsProps {}
export interface CoreFeaturesShowcaseProps {
  setShowMessage: (message: string) => void;
}
export interface FeaturedCardsProps {
  setActiveModal: (modalName: string | null) => void; setShowMessage: (message: string) => void; userId: string | null;
}
export interface InventoryItemCardProps {
  instance: InventoryItem; definition: ItemDefinition; onListForSale: () => void; onEquipToggle: () => void; onUseConsumable: () => void; isEquipped: boolean;
}
export interface ListForSaleModalProps {
  itemInstance: InventoryItem; itemDefinition: ItemDefinition; instanceId: string; userId: string | null; onClose: () => void; onSuccess: (instanceId: string) => void; setShowMessage: (message: string) => void;
}
export interface LoadingScreenProps {
  message: string;
}
export interface LoadingSpinnerProps {
  message?: string; fullScreen?: boolean;
}
export interface MembershipBenefitsProps {}
export interface MembershipStatusOverviewProps {
  membership: MembershipTier; isPETMember: boolean; setActiveModal: (modalName: string | null) => void; setShowMessage: (message: string) => void;
}
export interface MessageDisplayProps {
  message: string; setShowMessage: Dispatch<SetStateAction<string>>;
}
export interface PageProps {
  userId: string | null; playerData: PlayerData | null; activeModal: string | null; setActiveModal: Dispatch<SetStateAction<string | null>>; setShowMessage: Dispatch<SetStateAction<string>>; setIsPETMember: Dispatch<SetStateAction<boolean>>; updatePlayerFirestore: (updates: Partial<PlayerData>) => Promise<void>; logTransaction: (txData: Omit<Transaction, 'transactionId' | 'timestamp'>) => Promise<void>; jewelsBalance: number; goldBalance: number; currentLevel: number; isPending: boolean; authLoading: boolean; initialAuthCheckComplete: boolean; isPETMember: boolean;
}
export interface PaymentModalProps extends PageProps {}
export interface QuickAccessGamesProps {
  userId: string | null; setActiveModal: (modalName: string | null) => void; setShowMessage: (message: string) => void;
}
export interface RecentPurchasesProps {
  recentPurchases: Purchase[];
}
export interface SwytchCardProps {
  children: ReactNode; gradient: string; className?: string; onClick?: () => void;
}
export interface SwytchErrorBoundaryProps {
  children: ReactNode; setShowMessage: Dispatch<SetStateAction<string>>; setActiveModal: Dispatch<SetStateAction<string | null>>;
}
export interface SwytchLevelsGridProps {
  userId: string | null; currentLevel: number; isPending: boolean; handlePurchaseLevel: (level: Level) => Promise<void>;
}
export interface TopNavProps {
  userId: string | null; playerData: PlayerData | null; authLoading: boolean; joulesBalance: number; setShowMessage: Dispatch<SetStateAction<string>>; setActiveAuthModal: (modalName: 'auth' | null) => void;
}
export interface TrustMarketHeroProps {
    userId: string | null; goldBalance: number; energyBalance: number; setActiveModal: (modalName: string | null) => void; setShowMessage: (message: string) => void;
}
export interface TrustProgressionProps {
    currentTrustLevel?: number; nextTrustLevelGoal?: number; trustPoints?: number;
}
export interface TrustMarketCTAProps {
  setActiveModal: (modalName: string | null) => void; setShowMessage: (message: string) => void;
}
export interface TrustRewardTiersProps {}
export interface UserInventoryDisplayProps {
  playerData: PlayerData | null; onListForSale: (instance: InventoryItem, definition: ItemDefinition, instanceId: string) => void; onEquipToggle: (instance: InventoryItem, definition: ItemDefinition, instanceId: string) => void;
}
export interface UserOverviewCardProps {
  username: string; jewelsBalance: number; goldBalance: number; isPETMember: boolean; walletAddress: string | null;
}
export interface VaultMembershipBenefitsProps {}
export interface VaultMembershipPackagesProps {
  isMember: boolean; isPending: boolean; handleMembershipPayment: (packageName: string, amount: number) => Promise<void>;
}
export interface VaultRulesProps {}
export interface VaultWalletInfoProps {
  isConnected: boolean; address: `0x${string}` | undefined; chainId: number | undefined; ensName: string | null; blockNumber: bigint | null; gasPrice: bigint | undefined; usdtBalance: { formatted: string; value: bigint; } | undefined;
}
export interface WalletSwapFormsProps {
  userId: string | null; setShowMessage: (message: string) => void;
}
export interface YieldCalculatorProps {
  userId: string | null; handleCalculateYield: (e: FormEvent) => Promise<void>; setShowMessage: Dispatch<SetStateAction<string>>; setActiveModal: Dispatch<SetStateAction<string | null>>;
}
