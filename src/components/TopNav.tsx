// src/components/TopNav.tsx
import { FC, useCallback, useState, useEffect } from 'react'; 
import { motion } from 'framer-motion';
import { Sparkles, Settings, HandCoins, Users, Package, ShoppingCart, LogOut, LoaderCircle, Gem, BellRing, User } from 'lucide-react'; 
import { Link, useLocation } from 'react-router-dom'; 
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAuthUserFirebase } from '@/hooks/useAuthUserFirebase'; // Fixed path
import { useAuthUserWagmi } from '@/hooks/useAuthUserWagmi'; // Fixed path
import { usePlayer } from '@/components/context/PlayerContext'; 
import { useModal } from '@/components/context/ModalContext'; 
import { cn } from '@/lib/utils';

// ────────────────────────────────────────────────────────────────
// MOCK API & CONFIGURATION (Status Check)
// ────────────────────────────────────────────────────────────────
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
  const { userId, playerData, authLoading, joulesBalance } = usePlayer();
  const { setShowMessage, setActiveModal } = useModal();
  const location = useLocation(); 

  const { disconnect } = useAuthUserWagmi();
  const { signOutUser, isAdmin } = useAuthUserFirebase({ disconnectWagmi: disconnect });

  const isLoggedIn = !!userId;
  const isUserAdmin = isLoggedIn && isAdmin();
  
  const [pendingTxCount, setPendingTxCount] = useState<number>(0);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

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

  const handleRestrictedNav = useCallback(( label: string) => {
    if (!isLoggedIn) {
      setShowMessage(`⚠️ ACCESS DENIED: LOGIN REQUIRED FOR ${label}`);
      setActiveModal('auth');
      return false;
    }
    return true;
  }, [isLoggedIn, setShowMessage, setActiveModal]);
  
  const handleAdminNav = useCallback((path: string) => {
    if (!isUserAdmin) {
      setShowMessage(`🚫 ROOT ACCESS REQUIRED FOR ${path}`);
      return false;
    }
    return true;
  }, [isUserAdmin, setShowMessage]);

  const profileImageUrl = playerData?.profilePictureUrl;
  const displayName = playerData?.username || (userId ? `OP-${userId.slice(0, 4)}` : 'GUEST');

  return (
    <motion.nav
      className="fixed top-0 left-0 w-full z-50 h-[70px] bg-black/90 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-4 font-inter"
      initial={{ y: -100 }} animate={{ y: 0 }} transition={{ duration: 0.5 }}
    >
      {/* 1. BRAND */}
      <div className="flex items-center gap-4">
        <Link to="/home" className="flex items-center gap-2 group">
            <Sparkles className="text-primary w-6 h-6 group-hover:animate-spin" />
            <span className="text-xl font-bold font-russo text-white tracking-tighter uppercase hidden sm:block group-hover:text-primary transition-colors">
              PETverse
            </span>
        </Link>

        {/* Desktop Nav Links (Text + Icon) */}
        <div className="hidden lg:flex items-center gap-1 ml-8">
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

      {/* 2. USER ACTIONS */}
      <div className="flex items-center gap-4">
        
        {/* Admin Bell */}
        {isLoggedIn && isUserAdmin && (
           <Link
            to="/admin"
            onClick={(e) => { if (!handleAdminNav("/admin")) e.preventDefault(); }}
            className={cn(
                "relative p-2 transition-colors",
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

        {/* User Stats (Desktop) */}
        {isLoggedIn && playerData && (
          <div className="hidden md:flex items-center gap-4 bg-white/5 px-4 py-1.5 border border-white/10">
            <div className="flex items-center gap-2">
                {profileImageUrl ? (
                <img src={profileImageUrl} alt="Avatar" className="w-6 h-6 object-cover border border-white/20" />
                ) : (
                <User className="text-primary w-4 h-4" />
                )}
                <span className="text-xs font-mono font-bold text-white uppercase max-w-[100px] truncate">
                {displayName}
                </span>
            </div>
            <div className="w-px h-4 bg-white/20"></div>
            <div className="flex items-center gap-1.5">
              <Gem className="text-primary w-3 h-3" />
              <span className="text-xs font-mono text-primary">{joulesBalance.toFixed(0)}</span>
            </div>
          </div>
        )}

        {/* Wallet & Auth */}
        {authLoading ? (
          <LoaderCircle className="w-6 h-6 animate-spin text-primary" />
        ) : (
          <div className="flex items-center gap-2">
            <ConnectButton
              chainStatus="none"
              showBalance={false}
              accountStatus={{
                smallScreen: 'avatar',
                largeScreen: 'full',
              }}
            />
            
            {isLoggedIn ? (
              <button 
                onClick={() => {
                  signOutUser(); 
                  setShowMessage("SYSTEM DISCONNECTED");
                }} 
                className="w-10 h-10 flex items-center justify-center border border-white/10 hover:bg-red-900/20 hover:border-red-500 hover:text-red-500 transition-all text-white/50"
                title="Disconnect" 
              >
                <LogOut className="w-4 h-4" />
              </button>
            ) : (
              <button 
                onClick={() => setActiveModal('auth')}
                className="btn-primary h-9 px-4 text-xs" 
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