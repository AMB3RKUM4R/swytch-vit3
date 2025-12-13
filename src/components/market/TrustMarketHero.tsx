import { FC } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowRight, Lock } from 'lucide-react';
import SwytchCard from '../SwytchCard';

const TrustMarketHero: FC = () => {
  return (
    <SwytchCard className="p-12 text-center relative overflow-hidden border-[#39FF14]/30 bg-black">
      {/* Background Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(57,255,20,0.05)_0%,_transparent_70%)] pointer-events-none" />
      
      <div className="relative z-10 font-mono">
        <motion.div 
            initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ repeat: Infinity, repeatType: "reverse", duration: 2 }}
            className="mx-auto w-16 h-16 bg-black border border-[#39FF14] rounded-full flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(57,255,20,0.2)]"
        >
            <ShieldCheck className="w-8 h-8 text-[#39FF14]" />
        </motion.div>

        <h2 className="text-3xl font-black italic text-white uppercase mb-4 tracking-tighter">
          Trust Protocol
        </h2>
        <p className="text-xs text-gray-500 max-w-xl mx-auto mb-8 uppercase tracking-wide leading-relaxed">
          All listings verified by The System. Maintain high trust score to unlock classified tiers and reduced fees.
        </p>

        <div className="flex justify-center gap-4">
            <motion.button
                className="px-8 py-3 bg-[#39FF14] text-black font-bold uppercase text-xs tracking-widest flex items-center justify-center hover:bg-white transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                INITIATE PROTOCOL <ArrowRight className="w-4 h-4 ml-2" />
            </motion.button>
            
            <button className="px-8 py-3 border border-gray-800 text-gray-500 font-bold uppercase text-xs tracking-widest flex items-center justify-center hover:text-white transition-colors">
                <Lock className="w-3 h-3 mr-2" /> VIEW RULES
            </button>
        </div>
      </div>
    </SwytchCard>
  );
};

export default TrustMarketHero;