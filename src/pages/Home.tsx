// src/pages/Home.tsx
import { FC, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
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
import { Megaphone, ArrowRight, ShieldCheck, Gamepad2, Brain, Users, DollarSign, Lock, FileText } from 'lucide-react'; // Added new icons
import { cn } from '@/lib/utils';
import SwytchCard from '@/components/SwytchCard'; // Import SwytchCard

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
 * A new component for your "callout" request.
 * It's a full-width promotional hero banner.
 */
const HeroCallout: FC = () => {
  return (
    <motion.div 
      className={cn(
        "holographic-card", // Using your existing style from index.css
        "flex flex-col md:flex-row items-center justify-between p-8 mb-8"
      )}
      variants={sectionVariant}
    >
      <div className="flex items-center mb-4 md:mb-0">
        <Megaphone className="w-12 h-12 text-primary mr-6 text-glow-primary" />
        <div>
          <h2 className="text-2xl font-bold font-poppins text-foreground">
            New Event: The 'Cosmic Rift' is Open!
          </h2>
          <p className="text-muted-foreground text-sm font-inter max-w-lg">
            A new anomaly has been detected. Jump in now to battle rare creatures and earn exclusive JOULES rewards.
          </p>
        </div>
      </div>
      <Link to="/shop" className="btn-primary w-full md:w-auto flex-shrink-0">
        Jump In <ArrowRight className="w-4 h-4 ml-2" />
      </Link>
    </motion.div>
  );
};

/**
 * --- NEW SECTION ---
 * This component renders the "Welcome to Swytch" manifesto.
 */
const ManifestoSection: FC = () => {
  return (
    <motion.div className="lg:col-span-4 mt-12" variants={sectionVariant}>
      <SwytchCard variant="default" className="p-8">
        <h2 className="text-3xl font-bold font-poppins text-center mb-8">
          Welcome to Swytch: The Petaverse of Purpose, Power & Proof.
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-inter text-muted-foreground leading-relaxed">
          <div>
            <h3 className="text-xl font-semibold font-poppins text-primary mb-3 flex items-center">
              <Brain className="w-6 h-6 mr-2" />
              The Psychological Shift
            </h3>
            <p className="mb-4">
              You're not here by accident. You're here because the old world isn't enough.
              Swytch isn't a game. It's a psychological awakening, a socio-economic rebellion, and an ecosystem governed by its members: The PETs.
            </p>
            <p>
              The second you log in, you are no longer a passive player. **You're a Beneficiary.**
              Not a customer. Not an investor. You’re entitled to earn — because you participate in value creation.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold font-poppins text-primary mb-3 flex items-center">
              <Users className="w-6 h-6 mr-2" />
              The Social Architecture
            </h3>
            <p className="mb-4">
              Every PET member is linked through the Community Panel. Here, members vote, propose, share, and evolve.
              No hierarchy — only earned trust. NPCs guide, not govern.
            </p>
            <p>
              You don’t need to fight for a seat at the table — **you build the table.**
              It’s all opt-in. But once you're in, you're with us.
            </p>
          </div>
        </div>
      </SwytchCard>
    </motion.div>
  );
};

/**
 * --- NEW SECTION ---
 * This component visually explains the "Economic Flow".
 */
const EconomicFlow: FC = () => {
  const steps = [
    { 
      icon: <Gamepad2 className="w-10 h-10 text-primary" />,
      title: "1. Play & Earn",
      description: "You play Swytch games and earn Energy. This is your proof-of-participation."
    },
    { 
      icon: <DollarSign className="w-10 h-10 text-green-400" />,
      title: "2. Convert to Value",
      description: "Your Energy can be converted into Swytch Stablecoin, tied to USDT, liquid, and tradable."
    },
    { 
      icon: <Lock className="w-10 h-10 text-yellow-400" />,
      title: "3. Join & Withdraw",
      description: "A $10 SPM unlocks the ecosystem. You own your data, control your wallet, and live on your terms."
    }
  ];

  return (
    <motion.div className="lg:col-span-4 mt-12" variants={sectionVariant}>
      <h2 className="text-3xl font-poppins font-semibold text-center mb-8">The Economic Flow</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((step, index) => (
          <SwytchCard key={index} variant="holographic" className="p-6 text-center h-full flex flex-col items-center">
            <div className="p-4 bg-background rounded-full mb-4">
              {step.icon}
            </div>
            <h3 className="text-xl font-semibold font-poppins text-foreground mb-2">{step.title}</h3>
            <p className="text-sm text-muted-foreground font-inter flex-grow">{step.description}</p>
          </SwytchCard>
        ))}
      </div>
    </motion.div>
  );
};

/**
 * --- NEW SECTION ---
 * This component renders the "Honest Views" text as a dev log.
 */
const CoreVision: FC = () => {
  const views = [
    { title: "Vision: Unmatched", description: "Merging psychology, economy, governance, and technology into one loop. A generational-level movement." },
    { title: "Core Concept: Sustainable", description: "Swytch rewards energy and contribution. Value is earned, not given. This is built for the long game." },
    { title: "Ethical & Defensive Design", description: "Framing users as Beneficiaries, not investors, sidesteps legal traps and focuses on value creation." },
    { title: "Emotional Driver: Real AF", description: "A digital society with freedom, voice, and real income from play. This is fuel for the new rebels." }
  ];

  return (
    <motion.div className="lg:col-span-4 mt-12" variants={sectionVariant}>
      <SwytchCard variant="default" className="p-8 border-primary/20">
         <h2 className="text-3xl font-poppins font-semibold text-center mb-8 flex items-center justify-center">
           <FileText className="w-8 h-8 mr-3 text-primary/70" />
           A Message From The Architect
         </h2>
         <p className="text-center text-lg text-muted-foreground max-w-3xl mx-auto mb-10">
           "You're not just building a game, you're architecting a **new order** — a shift in how value, identity, and ownership are understood in the digital age. This is what we believe."
         </p>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {views.map((view) => (
             <div key={view.title} className="p-4 bg-card/50 rounded-lg border border-border">
               <h3 className="text-lg font-semibold font-poppins text-primary mb-2">{view.title}</h3>
               <p className="text-sm text-muted-foreground font-inter">{view.description}</p>
             </div>
           ))}
         </div>
         <div className="text-center mt-8">
           <p className="text-xl font-semibold text-foreground italic">"I don’t just see this working — I see this **changing lives**."</p>
           <p className="text-3xl font-poppins font-bold text-primary mt-4 text-glow-primary">Let's Swytch. 💠</p>
         </div>
      </SwytchCard>
    </motion.div>
  );
}


const Home: FC = () => {
  // Get all data from our new contexts
  const { userId, playerData } = usePlayer(); // <-- Get playerData for username
  const { setActiveModal, setShowMessage } = useModal();

  const handleShareOnX = useCallback(async () => {
    if (!userId) {
      setShowMessage('⚠️ Please sign in to share.');
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
        timestamp: serverTimestamp(),
        itemId: 'share-home-quest',
      });
      setShowMessage('🎉 Shared on X! Your reward is pending verification.');
    } catch (err) {
      console.error('Failed to log share transaction:', err);
    }
  }, [userId, setShowMessage, setActiveModal]);

  // Use the player's username if available, otherwise fallback
  const displayName = playerData?.username || (userId ? `${userId.slice(0, 6)}...` : 'Hunter');

  return (
    <SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}>
      <motion.div 
        className="min-h-screen text-foreground max-w-7xl mx-auto pt-12 pb-24 px-4" // Adjusted padding
        initial="hidden"
        animate="visible"
        transition={{ staggerChildren: 0.1 }}
      >
        
        {/* --- 1. HERO CALLOUT --- */}
        <HeroCallout />

        {/* --- 2. PERSONALIZED HEADER --- */}
        <motion.div className="text-left mb-12" variants={sectionVariant}>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground font-poppins mb-2">
            Welcome Back, {displayName}
          </h1>
          <p className="text-lg text-muted-foreground font-inter">
            Here's your mission briefing for today.
          </p>
        </motion.div>

        {/* --- 3. MAIN GRID (PLAYER HUB & GAMES) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* --- LEFT SIDEBAR (Player Hub) --- */}
          <motion.div className="lg:col-span-1 space-y-6" variants={sectionVariant}>
            <h2 className="text-2xl font-poppins font-semibold text-muted-foreground">Command Center</h2>
            <UserOverviewCard />
            <ActionButtonsPanel handleShareOnX={handleShareOnX} /> 
          </motion.div>

          {/* --- MAIN CONTENT (Game Store) --- */}
          <motion.div className="lg:col-span-3 space-y-6" variants={sectionVariant}>
            <h2 className="text-2xl font-poppins font-semibold text-muted-foreground flex items-center">
              <Gamepad2 className="w-6 h-6 mr-3 text-primary" />
              Quick Access Games
            </h2>
            <QuickAccessGames />
          </motion.div>

          {/* --- 4. NEW: MANIFESTO SECTION --- */}
          <ManifestoSection />
          
          {/* --- 5. NEW: ECONOMIC FLOW --- */}
          <EconomicFlow />
          
          {/* --- 6. NEW: CORE VISION --- */}
          <CoreVision />

          {/* --- 7. FULL-WIDTH STATUS SECTION --- */}
          <motion.div className="lg:col-span-4 mt-12" variants={sectionVariant}>
            <h2 className="text-2xl font-poppins font-semibold text-muted-foreground mb-6 flex items-center">
              <ShieldCheck className="w-6 h-6 mr-3 text-primary" />
              Mission & Status
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <MembershipStatusOverview />
              <CommunityRankings />
            </div>
          </motion.div>

          {/* --- 8. FULL-WIDTH RECENT ACTIVITY --- */}
          <motion.div className="lg:col-span-4 mt-12" variants={sectionVariant}>
             <h2 className="text-2xl font-poppins font-semibold text-muted-foreground mb-6">Recent Activity</h2>
            <RecentPurchases />
          </motion.div>
          
        </div>
      </motion.div>
    </SwytchErrorBoundary>
  );
};
export default Home;