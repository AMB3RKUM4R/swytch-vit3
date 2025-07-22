// src/components/TopNav.tsx
import { FC } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Sparkles, User, Package, Store, Car, ShoppingBag, ShieldCheck, Gamepad2, Info, Settings } from 'lucide-react'; // Import all necessary icons
import { useAccount } from 'wagmi';
import { useTheme } from '../components/context/ThemeContext';
import { TopNavProps } from '../lib/types';
import { useAuthUser } from '@/hooks/useAuthUser';
import { Link } from 'react-router-dom';

// Define primary navigation items for TopNav (these were previously in "More" or are new direct links)
const topNavPrimaryItems = [
  { path: '/market', label: 'Market', icon: <Car className="w-5 h-5" /> },
  { path: '/shop', label: 'Shop', icon: <ShoppingBag className="w-5 h-5" /> },
  { path: '/benefits', label: 'Benefits', icon: <ShieldCheck className="w-5 h-5" /> },
  { path: '/games', label: 'Games', icon: <Gamepad2 className="w-5 h-5" /> },
  { path: '/inventory', label: 'Inventory', icon: <Package className="w-5 h-5" /> },
  { path: '/marketplace', label: 'Marketplace', icon: <Store className="w-5 h-5" /> },
  { path: '/dspet-disclosure', label: 'Disclosure', icon: <Info className="w-5 h-5" /> },
  { path: '/admin', label: 'Admin', icon: <Settings className="w-5 h-5" /> }, // Admin page link
];

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
  const { user } = useAuthUser();

  const handleAuthWalletClick = () => {
    setActiveAuthModal('auth');
    setShowMessage('ℹ️ Opening authentication and wallet options...');
  };

  const handlePaymentClick = () => {
    setShowPaymentModal(true);
    setShowMessage('ℹ️ Opening payment options...');
  };

  const displayName = user?.displayName || user?.email?.split('@')[0] || (userId ? `${userId.slice(0, 4)}...${userId.slice(-4)}` : 'Guest');

  const handleRestrictedNav = (path: string, label: string) => {
    const restrictedPaths = [
      '/home', '/vault', '/benefits', '/market', '/shop', '/community',
      '/membership', '/games', '/inventory', '/marketplace', '/admin'
    ];
    if (!userId && restrictedPaths.includes(path)) {
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
      {/* Logo / Brand Name */}
      <div className="flex items-center gap-2">
        <Sparkles className="text-primary w-6 h-6 animate-pulse" aria-hidden="true" />
        <span className="text-xl font-bold text-foreground font-poppins hidden sm:block">SWYTCH</span>
      </div>

      {/* Primary Navigation Links (Icons + optional labels for larger screens) */}
      {/* Show on md and up, responsive for mobile (will be in BottomNav instead) */}
      <div className="hidden md:flex flex-grow justify-center items-center gap-2 sm:gap-4 overflow-x-auto px-2 md:px-0">
        {topNavPrimaryItems.map(({ path, label, icon }) => (
          <Link
            to={path}
            key={path}
            onClick={(e) => {
              if (!handleRestrictedNav(path, label)) {
                e.preventDefault();
              }
            }}
            className="flex flex-col items-center text-sm group p-1 rounded-md hover:bg-gray-700/30 transition-colors flex-shrink-0"
            aria-label={label}
          >
            <div className="transition-transform duration-150 group-hover:scale-110">
              {icon}
            </div>
            <span className="text-xs mt-1 font-inter text-muted">{label}</span> {/* Label always visible on md+ */}
          </Link>
        ))}
      </div>


      {/* Right side: User Status, Auth/Wallet Button, Payment Button, Theme Toggle */}
      <div className="flex items-center gap-2 flex-shrink-0">
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
          className="btn-secondary flex items-center gap-2 p-2 rounded-md"
          onClick={handleAuthWalletClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label={isConnected ? 'Wallet Connected' : 'Sign In / Connect Wallet'}
        >
          <Wallet className="w-5 h-5" />
          <span className="hidden md:block">{isConnected && address ? `${address.slice(0, 4)}...${address.slice(-4)}` : 'Sign In / Connect'}</span>
        </motion.button>

        {/* Payment Button */}
        <motion.button
          className="btn-primary flex items-center gap-2 p-2 rounded-md"
          onClick={handlePaymentClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Make a Payment"
        >
          <Sparkles className="w-5 h-5" /> <span className="hidden md:block">Pay</span>
        </motion.button>

        <motion.button
          className="theme-toggle-btn p-2 rounded-md"
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
