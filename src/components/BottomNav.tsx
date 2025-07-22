// src/components/BottomNav.tsx
import { FC, useState, useEffect } from 'react';
import {
  Home, Star, LogOut, User, Gamepad2,
  Car, ShoppingBag, Users, ShieldCheck, LandPlot, Sparkles // Keep Sparkles for MessageDisplay
} from 'lucide-react'; // Removed unused specific game icons
import { signOut } from 'firebase/auth';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from './context/ThemeContext';
import { useModal } from './context/ModalContext';
import { auth } from '@/lib/firebaseConfig';
import { BottomNavProps } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';

// Define navigation items with Lucide icons (fewer, core pages)
const navItems = [
  { path: '/home', label: 'Home', icon: <Home className="w-7 h-7" /> },
  { path: '/membership', label: 'Membership', icon: <Star className="w-7 h-7" /> },
  { path: '/vault', label: 'Vault', icon: <LandPlot className="w-7 h-7" /> },
  { path: '/community', label: 'Community', icon: <Users className="w-7 h-7" /> },
  // Shop, Market, Benefits, Games are now accessed via TopNav or specific sections/buttons
];


const BottomNav: FC<BottomNavProps> = ({ userId, setShowMessage, globalMessage }) => {
  const [isGamesOpen, setIsGamesOpen] = useState(false);
  const { isDarkMode } = useTheme();
  const { setActiveModal, setShowMessage: setGlobalMessageInContext } = useModal();
  const location = useLocation();
  const navigate = useNavigate();

  const [hoverMessage, setHoverMessage] = useState<string | null>(null);
  const [messageTimeoutId, setMessageTimeoutId] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsGamesOpen(false);
    if (messageTimeoutId) {
      clearTimeout(messageTimeoutId);
      setMessageTimeoutId(null);
    }
    setHoverMessage(null);
  }, [location.pathname, messageTimeoutId]);

  const handleSignOut = async () => {
    if (!auth.currentUser) {
      setShowMessage('⚠️ Not signed in!');
      setActiveModal('auth');
      return;
    }
    try {
      await signOut(auth);
      setShowMessage('✅ Signed out successfully!');
      navigate('/');
    } catch (err) {
      console.error('Sign-out error:', err);
      setShowMessage('⚠️ Failed to sign out.');
      setActiveModal('error');
    }
  };

  const handleRestrictedNav = (path: string, label: string) => {
    const restrictedPaths = ['/vault', '/membership', '/shop', '/market', '/inventory', '/marketplace', '/games', '/community']; // Include community if it has restricted features
    if (!userId && restrictedPaths.includes(path)) {
      setShowMessage(`⚠️ Please sign in to access ${label}.`);
      setActiveModal('auth');
      return false;
    }
    setShowMessage(`➡️ Navigating to ${label}!`);
    return true;
  };

  const handleNavItemHover = (label: string) => {
    if (messageTimeoutId) {
      clearTimeout(messageTimeoutId);
    }
    setHoverMessage(`Go to ${label}`);
  };

  const handleNavItemLeave = () => {
    const timeout = setTimeout(() => {
      setHoverMessage(null);
    }, 500);
    setMessageTimeoutId(timeout);
  };

  // Effect to automatically clear the global message from main.tsx after a delay
  useEffect(() => {
    if (globalMessage) {
      const timer = setTimeout(() => {
        setGlobalMessageInContext('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [globalMessage, setGlobalMessageInContext]);


  return (
    <nav
      className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-xl backdrop-blur-md border border-border
        shadow-xl transition-all duration-300 ease-out max-w-lg w-[90vw]
        flex justify-between items-center gap-4 ${isDarkMode ? 'glass-dark' : 'glass-light'}`}
    >
      {/* Message Display integrated directly into BottomNav */}
      <AnimatePresence>
        {(globalMessage || hoverMessage) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: -50 }} // Position above the nav bar
            exit={{ opacity: 0, y: 10 }}
            className={`absolute left-1/2 transform -translate-x-1/2 p-2 rounded-lg shadow-lg text-sm font-inter text-center whitespace-nowrap
                        ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} border border-primary`}
            style={{ bottom: 'calc(100% + 10px)' }} // Position above the nav
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
              <p className="text-white font-bold font-poppins">{globalMessage || hoverMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>


      {navItems.map(({ path, label, icon }) => (
        <Link
          to={path}
          key={path}
          onClick={(e) => {
            if (!handleRestrictedNav(path, label)) {
              e.preventDefault();
            }
          }}
          onMouseEnter={() => handleNavItemHover(label)}
          onMouseLeave={handleNavItemLeave}
          className="flex flex-col items-center text-sm group"
        >
          <div className="transition-transform duration-150 group-hover:scale-125 group-hover:-translate-y-1">
            {icon}
          </div>
          <span className="text-xs mt-1 font-inter text-muted">{label}</span>
        </Link>
      ))}

      {/* Games & Other Pages Dropdown */}
      <button
        onClick={() => setIsGamesOpen(!isGamesOpen)}
        onMouseEnter={() => handleNavItemHover('More')}
        onMouseLeave={handleNavItemLeave}
        className="flex flex-col items-center group"
        aria-label="More Navigation"
      >
        <div className="transition-transform duration-150 group-hover:scale-125 group-hover:-translate-y-1">
          <Gamepad2 className="w-7 h-7 text-primary" /> {/* Using Gamepad2 as a generic "More" icon */}
        </div>
        <span className="text-xs mt-1 font-inter text-muted">More</span>
      </button>

      {isGamesOpen && (
        <div
          className={`absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-background border border-border p-3 rounded-lg shadow-xl
            w-[90vw] max-w-md grid grid-cols-2 gap-2 ${isDarkMode ? 'glass-dark' : 'glass-light'}`}
        >
          {/* Links previously in BottomNav, now in "More" dropdown */}
          <Link
            to="/shop"
            className="flex items-center gap-2 text-sm hover:text-secondary transition-all rounded px-2 py-1"
            onClick={(e) => { if (!handleRestrictedNav('/shop', 'Shop')) { e.preventDefault(); } else { setIsGamesOpen(false); } }}
          >
            <ShoppingBag className="w-5 h-5" /> Shop
          </Link>
          <Link
            to="/market"
            className="flex items-center gap-2 text-sm hover:text-secondary transition-all rounded px-2 py-1"
            onClick={(e) => { if (!handleRestrictedNav('/market', 'Market')) { e.preventDefault(); } else { setIsGamesOpen(false); } }}
          >
            <Car className="w-5 h-5" /> Market
          </Link>
          <Link
            to="/benefits"
            className="flex items-center gap-2 text-sm hover:text-secondary transition-all rounded px-2 py-1"
            onClick={(e) => { if (!handleRestrictedNav('/benefits', 'Benefits')) { e.preventDefault(); } else { setIsGamesOpen(false); } }}
          >
            <ShieldCheck className="w-5 h-5" /> Benefits
          </Link>
          <Link
            to="/games"
            className="flex items-center gap-2 text-sm hover:text-secondary transition-all rounded px-2 py-1"
            onClick={(e) => { if (!handleRestrictedNav('/games', 'Games')) { e.preventDefault(); } else { setIsGamesOpen(false); } }}
          >
            <Gamepad2 className="w-5 h-5" /> Games
          </Link>
          <Link
            to="/dspet-disclosure"
            className="flex items-center gap-2 text-sm hover:text-secondary transition-all rounded px-2 py-1"
            onClick={() => setIsGamesOpen(false)} // Disclosure is generally public
          >
            <ShieldCheck className="w-5 h-5" /> Disclosure
          </Link>
          {/* Add Inventory and Marketplace to this dropdown too, if not in TopNav */}
          {/* If Inventory/Marketplace are in TopNav, remove them from here to avoid duplication */}
          {/* For now, assuming they are in TopNav, so not adding here */}
        </div>
      )}

      {/* Auth/SignIn or SignOut */}
      {userId ? (
        <button
          onClick={handleSignOut}
          onMouseEnter={() => handleNavItemHover('Sign Out')}
          onMouseLeave={handleNavItemLeave}
          className="flex flex-col items-center group"
          aria-label="Sign Out"
        >
          <div className="transition-transform duration-150 group-hover:scale-125 group-hover:-translate-y-1">
            <LogOut className="w-7 h-7 text-destructive" />
          </div>
          <span className="text-xs mt-1 font-inter text-muted">Sign Out</span>
        </button>
      ) : (
        <Link
          to="/auth"
          onClick={(e) => {
            e.preventDefault();
            setActiveModal('auth');
            setShowMessage('👋 Welcome! Please sign in to continue.');
          }}
          onMouseEnter={() => handleNavItemHover('Sign In')}
          onMouseLeave={handleNavItemLeave}
          className="flex flex-col items-center group"
        >
          <div className="transition-transform duration-150 group-hover:scale-125 group-hover:-translate-y-1">
            <User className="w-7 h-7 text-foreground" />
          </div>
          <span className="text-xs mt-1 font-inter text-muted">Sign In</span>
        </Link>
      )}
    </nav>
  );
};

export default BottomNav;
