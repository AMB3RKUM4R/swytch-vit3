// types.ts
export type MembershipTier = "ecosystem" | "gamers" | "gold";

export const MEMBERSHIP_TIERS: Record<MembershipTier, { name: string; amount: number; usdAmount: number; contentRoute: string }> = {
  ecosystem: { name: "Ecosystem Membership", amount: 99, usdAmount: 10, contentRoute: "/ecosystem-content" },
  gamers: { name: "Gamers Membership", amount: 199, usdAmount: 49, contentRoute: "/gamers-content" },
  gold: { name: "Gold Membership", amount: 499, usdAmount: 199, contentRoute: "/gold-content" },
};

export interface Transaction {
  transactionId: string;
  userId: string;
  amount: number;
  currency: "INR" | "USD" | "ETH";
  transactionType: "membership" | "deposit" | "withdraw";
  status: "success" | "pending" | "failed";
  timestamp: any;
  screenshot?: string;
  itemId?: string;
}

export interface RazorTransactionProps {
  amount: number;
  currency: "INR" | "USD";
  itemId?: string;
  transactionType: "membership" | "deposit" | "withdraw";
  userId: string;
  onSuccess: (itemId?: string) => void;
}