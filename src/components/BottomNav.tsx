// src/components/BottomNav.tsx
import { FC, useState, useEffect } from 'react';
import {
  Home, Star, LogOut, User, Gamepad2,
  Sparkles, // Keep Sparkles for MessageDisplay
  LandPlot
} from 'lucide-react'; // Only core icons needed
import { signOut } from 'firebase/auth';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from './context/ThemeContext';
import { useModal } from './context/ModalContext';
import { auth } from '@/lib/firebaseConfig';
import { BottomNavProps } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';

// Define primary navigation items for BottomNav (fewer, core items for mobile)
const navItems = [
  { path: '/home', label: 'Home', icon: <Home className="w-7 h-7" /> },
  { path: '/membership', label: 'Membership', icon: <Star className="w-7 h-7" /> },
  { path: '/vault', label: 'Vault', icon: <LandPlot className="w-7 h-7" /> }, // Vault is still important
  { path: '/games', label: 'Games', icon: <Gamepad2 className="w-7 h-7" /> }, // Direct link to Games page
];


const BottomNav: FC<BottomNavProps> = ({ userId, setShowMessage, globalMessage }) => {
  const { isDarkMode } = useTheme();
  const { setActiveModal, setShowMessage: setGlobalMessageInContext } = useModal();
  const location = useLocation();
  const navigate = useNavigate();

  const [hoverMessage, setHoverMessage] = useState<string | null>(null);
  const [messageTimeoutId, setMessageTimeoutId] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear any lingering hover message when route changes
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
    const restrictedPaths = [
      '/home', '/vault', '/benefits', '/market', '/shop', '/community',
      '/membership', '/games', '/inventory', '/marketplace', '/admin'
    ];
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
        flex justify-around items-center gap-4 md:hidden ${isDarkMode ? 'glass-dark' : 'glass-light'}`} // Hide on md and up
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
