import { FC } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpCircle, ArrowDownCircle, MessageCircleHeart, Users, Zap } from 'lucide-react';
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
      setShowMessage(`⚠️ SYNC REQUIRED: ${action}`);
      setActiveModal(modal);
      return false;
    }
    return true;
  };

  return (
    <div className="bg-black border border-white/10 p-6 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
      <h2 className="text-xl font-bold text-center mb-6 font-russo flex items-center justify-center gap-2 text-white uppercase tracking-wider">
        <Zap className="w-5 h-5 text-primary" /> Logistics Terminal
      </h2>
      <div className="grid grid-cols-2 gap-4">
        
        {/* Deposit */}
        <motion.button 
          className="btn-primary flex items-center justify-center text-[10px] md:text-xs" 
          onClick={() => { if (handleRestrictedAction('deposit assets')) setActiveModal('payment'); }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <ArrowUpCircle className="w-4 h-4 mr-2" /> INJECT YIELD
        </motion.button>
        
        {/* Withdraw */}
        <motion.button 
          className="btn-destructive flex items-center justify-center text-[10px] md:text-xs"
          onClick={() => { 
            if (handleRestrictedAction('withdraw energy')) setActiveModal('withdraw'); 
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <ArrowDownCircle className="w-4 h-4 mr-2" /> EXTRACT
        </motion.button>
        
        {/* Sentinel Terminal */}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Link 
            to="/sentinels" 
            className="btn-secondary w-full flex items-center justify-center text-[10px] md:text-xs" 
            onClick={(e) => {
              if (!handleRestrictedAction('access Sentinels', null)) e.preventDefault();
            }}
          >
            <Users className="w-4 h-4 mr-2" /> SENTINELS
          </Link>
        </motion.div>
        
        {/* Share Button */}
        <motion.button 
          className="btn-secondary flex items-center justify-center text-[10px] md:text-xs" 
          onClick={handleShareOnX}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <MessageCircleHeart className="w-4 h-4 mr-2" /> BROADCAST
        </motion.button>

      </div>
    </div>
  );
};
export default ActionButtonsPanel;