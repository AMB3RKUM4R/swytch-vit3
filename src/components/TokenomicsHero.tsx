import { FC, memo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import Tilt from 'react-parallax-tilt';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useModal } from '@/context/ModalContext';

interface TokenomicsHeroProps {
  userId: string | null;
  jewelsBalance: number;
  visitStreak: number;
}

const sectionVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut' } }
};

const orbitVariants = {
  animate: { rotate: 360, transition: { duration: 20, repeat: Infinity, ease: 'linear' } }
};

const TokenomicsHero: FC<TokenomicsHeroProps> = memo(({ userId, jewelsBalance, visitStreak }) => {
  const { isConnected } = useAccount();
  const { setShowMessage } = useModal();

  return (
    <motion.div variants={sectionVariants}>
      <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10}>
        <div className="relative text-center bg-gray-900/50 backdrop-blur-lg rounded-2xl p-8 border border-rose-500/30 shadow-xl">
          <motion.div className="absolute inset-0 pointer-events-none" variants={orbitVariants} animate="animate">
            <motion.div className="absolute top-6 left-6 w-3 h-3 bg-rose-400 rounded-full opacity-50" animate={{ scale: [1, 1.5, 1], transition: { duration: 2, repeat: Infinity } }} />
            <motion.div className="absolute bottom-6 right-6 w-4 h-4 bg-pink-400 rounded-full opacity-50" animate={{ scale: [1, 1.3, 1], transition: { duration: 3, repeat: Infinity } }} />
          </motion.div>
          <div className="relative space-y-4">
            <motion.h2
              className="text-4xl sm:text-5xl font-bold text-rose-400 flex items-center justify-center gap-3 font-poppins"
              animate={{ y: [0, -8, 0], transition: { duration: 3, repeat: Infinity } }}
            >
              <Sparkles className="w-8 h-8 animate-pulse" /> Swytch Tokenomics
            </motion.h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto font-inter">
              Join a decentralized economy powered by purpose. Invest, govern, and earn JEWELS in the PETverse!
            </p>
            {userId && (
              <p className="text-gray-300 font-inter">
                JEWELS: <span className="font-bold text-rose-400">{jewelsBalance}</span> | Streak: <span className="font-bold text-rose-400">{visitStreak} days</span>
              </p>
            )}
            <ConnectButton.Custom>
              {({ openConnectModal }) => (
                <motion.button
                  className="inline-flex items-center px-6 py-3 bg-rose-600 text-white hover:bg-rose-700 rounded-full font-semibold font-poppins"
                  onClick={() => {
                    if (!isConnected) {
                      openConnectModal();
                      setShowMessage('⚠️ Connect your wallet to join the PETverse!');
                    } else {
                      setShowMessage('🎉 Wallet connected!');
                    }
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Join the Economy"
                >
                  {isConnected ? 'Wallet Connected' : 'Join the Economy'}
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1" />
                </motion.button>
              )}
            </ConnectButton.Custom>
          </div>
        </div>
      </Tilt>
    </motion.div>
  );
});

export default TokenomicsHero;