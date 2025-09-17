// src/components/TopNav.tsx
import { FC, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, User, Settings, Star, HandCoins, Users, Package, ShoppingCart, LogOut, LoaderCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import Tilt from 'react-parallax-tilt';
import { ConnectButton } from '@rainbow-me/rainbowkit'; // ✅ ADDED: ConnectButton import
import { TopNavProps } from '../lib/types';
import { useAuthUserFirebase } from '../hooks/useAuthUserFirebase';
import { useAuthUserWagmi } from '../hooks/useAuthUserWagmi';

const navItems = [
  { path: '/home', label: 'Home', icon: <Sparkles className="w-5 h-5" /> },
  { path: '/inventory', label: 'Inventory', icon: <Package className="w-5 h-5" /> },
  { path: '/shop', label: 'Shop', icon: <ShoppingCart className="w-5 h-5" /> },
  { path: '/vault', label: 'Vault', icon: <HandCoins className="w-5 h-5" /> },
  { path: '/community', label: 'Community', icon: <Users className="w-5 h-5" /> },
  { path: '/membership', label: 'Membership', icon: <Star className="w-5 h-5" /> },
  { path: '/admin', label: 'Admin', icon: <Settings className="w-5 h-5" /> },
];

const TopNav: FC<TopNavProps> = ({
  userId,
  playerData,
  authLoading,
  joulesBalance,
  setShowMessage,
  setActiveAuthModal,
}) => {
  // ❌ REMOVED: useTheme hook is no longer needed
  const { disconnect } = useAuthUserWagmi();
  const { signOutUser } = useAuthUserFirebase({ disconnectWagmi: disconnect });

  const isLoggedIn = !!userId;
  const displayName = playerData?.username || playerData?.email?.split('@')[0] || userId?.slice(0, 6) + '...';

  const handleRestrictedNav = useCallback((path: string, label: string) => {
    if (!isLoggedIn && path === '/admin') {
      setShowMessage(`⚠️ Please sign in to access the ${label} page.`);
      setActiveAuthModal('auth');
      return false;
    }
    return true;
  }, [isLoggedIn, setShowMessage, setActiveAuthModal]);

  return (
    <motion.nav
      className="fixed top-0 left-0 w-full z-50 py-2 px-4 flex items-center justify-between glass-dark"
      initial={{ y: -100 }} animate={{ y: 0 }} transition={{ duration: 0.5 }}
    >
      <div className="flex items-center gap-2">
        <Tilt tiltMaxAngleX={8} tiltMaxAngleY={8}><Sparkles className="text-primary w-6 h-6 animate-neon-pulse" /></Tilt>
        <span className="text-xl font-bold text-foreground font-russo text-glow-primary hidden sm:block">SWYTCH2</span>
      </div>

      <div className="hidden md:flex flex-grow justify-center items-center gap-4">
        {navItems.map(({ path, label, icon }) => (
          <Link
            key={path}
            to={path}
            onClick={(e) => { if (!handleRestrictedNav(path, label)) e.preventDefault(); }}
            className="flex items-center gap-2 text-sm text-muted-foreground p-1 rounded-md hover:text-primary transition-colors"
            title={label}
          >
            <Tilt tiltMaxAngleX={6} tiltMaxAngleY={6}>{icon}</Tilt>
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {isLoggedIn && playerData && (
          <div className="hidden lg:flex items-center gap-2 text-foreground font-inter text-sm">
            <User className="text-primary w-5 h-5" />
            <span className="truncate max-w-[100px] text-glow-primary" title={playerData.email || userId!}>{displayName}</span>
            <Sparkles className="text-yellow-400 w-5 h-5 ml-2" />
            <span className="text-glow-primary">{joulesBalance.toFixed(0)}</span>
          </div>
        )}

        {authLoading ? (
          <LoaderCircle className="w-6 h-6 animate-spin text-primary" />
        ) : (
          <>
            {/* ✅ REPLACED: Theme toggle is replaced with the ConnectButton */}
            <ConnectButton
              chainStatus="icon"
              showBalance={false}
              accountStatus={{
                smallScreen: 'avatar',
                largeScreen: 'full',
              }}
            />
            {isLoggedIn && (
              <motion.button onClick={() => {signOutUser(); setShowMessage("👋 You have been signed out.");}} className="btn-secondary p-2" title="Sign Out" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <LogOut className="w-5 h-5 text-destructive" />
              </motion.button>
            )}
          </>
        )}
      </div>
    </motion.nav>
  );
};

export default TopNav;