import { FC, SetStateAction, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Sparkles, Menu, X, Gamepad2, Home, Star, Eye, Car, User, FerrisWheel, Rocket, Dice1, House } from 'lucide-react';
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
  { name: 'Landing', path: '/', icon: <Home className="w-6 h-6" /> },
  { name: 'Home', path: '/home', icon: <Home className="w-6 h-6" /> },
  { name: 'Vault', path: '/vault', icon: <Wallet className="w-6 h-6" /> },
  { name: 'Tokenomics', path: '/tokenomics', icon: <Wallet className="w-6 h-6" /> },
  { name: 'Benefits', path: '/benefits', icon: <Star className="w-6 h-6" /> },
  { name: 'Vision', path: '/vision', icon: <Eye className="w-6 h-6" /> },
  { name: 'Market', path: '/market', icon: <Car className="w-6 h-6" /> },
  { name: 'Shop', path: '/shop', icon: <Car className="w-6 h-6" /> },
  { name: 'Community', path: '/community', icon: <User className="w-6 h-6" /> },
];

const gameItems = [
  { name: 'Bingo', path: '/games/bingo', icon: <Dice1 className="w-6 h-6" /> },
  { name: 'Blackjack', path: '/games/blackjack', icon: <Car className="w-6 h-6" /> },
  { name: 'Bridge', path: '/games/bridge', icon: <Car className="w-6 h-6" /> },
  { name: 'Caribbean Stud', path: '/games/caribbean-stud', icon: <Car className="w-6 h-6" /> },
  { name: 'Fortune Wheel', path: '/games/fortune-wheel', icon: <FerrisWheel className="w-6 h-6" /> },
  { name: 'Horse', path: '/games/horse', icon: <House className="w-6 h-6" /> },
  { name: 'Pontoon', path: '/games/pontoon', icon: <Car className="w-6 h-6" /> },
  { name: 'Red Dog', path: '/games/reddog', icon: <Car className="w-6 h-6" /> },
  { name: 'Rocket Crash', path: '/games/rocketcrash', icon: <Rocket className="w-6 h-6" /> },
  { name: 'Scratch Cards', path: '/games/Scratch', icon: <Car className="w-6 h-6" /> },
  { name: 'Solitaire', path: '/games/solitaire', icon: <Car className="w-6 h-6" /> },
];

const TopNav: FC<TopNavProps> = ({ userId, jewelsBalance, isPETMember, setShowMessage, setShowWalletModal }) => {
  const { isConnected, address } = useAccount();
  const { isDarkMode, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isGamesOpen, setIsGamesOpen] = useState(false);

  const handleWalletClick = () => {
    if (!userId) {
      setShowMessage('⚠️ Please sign in to connect wallet!');
      setShowWalletModal(true);
      return;
    }
    if (!isConnected) {
      setShowWalletModal(true);
    } else {
      setShowMessage('🎉 Wallet connected!');
    }
  };

  const dockItemVariants = {
    hover: { scale: 1.2, y: -10, transition: { type: 'spring', stiffness: 300, damping: 10 } },
    tap: { scale: 0.95 },
  };

  return (
    <motion.nav
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 nav-dock ${isDarkMode ? 'glass-dark' : 'glass-light'} max-w-4xl w-full px-6 py-2`}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between gap-4 w-full">
        <motion.div className="flex items-center gap-2" variants={dockItemVariants} whileHover="hover" whileTap="tap">
          <Sparkles className="text-primary w-6 h-6 animate-pulse-slow" aria-hidden="true" />
          <h1 className="text-xl font-bold font-['Poppins'] text-primary">Swytch PETverse</h1>
        </motion.div>

        <div className="hidden md:flex items-center gap-4">
          {navItems.map((item) => (
            <motion.div key={item.name} className="dock-item" variants={dockItemVariants} whileHover="hover" whileTap="tap">
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-2 p-2 rounded-full text-${isDarkMode ? 'gray-200' : 'gray-700'} hover:text-secondary font-['Inter'] transition-colors ${isActive ? 'bg-primary/20 text-secondary' : ''}`
                }
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            </motion.div>
          ))}
          <motion.div className="relative dock-item" variants={dockItemVariants} whileHover="hover" whileTap="tap">
            <button
              className={`flex items-center gap-2 p-2 rounded-full text-${isDarkMode ? 'gray-200' : 'gray-700'} hover:text-secondary font-['Inter']`}
              onClick={() => setIsGamesOpen(!isGamesOpen)}
              aria-label="Toggle Games Menu"
            >
              <Gamepad2 className="w-6 h-6 text-primary" />
              <span>Games</span>
            </button>
            <AnimatePresence>
              {isGamesOpen && (
                <motion.div
                  className={`popover ${isDarkMode ? 'glass-dark' : 'glass-light'} mt-2 p-4 absolute z-10 w-48 left-0`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {gameItems.map((game) => (
                    <NavLink
                      key={game.name}
                      to={game.path}
                      className={({ isActive }) =>
                        `flex items-center gap-2 py-1 text-${isDarkMode ? 'gray-200' : 'gray-700'} hover:text-secondary font-['Inter'] ${isActive ? 'text-secondary' : ''}`
                      }
                      onClick={() => setIsGamesOpen(false)}
                    >
                      {game.icon}
                      {game.name}
                    </NavLink>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        <div className="flex items-center gap-4">
          {userId && (
            <motion.div
              className={`dock-item flex items-center gap-2 text-${isDarkMode ? 'gray-200' : 'gray-700'} font-['Inter'] p-2 rounded-full`}
              variants={dockItemVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Sparkles className="text-primary w-6 h-6 animate-pulse-slow" aria-hidden="true" />
              <span>{isPETMember ? 'PET Member' : 'Non-Member'} | JEWELS: {jewelsBalance.toFixed(2)}</span>
            </motion.div>
          )}
          <ConnectButton.Custom>
            {({ openConnectModal }) => (
              <motion.button
                className="btn-primary flex items-center gap-2"
                onClick={() => {
                  handleWalletClick();
                  if (!isConnected) openConnectModal();
                }}
                variants={dockItemVariants}
                whileHover="hover"
                whileTap="tap"
                aria-label={isConnected ? 'Wallet Connected' : 'Connect Wallet'}
              >
                <Wallet className="w-6 h-6" />
                {isConnected && address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Connect Wallet'}
              </motion.button>
            )}
          </ConnectButton.Custom>
          <motion.button
            className={`dock-item text-${isDarkMode ? 'gray-200' : 'gray-700'} p-2 rounded-full`}
            onClick={toggleTheme}
            variants={dockItemVariants}
            whileHover="hover"
            whileTap="tap"
            aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </motion.button>
          <motion.button
            className={`md:hidden dock-item text-${isDarkMode ? 'gray-200' : 'gray-700'} p-2 rounded-full`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            variants={dockItemVariants}
            whileHover="hover"
            whileTap="tap"
            aria-label={isMenuOpen ? 'Close Menu' : 'Open Menu'}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className={`md:hidden popover ${isDarkMode ? 'glass-dark' : 'glass-light'} p-4 mt-2 rounded-lg w-full max-w-4xl mx-auto`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            {navItems.map((item) => (
              <motion.div key={item.name} className="dock-item" variants={dockItemVariants} whileHover="hover" whileTap="tap">
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-2 py-2 text-${isDarkMode ? 'gray-200' : 'gray-700'} hover:text-secondary font-['Inter'] ${isActive ? 'bg-primary/20 text-secondary rounded-full' : ''}`
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.icon}
                  {item.name}
                </NavLink>
              </motion.div>
            ))}
            <motion.div className="dock-item" variants={dockItemVariants} whileHover="hover" whileTap="tap">
              <button
                className={`flex items-center gap-2 py-2 text-${isDarkMode ? 'gray-200' : 'gray-700'} hover:text-secondary font-['Inter']`}
                onClick={() => setIsGamesOpen(!isGamesOpen)}
                aria-label="Toggle Games Menu"
              >
                <Gamepad2 className="w-6 h-6 text-primary" />
                Games
              </button>
            </motion.div>
            <AnimatePresence>
              {isGamesOpen && (
                <motion.div className="pl-4"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {gameItems.map((game) => (
                    <motion.div key={game.name} className="dock-item" variants={dockItemVariants} whileHover="hover" whileTap="tap">
                      <NavLink
                        to={game.path}
                        className={({ isActive }) =>
                          `flex items-center gap-2 py-1 text-${isDarkMode ? 'gray-200' : 'gray-700'} hover:text-secondary font-['Inter'] ${isActive ? 'text-secondary' : ''}`
                        }
                        onClick={() => {
                          setIsGamesOpen(false);
                          setIsMenuOpen(false);
                        }}
                      >
                        {game.icon}
                        {game.name}
                      </NavLink>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default TopNav;