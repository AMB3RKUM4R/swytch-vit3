// src/pages/Membership.tsx
import { FC, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebaseConfig';
import { Sparkles, Star, Users, Award, FileText, CheckCircle } from 'lucide-react';
import SwytchErrorBoundary from '../components/ErrorBoundaryComponent';
import SwytchLevelsGrid from '../components/membership/SwytchLevelsGrid';
import MembershipBenefits from '../components/membership/MembershipBenefits';
import { SupportedCurrency, TransactionType, TransactionStatus } from '../lib/types';
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

const Membership: FC = () => {
  const { userId, isPETMember, authLoading } = usePlayer();
  const { setActiveModal, setShowMessage } = useModal();

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
        amount: 5, // Example quest reward
        currency: 'JOULES' as SupportedCurrency,
        transactionType: 'quest-reward' as TransactionType,
        status: 'pending' as TransactionStatus,
        timestamp: serverTimestamp(),
        itemId: 'share-membership-quest', // Added specific itemId
      });
      setShowMessage('🎉 Shared Membership on X! Reward pending verification.');
    } catch (err) {
      console.error('Failed to share on X:', err);
      // FIX: Show user-facing error message
      setShowMessage('❌ Failed to log reward transaction.'); 
    }
  }, [userId, setShowMessage, setActiveModal]);

  if (authLoading) {
    // Rely on the main application wrapper (likely App.tsx) to handle the global loading screen.
    return null;
  }

  return (
    <SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}>
      <motion.div
        className="min-h-screen text-foreground font-poppins bg-noise"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="relative z-10 max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8 space-y-20">
          
          <motion.section variants={sectionVariants} className="text-center">
            <Star className="mx-auto w-16 h-16 text-primary text-glow-primary mb-4" />
            <h1 className="text-5xl lg:text-6xl font-bold text-foreground mb-4 font-russo">
              PET Membership
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-inter">
              This isn't a subscription. It's your initiation into a new order.
              Become a **P**erson of **E**nergy & **T**ruth.
            </p>
          </motion.section>
          
          {/* --- PHILOSOPHY CALLOUT --- */}
          {isPETMember ? (
            <motion.section variants={sectionVariants}>
                <SwytchCard variant="holographic" className="p-8 text-center">
                    <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                    <h2 className="text-3xl font-bold font-poppins text-foreground mb-2">
                        You are PET. Welcome.
                    </h2>
                    <p className="text-lg text-muted-foreground font-inter">
                        Your status is active. You are a Beneficiary with full rights to earn, vote, and build.
                    </p>
                </SwytchCard>
            </motion.section>
          ) : (
            <motion.section variants={sectionVariants}>
              <SwytchCard variant="holographic" className="p-8">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <FileText className="w-12 h-12 text-primary flex-shrink-0" />
                  <div>
                    <h2 className="text-2xl font-bold font-poppins text-foreground mb-2">
                      A Digital Society of Opt-In Freedom
                    </h2>
                    <p className="text-muted-foreground font-inter">
                      This $10 Swytch Personal Membership (SPM) isn't a fee, it's your **one-time buy-in** to the ecosystem. It unlocks your right to convert Energy to Value. It makes you a true member, not a customer.
                    </p>
                  </div>
                </div>
              </SwytchCard>
            </motion.section>
          )}

          {/* --- MEMBERSHIP TIERS (Using new component) --- */}
          <motion.section variants={sectionVariants}>
            <h2 className="text-4xl font-bold text-foreground text-center mb-10 font-poppins flex items-center justify-center gap-3">
              <Award className="w-10 h-10 text-primary" />
              Choose Your Tier
            </h2>
             <SwytchLevelsGrid />
          </motion.section>

           {/* --- MEMBERSHIP BENEFITS (Using new component) --- */}
           <motion.section variants={sectionVariants}>
            <h2 className="text-4xl font-bold text-foreground text-center mb-10 font-poppins flex items-center justify-center gap-3">
              <Sparkles className="w-10 h-10 text-primary" />
              Core Benefits
            </h2>
            <MembershipBenefits />
          </motion.section>


          {/* --- FINAL CTA --- */}
          <motion.section variants={sectionVariants} className="text-center p-8 bg-card rounded-lg border border-border">
             <h2 className="text-3xl font-bold text-foreground mb-4 font-poppins">
                Connect & Share Your Ascent
             </h2>
             <p className="text-muted-foreground max-w-2xl mx-auto font-inter mb-6">
                Join our community to discuss membership perks, and share your new status on X.
             </p>
             <div className="flex flex-wrap justify-center items-center gap-4">
                <Link to="/community" className="btn-secondary inline-flex items-center px-6 py-3 text-lg font-semibold">
                    <Users className="w-6 h-6 mr-2" /> Join Community
                </Link>
                <button onClick={handleShareOnX} className="btn-primary inline-flex items-center px-6 py-3 text-lg font-semibold">
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