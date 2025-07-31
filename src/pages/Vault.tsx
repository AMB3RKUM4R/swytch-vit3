import { FC, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { doc, onSnapshot, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebaseConfig';
import { Dialog, DialogContent, DialogTrigger } from '@radix-ui/react-dialog';
import Tilt from 'react-parallax-tilt';
import { Sparkles, MessageCircleHeart, Wallet, Info, DollarSign, Star, Package, PlayCircle, Store, Users } from 'lucide-react';
import { useAccount, useFeeData, useBalance, useChainId, useBlockNumber } from 'wagmi';
import SwytchErrorBoundary from '../components/ErrorBoundaryComponent';
import StarfieldBackground from '../components/StarfieldBackground';
import VaultWalletInfo from '../components/vault/VaultWalletInfo';
import VaultMembershipPackages from '../components/vault/VaultMembershipPackages';
import FiatWithdrawalForm from '../components/vault/FiatWithdrawalForm';
import CryptoSwapModule from '../components/vault/CryptoSwapModule';
import VaultRules from '../components/vault/VaultRules';
import YieldCalculator from '../components/vault/YieldCalculator';
import SwytchCard from '../components/SwytchCard';
import { PageProps, PlayerData, SupportedCurrency, TransactionType, TransactionStatus } from '../lib/types';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.4 } },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: 'easeOut' } },
};

const imageVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.9, ease: 'easeOut' } },
};

const games = [
  { id: 'inventory', title: 'Your Inventory', path: '/inventory', description: 'View your in-game items.', icon: <Package className="w-6 h-6 text-[hsl(var(--secondary))] animate-neon-pulse" /> },
  { id: 'marketplace', title: 'Item Marketplace', path: '/marketplace', description: 'Buy & sell items with crypto.', icon: <Store className="w-6 h-6 text-[hsl(var(--secondary))] animate-neon-pulse" /> },
  { id: 'bingo', title: 'Bingo', path: '/games/bingo', description: 'Match numbers and win big!', icon: <PlayCircle className="w-6 h-6 text-[hsl(var(--secondary))] animate-neon-pulse" /> },
  { id: 'blackjack', title: 'Blackjack', path: '/games/blackjack', description: 'Beat the dealer to 21!', icon: <PlayCircle className="w-6 h-6 text-[hsl(var(--secondary))] animate-neon-pulse" /> },
];

export const Vault: FC<PageProps> = ({
  userId,
  setActiveModal,
  setShowMessage,
  setIsPETMember,
  updatePlayerFirestore,
  isPending,
  authLoading,
  initialAuthCheckComplete,
}) => {
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [visibleGames, setVisibleGames] = useState(games.slice(0, 4));
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isModalLoading, setIsModalLoading] = useState<boolean>(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState<string>('');
  const [paypalEmail, setPaypalEmail] = useState<string>('');

  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: feeData } = useFeeData();
  const { data: usdtBalance } = useBalance({ address, token: '0xdAC17F958D2ee523a2206206994597C13D831ec7' });
  const { data: currentBlockNumber } = useBlockNumber({ watch: true });

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
    if (playerData && (playerData.jewels || 0) < Number(withdrawalAmount)) {
      setShowMessage('⚠️ Insufficient JEWELS balance for withdrawal.');
      return;
    }
    setShowMessage(`Withdrawal of ${withdrawalAmount} JEWELS initiated! (Requires admin processing)`);
    setIsModalLoading(true);
    try {
      const transactionId = `${userId}_${Date.now()}_withdraw_crypto`;
      await addDoc(collection(db, 'Transactions'), {
        transactionId,
        userId,
        amount: Number(withdrawalAmount),
        currency: 'JEWELS' as SupportedCurrency,
        transactionType: 'withdraw' as TransactionType,
        status: 'pending' as TransactionStatus,
        timestamp: serverTimestamp(),
        walletAddress: address,
        paymentMethod: 'crypto',
      });
      setShowMessage('✅ Crypto withdrawal request submitted successfully! Admin will process it shortly.');
      setWithdrawalAmount('');
    } catch (err) {
      console.error('Crypto withdrawal error:', err);
      setShowMessage(`⚠️ Crypto withdrawal failed: ${(err as Error).message || 'Unknown error'}`);
    } finally {
      setIsModalLoading(false);
    }
  }, [userId, isConnected, address, withdrawalAmount, playerData, setShowMessage, setActiveModal]);

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
    if (playerData && (playerData.jewels || 0) < Number(withdrawalAmount)) {
      setShowMessage('⚠️ Insufficient JEWELS balance for withdrawal.');
      return;
    }
    setShowMessage(`PayPal withdrawal of ${withdrawalAmount} JEWELS to ${paypalEmail} initiated! (Requires admin processing)`);
    setIsModalLoading(true);
    try {
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
      setShowMessage('✅ PayPal withdrawal request submitted successfully! Transaction ID: ' + transactionId);
    } catch (err) {
      console.error('PayPal withdrawal error:', err);
      setShowMessage(`⚠️ PayPal withdrawal failed: ${(err as Error).message || 'Unknown error'}`);
    } finally {
      setIsModalLoading(false);
    }
  }, [userId, withdrawalAmount, paypalEmail, playerData, setShowMessage, setActiveModal]);

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
      await addDoc(collection(db, 'Transactions'), {
        transactionId: `${userId}_share_vault_${Date.now()}`,
        userId,
        amount: 5,
        currency: 'JEWELS' as SupportedCurrency,
        transactionType: 'quest-reward' as TransactionType,
        status: 'pending' as TransactionStatus,
        timestamp: serverTimestamp(),
        game: 'vault',
      });
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
    return null;
  }

  return (
    <SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}>
      <motion.div
        className="min-h-screen text-foreground font-orbitron bg-noise"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <StarfieldBackground />
        <motion.div className="relative z-20 max-w-7xl mx-auto py-16 px-6 sm:px-8 lg:px-16">
          {/* Hero Section */}
          <motion.section variants={sectionVariants} className="text-center mb-16">
            <Tilt tiltMaxAngleX={12} tiltMaxAngleY={12} glareEnable={true} glareMaxOpacity={0.4} glareColor="hsl(var(--primary))">
              <motion.div className="holographic-card mb-8 mx-auto max-w-5xl overflow-hidden animated-aura" variants={imageVariants}>
                <img
                  src="https://via.placeholder.com/1000x500?text=Energy+Vault"
                  alt="PETverse Vault"
                  className="w-full h-80 object-cover rounded-lg"
                />
              </motion.div>
            </Tilt>
            <h1 className="text-5xl lg:text-7xl font-extrabold text-foreground font-russo mb-6 text-glow-primary">
              <Wallet className="inline-block w-12 h-12 text-[hsl(var(--secondary))] animate-neon-pulse mr-4" />
              Energy Vault
            </h1>
            <p className="text-xl lg:text-2xl text-muted-foreground max-w-4xl mx-auto font-inter mb-8">
              Securely manage your crypto, fiat, and memberships in the PETverse’s cosmic vault.
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <motion.button
                  className="btn-system-glow text-lg font-semibold group"
                  onClick={() => setShowMessage('💰 Access your cosmic vault!')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Manage Vault"
                >
                  Manage Vault <Wallet className="ml-3 w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                </motion.button>
              </DialogTrigger>
              <DialogContent className="tooltip max-w-md p-6">
                <p className="text-sm text-muted-foreground">Swap currencies, withdraw funds, and manage memberships in the PETverse vault!</p>
              </DialogContent>
            </Dialog>
          </motion.section>

          {/* Vault Highlights */}
          <motion.section variants={sectionVariants} className="mb-16">
            <h2 className="text-4xl font-bold text-foreground font-russo text-center mb-8 text-glow-secondary">
              <Sparkles className="inline-block w-10 h-10 text-[hsl(var(--accent))] animate-neon-pulse mr-3" />
              Vault Highlights
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  name: 'Crypto Swaps',
                  image: 'https://via.placeholder.com/300x200?text=Crypto+Swaps',
                  description: 'Swap JEWELS and other cryptocurrencies.',
                  tooltip: 'Securely exchange assets on the blockchain.',
                },
                {
                  name: 'Fiat Withdrawals',
                  image: 'https://via.placeholder.com/300x200?text=Fiat+Withdrawals',
                  description: 'Withdraw earnings to PayPal or UPI.',
                  tooltip: 'Convert JEWELS to fiat with ease.',
                },
                {
                  name: 'Membership Upgrades',
                  image: 'https://via.placeholder.com/300x200?text=Membership+Upgrades',
                  description: 'Unlock exclusive perks with memberships.',
                  tooltip: 'Access premium features and rewards.',
                },
              ].map((feature, index) => (
                <motion.div key={index} variants={sectionVariants}>
                  <Tilt tiltMaxAngleX={6} tiltMaxAngleY={6} glareEnable={true} glareMaxOpacity={0.3}>
                    <div className="holographic-card p-8 text-center animated-aura">
                      <Dialog>
                        <DialogTrigger asChild>
                          <div className="relative group">
                            <img src={feature.image} alt={feature.name} className="w-full h-48 object-cover rounded-lg mb-6" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                              <Info className="w-8 h-8 text-[hsl(var(--secondary))] animate-neon-pulse" />
                            </div>
                          </div>
                        </DialogTrigger>
                        <DialogContent className="tooltip max-w-md p-6">
                          <h3 className="text-lg font-bold text-foreground font-russo mb-2">{feature.name}</h3>
                          <p className="text-sm text-muted-foreground">{feature.tooltip}</p>
                        </DialogContent>
                      </Dialog>
                      <h3 className="text-2xl font-semibold text-foreground font-russo mt-4">{feature.name}</h3>
                      <p className="text-sm text-muted-foreground mt-2">{feature.description}</p>
                    </div>
                  </Tilt>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Wallet Information */}
          <motion.section variants={sectionVariants} className="mb-16">
            <h2 className="text-4xl font-bold text-foreground font-russo text-center mb-8 text-glow-accent">
              <Wallet className="inline-block w-10 h-10 text-[hsl(var(--primary))] animate-neon-pulse mr-3" />
              Wallet Information
            </h2>
            <Tilt tiltMaxAngleX={8} tiltMaxAngleY={8} glareEnable={true} glareMaxOpacity={0.3}>
              <VaultWalletInfo
                isConnected={isConnected}
                address={address}
                chainId={chainId}
                ensName={null}
                blockNumber={currentBlockNumber || null}
                feeData={feeData}
                usdtBalance={usdtBalance}
              />
            </Tilt>
          </motion.section>

          {/* Crypto Swap Module */}
          <motion.section variants={sectionVariants} className="mb-16">
            <h2 className="text-4xl font-bold text-foreground font-russo text-center mb-8 text-glow-primary">
              <DollarSign className="inline-block w-10 h-10 text-[hsl(var(--secondary))] animate-neon-pulse mr-3" />
              Crypto Swaps
            </h2>
            <Tilt tiltMaxAngleX={8} tiltMaxAngleY={8} glareEnable={true} glareMaxOpacity={0.3}>
              <CryptoSwapModule
                userId={userId}
                setShowMessage={setShowMessage}
                setActiveModal={setActiveModal}
                updatePlayerFirestore={updatePlayerFirestore}
                isConnected={isConnected}
                walletAddress={address || null}
              />
            </Tilt>
          </motion.section>

          {/* Fiat Withdrawal Form */}
          <motion.section variants={sectionVariants} className="mb-16">
            <h2 className="text-4xl font-bold text-foreground font-russo text-center mb-8 text-glow-accent">
              <DollarSign className="inline-block w-10 h-10 text-[hsl(var(--primary))] animate-neon-pulse mr-3" />
              Fiat Withdrawals
            </h2>
            <Tilt tiltMaxAngleX={8} tiltMaxAngleY={8} glareEnable={true} glareMaxOpacity={0.3}>
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
            </Tilt>
          </motion.section>

          {/* Membership Packages */}
          <motion.section variants={sectionVariants} className="mb-16">
            <h2 className="text-4xl font-bold text-foreground font-russo text-center mb-8 text-glow-secondary">
              <Star className="inline-block w-10 h-10 text-[hsl(var(--accent))] animate-neon-pulse mr-3" />
              Membership Packages
            </h2>
            <Tilt tiltMaxAngleX={12} tiltMaxAngleY={12} glareEnable={true} glareMaxOpacity={0.4}>
              <motion.div className="holographic-card mb-8 mx-auto max-w-5xl overflow-hidden animated-aura" variants={imageVariants}>
                <img
                  src="https://via.placeholder.com/1000x500?text=Vault+Showcase"
                  alt="Vault Showcase"
                  className="w-full h-80 object-cover rounded-lg"
                />
              </motion.div>
            </Tilt>
            <VaultMembershipPackages
              isMember={playerData?.isPETMember || false}
              isPending={isPending}
              handleMembershipPayment={handleMembershipPayment}
              setShowMessage={setShowMessage}
            />
            <p className="text-center text-muted-foreground max-w-2xl mx-auto mt-6 font-inter">
              Upgrade your membership to unlock exclusive rewards and cosmic privileges.
            </p>
          </motion.section>

          {/* Vault Rules */}
          <motion.section variants={sectionVariants} className="mb-16">
            <h2 className="text-4xl font-bold text-foreground font-russo text-center mb-8 text-glow-primary">
              <Info className="inline-block w-10 h-10 text-[hsl(var(--secondary))] animate-neon-pulse mr-3" />
              Vault Rules
            </h2>
            <Tilt tiltMaxAngleX={8} tiltMaxAngleY={8} glareEnable={true} glareMaxOpacity={0.3}>
              <VaultRules />
            </Tilt>
          </motion.section>

          {/* Yield Calculator */}
          <motion.section variants={sectionVariants} className="mb-16">
            <h2 className="text-4xl font-bold text-foreground font-russo text-center mb-8 text-glow-accent">
              <DollarSign className="inline-block w-10 h-10 text-[hsl(var(--primary))] animate-neon-pulse mr-3" />
              Yield Calculator
            </h2>
            <Tilt tiltMaxAngleX={8} tiltMaxAngleY={8} glareEnable={true} glareMaxOpacity={0.3}>
              <YieldCalculator
                userId={userId}
                handleCalculateYield={handleCalculateYield}
                setShowMessage={setShowMessage}
                setActiveModal={setActiveModal}
              />
            </Tilt>
          </motion.section>

          {/* Game Features */}
          <motion.section variants={sectionVariants} className="mb-16">
            <h2 className="text-4xl font-bold text-foreground font-russo text-center mb-8 text-glow-secondary">
              <PlayCircle className="inline-block w-10 h-10 text-[hsl(var(--accent))] animate-neon-pulse mr-3" />
              Explore Games
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8 font-inter text-center">
              Dive into thrilling games and manage your assets across the PETverse.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              <AnimatePresence>
                {visibleGames.map((game) => (
                  <motion.div
                    key={game.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 30 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Tilt tiltMaxAngleX={6} tiltMaxAngleY={6} glareEnable={true} glareMaxOpacity={0.3}>
                      <SwytchCard gradient="from-[hsl(var(--primary),0.2)] to-[hsl(var(--secondary),0.2)]" className="p-8 holographic-card">
                        <motion.div className="text-center" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          {game.icon && <div className="mx-auto mb-4">{game.icon}</div>}
                          <h3 className="text-2xl font-bold text-foreground font-russo">{game.title}</h3>
                          <p className="text-muted-foreground font-inter mt-2">{game.description}</p>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Link
                                to={game.path}
                                className="btn-accent inline-block px-4 py-2 text-sm mt-4"
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
                            </DialogTrigger>
                            <DialogContent className="tooltip max-w-md p-6">
                              <p className="text-sm text-muted-foreground">Navigate to {game.title.toLowerCase()} to play or manage assets!</p>
                            </DialogContent>
                          </Dialog>
                        </motion.div>
                      </SwytchCard>
                    </Tilt>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            {hasMore && (
              <motion.div className="text-center mt-8" variants={sectionVariants}>
                <motion.button
                  className="btn-system-glow text-lg font-semibold group"
                  onClick={loadMoreGames}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Load More Games"
                >
                  Load More <PlayCircle className="ml-3 w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                </motion.button>
              </motion.div>
            )}
          </motion.section>

          {/* Community Vault Hub CTA */}
          <motion.section variants={sectionVariants} className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground font-russo mb-8 text-glow-primary">
              <Users className="inline-block w-10 h-10 text-[hsl(var(--accent))] animate-neon-pulse mr-3" />
              Community Vault Hub
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8 font-inter">
              Connect with the PETverse community to share vault strategies and secure your riches.
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <motion.button
                  className="btn-system-glow text-lg font-semibold group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Join Community"
                >
                  Join Now <Users className="ml-3 w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                </motion.button>
              </DialogTrigger>
              <DialogContent className="tooltip max-w-md p-6">
                <p className="text-sm text-muted-foreground">Join the PETverse community on Discord or X for vault tips!</p>
              </DialogContent>
            </Dialog>
          </motion.section>

          {/* Footer Actions */}
          <motion.section variants={sectionVariants} className="text-center py-8 border-t border-border/50">
            <h2 className="text-4xl font-bold text-foreground font-russo mb-6 text-glow-accent">
              <MessageCircleHeart className="inline-block w-10 h-10 text-[hsl(var(--primary))] animate-neon-pulse mr-3" />
              Spread the Word
            </h2>
            <div className="flex flex-wrap justify-center gap-6">
              <Dialog>
                <DialogTrigger asChild>
                  <motion.button
                    className="btn-primary inline-flex items-center px-8 py-4 text-lg font-semibold group"
                    onClick={shareOnX}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Share Vault on X"
                  >
                    <MessageCircleHeart className="w-6 h-6 mr-2" /> Share Vault on X
                  </motion.button>
                </DialogTrigger>
                <DialogContent className="tooltip max-w-md p-6">
                  <p className="text-sm text-muted-foreground">Share your vault management on X and earn rewards!</p>
                </DialogContent>
              </Dialog>
              <Dialog>
                <DialogTrigger asChild>
                  <Link
                    to="/home"
                    className="btn-primary inline-flex items-center px-8 py-4 text-lg font-semibold group"
                    onClick={() => setShowMessage('🏠 Navigating to Home!')}
                    role="button"
                    aria-label="Navigate to Home Page"
                  >
                    <Link className="w-6 h-6 mr-2" to={''} /> Back to Home
                  </Link>
                </DialogTrigger>
                <DialogContent className="tooltip max-w-md p-6">
                  <p className="text-sm text-muted-foreground">Return to the PETverse home to continue your adventure!</p>
                </DialogContent>
              </Dialog>
            </div>
          </motion.section>
        </motion.div>
      </motion.div>
    </SwytchErrorBoundary>
  );
};

export default Vault;