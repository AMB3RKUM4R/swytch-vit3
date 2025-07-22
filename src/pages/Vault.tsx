// src/pages/Vault.tsx
import { FC, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { doc, onSnapshot, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebaseConfig';
import SwytchErrorBoundary from '../components/ErrorBoundaryComponent';
import { Sparkles, MessageCircleHeart } from 'lucide-react';
import { useAccount, useFeeData, useBalance, useChainId, useBlockNumber } from 'wagmi';

// Import PageProps and PlayerData types
import { PageProps, SupportedCurrency, TransactionType, TransactionStatus, PlayerData } from '../lib/types';

// Import modular components for Vault
import VaultWalletInfo from '../components/vault/VaultWalletInfo';
import VaultMembershipPackages from '../components/vault/VaultMembershipPackages';
import FiatWithdrawalForm from '../components/vault/FiatWithdrawalForm';
import CryptoSwapModule from '../components/vault/CryptoSwapModule';
import VaultRules from '../components/vault/VaultRules';
import YieldCalculator from '../components/vault/YieldCalculator';
import SwytchCard from '../components/SwytchCard';


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

// Simplified games list for Quick Access, consider moving to a constants file
const games = [
  { id: 'inventory', title: 'Your Inventory', path: '/inventory', description: 'View your in-game items.' },
  { id: 'marketplace', title: 'Item Marketplace', path: '/marketplace', description: 'Buy & sell items with crypto.' },
  { id: 'bingo', title: 'Bingo', path: '/games/bingo', description: 'Match numbers and win big!' },
  { id: 'blackjack', title: 'Blackjack', path: '/games/blackjack', description: 'Beat the dealer to 21!' },
];


export const Vault: FC<PageProps> = ({
  userId,
  setActiveModal,
  setShowMessage,
  setIsPETMember,
  updatePlayerFirestore, // Keep for logging, not direct player data modification
  jewelsBalance, // Keep for display purposes
  isPending,
  authLoading,
  initialAuthCheckComplete, // Added initialAuthCheckComplete
}) => {
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [visibleGames, setVisibleGames] = useState(games.slice(0, 4));
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [, setIsModalLoading] = useState<boolean>(false);

  // Wagmi V2 hooks for wallet info
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: feeData } = useFeeData();
  const { data: usdtBalance } = useBalance({ address, token: '0xdAC17F958D2ee523a2206206994597C13D831ec7' });
  const { data: currentBlockNumber } = useBlockNumber({ watch: true });

  // State for FiatWithdrawalForm
  const [withdrawalAmount, setWithdrawalAmount] = useState<string>('');
  const [paypalEmail, setPaypalEmail] = useState<string>('');

  useEffect(() => {
    if (userId) {
      const userRef = doc(db, 'Players', userId);
      const unsubscribe = onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as PlayerData;
          setPlayerData(data);
          setIsPETMember(data.isPETMember || false);
        } else {
          setPlayerData(null);
          setIsPETMember(false);
          // Only show auth modal if auth check is complete and no user
          if (initialAuthCheckComplete) {
            setShowMessage('⚠️ User data not found. Please ensure you are signed in.');
            setActiveModal('auth');
          }
        }
      }, (err) => {
        console.error('Failed to fetch user data for Vault:', err);
        setShowMessage('⚠️ Failed to load vault data. Please check your connection.');
        setActiveModal('error');
      });
      return () => unsubscribe();
    } else {
      setPlayerData(null);
      setIsPETMember(false);
      // Only show auth modal if auth check is complete and no user
      if (initialAuthCheckComplete) {
        setShowMessage('⚠️ Please sign in to access the vault!');
        setActiveModal('auth');
      }
    }
  }, [userId, setIsPETMember, setShowMessage, setActiveModal, initialAuthCheckComplete]);


  const handleWithdrawal = useCallback(async () => {
    if (!userId) { setShowMessage('⚠️ Sign in to withdraw!'); setActiveModal('auth'); return; }
    if (!isConnected || !address) { setShowMessage('⚠️ Connect wallet to withdraw crypto!'); setActiveModal('auth'); return; }
    if (!withdrawalAmount || Number(withdrawalAmount) <= 0) {
      setShowMessage('⚠️ Please enter a valid withdrawal amount.');
      return;
    }
    // Basic client-side check for JEWELS balance (display only, backend will verify)
    if (playerData && (playerData.jewels || 0) < Number(withdrawalAmount)) {
      setShowMessage('⚠️ Insufficient JEWELS balance for withdrawal.');
      return;
    }

    setShowMessage(`Withdrawal of ${withdrawalAmount} JEWELS initiated! (Requires admin processing)`);
    setIsModalLoading(true);
    try {
      // --- IMPORTANT: Withdrawal logic now requires backend Cloud Function ---
      // The client-side app should only create a pending transaction request.
      // The actual deduction of jewels and crypto/fiat transfer MUST be handled
      // by a trusted backend (e.g., Firebase Cloud Function) after verification.
      //
      // Record the withdrawal request in Firestore
      const transactionId = `${userId}_${Date.now()}_withdraw_crypto`;
      await addDoc(collection(db, 'Transactions'), {
        transactionId,
        userId,
        amount: Number(withdrawalAmount),
        currency: 'JEWELS' as SupportedCurrency,
        transactionType: 'withdraw' as TransactionType,
        status: 'pending' as TransactionStatus, // Pending admin approval
        timestamp: serverTimestamp(),
        walletAddress: address,
        paymentMethod: 'crypto',
      });

      // await updatePlayerFirestore({ jewels: (playerData?.jewels || 0) - Number(withdrawalAmount), updatedAt: serverTimestamp() }); // Removed client-side update
      setShowMessage('✅ Crypto withdrawal request submitted successfully! Admin will process it shortly.');
      setWithdrawalAmount('');
    } catch (err) {
      console.error('Crypto withdrawal error:', err);
      setShowMessage(`⚠️ Crypto withdrawal failed: ${(err as Error).message || 'Unknown error'}`);
    } finally {
      setIsModalLoading(false);
    }
  }, [userId, isConnected, address, withdrawalAmount, playerData, setShowMessage, setActiveModal]); // Removed updatePlayerFirestore from deps

  const handlePayPalWithdrawal = useCallback(async () => {
    if (!userId) { setShowMessage('⚠️ Sign in to withdraw!'); setActiveModal('auth'); return; }
    if (!withdrawalAmount || Number(withdrawalAmount) <= 0) {
      setShowMessage('⚠️ Please enter a valid withdrawal amount.');
      return;
    }
    if (!paypalEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(paypalEmail)) {
      setShowMessage('⚠️ Please enter a valid PayPal email address.');
      return;
    }
    // Basic client-side check for JEWELS balance (display only, backend will verify)
    if (playerData && (playerData.jewels || 0) < Number(withdrawalAmount)) {
      setShowMessage('⚠️ Insufficient JEWELS balance for withdrawal.');
      return;
    }

    setShowMessage(`PayPal withdrawal of ${withdrawalAmount} JEWELS to ${paypalEmail} initiated! (Requires admin processing)`);
    setIsModalLoading(true);
    try {
      // --- IMPORTANT: PayPal Withdrawal logic now requires backend Cloud Function ---
      // The client-side app should only create a pending transaction request.
      // The actual deduction of jewels and PayPal payout MUST be handled
      // by a trusted backend (e.g., Firebase Cloud Function) after verification.
      //
      const transactionId = `${userId}_${Date.now()}_withdraw_paypal`;
      const transactionData = {
        transactionId,
        userId,
        amount: Number(withdrawalAmount),
        currency: 'JEWELS' as SupportedCurrency,
        transactionType: 'withdraw' as TransactionType,
        status: 'pending' as TransactionStatus,
        timestamp: serverTimestamp(),
        paymentMethod: 'paypal',
        paypalEmail: paypalEmail,
      };

      await addDoc(collection(db, 'Transactions'), transactionData);
      // await setDoc(doc(db, 'Players', userId), { jewels: (playerData?.jewels || 0) - Number(withdrawalAmount), updatedAt: serverTimestamp() }, { merge: true }); // Removed client-side update
      setShowMessage('✅ PayPal withdrawal request submitted successfully! Transaction ID: ' + transactionId);
    } catch (err) {
      console.error('PayPal withdrawal error:', err);
      setShowMessage(`⚠️ PayPal withdrawal failed: ${(err as Error).message || 'Unknown error'}`);
    } finally {
      setIsModalLoading(false);
    }
  }, [userId, withdrawalAmount, paypalEmail, playerData, setShowMessage, setActiveModal]); // Removed updatePlayerFirestore from deps

  const handleMembershipPayment = useCallback(async (packageName: string, amount: number) => {
    if (!userId) { setShowMessage('⚠️ Sign in to buy membership!'); setActiveModal('auth'); return; }
    setShowMessage(`Attempting to buy ${packageName} for ${amount}! (Redirecting to Payment Modal)`);
    setActiveModal('payment');
  }, [userId, setShowMessage, setActiveModal]);

  const handleCalculateYield = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setShowMessage('Calculating yield...');
    setTimeout(() => {
      setShowMessage('Yield calculated! (Placeholder value: 10% APY)');
    }, 1500);
  }, [setShowMessage]);

  const loadMoreGames = useCallback(() => {
    if (visibleGames.length >= games.length) {
      setHasMore(false);
      return;
    }
    setTimeout(() => {
      setVisibleGames((prev) => [
        ...prev,
        ...games.slice(prev.length, prev.length + 2),
      ]);
    }, 500);
  }, [visibleGames]);

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
      // --- IMPORTANT: Removed client-side update to jewels for quest reward. ---
      // This update MUST be handled by a trusted backend (e.g., Firebase Cloud Function)
      // after the share is verified.
      // The client-side app will only log the transaction.
      await addDoc(collection(db, 'Transactions'), {
        transactionId: `${userId}_share_vault_${Date.now()}`,
        userId,
        amount: 5,
        currency: 'JEWELS' as SupportedCurrency,
        transactionType: 'quest-reward' as TransactionType,
        status: 'pending' as TransactionStatus, // Status is pending backend verification
        timestamp: serverTimestamp(),
        game: 'vault',
      });
      // await updatePlayerFirestore({ jewels: jewelsBalance + 5 }); // Removed client-side update
      setShowMessage('🎉 Shared Vault on X! Reward pending verification.');
    } catch (err) {
      console.error('Failed to share on X:', err);
      setShowMessage('⚠️ Failed to share on X. Try again.');
      setActiveModal('error');
    } finally {
      setIsModalLoading(false);
    }
  }, [userId, setShowMessage, setActiveModal]);


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
    return null; // LoadingSpinner is handled by App.tsx
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
          <h1 className="text-4xl font-bold text-rose-400 flex items-center justify-center gap-3 font-poppins mb-8">
            <Sparkles className="w-8 h-8 text-cyan-400 animate-pulse" /> Energy Vault
          </h1>

          {/* Wallet Information */}
          <motion.div variants={sectionVariants} className="mb-8">
            <VaultWalletInfo
              isConnected={isConnected} // Use props.isConnected
              address={address} // Use props.address
              chainId={chainId} // Use props.chainId
              ensName={null}
              blockNumber={currentBlockNumber || null} // Use props.currentBlockNumber
              feeData={feeData} // Use props.feeData
              usdtBalance={usdtBalance} // Use props.usdtBalance
            />
          </motion.div>

          {/* Crypto Swap Module */}
          <motion.div variants={sectionVariants} className="mb-8">
            <CryptoSwapModule
              userId={userId}
              setShowMessage={setShowMessage}
              setActiveModal={setActiveModal}
              updatePlayerFirestore={updatePlayerFirestore}
              isConnected={isConnected} // Use props.isConnected
              walletAddress={address || null} // Use props.address
            />
          </motion.div>

          {/* Fiat Withdrawal Form */}
          <motion.div variants={sectionVariants} className="mb-8">
            <FiatWithdrawalForm
              userId={userId}
              setShowMessage={setShowMessage}
              setActiveModal={setActiveModal}
              handleWithdrawal={handleWithdrawal}
              handlePayPalWithdrawal={handlePayPalWithdrawal}
              withdrawalAmount={withdrawalAmount}
              setWithdrawalAmount={setWithdrawalAmount}
              paypalEmail={paypalEmail}
              setPaypalEmail={setPaypalEmail}
            />
          </motion.div>

          {/* Membership Packages */}
          <motion.div variants={sectionVariants} className="mb-8">
            <VaultMembershipPackages
              isMember={playerData?.isPETMember || false}
              isPending={isPending}
              handleMembershipPayment={handleMembershipPayment}
              setShowMessage={setShowMessage}
            />
          </motion.div>

          {/* Vault Rules */}
          <motion.div variants={sectionVariants} className="mb-8">
            <VaultRules />
          </motion.div>

          {/* Yield Calculator */}
          <motion.div variants={sectionVariants} className="mb-8">
            <YieldCalculator
              userId={userId}
              handleCalculateYield={handleCalculateYield}
              setShowMessage={setShowMessage}
              setActiveModal={setActiveModal}
            />
          </motion.div>

          {/* Explore Games Section */}
          <motion.div variants={sectionVariants}>
            <h2 className="text-3xl font-bold text-rose-400 flex items-center justify-center gap-3 font-poppins mt-8">
              <Sparkles className="w-8 h-8 text-cyan-400 animate-pulse" /> Explore Our Games
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto mt-4 font-inter text-center">
              Dive into thrilling games and manage your assets!
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
                        className={`inline-block bg-rose-600 text-white px-4 py-2 rounded-full font-poppins hover:bg-cyan-500 mt-4`}
                        onClick={() => {
                          if (!userId) {
                            setShowMessage('⚠️ Sign in to play games!');
                            setActiveModal('auth');
                          } else {
                            setShowMessage(`🎮 Navigating to ${game.title}!`);
                          }
                        }}
                        role="button"
                        aria-label={`Play ${game.title}`}
                      >
                        Go to {game.title}
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

          {/* Share on X Button */}
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
          </motion.div>
        </motion.div>
      </motion.div>
    </SwytchErrorBoundary>
  );
};
