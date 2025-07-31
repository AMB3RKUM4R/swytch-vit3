// src/pages/Vault.tsx
import { FC, useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { doc, onSnapshot, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebaseConfig';
import { Dialog, DialogContent, DialogTrigger } from '@radix-ui/react-dialog';
import { Sparkles, MessageCircleHeart, Wallet, Info, DollarSign, Star, Package, PlayCircle, Store, Users, Home } from 'lucide-react';
import { useAccount, useGasPrice, useBalance, useChainId, useBlockNumber } from 'wagmi';
import SwytchErrorBoundary from '../components/ErrorBoundaryComponent';
import StarfieldBackground from '../components/StarfieldBackground';
import VaultWalletInfo from '../components/vault/VaultWalletInfo';
import VaultMembershipPackages from '../components/vault/VaultMembershipPackages';
import CryptoSwapModule from '../components/vault/CryptoSwapModule';
import VaultRules from '../components/vault/VaultRules';
import YieldCalculator from '../components/vault/YieldCalculator';
import SwytchCard from '../components/SwytchCard';
import { PageProps, PlayerData, SupportedCurrency, TransactionType, TransactionStatus } from '../lib/types';

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
  const [, setIsModalLoading] = useState<boolean>(false);
  const [] = useState<string>('');

  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: gasPrice } = useGasPrice();
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
      <div className="min-h-screen text-foreground font-orbitron bg-noise">
        <StarfieldBackground />
        <div className="relative z-20 max-w-7xl mx-auto py-16 px-6 sm:px-8 lg:px-16">
          {/* Hero Section */}
          <section className="text-center mb-16">
            <div className="holographic-card mb-8 mx-auto max-w-5xl overflow-hidden animated-aura">
              <img
                src="https://via.placeholder.com/1000x500?text=Energy+Vault"
                alt="PETverse Vault"
                className="w-full h-80 object-cover rounded-lg"
              />
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold text-foreground font-russo mb-6 text-glow-primary">
              <Wallet className="inline-block w-12 h-12 text-[hsl(var(--secondary))] animate-neon-pulse mr-4" />
              Energy Vault
            </h1>
            <p className="text-xl lg:text-2xl text-muted-foreground max-w-4xl mx-auto font-inter mb-8">
              Securely manage your crypto, and memberships in the PETverse’s cosmic vault.
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <button
                  className="btn-system-glow text-lg font-semibold group"
                  onClick={() => setShowMessage('💰 Access your cosmic vault!')}
                  aria-label="Manage Vault"
                >
                  Manage Vault <Wallet className="ml-3 w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                </button>
              </DialogTrigger>
              <DialogContent className="tooltip max-w-md p-6">
                <p className="text-sm text-muted-foreground">Swap currencies, withdraw funds, and manage memberships in the PETverse vault!</p>
              </DialogContent>
            </Dialog>
          </section>

          {/* Vault Highlights */}
          <section className="mb-16">
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
                  name: 'Membership Upgrades',
                  image: 'https://via.placeholder.com/300x200?text=Membership+Upgrades',
                  description: 'Unlock exclusive perks with memberships.',
                  tooltip: 'Access premium features and rewards.',
                },
              ].map((feature, index) => (
                <div key={index}>
                  <div className="holographic-card p-8 text-center animated-aura">
                    <Dialog>
                      <DialogTrigger asChild>
                        <button className="relative group p-0 m-0 border-none bg-transparent w-full h-full flex flex-col items-center justify-center">
                          <img src={feature.image} alt={feature.name} className="w-full h-48 object-cover rounded-lg mb-6" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <Info className="w-8 h-8 text-[hsl(var(--secondary))] animate-neon-pulse" />
                          </div>
                        </button>
                      </DialogTrigger>
                      <DialogContent className="tooltip max-w-md p-6">
                        <h3 className="text-lg font-bold text-foreground font-russo mb-2">{feature.name}</h3>
                        <p className="text-sm text-muted-foreground">{feature.tooltip}</p>
                      </DialogContent>
                    </Dialog>
                    <h3 className="text-2xl font-semibold text-foreground font-russo mt-4">{feature.name}</h3>
                    <p className="text-sm text-muted-foreground mt-2">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Wallet Information */}
          <section className="mb-16">
            <h2 className="text-4xl font-bold text-foreground font-russo text-center mb-8 text-glow-accent">
              <Wallet className="inline-block w-10 h-10 text-[hsl(var(--primary))] animate-neon-pulse mr-3" />
              Wallet Information
            </h2>
            <div>
              <VaultWalletInfo
                isConnected={isConnected}
                address={address}
                chainId={chainId}
                ensName={null}
                blockNumber={currentBlockNumber || null}
                gasPrice={gasPrice}
                usdtBalance={usdtBalance}
              />
            </div>
          </section>

          {/* Crypto Swap Module */}
          <section className="mb-16">
            <h2 className="text-4xl font-bold text-foreground font-russo text-center mb-8 text-glow-primary">
              <DollarSign className="inline-block w-10 h-10 text-[hsl(var(--secondary))] animate-neon-pulse mr-3" />
              Crypto Swaps
            </h2>
            <div>
              <CryptoSwapModule
                userId={userId}
                setShowMessage={setShowMessage}
                setActiveModal={setActiveModal}
                updatePlayerFirestore={updatePlayerFirestore}
                isConnected={isConnected}
                walletAddress={address || null}
              />
            </div>
          </section>

          {/* Membership Packages */}
          <section className="mb-16">
            <h2 className="text-4xl font-bold text-foreground font-russo text-center mb-8 text-glow-secondary">
              <Star className="inline-block w-10 h-10 text-[hsl(var(--accent))] animate-neon-pulse mr-3" />
              Membership Packages
            </h2>
            <div className="holographic-card mb-8 mx-auto max-w-5xl overflow-hidden animated-aura">
              <img
                src="https://via.placeholder.com/1000x500?text=Vault+Showcase"
                alt="Vault Showcase"
                className="w-full h-80 object-cover rounded-lg"
              />
            </div>
            <VaultMembershipPackages
              isMember={playerData?.isPETMember || false}
              isPending={isPending}
              handleMembershipPayment={handleMembershipPayment}
              setShowMessage={setShowMessage}
            />
            <p className="text-center text-muted-foreground max-w-2xl mx-auto mt-6 font-inter">
              Upgrade your membership to unlock exclusive rewards and cosmic privileges.
            </p>
          </section>

          {/* Vault Rules */}
          <section className="mb-16">
            <h2 className="text-4xl font-bold text-foreground font-russo text-center mb-8 text-glow-primary">
              <Info className="inline-block w-10 h-10 text-[hsl(var(--secondary))] animate-neon-pulse mr-3" />
              Vault Rules
            </h2>
            <div>
              <VaultRules />
            </div>
          </section>

          {/* Yield Calculator */}
          <section className="mb-16">
            <h2 className="text-4xl font-bold text-foreground font-russo text-center mb-8 text-glow-accent">
              <DollarSign className="inline-block w-10 h-10 text-[hsl(var(--primary))] animate-neon-pulse mr-3" />
              Yield Calculator
            </h2>
            <div>
              <YieldCalculator
                userId={userId}
                handleCalculateYield={handleCalculateYield}
                setShowMessage={setShowMessage}
                setActiveModal={setActiveModal}
              />
            </div>
          </section>

          {/* Game Features */}
          <section className="mb-16">
            <h2 className="text-4xl font-bold text-foreground font-russo text-center mb-8 text-glow-secondary">
              <PlayCircle className="inline-block w-10 h-10 text-[hsl(var(--accent))] animate-neon-pulse mr-3" />
              Explore Games
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8 font-inter text-center">
              Dive into thrilling games and manage your assets across the PETverse.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {visibleGames.map((game) => (
                <div key={game.id}>
                  <SwytchCard gradient="from-[hsl(var(--primary),0.2)] to-[hsl(var(--secondary),0.2)]" className="p-8 holographic-card">
                    <Link
                      to={game.path}
                      className="text-center block h-full w-full"
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
                      <div className="h-full flex flex-col justify-center">
                        {game.icon && <div className="mx-auto mb-4">{game.icon}</div>}
                        <h3 className="text-2xl font-bold text-foreground font-russo">{game.title}</h3>
                        <p className="text-muted-foreground font-inter mt-2">{game.description}</p>
                        <span className="btn-accent inline-block px-4 py-2 text-sm mt-4">
                          Go to {game.title}
                        </span>
                      </div>
                    </Link>
                  </SwytchCard>
                </div>
              ))}
            </div>
            {hasMore && (
              <div className="text-center mt-8">
                <button
                  className="btn-system-glow text-lg font-semibold group"
                  onClick={loadMoreGames}
                  aria-label="Load More Games"
                >
                  Load More <PlayCircle className="ml-3 w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                </button>
              </div>
            )}
          </section>

          {/* Community Vault Hub CTA */}
          <section className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground font-russo mb-8 text-glow-primary">
              <Users className="inline-block w-10 h-10 text-[hsl(var(--accent))] animate-neon-pulse mr-3" />
              Community Vault Hub
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8 font-inter">
              Connect with the PETverse community to share vault strategies and secure your riches.
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <button
                  className="btn-system-glow text-lg font-semibold group"
                  aria-label="Join Community"
                >
                  Join Now <Users className="ml-3 w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                </button>
              </DialogTrigger>
              <DialogContent className="tooltip max-w-md p-6">
                <p className="text-sm text-muted-foreground">Join the PETverse community on Discord or X for vault tips!</p>
              </DialogContent>
            </Dialog>
          </section>

          {/* Footer Actions */}
          <section className="text-center py-8 border-t border-border/50">
            <h2 className="text-4xl font-bold text-foreground font-russo mb-6 text-glow-accent">
              <MessageCircleHeart className="inline-block w-10 h-10 text-[hsl(var(--primary))] animate-neon-pulse mr-3" />
              Spread the Word
            </h2>
            <div className="flex flex-wrap justify-center gap-6">
              <Dialog>
                <DialogTrigger asChild>
                  <button
                    className="btn-primary inline-flex items-center px-8 py-4 text-lg font-semibold group"
                    onClick={shareOnX}
                    aria-label="Share Vault on X"
                  >
                    <MessageCircleHeart className="w-6 h-6 mr-2" /> Share Vault on X
                  </button>
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
                    <Home className="w-6 h-6 mr-2" /> Back to Home
                  </Link>
                </DialogTrigger>
                <DialogContent className="tooltip max-w-md p-6">
                  <p className="text-sm text-muted-foreground">Return to the PETverse home to continue your adventure!</p>
                </DialogContent>
              </Dialog>
            </div>
          </section>
        </div>
      </div>
    </SwytchErrorBoundary>
  );
};

export default Vault;