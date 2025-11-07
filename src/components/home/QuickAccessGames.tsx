// src/components/home/QuickAccessGames.tsx
import { FC } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Package, Store, Gamepad2, Landmark } from 'lucide-react'; // Added Landmark icon
import SwytchCard from '../SwytchCard';
import { usePlayer } from '@/components/context/PlayerContext';
import { useModal } from '@/components/context/ModalContext'; 

const quickLinks = [
  { id: 'inventory', title: 'Your Inventory', path: '/inventory', description: 'Manage your in-game items.', icon: <Package className="w-8 h-8 text-primary" /> },
  { id: 'marketplace', title: 'Item Marketplace', path: '/shop', description: 'Buy and sell assets.', icon: <Store className="w-8 h-8 text-green-400" /> },
  { id: 'all-games', title: 'Play Games', path: '/community', description: 'Discover all PETverse games.', icon: <Gamepad2 className="w-8 h-8 text-purple-400" /> },
];

// --- NEW WITHDRAW LINK ---
const withdrawLink = { 
  id: 'withdraw', 
  title: 'Withdraw Joules', 
  path: '#withdraw', // Use hash or simply handle via onClick
  description: 'Request fiat or crypto payout.', 
  icon: <Landmark className="w-8 h-8 text-red-400" /> 
};
// -------------------------

const QuickAccessGames: FC = () => {
  const { userId } = usePlayer();
  const { setActiveModal, setShowMessage } = useModal();

  const allLinks = [...quickLinks, withdrawLink];

  const handleNavigation = (_path: string, label: string) => {
    if (!userId) {
      setShowMessage(`⚠️ Please sign in to access ${label}.`);
      setActiveModal('auth');
      return false;
    }
    // For normal links, show the message
    if (label !== withdrawLink.title) {
        setShowMessage(`🎮 Navigating to ${label}!`);
    }
    return true;
  };
  
  // --- NEW HANDLER FOR WITHDRAWAL MODAL ---
  const handleWithdrawClick = () => {
    if (!userId) {
      setShowMessage(`⚠️ Please sign in to request a withdrawal.`);
      setActiveModal('auth');
      return;
    }
    // Open the dedicated withdrawal modal
    setActiveModal('withdraw'); 
    setShowMessage('💸 Initiating withdrawal request. Enter amount and address.');
  };
  // ----------------------------------------

  return (
    <SwytchCard variant="default" className="p-6">
      <h2 className="text-2xl font-bold text-foreground font-poppins mb-6 text-center">
        <Gamepad2 className="inline-block w-7 h-7 mr-2 text-primary" /> Quick Access
      </h2>
      
      {/* Updated grid to support 4 items, wrapping nicely */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4"> 
        {allLinks.map((link) => (
          <motion.div key={link.id} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            
            {/* Conditional rendering for the Withdraw button */}
            {link.id === 'withdraw' ? (
                <button
                    onClick={handleWithdrawClick}
                    className="flex flex-col items-center p-6 rounded-lg bg-card hover:bg-red-400/20
                                 border border-border text-center h-full justify-center transition-colors w-full"
                    aria-label={link.title}
                >
                    {link.icon}
                    <h3 className="text-lg font-semibold text-foreground mt-3 font-poppins">{link.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{link.description}</p>
                </button>
            ) : (
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
            )}
          </motion.div>
        ))}
      </div>
    </SwytchCard>
  );
};

export default QuickAccessGames;