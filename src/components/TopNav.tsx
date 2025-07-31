import { FC, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Sparkles, User, Gamepad2, Settings, Star, BarChart, HandCoins, Users } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useTheme } from '../components/context/ThemeContext';
import { TopNavProps } from '../lib/types';
import { useAuthUser } from '@/hooks/useAuthUser';
import { Link } from 'react-router-dom';
import Tilt from 'react-parallax-tilt';
import { Dialog, DialogContent, DialogTrigger } from '@radix-ui/react-dialog';

// Define a single, flat array of top navigation items
const navItems = [
  { path: '/home', label: 'Home', icon: <Sparkles className="w-6 h-6" /> },
  { path: '/games', label: 'Games', icon: <Gamepad2 className="w-6 h-6" /> },
  { path: '/market', label: 'Market', icon: <BarChart className="w-6 h-6" /> },
  { path: '/vault', label: 'Vault', icon: <HandCoins className="w-6 h-6" /> },
  { path: '/community', label: 'Community', icon: <Users className="w-6 h-6" /> },
  { path: '/membership', label: 'Membership', icon: <Star className="w-6 h-6" /> },
  { path: '/admin', label: 'Admin', icon: <Settings className="w-6 h-6" /> },
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

  const handleRestrictedNav = useCallback((path: string, label: string) => {
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
  }, [userId, setShowMessage, setActiveAuthModal]);

  return (
    <motion.nav
      className={`fixed top-0 left-0 w-full z-50 py-2 px-2 md:px-4 flex items-center justify-between bg-noise holographic-card animated-aura ${isDarkMode ? 'glass-dark' : 'glass-light'}`}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{ background: 'linear-gradient(145deg, rgba(0,0,0,0.8), rgba(50,50,100,0.5))' }}
    >
      {/* Logo / Brand Name */}
      <div className="flex items-center gap-2">
        <Tilt tiltMaxAngleX={8} tiltMaxAngleY={8} glareEnable={true} glareMaxOpacity={0.4}>
          <Sparkles className="text-[hsl(var(--primary))] w-6 h-6 animate-neon-pulse" aria-hidden="true" />
        </Tilt>
        <span className="text-xl font-bold text-foreground font-russo text-glow-primary hidden sm:block">SWYTCH</span>
      </div>

      {/* Primary Navigation Links */}
      <div className="hidden md:flex flex-grow justify-center items-center gap-4 overflow-x-auto px-2 md:px-0">
        {navItems.map(({ path, label, icon }) => (
          <Link
            key={path}
            to={path}
            onClick={(e) => {
              if (!handleRestrictedNav(path, label)) e.preventDefault();
            }}
            className="flex items-center gap-2 text-sm group p-1 rounded-md hover:bg-[hsla(var(--primary-hsl),0.2)] transition-colors"
          >
            <Tilt tiltMaxAngleX={6} tiltMaxAngleY={6} glareEnable={true} glareMaxOpacity={0.3}>
              {icon}
            </Tilt>
            <span className="text-foreground font-inter text-glow-primary">{label}</span>
          </Link>
        ))}
      </div>

      {/* Right Side: User Status, Auth/Wallet Button, Payment Button, Theme Toggle */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {userId && (
          <div className="hidden md:flex items-center gap-2 text-foreground font-inter text-sm md:text-base">
            <Tilt tiltMaxAngleX={6} tiltMaxAngleY={6} glareEnable={true} glareMaxOpacity={0.3}>
              <User className="text-[hsl(var(--primary))] w-6 h-6 animate-neon-pulse" aria-hidden="true" />
            </Tilt>
            <span className="truncate max-w-[100px] text-glow-primary">{displayName}</span>
            <Tilt tiltMaxAngleX={6} tiltMaxAngleY={6} glareEnable={true} glareMaxOpacity={0.3}>
              <Sparkles className="text-[hsl(var(--primary))] w-6 h-6 animate-neon-pulse" aria-hidden="true" />
            </Tilt>
            <span className="text-glow-primary">{jewelsBalance.toFixed(0)} JEWELS</span>
            {isPETMember && <span className="text-xs text-yellow-400 ml-1 text-glow-primary">PET Member</span>}
          </div>
        )}

        {/* Auth/Wallet Button */}
        <Dialog>
          <DialogTrigger asChild>
            <motion.button
              className="btn-secondary flex items-center gap-2 p-2 rounded-md"
              onClick={handleAuthWalletClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label={isConnected ? 'Wallet Connected' : 'Sign In / Connect Wallet'}
            >
              <Tilt tiltMaxAngleX={6} tiltMaxAngleY={6} glareEnable={true} glareMaxOpacity={0.3}>
                <Wallet className="w-6 h-6 text-[hsl(var(--primary))] group-hover:text-[hsl(var(--secondary))] animate-neon-pulse" />
              </Tilt>
              <span className="hidden md:block text-glow-primary">{isConnected && address ? `${address.slice(0, 4)}...${address.slice(-4)}` : 'Sign In / Connect'}</span>
            </motion.button>
          </DialogTrigger>
          <DialogContent className="tooltip max-w-md p-6">
            <p className="text-sm text-muted-foreground">Sign in or connect your wallet to access the PETverse.</p>
          </DialogContent>
        </Dialog>

        {/* Payment Button */}
        <Dialog>
          <DialogTrigger asChild>
            <motion.button
              className="btn-primary flex items-center gap-2 p-2 rounded-md"
              onClick={handlePaymentClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Make a Payment"
            >
              <Tilt tiltMaxAngleX={6} tiltMaxAngleY={6} glareEnable={true} glareMaxOpacity={0.3}>
                <Sparkles className="w-6 h-6 text-[hsl(var(--primary))] group-hover:text-[hsl(var(--secondary))] animate-neon-pulse" />
              </Tilt>
              <span className="hidden md:block text-glow-primary">Pay</span>
            </motion.button>
          </DialogTrigger>
          <DialogContent className="tooltip max-w-md p-6">
            <p className="text-sm text-muted-foreground">Access payment options to fund your cosmic adventures.</p>
          </DialogContent>
        </Dialog>

        {/* Theme Toggle */}
        <motion.button
          className="theme-toggle-btn p-2 rounded-md bg-[hsla(var(--primary-hsl),0.2)]"
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

