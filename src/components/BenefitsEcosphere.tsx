import { FC, memo } from 'react';
import { motion } from 'framer-motion';
import { PiggyBank, Banknote, Users } from 'lucide-react';
import { SwytchCard } from './SwytchCard';
import { useModal } from '@/context/ModalContext';
import { auth } from '@/lib/firebaseConfig';

interface BusinessModel {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  details: string;
}

const businessModel: BusinessModel[] = [
  {
    icon: PiggyBank,
    title: 'NFT & Game Marketplace',
    description: 'Trade NFTs and P2E items.',
    details: 'Mint or trade Vault Guardian NFTs, earn JEWELS in P2E games.',
  },
  {
    icon: Banknote,
    title: 'Energy Yield System',
    description: 'Earn up to 36% APY.',
    details: 'Stake SWYT in the Energy Vault for JEWELS with AI-driven returns.',
  },
  {
    icon: Users,
    title: 'Decentralized Operations',
    description: 'On-chain staking and governance.',
    details: 'Vote in the Swytch DAO or manage Web3 identity on Avalanche.',
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

const BenefitsEcosphere: FC = memo(() => {
  const { setActiveModal, setShowMessage } = useModal();

  const handleEcosphereAction = (title: string) => {
    if (!auth.currentUser) {
      setActiveModal('auth');
      setShowMessage('⚠️ Sign in to access the ecosphere!');
      return;
    }
    setShowMessage(`ℹ️ Exploring ${title}!`);
    setActiveModal('payment'); // Prompt deposit for ecosphere participation
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
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1612835362596-4b0b2b1b0b0c?q=80&w=2070&auto=format&fit=crop)' }}
      />
      <div className="max-w-6xl mx-auto space-y-8 relative">
        <h3 className="text-3xl font-bold text-white flex items-center justify-center gap-3 font-poppins">
          <Users className="w-6 h-6 text-cyan-400 animate-pulse" /> Swytch Ecosphere
        </h3>
        <p className="text-gray-300 max-w-xl mx-auto font-inter">A decentralized universe of NFTs and governance.</p>
        <motion.div variants={sectionVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {businessModel.map((item) => (
            <SwytchCard
              key={item.title}
              gradient="from-rose-500/20 to-cyan-500/20"
              onClick={() => handleEcosphereAction(item.title)}
            >
              <div className="space-y-3">
                <item.icon className="w-6 h-6 text-cyan-400 mx-auto animate-pulse" />
                <h4 className="text-lg font-bold text-rose-400 font-poppins">{item.title}</h4>
                <p className="text-sm text-gray-300 font-inter">{item.description}</p>
                <p className="text-sm text-gray-400 font-inter">{item.details}</p>
              </div>
            </SwytchCard>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
});

export default BenefitsEcosphere;