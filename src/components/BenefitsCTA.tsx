// src/lib/types.ts (Final, Comprehensive, Launch-Ready Version - BenefitsCTAProps Fix)

import { Dispatch, SetStateAction } from 'react';
import type { Address, FeeValues} from 'viem';
import type { GetBalanceReturnType } from '@wagmi/core';


export type MembershipTier = "ecosystem" | "gamers" | "gold";

export const MEMBERSHIP_TIERS: Record<MembershipTier, { name: string; amount: number; usdAmount: number; contentRoute: string }> = {
  ecosystem: { name: "Ecosystem Membership", amount: 99, usdAmount: 10, contentRoute: "/ecosystem-content" },
  gamers: { name: "Gamers Membership", amount: 199, usdAmount: 49, contentRoute: "/gamers-content" },
  gold: { name: "Gold Membership", amount: 499, usdAmount: 199, contentRoute: "/gold-content" },
};

export type SupportedCurrency = "INR" | "USD" | "ETH" | "JEWELS" | "USDT";
export type TransactionType = "membership" | "deposit" | "withdraw" | "level-purchase" | "quest-reward" | "payout";
export type TransactionStatus = "success" | "pending" | "failed";

export interface Transaction {
  [x: string]: any;
  transactionId: string;
  userId: string;
  amount: number;
  currency: SupportedCurrency;
  transactionType: TransactionType;
  status: TransactionStatus;
  timestamp: any;
  screenshot?: string;
  itemId?: string | null;
  game?: string;
  adminId?: string;
  paypalOrderId?: string;
  paymentMethod?: string;
  paymentUrl?: string;
  walletAddress?: string;
  updatedAt?: any;
}

export interface RazorTransactionProps {
  amount: number;
  currency: SupportedCurrency;
  itemId: string | null;
  transactionType: TransactionType;
  userId: string | null;
  onSuccess: (submittedItemId: string | null) => void;
  setShowMessage: Dispatch<SetStateAction<string>>;
}

export interface TopNavProps {
  userId: string | null;
  jewelsBalance: number;
  isPETMember: boolean;
  setShowMessage: Dispatch<SetStateAction<string>>;
  setActiveAuthModal: (modalName: 'auth' | null) => void;
  setShowPaymentModal: (show: boolean) => void;
}

export interface PaymentModalProps {
  userId: string | null;
  setShowMessage: Dispatch<SetStateAction<string>>;
  setIsPETMember: Dispatch<SetStateAction<boolean>>;
  updatePlayerFirestore: (updates: Partial<any>) => Promise<void>;
}

export interface BottomNavProps {
  userId: string | null;
  jewelsBalance: number;
  isPETMember: boolean;
  setShowMessage: Dispatch<SetStateAction<string>>;
}

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
  isPending: boolean;
  authLoading: boolean;
  mousePosition: { x: number; y: number; };
}

export interface PageProps extends AppProps {}
export interface GamesPageProps extends AppProps {}
export interface GameProps extends Pick<AppProps, 'userId' | 'setIsPETMember' | 'updatePlayerFirestore' | 'setShowMessage' | 'setActiveModal'> {}
export interface RedDogGameProps extends Pick<AppProps, 'userId' | 'activeModal' | 'setActiveModal' | 'setIsPETMember' | 'setShowMessage' | 'updatePlayerFirestore'> {}
export interface BenefitsProps extends AppProps {}
export interface CommunityProps extends AppProps {}
export interface DSPETDisclosureProps extends AppProps {}
export interface DSPETPrivacyProps extends AppProps {}
export interface LandingPageProps extends AppProps {}
export interface TokenomicsProps extends AppProps {}
export interface VisionProps extends AppProps {}
export interface BlackjackGameProps extends AppProps {}
export interface AccountActionsProps extends Pick<AppProps, 'userId' | 'updatePlayerFirestore' | 'setActiveModal' | 'setShowMessage'> {
  referralViews: number;
  setReferralViews: React.Dispatch<React.SetStateAction<number>>;
}

export interface VaultWalletInfoProps {
  isConnected: boolean;
  address: Address | undefined;
  chainId: number | undefined;
  ensName: string | null | undefined;
  blockNumber: bigint | null | undefined;
  feeData: FeeValues | undefined;
  usdtBalance: GetBalanceReturnType | undefined;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
}

export interface AchievementsProps {
  achievements: Achievement[];
  userId: string | null;
  setActiveModal: Dispatch<SetStateAction<string | null>>;
  setShowMessage: Dispatch<SetStateAction<string>>;
}

export interface AdminPayoutProps {
  isConnected: boolean;
  address: Address | undefined;
  isPending: boolean;
  handlePayout: () => Promise<void>;
  payoutAddress: `0x${string}` | '';
  setPayoutAddress: React.Dispatch<React.SetStateAction<`0x${string}` | ''>>;
  payoutAmount: string;
  setPayoutAmount: React.Dispatch<React.SetStateAction<string>>;
}

// FIX: BenefitsCTAProps - Removed setShowWalletModal
export interface BenefitsCTAProps {
  userId: string | null;
  setActiveModal: React.Dispatch<React.SetStateAction<string | null>>;
  setShowMessage: React.Dispatch<React.SetStateAction<string>>;
  // Removed setShowWalletModal as it's no longer used in the component
  logUpiIntent: () => Promise<void>;
}