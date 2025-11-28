// src/components/LeftSidebar.tsx
import { FC } from 'react';
import { motion } from 'framer-motion';
import { Home, Package, ShoppingCart, HandCoins, Users, Star, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { usePlayer } from '@/components/context/PlayerContext';
import { useModal } from '@/components/context/ModalContext';
import { cn } from '@/lib/utils'; // Import cn

const LeftSidebar: FC = () => {
  const { userId, isAdmin } = usePlayer();
  const { setActiveModal, setShowMessage } = useModal();
  const location = useLocation();

  const requireAuth = (path: string) => {
    if (!userId && path !== '/home' && path !== '/') {
      setShowMessage("Sign in to access this area");
      setActiveModal('auth');
      return false;
    }
    return true;
  };

  const navItems = [
    { path: '/home', icon: Home, label: 'Console' },
    { path: '/inventory', icon: Package, label: 'Avatar' },
    { path: '/shop', icon: ShoppingCart, label: 'Market' },
    { path: '/vault', icon: HandCoins, label: 'Vault' },
    { path: '/community', icon: Users, label: 'Community' },
    { path: '/membership', icon: Star, label: 'PET Tier' },
  ];

  return (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      // FIX: Applied glass-dark style and fixed border
      className="fixed left-0 top-0 h-full w-80 glass-dark border-r border-white/10 hidden lg:block pt-24 z-30" 
    >
      <div className="p-8 space-y-4">
        {navItems.map(({ path, icon: Icon, label }) => (
          <Link
            key={path}
            to={path}
            onClick={(e) => !requireAuth(path) && e.preventDefault()}
            className={cn(
              "flex items-center gap-6 p-4 rounded-xl text-xl font-semibold transition-all",
              // Style active link differently
              location.pathname === path 
                ? "bg-primary/20 text-primary border border-primary" 
                : "bg-white/5 hover:bg-white/10 text-foreground"
            )}
          >
            <Icon className="w-8 h-8" />
            {label}
          </Link>
        ))}

        {isAdmin() && (
          <Link 
            to="/admin" 
            // FIX: Applied destructive style for admin panel
            className="flex items-center gap-6 p-4 rounded-xl bg-destructive/80 hover:bg-destructive text-white text-xl font-bold transition-all mt-6"
          >
            <Settings className="w-8 h-8" />
            ADMIN PANEL
          </Link>
        )}
        
        {!userId && (
           <button 
                onClick={() => setActiveModal('auth')}
                className="btn-primary w-full text-xl mt-6"
            >
                Login
            </button>
        )}
      </div>
    </motion.div>
  );
};

export default LeftSidebar;