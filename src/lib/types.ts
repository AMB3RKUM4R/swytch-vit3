// src/lib/types.ts
import { Dispatch, SetStateAction, ReactNode, FormEvent } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Address } from 'viem/accounts';

// ==========================================================
// Core Application & Global Data Types
// ==========================================================

// Membership Tiers
export type MembershipTier = 'ecosystem' | 'gamers' | 'gold' | 'none';

export const MEMBERSHIP_TIERS = {
  ecosystem: {
    level: 1,
    name: 'Ecosystem Explorer',
    usdAmount: 5,
    contentRoute: '/ecosystem-content'
  },
  gamers: {
    level: 2,
    name: 'Gamer Elite',
    usdAmount: 15,
    contentRoute: '/gamers-content'
  },
  gold: {
    level: 3,
    name: 'Gold Sovereign',
    usdAmount: 50,
    contentRoute: '/gold-content'
  },
} as const;

// Currencies
export type SupportedCurrency = 'ETH' | 'JEWELS' | 'USDT';

// Transaction Types
export type TransactionType = 'membership' | 'deposit' | 'withdraw' | 'level-purchase' | 'quest-reward' | 'payout' | 'connect' | 'disconnect' | 'item-purchase' | 'item-sale' | 'crypto-swap';
export type TransactionStatus = 'success' | 'pending' | 'failed' | 'approved' | 'completed' | 'rejected';

// ==========================================================
// Firestore Document Interfaces (derived from security rules)
// ==========================================================

// Inventory Item structure
export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  type: 'armor' | 'weapon' | 'consumable' | 'collectible';
  stats?: {
    attack?: number;
    defense?: number;
    energyBoost?: number;
    manaBoost?: number;
  };
  isEquipped?: boolean;
  ownerId: string;
  isListedForSale: boolean;
  listingPriceCrypto?: number | null;
  listingCurrency?: SupportedCurrency | null;
  tokenId?: string | null;
  contractAddress?: string | null;
  mintedAt?: any | null;
}

// Player Data
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
  createdAt: any;
  updatedAt: any;
  character: {
    selectedID: string;
    skin: string;
  } | null;
  chest: string | null;
  energy: number;
  mana: number;
  xp: number;
  key: string | null;
  inventory: {
    equipped: {
      armor: string;
      weapon: string;
    };
    items: Record<string, InventoryItem>;
  } | null;
  lastBonusTime: any | null;
  quests?: Quest[];
}

// Transaction Data
export interface Transaction {
  transactionId: string;
  userId: string;
  amount: number;
  currency: SupportedCurrency;
  transactionType: TransactionType;
  status: TransactionStatus;
  timestamp: any;
  itemId?: string | null;
  game?: string | null;
  adminId?: string | null;
  walletAddress?: string | null;
  updatedAt?: any | null;
  receivedAmount?: number;
}

// Market Item
export interface MarketItem extends InventoryItem {
  sellerId: string;
  listedAt: any;
  buyerId?: string | null;
  soldAt?: any | null;
}

// Withdraw Request (now for crypto only)
export interface WithdrawRequest {
  uid: string;
  amount: number;
  cryptoAddress: string;
  status: TransactionStatus;
  createdAt: any | null;
}

// Wallet Data
export interface WalletData {
  balance: number;
  createdAt: any | null;
  updatedAt: any | null;
}

// ==========================================================
// App & Page Props
// ==========================================================

export interface AppProps {
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
  mousePosition: { x: number; y: number };
  initialAuthCheckComplete: boolean;
  isPETMember: boolean;
  logTransaction: (txData: Omit<Transaction, 'transactionId' | 'timestamp'>) => Promise<void>;
  // Added playerData directly to AppProps so it's available in PageProps
  playerData: PlayerData | null;
}

export interface PageProps extends AppProps {}

// Game-specific props
export interface GameProps {
  userId: string | null;
  setIsPETMember: Dispatch<SetStateAction<boolean>>;
  updatePlayerFirestore: (updates: Partial<PlayerData>) => Promise<void>;
  setShowMessage: Dispatch<SetStateAction<string>>;
  setActiveModal: Dispatch<SetStateAction<string | null>>;
  authLoading?: boolean;
  activeModal?: string | null;
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
  jewelsBalance: number;
  isPETMember: boolean;
  setShowMessage: Dispatch<SetStateAction<string>>;
  globalMessage: string;
}

export interface AuthModalProps {
  setShowMessage: Dispatch<SetStateAction<string>>;
}

export interface PaymentModalProps {
  userId: string | null;
  setShowMessage: Dispatch<SetStateAction<string>>;
  setActiveModal: Dispatch<SetStateAction<string | null>>;
}

export interface SwytchCardProps {
  children: ReactNode;
  gradient: string;
  className?: string;
  onClick?: () => void;
}

export interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
}

export interface MessageDisplayProps {
  message: string;
}

export interface SwytchErrorBoundaryProps {
  setShowMessage: React.Dispatch<SetStateAction<string>>;
  setActiveModal: React.Dispatch<SetStateAction<string | null>>;
  children: ReactNode;
}

export interface SwytchErrorBoundaryState {
  hasError: boolean;
}

// Home Page Components
export interface UserOverviewCardProps {
  username: string;
  jewelsBalance: number;
  goldBalance: number;
  isPETMember: boolean;
  userId: string | null;
  walletAddress: string | null;
}

export interface MembershipStatusOverviewProps {
  membership: MembershipTier;
  isPETMember: boolean;
  setActiveModal: (modalName: string | null) => void;
  setShowMessage: (message: string) => void;
}

export interface QuickAccessGamesProps {
  userId: string | null;
  setActiveModal: (modalName: string | null) => void;
  setShowMessage: (message: string) => void;
}

export interface CoreFeaturesShowcaseProps {
  setActiveModal: (modalName: string | null) => void;
  setShowMessage: (message: string) => void;
}

export interface ActionButtonsPanelProps {
  userId: string | null;
  setActiveModal: (modalName: string | null) => void;
  setShowMessage: (message: string) => void;
  handleShareOnX: () => Promise<void>;
}

// Inventory Page Components
export interface UserInventoryDisplayProps {
  inventory: Record<string, InventoryItem>;
  onListForSale: (item: InventoryItem) => void;
  userId: string | null;
  updatePlayerFirestore: (updates: Partial<PlayerData>) => Promise<void>;
  setShowMessage: (message: string) => void;
  setActiveModal: (modalName: string | null) => void;
  playerData: PlayerData | null;
}

export interface InventoryItemCardProps {
  item: InventoryItem;
  onListForSale: (item: InventoryItem) => void;
  onEquipToggle: (item: InventoryItem) => void;
  onUseConsumable: (item: InventoryItem) => void;
  isEquipped: boolean;
}

export interface ListForSaleModalProps {
  item: InventoryItem;
  userId: string | null;
  onClose: () => void;
  onSuccess: (item: InventoryItem) => void;
  setShowMessage: (message: string) => void;
  setActiveModal: (modalName: string | null) => void;
  updatePlayerFirestore: (updates: Partial<PlayerData>) => Promise<void>;
  playerInventoryItems: Record<string, InventoryItem>;
  playerEquipped: { armor: string; weapon: string; } | null;
}

// Marketplace Page Components
export interface MarketplaceGridProps {
  items: MarketItem[];
  onBuyItem: (item: MarketItem) => void;
  userId: string | null;
  setShowMessage: (message: string) => void;
  setActiveModal: (modalName: string | null) => void;
}

export interface MarketItemCardProps {
  item: MarketItem;
  onBuyItem: (item: MarketItem) => void;
  isOwner: boolean;
}

export interface BuyItemModalProps {
  item: MarketItem;
  userId: string | null;
  onClose: () => void;
  onSuccess: (item: MarketItem) => void;
  setShowMessage: (message: string) => void;
  setActiveModal: (modalName: string | null) => void;
}

// Vault Page Components
export interface VaultWalletInfoProps {
  isConnected: boolean;
  address: Address | undefined;
  chainId: number | undefined;
  ensName: string | null | undefined;
  blockNumber: bigint | null | undefined;
  gasPrice: bigint | undefined;
  usdtBalance: any;
}

export interface CryptoSwapModuleProps {
  userId: string | null;
  setShowMessage: (message: string) => void;
  setActiveModal: (modalName: string | null) => void;
  updatePlayerFirestore: (updates: Partial<PlayerData>) => Promise<void>;
  isConnected: boolean;
  walletAddress: string | null;
}

export interface VaultMembershipBenefitsProps {}

export interface VaultMembershipPackagesProps {
  isMember: boolean;
  isPending: boolean;
  handleMembershipPayment: (packageName: string, amount: number) => Promise<void>;
  setShowMessage: Dispatch<SetStateAction<string>>;
}

export interface VaultRulesProps {}

export interface YieldCalculatorProps {
  userId: string | null;
  handleCalculateYield: (e: FormEvent) => Promise<void>;
  setShowMessage: Dispatch<SetStateAction<string>>;
  setActiveModal: Dispatch<SetStateAction<string | null>>;
}

// Community Page Components
export interface CommunityHeroProps {
  userId: string | null;
  jewelsBalance?: number;
  setActiveModal: Dispatch<SetStateAction<string | null>>;
  setShowMessage: Dispatch<SetStateAction<string>>;
}

export interface FeatureItem {
  icon: ReactNode;
  title: string;
  description: string;
  gradient: string;
}

export interface CommunityFeaturesProps {
  userId: string | null;
  setActiveModal: (modalName: string | null) => void;
  setShowMessage: (message: string) => void;
}

export interface ChatMessage {
  id: string;
  user: string;
  avatar: string;
  message: string;
  timestamp: any;
  userId: string;
}

export interface CommunityChatProps {
  userId: string | null;
  setActiveModal: (modalName: string | null) => void;
  setShowMessage: (message: string) => void;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  jewels: number;
  level: string;
  avatar: string;
}

export interface CommunityRankingsProps {
  userId: string | null;
  setActiveModal: (modalName: string | null) => void;
  setShowMessage: (message: string) => void;
  leaderboard: LeaderboardEntry[];
}

// Games Page Components
export interface Quest {
  id: string;
  title: string;
  progress: number;
  goal: number;
  rewardJEWELS: number;
  rewardXP: number;
  completed: boolean;
}

export interface SwytchDailyQuestsProps {
  userId: string | null;
  quests: Quest[];
  setQuests: React.Dispatch<SetStateAction<Quest[]>>;
  jewelsBalance: number;
  saveStateToFirestore: (updates: Partial<PlayerData>) => Promise<void>;
  setActiveModal: Dispatch<SetStateAction<string | null>>;
  setShowMessage: Dispatch<SetStateAction<string>>;
}

// Membership Page Components
export interface MembershipBenefitsProps {}

export interface MembershipUpgradeProps {
  userId: string | null;
  setIsPETMember: React.Dispatch<SetStateAction<boolean>>;
  updatePlayerFirestore: (updates: Partial<PlayerData>) => Promise<void>;
  setActiveModal: React.Dispatch<SetStateAction<string | null>>;
  setShowMessage: Dispatch<SetStateAction<string>>;
}

export interface SwytchLevelsGridProps {
  userId: string | null;
  currentLevel: number;
  isPending: boolean;
  authLoading: boolean;
  updatePlayerFirestore: (updates: Partial<PlayerData>) => Promise<void>;
  handlePurchaseLevel: (level: { id: string; name: string; cost: number; contentRoute: string, level: number; }) => Promise<void>;
  setActiveModal: Dispatch<SetStateAction<string | null>>;
  setShowMessage: Dispatch<SetStateAction<string>>;
}

// Shop Page Components
export interface Purchase {
  id: string;
  avatar: string;
  address: string;
  amount: string;
  timestamp: any;
}

export interface WalletSwapFormsProps {
  userId: string | null;
  setShowMessage: (message: string) => void;
  updatePlayerFirestore: (updates: Partial<PlayerData>) => Promise<void>;
}

export interface RecentPurchasesProps {
  recentPurchases: Purchase[];
}

// Disclosure Page Components
export interface Benefit {
  icon: LucideIcon;
  title: string;
  description: string;
  details: string;
}

export interface Dont {
  title: string;
  description: string;
  details: string;
  icon?: LucideIcon;
}

export interface DisclosureHeaderProps {}

export interface DisclosureContentProps {}

// ==========================================================
// Game-specific Interfaces
// ==========================================================
export interface Card {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  value: '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';
  numericValue: number;
}

export interface GameRoom {
  deck: Card[];
  dealerHand: Card[];
  playerHands: { [userId: string]: { hand: Card[]; bet: number; won: boolean; payout: number } };
  phase: 'IDLE' | 'PLAYING' | 'RESULT';
  activePlayer: string | null;
  result: string;
  players: string[];
  game: string;
  roomId: string;
}

export interface BingoCell {
  number: number;
  marked: boolean;
}

export interface BingoCard {
  cells: BingoCell[][];
  playerId: string;
}

export interface GameState {
  roomId: string;
  players: { [playerId: string]: PlayerInRoom };
  calledNumbers: number[];
  status: 'waiting' | 'playing' | 'ended';
  winner: string | null;
  currentCallerId: string | null;
  lastCalledNumber: number | null;
  createdAt?: any;
}

export interface PlayerInRoom {
  name: string;
  jewels: number;
  card: BingoCard;
  isReady: boolean;
}

export interface GameConfig {
  bet: number;
  useJewels: boolean;
}

export interface Stats {
  plays: number;
  wins: number;
  losses: number;
  biggestWin: number;
}

export interface Reward {
  jewels: number;
  xp: number;
  message: string;
}
export interface Transaction {
  transactionId: string;
  userId: string;
  amount: number;
  currency: SupportedCurrency;
  transactionType: TransactionType;
  status: TransactionStatus;
  timestamp: any;
  receivedAmount?: number;
}