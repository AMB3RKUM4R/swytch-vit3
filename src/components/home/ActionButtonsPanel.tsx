// src/components/home/ActionButtonsPanel.tsx
import { FC } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpCircle, ArrowDownCircle, Store, MessageCircleHeart } from 'lucide-react';
import SwytchCard from '../SwytchCard';
import { ActionButtonsPanelProps } from '@/lib/types';

const ActionButtonsPanel: FC<ActionButtonsPanelProps> = ({ userId, setActiveModal, setShowMessage, handleShareOnX }) => {
  const handleRestrictedAction = (action: string, modal: string | null = 'auth') => {
    if (!userId) {
      setShowMessage(`⚠️ Please sign in to ${action}.`);
      setActiveModal(modal);
      return false;
    }
    return true;
  };

  return (
    <SwytchCard gradient="from-teal-700/20 to-blue-700/20" className="p-6">
      <h2 className="text-2xl font-bold text-center mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 gap-4">
        <motion.button className="btn-primary" onClick={() => { if (handleRestrictedAction('deposit')) setActiveModal('payment'); }}>
          <ArrowUpCircle /> Deposit
        </motion.button>
        <motion.button className="btn-primary" onClick={() => { if (handleRestrictedAction('withdraw')) setActiveModal('payment'); }}>
          <ArrowDownCircle /> Withdraw
        </motion.button>
        <Link to="/shop" className="btn-secondary" onClick={() => handleRestrictedAction('visit the shop')}>
          <Store /> Shop
        </Link>
        <motion.button className="btn-secondary" onClick={handleShareOnX}>
          <MessageCircleHeart /> Share
        </motion.button>
      </div>
    </SwytchCard>
  );
};
export default ActionButtonsPanel;