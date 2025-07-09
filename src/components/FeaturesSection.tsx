import { motion } from 'framer-motion';
import { Flame, HeartHandshake, Rocket, Shield, Zap } from 'lucide-react';

interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
  details: string;
}

const features: Feature[] = [
  {
    icon: Flame,
    title: 'Ignite Your Journey',
    description: 'Step into the PETverse with a gamified onboarding experience guided by lore-driven NPCs. Transform your identity into a sovereign creator.',
    details: 'Complete interactive quests to unlock your unique PET avatar and JEWELS rewards.'
  },
  {
    icon: Shield,
    title: 'Unbreakable Privacy',
    description: 'Zero-knowledge proofs protect your data. No KYC, no tracking—just pure, jurisdiction-free freedom.',
    details: 'Powered by zk-SNARKs for anonymous, verifiable interactions across the ecosystem.'
  },
  {
    icon: Rocket,
    title: 'Launch Your Economy',
    description: 'Stake, lend, or co-create Energy in Swytch’s multiplayer economy. Build wealth with trust-based micro-economies.',
    details: 'Cross-chain support for Ethereum, Polygon, and Solana ensures seamless asset flow.'
  },
  {
    icon: HeartHandshake,
    title: 'Ethical Rewards',
    description: 'Earn JEWELS and FDMT through proof-of-purpose. Grow your assets with up to 3.3% monthly rewards.',
    details: 'Capped token supply ensures fairness and long-term value stability.'
  }
];

const FeaturesSection: React.FC = () => {
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 50, scale: 0.95 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut', type: 'spring', stiffness: 100 } } }}
      className="space-y-8"
    >
      <h3 className="text-3xl sm:text-4xl font-bold text-white flex items-center justify-center gap-3 font-poppins">
        <Zap className="w-8 h-8 sm:w-10 sm:h-10 text-rose-400 animate-pulse" /> Why Join Swytch?
      </h3>
      <p className="text-lg sm:text-xl text-gray-200 text-center max-w-4xl mx-auto font-inter">
        Discover the pillars of Swytch’s PETverse, crafted to empower you with freedom, rewards, and purpose.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-10">
        {features.map(({ icon: Icon, title, description, details }, index) => (
          <motion.div
            key={index}
            className="relative bg-gray-900/50 border border-rose-500/20 p-6 rounded-2xl shadow-xl backdrop-blur-md hover:shadow-rose-400/30 transition-all bg-gradient-to-r from-rose-500/10 to-pink-500/10"
            whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(244, 63, 94, 0.5)' }}
            aria-label={`Feature: ${title}`}
          >
            <div className="relative">
              <div className="flex items-center mb-4 text-rose-400">
                <Icon className="mr-3 w-6 h-6 sm:w-7 sm:h-7 animate-pulse" />
                <h4 className="text-xl sm:text-2xl font-bold font-poppins">{title}</h4>
              </div>
              <p className="text-gray-200 text-sm sm:text-base mb-4 font-inter">{description}</p>
              <p className="text-gray-300 text-xs sm:text-sm italic font-inter">{details}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default FeaturesSection;