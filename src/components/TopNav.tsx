import { FC } from 'react'; // Removed SetStateAction as it's not directly used here
import { motion } from 'framer-motion';
import { Wallet, Sparkles } from 'lucide-react'; // Only icons needed for this component
import { useAccount } from 'wagmi';
import { useTheme } from '../context/ThemeContext';

// IMPORTANT: Import TopNavProps from types.ts
import { TopNavProps as ImportedTopNavProps } from '../lib/types';


// Use ImportedTopNavProps as the type for the FC
const TopNav: FC<ImportedTopNavProps> = ({
  userId,
  jewelsBalance,
  isPETMember,
  setShowMessage,
  setActiveAuthModal,
  setShowPaymentModal,
}) => {
  const { isConnected, address } = useAccount();
  const { isDarkMode, toggleTheme } = useTheme();

  const handleAuthWalletClick = () => {
    setActiveAuthModal('auth');
    setShowMessage('ℹ️ Opening authentication and wallet options...');
  };

  const handlePaymentClick = () => {
    setShowPaymentModal(true);
    setShowMessage('ℹ️ Opening payment options...');
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
        <span className="text-xl font-bold text-foreground">SWYTCH</span>
      </div>

      {/* Right side: User Status, Auth/Wallet Button, Payment Button, Theme Toggle */}
      <div className="flex items-center gap-2">
        {userId && (
          <div className="hidden md:flex items-center gap-2 text-foreground font-inter text-sm md:text-base">
            <Sparkles className="text-primary w-5 h-5 animate-pulse" aria-hidden="true" />
            <span>{isPETMember ? 'PET Member' : 'Non-Member'} | {jewelsBalance.toFixed(0)} JEWELS</span>
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