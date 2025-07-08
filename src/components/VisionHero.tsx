import { FC, memo } from 'react';
import { motion } from 'framer-motion';
import { Rocket } from 'lucide-react';
import { useModal } from '@/context/ModalContext';

interface VisionHeroProps {
  userId: string | null;
  jewelsBalance: number;
  setActiveModal: React.Dispatch<React.SetStateAction<string | null>>;
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};

const VisionHero: FC<VisionHeroProps> = memo(({ userId, jewelsBalance, setActiveModal }) => {
  const { setShowMessage } = useModal();

  return (
    <motion.div variants={fadeUp} className="text-center space-y-6">
      <h1 className="text-4xl sm:text-5xl font-bold text-white flex items-center justify-center gap-3 font-poppins">
        <Rocket className="text-rose-400 w-8 h-8 animate-pulse" /> Swytch Vision
      </h1>
      <p className="text-lg text-gray-300 max-w-2xl mx-auto font-inter">
        Where gaming, crypto, and purpose unite for financial sovereignty.
      </p>
      {userId && (
        <p className="text-gray-300 font-inter">
          Your JEWELS: <span className="font-bold text-rose-400">{jewelsBalance}</span>
        </p>
      )}
      <motion.button
        className="inline-flex items-center px-6 py-3 bg-rose-600 text-white hover:bg-rose-700 rounded-full font-semibold font-poppins"
        onClick={() => {
          if (!userId) {
            setShowMessage('⚠️ Please connect your wallet or log in.');
          }
          setActiveModal('Connect Wallet');
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Join the Swytch Vision"
      >
        Join the Vision
        <Rocket className="ml-2 w-5 h-5 group-hover:translate-x-1" />
      </motion.button>
    </motion.div>
  );
});

export default VisionHero;