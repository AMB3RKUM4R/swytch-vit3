import { FC, useState, useEffect } from 'react';
import { Home, Star, LogOut, User, Gamepad2, LandPlot, Users, ShoppingCart, Award, Package, Info, Link as LinkIcon } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '@/components/context/ThemeContext';
import { useModal } from '@/components/context/ModalContext';
import { auth } from '@/lib/firebaseConfig';
import { motion } from 'framer-motion';
import Tilt from 'react-parallax-tilt';
import { Dialog, DialogContent, DialogTrigger } from '@radix-ui/react-dialog';

interface BottomNavProps {
  userId: string | null;
  jewelsBalance: number;
  isPETMember: boolean;
  setShowMessage: React.Dispatch<React.SetStateAction<string>>;
}

const navItems = [
  {
    path: '/benefits',
    label: 'Benefits',
    icon: <Award className="w-9 h-9 text-[hsl(var(--primary))] group-hover:text-[hsl(var(--secondary))] animate-neon-pulse" />,
    tooltip: 'Explore exclusive rewards and perks.'
  },
  {
    path: '/shop',
    label: 'Shop',
    icon: <ShoppingCart className="w-9 h-9 text-[hsl(var(--primary))] group-hover:text-[hsl(var(--secondary))] animate-neon-pulse" />,
    tooltip: 'Buy in-game items and memberships.'
  },
  {
    path: '/marketplace',
    label: 'Marketplace',
    icon: <LandPlot className="w-9 h-9 text-[hsl(var(--primary))] group-hover:text-[hsl(var(--secondary))] animate-neon-pulse" />,
    tooltip: 'Trade your items with other players.'
  },
  {
    path: '/inventory',
    label: 'Inventory',
    icon: <Package className="w-9 h-9 text-[hsl(var(--primary))] group-hover:text-[hsl(var(--secondary))] animate-neon-pulse" />,
    tooltip: 'View your owned items and NFTs.'
  },
  {
    path: '/dspet-disclosure',
    label: 'Disclosure',
    icon: <Info className="w-9 h-9 text-[hsl(var(--primary))] group-hover:text-[hsl(var(--secondary))] animate-neon-pulse" />,
    tooltip: 'Important information about the platform.'
  },
  {
    path: '/',
    label: 'Landing',
    icon: <Home className="w-9 h-9 text-[hsl(var(--primary))] group-hover:text-[hsl(var(--secondary))] animate-neon-pulse" />,
    tooltip: 'Return to the landing page.'
  }
];

const iconVariants = {
  rest: { scale: 1, y: 0 },
  hover: { scale: 1.5, y: -10, transition: { duration: 0.3, ease: 'easeOut' } },
  neighbor: { scale: 1.2, y: -5, transition: { duration: 0.3, ease: 'easeOut' } }
};

const BottomNav: FC<BottomNavProps> = ({ userId, setShowMessage }) => {
  const [, setIsGamesOpen] = useState(false);
  const { isDarkMode } = useTheme();
  const { setActiveModal } = useModal();
  const location = useLocation();
  const navigate = useNavigate();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    setIsGamesOpen(false);
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
    if (!auth.currentUser) {
      setShowMessage(`⚠️ Sign in to access ${label}`);
      setActiveModal('auth');
      return false;
    }
    return true;
  };

  return (
    <nav
      className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-4 rounded-2xl backdrop-blur-lg border border-[hsl(var(--primary),0.3)] shadow-2xl transition-all duration-300 ease-out max-w-lg w-[90vw] flex justify-between items-center gap-4 holographic-card animated-aura ${isDarkMode ? 'glass-dark' : 'glass-light'}`}
      style={{ background: 'linear-gradient(145deg, rgba(0,0,0,0.8), rgba(50,50,100,0.5))' }}
    >
      {navItems.map(({ path, label, icon, tooltip }, index) => (
        <Link
          key={path}
          to={path}
          onClick={(e) => {
            if (!handleRestrictedNav(path, label)) e.preventDefault();
            setShowMessage(`➡️ Navigating to ${label}!`);
          }}
          className="flex flex-col items-center text-sm group"
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <Tilt tiltMaxAngleX={8} tiltMaxAngleY={8} glareEnable={true} glareMaxOpacity={0.4}>
            <motion.div
              className="relative flex flex-col items-center"
              variants={iconVariants}
              animate={hoveredIndex === index ? 'hover' : hoveredIndex !== null && Math.abs(hoveredIndex - index) === 1 ? 'neighbor' : 'rest'}
            >
              {icon}
              <span className="text-xs mt-1 font-inter text-muted-foreground text-glow-primary">{label}</span>
            </motion.div>
          </Tilt>
        </Link>
      ))}
      {userId ? (
        <button
          onClick={handleSignOut}
          className="flex flex-col items-center group"
          onMouseEnter={() => setHoveredIndex(navItems.length)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <Tilt tiltMaxAngleX={8} tiltMaxAngleY={8} glareEnable={true} glareMaxOpacity={0.4}>
            <motion.div
              className="relative flex flex-col items-center"
              variants={iconVariants}
              animate={hoveredIndex === navItems.length ? 'hover' : 'rest'}
            >
              <LogOut className="w-9 h-9 text-destructive group-hover:text-[hsl(var(--secondary))] animate-neon-pulse" />
              <span className="text-xs mt-1 font-inter text-muted-foreground text-glow-primary">Sign Out</span>
            </motion.div>
          </Tilt>
        </button>
      ) : (
        <Link
          to="/auth"
          onClick={() => setActiveModal('auth')}
          className="flex flex-col items-center group"
          onMouseEnter={() => setHoveredIndex(navItems.length)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <Tilt tiltMaxAngleX={8} tiltMaxAngleY={8} glareEnable={true} glareMaxOpacity={0.4}>
            <motion.div
              className="relative flex flex-col items-center"
              variants={iconVariants}
              animate={hoveredIndex === navItems.length ? 'hover' : 'rest'}
            >
              <User className="w-9 h-9 text-foreground group-hover:text-[hsl(var(--secondary))] animate-neon-pulse" />
              <span className="text-xs mt-1 font-inter text-muted-foreground text-glow-primary">Sign In</span>
            </motion.div>
          </Tilt>
        </Link>
      )}
    </nav>
  );
};

export default BottomNav;