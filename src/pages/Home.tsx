// src/pages/Home.tsx
import { FC, useCallback } from 'react';
import { motion } from 'framer-motion';
import SwytchErrorBoundary from '../components/ErrorBoundaryComponent';
import UserOverviewCard from '../components/home/UserOverviewCard';
import MembershipStatusOverview from '../components/home/MembershipStatusOverview';
import QuickAccessGames from '@/components/home/QuickAccessGames';
import ActionButtonsPanel from '@/components/home/ActionButtonsPanel';
import RecentPurchases from '@/components/RecentPurchases';
import CommunityRankings from '@/components/community/CommunityRankings';
import { usePlayer } from '@/components/context/PlayerContext';
import { useModal } from '@/components/context/ModalContext';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import { SupportedCurrency, TransactionType, TransactionStatus } from '@/lib/types';


const Home: FC = () => {
  // Get all data from our new contexts
  const { userId } = usePlayer();
  const { setActiveModal, setShowMessage } = useModal();

  // This logic stays here as it's specific to the Home page
  const handleShareOnX = useCallback(async () => {
    if (!userId) {
      setShowMessage('⚠️ Please sign in to share.');
      setActiveModal('auth');
      return;
    }
    const shareText = encodeURIComponent("Exploring the PETverse! Join me at swytch.io! #SwytchPETverse #web3gaming");
    window.open(`https://x.com/intent/tweet?text=${shareText}`, "_blank");
    
    // Log a quest transaction for sharing
    try {
      await addDoc(collection(db, 'Transactions'), {
        transactionId: `${userId}_share_home_${Date.now()}`,
        userId,
        amount: 10, // Example: 10 JOULES reward
        currency: 'JOULES' as SupportedCurrency,
        transactionType: 'quest-reward' as TransactionType,
        status: 'pending' as TransactionStatus, // Admin can approve
        timestamp: serverTimestamp(),
        itemId: 'share-home-quest',
      });
      setShowMessage('🎉 Shared on X! Your reward is pending verification.');
    } catch (err) {
      console.error('Failed to log share transaction:', err);
    }
  }, [userId, setShowMessage, setActiveModal]);


  return (
    <SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}>
      <motion.div 
        className="min-h-screen text-foreground max-w-7xl mx-auto py-24 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground font-poppins mb-2">
            Command Center
          </h1>
          <p className="text-lg text-muted-foreground font-inter">
            Welcome back, {userId ? (userId.slice(0, 6) + '...') : 'Hunter'}. Your cosmic odyssey continues.
          </p>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Column 1: User Info & Actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* FIX: Removed all props. Component is self-sufficient. */}
            <UserOverviewCard />
            {/* FIX: Removed all props. */}
            <ActionButtonsPanel handleShareOnX={handleShareOnX} /> 
          </div>

          {/* Column 2: Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* FIX: Removed all props. */}
            <MembershipStatusOverview />
            {/* FIX: Removed all props. */}
            <QuickAccessGames />
          </div>

          {/* Full-Width Row: Social Proof */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* FIX: Removed all props. */}
            <CommunityRankings />
            {/* FIX: Removed all props. */}
            <RecentPurchases />
          </div>
          
        </div>
      </motion.div>
    </SwytchErrorBoundary>
  );
};
export default Home;

