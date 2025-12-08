import { FC } from 'react';
import { Home, User, ShoppingBag, PlusCircle } from 'lucide-react';
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

    const navItems = [
        { path: '/', label: 'Feed', icon: Home },
        { path: '/shop', label: 'Market', icon: ShoppingBag },
        { path: '/vault', label: 'Profile', icon: User },
    ];

    return (
        <nav className="fixed bottom-0 left-0 w-full z-40 bg-black border-t border-white/10 pb-safe md:hidden">
            <div className="flex items-center justify-around h-[60px] px-2">
                
                {navItems.map(({ path, label, icon: Icon }) => {
                    const isActive = location.pathname === path || (path === '/' && location.pathname === '/home');
                    return (
                        <Link
                            key={label}
                            to={path}
                            onClick={(e) => { if (!handleAction(path)) e.preventDefault(); }}
                            className="flex flex-col items-center justify-center w-16 h-full space-y-1"
                        >
                            <Icon className={`w-6 h-6 ${isActive ? 'text-primary' : 'text-gray-500'}`} />
                            {/* Dot indicator for active state */}
                            {isActive && <div className="w-1 h-1 bg-primary rounded-full" />}
                        </Link>
                    );
                })}
                
                {/* Floating Action Button (Center) - e.g., Quick Deposit or Play */}
                <button 
                    onClick={() => setActiveModal('payment')}
                    className="absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 bg-primary rounded-full border-4 border-black flex items-center justify-center shadow-[0_0_20px_rgba(0,255,65,0.3)]"
                >
                    <PlusCircle className="w-8 h-8 text-black" />
                </button>

            </div>
        </nav>
    );
};

export default BottomNav;