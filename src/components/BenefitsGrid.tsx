import { FC, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, LockKeyhole, Banknote, PiggyBank, Users, Gamepad2, LibraryBig, Globe2 } from 'lucide-react';
import { SwytchCard } from './SwytchCard';
import { useModal } from '@/context/ModalContext';
import { auth } from '@/lib/firebaseConfig';

interface Benefit {
  title: string;
  description: string;
  details: string;
  icon: React.ComponentType<{ className?: string }>;
  
}


const benefits: Benefit[] = [
  {
    title: 'Unbreakable Security',
    description: 'Assets on a decentralized network, immune to hacks.',
    details: 'Swytch PET uses Avalanche’s Subnet and audited contracts to secure JEWELS and SWYT.',
    icon: LockKeyhole,
  },
  {
    title: 'Absolute Privacy',
    description: 'Control your data with self-custodial wallets.',
    details: 'Your journey stays private with WAGMI-integrated DApps.',
    icon: ShieldCheck,
  },
  {
    title: 'Crystal Transparency',
    description: 'Every transaction is verifiable on-chain.',
    details: 'Avalanche logs swaps, stakes, and JEWELS claims in real time.',
    icon: Banknote,
  },
  {
    title: 'Minimal Costs',
    description: 'Low gas fees maximize value.',
    details: 'Avalanche transactions cost under $0.01 for most actions.',
    icon: PiggyBank,
  },
  {
    title: 'Community Power',
    description: 'DAO-driven ecosystem for PETs to vote.',
    details: 'Stake SWYT to shape quests and rewards in the Swytch DAO.',
    icon: Users,
  },
  {
    title: 'Gamified Growth',
    description: 'Level up to unlock higher yields.',
    details: 'Quests earn JEWELS and XP, boosting yields up to 36% APY.',
    icon: Gamepad2,
  },
  {
    title: 'Purpose-Driven Rewards',
    description: 'Earn through learning, not speculation.',
    details: 'Educational quests reward JEWELS, aligning wealth with wisdom.',
    icon: LibraryBig,
  },
  {
    title: 'Cross-Chain Freedom',
    description: 'Move assets across EVM chains.',
    details: 'Bridge SWYT or stake on Optimism with WAGMI integration.',
    icon: Globe2,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut' } },
};

const BenefitsGrid: FC<{
  expandedBenefit: string | null;
  toggleBenefit: (title: string) => void;
}> = memo(({ expandedBenefit, toggleBenefit }) => {
  const { setActiveModal, setShowMessage } = useModal();

  const handleBenefitClick = (title: string) => {
    if (!auth.currentUser) {
      setActiveModal('auth');
      setShowMessage('⚠️ Sign in to explore benefits!');
      return;
    }
    toggleBenefit(title);
    setShowMessage(`ℹ️ Exploring ${title}!`);
    setActiveModal('payment'); // Prompt deposit for benefit access
  };

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="py-16 px-6 sm:px-8 lg:px-16 bg-gray-950 text-center font-inter relative"
    >
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=2070&auto=format&fit=crop)' }}
      />
      <div className="max-w-6xl mx-auto space-y-8 relative">
        <h3 className="text-3xl font-bold text-white flex items-center justify-center gap-3 font-poppins">
          <ShieldCheck className="w-6 h-6 text-cyan-400 animate-pulse" /> PET Benefits
        </h3>
        <p className="text-gray-300 max-w-xl mx-auto font-inter">Discover the pillars of the Petaverse.</p>
        <motion.div variants={sectionVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit) => (
            <SwytchCard
              key={benefit.title}
              gradient="from-rose-500/20 to-cyan-500/20"
              onClick={() => handleBenefitClick(benefit.title)}
            >
              <div className="flex items-center mb-3 text-rose-400">
                <benefit.icon className="w-6 h-6 mr-2 animate-pulse text-cyan-400" />
                <h4 className="text-lg font-bold font-poppins">{benefit.title}</h4>
              </div>
              <p className="text-sm text-gray-300 mb-3 font-inter">{benefit.description}</p>
              <AnimatePresence>
                {expandedBenefit === benefit.title && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-sm text-gray-400 font-inter"
                  >
                    {benefit.details}
                  </motion.div>
                )}
              </AnimatePresence>
            </SwytchCard>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
});

export default BenefitsGrid;