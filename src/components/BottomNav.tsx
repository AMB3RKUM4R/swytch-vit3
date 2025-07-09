import { FC, useState, useEffect, useRef } from 'react';
// Removed motion and AnimatePresence imports as they are no longer used in this component
import { Home, Star, Wallet, LogOut, User, Gamepad2, Dice1, Car, FerrisWheel, House, Rocket } from 'lucide-react';
import { auth, db } from '@/lib/firebaseConfig';
import { doc, onSnapshot } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '@/context/ThemeContext';
import { useModal } from '@/context/ModalContext';

interface BottomNavProps {
  userId: string | null;
  jewelsBalance: number;
  isPETMember: boolean;
  setShowMessage: React.Dispatch<React.SetStateAction<string>>;
}

const navItems = [
  { path: '/', label: 'Home', icon: <Home className="w-8 h-8" /> },
  { path: '/membership', label: 'Membership', icon: <Star className="w-8 h-8" /> },
  { path: '/vault', label: 'Vault', icon: <Wallet className="w-8 h-8" /> },
  { path: '/games', label: 'Games', icon: <Gamepad2 className="w-8 h-8" /> },
  { path: '/market', label: 'Market', icon: <Car className="w-8 h-8" /> },
];

const gameItems = [
  { path: '/games/bingo', label: 'Bingo', icon: <Dice1 className="w-6 h-6" /> },
  { path: '/games/blackjack', label: 'Blackjack', icon: <Car className="w-6 h-6" /> },
  { path: '/games/bridge', label: 'Bridge', icon: <Car className="w-6 h-6" /> },
  { path: '/games/caribbean-stud', label: 'Caribbean Stud', icon: <Car className="w-6 h-6" /> },
  { path: '/games/fortune-wheel', label: 'Fortune Wheel', icon: <FerrisWheel className="w-6 h-6" /> },
  { path: '/games/horse', label: 'Horse', icon: <House className="w-6 h-6" /> },
  { path: '/games/pontoon', label: 'Pontoon', icon: <Car className="w-6 h-6" /> },
  { path: '/games/reddog', label: 'Red Dog', icon: <Car className="w-6 h-6" /> },
  { path: '/games/rocketcrash', label: 'Rocket Crash', icon: <Rocket className="w-6 h-6" /> },
  { path: '/games/Scratch', label: 'Scratch Cards', icon: <Car className="w-6 h-6" /> },
  { path: '/games/solitaire', label: 'Solitaire', icon: <Car className="w-6 h-6" /> },
];

const BottomNav: FC<BottomNavProps> = ({ userId, jewelsBalance, isPETMember, setShowMessage }) => {
  const [balance, setBalance] = useState<{ jewels: number; gold: number }>({ jewels: 0, gold: 0 });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isGamesOpen, setIsGamesOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false); // Controls the visibility of the entire nav
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode } = useTheme();
  const { setActiveModal: setModal } = useModal();
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Effect for real-time balance updates
  useEffect(() => {
    if (userId) {
      const userRef = doc(db, 'Players', userId);
      const unsubscribe = onSnapshot(
        userRef,
        (doc) => {
          if (doc.exists()) {
            const data = doc.data();
            setBalance({ jewels: data.jewels || 0, gold: data.gold || 0 });
            const now = Date.now();
            const oneDay = 24 * 60 * 60 * 1000;
            if (now - (data.lastBonusTime || 0) > oneDay) {
              setBalance(prev => ({ ...prev, jewels: (prev.jewels || 0) + 500 }));
              setShowMessage('🎉 Claimed 500 JEWELS daily bonus!');
            }
          }
        },
        (err) => {
          console.error('Failed to fetch balance:', err.message);
          setShowMessage('⚠️ Failed to load balance. Please check your connection.');
          setModal('error');
        }
      );
      return () => unsubscribe();
    }
  }, [userId, setShowMessage, setModal]);

  // Effect for dynamic scroll visibility (hide/show nav on scroll)
  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(true); // Show nav immediately on scroll
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      // Set a timeout to hide the nav after 2 seconds of no scrolling
      scrollTimeoutRef.current = setTimeout(() => {
        setIsVisible(false);
      }, 2000);
    };

    window.addEventListener('scroll', handleScroll);

    // Initial check: if already scrolled from the very top, show it
    if (window.scrollY > 0) {
      setIsVisible(true);
    } else {
      setIsVisible(false); // Hide if at top initially
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Effect to hide menus and nav when the route changes
  useEffect(() => {
    setIsVisible(false); // Hide the main nav on route change
    setIsMenuOpen(false); // Close any open sub-menus
    setIsGamesOpen(false);
  }, [location.pathname]); // Dependency on route changes

  const handleSignOut = async () => {
    if (!auth.currentUser) {
      setShowMessage('⚠️ Sign in first!');
      setModal('auth');
      return;
    }
    try {
      await signOut(auth);
      setShowMessage('✅ Signed out successfully!');
      navigate('/auth'); // Redirect after sign-out
    } catch (err) {
      console.error('Sign-out error:', err);
      setShowMessage('⚠️ Failed to sign out. Please try again.');
      setModal('error');
    }
  };

  const handleNavClick = (itemPath: string, itemLabel: string) => {
    // Check authentication for restricted pages
    if (!auth.currentUser && (itemPath === '/membership' || itemPath === '/vault')) {
      setShowMessage(`⚠️ Sign in to access ${itemLabel}!`);
      setModal('auth');
      return;
    }
    // Close menus when a navigation item is clicked
    setIsMenuOpen(false);
    setIsGamesOpen(false);
  };

  return (
    <nav
      className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 nav-dock ${isDarkMode ? 'glass-dark' : 'glass-light'} max-w-md w-full md:hidden
                  transition-all duration-300 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'}`}
    >
      {/* Main navigation items */}
      <div className="flex justify-around py-3 w-full">
        {navItems.map((item) => (
          <div
            key={item.path}
            // Apply standard Tailwind transitions for hover/active effects
            className="dock-item transition-transform duration-200 ease-out hover:scale-125 hover:-translate-y-2 active:scale-95"
          >
            <Link
              to={item.path}
              className={`flex flex-col items-center text-${isDarkMode ? 'gray-200' : 'gray-700'} hover:text-secondary transition-colors p-2 rounded-full ${isDarkMode ? 'hover:bg-primary/20' : 'hover:bg-primary/10'}`}
              onClick={() => handleNavClick(item.path, item.label)}
            >
              {item.icon}
              <span className="text-xs font-['Inter']">{item.label}</span>
            </Link>
          </div>
        ))}
        {/* Games menu toggle button */}
        <div className="dock-item transition-transform duration-200 ease-out hover:scale-125 hover:-translate-y-2 active:scale-95">
          <button
            className={`flex flex-col items-center text-${isDarkMode ? 'gray-200' : 'gray-700'} hover:text-secondary transition-colors p-2 rounded-full ${isDarkMode ? 'hover:bg-primary/20' : 'hover:bg-primary/10'}`}
            onClick={() => setIsGamesOpen(!isGamesOpen)}
            aria-label="Toggle Games Menu"
          >
            <Gamepad2 className="w-8 h-8 text-primary" />
            <span className="text-xs font-['Inter']">Games</span>
          </button>
        </div>
      </div>

      {/* Conditional rendering for the Games sub-menu (no AnimatePresence needed) */}
      {isGamesOpen && (
        <div
          className={`fixed bottom-16 left-1/2 transform -translate-x-1/2 popover ${isDarkMode ? 'glass-dark' : 'glass-light'} p-4 rounded-lg w-full max-w-md
                      transition-all duration-300 ease-out opacity-100 translate-y-0`} // Add explicit display/hide for smooth transition
        >
          {gameItems.map((game) => (
            <div
              key={game.path}
              className="dock-item transition-transform duration-200 ease-out hover:scale-125 hover:-translate-y-2 active:scale-95"
            >
              <Link
                to={game.path}
                className={`flex items-center gap-2 py-2 px-3 rounded-full text-${isDarkMode ? 'gray-200' : 'gray-700'} hover:text-secondary font-['Inter'] ${isDarkMode ? 'hover:bg-primary/20' : 'hover:bg-primary/10'} rounded-full px-3`}
                onClick={() => handleNavClick(game.path, game.label)}
              >
                {game.icon}
                {game.label}
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Conditional rendering for the main menu (if different from games, or 'more' menu) */}
      {isMenuOpen && (
        <div
          className={`fixed bottom-16 left-1/2 transform -translate-x-1/2 popover ${isDarkMode ? 'glass-dark' : 'glass-light'} p-4 rounded-lg w-full max-w-md
                      transition-all duration-300 ease-out opacity-100 translate-y-0`} // Add explicit display/hide for smooth transition
        >
          <div className="space-y-2">
            {navItems.map((item) => (
              <div
                key={item.path}
                className="dock-item transition-transform duration-200 ease-out hover:scale-125 hover:-translate-y-2 active:scale-95"
              >
                <Link
                  to={item.path}
                  className={`flex items-center gap-2 py-2 px-3 rounded-full text-${isDarkMode ? 'gray-200' : 'gray-700'} hover:text-secondary font-['Inter'] ${isDarkMode ? 'hover:bg-primary/20' : 'hover:bg-primary/10'}`}
                  onClick={() => handleNavClick(item.path, item.label)}
                >
                  {item.icon}
                  {item.label}
                </Link>
              </div>
            ))}
            {userId ? (
              <>
                <div
                  className={`dock-item flex items-center gap-2 py-2 px-3 rounded-full text-${isDarkMode ? 'gray-200' : 'gray-700'} ${isDarkMode ? 'bg-primary/20' : 'bg-primary/10'}`}
                >
                  <Wallet className="w-6 h-6 text-primary animate-pulse-slow" />
                  <span className="font-['Inter']">{isPETMember ? 'PET Member' : 'Non-Member'} | {jewelsBalance.toFixed(2)} JEWELS / {balance.gold.toFixed(2)} GOLD</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className={`dock-item flex items-center gap-2 py-2 px-3 rounded-full text-${isDarkMode ? 'gray-200' : 'gray-700'} hover:text-secondary font-['Inter'] ${isDarkMode ? 'hover:bg-primary/20' : 'hover:bg-primary/10'}
                  transition-all duration-300 ease-out`} // Added transition for sign out button
                >
                  <LogOut className="w-6 h-6 text-primary animate-pulse-slow" />
                  Sign Out
                </button>
              </>
            ) : (
              <div className="dock-item transition-transform duration-200 ease-out hover:scale-125 hover:-translate-y-2 active:scale-95">
                <Link
                  to="/auth"
                  className={`flex items-center gap-2 py-2 px-3 rounded-full text-${isDarkMode ? 'gray-200' : 'gray-700'} hover:text-secondary font-['Inter'] ${isDarkMode ? 'hover:bg-primary/20' : 'hover:bg-primary/10'}`}
                  onClick={() => handleNavClick('/auth', 'Sign In')}
                >
                  <User className="w-6 h-6 text-primary" />
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default BottomNav;