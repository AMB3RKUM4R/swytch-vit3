import { FC } from 'react';
import { Home, User, ShoppingBag, Package, Crown } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useModal } from '@/components/context/ModalContext';
import { usePlayer } from '@/components/context/PlayerContext';
import { cn } from '@/lib/utils';

const BottomNav: FC = () => {
    const { userId } = usePlayer(); 
    const { setActiveModal } = useModal();
    const location = useLocation();

    const handleAction = (path: string) => {
        if (!userId && path !== '/') {
            setActiveModal('auth');
            return false;
        }
        return true;
    };

    const navItems = [
        { path: '/', label: 'Feed', icon: Home },
        { path: '/shop', label: 'Market', icon: ShoppingBag },
        { path: '/inventory', label: 'Armory', icon: Package },
        { path: '/vault', label: 'Vault', icon: User },
        { path: '/membership', label: 'Elite', icon: Crown }, 
    ];

    return (
        <nav className="fixed bottom-0 left-0 w-full z-40 bg-black/95 backdrop-blur-md border-t border-gray-800 pb-safe lg:hidden font-mono">
            <div className="flex items-center justify-between px-2 h-[60px]">
                
                {navItems.map(({ path, label, icon: Icon }) => {
                    const isActive = location.pathname === path || (path === '/' && location.pathname === '/home');
                    return (
                        <Link
                            key={label}
                            to={path}
                            onClick={(e) => { if (!handleAction(path)) e.preventDefault(); }}
                            className="flex flex-col items-center justify-center flex-1 h-full space-y-1 group active:scale-95 transition-transform"
                        >
                            <div className={cn(
                                "p-1.5 rounded-sm transition-all duration-300",
                                isActive ? "text-[#39FF14]" : "text-gray-600 group-hover:text-white"
                            )}>
                                <Icon className={cn("w-5 h-5", isActive && "drop-shadow-[0_0_8px_rgba(57,255,20,0.5)]")} />
                            </div>
                            <span className={cn(
                                "text-[9px] font-bold uppercase tracking-wider transition-colors",
                                isActive ? "text-white" : "text-gray-600"
                            )}>
                                {label}
                            </span>
                        </Link>
                    );
                })}

            </div>
        </nav>
    );
};

export default BottomNav;