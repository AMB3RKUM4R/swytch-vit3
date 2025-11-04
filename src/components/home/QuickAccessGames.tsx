// src/components/home/QuickAccessGames.tsx
import { FC } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Package, Store, Gamepad2 } from 'lucide-react';
import SwytchCard from '../SwytchCard';
import { usePlayer } from '@/components/context/PlayerContext'; // Import main hook
import { useModal } from '@/components/context/ModalContext'; // Import modal hook

const quickLinks = [
  { id: 'inventory', title: 'Your Inventory', path: '/inventory', description: 'Manage your in-game items.', icon: <Package className="w-8 h-8 text-primary" /> },
  { id: 'marketplace', title: 'Item Marketplace', path: '/shop', description: 'Buy and sell assets.', icon: <Store className="w-8 h-8 text-green-400" /> },
  { id: 'all-games', title: 'Play Games', path: '/community', description: 'Discover all PETverse games.', icon: <Gamepad2 className="w-8 h-8 text-purple-400" /> },
];

// This component is now self-sufficient and requires no props.
const QuickAccessGames: FC = () => {
  // Pull data from our global contexts
  const { userId } = usePlayer();
  const { setActiveModal, setShowMessage } = useModal();

  const handleNavigation = (_path: string, label: string) => {
    if (!userId) {
      setShowMessage(`⚠️ Please sign in to access ${label}.`);
      setActiveModal('auth');
      return false;
    }
    setShowMessage(`🎮 Navigating to ${label}!`);
    return true;
  };

  return (
    <SwytchCard variant="default" className="p-6">
      <h2 className="text-2xl font-bold text-foreground font-poppins mb-6 text-center">
        <Gamepad2 className="inline-block w-7 h-7 mr-2 text-primary" /> Quick Access
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickLinks.map((link) => (
          <motion.div key={link.id} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Link
              to={link.path}
              onClick={(e) => {
                if (!handleNavigation(link.path, link.title)) {
                  e.preventDefault();
                }
              }}
              className="flex flex-col items-center p-6 rounded-lg bg-card hover:bg-secondary/50
                         border border-border text-center h-full justify-center transition-colors"
              aria-label={`Go to ${link.title}`}
            >
              {link.icon}
              <h3 className="text-lg font-semibold text-foreground mt-3 font-poppins">{link.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{link.description}</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </SwytchCard>
  );
};

export default QuickAccessGames;
