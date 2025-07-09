import { FC, useState, useEffect, useRef } from 'react'; // Added useRef
import { motion } from 'framer-motion';
// Adjusted import for Horse, as you mentioned you're using House now
import { Home, Star, Wallet, LogOut, User, Gamepad2, Dice1, Car, FerrisWheel, House, Rocket } from 'lucide-react';
import { auth, db } from '@/lib/firebaseConfig';
import { doc, onSnapshot } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '@/context/ThemeContext';
import { useModal } from '@/context/ModalContext';

// Define BottomNavProps to match App.tsx
interface BottomNavProps {
  userId: string | null;
  jewelsBalance: number;
  isPETMember: boolean;
  setShowMessage: React.Dispatch<React.SetStateAction<string>>;
  setActiveModal: React.Dispatch<React.SetStateAction<string | null>>;
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
  { path: '/games/horse', label: 'Horse', icon: <House className="w-6 h-6" /> }, // Confirmed using House here
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
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { setActiveModal: setModal } = useModal();
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null); // To manage the scroll timeout

  // Existing useEffect for real-time balance
  useEffect(() => {
    if (userId) {
      const userRef = doc(db, 'Players', userId);
      const unsubscribe = onSnapshot(
        userRef,
        (doc) => {
          if (doc.exists()) {
            const data = doc.data();
            setBalance({ jewels: data.jewels || 0, gold: data.gold || 0 });
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

  // NEW useEffect for dynamic scroll visibility
  useEffect(() => {
    const handleScroll = () => {
      // Show the nav immediately on scroll
      setIsVisible(true);

      // Clear any existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Set a new timeout to hide the nav after 2 seconds of no scrolling
      scrollTimeoutRef.current = setTimeout(() => {
        setIsVisible(false);
      }, 2000); // Adjust duration as needed (e.g., 2000ms = 2 seconds)
    };

    window.addEventListener('scroll', handleScroll);

    // Initial check: if already scrolled, show it
    if (window.scrollY > 50) { // Show if not at the very top initially
      setIsVisible(true);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const handleSignOut = async () => {
    if (!auth.currentUser) {
      setShowMessage('⚠️ Sign in first!');
      setModal('auth');
      return;
    }
    try {
      await signOut(auth);
      setShowMessage('✅ Signed out successfully!');
      navigate('/auth');
    } catch (err) {
      console.error('Sign-out error:', err);
      setShowMessage('⚠️ Failed to sign out. Please try again.');
      setModal('error');
    }
  };

  const handleNavClick = (item: { path: string; label: string }) => {
    if (!auth.currentUser && (item.path === '/membership' || item.path === '/vault')) {
      setShowMessage(`⚠️ Sign in to access ${item.label}!`);
      setModal('auth');
      return;
    }
    setIsMenuOpen(false);
    setIsGamesOpen(false);
    // When a nav item is clicked, immediately hide the bottom nav if it's not the 'Games' or 'Menu' button itself
    setIsVisible(false); // This ensures it disappears after a navigation click
  };

  const dockItemVariants = {
    hover: { scale: 1.25, y: -10, transition: { type: 'spring', stiffness: 300, damping: 10 } },
    tap: { scale: 0.95 },
  };

  return (
    <motion.nav
      initial={{ y: 100, opacity: 0 }}
      // Updated animate logic: if not visible, slide down and fade out
      animate={{ y: isVisible ? 0 : 100, opacity: isVisible ? 1 : 0 }} 
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 nav-dock ${isDarkMode ? 'glass-dark' : 'glass-light'} max-w-md w-full md:hidden`}
    >
      <div className="flex justify-around py-3">
        {navItems.map((item) => (
          <motion.div
            key={item.path}
            className="dock-item"
            variants={dockItemVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <Link
              to={item.path}
              className={`flex flex-col items-center text-${isDarkMode ? 'gray-200' : 'gray-700'} hover:text-secondary transition-colors p-2 rounded-full ${isDarkMode ? 'hover:bg-primary/20' : 'hover:bg-primary/10'}`}
              onClick={() => handleNavClick(item)}
            >
              {item.icon}
              <span className="text-xs font-['Inter']">{item.label}</span>
            </Link>
          </motion.div>
        ))}
        <motion.div className="dock-item" variants={dockItemVariants} whileHover="hover" whileTap="tap">
          <button
            className={`flex flex-col items-center text-${isDarkMode ? 'gray-200' : 'gray-700'} hover:text-secondary transition-colors p-2 rounded-full ${isDarkMode ? 'hover:bg-primary/20' : 'hover:bg-primary/10'}`}
            onClick={() => setIsGamesOpen(!isGamesOpen)}
            aria-label="Toggle Games Menu"
          >
            <Gamepad2 className="w-8 h-8 text-primary" />
            <span className="text-xs font-['Inter']">Games</span>
          </button>
        </motion.div>
      </div>

      {isGamesOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className={`fixed bottom-16 left-1/2 transform -translate-x-1/2 popover ${isDarkMode ? 'glass-dark' : 'glass-light'} p-4 rounded-lg w-full max-w-md`}
        >
          {gameItems.map((game) => (
            <motion.div
              key={game.path}
              className="dock-item"
              variants={dockItemVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Link
                to={game.path}
                className={`flex items-center gap-2 py-2 px-3 rounded-full text-${isDarkMode ? 'gray-200' : 'gray-700'} hover:text-secondary font-['Inter'] ${isDarkMode ? 'hover:bg-primary/20' : 'hover:bg-primary/10'} rounded-full px-3`}
                onClick={() => handleNavClick(game)}
              >
                {game.icon}
                {game.label}
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}

      {isMenuOpen && ( // This block seems to be for a general "more" menu, distinct from games
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`fixed bottom-16 left-1/2 transform -translate-x-1/2 popover ${isDarkMode ? 'glass-dark' : 'glass-light'} p-4 rounded-lg w-full max-w-md`}
        >
          <div className="space-y-2">
            {navItems.map((item) => (
              <motion.div
                key={item.path}
                className="dock-item"
                variants={dockItemVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <Link
                  to={item.path}
                  className={`flex items-center gap-2 py-2 px-3 rounded-full text-${isDarkMode ? 'gray-200' : 'gray-700'} hover:text-secondary font-['Inter'] ${isDarkMode ? 'hover:bg-primary/20' : 'hover:bg-primary/10'}`}
                  onClick={() => handleNavClick(item)}
                >
                  {item.icon}
                  {item.label}
                </Link>
              </motion.div>
            ))}
            {userId ? (
              <>
                <motion.div
                  className={`dock-item flex items-center gap-2 py-2 px-3 rounded-full text-${isDarkMode ? 'gray-200' : 'gray-700'} ${isDarkMode ? 'bg-primary/20' : 'bg-primary/10'}`}
                  variants={dockItemVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Wallet className="w-6 h-6 text-primary animate-pulse-slow" />
                  <span className="font-['Inter']">{isPETMember ? 'PET Member' : 'Non-Member'} | {jewelsBalance.toFixed(2)} JEWELS / {balance.gold.toFixed(2)} GOLD</span>
                </motion.div>
                <motion.button
                  onClick={handleSignOut}
                  className={`dock-item flex items-center gap-2 py-2 px-3 rounded-full text-${isDarkMode ? 'gray-200' : 'gray-700'} hover:text-secondary font-['Inter'] ${isDarkMode ? 'hover:bg-primary/20' : 'hover:bg-primary/10'}`}
                  variants={dockItemVariants}
                  whileHover="hover"
                  whileTap="tap"
                  animate={{ scale: [1, 1.05, 1], transition: { repeat: Infinity, duration: 1.5 } }}
                >
                  <LogOut className="w-6 h-6 text-primary animate-pulse-slow" />
                  Sign Out
                </motion.button>
              </>
            ) : (
              <motion.div className="dock-item" variants={dockItemVariants} whileHover="hover" whileTap="tap">
                <Link
                  to="/auth"
                  className={`flex items-center gap-2 py-2 px-3 rounded-full text-${isDarkMode ? 'gray-200' : 'gray-700'} hover:text-secondary font-['Inter'] ${isDarkMode ? 'hover:bg-primary/20' : 'hover:bg-primary/10'}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="w-6 h-6 text-primary" />
                  Sign In
                </Link>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default BottomNav;