import { FC, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebaseConfig';
import { Sparkles, MessageCircleHeart } from 'lucide-react';
import BenefitsHero from '../components/BenefitsHero';
import BenefitsQuests from '../components/BenefitsQuests';
import BenefitsGrid from '../components/BenefitsGrid';
import BenefitsEcosphere from '../components/BenefitsEcosphere';
import BenefitsPitfalls from '../components/BenefitsPitfalls';
import BenefitsWallets from '../components/BenefitsWallets';
import WalletSecurity from '../components/WalletSecurity';
import SwytchErrorBoundary from '../components/ErrorBoundaryComponent';

// IMPORTANT: Import Quest and BenefitsProps from your lib/types.ts file.
import { Quest, BenefitsProps as ImportedBenefitsProps } from '../lib/types';


// Quest interface is now imported from lib/types.ts

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

const initialQuests: Quest[] = [ // Explicitly type initialQuests
  { id: "benefits-visit", title: "Visit Benefits Page", progress: 0, goal: 1, rewardJEWELS: 5, rewardXP: 10, completed: false },
  { id: "benefits-share", title: "Share Benefits on X", progress: 0, goal: 1, rewardJEWELS: 5, rewardXP: 5, completed: false },
];

// Use ImportedBenefitsProps as the type for the FC
const Benefits: FC<ImportedBenefitsProps> = ({
  userId,
  setActiveModal,
  setShowMessage,
  setIsPETMember,
  updatePlayerFirestore,
  jewelsBalance = 0, // Default value for prop
  isPending = false, // Default value for prop
  authLoading = false, // Default value for prop
}) => {
  const [quests, setQuests] = useState<Quest[]>(initialQuests);
  const [expandedBenefit, setExpandedBenefit] = useState<string | null>(null);

  const shareOnX = useCallback(async () => {
    if (!userId) {
      setShowMessage('⚠️ Please sign in to share.');
      setActiveModal('auth');
      return;
    }
    const shareQuest = quests.find((q) => q.id === "benefits-share");
    if (shareQuest && !shareQuest.completed) {
      const shareText = encodeURIComponent("Exploring the awesome benefits of Swytch PETverse! 🌟 Join at swytch.io! #SwytchPETverse");
      window.open(`https://x.com/intent/tweet?text=${shareText}`, "_blank");
      const updatedQuests = quests.map((q) =>
        q.id === "benefits-share" ? { ...q, progress: 1, completed: true } : q
      );
      setQuests(updatedQuests);
      await updatePlayerFirestore({ quests: updatedQuests, jewels: jewelsBalance + shareQuest.rewardJEWELS });
      setShowMessage(`🎉 Quest Completed: ${shareQuest.title}! +${shareQuest.rewardJEWELS} JEWELS`);
      // If logUpiIntent is intended to be called here after sharing, uncomment and pass an amount.
      // await logUpiIntent(shareQuest.rewardJEWELS); // Example: Log reward as UPI intent if needed
    }
  }, [userId, quests, jewelsBalance, setShowMessage, setActiveModal, updatePlayerFirestore]);

  useEffect(() => {
    if (userId) {
      const userRef = doc(db, 'Players', userId);
      const unsubscribe = onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setIsPETMember(data.isPETMember || false);
          
          const fetchedQuests: Quest[] = data.quests?.length ? data.quests : initialQuests;
          setQuests(fetchedQuests); // FIX: Changed from fetchedMessages to fetchedQuests

          if (!fetchedQuests.find((q: Quest) => q.id === "benefits-visit")?.completed) {
            const updatedQuests = fetchedQuests.map((q) =>
              q.id === "benefits-visit" ? { ...q, progress: 1, completed: true } : q
            );
            setQuests(updatedQuests);
            updatePlayerFirestore({ quests: updatedQuests, jewels: (data.jewels || 0) + 5 });
            setShowMessage('🎉 Quest Completed: Visit Benefits Page! +5 JEWELS');
          }
        }
      }, (err) => {
        console.error('Failed to fetch user data for benefits:', err);
        setShowMessage('⚠️ Failed to load user data for benefits.');
        setActiveModal('error');
      });
      return () => unsubscribe();
    } else {
      setShowMessage('⚠️ Please sign in to access benefits!');
      setActiveModal('auth');
    }
  }, [userId, setIsPETMember, setShowMessage, setActiveModal, updatePlayerFirestore]); // Removed `quests` from deps

  const toggleBenefit = (benefit: string) => {
    setExpandedBenefit(expandedBenefit === benefit ? null : benefit);
  };

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
          <p>Loading Benefits...</p>
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

        <motion.div className="relative z-10 max-w-6xl mx-auto">
          <motion.div variants={sectionVariants}>
            <BenefitsHero
              userId={userId}
              jewelsBalance={jewelsBalance}
              setActiveModal={setActiveModal}
              setShowMessage={setShowMessage}
            />
          </motion.div>
          <motion.div variants={sectionVariants}>
            <BenefitsQuests
              userId={userId}
              quests={quests}
              setQuests={setQuests}
              jewelsBalance={jewelsBalance}
              saveStateToFirestore={updatePlayerFirestore}
              setActiveModal={setActiveModal}
              setShowMessage={setShowMessage}
              setJewelsBalance={function (_value: React.SetStateAction<number>): void {
                throw new Error('Function not implemented.');
              } } 
            />
          </motion.div>
          <motion.div variants={sectionVariants}>
            <BenefitsGrid
              expandedBenefit={expandedBenefit}
              toggleBenefit={toggleBenefit}
              setActiveModal={setActiveModal} // Pass setActiveModal
              setShowMessage={setShowMessage} // Pass setShowMessage
              userId={userId}            />
          </motion.div>
          <motion.div variants={sectionVariants}>
            <BenefitsEcosphere />
          </motion.div>
          <motion.div variants={sectionVariants}>
            <BenefitsPitfalls
              handlePitfallsView={() => {
                setShowMessage('ℹ️ Learn more about PETverse risks!');
                setActiveModal('info');
              }}
              userId={userId} // Pass userId
              setActiveModal={setActiveModal} // Pass setActiveModal
              setShowMessage={setShowMessage} // Pass setShowMessage
            />
          </motion.div>
          <motion.div variants={sectionVariants}>
            <BenefitsWallets
              userId={userId} // Pass userId
              setActiveModal={setActiveModal} // Pass setActiveModal
              setShowMessage={setShowMessage} // Pass setShowMessage
            />
          </motion.div>
          <motion.div variants={sectionVariants}>
            <WalletSecurity />
          </motion.div>
          <motion.div variants={sectionVariants} className="text-center py-8">
            <motion.button
              className="inline-flex items-center px-6 py-3 bg-rose-600 text-white hover:bg-cyan-500 rounded-full font-semibold font-poppins mr-4"
              onClick={shareOnX}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Share Benefits on X"
            >
              <MessageCircleHeart className="w-5 h-5 mr-2" /> Share Benefits on X
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
              to="/vault"
              className="inline-block bg-rose-600 text-white px-6 py-3 rounded-full font-poppins hover:bg-cyan-500 ml-4"
              onClick={() => {
                if (!userId) {
                  setShowMessage('💰 Navigating to Vault!');
                  setActiveModal('auth');
                } else {
                  setShowMessage('💰 Navigating to Vault!');
                }
              }}
              role="button"
              aria-label="Navigate to Vault Page"
            >
              Visit Vault
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
          </motion.div>
        </motion.div>
      </motion.div>
    </SwytchErrorBoundary>
  );
};


export default Benefits;