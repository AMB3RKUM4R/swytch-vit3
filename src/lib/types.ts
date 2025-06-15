// src/lib/types.ts
export type MembershipTier = 'membership_basic' | 'membership_pro' | 'membership_premium';

export const MEMBERSHIP_TIERS: Record<MembershipTier, { name: string; amount: number; contentRoute: string }> = {
  membership_basic: { name: 'Basic Membership', amount: 500, contentRoute: '/basic-content' },
  membership_pro: { name: 'Pro Membership', amount: 1000, contentRoute: '/pro-content' },
  membership_premium: { name: 'Premium Membership', amount: 2000, contentRoute: '/premium-content' },
};