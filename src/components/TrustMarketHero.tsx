import { FC, memo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useModal } from '@/context/ModalContext';

interface TrustMarketHeroProps {
  isPETMember: boolean;
  isPending: boolean;
  userId: string | null;
  goldBalance: number;
  energyBalance: number;
  setActiveModal: React.Dispatch<React.SetStateAction<string | null>>;
}

const sectionVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut', type: 'spring', stiffness: 80 } }
};

const TrustMarketHero: FC<TrustMarketHeroProps> = memo(({ isPETMember, isPending, userId, goldBalance, energyBalance, setActiveModal }) => {
  const { setShowMessage } = useModal();

  const handleJoin = () => {
    if (!userId) {
      setShowMessage('⚠️ Please sign in or connect wallet!');
      setActiveModal('Connect Wallet');
      return;
    }
    setActiveModal('Join PETverse');
  };

  return (
    <motion.div
      variants={sectionVariants}
      className="relative bg-gray-900/50 backdrop-blur-lg rounded-3xl p-12 text-center border border-rose-500/30 shadow-2xl hover:shadow-rose-500/40 transition-all"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-rose-800/50 to-pink-900/50 rounded-3xl" />
      <div className="relative">
        <h2 className="text-4xl sm:text-6xl font-extrabold text-rose-400 mb-6 tracking-tight flex items-center justify-center gap-4 font-poppins">
          <Sparkles className="w-12 h-12 animate-pulse" /> Swytch Private Energy Trust
        </h2>
        <p className="text-xl sm:text-2xl text-gray-200 max-w-3xl mx-auto mb-8 leading-relaxed font-inter">
          A gamified ecosystem blending NFT rewards, JEWELS earnings, SWYT trading, and DAO governance, owned by PETs for a decentralized future.
        </p>
        {isPETMember ? (
          <p className="text-lg text-neon-green font-inter">Welcome, PET! You're shaping the PETverse.</p>
        ) : (
          <motion.button
            className="inline-flex items-center px-8 py-4 bg-rose-600 text-white hover:bg-rose-700 rounded-full text-lg font-semibold group font-poppins"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleJoin}
            aria-label="Become a PET"
            disabled={isPending}
          >
            {isPending ? 'Processing...' : 'Become a PET'}
            <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform duration-200" />
          </motion.button>
        )}
        {userId && (
          <p className="text-gray-300 mt-4 font-inter">
            JEWELS: <span className="font-bold text-rose-400">{goldBalance}</span> | Energy: <span className="font-bold text-rose-400">${energyBalance.toFixed(2)}</span>
          </p>
        )}
      </div>
    </motion.div>
  );
});

export default TrustMarketHero;