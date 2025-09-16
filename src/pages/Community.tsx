// src/pages/Community.tsx
import { FC, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebaseConfig';
import { MessageCircleHeart, Users, Award, HelpCircle } from 'lucide-react';
import SwytchErrorBoundary from '../components/ErrorBoundaryComponent';
import CommunityChat from '../components/community/CommunityChat';
import CommunityRankings from '../components/community/CommunityRankings';
import { PageProps, Quest, SupportedCurrency, TransactionType, TransactionStatus } from '../lib/types';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.3 } },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
};

const tabContentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: 'easeIn' } },
}

// Quest definitions
const initialQuests: Quest[] = [
  { id: "community-visit", title: "Visit Community Hub", progress: 0, goal: 1, rewardJEWELS: 5, rewardXP: 10, completed: false },
  { id: "community-share", title: "Share on X", progress: 0, goal: 1, rewardJEWELS: 15, rewardXP: 25, completed: false },
];

const Community: FC<PageProps> = ({
  userId,
  setActiveModal,
  setShowMessage,
  isPending,
  authLoading,
  initialAuthCheckComplete,
}) => {
  const [quests] = useState<Quest[]>(initialQuests);
  const [activeTab, setActiveTab] = useState<'chat' | 'rankings' | 'quests'>('chat');

  useEffect(() => {
    if (userId) {
      if (initialAuthCheckComplete) {
        const visitQuest = quests.find((q) => q.id === "community-visit");
        if (visitQuest && !visitQuest.completed) {
          setShowMessage('🎉 Quest "Visit Community Hub" complete! Reward pending.');
        }
      }
    } else if (initialAuthCheckComplete) {
      setShowMessage('⚠️ Please sign in to join the community!');
      setActiveModal('auth');
    }
  }, [userId, initialAuthCheckComplete, quests, setActiveModal, setShowMessage]);

  const handleShareOnX = useCallback(async () => {
    if (!userId) {
      setShowMessage('⚠️ Please sign in to share.');
      setActiveModal('auth');
      return;
    }
    const shareQuest = quests.find((q) => q.id === "community-share");
    if (shareQuest && !shareQuest.completed) {
      const shareText = encodeURIComponent("Joined the vibrant Swytch PETverse community! 👥 Join at swytch.io! #SwytchPETverse");
      window.open(`https://x.com/intent/tweet?text=${shareText}`, "_blank");
      try {
        await addDoc(collection(db, 'Transactions'), {
          transactionId: `${userId}_share_community_${Date.now()}`,
          userId,
          amount: shareQuest.rewardJEWELS,
          currency: 'JEWELS' as SupportedCurrency,
          transactionType: 'quest-reward' as TransactionType,
          status: 'pending' as TransactionStatus,
          timestamp: serverTimestamp(),
          game: 'community',
          itemId: shareQuest.id,
        });
        setShowMessage(`🎉 Quest "Share on X" complete! Reward pending verification.`);
      } catch (err) {
        console.error('Failed to log transaction:', err);
        setShowMessage('⚠️ Failed to share on X. Try again.');
        setActiveModal('error');
      }
    }
  }, [userId, quests, setShowMessage, setActiveModal]);

  if (authLoading || isPending) {
    return null;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'chat':
        return (
          <motion.div key="chat" variants={tabContentVariants} initial="hidden" animate="visible" exit="exit">
            <CommunityChat  />
          </motion.div>
        );
      case 'rankings':
        return (
            <motion.div key="rankings" variants={tabContentVariants} initial="hidden" animate="visible" exit="exit">
                <CommunityRankings
                  userId={userId}
                  setActiveModal={setActiveModal}
                  setShowMessage={setShowMessage}
                  leaderboard={[]} // Replace with actual leaderboard data if available
                />
            </motion.div>
        );
      case 'quests':
        return (
            <motion.div key="quests" variants={tabContentVariants} initial="hidden" animate="visible" exit="exit" className="space-y-4">
                {quests.map(quest => (
                    <div key={quest.id} className="p-6 bg-black/20 rounded-lg border border-[hsl(var(--primary),0.1)] flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-russo text-glow-primary">{quest.title}</h3>
                            <p className="text-sm text-muted-foreground font-inter">Reward: {quest.rewardJEWELS} JEWELS & {quest.rewardXP} XP</p>
                        </div>
                        {quest.id === 'community-share' && (
                            <button onClick={handleShareOnX} className="btn-system-glow-secondary px-5 py-2">Complete Quest</button>
                        )}
                         {quest.id === 'community-visit' && (
                            <button disabled className="btn-system-glow-secondary px-5 py-2 opacity-50 cursor-not-allowed">Completed</button>
                        )}
                    </div>
                ))}
            </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}>
      <motion.div
        className="min-h-screen text-foreground font-orbitron bg-noise"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="relative z-10 max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 space-y-12">
          
          <motion.section variants={sectionVariants} className="text-center">
            <Users className="mx-auto w-16 h-16 text-[hsl(var(--secondary))] animate-neon-pulse mb-4" />
            <h1 className="text-5xl lg:text-7xl font-extrabold text-foreground font-russo mb-4 text-glow-primary tracking-tight">
              Cosmic Community Hub
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-inter">
              Chat with fellow hunters, climb the leaderboards, and complete quests to earn exclusive rewards.
            </p>
          </motion.section>

          <motion.section variants={sectionVariants}>
            <div className="flex justify-center items-center gap-4 sm:gap-8 mb-10 p-2 bg-black/20 border border-[hsl(var(--primary),0.1)] rounded-lg">
                {(['chat', 'rankings', 'quests'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`relative w-full text-center px-4 py-3 font-russo text-lg capitalize rounded-md transition-colors duration-300
                        ${activeTab === tab ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        {activeTab === tab && (
                            <motion.div
                                layoutId="active-tab-indicator"
                                className="absolute inset-0 bg-[hsl(var(--primary),0.2)] rounded-md z-0"
                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            />
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

            <div className="min-h-[300px] p-4 sm:p-8 bg-black/20 rounded-lg border border-[hsl(var(--primary),0.1)] backdrop-blur-sm">
                <AnimatePresence mode="wait">
                    {renderTabContent()}
                </AnimatePresence>
            </div>
          </motion.section>
        </div>
      </motion.div>
    </SwytchErrorBoundary>
  );
};

export default Community;