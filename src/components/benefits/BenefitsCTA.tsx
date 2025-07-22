// src/components/benefits/BenefitsCTA.tsx
import { FC } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { User, DollarSign, ArrowRight } from 'lucide-react';
import SwytchCard from '../SwytchCard';

interface BenefitsCTAProps {
  userId: string | null;
  setActiveModal: (modalName: string | null) => void;
  setShowMessage: (message: string) => void;
  logUpiIntent: (amount: number) => Promise<void>; // Assuming this is for a quick deposit CTA
}

const BenefitsCTA: FC<BenefitsCTAProps> = ({ userId, setActiveModal, setShowMessage }) => {
  const handleSignInClick = () => {
    setShowMessage('👋 Welcome! Please sign in to unlock all benefits.');
    setActiveModal('auth');
  };

  const handleDepositClick = () => {
    if (!userId) {
      handleSignInClick();
      return;
    }
    setShowMessage('💰 Opening deposit options...');
    setActiveModal('payment'); // Open the payment modal
  };

  return (
    <SwytchCard gradient="from-cyan-700/20 to-blue-700/20" className="p-6 text-center">
      <h2 className="text-2xl font-bold text-white font-poppins mb-4">
        Ready to Experience the Benefits?
      </h2>
      <p className="text-lg text-gray-300 mb-6">
        Join the PETverse today and start earning, trading, and owning your digital assets!
      </p>
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        {!userId ? (
          <motion.button
            className="btn-primary flex items-center justify-center"
            onClick={handleSignInClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Sign In to Unlock Benefits"
          >
            <User className="w-5 h-5 mr-2" /> Sign In to Unlock
          </motion.button>
        ) : (
          <motion.button
            className="btn-primary flex items-center justify-center"
            onClick={handleDepositClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Make a Deposit"
          >
            <DollarSign className="w-5 h-5 mr-2" /> Make a Deposit
          </motion.button>
        )}
        <Link
          to="/membership"
          className="btn-secondary flex items-center justify-center"
          onClick={() => setShowMessage('🌟 Explore membership options!')}
          aria-label="Explore Membership"
        >
          Explore Membership <ArrowRight className="w-5 h-5 ml-2" />
        </Link>
      </div>
    </SwytchCard>
  );
};

export default BenefitsCTA;
