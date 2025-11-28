// src/pages/Community.tsx
import { FC, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebaseConfig';
import { MessageCircleHeart, Award, HelpCircle, FileText } from 'lucide-react';
import SwytchErrorBoundary from '../components/ErrorBoundaryComponent';
import CommunityChat from '../components/community/CommunityChat';
import CommunityRankings from '../components/community/CommunityRankings';
import CommunityHero from '../components/community/CommunityHero';
import CommunityFeatures from '../components/community/CommunityFeatures';
// FIX: Import QuestsPanel
import QuestsPanel from '../components/QuestsPanel'; 
import { Quest, SupportedCurrency, TransactionType, TransactionStatus } from '../lib/types';
import { usePlayer } from '@/components/context/PlayerContext';
import { useModal } from '@/components/context/ModalContext';
import SwytchCard from '@/components/SwytchCard';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } },
};

const tabContentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: 'easeIn' } },
}

// NOTE: Quests list is now managed primarily in QuestsPanel.tsx
const initialQuests: Quest[] = []; 

const Community: FC = () => {
  const { userId, initialAuthCheckComplete } = usePlayer();
  const { setActiveModal, setShowMessage } = useModal();

  const [] = useState<Quest[]>(initialQuests);
  const [activeTab, setActiveTab] = useState<'chat' | 'rankings' | 'quests'>('chat');

  useEffect(() => {
    if (!userId && initialAuthCheckComplete) {
      setShowMessage('⚠️ Please sign in to join the community!');
      setActiveModal('auth');
    }
  }, [userId, initialAuthCheckComplete, setActiveModal, setShowMessage]);

  const handleShareOnX = useCallback(async () => {
    if (!userId) {
      setShowMessage('⚠️ Please sign in to share.');
      setActiveModal('auth');
      return;
    }
    // This logic should match the quest defined in QuestsPanel for sharing (15 JOULES)
    const shareText = encodeURIComponent("Joined the vibrant Swytch PETverse community! 👥 Join at swytch.io! #SwytchPETverse");
    window.open(`https://x.com/intent/tweet?text=${shareText}`, "_blank");
    try {
      await addDoc(collection(db, 'Transactions'), {
        transactionId: `${userId}_share_community_${Date.now()}`,
        userId,
        amount: 15, // Manual reward amount
        currency: 'JOULES' as SupportedCurrency,
        transactionType: 'quest-reward' as TransactionType,
        status: 'pending' as TransactionStatus,
        timestamp: serverTimestamp(),
        itemId: 'community-share',
      });
      setShowMessage(`🎉 Shared on X! Quest progress updated.`);
    } catch (err) {
      console.error('Failed to log transaction:', err);
      setShowMessage('❌ Failed to log reward transaction.');
    }
  }, [userId, setShowMessage, setActiveModal]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'chat':
        return (
          <motion.div key="chat" variants={tabContentVariants} initial="hidden" animate="visible" exit="exit">
            <CommunityChat />
          </motion.div>
        );
      case 'rankings':
        return (
            <motion.div key="rankings" variants={tabContentVariants} initial="hidden" animate="visible" exit="exit">
                <CommunityRankings />
            </motion.div>
        );
      case 'quests':
        return (
            <motion.div key="quests" variants={tabContentVariants} initial="hidden" animate="visible" exit="exit">
                {/* FIX: Render the dedicated QuestsPanel component */}
                <QuestsPanel />
                
                {/* Add a button here to manually trigger the share logic for demonstration */}
                <SwytchCard variant="default" className="p-4 mt-6 text-center">
                    <h3 className="text-xl font-bold font-poppins text-foreground mb-3">Quest Helper</h3>
                     <button onClick={handleShareOnX} className="btn-primary px-5 py-2">Trigger X Share Logic</button>
                </SwytchCard>
            </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}>
      <motion.div
        className="min-h-screen text-foreground font-poppins bg-noise"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="relative z-10 max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* --- 1. NEW HERO SECTION --- */}
          <motion.section variants={sectionVariants}>
            <CommunityHero />
          </motion.section>
          
          {/* --- 2. NEW PHILOSOPHY CALLOUT --- */}
          <motion.section variants={sectionVariants}>
            <SwytchCard variant="holographic" className="p-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <FileText className="w-12 h-12 text-primary flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold font-poppins text-foreground mb-2">
                    The Social Architecture
                  </h2>
                  <p className="text-muted-foreground font-inter">
                    You don’t need to fight for a seat at the table — **you build the table.**
                    Every PET member is linked here. We vote, propose, share, and evolve. No hierarchy, only earned trust. NPCs guide, not govern.
                  </p>
                </div>
              </div>
            </SwytchCard>
          </motion.section>

          {/* --- 3. MAIN TABBED SECTION --- */}
          <motion.section variants={sectionVariants}>
            <div className="flex justify-center items-center gap-2 sm:gap-4 mb-10 p-2 bg-card border border-border rounded-lg">
                {(['chat', 'rankings', 'quests'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`relative w-full text-center px-4 py-3 font-poppins font-semibold text-base sm:text-lg capitalize rounded-md transition-colors duration-300 ${activeTab === tab ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        {activeTab === tab && (
                            <motion.div layoutId="active-tab-indicator" className="absolute inset-0 bg-primary/10 rounded-md z-0" transition={{ type: 'spring', stiffness: 300, damping: 30 }} />
                        )}
                        <span className="relative z-10 flex items-center justify-center gap-2">
                           {tab === 'chat' && <MessageCircleHeart size={20} />}
                           {tab === 'rankings' && <Award size={20} />}
                           {tab === 'quests' && <HelpCircle size={20} />}
                           {tab}
                        </span>
                    </button>
                ))}
            </div>

            <div className="min-h-[600px]">
                <AnimatePresence mode="wait">
                    {renderTabContent()}
                </AnimatePresence>
            </div>
          </motion.section>

          {/* --- 4. NEW FEATURES SECTION --- */}
          <motion.section variants={sectionVariants}>
            <h2 className="text-3xl font-poppins font-semibold text-center mb-8">Community Features</h2>
            <CommunityFeatures />
          </motion.section>

        </div>
      </motion.div>
    </SwytchErrorBoundary>
  );
};

export default Community;