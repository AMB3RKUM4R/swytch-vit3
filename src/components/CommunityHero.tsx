import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useModal } from '@/context/ModalContext';
import { auth } from '@/lib/firebaseConfig';

interface CommunityHeroProps {
  userId: string | null;
}

const sectionVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut', type: 'spring', stiffness: 100 } },
};

const orbitVariants = {
  animate: { rotate: 360, transition: { duration: 20, repeat: Infinity, ease: 'linear' } },
};

const CommunityHero: React.FC<CommunityHeroProps> = ({ userId }) => {
  const { setActiveModal, setShowMessage } = useModal();

  const handleJoinCommunity = () => {
    if (!userId || !auth.currentUser) {
      setActiveModal('auth');
      setShowMessage('⚠️ Sign in to join the PET community!');
      return;
    }
    setShowMessage('ℹ️ Joining the PET community...');
    setActiveModal('payment');
  };

  return (
    <motion.div variants={sectionVariants} className="relative text-center">
      <motion.div
        className="relative bg-gray-900/70 border border-rose-500/30 p-12 rounded-3xl shadow-xl backdrop-blur-md hover:shadow-cyan-500/50 transition-all bg-gradient-to-r from-rose-500/20 to-cyan-500/20"
        whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(34, 211, 238, 0.7)' }}
        style={{
          backgroundImage: `url(https://images.unsplash.com/photo-1612835362596-4b0b2b1b0b0c?q=80&w=2070&auto=format&fit=crop)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-rose-800/60 to-cyan-900/60 rounded-3xl" />
        <motion.div className="absolute inset-0 pointer-events-none" variants={orbitVariants} animate="animate">
          <motion.div className="absolute top-10 left-10 w-4 h-4 bg-rose-400 rounded-full opacity-50" animate={{ scale: [1, 1.5, 1], transition: { duration: 2, repeat: Infinity } }} />
          <motion.div className="absolute bottom-10 right-10 w-6 h-6 bg-cyan-400 rounded-full opacity-50" animate={{ scale: [1, 1.3, 1], transition: { duration: 3, repeat: Infinity } }} />
        </motion.div>
        <div className="relative space-y-6">
          <motion.h2
            className="text-5xl sm:text-7xl font-extrabold text-rose-400 flex items-center justify-center gap-4 font-poppins"
            animate={{ y: [0, -10, 0], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } }}
          >
            <Sparkles className="w-12 h-12 animate-pulse text-cyan-400" /> Community Ownership
          </motion.h2>
          <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto font-inter">
            Swytch is your Petaverse. Shape its future through voting, proposals, and contributions. Every PET’s voice fuels our decentralized revolution.
          </p>
          <motion.button
            className="inline-flex items-center px-8 py-4 bg-rose-600 text-white hover:bg-cyan-500 rounded-full text-lg font-semibold group font-poppins"
            onClick={handleJoinCommunity}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Become a PET"
          >
            Become a PET
            <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform duration-200" />
          </motion.button>
        </div>
      </motion.div>
      {userId && (
        <p className="text-gray-300 mt-4 text-center font-inter">
          Your JEWELS: <span className="font-bold text-cyan-400">0 JEWELS</span>
        </p>
      )}
    </motion.div>
  );
};

export default CommunityHero;