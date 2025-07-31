// src/components/home/QuickAccessGames.tsx
import { FC } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Package, Store, Gamepad2 } from 'lucide-react'; // Import relevant icons
import SwytchCard from '../SwytchCard';

interface QuickAccessGamesProps {
  userId: string | null;
  setActiveModal: (modalName: string | null) => void;
  setShowMessage: (message: string) => void;
}

// Define a small, curated list of game-related links for quick access
const quickLinks = [
  { id: 'inventory', title: 'Your Inventory', path: '/inventory', description: 'Manage your in-game items.', icon: <Package className="w-6 h-6 text-blue-400" /> },
  { id: 'marketplace', title: 'Item Marketplace', path: '/marketplace', description: 'Buy and sell items with crypto.', icon: <Store className="w-6 h-6 text-green-400" /> },
  { id: 'all-games', title: 'Explore Games', path: '/games', description: 'Discover all PETverse games.', icon: <Gamepad2 className="w-6 h-6 text-purple-400" /> },
];

const QuickAccessGames: FC<QuickAccessGamesProps> = ({ userId, setActiveModal, setShowMessage }) => {
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
    <SwytchCard gradient="from-blue-700/20 to-purple-700/20" className="p-6">
      <h2 className="text-2xl font-bold text-white font-poppins mb-4 text-center">
        <Gamepad2 className="inline-block w-7 h-7 mr-2 text-cyan-400" /> Quick Access
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
              className="flex flex-col items-center p-4 rounded-lg bg-gray-800/50 border border-gray-700 text-center h-full justify-center"
              aria-label={`Go to ${link.title}`}
            >
              {link.icon}
              <h3 className="text-lg font-semibold text-white mt-2">{link.title}</h3>
              <p className="text-sm text-gray-300 mt-1">{link.description}</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </SwytchCard>
  );
};

export default QuickAccessGames;