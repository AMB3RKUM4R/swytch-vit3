// src/components/TopNav.tsx
import { FC } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Sparkles, User, Package, Store } from 'lucide-react'; // Added Package and Store icons for Inventory/Marketplace
import { useAccount } from 'wagmi';
import { useTheme } from '../components/context/ThemeContext';
import { TopNavProps } from '../lib/types'; // Import TopNavProps from types.ts
import { useAuthUser } from '@/hooks/useAuthUser'; // Import useAuthUser to get username
import { Link } from 'react-router-dom'; // Import Link for navigation

// Use TopNavProps as the type for the FC
const TopNav: FC<TopNavProps> = ({
  userId,
  jewelsBalance,
  isPETMember,
  setShowMessage,
  setActiveAuthModal,
  setShowPaymentModal,
}) => {
  const { isConnected, address } = useAccount();
  const { isDarkMode, toggleTheme } = useTheme();
  const { user } = useAuthUser(); // Get user object for username

  const handleAuthWalletClick = () => {
    setActiveAuthModal('auth');
    setShowMessage('ℹ️ Opening authentication and wallet options...');
  };

  const handlePaymentClick = () => {
    setShowPaymentModal(true);
    setShowMessage('ℹ️ Opening payment options...');
  };

  // Determine display name for TopNav
  const displayName = user?.displayName || user?.email?.split('@')[0] || (userId ? `${userId.slice(0, 4)}...${userId.slice(-4)}` : 'Guest');

  // Helper function for restricted navigation
  const handleRestrictedNav = (_path: string, label: string) => {
    if (!userId) {
      setShowMessage(`⚠️ Please sign in to access ${label}.`);
      setActiveAuthModal('auth');
      return false;
    }
    setShowMessage(`➡️ Navigating to ${label}!`);
    return true;
  };

  return (
    <motion.nav
      className={`fixed top-0 left-0 w-full z-50 py-2 px-2 md:px-4 flex items-center justify-between nav-main ${isDarkMode ? 'glass-dark' : 'glass-light'}`}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Logo / Brand Name with Sparkles icon */}
      <div className="flex items-center gap-4">
        <Sparkles className="text-primary w-6 h-6 animate-pulse" aria-hidden="true" />
        <span className="text-xl font-bold text-foreground font-poppins">SWYTCH</span>
      </div>

      {/* Center Navigation (New: Inventory, Marketplace) */}
      <div className="hidden md:flex items-center gap-6">
        <Link
          to="/inventory"
          className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
          onClick={(e) => {
            if (!handleRestrictedNav('/inventory', 'Inventory')) {
              e.preventDefault();
            }
          }}
        >
          <Package className="w-5 h-5" /> Inventory
        </Link>
        <Link
          to="/marketplace"
          className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
          onClick={(e) => {
            if (!handleRestrictedNav('/marketplace', 'Marketplace')) {
              e.preventDefault();
            }
          }}
        >
          <Store className="w-5 h-5" /> Marketplace
        </Link>
      </div>


      {/* Right side: User Status, Auth/Wallet Button, Payment Button, Theme Toggle */}
      <div className="flex items-center gap-2">
        {userId && (
          <div className="hidden md:flex items-center gap-2 text-foreground font-inter text-sm md:text-base">
            <User className="text-primary w-5 h-5" aria-hidden="true" />
            <span className="truncate max-w-[100px]">{displayName}</span>
            <Sparkles className="text-primary w-5 h-5 animate-pulse" aria-hidden="true" />
            <span>{jewelsBalance.toFixed(0)} JEWELS</span>
            {isPETMember && <span className="text-xs text-yellow-400 ml-1">PET Member</span>}
          </div>
        )}

        {/* Auth/Wallet Button */}
        <motion.button
          className="btn-secondary flex items-center gap-2"
          onClick={handleAuthWalletClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label={isConnected ? 'Wallet Connected' : 'Sign In / Connect Wallet'}
        >
          <Wallet className="w-5 h-5" />
          {isConnected && address ? `${address.slice(0, 4)}...${address.slice(-4)}` : 'Sign In / Connect'}
        </motion.button>

        {/* Payment Button */}
        <motion.button
          className="btn-primary flex items-center gap-2"
          onClick={handlePaymentClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Make a Payment"
        >
          <Sparkles className="w-5 h-5" /> Pay
        </motion.button>

        <motion.button
          className="theme-toggle-btn"
          onClick={toggleTheme}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? '☀️' : '🌙'}
        </motion.button>
      </div>
    </motion.nav>
  );
};

export default TopNav;
