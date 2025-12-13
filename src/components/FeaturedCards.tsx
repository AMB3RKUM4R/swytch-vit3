import { FC } from 'react';
import { motion } from 'framer-motion';
import { Lock, DollarSign, Zap, ArrowRight, Gem } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePlayer } from '@/components/context/PlayerContext';
import { useModal } from '@/components/context/ModalContext';

const features = [
  {
    icon: Gem,
    title: 'OWNERSHIP',
    description: 'Assets minted on-chain. Tradable. Permanent.',
    actionLabel: 'OPEN ARMORY',
    actionPath: '/inventory',
  },
  {
    icon: DollarSign,
    title: 'CRYPTO VAULT',
    description: 'Convert JOULES to liquid crypto assets instantly.',
    actionLabel: 'ACCESS VAULT',
    actionPath: '/vault',
  },
  {
    icon: Lock,
    title: 'SECURE NET',
    description: 'Blockchain-backed security ensuring transparency.',
    actionLabel: 'VIEW STATUS',
    actionPath: '/community',
  },
  {
    icon: Zap,
    title: 'LEGACY REBOOT',
    description: '18 Arcade Protocols re-engineered for the new economy.',
    actionLabel: 'START FEED',
    actionPath: '/', 
  },
];

const FeatureCards: FC = () => {
  const { userId } = usePlayer();
  const { setActiveModal, setShowMessage } = useModal();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
      {features.map((feature, index) => (
        <motion.div key={index} whileHover={{ y: -5 }}>
          <div className="bg-[#0a0a0a] border border-gray-800 p-6 h-full flex flex-col items-start hover:border-[#39FF14] transition-colors group relative overflow-hidden">
            <feature.icon className="w-8 h-8 text-white mb-4 group-hover:text-[#39FF14] transition-colors" />
            <h3 className="text-xl font-black italic text-white uppercase mb-2 tracking-tighter">{feature.title}</h3>
            <p className="text-xs text-gray-500 mb-6 flex-grow leading-relaxed uppercase">{feature.description}</p>
            
            <Link
              to={feature.actionPath}
              className="w-full flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase border-t border-gray-800 pt-4 group-hover:text-[#39FF14] group-hover:border-[#39FF14]/50 transition-colors tracking-widest"
              onClick={(e) => {
                const restrictedPaths = ['/inventory', '/vault', '/community'];
                if (restrictedPaths.includes(feature.actionPath) && !userId) {
                    setShowMessage('⚠️ ACCESS DENIED: LOGIN REQUIRED');
                    setActiveModal('auth');
                    e.preventDefault();
                }
              }}
            >
              {feature.actionLabel} <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default FeatureCards;