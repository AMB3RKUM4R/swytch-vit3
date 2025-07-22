// src/components/BottomNav.tsx
import { FC, useState, useEffect } from 'react';
import {
  Home, Star, LogOut, User, Gamepad2, // Removed specific car/ferris wheel/house/rocket for generic icons
  // Re-added specific icons from original gameItems if they exist in lucide-react
  Dice1, // For Bingo
  Car, // For Market (or generic transport)
  FerrisWheel, // For Fortune Wheel
  House, // For Horse
  Rocket, // For Rocket Crash
  ShoppingBag, // For Shop
  Users, // For Community
  ShieldCheck, // For Benefits/Disclosure
  LandPlot, // For Vault
  Package, // For Inventory
  Store, // For Marketplace
} from 'lucide-react';
import { signOut } from 'firebase/auth';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from './context/ThemeContext';
import { useModal } from './context/ModalContext';
import { auth } from '@/lib/firebaseConfig';
import { BottomNavProps } from '@/lib/types'; // Import BottomNavProps

// Define navigation items with Lucide icons
const navItems = [
  { path: '/home', label: 'Home', icon: <Home className="w-7 h-7" /> }, // Changed to /home
  { path: '/membership', label: 'Membership', icon: <Star className="w-7 h-7" /> },
  { path: '/vault', label: 'Vault', icon: <LandPlot className="w-7 h-7" /> }, // Changed to LandPlot for Vault
  { path: '/market', label: 'Market', icon: <Car className="w-7 h-7" /> },
  { path: '/shop', label: 'Shop', icon: <ShoppingBag className="w-7 h-7" /> }, // Added Shop
  { path: '/community', label: 'Community', icon: <Users className="w-7 h-7" /> }, // Added Community
  { path: '/benefits', label: 'Benefits', icon: <ShieldCheck className="w-7 h-7" /> }, // Added Benefits
];

// Define game items with Lucide icons (including new Inventory and Marketplace)
const gameItems = [
  { path: '/games/bingo', label: 'Bingo', icon: <Dice1 className="w-5 h-5" /> },
  { path: '/games/blackjack', label: 'Blackjack', icon: <User className="w-5 h-5" /> }, // Generic icon
  { path: '/games/bridge', label: 'Bridge', icon: <User className="w-5 h-5" /> }, // Generic icon
  { path: '/games/fortune-wheel', label: 'Fortune Wheel', icon: <FerrisWheel className="w-5 h-5" /> },
  { path: '/games/horse', label: 'Horse', icon: <House className="w-5 h-5" /> },
  { path: '/games/pontoon', label: 'Pontoon', icon: <User className="w-5 h-5" /> }, // Generic icon
  { path: '/games/solitaire', label: 'Solitaire', icon: <User className="w-5 h-5" /> }, // Generic icon
  { path: '/games/rocket-crash', label: 'Rocket Crash', icon: <Rocket className="w-5 h-5" /> },
  // New MVP pages added to gameItems dropdown for quick access
  { path: '/inventory', label: 'Inventory', icon: <Package className="w-5 h-5" /> }, // New Inventory link
  { path: '/marketplace', label: 'Marketplace', icon: <Store className="w-5 h-5" /> }, // New Marketplace link
];


const BottomNav: FC<BottomNavProps> = ({ userId, setShowMessage }) => {
  const [isGamesOpen, setIsGamesOpen] = useState(false);
  const { isDarkMode } = useTheme();
  const { setActiveModal } = useModal();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setIsGamesOpen(false); // close game menu on route change
  }, [location.pathname]);

  const handleSignOut = async () => {
    if (!auth.currentUser) {
      setShowMessage('⚠️ Not signed in!');
      setActiveModal('auth');
      return;
    }
    try {
      await signOut(auth);
      setShowMessage('✅ Signed out successfully!');
      navigate('/'); // Navigate to landing or home page after sign out
    } catch (err) {
      console.error('Sign-out error:', err);
      setShowMessage('⚠️ Failed to sign out.');
      setActiveModal('error');
    }
  };

  const handleRestrictedNav = (path: string, label: string) => {
    // List of paths that require authentication
    const restrictedPaths = ['/vault', '/membership', '/shop', '/market', '/inventory', '/marketplace', '/games'];
    if (!userId && restrictedPaths.includes(path)) {
      setShowMessage(`⚠️ Please sign in to access ${label}.`);
      setActiveModal('auth');
      return false;
    }
    setShowMessage(`➡️ Navigating to ${label}!`);
    return true;
  };

  return (
    <nav
      className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-xl backdrop-blur-md border border-border
        shadow-xl transition-all duration-300 ease-out max-w-lg w-[90vw]
        flex justify-between items-center gap-4 ${isDarkMode ? 'glass-dark' : 'glass-light'}`}
    >
      {navItems.map(({ path, label, icon }) => (
        <Link
          to={path}
          key={path}
          onClick={(e) => {
            if (!handleRestrictedNav(path, label)) {
              e.preventDefault(); // Prevent navigation if not signed in
            }
          }}
          className="flex flex-col items-center text-sm group"
        >
          <div className="transition-transform duration-150 group-hover:scale-125 group-hover:-translate-y-1">
            {icon}
          </div>
          <span className="text-xs mt-1 font-inter text-muted">{label}</span>
        </Link>
      ))}

      {/* Games Dropdown */}
      <button
        onClick={() => setIsGamesOpen(!isGamesOpen)}
        className="flex flex-col items-center group"
        aria-label="Games"
      >
        <div className="transition-transform duration-150 group-hover:scale-125 group-hover:-translate-y-1">
          <Gamepad2 className="w-7 h-7 text-primary" />
        </div>
        <span className="text-xs mt-1 font-inter text-muted">Games</span>
      </button>

      {isGamesOpen && (
        <div
          className={`absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-background border border-border p-3 rounded-lg shadow-xl
            w-[90vw] max-w-md grid grid-cols-2 gap-2 ${isDarkMode ? 'glass-dark' : 'glass-light'}`}
        >
          {gameItems.map(({ path, label, icon }) => (
            <Link
              to={path}
              key={path}
              className="flex items-center gap-2 text-sm hover:text-secondary transition-all rounded px-2 py-1"
              onClick={(e) => {
                if (!handleRestrictedNav(path, label)) {
                  e.preventDefault(); // Prevent navigation if not signed in
                } else {
                  setIsGamesOpen(false); // Close menu on successful navigation
                }
              }}
            >
              {icon}
              {label}
            </Link>
          ))}
        </div>
      )}

      {/* Auth/SignIn or SignOut */}
      {userId ? (
        <button
          onClick={handleSignOut}
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
          to="/auth" // This link is handled by App.tsx to open AuthModal
          onClick={(e) => {
            e.preventDefault(); // Prevent default link behavior
            setActiveModal('auth');
            setShowMessage('👋 Welcome! Please sign in to continue.');
          }}
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
