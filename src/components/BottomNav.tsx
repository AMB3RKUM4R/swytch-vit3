import { FC, useState, useEffect } from 'react';
import {
  Home, Star, LogOut, User, Gamepad2, 
  
  LandPlot,
  Users
} from 'lucide-react';
import { signOut } from 'firebase/auth';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '@/components/context/ThemeContext';
import { useModal } from '@/components/context/ModalContext';
import { auth } from '@/lib/firebaseConfig';

interface BottomNavProps {
  userId: string | null;
  jewelsBalance: number;
  isPETMember: boolean;
  setShowMessage: React.Dispatch<React.SetStateAction<string>>;
}

const navItems = [
  { path: '/home', label: 'Home', icon: <Home className="w-7 h-7" /> },
  { path: '/membership', label: 'Membership', icon: <Star className="w-7 h-7" /> },
  { path: '/vault', label: 'Vault', icon: <LandPlot className="w-7 h-7" /> },
  { path: '/community', label: 'Community', icon: <Users className="w-7 h-7" /> }, // Community is a core social hub
  { path: '/games', label: 'Games', icon: <Gamepad2 className="w-7 h-7" /> }, // Direct link to Games page
];



const BottomNav: FC<BottomNavProps> = ({ userId, setShowMessage }) => {
  const [, setIsGamesOpen] = useState(false);
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
