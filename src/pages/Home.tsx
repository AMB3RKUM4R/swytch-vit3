// src/pages/Home.tsx
import { FC, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import SwytchErrorBoundary from '../components/ErrorBoundaryComponent';
import UserOverviewCard from '../components/home/UserOverviewCard';
import QuickAccessGames from '@/components/home/QuickAccessGames';
import ActionButtonsPanel from '@/components/home/ActionButtonsPanel';
import RecentPurchases from '@/components/RecentPurchases';
import CommunityRankings from '@/components/community/CommunityRankings';
import CoreFeaturesShowcase from '@/components/home/CoreFeaturesShowcase';
import AdDisplayPanel from '@/components/AdDisplayPanel';
import { usePlayer } from '@/components/context/PlayerContext';
import { useModal } from '@/components/context/ModalContext';
import { useWebGL } from '@/components/context/WebglContext'; // FIX: Import useWebGL
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import { SupportedCurrency, TransactionType, TransactionStatus } from '@/lib/types';
import { Megaphone, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import SwytchCard from '@/components/SwytchCard';

// Animation variants for staggered list items
const sectionVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    }
  }
};

/**
 * Full-width promotional hero banner.
 */
const HeroCallout: FC = () => {
  return (
    <motion.div 
      className={cn(
        "holographic-card",
        "flex flex-col md:flex-row items-center justify-between p-8 mb-8"
      )}
      variants={sectionVariant}
    >
      <div className="flex items-center mb-4 md:mb-0">
        <Megaphone className="w-12 h-12 text-primary mr-6 text-glow-primary" />
        <div>
          <h2 className="text-2xl font-bold font-poppins text-foreground">
            Anomaly Warning: Phase 3 Detected!
          </h2>
          <p className="text-muted-foreground text-sm font-inter max-w-lg">
            The System is allocating resources to battle the breach. Jump in now to earn exclusive JOULES rewards.
          </p>
        </div>
      </div>
      <Link to="/shop" className="btn-primary w-full md:w-auto flex-shrink-0">
        Access Logistics <ArrowRight className="w-4 h-4 ml-2" />
      </Link>
    </motion.div>
  );
};


const Home: FC = () => {
  const { userId, playerData } = usePlayer();
  const { setActiveModal, setShowMessage } = useModal();
  const { setActiveGameId } = useWebGL(); // FIX: Retrieve setter here
  
  const handleLaunch = useCallback((gameId: string) => {
      setShowMessage(`Loading WebGL build for: ${gameId}...`);
      setActiveGameId(gameId); // FIX: Use the setter from the context
  }, [setShowMessage, setActiveGameId]);


  const handleShareOnX = useCallback(async () => {
    if (!userId) {
      setShowMessage('⚠️ Please synchronize your signature to broadcast the Protocol.');
      setActiveModal('auth');
      return;
    }
    const shareText = encodeURIComponent("Exploring the PETverse! Join me at swytch.io! #SwytchPETverse #web3gaming");
    window.open(`https://x.com/intent/tweet?text=${shareText}`, "_blank");
    
    try {
      await addDoc(collection(db, 'Transactions'), {
        transactionId: `${userId}_share_home_${Date.now()}`,
        userId,
        amount: 10,
        currency: 'JOULES' as SupportedCurrency,
        transactionType: 'quest-reward' as TransactionType,
        status: 'pending' as TransactionStatus,
        itemId: 'share-home-quest',
      });
      setShowMessage('🎉 Shared on X! Your reward is pending verification.');
    } catch (err) {
      console.error('Failed to log share transaction:', err);
      setShowMessage('❌ Failed to log reward transaction.'); 
    }
  }, [userId, setShowMessage, setActiveModal]);

  const displayName = playerData?.username || (userId ? `${userId.slice(0, 6)}...` : 'Hunter');

  return (
    <SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}>
      <motion.div 
        className="min-h-screen text-foreground max-w-7xl mx-auto pt-12 pb-24 px-4"
        initial="hidden"
        animate="visible"
        transition={{ staggerChildren: 0.1 }}
      >
        
        {/* --- 1. HERO CALLOUT --- */}
        <HeroCallout />

        {/* --- 2. PERSONALIZED HEADER --- */}
        <motion.div className="text-left mb-12" variants={sectionVariant}>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground font-poppins mb-2 flex items-center">
             <Zap className="w-10 h-10 mr-3 text-yellow-400" /> System Console
          </h1>
          <p className="text-lg text-muted-foreground font-inter">
            Welcome, {displayName}. Your mission briefing is complete.
          </p>
        </motion.div>

        {/* --- 3. MAIN HUB GRID (Spotify Style Layout) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* --- LEFT COLUMN (Overview, Actions, ADVERTISEMENT) --- */}
          <motion.div className="lg:col-span-1 space-y-6" variants={sectionVariant}>
            <UserOverviewCard />
            <ActionButtonsPanel handleShareOnX={handleShareOnX} />
            
            {/* ADVERTISEMENT PLACEMENT */}
            <AdDisplayPanel zoneType="banner" /> 
            
            {/* Secondary rankings/activity */}
            <SwytchCard variant="default" className="p-6">
                <h3 className="text-xl font-poppins font-semibold text-foreground mb-4">Rift Activity Ledger</h3>
                <RecentPurchases />
            </SwytchCard>
          </motion.div>

          {/* --- MAIN CONTENT (Game Discovery & Features) --- */}
          <motion.div className="lg:col-span-3 space-y-12" variants={sectionVariant}>
             
            {/* Game Discovery Section - Passes Launch Handler */}
            <QuickAccessGames onGameLaunch={handleLaunch} />
            
            {/* Core Features Showcase */}
            <h2 className="text-3xl font-poppins font-semibold text-foreground flex items-center gap-3">
              <ShieldCheck className="w-7 h-7 mr-2 text-primary" />
              The System Protocol
            </h2>
            <CoreFeaturesShowcase />
          </motion.div>

          {/* --- FULL-WIDTH SECTIONS (Leaderboard, Recent Activity) --- */}
          <motion.div className="lg:col-span-4 mt-12" variants={sectionVariant}>
            <h2 className="text-2xl font-poppins font-semibold text-muted-foreground mb-6">Global Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CommunityRankings />
            </div>
          </motion.div>
          
        </div>
      </motion.div>
    </SwytchErrorBoundary>
  );
};
export default Home;