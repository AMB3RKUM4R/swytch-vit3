// src/components/benefits/BenefitsWallets.tsx
import { FC } from 'react';
import { motion } from 'framer-motion';
import { Wallet, CreditCard, Banknote, ShieldCheck } from 'lucide-react';
import SwytchCard from '../SwytchCard';

interface BenefitsWalletsProps {
  userId: string | null;
  setActiveModal: (modalName: string | null) => void;
  setShowMessage: (message: string) => void;
}

const walletFeatures = [
  {
    icon: Wallet,
    title: 'Integrated Crypto Wallet',
    description: 'Seamlessly connect and manage your crypto assets directly within the platform.',
  },
  {
    icon: Banknote,
    title: 'UPI & Fiat Support',
    description: 'Easy deposits and withdrawals using traditional payment methods like UPI and PayPal.',
  },
  {
    icon: CreditCard,
    title: 'Secure Transactions',
    description: 'All your financial interactions are protected with advanced security protocols.',
  },
];

const BenefitsWallets: FC<BenefitsWalletsProps> = ({ userId, setActiveModal, setShowMessage }) => {
  const handleConnectWalletClick = () => {
    setShowMessage('ℹ️ Opening wallet connection options...');
    setActiveModal('auth'); // Re-use auth modal for wallet connection
  };

  return (
    <SwytchCard gradient="from-purple-700/20 to-pink-700/20" className="p-6">
      <h2 className="text-2xl font-bold text-white font-poppins mb-4 text-center flex items-center justify-center gap-2">
        <ShieldCheck className="w-7 h-7 text-primary" /> Wallet & Payment Features
      </h2>
      <p className="text-lg text-gray-300 text-center mb-6">
        Manage your digital and traditional currencies with ease and security.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {walletFeatures.map((feature, index) => (
          <motion.div key={index} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 text-center h-full flex flex-col items-center justify-center">
              {feature.icon && <feature.icon className="w-8 h-8 text-cyan-400 mb-3" />}
              <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-300">{feature.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {!userId && (
        <div className="text-center mt-6">
          <motion.button
            className="btn-primary flex items-center justify-center mx-auto"
            onClick={handleConnectWalletClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Connect Wallet"
          >
            <Wallet className="w-5 h-5 mr-2" /> Connect Your Wallet
          </motion.button>
        </div>
      )}
    </SwytchCard>
  );
};

export default BenefitsWallets;
