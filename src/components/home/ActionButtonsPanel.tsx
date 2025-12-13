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
    <div className="bg-black border border-gray-800 p-6 shadow-[0_0_20px_rgba(0,0,0,0.5)] font-mono">
      <h2 className="text-sm font-black text-center mb-6 text-white uppercase tracking-[0.2em] flex items-center justify-center gap-2">
        <Zap className="w-4 h-4 text-[#39FF14]" /> Logistics Terminal
      </h2>
      <div className="grid grid-cols-2 gap-4">
        
        {/* Deposit */}
        <motion.button 
          className="h-12 border border-[#39FF14] text-[#39FF14] font-bold text-[10px] md:text-xs uppercase hover:bg-[#39FF14] hover:text-black transition-colors flex items-center justify-center" 
          onClick={() => { if (handleRestrictedAction('deposit assets')) setActiveModal('payment'); }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <ArrowUpCircle className="w-4 h-4 mr-2" /> INJECT YIELD
        </motion.button>
        
        {/* Withdraw */}
        <motion.button 
          className="h-12 border border-red-500 text-red-500 font-bold text-[10px] md:text-xs uppercase hover:bg-red-500 hover:text-black transition-colors flex items-center justify-center"
          onClick={() => { 
            if (handleRestrictedAction('withdraw energy')) setActiveModal('withdraw'); 
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <ArrowDownCircle className="w-4 h-4 mr-2" /> EXTRACT
        </motion.button>
        
        {/* Sentinels */}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Link 
            to="/sentinels" 
            className="h-12 w-full border border-gray-700 text-white font-bold text-[10px] md:text-xs uppercase hover:bg-white hover:text-black transition-colors flex items-center justify-center" 
            onClick={(e) => {
              if (!handleRestrictedAction('access Sentinels', null)) e.preventDefault();
            }}
          >
            <Users className="w-4 h-4 mr-2" /> SENTINELS
          </Link>
        </motion.div>
        
        {/* Broadcast */}
        <motion.button 
          className="h-12 border border-blue-500 text-blue-500 font-bold text-[10px] md:text-xs uppercase hover:bg-blue-500 hover:text-white transition-colors flex items-center justify-center" 
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