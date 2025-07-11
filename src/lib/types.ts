
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

export interface GameProps extends Pick<AppProps, 'userId' | 'setIsPETMember' | 'updatePlayerFirestore' | 'setShowMessage' | 'setActiveModal'> {}
export interface RedDogGameProps extends Pick<AppProps, 'userId' | 'activeModal' | 'setActiveModal' | 'setIsPETMember' | 'setShowMessage' | 'updatePlayerFirestore'> {}
export interface BenefitsProps extends AppProps {}
export interface CommunityProps extends AppProps {}
export interface DSPETDisclosureProps extends AppProps {}
export interface DSPETPrivacyProps extends AppProps {}
export interface LandingPageProps extends AppProps {}
export interface TokenomicsProps extends AppProps {}
export interface VisionProps extends AppProps {}
export interface AccountActionsProps extends Pick<AppProps, 'userId' | 'updatePlayerFirestore' | 'setActiveModal' | 'setShowMessage'> {
  referralViews: number;
  setReferralViews: React.Dispatch<React.SetStateAction<number>>;
}

export interface VaultWalletInfoProps {
  isConnected: boolean;
  chainId: number | undefined;
  ensName: string | null | undefined;
  blockNumber: bigint | null | undefined;
}

export interface VaultMembershipPackagesProps {
  isMember: boolean;
  isPending: boolean;
  handleMembershipPayment: (packageName: string, amount: number) => Promise<void>;
  setShowMessage: Dispatch<SetStateAction<string>>;
}

export interface VaultWithdrawalProps {
  isConnected: boolean;
  isMember: boolean;
  isPending: boolean;
  withdrawalAmount: string;
  setWithdrawalAmount: React.Dispatch<React.SetStateAction<string>>;
  handleWithdrawal: () => Promise<void>;
  handlePayPalPayment: () => Promise<void>;
  setShowMessage: Dispatch<SetStateAction<string>>;
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
  isPending: boolean;
  handlePayout: () => Promise<void>;
  payoutAddress: `0x${string}` | '';
  setPayoutAddress: React.Dispatch<React.SetStateAction<`0x${string}` | ''>>;
  payoutAmount: string;
  setPayoutAmount: React.Dispatch<React.SetStateAction<string>>;
}

export interface BenefitsCTAProps {
  userId: string | null;
  setActiveModal: Dispatch<SetStateAction<string | null>>;
  setShowMessage: Dispatch<SetStateAction<string>>;
  logUpiIntent: () => Promise<void>;
}

export interface BenefitsModalProps {
  title: string;
  content: string;
  onClose: () => void;
  showConnect?: boolean;
  handleWalletConnect?: () => void;
}

export interface Dont {
  title: string;
  description: string;
  details: string;
}

export interface BenefitsPitfallsProps {
  handlePitfallsView: () => void;
  userId: string | null;
  setActiveModal: Dispatch<SetStateAction<string | null>>;
  setShowMessage: Dispatch<SetStateAction<string>>;
}

export interface WalletOption {
  name: string;
  icon: LucideIcon;
}

export interface BenefitsWalletsProps {
  userId: string | null;
  setActiveModal: Dispatch<SetStateAction<string | null>>;
  setShowMessage: Dispatch<SetStateAction<string>>;
}

export interface ChatMessage {
  id: string;
  user: string;
  avatar: string;
  message: string;
  timestamp: string | any;
  userId: string;
}

export interface CommunityChatProps {
  userId: string | null;
  setActiveModal: Dispatch<SetStateAction<string | null>>;
  setShowMessage: Dispatch<SetStateAction<string>>;
}

export interface FeatureItem {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: string;
}

export interface CommunityFeaturesProps {
  userId: string | null;
  setActiveModal: Dispatch<SetStateAction<string | null>>;
  setShowMessage: Dispatch<SetStateAction<string>>;
}

export interface CommunityHeroProps {
  userId: string | null;
  jewelsBalance?: number;
  setActiveModal: Dispatch<SetStateAction<string | null>>;
  setShowMessage: Dispatch<SetStateAction<string>>;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  jewels: number;
  level: string;
  avatar: string;
}

export interface CommunityRankingsProps {
  leaderboard: LeaderboardEntry[];
  userId: string | null;
  setActiveModal: Dispatch<SetStateAction<string | null>>;
  setShowMessage: Dispatch<SetStateAction<string>>;
}

export interface ConnectWalletButtonProps {
  userId: string | null;
  setActiveModal: React.Dispatch<React.SetStateAction<string | null>>;
  setShowMessage: React.Dispatch<React.SetStateAction<string>>;
}

export interface Quest {
  id: string;
  title: string;
  progress: number;
  goal: number;
  rewardJEWELS: number;
  rewardXP: number;
  completed: boolean;
}

export interface DailyQuestsProps {
  userId: string | null;
  quests: Quest[];
  setQuests: React.Dispatch<React.SetStateAction<Quest[]>>;
  updatePlayerFirestore: (updates: Partial<any>) => Promise<void>;
  jewelsBalance: number;
  setActiveModal: Dispatch<SetStateAction<string | null>>;
  setShowMessage: Dispatch<SetStateAction<string>>;
}

export interface DAOProposal {
  id: number;
  title: string;
  description: string;
  votesFor: number;
  votesAgainst: number;
  status: 'Active' | 'Ended';
}

export interface DAOProposalsProps {
  userId: string | null;
  setActiveModal: Dispatch<SetStateAction<string | null>>;
  setShowMessage: Dispatch<SetStateAction<string>>;
}

export interface Tier {
  level: number;
  title: string;
  reward: string;
  deposit: string;
  image: string;
}

export interface DepositCalculatorProps {
  userId: string | null;
  calculateReward: (amount: string) => { tier: Tier; monthlyReward: string } | null;
}

export interface DisclosureHeaderProps {
  userId: string | null;
  jewelsBalance: number;
  setActiveModal: Dispatch<SetStateAction<string | null>>;
  setShowMessage: Dispatch<SetStateAction<string>>;
}

export interface EcosystemChatProps {
  userId: string | null;
  goldBalance: number;
  setGoldBalance: React.Dispatch<React.SetStateAction<number>>;
  updatePlayerFirestore: (updates: Partial<any>) => Promise<void>;
  setActiveModal: Dispatch<SetStateAction<string | null>>;
  setShowMessage: Dispatch<SetStateAction<string>>;
}

export interface EcosystemHeroProps {
  userId: string | null;
  goldBalance: number;
  mousePosition: { x: number; y: number; };
  setActiveModal: Dispatch<SetStateAction<string | null>>;
  setShowMessage: Dispatch<SetStateAction<string>>;
}

export interface EcosystemSectionsProps {
  // Assuming it doesn't receive props directly, but uses context
}

export interface EnergyGainsProps {
  userId: string | null;
  jewelsBalance: number;
  energyBalance: number;
  setJewelsBalance: React.Dispatch<React.SetStateAction<number>>;
  setEnergyBalance: React.Dispatch<React.SetStateAction<number>>;
  dailyClicks: number;
  setDailyClicks: React.Dispatch<React.SetStateAction<number>>;
  loginStreak: number;
  updatePlayerFirestore: (updates: Partial<any>) => Promise<void>;
  setActiveModal: Dispatch<SetStateAction<string | null>>;
  setShowMessage: Dispatch<SetStateAction<string>>;
}

export interface SwytchErrorBoundaryProps {
  setShowMessage: React.Dispatch<React.SetStateAction<string>>;
  setActiveModal: React.Dispatch<React.SetStateAction<string | null>>;
  children: ReactNode;
}

export interface SwytchErrorBoundaryState {
  hasError: boolean;
}

export interface NFTItem {
  id: number;
  img: string;
  audio: string;
  film: string;
  title: string;
  price: string;
  energyBoost: string;
  priceValue: number;
}

export interface ExploreNFTsProps {
  isPETMember: boolean;
  isPending: boolean;
  setActiveModal: Dispatch<SetStateAction<string | null>>;
  userId: string | null;
  setShowMessage: Dispatch<SetStateAction<string>>;
}

export interface FeaturedNFTsProps {
  isPETMember: boolean;
  isPending: boolean;
  setActiveModal: Dispatch<SetStateAction<string | null>>;
  userId: string | null;
  setShowMessage: Dispatch<SetStateAction<string>>;
}

export interface HeroSectionProps {
  mousePosition: { x: number; y: number; };
  setActiveModal: Dispatch<SetStateAction<string | null>>;
}

export interface Level {
  level: number;
  title: string;
  reward: string;
  energyRequired: string;
  perks: string[];
  icon: LucideIcon;
  image: string;
}

export interface MembershipLevelsProps {
  // This component appears to be purely presentational, not receiving props.
}

export interface MembershipUpgradeProps {
  userId: string | null;
  setIsPETMember: React.Dispatch<React.SetStateAction<boolean>>;
  updatePlayerFirestore: (updates: Partial<any>) => Promise<void>;
  setActiveModal: React.Dispatch<React.SetStateAction<string | null>>;
  setShowMessage: Dispatch<SetStateAction<string>>;
}

export interface MembershipBenefitsProps {
  // This component appears to be purely presentational, not receiving props.
}

export interface MembershipWalletInfoProps {
  userId: string | null;
  jewelsBalance: number;
  isPETMember: boolean;
  setShowMessage: React.Dispatch<React.SetStateAction<string>>;
  setActiveModal: React.Dispatch<React.SetStateAction<string | null>>;
}

export interface MetricsDashboardProps {
  // This component appears to be purely presentational, not receiving props.
}

export interface Metric {
  label: string;
  value: string;
  icon: JSX.Element;
}

export interface ProposalFormProps {
  userId: string | null;
  setShowMessage: Dispatch<SetStateAction<string>>;
  setActiveModal: Dispatch<SetStateAction<string | null>>;
}

export interface QuestCardProps {
  quest: Quest;
  handleClaimQuest: (id: string) => void;
  isConnected: boolean;
}

export interface Purchase {
  avatar: string;
  address: string;
  amount: string;
  timestamp: any;
}

export interface RecentPurchasesProps {
  recentPurchases: Purchase[];
}

export interface ReferralLeaderboardEntry {
  address: string;
  referrals: number;
  rewards: string;
}

export interface ReferralLeaderboardProps {
  leaderboard: ReferralLeaderboardEntry[];
}

export interface SmartContractTransactionsProps {
  // This component appears to be purely presentational, not receiving props.
}

export interface SwytchLevelsGridProps {
  userId: string | null;
  currentLevel: number;
  isPending: boolean;
  authLoading: boolean;
  updatePlayerFirestore: (updates: Partial<any>) => Promise<void>;
  handlePurchaseLevel: (level: { id: string; name: string; cost: number; contentRoute: string }) => Promise<void>;
}

export interface TestimonialsCarouselProps {
  // This component appears to be purely presentational, not receiving props.
}

export interface Testimonial {
  id: number;
  quote: string;
  author: string;
  role: string;
  avatar: string;
}

export interface VaultHeroProps {
  // This component appears to be purely presentational, not receiving props.
}

export interface VisionHeroProps {
  userId: string | null;
  jewelsBalance: number;
  setActiveModal: Dispatch<SetStateAction<string | null>>;
}

export interface VisionQuestsProps {
  quests: Quest[];
  setQuests: React.Dispatch<React.SetStateAction<Quest[]>>;
  jewelsBalance: number;
  saveStateToFirestore: (state: Partial<any>) => Promise<void>;
  handleShareOnX: () => Promise<void>;
  setActiveModal: Dispatch<SetStateAction<string | null>>;
  setShowMessage: Dispatch<SetStateAction<string>>;
}

export interface VisionSupportProps {
  userId: string | null;
  investmentAmount: string;
  setInvestmentAmount: React.Dispatch<React.SetStateAction<string>>;
  logUpiIntent: () => Promise<void>;
}

export interface VisionYourVisionProps {
  // This component appears to be purely presentational, not receiving props.
}

export interface VisionCryptoFutureProps {
  expandedSection: string | null;
  toggleSection: (section: string) => void;
}

export interface VisionOnboardingProps {
  userId: string | null;
  investmentAmount: string;
  setInvestmentAmount: React.Dispatch<React.SetStateAction<string>>;
  logUpiIntent: () => Promise<void>;
}

export interface VisionStandardProps {
  // This component appears to be purely presentational, not receiving props.
}

export interface VisionCommunityProps {
  // This component appears to be purely presentational, not receiving props.
}

export interface VisionEqualizerProps {
  expandedSection: string | null;
  toggleSection: (section: string) => void;
}

export interface VisionArchitectProps {
  // This component appears to be purely presentational, not receiving props.
}

export interface VisionCTAProps {
  userId: string | null;
  setActiveModal: Dispatch<SetStateAction<string | null>>;
  setShowMessage: Dispatch<SetStateAction<string>>;
}

export interface WalletSwapFormsProps {
  userId: string | null;
  setShowMessage: React.Dispatch<React.SetStateAction<string>>;
  updatePlayerFirestore: (updates: Partial<any>) => Promise<void>;
}

export interface YieldForm {
  deposit: string;
  quests: string;
  network: string;
  withdraw: string;
  token: string;
}

export interface YieldResult {
  baseMonthlyYield: number;
  bonusMonthlyYield: number;
  totalMonthlyYieldStart: number;
  totalValueAfter5Years: number;
  totalROIAfter5Years: number;
  averageMonthlyROIAfter5Years: number;
  tier: string;
}

export interface YieldCalculatorProps {
  userId: string | null;
  handleCalculateYield: (e: React.FormEvent) => Promise<void>;
  setShowMessage: Dispatch<SetStateAction<string>>;
  setActiveModal: Dispatch<SetStateAction<string | null>>;
}

export interface Benefit {
  title: string;
  description: string;
  details: string;
  icon: LucideIcon;
}

export interface BenefitsGridProps {
  expandedBenefit: string | null;
  toggleBenefit: (title: string) => void;
  userId: string | null;
  setActiveModal: Dispatch<SetStateAction<string | null>>;
  setShowMessage: Dispatch<SetStateAction<string>>;
}

export interface MembershipHeroProps {
  mousePosition: { x: number; y: number };
  isPETMember: boolean;
  isPending: boolean;
  authLoading: boolean;
  userId: string | null;
  payMembership: () => Promise<void>;
}

export interface BenefitsQuestsProps {
  userId: string | null;
  quests: Quest[];
  setQuests: React.Dispatch<React.SetStateAction<Quest[]>>;
  jewelsBalance: number;
  setJewelsBalance: React.Dispatch<React.SetStateAction<number>>;
  saveStateToFirestore: (updates: { jewels: number; quests: Quest[] }) => Promise<void>;
  setActiveModal: React.Dispatch<React.SetStateAction<string | null>>;
  setShowMessage: React.Dispatch<React.SetStateAction<string>>;
}

export interface CommunityHubProps {
  userId: string | null;
  setActiveModal: React.Dispatch<React.SetStateAction<string | null>>;
  setShowMessage: React.Dispatch<React.SetStateAction<string>>;
}

export interface Transaction {
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

export interface VaultMembershipPackagesProps {
  isMember: boolean;
  isPending: boolean;
  handleMembershipPayment: (packageName: string, amount: number) => Promise<void>;
  setShowMessage: Dispatch<SetStateAction<string>>;
}

export interface VaultWithdrawalProps {
  isConnected: boolean;
  isMember: boolean;
  isPending: boolean;
  withdrawalAmount: string;
  setWithdrawalAmount: React.Dispatch<React.SetStateAction<string>>;
  handleWithdrawal: () => Promise<void>;
  setShowMessage: Dispatch<SetStateAction<string>>;
}

export interface YieldCalculatorProps {
  userId: string | null;
  handleCalculateYield: (e: React.FormEvent) => Promise<void>;
  setShowMessage: Dispatch<SetStateAction<string>>;
  setActiveModal: Dispatch<SetStateAction<string | null>>;
}

// Game-specific interfaces for BingoGame and upcoming games
export interface GameProps {
  userId: string | null;
  setIsPETMember: Dispatch<SetStateAction<boolean>>;
  updatePlayerFirestore: (updates: Partial<any>) => Promise<void>;
  setShowMessage: Dispatch<SetStateAction<string>>;
  setActiveModal: Dispatch<SetStateAction<string | null>>;
  authLoading?: boolean;
  activeModal?: string | null;
}

export interface BingoGameProps extends GameProps {}

export interface BlackjackGameProps extends GameProps {}
export interface BridgeGameProps extends GameProps {}
export interface CaribbeanStudGameProps extends GameProps {}
export interface FortuneWheelGameProps extends GameProps {}
export interface HorseGameProps extends GameProps {}
export interface PontoonGameProps extends GameProps {}
export interface SolitaireGameProps extends GameProps {}

// Supporting interfaces for BingoGame
export interface BingoCell {
  number: number;
  marked: boolean;
}

export interface BingoCard {
  cells: BingoCell[][];
  playerId: string;
}

export interface PlayerInRoom {
  name: string;
  jewels: number;
  card: BingoCard;
  isReady: boolean;
}

export interface GameState {
  roomId: string;
  players: { [playerId: string]: PlayerInRoom };
  calledNumbers: number[];
  status: "waiting" | "playing" | "ended";
  winner: string | null;
  currentCallerId: string | null;
  lastCalledNumber: number | null;
  createdAt?: any; // firebase.firestore.Timestamp
}

export interface GameConfig {
  bet: number;
  useJewels: boolean;
}

export interface Stats {
  wins: number;
  losses: number;
  totalGames: number;
  highestScore: number;
}

export interface Quest {
  id: string;
  title: string;
  progress: number;
  goal: number;
  rewardJEWELS: number;
  rewardXP: number;
  completed: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
}

export interface Reward {
  jewels: number;
  xp: number;
  message: string;
}

// Game-specific interfaces for CaribbeanStudGame and other games
export interface GameProps {
  userId: string | null;
  setIsPETMember: React.Dispatch<React.SetStateAction<boolean>>;
  updatePlayerFirestore: (updates: Partial<any>) => Promise<void>;
  setShowMessage: React.Dispatch<React.SetStateAction<string>>;
  setActiveModal: React.Dispatch<React.SetStateAction<string | null>>;
  authLoading?: boolean;
  activeModal?: string | null;
}

export interface CaribbeanStudGameProps extends GameProps {}

export interface BingoGameProps extends GameProps {}
export interface BlackjackGameProps extends GameProps {}
export interface BridgeGameProps extends GameProps {}
export interface FortuneWheelGameProps extends GameProps {}
export interface HorseGameProps extends GameProps {}
export interface PontoonGameProps extends GameProps {}
export interface SolitaireGameProps extends GameProps {}

export interface Card {
  suit: Suit;
  value: Value;
  numericValue: number;
}

export interface Stats {
  plays: number;
  wins: number;
  losses: number;
  biggestWin: number;
}

export interface Quest {
  id: string;
  title: string;
  progress: number;
  goal: number;
  rewardJEWELS: number;
  rewardXP: number;
  completed: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
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

export interface Reward {
  jewels: number;
  xp: number;
  message: string;
}
export interface DisclosureChatProps {
  userId: string | null;
  goldBalance: number;
  setGoldBalance: React.Dispatch<React.SetStateAction<number>>;
  updatePlayerFirestore: (updates: Partial<any>) => Promise<void>;
  setShowMessage: React.Dispatch<React.SetStateAction<string>>;
  setActiveModal: React.Dispatch<React.SetStateAction<string | null>>;
}

export interface ChatMessage {
  id: string;
  user: string;
  avatar: string;
  message: string;
  timestamp: any; // Firestore Timestamp or string
  userId: string;
}

// Interface for EcosystemSections
export interface EcosystemSection {
  title: string;
  description: string;
  icon: ReactNode; // For JSX icon elements like <Rocket />
  image: string;
  modal: string;
}

export interface EcosystemSectionsProps {
  setActiveModal: Dispatch<SetStateAction<string | null>>;
  setShowMessage: Dispatch<SetStateAction<string>>;
}

// Interface for EnergyVault
export interface EnergyVaultProps {
  userId: string | null;
  jewelsBalance: number;
  energyBalance: number;
  setJewelsBalance: Dispatch<SetStateAction<number>>;
  setEnergyBalance: Dispatch<SetStateAction<number>>;
  dailyClicks: number;
  setDailyClicks: Dispatch<SetStateAction<number>>;
  loginStreak: number;
  updatePlayerFirestore: (updates: Partial<any>) => Promise<void>;
  setActiveModal: Dispatch<SetStateAction<string | null>>;
  setShowMessage: Dispatch<SetStateAction<string>>;
}

// Interface for FeatureCards
export interface FeatureProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface FeatureCardsProps {
  setActiveModal: Dispatch<SetStateAction<string | null>>;
  setShowMessage: Dispatch<SetStateAction<string>>;
}

export interface Transaction {
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

// App and Page Props
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
  mousePosition: { x: number; y: number };
}

export interface PageProps extends AppProps {}

// Game Interfaces
export interface GameProps {
  userId: string | null;
  setIsPETMember: Dispatch<SetStateAction<boolean>>;
  updatePlayerFirestore: (updates: Partial<any>) => Promise<void>;
  setShowMessage: Dispatch<SetStateAction<string>>;
  setActiveModal: Dispatch<SetStateAction<string | null>>;
  authLoading?: boolean;
  activeModal?: string | null;
}

export interface BingoCell {
  number: number;
  marked: boolean;
}

export interface BingoCard {
  cells: BingoCell[][];
  playerId: string;
}

export interface PlayerInRoom {
  name: string;
  jewels: number;
  card: BingoCard;
  isReady: boolean;
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

export interface GameConfig {
  bet: number;
  useJewels: boolean;
}

export interface Card {
  suit: Suit;
  value: Value;
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

// Stats and Rewards
export interface Stats {
  plays: number;
  wins: number;
  losses: number;
  biggestWin: number;
}

export interface Quest {
  id: string;
  title: string;
  progress: number;
  goal: number;
  rewardJEWELS: number;
  rewardXP: number;
  completed: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
}

export interface Reward {
  jewels: number;
  xp: number;
  message: string;
}

// Component Props
export interface EcosystemSection {
  title: string;
  description: string;
  icon: ReactNode;
  image: string;
  modal: string;
}

export interface EcosystemSectionsProps {
  setActiveModal: Dispatch<SetStateAction<string | null>>;
  setShowMessage: Dispatch<SetStateAction<string>>;
}

export interface EnergyVaultProps {
  userId: string | null;
  jewelsBalance: number;
  energyBalance: number;
  setJewelsBalance: Dispatch<SetStateAction<number>>;
  setEnergyBalance: Dispatch<SetStateAction<number>>;
  dailyClicks: number;
  setDailyClicks: Dispatch<SetStateAction<number>>;
  loginStreak: number;
  updatePlayerFirestore: (updates: Partial<any>) => Promise<void>;
  setActiveModal: Dispatch<SetStateAction<string | null>>;
  setShowMessage: Dispatch<SetStateAction<string>>;
}

export interface FeatureProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface FeatureCardsProps {
  setActiveModal: Dispatch<SetStateAction<string | null>>;
  setShowMessage: Dispatch<SetStateAction<string>>;
}

export interface CommunityHeroProps {
  userId: string | null;
  jewelsBalance?: number;
  setActiveModal: Dispatch<SetStateAction<string | null>>;
  setShowMessage: Dispatch<SetStateAction<string>>;
}

export interface DisclosureChatProps {
  userId: string | null;
  goldBalance: number;
  setGoldBalance: Dispatch<SetStateAction<number>>;
  updatePlayerFirestore: (updates: Partial<any>) => Promise<void>;
  setShowMessage: Dispatch<SetStateAction<string>>;
  setActiveModal: Dispatch<SetStateAction<string | null>>;
}

export interface ChatMessage {
  id: string;
  user: string;
  avatar: string;
  message: string;
  timestamp: any;
  userId: string;
}

export interface EcosystemHeroProps {
  userId: string | null;
  goldBalance: number;
  mousePosition: { x: number; y: number };
  setActiveModal: Dispatch<SetStateAction<string | null>>;
  setShowMessage: Dispatch<SetStateAction<string>>;
}

export interface NFT {
  id: string;
  title: string;
  img: string;
  price: string;
  energyBoost: string;
}

export interface NFTCardProps {
  nft: NFT;
  isPETMember: boolean;
  isPending: boolean;
  setActiveModal: Dispatch<SetStateAction<string | null>>;
  userId: string | null;
  setShowMessage: Dispatch<SetStateAction<string>>;
}

export interface ReferralLeaderboardEntry {
  address: string;
  referrals: number;
  rewards: string;
}

export interface ReferralLeaderboardProps {
  leaderboard: ReferralLeaderboardEntry[];
  setActiveModal: Dispatch<SetStateAction<string | null>>;
  setShowMessage: Dispatch<SetStateAction<string>>;
}

export interface TrustFeature {
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface TrustFeaturesProps {
  setActiveModal: Dispatch<SetStateAction<string | null>>;
  setShowMessage: Dispatch<SetStateAction<string>>;
}

export interface Level {
  id: MembershipTier;
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

  setActiveModal: Dispatch<SetStateAction<string | null>>;
  setShowMessage: Dispatch<SetStateAction<string>>;
}

export interface WalletInfoProps {
  isPETMember: boolean;
  jewelsBalance: number;

  xpBalance: number;
  loginStreak: number;
}

// Other Component Props
export interface RazorTransactionProps {
  amount: number;
  currency: SupportedCurrency;
  itemId: string | null;
  transactionType: TransactionType;
  userId: string | null;
  onSuccess: (submittedItemId: string | null) => void;
  setShowMessage: Dispatch<SetStateAction<string>>;
}

export interface VaultWalletInfoProps {
  isConnected: boolean;
  chainId: number | undefined;
  ensName: string | null | undefined;
  blockNumber: bigint | null | undefined;

}

export interface VaultMembershipPackagesProps {
  isMember: boolean;
  isPending: boolean;
  handleMembershipPayment: (packageName: string, amount: number) => Promise<void>;
  setShowMessage: Dispatch<SetStateAction<string>>;
}

export interface VaultWithdrawalProps {
  isConnected: boolean;
  isMember: boolean;
  isPending: boolean;
  withdrawalAmount: string;
  setWithdrawalAmount: Dispatch<SetStateAction<string>>;
  handleWithdrawal: () => Promise<void>;
  setShowMessage: Dispatch<SetStateAction<string>>;
}

import { Dispatch, SetStateAction, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Address } from 'viem/accounts';
import { Chain } from 'viem/chains';

// Membership Tiers
export type MembershipTier = 'ecosystem' | 'gamers' | 'gold';

export const MEMBERSHIP_TIERS: Record<MembershipTier, { name: string; amount: number; usdAmount: number; contentRoute: string }> = {
  ecosystem: { name: 'Ecosystem Membership', amount: 99, usdAmount: 10, contentRoute: '/ecosystem-content' },
  gamers: { name: 'Gamers Membership', amount: 199, usdAmount: 49, contentRoute: '/gamers-content' },
  gold: { name: 'Gold Membership', amount: 499, usdAmount: 199, contentRoute: '/gold-content' },
};

// Transaction Types
export type SupportedCurrency = 'INR' | 'USD' | 'ETH' | 'JEWELS' | 'USDT';
export type TransactionType = 'membership' | 'deposit' | 'withdraw' | 'level-purchase' | 'quest-reward' | 'payout' | 'connect' | 'disconnect';
export type TransactionStatus = 'success' | 'pending' | 'failed';

export interface Transaction {
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

// App and Page Props
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
  mousePosition: { x: number; y: number };
}

export interface PageProps extends AppProps {}

// Game Interfaces
export interface GameProps {
  userId: string | null;
  setIsPETMember: Dispatch<SetStateAction<boolean>>;
  updatePlayerFirestore: (updates: Partial<any>) => Promise<void>;
  setShowMessage: Dispatch<SetStateAction<string>>;
  setActiveModal: Dispatch<SetStateAction<string | null>>;
  authLoading?: boolean;
  activeModal?: string | null;
}

export interface BingoCell {
  number: number;
  marked: boolean;
}

export interface BingoCard {
  cells: BingoCell[][];
  playerId: string;
}

export interface PlayerInRoom {
  name: string;
  jewels: number;
  card: BingoCard;
  isReady: boolean;
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

export interface GameConfig {
  bet: number;
  useJewels: boolean;
}

export interface Card {
  suit: Suit;
  value: Value;
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

// Stats and Rewards
export interface Stats {
  plays: number;
  wins: number;
  losses: number;
  biggestWin: number;
}

export interface Quest {
  id: string;
  title: string;
  progress: number;
  goal: number;
  rewardJEWELS: number;
  rewardXP: number;
  completed: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
}

export interface Reward {
  jewels: number;
  xp: number;
  message: string;
}

// Component Props
export interface EcosystemSection {
  title: string;
  description: string;
  icon: ReactNode;
  image: string;
  modal: string;
}

export interface EcosystemSectionsProps {
  setActiveModal: Dispatch<SetStateAction<string | null>>;
  setShowMessage: Dispatch<SetStateAction<string>>;
}

export interface EnergyVaultProps {
  userId: string | null;
  jewelsBalance: number;
  energyBalance: number;
  setJewelsBalance: Dispatch<SetStateAction<number>>;
  setEnergyBalance: Dispatch<SetStateAction<number>>;
  dailyClicks: number;
  setDailyClicks: Dispatch<SetStateAction<number>>;
  loginStreak: number;
  updatePlayerFirestore: (updates: Partial<any>) => Promise<void>;
  setActiveModal: Dispatch<SetStateAction<string | null>>;
  setShowMessage: Dispatch<SetStateAction<string>>;
}

export interface FeatureProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface FeatureCardsProps {
  setActiveModal: Dispatch<SetStateAction<string | null>>;
  setShowMessage: Dispatch<SetStateAction<string>>;
}

export interface CommunityHeroProps {
  userId: string | null;
  jewelsBalance?: number;
  setActiveModal: Dispatch<SetStateAction<string | null>>;
  setShowMessage: Dispatch<SetStateAction<string>>;
}

export interface DisclosureChatProps {
  userId: string | null;
  goldBalance: number;
  setGoldBalance: Dispatch<SetStateAction<number>>;
  updatePlayerFirestore: (updates: Partial<any>) => Promise<void>;
  setShowMessage: Dispatch<SetStateAction<string>>;
  setActiveModal: Dispatch<SetStateAction<string | null>>;
}

export interface ChatMessage {
  id: string;
  user: string;
  avatar: string;
  message: string;
  timestamp: any;
  userId: string;
}

export interface EcosystemHeroProps {
  userId: string | null;
  goldBalance: number;
  mousePosition: { x: number; y: number };
  setActiveModal: Dispatch<SetStateAction<string | null>>;
  setShowMessage: Dispatch<SetStateAction<string>>;
}

export interface NFTItem {
  title: string;
  img: string;
  audio: string;
  film: string;
  price: string;
  energyBoost: string;
  priceValue: number;
}

export interface NFT {
  title: string;
  img: string;
  price: string;
  energyBoost: string;
}

export interface NFTCardProps {
  nft: NFT;
  isPETMember: boolean;
  isPending: boolean;
  setActiveModal: Dispatch<SetStateAction<string | null>>;
  userId: string | null;
  setShowMessage: Dispatch<SetStateAction<string>>;
}

export interface FeaturedNFTsProps {
  isPETMember: boolean;
  isPending: boolean;
  setActiveModal: Dispatch<SetStateAction<string | null>>;
  userId: string | null;
  setShowMessage: Dispatch<SetStateAction<string>>;
}

export interface ReferralLeaderboardEntry {
  address: string;
  referrals: number;
  rewards: string;
}

export interface ReferralLeaderboardProps {
  leaderboard: ReferralLeaderboardEntry[];
  setActiveModal: Dispatch<SetStateAction<string | null>>;
  setShowMessage: Dispatch<SetStateAction<string>>;
}

export interface TrustFeature {
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface TrustFeaturesProps {
  setActiveModal: Dispatch<SetStateAction<string | null>>;
  setShowMessage: Dispatch<SetStateAction<string>>;
}

export interface Level {
  id: MembershipTier;
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
  setActiveModal: Dispatch<SetStateAction<string | null>>;
  setShowMessage: Dispatch<SetStateAction<string>>;
}

export interface WalletInfoProps {
  isPETMember: boolean;
  jewelsBalance: number;
  xpBalance: number;
  loginStreak: number;
}

// Other Component Props
export interface RazorTransactionProps {
  amount: number;
  currency: SupportedCurrency;
  itemId: string | null;
  transactionType: TransactionType;
  userId: string | null;
  onSuccess: (submittedItemId: string | null) => void;
  setShowMessage: Dispatch<SetStateAction<string>>;
}

export interface VaultWalletInfoProps {
  isConnected: boolean;
  chainId: number | undefined;
  ensName: string | null | undefined;
  blockNumber: bigint | null | undefined;
}

export interface VaultMembershipPackagesProps {
  isMember: boolean;
  isPending: boolean;
  handleMembershipPayment: (packageName: string, amount: number) => Promise<void>;
  setShowMessage: Dispatch<SetStateAction<string>>;
}

export interface VaultWithdrawalProps {
  isConnected: boolean;
  isMember: boolean;
  isPending: boolean;
  withdrawalAmount: string;
  setWithdrawalAmount: Dispatch<SetStateAction<string>>;
  handleWithdrawal: () => Promise<void>;
  setShowMessage: Dispatch<SetStateAction<string>>;
}

export interface Transaction {
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

// App and Page Props
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
  mousePosition: { x: number; y: number };
}

export interface PageProps extends AppProps {}

// Game Interfaces
export interface GameProps {
  userId: string | null;
  setIsPETMember: Dispatch<SetStateAction<boolean>>;
  updatePlayerFirestore: (updates: Partial<any>) => Promise<void>;
  setShowMessage: Dispatch<SetStateAction<string>>;
  setActiveModal: Dispatch<SetStateAction<string | null>>;
  authLoading?: boolean;
  activeModal?: string | null;
}

export interface BingoCell {
  number: number;
  marked: boolean;
}

export interface BingoCard {
  cells: BingoCell[][];
  playerId: string;
}

export interface PlayerInRoom {
  name: string;
  jewels: number;
  card: BingoCard;
  isReady: boolean;
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

export interface GameConfig {
  bet: number;
  useJewels: boolean;
}

export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Value = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  suit: Suit;
  value: Value;
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

// Stats and Rewards
export interface Stats {
  plays: number;
  wins: number;
  losses: number;
  biggestWin: number;
}

export interface Quest {
  id: string;
  title: string;
  progress: number;
  goal: number;
  rewardJEWELS: number;
  rewardXP: number;
  completed: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
}

export interface Reward {
  jewels: number;
  xp: number;
  message: string;
}

// Component Props
export interface EcosystemSection {
  title: string;
  description: string;
  icon: ReactNode;
  image: string;
  modal: string;
}

export interface EcosystemSectionsProps {
  setActiveModal: Dispatch<SetStateAction<string | null>>;
  setShowMessage: Dispatch<SetStateAction<string>>;
}

export interface EnergyVaultProps {
  userId: string | null;
  jewelsBalance: number;
  energyBalance: number;
  setJewelsBalance: Dispatch<SetStateAction<number>>;
  setEnergyBalance: Dispatch<SetStateAction<number>>;
  dailyClicks: number;
  setDailyClicks: Dispatch<SetStateAction<number>>;
  loginStreak: number;
  updatePlayerFirestore: (updates: Partial<any>) => Promise<void>;
  setActiveModal: Dispatch<SetStateAction<string | null>>;
  setShowMessage: Dispatch<SetStateAction<string>>;
}

export interface FeatureProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface FeatureCardsProps {
  setActiveModal: Dispatch<SetStateAction<string | null>>;
  setShowMessage: Dispatch<SetStateAction<string>>;
}

export interface CommunityHeroProps {
  userId: string | null;
  jewelsBalance?: number;
  setActiveModal: Dispatch<SetStateAction<string | null>>;
  setShowMessage: Dispatch<SetStateAction<string>>;
}

export interface DisclosureChatProps {
  userId: string | null;
  goldBalance: number;
  setGoldBalance: Dispatch<SetStateAction<number>>;
  updatePlayerFirestore: (updates: Partial<any>) => Promise<void>;
  setShowMessage: Dispatch<SetStateAction<string>>;
  setActiveModal: Dispatch<SetStateAction<string | null>>;
}

export interface ChatMessage {
  id: string;
  user: string;
  avatar: string;
  message: string;
  timestamp: any;
  userId: string;
}

export interface EcosystemHeroProps {
  userId: string | null;
  goldBalance: number;
  mousePosition: { x: number; y: number };
  setActiveModal: Dispatch<SetStateAction<string | null>>;
  setShowMessage: Dispatch<SetStateAction<string>>;
}

export interface NFTItem {
  id: number;
  title: string;
  img: string;
  audio: string;
  film: string;
  price: string;
  energyBoost: string;
  priceValue: number;
}

export interface NFT {
  id: string ;
  title: string;
  img: string;
  price: string;
  energyBoost: string;
}

export interface NFTCardProps {
  nft: NFT;
  isPETMember: boolean;
  isPending: boolean;
  setActiveModal: Dispatch<SetStateAction<string | null>>;
  userId: string | null;
  setShowMessage: Dispatch<SetStateAction<string>>;
}

export interface FeaturedNFTsProps {
  isPETMember: boolean;
  isPending: boolean;
  setActiveModal: Dispatch<SetStateAction<string | null>>;
  userId: string | null;
  setShowMessage: Dispatch<SetStateAction<string>>;
}

export interface ReferralLeaderboardEntry {
  address: string;
  referrals: number;
  rewards: string;
}

export interface ReferralLeaderboardProps {
  leaderboard: ReferralLeaderboardEntry[];
  setActiveModal: Dispatch<SetStateAction<string | null>>;
  setShowMessage: Dispatch<SetStateAction<string>>;
}

export interface TrustFeature {
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface TrustFeaturesProps {
  setActiveModal: Dispatch<SetStateAction<string | null>>;
  setShowMessage: Dispatch<SetStateAction<string>>;
}

export interface Level {
  id: MembershipTier;
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
  setActiveModal: Dispatch<SetStateAction<string | null>>;
  setShowMessage: Dispatch<SetStateAction<string>>;
}

export interface WalletInfoProps {
  isPETMember: boolean;
  jewelsBalance: number;
  address: Address | undefined;
  chain: Chain | undefined;
  xpBalance: number;
  loginStreak: number;
}

// Other Component Props
export interface RazorTransactionProps {
  amount: number;
  currency: SupportedCurrency;
  itemId: string | null;
  transactionType: TransactionType;
  userId: string | null;
  onSuccess: (submittedItemId: string | null) => void;
  setShowMessage: Dispatch<SetStateAction<string>>;
}

export interface VaultWalletInfoProps {
  isConnected: boolean;
  address: Address | undefined;
  chainId: number | undefined;
  ensName: string | null | undefined;
  blockNumber: bigint | null | undefined;
  feeData: any;
  usdtBalance: any;
}

export interface VaultMembershipPackagesProps {
  isMember: boolean;
  isPending: boolean;
  handleMembershipPayment: (packageName: string, amount: number) => Promise<void>;
  setShowMessage: Dispatch<SetStateAction<string>>;
}

export interface VaultWithdrawalProps {
  isConnected: boolean;
  isMember: boolean;
  isPending: boolean;
  withdrawalAmount: string;
  setWithdrawalAmount: Dispatch<SetStateAction<string>>;
  handleWithdrawal: () => Promise<void>;
  setShowMessage: Dispatch<SetStateAction<string>>;
}