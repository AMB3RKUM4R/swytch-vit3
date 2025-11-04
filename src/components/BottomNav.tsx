// src/components/BottomNav.tsx
import { FC, useState } from 'react';
import { Home, LogOut, User, ShoppingCart, Package, Users, HandCoins } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useModal } from '@/components/context/ModalContext';
import { motion } from 'framer-motion';
import { usePlayer } from '@/components/context/PlayerContext'; // Import main hook
import { useAuthUserFirebase } from '@/hooks/useAuthUserFirebase';
import { useAuthUserWagmi } from '@/hooks/useAuthUserWagmi';
import { cn } from '@/lib/utils'; // Import cn

const navItems = [
    { path: '/home', label: 'Home', icon: Home },
    { path: '/shop', label: 'Shop', icon: ShoppingCart },
    { path: '/inventory', label: 'Inventory', icon: Package },
    { path: '/community', label: 'Community', icon: Users },
    { path: '/vault', label: 'Vault', icon: HandCoins },
];

const iconVariants = {
  rest: { scale: 1, y: 0, color: 'hsl(var(--muted-foreground))' },
  hover: { scale: 1.2, y: -5, color: 'hsl(var(--primary))', transition: { duration: 0.2, ease: 'easeOut' } },
};

// This component is now self-sufficient and requires no props.
const BottomNav: FC = () => {
  // Get all data from our new contexts
  const { userId } = usePlayer();
  const { setActiveModal, setShowMessage } = useModal();

  const navigate = useNavigate();
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);

  const { disconnect } = useAuthUserWagmi();
  const { signOutUser } = useAuthUserFirebase({ disconnectWagmi: disconnect });

  const handleSignOut = async () => {
    await signOutUser();
    setShowMessage('✅ Signed out successfully!');
    navigate('/'); // Navigate to landing page on sign out
  };

  const handleRestrictedNav = (path: string, label: string) => {
    if (!userId && path !== '/home' && path !== '/') { // Allow home
      setShowMessage(`⚠️ Sign in to access ${label}`);
      setActiveModal('auth');
      return false;
    }
    return true;
  };

  return (
    <nav className="fixed bottom-0 left-0 w-full z-40 p-2 md:hidden">
      {/* Main Nav Bar */}
      <div 
        className={cn(
          "flex items-center justify-around w-full max-w-lg mx-auto p-2 rounded-xl shadow-lg",
          "glass-dark border border-primary/20"
        )}
      >
        {navItems.map(({ path, label, icon: Icon }) => (
          <Link
            key={path}
            to={path}
            onClick={(e) => {
              if (!handleRestrictedNav(path, label)) e.preventDefault();
            }}
            className="flex flex-col items-center justify-center text-sm group w-14 h-14"
            onMouseEnter={() => setHoveredLabel(label)}
            onMouseLeave={() => setHoveredLabel(null)}
          >
            <motion.div
              className="relative flex flex-col items-center"
              variants={iconVariants}
              animate={hoveredLabel === label ? 'hover' : 'rest'}
            >
              <Icon className="w-7 h-7" />
              <span className="text-xs mt-1 font-inter font-medium">{label}</span>
            </motion.div>
          </Link>
        ))}
        {/* Sign In / Sign Out Button */}
        {userId ? (
          <button
            onClick={handleSignOut}
            className="flex flex-col items-center justify-center text-sm group w-14 h-14"
            onMouseEnter={() => setHoveredLabel('Sign Out')}
            onMouseLeave={() => setHoveredLabel(null)}
          >
            <motion.div
              className="relative flex flex-col items-center"
              variants={iconVariants}
              animate={hoveredLabel === 'Sign Out' ? 'hover' : 'rest'}
            >
              <LogOut className="w-7 h-7 text-destructive" />
              <span className="text-xs mt-1 font-inter font-medium text-destructive">Sign Out</span>
            </motion.div>
          </button>
        ) : (
          <button
            onClick={() => setActiveModal('auth')}
            className="flex flex-col items-center justify-center text-sm group w-14 h-14"
            onMouseEnter={() => setHoveredLabel('Sign In')}
            onMouseLeave={() => setHoveredLabel(null)}
          >
            <motion.div
              className="relative flex flex-col items-center"
              variants={iconVariants}
              animate={hoveredLabel === 'Sign In' ? 'hover' : 'rest'}
            >
              <User className="w-7 h-7" />
              <span className="text-xs mt-1 font-inter font-medium">Sign In</span>
            </motion.div>
          </button>
        )}
      </div>
    </nav>
  );
};

export default BottomNav;

