// src/components/home/ActionButtonsPanel.tsx
import { FC } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpCircle, ArrowDownCircle, ShoppingCart, Store, MessageCircleHeart } from 'lucide-react';
import SwytchCard from '../SwytchCard';

interface ActionButtonsPanelProps {
  userId: string | null;
  setActiveModal: (modalName: string | null) => void;
  setShowMessage: (message: string) => void;
  handleShareOnX: () => Promise<void>;
}

const ActionButtonsPanel: FC<ActionButtonsPanelProps> = ({
  userId,
  setActiveModal,
  setShowMessage,
  handleShareOnX,
}) => {
  const handleRestrictedAction = (action: string) => {
    if (!userId) {
      setShowMessage(`⚠️ Please sign in to ${action}.`);
      setActiveModal('auth');
      return false;
    }
    return true;
  };

  return (
    <SwytchCard gradient="from-teal-700/20 to-blue-700/20" className="p-6">
      <h2 className="text-3xl font-bold text-white font-poppins mb-6 text-center">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <motion.button
          className="btn-primary flex items-center justify-center gap-2"
          onClick={() => {
            if (handleRestrictedAction('deposit')) {
              setShowMessage('💰 Opening deposit options...');
              setActiveModal('payment');
            }
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Deposit Funds"
        >
          <ArrowUpCircle className="w-5 h-5" /> Deposit
        </motion.button>

        <motion.button
          className="btn-primary flex items-center justify-center gap-2"
          onClick={() => {
            if (handleRestrictedAction('withdraw')) {
              setShowMessage('💸 Opening withdrawal options...');
              setActiveModal('payment'); // Assuming payment modal handles withdrawals too
            }
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Withdraw Funds"
        >
          <ArrowDownCircle className="w-5 h-5" /> Withdraw
        </motion.button>

        <Link
          to="/marketplace"
          className="btn-secondary flex items-center justify-center gap-2"
          onClick={(e) => {
            if (!handleRestrictedAction('visit the marketplace')) {
              e.preventDefault();
            } else {
              setShowMessage('🛒 Navigating to Marketplace!');
            }
          }}
          aria-label="Visit Marketplace"
        >
          <Store className="w-5 h-5" /> Marketplace
        </Link>

        <Link
          to="/shop"
          className="btn-secondary flex items-center justify-center gap-2"
          onClick={(e) => {
            if (!handleRestrictedAction('visit the shop')) {
              e.preventDefault();
            } else {
              setShowMessage('🛍️ Navigating to Shop!');
            }
          }}
          aria-label="Visit Shop"
        >
          <ShoppingCart className="w-5 h-5" /> Shop
        </Link>

        <Link
          to="/community"
          className="btn-secondary flex items-center justify-center gap-2"
          onClick={(e) => {
            if (!handleRestrictedAction('visit the community')) {
              e.preventDefault();
            } else {
              setShowMessage('👥 Navigating to Community!');
            }
          }}
          aria-label="Visit Community"
        >
          <MessageCircleHeart className="w-5 h-5" /> Community
        </Link>

        <motion.button
          className="btn-secondary flex items-center justify-center gap-2"
          onClick={handleShareOnX}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Share on X"
        >
          <MessageCircleHeart className="w-5 h-5" /> Share on X
        </motion.button>
      </div>
    </SwytchCard>
  );
};

export default ActionButtonsPanel;
