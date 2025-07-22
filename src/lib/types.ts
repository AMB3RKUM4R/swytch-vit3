// src/lib/types.ts
import { Dispatch, SetStateAction, ReactNode, FormEvent } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Address } from 'viem/accounts';
// import { Chain } from 'viem/chains'; // Removed Chain import as it's not directly used in types.ts interfaces

// ==========================================================
// Core Application & Global Data Types
// ==========================================================

// Membership Tiers
export type MembershipTier = 'ecosystem' | 'gamers' | 'gold' | 'none'; // Added 'none' based on Firestore rules

// Corrected: Use Exclude to get the union of string literals that are valid keys.
export const MEMBERSHIP_TIERS: Record<Exclude<MembershipTier, 'none'>, { name: string; amount: number; usdAmount: number; contentRoute: string }> = {
  ecosystem: { name: 'Ecosystem Membership', amount: 99, usdAmount: 10, contentRoute: '/ecosystem-content' },
  gamers: { name: 'Gamers Membership', amount: 199, usdAmount: 49, contentRoute: '/gamers-content' },
  gold: { name: 'Gold Membership', amount: 499, usdAmount: 199, contentRoute: '/gold-content' }, // FIX: name should be a string
};

// Currencies
export type SupportedCurrency = 'INR' | 'USD' | 'ETH' | 'JEWELS' | 'USDT';

// Transaction Types
export type TransactionType = 'membership' | 'deposit' | 'withdraw' | 'level-purchase' | 'quest-reward' | 'payout' | 'connect' | 'disconnect' | 'item-purchase' | 'item-sale' | 'crypto-swap';
export type TransactionStatus = 'success' | 'pending' | 'failed' | 'approved' | 'completed' | 'rejected';

// ==========================================================
// Firestore Document Interfaces (derived from security rules)
// ==========================================================

// Inventory Item structure (for PlayerData.inventory.items and MarketItems)
export interface InventoryItem {
  id: string; // Unique ID for the item
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
  isEquipped?: boolean; // For items in a player's inventory
  ownerId: string; // userId of the current owner
  isListedForSale: boolean;
  listingPriceCrypto?: number | null; // Price if listed on marketplace
  listingCurrency?: SupportedCurrency | null; // Currency if listed (e.g., 'ETH', 'USDT')
  tokenId?: string | null; // Blockchain token ID if minted as NFT
  contractAddress?: string | null; // Smart contract address if minted as NFT
  mintedAt?: any | null; // Firestore Timestamp if minted
}

// Player Data (from /Players/{userId} collection)
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
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
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
      armor: string; // Item ID of equipped armor
      weapon: string; // Item ID of equipped weapon
    };
    items: Record<string, InventoryItem>; // Map of item IDs to InventoryItem objects
  } | null;
  lastBonusTime: any | null; // Firestore Timestamp
  quests?: Quest[]; // Array of quests
}

// Transaction Data (from /Transactions/{transactionId} collection)
export interface Transaction {
  transactionId: string;
  userId: string;
  amount: number;
  currency: SupportedCurrency;
  transactionType: TransactionType;
  status: TransactionStatus;
  timestamp: any; // Firestore Timestamp
  screenshot?: string | null; // FIX: Made optional as storage is removed
  itemId?: string | null; // Can be membership_basic, ecosystem, etc., or an item ID
  game?: string | null; // Which game/section the transaction originated from
  adminId?: string | null;
  paypalOrderId?: string | null; // For PayPal transactions, or crypto hash
  paymentMethod?: string | null; // 'upi', 'paypal', 'crypto'
  paymentUrl?: string | null; // For UPI intent URLs
  walletAddress?: string | null; // User's crypto wallet address
  updatedAt?: any | null; // Firestore Timestamp
  paypalEmail?: string | null; // For PayPal withdrawals
}

// Wallet Data (from /wallets/{userId} collection - if used for a separate balance)
export interface WalletData {
  balance: number;
  createdAt: any | null; // Firestore Timestamp
  updatedAt: any | null; // Firestore Timestamp
}

// Withdraw Request (from /withdraw_requests/{requestId} collection)
export interface WithdrawRequest {
  uid: string;
  amount: number;
  upiRef: string; // UPI Reference ID or similar for fiat withdrawals
  status: TransactionStatus;
  createdAt: any | null; // Firestore Timestamp
  razorpayPaymentId: string | null;
  paymentConfirmed: boolean | null;
  screenshot: string | null; // Screenshot of payment confirmation
}

// User Metadata (from /users/{userId} collection - if distinct from Players)
export interface UserMetadata {
  referralCode: string | null;
  membership: MembershipTier | null;
  chips: number | null; // Assuming 'chips' is another in-game currency
}

// Market Item (for /MarketItems/{itemId} collection)
export interface MarketItem extends InventoryItem {
  sellerId: string; // userId of the seller
  listedAt: any; // Firestore Timestamp
  buyerId?: string | null; // userId of the buyer if sold
  soldAt?: any | null; // Firestore Timestamp if sold
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
  initialAuthCheckComplete: boolean; // FIX: Added initialAuthCheckComplete to AppProps
}

export interface PageProps extends AppProps {}

// Game-specific props (for individual game components if they were still routed)
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
// Component Props (from all components provided)
// ==========================================================

// Global Components
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
  globalMessage: string; // FIX: Added globalMessage to BottomNavProps
}

export interface AuthModalProps {
  setShowMessage: Dispatch<SetStateAction<string>>;
}

export interface PaymentModalProps {
  userId: string | null;
  setShowMessage: Dispatch<SetStateAction<string>>;
  setIsPETMember: Dispatch<SetStateAction<boolean>>;
  updatePlayerFirestore: (updates: Partial<PlayerData>) => Promise<void>;
}

export interface RazorTransactionProps {
  amount: number;
  currency: SupportedCurrency;
  itemId: string | null;
  transactionType: TransactionType;
  userId: string | null;
  onSuccess: (submittedItemId: string | null) => void;
  setShowMessage: Dispatch<SetStateAction<string>>;
  paymentMethod?: 'upi' | 'paypal';
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
  // No setShowMessage prop here, it's expected that the component
  // that *sets* the message also handles its clearing via a timeout.
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
  onBuyItem: (item: MarketItem) => void; // FIX: onBuyItem now expects MarketItem
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
  updatePlayerFirestore: (updates: Partial<PlayerData>) => Promise<void>;
  jewelsBalance: number;
}

// Vault Page Components
export interface VaultWalletInfoProps {
  isConnected: boolean;
  address: Address | undefined;
  chainId: number | undefined;
  ensName: string | null | undefined;
  blockNumber: bigint | null | undefined;
  feeData: any;
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

export interface FiatWithdrawalFormProps {
  userId: string | null;
  setShowMessage: (message: string) => void;
  setActiveModal: (modalName: string | null) => void;
  handleWithdrawal: () => Promise<void>;
  handlePayPalWithdrawal: () => Promise<void>;
  withdrawalAmount: string;
  setWithdrawalAmount: React.Dispatch<SetStateAction<string>>;
  paypalEmail: string;
  setPaypalEmail: React.Dispatch<SetStateAction<string>>;
}

export interface VaultMembershipBenefitsProps {
  // Purely presentational
}

export interface VaultMembershipPackagesProps {
  isMember: boolean;
  isPending: boolean;
  handleMembershipPayment: (packageName: string, amount: number) => Promise<void>;
  setShowMessage: Dispatch<SetStateAction<string>>;
}

export interface VaultRulesProps {
  // Purely presentational
}

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
export interface MembershipBenefitsProps {
  // Purely presentational
}

export interface MembershipUpgradeProps {
  userId: string | null;
  setIsPETMember: React.Dispatch<SetStateAction<boolean>>;
  updatePlayerFirestore: (updates: Partial<PlayerData>) => Promise<void>;
  setActiveModal: React.Dispatch<SetStateAction<string | null>>;
  setShowMessage: Dispatch<SetStateAction<string>>;
}

export interface Level {
  id: Exclude<MembershipTier, 'none'>;
  title: string;
  cost: number;
  contentRoute: string;
  level: number;
  reward: string;
  energyRequired: string;
  perks: string[];
  icon: LucideIcon;
  image: string;
}

export interface SwytchLevelsGridProps {
  userId: string | null;
  currentLevel: number;
  isPending: boolean;
  authLoading: boolean;
  updatePlayerFirestore: (updates: Partial<PlayerData>) => Promise<void>;
  handlePurchaseLevel: (level: { id: string; name: string; cost: number; contentRoute: string }) => Promise<void>;
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

export interface DisclosureHeaderProps {
  // Purely presentational
}

export interface DisclosureContentProps {
  // Purely presentational
}

// ==========================================================
// Game-specific Interfaces (from existing game files)
// ==========================================================
// Poker/Card Game related
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

// Bingo related
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

// Generic Stats and Reward (if not part of PlayerData directly)
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
