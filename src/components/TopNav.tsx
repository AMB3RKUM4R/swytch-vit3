// src/components/TopNav.tsx
import { FC, useCallback, useState, useEffect } from 'react'; 
import { motion } from 'framer-motion';
import { Sparkles, Settings, User, LogOut, LoaderCircle, ShoppingCart, Package, HandCoins, Users } from 'lucide-react'; 
import { Link, useLocation } from 'react-router-dom'; 
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAuthUserFirebase } from '@/hooks/useAuthUserFirebase'; 
import { useAuthUserWagmi } from '@/hooks/useAuthUserWagmi'; 
import { usePlayer } from '@/components/context/PlayerContext'; 
import { useModal } from '@/components/context/ModalContext'; 
import CurrencyHUD from '@/components/CurrencyHUD'; 
import { cn } from '@/lib/utils';

// MOCK STATUS CHECK
const MOCK_FETCH_PENDING_TX = async (): Promise<number> => {
    return new Promise(resolve => setTimeout(() => resolve(
        (localStorage.getItem('isAdmin') === 'true') ? 3 : 0
    ), 500));
};

const navItems = [
  { path: '/home', label: 'FEED', icon: <Sparkles className="w-5 h-5" /> },
  { path: '/inventory', label: 'ARMORY', icon: <Package className="w-5 h-5" /> },
  { path: '/shop', label: 'MARKET', icon: <ShoppingCart className="w-5 h-5" /> },
  { path: '/vault', label: 'VAULT', icon: <HandCoins className="w-5 h-5" /> },
  { path: '/community', label: 'NET', icon: <Users className="w-5 h-5" /> },
];

const TopNav: FC = () => {
  const { userId, playerData, authLoading } = usePlayer();
  const { setShowMessage, setActiveModal } = useModal();
  const location = useLocation(); 

  const { disconnect } = useAuthUserWagmi();
  const { signOutUser, isAdmin } = useAuthUserFirebase({ disconnectWagmi: disconnect });

  const isLoggedIn = !!userId;
  const isUserAdmin = isLoggedIn && isAdmin();
  
  const [pendingTxCount, setPendingTxCount] = useState<number>(0);
  const [, setIsCheckingStatus] = useState(false);

  // Admin Check Logic
  const checkPendingTxStatus = useCallback(async () => {
      if (!isUserAdmin) {
          setPendingTxCount(0);
          return;
      }
      setIsCheckingStatus(true);
      try {
          const count = await MOCK_FETCH_PENDING_TX();
          setPendingTxCount(count);
      } catch (error) {
          console.error("Failed to fetch pending transaction count:", error);
          setPendingTxCount(0);
      } finally {
          setIsCheckingStatus(false);
      }
  }, [isUserAdmin]);

  useEffect(() => {
      checkPendingTxStatus();
      const interval = setInterval(checkPendingTxStatus, 30000); 
      return () => clearInterval(interval);
  }, [checkPendingTxStatus]);

  const handleRestrictedNav = useCallback((label: string) => {
    if (!isLoggedIn) {
      setShowMessage(`⚠️ LOGIN REQUIRED: ${label}`);
      setActiveModal('auth');
      return false;
    }
    return true;
  }, [isLoggedIn, setShowMessage, setActiveModal]);
  
  const handleAdminNav = useCallback(() => {
    if (!isUserAdmin) {
      setShowMessage(`🚫 ROOT ACCESS REQUIRED`);
      return false;
    }
    return true;
  }, [isUserAdmin, setShowMessage]);

  const profileImageUrl = playerData?.profilePictureUrl;
  const displayName = playerData?.username || (userId ? `OP-${userId.slice(0, 4)}` : 'GUEST');

  return (
    <motion.nav
      className="fixed top-0 left-0 w-full z-50 h-[70px] bg-black/95 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-3 md:px-4 font-inter"
      initial={{ y: -100 }} animate={{ y: 0 }} transition={{ duration: 0.5 }}
    >
      {/* 1. LEFT SIDE: BRAND */}
      <div className="flex items-center gap-4">
        <Link to="/home" className="flex items-center gap-2 group">
            <Sparkles className="text-primary w-6 h-6 group-hover:animate-spin" />
            <span className="text-lg md:text-xl font-bold font-russo text-white tracking-tighter uppercase hidden sm:block group-hover:text-primary transition-colors">
              PETverse
            </span>
        </Link>

        {/* Desktop Nav Links - FIXED: Changed lg:flex to md:flex and added responsive margin */}
        <div className="hidden md:flex items-center gap-1 ml-4 lg:ml-8">
            {navItems.map(({ path, label, icon }) => (
            <Link
                key={path}
                to={path}
                onClick={(e) => { if (!handleRestrictedNav(label)) e.preventDefault(); }}
                className={cn(
                    "flex items-center gap-2 text-xs font-bold px-3 py-2 uppercase transition-all",
                    location.pathname === path 
                        ? 'text-primary border-b-2 border-primary' 
                        : 'text-gray-500 hover:text-white hover:bg-white/5'
                )}
            >
                {icon}
                <span>{label}</span>
            </Link>
            ))}
        </div>
      </div>

      {/* 2. RIGHT SIDE: USER INFO & ACTIONS */}
      <div className="flex items-center gap-2 md:gap-4">
        
        {/* Admin Alert Bell */}
        {isLoggedIn && isUserAdmin && (
           <Link
            to="/admin"
            onClick={(e) => { if (!handleAdminNav()) e.preventDefault(); }}
            className={cn(
                "relative p-2 transition-colors hidden sm:block",
                location.pathname === '/admin' ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
            )}
            title="Command Center"
          >
            <Settings className="w-5 h-5" />
            {pendingTxCount > 0 && (
                <span className="absolute top-0 right-0 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
            )}
          </Link>
        )}

        {/* --- USER STATS & CURRENCY HUD --- */}
        {isLoggedIn && playerData && (
          <div className="flex items-center gap-3">
            
            {/* 1. Currency HUD */}
            <CurrencyHUD />

            {/* 2. User Identity */}
            <div className="hidden md:flex items-center gap-2 bg-white/5 px-3 py-1.5 border border-white/10 rounded-full">
                {profileImageUrl ? (
                  <img src={profileImageUrl} alt="Avatar" className="w-5 h-5 object-cover rounded-full border border-white/20" />
                ) : (
                  <User className="text-primary w-4 h-4" />
                )}
                <span className="text-xs font-mono font-bold text-white uppercase max-w-[100px] truncate">
                  {displayName}
                </span>
            </div>
          </div>
        )}

        {/* Wallet / Auth Actions */}
        {authLoading ? (
          <LoaderCircle className="w-5 h-5 animate-spin text-primary" />
        ) : (
          <div className="flex items-center gap-2">
            <div className="hidden sm:block">
                <ConnectButton
                chainStatus="none"
                showBalance={false}
                accountStatus="avatar"
                />
            </div>
            
            {isLoggedIn ? (
              <button 
                onClick={() => {
                  signOutUser(); 
                  setShowMessage("SYSTEM DISCONNECTED");
                }} 
                className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center border border-white/10 hover:bg-red-900/20 hover:border-red-500 hover:text-red-500 transition-all text-white/50 rounded-md"
                title="Disconnect" 
              >
                <LogOut className="w-4 h-4" />
              </button>
            ) : (
              <button 
                onClick={() => setActiveModal('auth')}
                className="btn-primary h-8 px-3 text-[10px] md:text-xs font-bold" 
              >
                CONNECT
              </button>
            )}
          </div>
        )}
      </div>
    </motion.nav>
  );
};

export default TopNav;