// src/pages/Benefits.tsx
import { FC, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { doc, onSnapshot, addDoc, collection, serverTimestamp } from 'firebase/firestore'; // Keep addDoc, collection, serverTimestamp for transaction logging
import { db } from '../lib/firebaseConfig';
import SwytchErrorBoundary from '../components/ErrorBoundaryComponent';
import { Sparkles, MessageCircleHeart } from 'lucide-react';

// Import PageProps and PlayerData types
import { PageProps, SupportedCurrency, TransactionType, TransactionStatus, PlayerData, Quest } from '../lib/types'; // Keep types for transaction logging

// Import modular components for Benefits page
import BenefitsGrid from '../components/benefits/BenefitsGrid';
import BenefitsCTA from '../components/benefits/BenefitsCTA';
import BenefitsWallets from '../components/benefits/BenefitsWallets';
import BenefitsPitfalls from '../components/benefits/BenefitsPitfalls';
import BenefitsSupport from '../components/benefits/BenefitsSupport';
import BenefitsQuests from '../components/benefits/BenefitsQuests';


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

const initialQuests: Quest[] = [
  { id: "benefits-visit", title: "Visit Benefits Page", progress: 0, goal: 1, rewardJEWELS: 5, rewardXP: 10, completed: false },
  { id: "benefits-share", title: "Share Benefits on X", progress: 0, goal: 1, rewardJEWELS: 5, rewardXP: 5, completed: false },
];


const Benefits: FC<PageProps> = ({
  userId,
  setActiveModal,
  setShowMessage,
  setIsPETMember,
  jewelsBalance, // Keep for display purposes
  isPending,
  authLoading,
  initialAuthCheckComplete,
}) => {
  const [, setPlayerData] = useState<PlayerData | null>(null); // PlayerData state not directly used in render, but for fetching
  const [quests, setQuests] = useState<Quest[]>(initialQuests);
  const [, setIsModalLoading] = useState<boolean>(false);
  const [expandedBenefit, setExpandedBenefit] = useState<string | null>(null);
  const [showPitfalls, setShowPitfalls] = useState(false);

  useEffect(() => {
    if (userId) {
      const userRef = doc(db, 'Players', userId);
      const unsubscribe = onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as PlayerData;
          setPlayerData(data);
          setIsPETMember(data.isPETMember || false);
          const mergedQuests = initialQuests.map((initialQuest) => {
            const savedQuest = data.quests?.find((q: Quest) => q.id === initialQuest.id);
            return savedQuest && initialQuest.goal === savedQuest.goal ? savedQuest : initialQuest;
          });
          setQuests(mergedQuests);

          // Log visit quest completion, actual reward by backend
          if (!mergedQuests.find((q) => q.id === "benefits-visit")?.completed) {
            setShowMessage('🎉 Quest "Visit Benefits Page" completed! Reward pending verification.');
            // This would trigger a backend Cloud Function to update quests and jewels
            // Example: call a Cloud Function via fetch or simple Firestore write to a 'quest_completion_requests' collection
          }

        } else {
          setPlayerData(null);
          setIsPETMember(false);
          if (initialAuthCheckComplete) {
            setShowMessage('⚠️ User data not found. Please ensure you are signed in.');
            setActiveModal('auth');
          }
        }
      }, (err) => {
        console.error('Failed to fetch user data for Benefits page:', err);
        setShowMessage('⚠️ Failed to load benefits data. Please check your connection.');
        setActiveModal('error');
      });
      return () => unsubscribe();
    } else {
      setPlayerData(null);
      setIsPETMember(false);
      if (initialAuthCheckComplete) {
        setShowMessage('⚠️ Please sign in to explore benefits!');
        setActiveModal('auth');
      }
    }
  }, [userId, setIsPETMember, setShowMessage, setActiveModal, initialAuthCheckComplete]);

  const handleShareOnX = useCallback(async () => {
    if (!userId) {
      setShowMessage('⚠️ Please sign in to share.');
      setActiveModal('auth');
      return;
    }
    setIsModalLoading(true);
    const shareQuest = quests.find((q) => q.id === "benefits-share");
    if (shareQuest && !shareQuest.completed) {
      const shareText = encodeURIComponent("Unlocking amazing benefits in the Swytch PETverse! 🌟 Join at swytch.io! #SwytchPETverse");
      window.open(`https://x.com/intent/tweet?text=${shareText}`, "_blank");
      // Log transaction for sharing, actual reward by backend
      try {
        await addDoc(collection(db, 'Transactions'), {
          transactionId: `${userId}_share_benefits_${Date.now()}`,
          userId,
          amount: shareQuest.rewardJEWELS,
          currency: 'JEWELS' as SupportedCurrency,
          transactionType: 'quest-reward' as TransactionType,
          status: 'pending' as TransactionStatus, // Status is pending backend verification
          timestamp: serverTimestamp(),
          game: 'benefits',
          itemId: shareQuest.id, // Reference the quest ID
        });
        setShowMessage(`🎉 Shared Benefits on X! Reward pending verification.`);
      } catch (err) {
        console.error('Failed to log transaction:', err);
        setShowMessage('⚠️ Failed to share on X. Try again.');
        setActiveModal('error');
      }
    }
    setIsModalLoading(false);
  }, [userId, quests, setShowMessage, setActiveModal]);

  const toggleBenefit = (title: string) => {
    setExpandedBenefit(expandedBenefit === title ? null : title);
  };

  const handlePitfallsView = useCallback(() => {
    setShowPitfalls(!showPitfalls);
    setShowMessage(showPitfalls ? 'Returning to benefits overview.' : 'Understanding potential pitfalls...');
  }, [showPitfalls, setShowMessage]);

  const saveBenefitsQuestsToFirestore = useCallback(async () => {
    if (!userId) return;
    // --- IMPORTANT: Quest saving logic now requires backend Cloud Function ---
    // The client-side app should not directly update 'quests' or 'jewels'
    // due to strict Firestore rules.
    //
    // This function will now primarily be a placeholder for indicating that a backend call is needed.
    setShowMessage("ℹ️ Quest progress saved (requires backend to apply changes).");
    // --- END IMPORTANT ---
  }, [userId, setShowMessage]);


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
            <Sparkles className="w-8 h-8 text-cyan-400 animate-pulse" /> PETverse Benefits
          </h1>

          {/* Benefits Quests Section */}
          <motion.div variants={sectionVariants} className="mb-8">
            <BenefitsQuests
              userId={userId}
              quests={quests}
              setQuests={setQuests}
              jewelsBalance={jewelsBalance}
              saveStateToFirestore={saveBenefitsQuestsToFirestore}
              setActiveModal={setActiveModal}
              setShowMessage={setShowMessage}
            />
          </motion.div>

          {/* Benefits Grid */}
          <motion.div variants={sectionVariants} className="mb-8">
            <BenefitsGrid
              expandedBenefit={expandedBenefit}
              toggleBenefit={toggleBenefit}
              userId={userId}
              setActiveModal={setActiveModal}
              setShowMessage={setShowMessage}
            />
          </motion.div>

          {/* Benefits Wallets */}
          <motion.div variants={sectionVariants} className="mb-8">
            <BenefitsWallets
              userId={userId}
              setActiveModal={setActiveModal}
              setShowMessage={setShowMessage}
            />
          </motion.div>

          {/* Benefits Pitfalls */}
          <motion.div variants={sectionVariants} className="mb-8">
            <BenefitsPitfalls
              handlePitfallsView={handlePitfallsView}
              userId={userId}
              setActiveModal={setActiveModal}
              setShowMessage={setShowMessage}
            />
          </motion.div>

          {/* Benefits Support */}
          <motion.div variants={sectionVariants} className="mb-8">
            <BenefitsSupport
              userId={userId}
              logUpiIntent={async (amount: number) => {
                setShowMessage(`Initiating UPI intent for ${amount} INR.`);
                setActiveModal('payment');
              }}
            />
          </motion.div>

          {/* Benefits CTA */}
          <motion.div variants={sectionVariants} className="mb-8">
            <BenefitsCTA
              userId={userId}
              setActiveModal={setActiveModal}
              setShowMessage={setShowMessage}
              logUpiIntent={async (amount: number) => {
                setShowMessage(`Initiating UPI intent for ${amount} INR.`);
                setActiveModal('payment');
              }}
            />
          </motion.div>

          {/* Share on X Button */}
          <motion.div variants={sectionVariants} className="text-center py-8">
            <motion.button
              className="inline-flex items-center px-6 py-3 bg-rose-600 text-white hover:bg-cyan-500 rounded-full font-semibold font-poppins mr-4"
              onClick={handleShareOnX}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Share Benefits on X"
            >
              <MessageCircleHeart className="w-5 h-5 mr-2" /> Share Benefits on X
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

export default Benefits;
