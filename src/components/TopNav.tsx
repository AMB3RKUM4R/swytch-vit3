// src/components/TopNav.tsx
import { FC, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Sparkles, User, Settings, Star, HandCoins, Users, Package, ShoppingCart, LogOut } from 'lucide-react';
import { useTheme } from '../components/context/ThemeContext';
import { TopNavProps } from '../lib/types';
import { useAuthUserFirebase } from '../hooks/useAuthUserFirebase';
import { useAuthUserWagmi } from '../hooks/useAuthUserWagmi';
import { Link } from 'react-router-dom';
import Tilt from 'react-parallax-tilt';
import { cn } from '@/lib/utils';
import { useModal } from './context/ModalContext';

const navItems = [
  { path: '/home', label: 'Home', icon: <Sparkles className="w-6 h-6" /> },
  { path: '/inventory', label: 'Inventory', icon: <Package className="w-6 h-6" /> },
  { path: '/shop', label: 'Shop', icon: <ShoppingCart className="w-6 h-6" /> },
  { path: '/vault', label: 'Vault', icon: <HandCoins className="w-6 h-6" /> },
  { path: '/community', label: 'Community', icon: <Users className="w-6 h-6" /> },
  { path: '/membership', label: 'Membership', icon: <Star className="w-6 h-6" /> },
  { path: '/admin', label: 'Admin', icon: <Settings className="w-6 h-6" /> },
];

const TopNav: FC<TopNavProps> = ({
  jewelsBalance,
  setShowMessage,
  setActiveAuthModal,
}) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { user, signOutUser } = useAuthUserFirebase();
  const { isConnected, address, disconnect } = useAuthUserWagmi();
  const { setActiveModal } = useModal();

  const isFirebaseLoggedIn = !!user;
  const isWalletConnected = isConnected;
  const isLoggedIn = isFirebaseLoggedIn || isWalletConnected;

  const handleRestrictedNav = useCallback((path: string, label: string) => {
    const restrictedPaths = [
      '/home', '/vault', '/shop', '/community',
      '/membership', '/inventory', '/admin'
    ];
    if (!isLoggedIn && restrictedPaths.includes(path)) {
      setShowMessage(`⚠️ Please sign in to access ${label}.`);
      setActiveAuthModal('auth');
      return false;
    }
    setShowMessage(`➡️ Navigating to ${label}!`);
    return true;
  }, [isLoggedIn, setShowMessage, setActiveAuthModal]);


  return (
    <motion.nav
      className={cn(`fixed top-0 left-0 w-full z-50 py-2 px-2 md:px-4 flex items-center justify-between holographic-card animated-aura transition-all duration-300`, isDarkMode ? 'glass-dark' : 'glass-light')}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{ background: 'linear-gradient(145deg, rgba(0,0,0,0.8), rgba(50,50,100,0.5))' }}
    >
      <div className="flex items-center gap-2">
        <Tilt tiltMaxAngleX={8} tiltMaxAngleY={8} glareEnable={true} glareMaxOpacity={0.4}>
          <Sparkles className="text-[hsl(var(--primary))] w-6 h-6 animate-neon-pulse" aria-hidden="true" />
        </Tilt>
        <span className="text-xl font-bold text-foreground font-russo text-glow-primary hidden sm:block">SWYTCH</span>
      </div>

      <div className="hidden md:flex flex-grow justify-center items-center gap-4 px-2 md:px-0">
        {navItems.map(({ path, label, icon }) => (
          <Link
            key={path}
            to={path}
            onClick={(e) => {
              if (!handleRestrictedNav(path, label)) e.preventDefault();
            }}
            className="flex items-center gap-2 text-sm group p-1 rounded-md hover:bg-[hsla(var(--primary-hsl),0.2)] transition-colors"
            title={label}
          >
            <Tilt tiltMaxAngleX={6} tiltMaxAngleY={6} glareEnable={true} glareMaxOpacity={0.3}>
              {icon}
            </Tilt>
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {isLoggedIn && (
          <div className="hidden md:flex items-center gap-2 text-foreground font-inter text-sm md:text-base">
            <Tilt tiltMaxAngleX={6} tiltMaxAngleY={6} glareEnable={true} glareMaxOpacity={0.3}>
              <User className="text-[hsl(var(--primary))] w-6 h-6 animate-neon-pulse" aria-hidden="true" />
            </Tilt>
            <span className="truncate max-w-[100px] text-glow-primary" title={user?.email || address}>{user?.email?.split('@')[0] || address?.slice(0, 4) + '...' + address?.slice(-4)}</span>
            <Tilt tiltMaxAngleX={6} tiltMaxAngleY={6} glareEnable={true} glareMaxOpacity={0.3}>
              <Sparkles className="text-[hsl(var(--primary))] w-6 h-6 animate-neon-pulse" aria-hidden="true" />
            </Tilt>
            <span className="text-glow-primary">{jewelsBalance.toFixed(0)} JOULES</span>
          </div>
        )}

        <motion.button
          className="btn-secondary flex items-center gap-2 p-2 rounded-md"
          onClick={() => {
            if (isFirebaseLoggedIn) {
              signOutUser();
            } else if (isWalletConnected) {
              disconnect();
            } else {
              setActiveModal('auth');
            }
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title={isFirebaseLoggedIn || isWalletConnected ? 'Sign Out' : 'Sign In'}
        >
          <Tilt tiltMaxAngleX={6} tiltMaxAngleY={6} glareEnable={true} glareMaxOpacity={0.4}>
            {isFirebaseLoggedIn || isWalletConnected ? <LogOut className="w-6 h-6 text-destructive" /> : <Wallet className="w-6 h-6 text-[hsl(var(--primary))]" />}
          </Tilt>
          <span className="hidden md:block text-glow-primary">{isFirebaseLoggedIn || isWalletConnected ? 'Sign Out' : 'Sign In'}</span>
        </motion.button>
        
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