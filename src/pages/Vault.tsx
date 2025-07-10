import { FC, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { doc, onSnapshot, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebaseConfig';
import VaultHero from '../components/VaultHero';
import VaultWalletInfo from '../components/VaultWalletInfo';
import VaultMembershipBenefits from '../components/VaultMembershipBenefits';
import VaultMembershipPackages from '../components/VaultMembershipPackages';
import VaultWithdrawal from '../components/VaultWithdrawal';
import VaultRules from '../components/VaultRules';
import YieldCalculator from '../components/YieldCalculator';
import AdminPayout from '../components/AdminPayout';
import SwytchCard from '../components/SwytchCard';
import SwytchErrorBoundary from '../components/ErrorBoundaryComponent';
import { Sparkles, MessageCircleHeart } from 'lucide-react';
// Wagmi V2 Imports
import { useAccount, useFeeData, useBalance, useChainId, useBlockNumber } from 'wagmi'; // Added useBlockNumber

// IMPORTANT: Import PageProps, SupportedCurrency, TransactionType, TransactionStatus from your lib/types.ts file
import { PageProps as ImportedPageProps } from '../lib/types';


const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const flareVariants = {
  animate: { scale: [1, 1.3, 1], opacity: [0.5, 0.7, 0.5], transition: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' } },
};

const particleVariants = {
  animate: { y: [0, -8, 0], opacity: [0.4, 1, 0.4], transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' } },
};

// This 'games' array seems copied into multiple pages. Consider moving to a central constants file.
const games = [
  { id: 'bingo', title: 'Bingo', path: '/games/bingo', description: 'Match numbers and win big!' },
  { id: 'blackjack', title: 'Blackjack', path: '/games/blackjack', description: 'Beat the dealer to 21!' },
  { id: 'bridge', title: 'Bridge', path: '/games/bridge', description: 'Outsmart opponents in this classic!' },
  { id: 'caribbean-stud', title: 'Caribbean Stud', path: '/games/caribbean-stud', description: 'Play poker against the house!' },
  { id: 'fortune-wheel', title: 'Fortune Wheel', path: '/games/fortune-wheel', description: 'Spin for epic rewards!' },
  { id: 'horse-racing', title: 'Horse Racing', path: '/games/horse-racing', description: 'Bet on the fastest horse!' },
  { id: 'pontoon', title: 'Pontoon', path: '/games/pontoon', description: 'Get closer to 21 than the dealer!' },
  { id: 'red-dog', title: 'Red Dog', path: '/games/red-dog', description: 'Predict the card spread!' },
  { id: 'rocket-crash', title: 'Rocket Crash', path: '/games/rocket-crash', description: 'Cash out before the crash!' },
  { id: 'scratch-cards', title: 'Scratch Cards', path: '/games/scratch-cards', description: 'Scratch to reveal prizes!' },
  { id: 'solitaire', title: 'Solitaire', path: '/games/solitaire', description: 'Master the classic card game!' },
  { id: 'crypto-quest', title: 'Crypto Quest (Coming Soon)', path: '#', description: 'Embark on a blockchain adventure!', comingSoon: true },
  { id: 'nft-rumble', title: 'NFT Rumble (Coming Soon)', path: '#', description: 'Battle with NFTs for rewards!', comingSoon: true },
];

// Use ImportedPageProps as the type for the FC
export const Vault: FC<ImportedPageProps> = ({
  userId,
  setActiveModal,
  setShowMessage,
  setIsPETMember,
  updatePlayerFirestore,
  jewelsBalance,
  isPending,
  authLoading,
}) => {
  const [, setIsModalLoading] = useState<boolean>(false);
  const [visibleGames, setVisibleGames] = useState(games.slice(0, 6));
  const [hasMore, setHasMore] = useState<boolean>(true);

  // Wagmi V2 hooks for wallet info
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: feeData } = useFeeData();
  useBalance({ address: address });
  const { data: currentBlockNumber } = useBlockNumber({ watch: true }); // FIX: Get current block number

  const usdtBalance = { value: BigInt(0), decimals: 18, formatted: '0.00' }; // Placeholder for USDT balance; integrate actual data if needed


  // States and handlers for VaultWithdrawal/AdminPayout
  const [withdrawalAmount, setWithdrawalAmount] = useState<string>('');
  const [payoutAddress, setPayoutAddress] = useState<`0x${string}` | ''>('');
  const [payoutAmount, setPayoutAmount] = useState<string>('');

  const handleWithdrawal = useCallback(async () => {
    if (!userId) { setShowMessage('⚠️ Sign in to withdraw!'); setActiveModal('auth'); return; }
    if (!isConnected || !address) { setShowMessage('⚠️ Connect wallet to withdraw!'); setActiveModal('auth'); return; }
    // Implement actual withdrawal logic here
    setShowMessage(`Withdrawal of ${withdrawalAmount} initiated! (Requires backend processing)`);
    setIsModalLoading(true);
    try {
      // Example: Record withdrawal request in Firestore
      await addDoc(collection(db, 'Transactions'), {
        transactionId: `${userId}_${Date.now()}_withdraw`,
        userId,
        amount: Number(withdrawalAmount),
        currency: 'JEWELS', // Or whatever currency is being withdrawn
        transactionType: 'withdraw',
        status: 'pending',
        timestamp: serverTimestamp(),
        walletAddress: address,
      });
      setShowMessage('✅ Withdrawal request submitted successfully!');
    } catch (err) {
      console.error('Withdrawal error:', err);
      setShowMessage('⚠️ Failed to submit withdrawal request.');
    } finally {
      setIsModalLoading(false);
    }
  }, [userId, isConnected, address, withdrawalAmount, setShowMessage, setActiveModal]);

  const handleAdminPayout = useCallback(async () => {
    if (!userId || userId !== '0CfobCbXnPZsJwT662H4OhDrXk33') { setShowMessage('⚠️ Admin access required!'); return; }
    // Implement actual admin payout logic here
    setShowMessage(`Admin payout of ${payoutAmount} to ${payoutAddress} initiated! (Requires backend processing)`);
    setIsModalLoading(true);
    try {
      // Example: Record admin payout transaction in Firestore
      await addDoc(collection(db, 'Transactions'), {
        transactionId: `${userId}_${Date.now()}_admin_payout`,
        userId: payoutAddress, // User being paid out
        amount: Number(payoutAmount),
        currency: 'ETH', // Or whatever currency admin is paying out
        transactionType: 'payout',
        status: 'success', // Admin payouts are often immediately successful from their perspective
        timestamp: serverTimestamp(),
        adminId: userId, // Admin's ID
      });
      setShowMessage('✅ Admin payout recorded successfully!');
    } catch (err) {
      console.error('Admin payout error:', err);
      setShowMessage('⚠️ Failed to record admin payout.');
    } finally {
      setIsModalLoading(false);
    }
  }, [userId, payoutAmount, payoutAddress, setShowMessage]);

  const handleMembershipPayment = useCallback(async (packageName: string, amount: number) => {
    if (!userId) { setShowMessage('⚠️ Sign in to buy membership!'); setActiveModal('auth'); return; }
    setShowMessage(`Attempting to buy ${packageName} for ${amount}! (Redirecting to Payment Modal)`);
    setActiveModal('payment');
    // The PaymentModal (RazorTransaction) will handle the actual payment initiation
  }, [userId, setShowMessage, setActiveModal]);

  const handleCalculateYield = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setShowMessage('Calculating yield...');
    // Implement actual yield calculation logic here
    // This would likely involve fetching game data, investment data, etc.
    setTimeout(() => {
      setShowMessage('Yield calculated! (Placeholder value: 10% APY)');
    }, 1500); // Simulate network delay
  }, [setShowMessage]);


  const loadMoreGames = useCallback(() => {
    if (visibleGames.length >= games.length) {
      setHasMore(false);
      return;
    }
    setTimeout(() => {
      setVisibleGames((prev) => [
        ...prev,
        ...games.slice(prev.length, prev.length + 3),
      ]);
    }, 500);
  }, [visibleGames]); // `games` is a constant, so no need to add it to deps

  const shareOnX = useCallback(async () => {
    if (!userId) {
      setShowMessage('⚠️ Please sign in to share.');
      setActiveModal('auth');
      return;
    }
    setIsModalLoading(true);
    try {
      const shareText = encodeURIComponent("Managing my assets in the Swytch PETverse Vault! 💰 Join at swytch.io! #SwytchPETverse");
      window.open(`https://x.com/intent/tweet?text=${shareText}`, "_blank");
      const transactionId = `${userId}_${Date.now()}`;
      await addDoc(collection(db, 'Transactions'), {
        transactionId,
        userId,
        amount: 5,
        currency: 'JEWELS', // Correctly typed as SupportedCurrency
        transactionType: 'deposit', // Correctly typed as TransactionType
        status: 'pending', // Correctly typed as TransactionStatus
        timestamp: serverTimestamp(),
        game: 'vault',
        adminId: '0CfobCbXnPZsJwT662H4OhDrXk33', // Ensure this is the correct admin ID
      });
      await updatePlayerFirestore({ jewels: jewelsBalance + 5 });
      setShowMessage('🎉 Shared Vault on X! +5 JEWELS');
    } catch (err) {
      console.error('Failed to share on X:', err);
      setShowMessage('⚠️ Failed to share on X. Try again.');
      setActiveModal('error');
    } finally {
      setIsModalLoading(false);
    }
  }, [userId, jewelsBalance, setShowMessage, setActiveModal, updatePlayerFirestore]);

  useEffect(() => {
    if (userId) {
      const userRef = doc(db, 'Players', userId);
      const unsubscribe = onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setIsPETMember(data.isPETMember || false);
        }
      }, (err) => {
        console.error('Failed to fetch user data:', err);
        setShowMessage('⚠️ Failed to load vault data.');
        setActiveModal('error');
      });
      return () => unsubscribe();
    } else {
      setShowMessage('⚠️ Please sign in to access the vault!');
      setActiveModal('auth');
    }
  }, [userId, setIsPETMember, setShowMessage, setActiveModal]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 100 &&
        hasMore
      ) {
        loadMoreGames();
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, loadMoreGames]);

  if (authLoading || isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-gray-950 font-inter">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <Sparkles className="w-10 h-10 text-rose-400 animate-pulse mx-auto mb-4" />
          <p>Loading Vault...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}>
      <motion.div
        className="min-h-screen bg-gradient-to-br from-gray-950 via-rose-950/20 to-black text-white font-inter bg-noise"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="fixed inset-0 pointer-events-none z-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="absolute w-96 h-96 bg-gradient-to-br from-rose-400/50 via-cyan-500/40 to-rose-400/30 rounded-full opacity-30 blur-3xl"
            variants={flareVariants}
            animate="animate"
            style={{ top: "33%", left: "33%" }}
          />
          <motion.div
            className="absolute w-64 h-64 bg-gradient-to-br from-cyan-400/40 via-rose-500/30 to-cyan-400/20 rounded-full opacity-20 blur-2xl"
            variants={flareVariants}
            animate="animate"
            style={{ top: "50%", right: "25%" }}
          />
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={`particle-${i}`}
              className="absolute w-1.5 h-1.5 bg-cyan-400 rounded-full opacity-30"
              style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }}
              variants={particleVariants}
              animate="animate"
            />
          ))}
        </motion.div>

        <motion.div className="relative z-10 max-w-6xl mx-auto py-16 px-6 sm:px-8 lg:px-16">
          <motion.div variants={sectionVariants}>
            <VaultHero />
          </motion.div>
          <motion.div variants={sectionVariants}>
            <VaultWalletInfo
              isConnected={isConnected}
              address={address}
              chainId={chainId}
              ensName={null}
              blockNumber={currentBlockNumber || null} // FIX: Pass currentBlockNumber
              // FIX: Construct feeData to match expected VaultWalletInfoProps.feeData
              feeData={feeData ? {
                gasPrice: feeData.gasPrice,
                maxFeePerGas: feeData.maxFeePerGas,
                maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
              } : undefined}
              usdtBalance={usdtBalance}
            />
          </motion.div>
          <motion.div variants={sectionVariants}>
            <VaultMembershipBenefits />
          </motion.div>
          <motion.div variants={sectionVariants}>
            <VaultMembershipPackages
              isMember={false} // Placeholder, replace with actual user.isPETMember from props or Firestore
              isPending={isPending}
              handleMembershipPayment={handleMembershipPayment}
            />
          </motion.div>
          <motion.div variants={sectionVariants}>
            <VaultWithdrawal
              isConnected={isConnected}
              isMember={false} // Placeholder, replace with actual user.isPETMember
              isPending={isPending}
              withdrawalAmount={withdrawalAmount}
              setWithdrawalAmount={setWithdrawalAmount}
              handleWithdrawal={handleWithdrawal}
              handlePayPalPayment={async () => { setShowMessage('PayPal withdrawal not implemented!'); }} // Placeholder with message
            />
          </motion.div>
          <motion.div variants={sectionVariants}>
            <VaultRules />
          </motion.div>
          
          <motion.div variants={sectionVariants}>
            <YieldCalculator
              userId={userId}
              handleCalculateYield={handleCalculateYield}
            />
          </motion.div>
          <motion.div variants={sectionVariants}>
            <AdminPayout
              isConnected={isConnected}
              address={address}
              isPending={isPending}
              handlePayout={handleAdminPayout}
              payoutAddress={payoutAddress}
              setPayoutAddress={setPayoutAddress}
              payoutAmount={payoutAmount}
              setPayoutAmount={setPayoutAmount}
            />
          </motion.div>
          <motion.div variants={sectionVariants}>
            <h2 className="text-3xl font-bold text-rose-400 flex items-center justify-center gap-3 font-poppins">
              <Sparkles className="w-8 h-8 text-cyan-400 animate-pulse" /> Explore Our Games
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto mt-4 font-inter">
              Play thrilling games and earn JEWELS in the PETverse! Scroll to explore all games.
            </p>
          </motion.div>
          <motion.div variants={sectionVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            <AnimatePresence>
              {visibleGames.map((game) => (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 30 }}
                  transition={{ duration: 0.4 }}
                >
                  <SwytchCard gradient="from-rose-500/20 to-cyan-500/20" className="p-6">
                    <motion.div className="text-center" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <h3 className="text-xl font-bold text-white font-poppins">{game.title}</h3>
                      <p className="text-gray-300 font-inter mt-2">{game.description}</p>
                      <Link
                        to={game.path}
                        className={`inline-block bg-${game.comingSoon ? 'gray-600' : 'rose-600'} text-white px-4 py-2 rounded-full font-poppins hover:bg-${game.comingSoon ? 'gray-500' : 'cyan-500'} mt-4`}
                        onClick={() => {
                          if (!userId) {
                            setShowMessage('⚠️ Sign in to play games!');
                            setActiveModal('auth');
                          } else if (!game.comingSoon) {
                            setShowMessage(`🎮 Navigating to ${game.title}!`);
                          }
                        }}
                        role="button"
                        aria-label={`Play ${game.title}`}
                        style={{ pointerEvents: game.comingSoon ? 'none' : 'auto' }}
                      >
                        {game.comingSoon ? 'Coming Soon' : 'Play Now'}
                      </Link>
                    </motion.div>
                  </SwytchCard>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
          {hasMore && (
            <motion.div
              className="text-center py-8"
              variants={sectionVariants}
            >
              <motion.button
                className="inline-flex items-center px-6 py-3 bg-rose-600 text-white hover:bg-cyan-500 rounded-full font-semibold font-poppins"
                onClick={loadMoreGames}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Load More Games"
              >
                Load More
              </motion.button>
            </motion.div>
          )}
          <motion.div variants={sectionVariants} className="text-center py-8">
            <motion.button
              className="inline-flex items-center px-6 py-3 bg-rose-600 text-white hover:bg-cyan-500 rounded-full font-semibold font-poppins mr-4"
              onClick={shareOnX}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Share Vault on X"
            >
              <MessageCircleHeart className="w-5 h-5 mr-2" /> Share Vault on X
            </motion.button>
            <Link
              to="/games"
              className="inline-block bg-rose-600 text-white px-6 py-3 rounded-full font-poppins hover:bg-cyan-500"
              onClick={() => setShowMessage('🎮 Navigating to Games!')}
              role="button"
              aria-label="Navigate to Games Page"
            >
              Explore Games
            </Link>
            <Link
              to="/market"
              className="inline-block bg-rose-600 text-white px-6 py-3 rounded-full font-poppins hover:bg-cyan-500 ml-4"
              onClick={() => setShowMessage('🛒 Navigating to Market!')}
              role="button"
              aria-label="Navigate to Market Page"
            >
              Visit Market
            </Link>
            <Link
              to="/shop"
              className="inline-block bg-rose-600 text-white px-6 py-3 rounded-full font-poppins hover:bg-cyan-500 ml-4"
              onClick={() => setShowMessage('🛒 Navigating to Shop!')}
              role="button"
              aria-label="Navigate to Shop Page"
            >
              Visit Shop
            </Link>
            <Link
              to="/community"
              className="inline-block bg-rose-600 text-white px-6 py-3 rounded-full font-poppins hover:bg-cyan-500 ml-4"
              onClick={() => setShowMessage('👥 Navigating to Community!')}
              role="button"
              aria-label="Navigate to Community Page"
            >
              Community
            </Link>
            <Link
              to="/membership"
              className="inline-block bg-rose-600 text-white px-6 py-3 rounded-full font-poppins hover:bg-cyan-500 ml-4"
              onClick={() => setShowMessage('🌟 Navigating to Membership!')}
              role="button"
              aria-label="Navigate to Membership Page"
            >
              Membership
            </Link>
            <Link
              to="/benefits"
              className="inline-block bg-rose-600 text-white px-6 py-3 rounded-full font-poppins hover:bg-cyan-500 ml-4"
              onClick={() => setShowMessage('🌟 Navigating to Benefits!')}
              role="button"
              aria-label="Navigate to Benefits Page"
            >
              Benefits
            </Link>
          </motion.div>
        </motion.div>
        {/* Modals are rendered by App.tsx, so no need to render them here again */}
      </motion.div>
    </SwytchErrorBoundary>
  );
};