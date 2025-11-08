// src/components/TopNav.tsx
import { FC, useCallback, useState, useEffect } from 'react'; 
import { motion } from 'framer-motion';
import { Sparkles, User, Settings, Star, HandCoins, Users, Package, ShoppingCart, LogOut, LoaderCircle, Gem, BellRing } from 'lucide-react'; 
import { Link, useLocation } from 'react-router-dom'; 
import Tilt from 'react-parallax-tilt';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAuthUserFirebase } from '../hooks/useAuthUserFirebase';
import { useAuthUserWagmi } from '../hooks/useAuthUserWagmi';
import { usePlayer } from '@/components/context/PlayerContext'; 
import { useModal } from '@/components/context/ModalContext'; 
import { cn } from '@/lib/utils';

// ────────────────────────────────────────────────────────────────
// MOCK API & CONFIGURATION (for the status check)
// ────────────────────────────────────────────────────────────────
// NOTE: You would replace this mock fetch with a real Cloud Function call
// that queries your 'Transactions' collection where status='pending' AND 
// transactionType is one of your manual types (deposit_admin_approved, etc.)
const MOCK_FETCH_PENDING_TX = async (): Promise<number> => {
    // In a real application, this would call an authenticated Cloud Function:
    // const response = await fetch(`${FUNCTIONS_BASE_URL}/getPendingTransactions?type=manual`);
    // const data = await response.json();
    // return data.count;
    
    // MOCK: Return 3 if the user is an admin, 0 otherwise.
    return new Promise(resolve => setTimeout(() => resolve(
        (localStorage.getItem('isAdmin') === 'true') ? 3 : 0
    ), 500));
};
// ────────────────────────────────────────────────────────────────

const navItems = [
  { path: '/home', label: 'Home', icon: <Sparkles className="w-5 h-5" /> },
  { path: '/inventory', label: 'Inventory', icon: <Package className="w-5 h-5" /> },
  { path: '/shop', label: 'Shop', icon: <ShoppingCart className="w-5 h-5" /> },
  { path: '/vault', label: 'Vault', icon: <HandCoins className="w-5 h-5" /> },
  { path: '/community', label: 'Community', icon: <Users className="w-5 h-5" /> },
  { path: '/membership', label: 'Membership', icon: <Star className="w-5 h-5" /> },
];

const TopNav: FC = () => {
  const { userId, playerData, authLoading, joulesBalance } = usePlayer();
  const { setShowMessage, setActiveModal } = useModal();
  const location = useLocation(); 

  const { disconnect } = useAuthUserWagmi();
  const { signOutUser, isAdmin } = useAuthUserFirebase({ disconnectWagmi: disconnect });

  const isLoggedIn = !!userId;
  const isUserAdmin = isLoggedIn && isAdmin();
  
  // --- Payment Status State ---
  const [pendingTxCount, setPendingTxCount] = useState<number>(0);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  // Function to fetch pending transaction count (Only runs for admins)
  const checkPendingTxStatus = useCallback(async () => {
      if (!isUserAdmin) {
          setPendingTxCount(0);
          return;
      }

      setIsCheckingStatus(true);
      try {
          // NOTE: Replace MOCK_FETCH_PENDING_TX with your real API call
          const count = await MOCK_FETCH_PENDING_TX();
          setPendingTxCount(count);
      } catch (error) {
          console.error("Failed to fetch pending transaction count:", error);
          setPendingTxCount(0); // Assume 0 on error
      } finally {
          setIsCheckingStatus(false);
      }
  }, [isUserAdmin]);

  // Effect to check status on load and every time the user state changes
  useEffect(() => {
      checkPendingTxStatus();

      // Optionally poll for updates if status is critical (e.g., every 30 seconds)
      const interval = setInterval(checkPendingTxStatus, 30000); 

      return () => clearInterval(interval);
  }, [checkPendingTxStatus]);


  // --- Nav Handlers (Unchanged) ---
  const handleRestrictedNav = useCallback(( label: string) => {
    if (!isLoggedIn) {
      setShowMessage(`⚠️ Please sign in to access the ${label} page.`);
      setActiveModal('auth');
      return false;
    }
    return true;
  }, [isLoggedIn, setShowMessage, setActiveModal]);
  
  const handleAdminNav = useCallback((path: string) => {
    if (!isUserAdmin) {
      setShowMessage(`🚫 Access to ${path} is restricted to Admins.`);
      return false;
    }
    return true;
  }, [isUserAdmin, setShowMessage]);


  const profileImageUrl = playerData?.profilePictureUrl;
  const displayName = playerData?.username || (userId ? `${userId.slice(0, 6)}...` : 'Guest');

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
            className={cn(
                "flex items-center gap-2 text-sm font-medium p-2 rounded-md transition-colors",
                location.pathname === path ? 'text-primary' : 'text-muted-foreground hover:text-primary'
            )}
            title={label}
          >
            {icon}
            <span className="hidden lg:block">{label}</span>
          </Link>
        ))}
        
        {/* Admin Link and Payment Status Alert */}
        {isLoggedIn && isUserAdmin && (
           <Link
            to="/admin"
            onClick={(e) => { if (!handleAdminNav("/admin")) e.preventDefault(); }}
            className={cn(
                "flex items-center gap-2 text-sm font-medium p-2 rounded-md transition-colors relative",
                location.pathname === '/admin' ? 'text-destructive' : 'text-muted-foreground hover:text-destructive',
                pendingTxCount > 0 && 'font-bold text-destructive hover:text-destructive/80' // Highlight if there are pending transactions
            )}
            title="Admin Command Center"
          >
            <Settings className="w-5 h-5" />
            <span className="hidden lg:block">Admin</span>
            
            {/* Payment Status Badge */}
            {pendingTxCount > 0 && (
                <motion.div 
                    className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-yellow-500 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold text-black border border-background animate-pulse"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    title={`${pendingTxCount} pending payment approvals`}
                >
                    {pendingTxCount}
                </motion.div>
            )}
            {/* Status Indicator when checking */}
            {isCheckingStatus && pendingTxCount === 0 && (
                <LoaderCircle className="w-3 h-3 animate-spin text-muted-foreground absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2" />
            )}
          </Link>
        )}
      </div>

      {/* Right-side User Area */}
      <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
        {isLoggedIn && playerData && (
          <div className="hidden lg:flex items-center gap-3 bg-black/20 p-2 rounded-md border border-border">
            {/* Profile Info */}
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
        
        {/* Wallet Connection Status for Mobile/Small Screens */}
        <div className='flex items-center'>
            {isLoggedIn && isUserAdmin && pendingTxCount > 0 && (
                <Link
                    to="/admin"
                    title={`${pendingTxCount} pending payment approvals`}
                    className="md:hidden relative p-1.5 rounded-full mr-2 bg-yellow-500/10 hover:bg-yellow-500/20 transition-colors"
                    onClick={(e) => { if (!handleAdminNav("/admin")) e.preventDefault(); }}
                >
                    <BellRing className="w-6 h-6 text-yellow-500" />
                    <span className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full w-3 h-3 border border-background animate-ping" />
                </Link>
            )}
        </div>


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
            {/* Sign Out Button (Desktop) */}
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
            {/* Sign In Button (Mobile) */}
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