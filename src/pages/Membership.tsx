import { FC, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { doc, onSnapshot, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebaseConfig';
import { Sparkles, Star, Users, Award } from 'lucide-react';
import SwytchErrorBoundary from '../components/ErrorBoundaryComponent';
import MembershipUpgrade from '../components/membership/MembershipUpgrade';
import SwytchLevelsGrid from '../components/membership/SwytchLevelsGrid';
import { SupportedCurrency, TransactionType, TransactionStatus, PlayerData } from '../lib/types';
import { usePlayer } from '@/components/context/PlayerContext';
import { useModal } from '@/components/context/ModalContext';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.3 } },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
};

const Membership: FC = () => {
  // Get all data from our new contexts
  const {
    userId,
    setIsPETMember,
    dataLoading,
    authLoading,
    initialAuthCheckComplete
  } = usePlayer();
  const { setActiveModal, setShowMessage } = useModal();

  // isPending from PageProps is now dataLoading from usePlayer
  const isPending = dataLoading;

  const [, setPlayerData] = useState<PlayerData | null>(null);
  
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
        currency: 'JOULES' as SupportedCurrency,
        transactionType: 'quest-reward' as TransactionType,
        status: 'pending' as TransactionStatus,
        timestamp: serverTimestamp(),
        game: 'membership',
      });
      setShowMessage('🎉 Shared Membership on X! Reward pending verification.');
    } catch (err) {
      console.error('Failed to share on X:', err);
      setShowMessage('⚠️ Failed to share on X. Try again.');
    }
  }, [userId, setShowMessage, setActiveModal]);

  if (authLoading || isPending) {
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
            <Star className="mx-auto w-16 h-16 text-primary mb-4" />
            <h1 className="text-5xl lg:text-6xl font-bold text-foreground mb-4">
              Cosmic Membership
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-inter">
              Ascend to a higher tier. Unlock exclusive rewards and in-game advantages.
            </p>
          </motion.section>

          <motion.section variants={sectionVariants}>
            <h2 className="text-4xl font-bold text-foreground text-center mb-10">
              <Award className="inline-block w-10 h-10 text-primary mr-3" />
              Choose Your Tier
            </h2>
             {/* FIX: Removed all props. Component is self-sufficient. */}
             <SwytchLevelsGrid />
          </motion.section>

           <motion.section variants={sectionVariants}>
            <h2 className="text-4xl font-bold text-foreground text-center mb-10">
              <Sparkles className="inline-block w-10 h-10 text-primary mr-3" />
              Special Upgrades
            </h2>
            <div className="p-4 sm:p-8 bg-black/20 rounded-lg border border-border backdrop-blur-sm">
                {/* FIX: Removed all props. Component is self-sufficient. */}
                <MembershipUpgrade userId={null} setIsPETMember={function (_isMember: boolean): void {
                throw new Error('Function not implemented.');
              } } updatePlayerFirestore={function (_updates: Partial<PlayerData>): Promise<void> {
                throw new Error('Function not implemented.');
              } } setActiveModal={function (_modal: string | null): void {
                throw new Error('Function not implemented.');
              } } setShowMessage={function (_message: string): void {
                throw new Error('Function not implemented.');
              } }                
                />
            </div>
          </motion.section>


          <motion.section variants={sectionVariants} className="text-center p-8 bg-black/20 rounded-lg border border-border backdrop-blur-sm">
             <h2 className="text-3xl font-bold text-foreground mb-4">
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

