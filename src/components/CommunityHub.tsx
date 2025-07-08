import { motion } from 'framer-motion';
import { Users, ArrowRight } from 'lucide-react';
import { useModal } from '@/context/ModalContext';
import { auth } from '@/lib/firebaseConfig';

interface CommunityHubProps {
}

const CommunityHub: React.FC<CommunityHubProps> = () => {
  const { setActiveModal, setShowMessage } = useModal();

  const handleJoinCommunity = () => {
    if (!auth.currentUser) {
      setActiveModal('auth');
      setShowMessage('⚠️ Sign in to join the community!');
      return;
    }
    setShowMessage('ℹ️ Joining the PET community...');
    setActiveModal('payment');
  };

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 50, scale: 0.95 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut', type: 'spring', stiffness: 100 } } }}
      className="space-y-8 relative"
    >
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1612835362596-4b0b2b1b0b0c?q=80&w=2070&auto=format&fit=crop)' }}
      />
      <h3 className="text-3xl sm:text-4xl font-bold text-white flex items-center justify-center gap-3 font-poppins">
        <Users className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-400 animate-pulse" /> Shape the Future
      </h3>
      <p className="text-lg sm:text-xl text-gray-200 text-center max-w-4xl mx-auto font-inter">
        Join PET factions, propose ideas, and govern the PETverse. Your voice drives Swytch’s evolution.
      </p>
      <motion.div
        className="relative bg-gray-900/70 border border-rose-500/30 p-6 rounded-2xl shadow-xl backdrop-blur-md hover:shadow-cyan-500/50 transition-all bg-gradient-to-r from-rose-500/20 to-cyan-500/20 text-center"
        whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(34, 211, 238, 0.7)' }}
      >
        <div className="relative space-y-4">
          <Users className="w-12 h-12 sm:w-16 sm:h-16 text-cyan-400 mx-auto animate-pulse" />
          <p className="text-gray-200 text-sm sm:text-base font-inter">
            Connect with PETs worldwide. Form factions, vote on proposals, or launch community quests.
          </p>
          <motion.button
            className="inline-flex items-center px-6 py-3 bg-rose-600 text-white hover:bg-cyan-500 rounded-md text-base font-semibold group font-poppins"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Join the Community"
            onClick={handleJoinCommunity}
          >
            Join Community
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CommunityHub;