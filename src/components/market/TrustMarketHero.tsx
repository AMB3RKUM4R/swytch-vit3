// src/components/market/TrustMarketHero.tsx
import { FC } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import SwytchCard from '../SwytchCard';

const TrustMarketHero: FC = () => {
  return (
    <SwytchCard variant="holographic" className="p-8 text-center relative overflow-hidden">
      <div className="relative z-10">
        <ShieldCheck className="mx-auto w-16 h-16 text-green-400 text-glow-primary mb-4" />
        <h2 className="text-3xl font-bold text-foreground font-russo mb-2">
          The Trust Market
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
          All listings are verified by The System Protocol. Maintain your trust score to unlock exclusive tiers and secure transactions.
        </p>

        <motion.button
            className="btn-secondary flex items-center justify-center mx-auto px-6 py-3"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            View Trust Protocol <ArrowRight className="w-4 h-4 ml-2" />
        </motion.button>
      </div>
    </SwytchCard>
  );
};

export default TrustMarketHero;