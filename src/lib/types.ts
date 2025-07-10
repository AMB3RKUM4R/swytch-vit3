// src/lib/types.ts (Final, Comprehensive, Launch-Ready Version - Last Fix)

import { Dispatch, SetStateAction } from 'react'; // Explicitly import React's types here for clarity

export type MembershipTier = "ecosystem" | "gamers" | "gold";

export const MEMBERSHIP_TIERS: Record<MembershipTier, { name: string; amount: number; usdAmount: number; contentRoute: string }> = {
  ecosystem: { name: "Ecosystem Membership", amount: 99, usdAmount: 10, contentRoute: "/ecosystem-content" },
  gamers: { name: "Gamers Membership", amount: 199, usdAmount: 49, contentRoute: "/gamers-content" },
  gold: { name: "Gold Membership", amount: 499, usdAmount: 199, contentRoute: "/gold-content" },
};

// Unified currency and transaction types
export type SupportedCurrency = "INR" | "USD" | "ETH" | "JEWELS" | "USDT";
export type TransactionType = "membership" | "deposit" | "withdraw" | "level-purchase" | "quest-reward" | "payout"; // Added more specific transaction types
export type TransactionStatus = "success" | "pending" | "failed";

// Interface for Firestore Transaction documents
export interface Transaction {
  [x: string]: any; // Allows for additional, non-strictly-defined properties
  transactionId: string;
  userId: string;
  amount: number;
  currency: SupportedCurrency;
  transactionType: TransactionType;
  status: TransactionStatus;
  timestamp: any; // Ideally firebase.firestore.Timestamp for strictness
  screenshot?: string; // Optional: for UPI payments
  itemId?: string | null; // Optional: for memberships or specific items
  game?: string; // Optional: context of the transaction
  adminId?: string; // Optional: who processed it
  paypalOrderId?: string; // Optional: for PayPal transactions
  paymentMethod?: string; // Optional: e.g., 'UPI', 'PayPal', 'Crypto'
  paymentUrl?: string; // Optional: payment redirect URL
  walletAddress?: string; // Optional: associated crypto wallet address
  updatedAt?: any; // Optional: timestamp of last update
}

// Props for the RazorTransaction component (handles UPI/screenshot-based payments)
export interface RazorTransactionProps {
  amount: number;
  currency: SupportedCurrency;
  itemId: string | null; // Nullable as not all transactions have an itemId
  transactionType: TransactionType;
  userId: string | null; // Nullable if user can start process unauthenticated
  onSuccess: (submittedItemId: string | null) => void;
  setShowMessage: Dispatch<SetStateAction<string>>;
}

// Props for the Top Navigation bar
export interface TopNavProps {
  userId: string | null;
  jewelsBalance: number;
  isPETMember: boolean;
  setShowMessage: Dispatch<SetStateAction<string>>;
  setActiveAuthModal: (modalName: 'auth' | null) => void; // Standardized modal activation
  setShowPaymentModal: (show: boolean) => void; // Direct control for payment modal
}

// Props for the Payment Modal (orchestrates payment types, renders RazorTransaction)
export interface PaymentModalProps {
  userId: string | null;
  setShowMessage: Dispatch<SetStateAction<string>>;
  setIsPETMember: Dispatch<SetStateAction<boolean>>; // FIX: Made required
  updatePlayerFirestore: (updates: Partial<any>) => Promise<void>; // FIX: Made required
}

// Props for the Bottom Navigation bar
export interface BottomNavProps {
  userId: string | null;
  jewelsBalance: number;
  isPETMember: boolean;
  setShowMessage: Dispatch<SetStateAction<string>>;
}

// Core AppProps interface - defines the shape of props passed from main.tsx's AppContent to App.tsx
// and then generally available to most top-level pages.
export interface AppProps {
  userId: string | null;
  activeModal: string | null;
  setActiveModal: Dispatch<SetStateAction<string | null>>;
  setShowMessage: Dispatch<SetStateAction<string>>;
  setIsPETMember: Dispatch<SetStateAction<boolean>>;
  updatePlayerFirestore: (updates: Partial<any>) => Promise<void>;
  jewelsBalance: number;
  goldBalance: number;
  currentLevel: number;
  isPending: boolean; // Indicates data fetching/loading state
  authLoading: boolean; // Indicates Firebase auth loading state
  mousePosition: { x: number; y: number; }; // For interactive elements
}

// PageProps - A general interface for pages that receive the full set of AppProps
// This is used by pages like Home, Vault, Market, Shop, Membership, Benefits, Community, DSPETDisclosure, DSPETPrivacy, Tokenomics, Vision.
export interface PageProps extends AppProps {}

// GamesPageProps - Extends AppProps, specific for GamesPage
export interface GamesPageProps extends AppProps {}

// Individual Game Props - For specific game components that need a subset of props
export interface GameProps extends Pick<AppProps, 'userId' | 'setIsPETMember' | 'updatePlayerFirestore' | 'setShowMessage' | 'setActiveModal'> {}

// RedDogGameProps - Specific for the RedDogGame, if it needs a unique subset
export interface RedDogGameProps extends Pick<AppProps, 'userId' | 'activeModal' | 'setActiveModal' | 'setIsPETMember' | 'setShowMessage' | 'updatePlayerFirestore'> {}

// BenefitsPageProps - Extends AppProps, specific for Benefits page
export interface BenefitsProps extends AppProps {}

// CommunityPageProps - Extends AppProps, specific for Community page
export interface CommunityProps extends AppProps {}

// DSPETDisclosurePageProps - Extends AppProps, specific for DSPETDisclosure page
export interface DSPETDisclosureProps extends AppProps {}

// DSPETPrivacyPageProps - Extends AppProps, specific for DSPETPrivacy page
export interface DSPETPrivacyProps extends AppProps {}

// LandingPageProps - Extends AppProps, specific for Landing page
export interface LandingPageProps extends AppProps {}

// TokenomicsPageProps - Extends AppProps, specific for Tokenomics page
export interface TokenomicsProps extends AppProps {}

// VisionPageProps - Extends AppProps, specific for Vision page
export interface VisionProps extends AppProps {}

// BingoGameProps - Specific for BingoGame, now correctly extends AppProps
// This ensures all props are properly typed.
export interface BingoGameProps extends AppProps {
  // All props from AppProps are included due to extension.
  // No additional props needed here based on the component's internal use.
}