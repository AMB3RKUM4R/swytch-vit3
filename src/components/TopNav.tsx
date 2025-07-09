// TopNav.tsx
import { FC, SetStateAction, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Sparkles, Menu, X, Gamepad2, Home, Eye, User, FerrisWheel, Rocket, Dice1, House, LayoutGrid, Award, BarChart, ShoppingCart } from 'lucide-react'; // Added more icons
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { NavLink } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

interface TopNavProps {
  userId: string | null;
  jewelsBalance: number;
  isPETMember: boolean;
  setShowMessage: React.Dispatch<React.SetStateAction<string>>;
  setShowWalletModal: React.Dispatch<SetStateAction<boolean>>;
}

const navItems = [
  { path: '/', icon: <Home className="w-5 h-5" /> },
  { path: '/vault', icon: <Wallet className="w-5 h-5" /> },
  { path: '/tokenomics', icon: <BarChart className="w-5 h-5" /> }, // Changed icon
  { path: '/benefits', icon: <Award className="w-5 h-5" /> }, // Changed icon
  { path: '/vision', icon: <Eye className="w-5 h-5" /> },
  { path: '/market', icon: <LayoutGrid className="w-5 h-5" /> }, // Changed icon
  { name: 'Shop', path: '/shop', icon: <ShoppingCart className="w-5 h-5" /> }, // Changed icon
  { path: '/community', icon: <User className="w-5 h-5" /> },
];

const gameItems = [
  { name: 'Bingo', path: '/games/bingo', icon: <Dice1 className="w-5 h-5" /> },
  { name: 'Blackjack', path: '/games/blackjack', icon: <Gamepad2 className="w-5 h-5" /> },
  { name: 'Bridge', path: '/games/bridge', icon: <Gamepad2 className="w-5 h-5" /> },
  { name: 'Caribbean Stud', path: '/games/caribbean-stud', icon: <Gamepad2 className="w-5 h-5" /> },
  { name: 'Fortune Wheel', path: '/games/fortune-wheel', icon: <FerrisWheel className="w-5 h-5" /> },
  { name: 'Horse', path: '/games/horse', icon: <House className="w-5 h-5" /> },
  { name: 'Pontoon', path: '/games/pontoon', icon: <Gamepad2 className="w-5 h-5" /> },
  { name: 'Red Dog', path: '/games/reddog', icon: <Gamepad2 className="w-5 h-5" /> },
  { name: 'Rocket Crash', path: '/games/rocketcrash', icon: <Rocket className="w-5 h-5" /> },
  { name: 'Scratch Cards', path: '/games/Scratch', icon: <Gamepad2 className="w-5 h-5" /> },
  { name: 'Solitaire', path: '/games/solitaire', icon: <Gamepad2 className="w-5 h-5" /> },
];

const TopNav: FC<TopNavProps> = ({ userId, jewelsBalance, isPETMember, setShowMessage, setShowWalletModal }) => {
  const { isConnected, address } = useAccount();
  const { isDarkMode, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isGamesOpen, setIsGamesOpen] = useState(false);

  const closeMenus = () => {
    setIsMenuOpen(false);
    setIsGamesOpen(false);
  };

  const handleWalletClick = () => {
    if (!userId) {
      setShowMessage('⚠️ Please sign in to connect wallet!');
      setShowWalletModal(true); // This should ideally trigger AuthModal
      return;
    }
    if (!isConnected) {
      // openConnectModal() will be called by the ConnectButton.Custom render prop
    } else {
      setShowMessage('🎉 Wallet connected!');
    }
  };

  const dropdownVariants = {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  };

  return (
    <motion.nav
      className={`fixed top-0 left-0 w-full z-50 py-2 px-2 md:px-4 flex items-center justify-between nav-main ${isDarkMode ? 'glass-dark' : 'glass-light'}`}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Logo / Brand Name */}
      <div className="flex items-center gap-4">
        <Sparkles className="text-primary w-6 h-6 animate-pulse" aria-hidden="true" /> 
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-4">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'nav-item-active' : ''}`
            }
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
        {/* Games Dropdown for Desktop */}
        <div className="relative">
          <button
            className={`nav-item flex items-center gap-2`}
            onClick={() => setIsGamesOpen(!isGamesOpen)}
            aria-label="Toggle Games Menu"
          >
            <Gamepad2 className="w-5 h-5 text-primary" />
            <span>Games</span>
          </button>
          <AnimatePresence>
            {isGamesOpen && (
              <motion.div
                className={`popover absolute top-full left-0 mt-2 p-4 w-48 rounded-lg shadow-lg z-20`}
                variants={dropdownVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                {gameItems.map((game) => (
                  <NavLink
                    key={game.name}
                    to={game.path}
                    className={({ isActive }) =>
                      `flex items-center gap-2 py-2 px-3 rounded-md nav-item-dropdown ${isActive ? 'nav-item-dropdown-active' : ''}`
                    }
                    onClick={() => closeMenus()}
                  >
                    {game.icon}
                    {game.name}
                  </NavLink>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right side: Wallet, Balances, Theme Toggle, Mobile Menu */}
      <div className="flex items-center gap-2">
        {userId && (
          <div className="flex items-center gap-2 text-foreground font-inter">
            <Sparkles className="text-primary w-5 h-5 animate-pulse" aria-hidden="true" />
            <span>{isPETMember ? 'PET Member' : 'Non-Member'} | {jewelsBalance.toFixed(0)} JEWELS</span>
          </div>
        )}
        <ConnectButton.Custom>
          {({ openConnectModal }) => (
            <motion.button
              className="btn-secondary flex items-center gap-2"
              onClick={() => {
                handleWalletClick();
                if (!isConnected && userId) { // Only open RainbowKit if user is logged in
                  openConnectModal();
                }
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label={isConnected ? 'Wallet Connected' : 'Connect Wallet'}
            >
              <Wallet className="w-5 h-5" />
              {isConnected && address ? `${address.slice(0, 4)}...${address.slice(-4)}` : 'Connect Wallet'}
            </motion.button>
          )}
        </ConnectButton.Custom>
        <motion.button
          className="theme-toggle-btn"
          onClick={toggleTheme}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? '☀️' : '🌙'}
        </motion.button>
        {/* Mobile Menu Toggle */}
        <motion.button
          className={`md:hidden p-2 rounded-full text-foreground hover:bg-background-secondary`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          aria-label={isMenuOpen ? 'Close Menu' : 'Open Menu'}
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </motion.button>
      </div>

      {/* Mobile Full-Screen Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className={`md:hidden fixed top-0 left-0 w-full h-full p-4 z-40 mobile-menu`}
            initial={{ x: '100%' }} // Animate from right
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3 }}
          >
            <button
              className="absolute top-4 right-4 text-foreground p-2 rounded-full hover:bg-background-secondary"
              onClick={() => setIsMenuOpen(false)}
              aria-label="Close Menu"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="mt-16 flex flex-col gap-4 text-center">
              {navItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `nav-item-mobile ${isActive ? 'nav-item-active' : ''}`
                  }
                  onClick={() => closeMenus()}
                >
                  {item.icon}
                  {item.name}
                </NavLink>
              ))}
              {/* Games Dropdown for Mobile */}
              <div className="relative w-full">
                <button
                  className={`nav-item-mobile`}
                  onClick={() => setIsGamesOpen(!isGamesOpen)}
                  aria-label="Toggle Games Menu"
                >
                  <Gamepad2 className="w-5 h-5 text-primary" />
                  <span>Games</span>
                </button>
                <AnimatePresence>
                  {isGamesOpen && (
                    <motion.div
                      className="flex flex-col gap-2 p-2 pt-4"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {gameItems.map((game) => (
                        <NavLink
                          key={game.name}
                          to={game.path}
                          className={({ isActive }) =>
                            `flex items-center justify-center gap-2 py-2 px-3 rounded-md nav-item-dropdown ${isActive ? 'nav-item-dropdown-active' : ''}`
                          }
                          onClick={() => closeMenus()}
                        >
                          {game.icon}
                          {game.name}
                        </NavLink>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default TopNav;