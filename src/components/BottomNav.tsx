// src/components/BottomNav.tsx
import { FC } from 'react';
import { Home, User, ShoppingBag, Package, Crown } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useModal } from '@/components/context/ModalContext';
import { usePlayer } from '@/components/context/PlayerContext';

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

    // EXPANDED TO 5 ITEMS FOR FULL COVERAGE
    const navItems = [
        { path: '/', label: 'Feed', icon: Home },
        { path: '/shop', label: 'Market', icon: ShoppingBag },
        { path: '/inventory', label: 'Armory', icon: Package }, // Added Inventory
        { path: '/vault', label: 'Vault', icon: User },
        { path: '/membership', label: 'Elite', icon: Crown },   // Added Membership
    ];

    return (
        <nav className="fixed bottom-0 left-0 w-full z-40 bg-black border-t border-white/10 pb-safe lg:hidden">
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
                            <div className={`p-1.5 rounded-full transition-colors ${isActive ? 'bg-white/10' : 'bg-transparent'}`}>
                                <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-gray-500 group-hover:text-white'}`} />
                            </div>
                            <span className={`text-[9px] font-bold uppercase tracking-wide ${isActive ? 'text-white' : 'text-gray-600'}`}>
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