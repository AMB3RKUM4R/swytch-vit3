// src/components/home/ActionButtonsPanel.tsx
import { FC } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpCircle, ArrowDownCircle, Store, MessageCircleHeart } from 'lucide-react';
import SwytchCard from '../SwytchCard';
import { usePlayer } from '@/components/context/PlayerContext'; // Import main hook
import { useModal } from '@/components/context/ModalContext'; // Import modal hook

// This component is now self-sufficient and only takes handleShareOnX as a prop
interface ActionButtonsPanelProps {
  handleShareOnX: () => Promise<void>;
}

const ActionButtonsPanel: FC<ActionButtonsPanelProps> = ({ handleShareOnX }) => {
  // Pull data from our global contexts
  const { userId } = usePlayer();
  const { setActiveModal, setShowMessage } = useModal();

  const handleRestrictedAction = (action: string, modal: string | null = 'auth') => {
    if (!userId) {
      setShowMessage(`⚠️ Please sign in to ${action}.`);
      setActiveModal(modal);
      return false;
    }
    return true;
  };

  return (
    <SwytchCard variant="default" className="p-6">
      <h2 className="text-2xl font-bold text-center mb-4 font-poppins">Quick Actions</h2>
      <div className="grid grid-cols-2 gap-4">
        
        {/* Deposit */}
        <motion.button 
          className="btn-primary" 
          onClick={() => { if (handleRestrictedAction('deposit')) setActiveModal('payment'); }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowUpCircle className="w-5 h-5 mr-2" /> Deposit
        </motion.button>
        
        {/* Withdraw (Opens Payment Modal - future feature) */}
        <motion.button 
          className="btn-secondary" // Secondary style for withdraw
          onClick={() => { 
            // TODO: Add a "withdraw" tab to PaymentModal
            if (handleRestrictedAction('withdraw')) setShowMessage("Withdrawals coming soon!"); 
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowDownCircle className="w-5 h-5 mr-2" /> Withdraw
        </motion.button>
        
        {/* Shop Link */}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link 
            to="/shop" 
            className="btn-secondary w-full" 
            onClick={(e) => {
              if (!handleRestrictedAction('visit the shop', null)) e.preventDefault();
            }}
          >
            <Store className="w-5 h-5 mr-2" /> Shop
          </Link>
        </motion.div>
        
        {/* Share Button */}
        <motion.button 
          className="btn-secondary" 
          onClick={handleShareOnX}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <MessageCircleHeart className="w-5 h-5 mr-2" /> Share
        </motion.button>

      </div>
    </SwytchCard>
  );
};
export default ActionButtonsPanel;
