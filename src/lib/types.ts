export type MembershipTier = "ecosystem" | "gamers" | "gold";

export const MEMBERSHIP_TIERS: Record<MembershipTier, { name: string; amount: number; usdAmount: number; contentRoute: string }> = {
  ecosystem: { name: "Ecosystem Membership", amount: 99, usdAmount: 10, contentRoute: "/ecosystem-content" },
  gamers: { name: "Gamers Membership", amount: 199, usdAmount: 49, contentRoute: "/gamers-content" },
  gold: { name: "Gold Membership", amount: 499, usdAmount: 199, contentRoute: "/gold-content" },
};

export interface Transaction {
  [x: string]: any; // Keep this for flexibility, but be aware of its broadness
  transactionId: string;
  userId: string;
  amount: number;
  // Updated: Added "JEWELS" and "USDT" to currency types.
  currency: "INR" | "USD" | "ETH" | "JEWELS" | "USDT";
  transactionType: "membership" | "deposit" | "withdraw";
  status: "success" | "pending" | "failed";
  timestamp: any; // Consider using `firebase.firestore.Timestamp` for better type safety
  screenshot?: string;
  itemId?: string;
  game?: string; // Added 'game' property as it's used in transactions
  adminId?: string; // Added 'adminId' property as it's used in transactions
}

export interface RazorTransactionProps {
  amount: number;
  currency: "INR" | "USD" | "JEWELS"; // Added "JEWELS"
  itemId?: string;
  transactionType: "membership" | "deposit" | "withdraw";
  userId: string;
  onSuccess: (itemId?: string) => void;
}

// Added PaymentModalProps interface here for consistency across your project
// This ensures that when PaymentModal is used, its props are correctly typed.
export interface PaymentModalProps {
  userId: string | null;
  setShowMessage: React.Dispatch<React.SetStateAction<string>>;
  setIsPETMember: React.Dispatch<React.SetStateAction<boolean>>;
  updatePlayerFirestore: (updates: Partial<any>) => Promise<void>;
}
