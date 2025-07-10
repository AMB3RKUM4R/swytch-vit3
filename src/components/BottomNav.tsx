import { FC, useState, useEffect } from 'react';
import {
  Home, Star, Wallet, LogOut, User, Gamepad2, Dice1, Car, FerrisWheel,
  House, Rocket
} from 'lucide-react';
import { signOut } from 'firebase/auth';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '@/context/ThemeContext';
import { useModal } from '@/context/ModalContext';
import { auth } from '@/lib/firebaseConfig';

interface BottomNavProps {
  userId: string | null;
  jewelsBalance: number;
  isPETMember: boolean;
  setShowMessage: React.Dispatch<React.SetStateAction<string>>;
}

const navItems = [
  { path: '/', label: 'Home', icon: <Home className="w-7 h-7" /> },
  { path: '/membership', label: 'Membership', icon: <Star className="w-7 h-7" /> },
  { path: '/vault', label: 'Vault', icon: <Wallet className="w-7 h-7" /> },
  { path: '/market', label: 'Market', icon: <Car className="w-7 h-7" /> },
];

const gameItems = [
  { path: '/games/bingo', label: 'Bingo', icon: <Dice1 className="w-5 h-5" /> },
  { path: '/games/blackjack', label: 'Blackjack', icon: <Car className="w-5 h-5" /> },
  { path: '/games/bridge', label: 'Bridge', icon: <Car className="w-5 h-5" /> },
  { path: '/games/fortune-wheel', label: 'Fortune Wheel', icon: <FerrisWheel className="w-5 h-5" /> },
  { path: '/games/horse', label: 'Horse', icon: <House className="w-5 h-5" /> },
  { path: '/games/rocketcrash', label: 'Rocket Crash', icon: <Rocket className="w-5 h-5" /> },
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
      setShowMessage('⚠️ Sign in first!');
      setActiveModal('auth');
      return;
    }
    try {
      await signOut(auth);
      setShowMessage('✅ Signed out successfully!');
      navigate('/auth');
    } catch (err) {
      console.error('Sign-out error:', err);
      setShowMessage('⚠️ Failed to sign out.');
      setActiveModal('error');
    }
  };

  const handleRestrictedNav = (path: string, label: string) => {
    if (!auth.currentUser && (path === '/vault' || path === '/membership')) {
      setShowMessage(`⚠️ Sign in to access ${label}`);
      setActiveModal('auth');
      return false;
    }
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
          onClick={() => handleRestrictedNav(path, label)}
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
              onClick={() => setIsGamesOpen(false)}
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
        >
          <div className="transition-transform duration-150 group-hover:scale-125 group-hover:-translate-y-1">
            <LogOut className="w-7 h-7 text-destructive" />
          </div>
          <span className="text-xs mt-1 font-inter text-muted">Sign Out</span>
        </button>
      ) : (
        <Link
          to="/auth"
          onClick={() => setActiveModal('auth')}
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
