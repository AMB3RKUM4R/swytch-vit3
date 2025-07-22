// src/pages/Membership.tsx
import { FC, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { doc, onSnapshot, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebaseConfig';
import SwytchErrorBoundary from '../components/ErrorBoundaryComponent';
import { Sparkles, MessageCircleHeart } from 'lucide-react';

// Import PageProps and other types
import { PageProps, SupportedCurrency, TransactionType, TransactionStatus, PlayerData } from '../lib/types';

// Import modular components for Membership page
import MembershipBenefits from '../components/membership/MembershipBenefits';
import MembershipUpgrade from '../components/membership/MembershipUpgrade';
import SwytchLevelsGrid from '../components/membership/SwytchLevelsGrid';


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


const Membership: FC<PageProps> = ({
  userId,
  setActiveModal,
  setShowMessage,
  setIsPETMember,
  updatePlayerFirestore,
  jewelsBalance,
  currentLevel,
  isPending,
  authLoading,
}) => {
  const [, setPlayerData] = useState<PlayerData | null>(null);
  const [, setIsModalLoading] = useState<boolean>(false); // Used for general loading states

  useEffect(() => {
    if (userId) {
      const userRef = doc(db, 'Players', userId);
      const unsubscribe = onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
          setPlayerData(docSnap.data() as PlayerData);
          setIsPETMember(docSnap.data().isPETMember || false);
        } else {
          setPlayerData(null);
          setIsPETMember(false);
          setShowMessage('⚠️ User data not found. Please ensure you are signed in.');
          setActiveModal('auth');
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
      setShowMessage('⚠️ Please sign in to explore membership!');
      setActiveModal('auth');
    }
  }, [userId, setIsPETMember, setShowMessage, setActiveModal]);

  const handlePurchaseLevel = useCallback(async (level: { id: string; name: string; cost: number; contentRoute: string }) => {
    if (!userId) {
      setShowMessage('⚠️ Please connect your wallet or log in.');
      setActiveModal('auth');
      return;
    }
    // This logic should ideally be in MembershipUpgrade or a dedicated hook/service
    // For now, we'll keep it here as a placeholder for triggering the payment modal.
    try {
      const transactionId = `${userId}_level_purchase_${level.id}_${Date.now()}`;
      await addDoc(collection(db, 'Transactions'), {
        transactionId,
        userId,
        amount: level.cost,
        currency: 'JEWELS' as SupportedCurrency, // Assuming level purchase is with JEWELS
        transactionType: 'level-purchase' as TransactionType,
        status: 'pending' as TransactionStatus,
        timestamp: serverTimestamp(),
        game: 'membership',
        itemId: level.id,
      });
      setShowMessage(`ℹ️ Opening payment for ${level.name}. Admin will assign level after payment.`);
      setActiveModal('payment'); // Open the global payment modal
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
    setIsModalLoading(true);
    try {
      const shareText = encodeURIComponent("Upgrading my PETverse Membership! 🌟 Join at swytch.io! #SwytchPETverse");
      window.open(`https://x.com/intent/tweet?text=${shareText}`, "_blank");
      // Log transaction for sharing
      await addDoc(collection(db, 'Transactions'), {
        transactionId: `${userId}_share_membership_${Date.now()}`,
        userId,
        amount: 5, // Example reward
        currency: 'JEWELS' as SupportedCurrency,
        transactionType: 'quest-reward' as TransactionType,
        status: 'success' as TransactionStatus,
        timestamp: serverTimestamp(),
        game: 'membership',
      });
      await updatePlayerFirestore({ jewels: jewelsBalance + 5 });
      setShowMessage('🎉 Shared Membership on X! +5 JEWELS');
    } catch (err) {
      console.error('Failed to share on X:', err);
      setShowMessage('⚠️ Failed to share on X. Try again.');
      setActiveModal('error');
    } finally {
      setIsModalLoading(false);
    }
  }, [userId, jewelsBalance, setShowMessage, setActiveModal, updatePlayerFirestore]);


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
            <Sparkles className="w-8 h-8 text-cyan-400 animate-pulse" /> PETverse Membership
          </h1>

          {/* Membership Levels Grid */}
          <motion.div variants={sectionVariants} className="mb-8">
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
          </motion.div>

          {/* Membership Benefits */}
          <motion.div variants={sectionVariants} className="mb-8">
            <MembershipBenefits />
          </motion.div>

          {/* Membership Upgrade Section */}
          <motion.div variants={sectionVariants} className="mb-8">
            <MembershipUpgrade
              userId={userId}
              setIsPETMember={setIsPETMember}
              updatePlayerFirestore={updatePlayerFirestore}
              setActiveModal={setActiveModal}
              setShowMessage={setShowMessage}
            />
          </motion.div>


          {/* Action Buttons */}
          <motion.div variants={sectionVariants} className="text-center py-8">
            <motion.button
              className="inline-flex items-center px-6 py-3 bg-rose-600 text-white hover:bg-cyan-500 rounded-full font-semibold font-poppins mr-4"
              onClick={handleShareOnX}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Share Membership on X"
            >
              <MessageCircleHeart className="w-5 h-5 mr-2" /> Share Membership on X
            </motion.button>
            <Link
              to="/home"
              className="inline-block bg-rose-600 text-white px-6 py-3 rounded-full font-poppins hover:bg-cyan-500"
              onClick={() => setShowMessage('🏠 Navigating to Home!')}
              role="button"
              aria-label="Navigate to Home Page"
            >
              Back to Home
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </SwytchErrorBoundary>
  );
};

export default Membership;
