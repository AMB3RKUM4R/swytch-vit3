// src/components/TopNav.tsx
import { FC, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, User, Settings, Star, HandCoins, Users, Package, ShoppingCart, LogOut, LoaderCircle, Gem } from 'lucide-react';
import { Link } from 'react-router-dom';
import Tilt from 'react-parallax-tilt';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAuthUserFirebase } from '../hooks/useAuthUserFirebase';
import { useAuthUserWagmi } from '../hooks/useAuthUserWagmi';
import { usePlayer } from '@/components/context/PlayerContext'; // Import main hook
import { useModal } from '@/components/context/ModalContext'; // Import modal hook

const navItems = [
  { path: '/home', label: 'Home', icon: <Sparkles className="w-5 h-5" /> },
  { path: '/inventory', label: 'Inventory', icon: <Package className="w-5 h-5" /> },
  { path: '/shop', label: 'Shop', icon: <ShoppingCart className="w-5 h-5" /> },
  { path: '/vault', label: 'Vault', icon: <HandCoins className="w-5 h-5" /> },
  { path: '/community', label: 'Community', icon: <Users className="w-5 h-5" /> },
  { path: '/membership', label: 'Membership', icon: <Star className="w-5 h-5" /> },
];

// This component is now self-sufficient and requires no props.
const TopNav: FC = () => {
  // Get all data from our new contexts
  const { userId, playerData, authLoading, joulesBalance } = usePlayer();
  const { setShowMessage, setActiveModal } = useModal();

  const { disconnect } = useAuthUserWagmi();
  // We pass disconnectWagmi to ensure wallet disconnects on Firebase sign out
  const { signOutUser, isAdmin } = useAuthUserFirebase({ disconnectWagmi: disconnect });

  const isLoggedIn = !!userId;
  // Use new 2D avatar URL if it exists, fallback to User icon
  const profileImageUrl = playerData?.profilePictureUrl;
  const displayName = playerData?.username || (userId ? `${userId.slice(0, 6)}...` : 'Guest');

  const handleRestrictedNav = useCallback(( label: string) => {
    if (!isLoggedIn) {
      setShowMessage(`⚠️ Please sign in to access the ${label} page.`);
      setActiveModal('auth');
      return false;
    }
    return true;
  }, [isLoggedIn, setShowMessage, setActiveModal]);
  
  const handleAdminNav = useCallback((path: string) => {
    if (!isAdmin()) {
      setShowMessage(`🚫 Access to ${path} is restricted to Admins.`);
      return false;
    }
    return true;
  }, [isAdmin, setShowMessage]);


  return (
    <motion.nav
      className="fixed top-0 left-0 w-full z-50 py-3 px-4 md:px-6 flex items-center justify-between glass-dark font-inter"
      initial={{ y: -100 }} animate={{ y: 0 }} transition={{ duration: 0.5 }}
    >
      {/* Logo/Brand */}
      <div className="flex items-center gap-2">
        <Link to="/home" className="flex items-center gap-2">
          <Tilt tiltMaxAngleX={8} tiltMaxAngleY={8}>
            <Sparkles className="text-primary w-6 h-6 md:w-7 md:h-7 text-glow-primary" />
          </Tilt>
          <span className="text-xl md:text-2xl font-bold text-foreground font-poppins hidden sm:block">
            PETverse
          </span>
        </Link>
      </div>

      {/* Center Nav Links */}
      <div className="hidden md:flex flex-grow justify-center items-center gap-4">
        {navItems.map(({ path, label, icon }) => (
          <Link
            key={path}
            to={path}
            onClick={(e) => { if (!handleRestrictedNav(label)) e.preventDefault(); }}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground p-2 rounded-md hover:text-primary transition-colors"
            title={label}
          >
            {icon}
            <span className="hidden lg:block">{label}</span>
          </Link>
        ))}
        {/* Show Admin link only if user is admin */}
        {isLoggedIn && isAdmin() && (
           <Link
            to="/admin"
            onClick={(e) => { if (!handleAdminNav("/admin")) e.preventDefault(); }}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground p-2 rounded-md hover:text-destructive transition-colors"
            title="Admin"
          >
            <Settings className="w-5 h-5" />
            <span className="hidden lg:block">Admin</span>
          </Link>
        )}
      </div>

      {/* Right-side User Area */}
      <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
        {isLoggedIn && playerData && (
          <div className="hidden lg:flex items-center gap-3 bg-black/20 p-2 rounded-md border border-border">
            {/* 2D Avatar */}
            {profileImageUrl ? (
              <img src={profileImageUrl} alt="Avatar" className="w-6 h-6 rounded-full object-cover" />
            ) : (
              <User className="text-primary w-5 h-5" />
            )}
            <span className="text-sm font-medium text-foreground truncate max-w-[100px]" title={playerData.email || userId!}>
              {displayName}
            </span>
            {/* JOULES Balance */}
            <div className="flex items-center gap-1.5" title="JOULES Balance">
              <Gem className="text-yellow-400 w-5 h-5" />
              <span className="text-sm font-bold text-foreground">{joulesBalance.toFixed(0)}</span>
            </div>
          </div>
        )}

        {authLoading ? (
          <LoaderCircle className="w-6 h-6 animate-spin text-primary" />
        ) : (
          <>
            {/* Wallet Connect Button */}
            <ConnectButton
              chainStatus="icon"
              showBalance={false}
              accountStatus={{
                smallScreen: 'avatar',
                largeScreen: 'full',
              }}
            />
            {/* Sign Out Button */}
            {isLoggedIn && (
              <motion.button 
                onClick={() => {
                  signOutUser(); 
                  setShowMessage("👋 You have been signed out.");
                }} 
                className="btn-secondary p-2 h-10 w-10 hidden md:flex" 
                title="Sign Out" 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
              >
                <LogOut className="w-5 h-5 text-destructive" />
              </motion.button>
            )}
            {/* Sign In Button (for mobile, if not logged in) */}
            {!isLoggedIn && (
              <motion.button 
                onClick={() => setActiveModal('auth')}
                className="btn-primary p-2 h-10 w-10 md:hidden" 
                title="Sign In"
              >
                <User className="w-5 h-5" />
              </motion.button>
            )}
          </>
        )}
      </div>
    </motion.nav>
  );
};

export default TopNav;

