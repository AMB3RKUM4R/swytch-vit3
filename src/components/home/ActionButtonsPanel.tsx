// src/components/home/ActionButtonsPanel.tsx
import { FC } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpCircle, ArrowDownCircle, MessageCircleHeart, Users, Zap } from 'lucide-react';
import SwytchCard from '../SwytchCard';
import { usePlayer } from '@/components/context/PlayerContext';
import { useModal } from '@/components/context/ModalContext';

interface ActionButtonsPanelProps {
  handleShareOnX: () => Promise<void>;
}

const ActionButtonsPanel: FC<ActionButtonsPanelProps> = ({ handleShareOnX }) => {
  const { userId } = usePlayer();
  const { setActiveModal, setShowMessage } = useModal();

  const handleRestrictedAction = (action: string, modal: string | null = 'auth') => {
    if (!userId) {
      setShowMessage(`⚠️ Please synchronize your signature to ${action}.`);
      setActiveModal(modal);
      return false;
    }
    return true;
  };

  return (
    <SwytchCard variant="default" className="p-6">
      <h2 className="text-2xl font-bold text-center mb-4 font-poppins flex items-center justify-center gap-2">
        <Zap className="w-6 h-6 text-primary" /> Logistics Terminal
      </h2>
      <div className="grid grid-cols-2 gap-4">
        
        {/* Deposit */}
        <motion.button 
          className="btn-primary" 
          onClick={() => { if (handleRestrictedAction('deposit assets')) setActiveModal('payment'); }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowUpCircle className="w-5 h-5 mr-2" /> Inject Yield
        </motion.button>
        
        {/* Withdraw */}
        <motion.button 
          className="btn-danger"
          onClick={() => { 
            if (handleRestrictedAction('withdraw energy')) setActiveModal('withdraw'); 
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowDownCircle className="w-5 h-5 mr-2" /> Withdraw Energy
        </motion.button>
        
        {/* Sentinel Terminal (New Route) */}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link 
            to="/sentinels" 
            className="btn-secondary w-full" 
            onClick={(e) => {
              if (!handleRestrictedAction('access the Sentinel Terminal', null)) e.preventDefault();
            }}
          >
            <Users className="w-5 h-5 mr-2" /> Sentinels
          </Link>
        </motion.div>
        
        {/* Share Button (Protocol Broadcast) */}
        <motion.button 
          className="btn-secondary" 
          onClick={handleShareOnX}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <MessageCircleHeart className="w-5 h-5 mr-2" /> Broadcast Protocol
        </motion.button>

      </div>
    </SwytchCard>
  );
};
export default ActionButtonsPanel;