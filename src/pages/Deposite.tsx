import { FC } from 'react';
import { motion } from 'framer-motion';
import { Check, Zap } from 'lucide-react';
import SwytchCard from '@/components/SwytchCard';

const Deposit: FC = () => {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <SwytchCard variant="holographic" className="max-w-2xl w-full p-16 border-8 border-yellow-500/80 shadow-2xl">
        <h1 className="text-8xl font-black text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-purple-600">
          LIFETIME ACCESS
        </h1>
        <p className="text-4xl text-center mb-12 text-gray-200">
          One payment → Play forever → Earn daily
        </p>

        <div className="text-9xl font-black text-center mb-12 text-yellow-400 drop-shadow-2xl">
          ₹299
        </div>

        <motion.button
          className="w-full text-5xl py-16 bg-green-600 hover:bg-green-700 font-black rounded-3xl shadow-2xl"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Zap className="inline mr-6" /> PAY NOW & START EARNING
        </motion.button>

        <div className="mt-12 space-y-4 text-xl text-gray-300">
          {["UPI • Card • Crypto", "100% Secure & Instant", "Lifetime Games + Earnings"].map((t) => (
            <div key={t} className="flex items-center justify-center gap-4">
              <Check className="text-green-400" /><span>{t}</span>
            </div>
          ))}
        </div>

        <p className="text-center mt-12 text-3xl font-bold text-red-500 animate-pulse">
          PRICE DOUBLES IN 48 HOURS
        </p>
      </SwytchCard>
    </div>
  );
};

export default Deposit;