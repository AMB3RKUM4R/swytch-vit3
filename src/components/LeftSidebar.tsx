import { FC } from 'react';
import { Home, ShoppingBag, Package, User, Crown, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useModal } from '@/components/context/ModalContext';
import { usePlayer } from '@/components/context/PlayerContext';
import { cn } from '@/lib/utils';

const LeftSidebar: FC = () => {
  const { userId, isAdmin } = usePlayer();
  const { setActiveModal, setShowMessage } = useModal();
  const location = useLocation();

  const handleAction = (path: string, label: string) => {
      if (!userId && path !== '/') {
          setShowMessage(`⚠️ ACCESS DENIED: ${label}`);
          setActiveModal('auth');
          return false;
      }
      return true;
  };

  const navItems = [
    { path: '/', label: 'FEED', icon: Home },
    { path: '/shop', label: 'EXCHANGE', icon: ShoppingBag },
    { path: '/inventory', label: 'ARMORY', icon: Package },
    { path: '/vault', label: 'VAULT', icon: User },
    { path: '/membership', label: 'ELITE', icon: Crown },
  ];

  return (
    <div className="h-full w-[80px] flex flex-col items-center py-6 bg-black border-r border-gray-800 z-30 font-mono">
      
      {/* NAVIGATION ICONS */}
      <nav className="flex-1 flex flex-col gap-6 w-full">
        {navItems.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname === path || (path === '/' && location.pathname === '/home');
            return (
                <Link
                    key={path}
                    to={path}
                    onClick={(e) => { if (!handleAction(path, label)) e.preventDefault(); }}
                    className="group relative w-full flex justify-center"
                >
                    <div className={cn(
                        "w-12 h-12 flex items-center justify-center transition-all duration-200 rounded-sm",
                        isActive 
                            ? "bg-[#39FF14]/10 text-[#39FF14] border-l-2 border-[#39FF14] shadow-[0_0_10px_rgba(57,255,20,0.2)]" 
                            : "text-gray-600 hover:text-white hover:bg-white/5"
                    )}>
                        <Icon className="w-5 h-5" />
                    </div>
                    
                    {/* Tooltip */}
                    <span className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-3 py-1 bg-[#39FF14] text-black text-[10px] font-bold uppercase opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none tracking-widest z-50">
                        {label}
                    </span>
                </Link>
            );
        })}

        {/* ADMIN ICON */}
        {isAdmin() && (
             <Link
                to="/admin"
                className="group relative w-full flex justify-center mt-auto mb-4"
            >
                <div className={cn(
                    "w-12 h-12 flex items-center justify-center transition-all duration-200",
                    location.pathname === '/admin'
                        ? "bg-red-900/20 text-red-500 border-l-2 border-red-500" 
                        : "text-gray-700 hover:text-red-500 hover:bg-white/5"
                )}>
                    <Settings className="w-5 h-5" />
                </div>
                <span className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-3 py-1 bg-red-600 text-white text-[10px] font-bold uppercase opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none tracking-widest">
                    ROOT_ACCESS
                </span>
            </Link>
        )}
      </nav>
    </div>
  );
};

export default LeftSidebar;