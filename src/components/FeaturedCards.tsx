import { FC } from 'react';
import { motion } from 'framer-motion';
import { Lock, DollarSign, Zap, ArrowRight, Gem } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePlayer } from '@/components/context/PlayerContext';
import { useModal } from '@/components/context/ModalContext';

const features = [
  {
    icon: Gem,
    title: 'TRUE OWNERSHIP',
    description: 'Items are minted as real, tradable assets on the blockchain.',
    actionLabel: 'OPEN ARMORY',
    actionPath: '/inventory',
  },
  {
    icon: DollarSign,
    title: 'CRYPTO VAULT',
    description: 'Convert JOULES earnings into crypto or fiat instantly.',
    actionLabel: 'ACCESS VAULT',
    actionPath: '/vault',
  },
  {
    icon: Lock,
    title: 'SECURE PROTOCOL',
    description: 'Blockchain-backed security ensures fair play and transparency.',
    actionLabel: 'VIEW STATUS',
    actionPath: '/community',
  },
  {
    icon: Zap,
    title: 'LEGACY REBOOT',
    description: 'Classic gameplay loops re-engineered for the new economy.',
    actionLabel: 'START SIM',
    actionPath: '/', // Redirects to Feed
  },
];

const FeatureCards: FC = () => {
  const { userId } = usePlayer();
  const { setActiveModal, setShowMessage } = useModal();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {features.map((feature, index) => (
        <motion.div key={index} whileHover={{ y: -5 }}>
          <div className="bg-black border border-white/10 p-6 h-full flex flex-col items-start hover:border-primary/50 transition-colors group">
            <feature.icon className="w-8 h-8 text-white mb-4 group-hover:text-primary transition-colors" />
            <h3 className="text-lg font-bold text-white font-russo uppercase mb-2">{feature.title}</h3>
            <p className="text-xs text-gray-500 font-mono mb-6 flex-grow leading-relaxed">{feature.description}</p>
            
            <Link
              to={feature.actionPath}
              className="w-full flex items-center justify-between text-xs font-bold text-white uppercase border-t border-white/10 pt-4 group-hover:text-primary"
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