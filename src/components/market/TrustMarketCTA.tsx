// src/components/market/TrustMarketCTA.tsx
import { FC } from 'react';
import { motion } from 'framer-motion';
import { Zap, DollarSign } from 'lucide-react';
import SwytchCard from '../SwytchCard';

const TrustMarketCTA: FC = () => {
  return (
    <SwytchCard variant="holographic" className="p-8 text-center relative overflow-hidden border-orange-500/30">
      <div className="relative z-10">
        <Zap className="mx-auto w-16 h-16 text-yellow-500 mb-4" />
        <h2 className="text-3xl font-bold text-foreground font-russo mb-4">
          Ready to Convert Energy to Value?
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          The true purpose of the Swytch Protocol is enabling your freedom to earn. Deposit now to increase your purchasing power.
        </p>

        <motion.button
            className="btn-primary flex items-center justify-center mx-auto px-10 py-3 text-lg"
            onClick={() => window.alert('Opening Deposit Modal...')} // Placeholder for modal trigger
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            <DollarSign className="w-6 h-6 mr-2" /> Deposit Now
        </motion.button>
      </div>
    </SwytchCard>
  );
};

export default TrustMarketCTA;