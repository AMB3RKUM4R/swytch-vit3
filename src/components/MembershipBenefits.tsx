import { FC, memo } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Users, BarChart, Gem, MessageSquare } from 'lucide-react'; // Example Lucide icons

// IMPORTANT: Import MembershipBenefitsProps from lib/types.ts
import { MembershipBenefitsProps as ImportedMembershipBenefitsProps } from '../lib/types';


// Define your specific benefits data (could also be imported from a constants file)
const benefitsData = [
  {
    icon: CheckCircle,
    title: 'Yield Multipliers',
    description: 'Unlock higher monthly JEWELS yields with each level.',
  },
  {
    icon: Gem,
    title: 'Exclusive Rewards',
    description: 'Gain access to unique NFTs, skins, and in-game items.',
  },
  {
    icon: Users,
    title: 'DAO Governance',
    description: 'Participate in voting and proposing changes to the PETverse.',
  },
  {
    icon: BarChart,
    title: 'Advanced Analytics',
    description: 'Track your progress, earnings, and impact on the ecosystem.',
  },
  {
    icon: MessageSquare,
    title: 'Priority Support',
    description: 'Receive faster assistance from the Swytch PET team.',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  hover: { scale: 1.05, boxShadow: '0 0 15px rgba(34, 211, 238, 0.5)' },
};

// Use ImportedMembershipBenefitsProps as the type for the FC
const MembershipBenefits: FC<ImportedMembershipBenefitsProps> = memo(() => { // No props destructured from FC
  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="py-16 px-6 sm:px-8 lg:px-16 text-center font-inter relative"
    >
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1620121692029-0d02b21b0b0c?q=80&w=2070&auto=format&fit=crop)' }} // Example background image
      />
      <h2 className="text-4xl font-extrabold text-white flex items-center justify-center gap-4 mb-12 font-poppins">
        <Gem className="w-10 h-10 text-cyan-400 animate-pulse" /> Membership Benefits
      </h2>
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 relative"
      >
        {benefitsData.map((benefit, index) => (
          <motion.div
            key={index} // Using index as key is acceptable for static lists
            variants={cardVariants}
            whileHover="hover"
            className="bg-gray-900/70 border border-cyan-500/30 p-6 rounded-2xl shadow-xl backdrop-blur-md bg-gradient-to-r from-cyan-500/10 to-blue-500/10"
          >
            <div className="flex flex-col items-center gap-3">
              <benefit.icon className="w-10 h-10 text-cyan-400 animate-pulse" />
              <h3 className="text-xl font-bold text-white font-poppins">{benefit.title}</h3>
              <p className="text-gray-300 text-sm font-inter">{benefit.description}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  );
});

export default MembershipBenefits;