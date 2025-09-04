// src/pages/Membership.tsx
import { FC, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { doc, onSnapshot, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebaseConfig';
import { Sparkles, Star, Users, Award } from 'lucide-react';
import SwytchErrorBoundary from '../components/ErrorBoundaryComponent';
import StarfieldBackground from '../components/StarfieldBackground';
import MembershipUpgrade from '../components/membership/MembershipUpgrade';
import SwytchLevelsGrid from '../components/membership/SwytchLevelsGrid';
import { PageProps, SupportedCurrency, TransactionType, TransactionStatus, PlayerData } from '../lib/types';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.3 } },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
};

const Membership: FC<PageProps> = ({
  userId,
  setActiveModal,
  setShowMessage,
  setIsPETMember,
  updatePlayerFirestore,
  currentLevel,
  isPending,
  authLoading,
  initialAuthCheckComplete,
}) => {
  const [, setPlayerData] = useState<PlayerData | null>(null);

  // All logic (useEffect, handlers) remains unchanged
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
        console.error('Failed to fetch user data for Membership page:', err);
        setShowMessage('⚠️ Failed to load membership data.');
        setActiveModal('error');
      });
      return () => unsubscribe();
    } else {
      setPlayerData(null);
      setIsPETMember(false);
      if (initialAuthCheckComplete) {
        setShowMessage('⚠️ Please sign in to explore membership!');
        setActiveModal('auth');
      }
    }
  }, [userId, setIsPETMember, setShowMessage, setActiveModal, initialAuthCheckComplete]);

  const handlePurchaseLevel = useCallback(async (level: { id: string; name: string; cost: number; contentRoute: string }) => {
    if (!userId) {
      setShowMessage('⚠️ Please connect your wallet or log in.');
      setActiveModal('auth');
      return;
    }
    try {
      const transactionId = `${userId}_level_purchase_${level.id}_${Date.now()}`;
      await addDoc(collection(db, 'Transactions'), {
        transactionId,
        userId,
        amount: level.cost,
        currency: 'INR' as SupportedCurrency,
        transactionType: 'level-purchase' as TransactionType,
        status: 'pending' as TransactionStatus,
        timestamp: serverTimestamp(),
        game: 'membership',
        itemId: level.id,
      });
      setShowMessage(`ℹ️ Membership upgrade to ${level.name} submitted! Awaiting payment confirmation.`);
      setActiveModal('payment');
    } catch (err) {
      console.error('Level purchase error:', err);
      setShowMessage('⚠️ Failed to initiate level purchase. Try again.');
      setActiveModal('error');
    }
  }, [userId, setShowMessage, setActiveModal]);

  const handleShareOnX = useCallback(async () => {
    if (!userId) {
      setShowMessage('⚠️ Please sign in to share.');
      setActiveModal('auth');
      return;
    }
    try {
      const shareText = encodeURIComponent("Upgrading my PETverse Membership! 🌟 Join at swytch.io! #SwytchPETverse");
      window.open(`https://x.com/intent/tweet?text=${shareText}`, "_blank");
      await addDoc(collection(db, 'Transactions'), {
        transactionId: `${userId}_share_membership_${Date.now()}`,
        userId,
        amount: 5,
        currency: 'JEWELS' as SupportedCurrency,
        transactionType: 'quest-reward' as TransactionType,
        status: 'pending' as TransactionStatus,
        timestamp: serverTimestamp(),
        game: 'membership',
      });
      setShowMessage('🎉 Shared Membership on X! Reward pending verification.');
    } catch (err) {
      console.error('Failed to share on X:', err);
      setShowMessage('⚠️ Failed to share on X. Try again.');
      setActiveModal('error');
    }
  }, [userId, setShowMessage, setActiveModal]);

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
        <div className="relative z-10 max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 space-y-20">
          
          {/* ## Header Section ## */}
          <motion.section variants={sectionVariants} className="text-center">
            <Star className="mx-auto w-16 h-16 text-[hsl(var(--secondary))] animate-neon-pulse mb-4" />
            <h1 className="text-5xl lg:text-7xl font-extrabold text-foreground font-russo mb-4 text-glow-primary tracking-tight">
              Cosmic Membership
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-inter">
              Ascend to a higher tier. Unlock exclusive rewards, powerful in-game advantages, and legendary status in the PETverse.
            </p>
          </motion.section>

          {/* ## Membership Tiers Section ## */}
          <motion.section variants={sectionVariants}>
            <h2 className="text-4xl font-bold text-foreground font-russo text-center mb-10 text-glow-secondary tracking-tight">
              <Award className="inline-block w-10 h-10 text-[hsl(var(--accent))] animate-neon-pulse mr-3" />
              Choose Your Tier
            </h2>
             <SwytchLevelsGrid
                userId={userId}
                currentLevel={currentLevel}
                isPending={isPending}
                authLoading={authLoading}
                updatePlayerFirestore={updatePlayerFirestore}
                handlePurchaseLevel={handlePurchaseLevel}
                setActiveModal={setActiveModal}
                setShowMessage={setShowMessage}
              />
          </motion.section>

          {/* ## Membership Upgrade Section (if applicable) ## */}
           <motion.section variants={sectionVariants}>
            <h2 className="text-4xl font-bold text-foreground font-russo text-center mb-10 text-glow-accent tracking-tight">
              <Sparkles className="inline-block w-10 h-10 text-[hsl(var(--primary))] animate-neon-pulse mr-3" />
              Special Upgrades
            </h2>
            <div className="p-4 sm:p-8 bg-black/20 rounded-lg border border-[hsl(var(--primary),0.1)] backdrop-blur-sm">
                <MembershipUpgrade
                    userId={userId}
                    setIsPETMember={setIsPETMember}
                    updatePlayerFirestore={updatePlayerFirestore}
                    setActiveModal={setActiveModal}
                    setShowMessage={setShowMessage}
                />
            </div>
          </motion.section>


          {/* ## Final CTA Section ## */}
          <motion.section variants={sectionVariants} className="text-center p-8 bg-black/20 rounded-lg border border-[hsl(var(--primary),0.1)] backdrop-blur-sm">
             <h2 className="text-3xl font-bold text-foreground font-russo mb-4 text-glow-primary tracking-tight">
                Connect & Share Your Ascent
             </h2>
             <p className="text-muted-foreground max-w-2xl mx-auto font-inter mb-6">
                Join our community to discuss membership perks, and share your new status on X for a special reward.
             </p>
             <div className="flex flex-wrap justify-center items-center gap-4">
                <Link to="/community" className="btn-system-glow-secondary inline-flex items-center px-6 py-3 text-lg font-semibold">
                    <Users className="w-6 h-6 mr-2" /> Join Community
                </Link>
                <button onClick={handleShareOnX} className="btn-system-glow inline-flex items-center px-6 py-3 text-lg font-semibold">
                    <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 1200 1227"><path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z"/></svg>
                    Share on X
                </button>
             </div>
           </motion.section>
        </div>
      </motion.div>
    </SwytchErrorBoundary>
  );
};

export default Membership;