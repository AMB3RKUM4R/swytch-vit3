import { motion, Variants } from 'framer-motion';
import { Key, Users, Zap } from 'lucide-react';

const fadeRight: Variants = { hidden: { opacity: 0, x: 50 }, visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: 'easeOut' } } };

const MembershipBenefits: React.FC = () => {
  return (
    <motion.div variants={fadeRight}>
      <h3 className="text-3xl font-bold text-white flex items-center gap-3 mb-6 font-poppins">
        <Users className="w-8 h-8 text-neon-green animate-pulse" /> PET Benefits
      </h3>
      <p className="text-lg text-gray-300 mb-6 font-inter">
        As a Swytch PET, you gain access to exclusive rewards, voting rights, and a vibrant community driving decentralized finance and gaming.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { icon: <Key className="w-6 h-6 text-neon-green" />, title: 'Exclusive Access', desc: 'Unlock private channels, beta features, and premium content.' },
          { icon: <Users className="w-6 h-6 text-neon-green" />, title: 'Community Governance', desc: 'Vote on platform upgrades and shape the Swytch ecosystem.' },
          { icon: <Zap className="w-6 h-6 text-neon-green" />, title: 'AI-Driven Yields', desc: 'Earn up to 3.3% monthly yield through AI-powered arbitrage.' }
        ].map((benefit, index) => (
          <motion.div
            key={index}
            className="p-6 bg-gray-900/50 rounded-lg border border-neon-green/20 hover:shadow-neon-green/30 transition-all backdrop-blur-md"
            whileHover={{ scale: 1.05 }}
          >
            <div className="flex items-center gap-2 mb-4">
              {benefit.icon}
              <p className="text-white font-semibold font-poppins">{benefit.title}</p>
            </div>
            <p className="text-gray-400 text-sm font-inter">{benefit.desc}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default MembershipBenefits;