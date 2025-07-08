import { FC } from 'react';
import { motion } from 'framer-motion';
import { Wallet } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};

const VaultHero: FC = () => {
  return (
    <motion.div variants={fadeUp} className="text-center">
      <h2 className="text-3xl font-bold text-purple-500 flex items-center justify-center gap-2 font-poppins">
        <Wallet className="text-neon-green" /> Swytch Investment Vault
      </h2>
      <p className="text-gray-300 font-inter mt-2">
        Join the Swytch Energy Trust to earn JEWELS through gameplay and up to 5% monthly ROI via AI-driven arbitrage.
      </p>
    </motion.div>
  );
};

export default VaultHero;