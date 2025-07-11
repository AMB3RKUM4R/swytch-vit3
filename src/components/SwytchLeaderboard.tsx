import { motion } from 'framer-motion';
import { Shield, Lock, Activity, Users, Globe } from 'lucide-react'; // Example icons

// IMPORTANT: Import TrustFeaturesProps from lib/types.ts
import { TrustFeaturesProps as ImportedTrustFeaturesProps } from '../lib/types';
import { FC, memo } from 'react';


// Define your specific features data (could also be imported from a constants file)
const featuresData = [
  {
    icon: Shield,
    title: 'Secure Wallet Integration',
    description: 'Seamless and secure connection with your Web3 wallet.',
  },
  {
    icon: Lock,
    title: 'Decentralized Identity',
    description: 'Control your digital identity and data on-chain.',
  },
  {
    icon: Activity,
    title: 'Transparent Transactions',
    description: 'All operations are verifiable on the blockchain.',
  },
  {
    icon: Users,
    title: 'Community Governance',
    description: 'Participate in shaping the platform’s future.',
  },
  {
    icon: Globe,
    title: 'Cross-Chain Compatibility',
    description: 'Interact with assets across multiple EVM chains.',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  hover: { scale: 1.05, boxShadow: '0 0 15px rgba(236, 72, 153, 0.5)' },
};

// Use ImportedTrustFeaturesProps as the type for the FC
const TrustFeatures: FC<ImportedTrustFeaturesProps> = memo(() => { // No props destructured from FC
  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="py-16 px-6 sm:px-8 lg:px-16 text-center font-inter relative"
    >
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1620121692029-d088224ddc74?q=80&w=2070&auto=format&fit=crop)' }} // Example background image
      />
      <h2 className="text-4xl font-extrabold text-white flex items-center justify-center gap-4 mb-12 font-poppins">
        <Shield className="w-10 h-10 text-rose-400 animate-pulse" /> Trust Features
      </h2>
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 relative"
      >
        {featuresData.map((feature) => (
          <motion.div
            key={feature.title} // Using feature.title as key
            variants={cardVariants}
            whileHover="hover"
            className="bg-gray-900/70 border border-rose-500/30 p-6 rounded-2xl shadow-xl backdrop-blur-md bg-gradient-to-r from-rose-500/10 to-pink-500/10"
          >
            <div className="flex flex-col items-center gap-3">
              {/* Dynamically render icon component */}
              <feature.icon className="w-10 h-10 text-cyan-400 animate-pulse" />
              <h3 className="text-xl font-bold text-white font-poppins">{feature.title}</h3>
              <p className="text-gray-300 text-sm font-inter">{feature.description}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  );
});

export default TrustFeatures;