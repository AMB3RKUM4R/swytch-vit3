import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home, Gamepad2, DollarSign, Banknote, Shield, CreditCard, Building, Wallet, UserPlus, Coins,
  UserCheck, MonitorSmartphone, X, User, LogOut, Sparkles, Menu, LayoutDashboard, Users,
  BookOpen, Trophy, Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import throttle from 'lodash.throttle';

// Interfaces
interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface PaymentItem {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { name: 'Home', path: '/home', icon: Home },
  { name: 'Games', path: '/GamesPage', icon: Gamepad2 },
  { name: 'Landing', path: '/LandingPage', icon: MonitorSmartphone },
  { name: 'Pricing', path: '/Trust', icon: DollarSign },
  { name: 'Privacy', path: '/Privacy', icon: Shield },
  { name: 'Account', path: '/Withdraw', icon: UserCheck },
];

const paymentItems: PaymentItem[] = [
  { name: 'Pay with Card', icon: CreditCard },
  { name: 'Bank Transfer', icon: Building },
  { name: 'View Transactions', icon: Wallet },
  { name: 'Join Membership', icon: UserPlus },
  { name: 'Energy Vault', icon: Coins },
  { name: 'Withdraw', icon: Banknote },
];

const sidebarItems: NavItem[] = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Community', path: '/community', icon: Users },
  { name: 'Rewards', path: '/GamesPage', icon: Trophy },
  { name: 'Settings', path: '/community', icon: Settings },
];

// Components
const Button = ({ children, onClick, ariaLabel, className }: {
  children: React.ReactNode;
  onClick?: () => void;
  ariaLabel: string;
  className?: string;
}) => (
  <button
    onClick={onClick}
    className={`p-2 rounded-full text-rose-300 hover:bg-rose-500/20 hover:scale-110 transition-all focus:outline-none focus:ring-2 focus:ring-rose-500 ${className}`}
    aria-label={ariaLabel}
  >
    {children}
  </button>
);

const Modal = ({ title, onClose, children }: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center px-4"
  >
    <motion.div
      className="bg-gray-900 border border-rose-500/20 p-6 rounded-xl shadow-2xl w-full max-w-md relative text-left backdrop-blur-md"
      animate={{ rotate: [0, 2, -2, 0], transition: { duration: 5, repeat: Infinity, ease: 'easeInOut' } }}
    >
      <motion.button
        className="absolute top-4 right-4 text-rose-400 hover:text-red-500"
        onClick={onClose}
        whileHover={{ rotate: 90 }}
      >
        <X className="w-6 h-6" />
      </motion.button>
      <h3 className="text-xl font-bold text-rose-400 mb-4 flex items-center gap-2">
        <Sparkles className="w-5 h-5 animate-pulse" /> {title}
      </h3>
      {children}
    </motion.div>
  </motion.div>
);

const HeaderComponent: React.FC = () => {
  const location = useLocation();
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  let afkTimeout: NodeJS.Timeout;

  // Animation variants
  const tooltipVariants = {
    hidden: { opacity: 0, y: 10, scale: 0.9 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.2 } },
  };

  const sidebarVariants = {
    visible: { x: 0, opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } },
    hidden: { x: '-100%', opacity: 0, transition: { duration: 0.3, ease: 'easeIn' } },
  };

  const particleVariants = {
    animate: { y: [0, -8, 0], opacity: [0.4, 1, 0.4], transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' } },
  };

  // AFK Detection and Mouse Movement
  const resetAfkTimer = useCallback(() => {
    setIsSidebarVisible(true);
    clearTimeout(afkTimeout);
    afkTimeout = setTimeout(() => {
      setIsSidebarVisible(false);
    }, 3000);
  }, []);

  const handleMouseMove = useCallback(
    throttle((e: MouseEvent) => {
      setMousePosition({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
      resetAfkTimer();
    }, 100),
    [resetAfkTimer]
  );

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('keydown', resetAfkTimer);
    resetAfkTimer(); // Start timer on mount
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', resetAfkTimer);
      clearTimeout(afkTimeout);
    };
  }, [handleMouseMove, resetAfkTimer]);

  const renderModalContent = () => {
    switch (activeModal) {
      case 'Pay with Card':
        return (
          <Modal title="Pay with Credit/Debit Card" onClose={() => setActiveModal(null)}>
            <form className="grid gap-4 text-white">
              <input
                placeholder="Card Number"
                className="bg-gray-800 p-3 rounded-md border border-rose-500/20 focus:border-rose-500"
              />
              <input
                placeholder="Name on Card"
                className="bg-gray-800 p-3 rounded-md border border-rose-500/20 focus:border-rose-500"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  placeholder="Expiry (MM/YY)"
                  className="bg-gray-800 p-3 rounded-md border border-rose-500/20 focus:border-rose-500"
                />
                <input
                  placeholder="CVV"
                  className="bg-gray-800 p-3 rounded-md border border-rose-500/20 focus:border-rose-500"
                />
              </div>
              <button className="bg-rose-600 hover:bg-rose-700 text-white py-2 rounded-lg font-semibold">
                Submit Payment
              </button>
            </form>
          </Modal>
        );
      case 'Bank Transfer':
        return (
          <Modal title="Initiate Bank Transfer" onClose={() => setActiveModal(null)}>
            <form className="grid gap-4 text-white">
              <input
                placeholder="Account Holder Name"
                className="bg-gray-800 p-3 rounded-md border border-rose-500/20 focus:border-rose-500"
              />
              <input
                placeholder="Bank Name"
                className="bg-gray-800 p-3 rounded-md border border-rose-500/20 focus:border-rose-500"
              />
              <input
                placeholder="SWIFT/IFSC Code"
                className="bg-gray-800 p-3 rounded-md border border-rose-500/20 focus:border-rose-500"
              />
              <input
                placeholder="Amount (USDT)"
                className="bg-gray-800 p-3 rounded-md border border-rose-500/20 focus:border-rose-500"
              />
              <button className="bg-rose-600 hover:bg-rose-700 text-white py-2 rounded-lg font-semibold">
                Transfer Now
              </button>
            </form>
          </Modal>
        );
      case 'View Transactions':
        return (
          <Modal title="Transaction History" onClose={() => setActiveModal(null)}>
            <ul className="text-sm text-gray-300 space-y-3">
              <li className="flex items-center gap-2">
                <span className="text-green-400">✅</span> Paid $50 for Swytch Membership
              </li>
              <li className="flex items-center gap-2">
                <span className="text-rose-400">🔁</span> Swapped 20 USDT to JEWELS
              </li>
              <li className="flex items-center gap-2">
                <span className="text-yellow-400">🏆</span> Claimed 2.8% yield from Vault
              </li>
            </ul>
          </Modal>
        );
      case 'Join Membership':
        return (
          <Modal title="Join Swytch Membership" onClose={() => setActiveModal(null)}>
            <form className="grid gap-4 text-white">
              <input
                placeholder="Your Email"
                className="bg-gray-800 p-3 rounded-md border border-rose-500/20 focus:border-rose-500"
              />
              <input
                placeholder="Crypto Wallet Address"
                className="bg-gray-800 p-3 rounded-md border border-rose-500/20 focus:border-rose-500"
              />
              <p className="text-gray-400 text-sm">One-time $50 USDT membership</p>
              <button className="bg-rose-600 hover:bg-rose-700 text-white py-2 rounded-lg font-semibold">
                Become a PET
              </button>
            </form>
          </Modal>
        );
      case 'Energy Vault':
        return (
          <Modal title="Access Energy Vault" onClose={() => setActiveModal(null)}>
            <div className="text-white space-y-4">
              <p className="text-gray-300">Your Vault Balance: <span className="font-bold text-rose-400">500 JEWELS</span></p>
              <p className="text-gray-300">Current Yield: <span className="font-bold text-rose-400">2.5% Monthly</span></p>
              <button className="w-full bg-rose-600 hover:bg-rose-700 text-white py-2 rounded-lg font-semibold">
                Claim Yield
              </button>
            </div>
          </Modal>
        );
      case 'Withdraw':
        return (
          <Modal title="Withdraw Funds" onClose={() => setActiveModal(null)}>
            <form className="grid gap-4 text-white">
              <input
                placeholder="Destination Wallet"
                className="bg-gray-800 p-3 rounded-md border border-rose-500/20 focus:border-rose-500"
              />
              <input
                placeholder="Amount (SWYT / JEWELS)"
                className="bg-gray-800 p-3 rounded-md border border-rose-500/20 focus:border-rose-500"
              />
              <button className="bg-rose-600 hover:bg-rose-700 text-white py-2 rounded-lg font-semibold">
                Withdraw
              </button>
            </form>
          </Modal>
        );
      case 'Connect Wallet':
        return (
          <Modal title="Connect to Swytch" onClose={() => setActiveModal(null)}>
            <div className="grid gap-4">
              <motion.button
                className="w-full p-3 bg-rose-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2"
                whileHover={{ scale: 1.05 }}
              >
                <Wallet className="w-5 h-5" /> Connect MetaMask
              </motion.button>
              <motion.button
                className="w-full p-3 bg-pink-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2"
                whileHover={{ scale: 1.05 }}
              >
                <Wallet className="w-5 h-5" /> Connect WalletConnect
              </motion.button>
              <motion.button
                className="w-full p-3 bg-gray-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2"
                whileHover={{ scale: 1.05 }}
              >
                <Wallet className="w-5 h-5" /> Generate New Wallet
              </motion.button>
            </div>
          </Modal>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* Sidebar */}
      <motion.aside
        className={`fixed top-0 left-0 h-full bg-gray-900/60 backdrop-blur-md border-r border-rose-500/20 z-40 transition-all duration-300 ${isSidebarOpen ? 'w-48' : 'w-16'}`}
        variants={sidebarVariants}
        animate={isSidebarVisible ? 'visible' : 'hidden'}
        initial="visible"
      >
        {/* Toggle Button */}
        <div className="p-4">
          <Button
            ariaLabel={isSidebarOpen ? 'Close Sidebar' : 'Open Sidebar'}
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full flex justify-center"
          >
            <Menu className="w-6 h-6 text-rose-400" />
          </Button>
        </div>
        {/* Sidebar Items */}
        <nav className="flex flex-col gap-2 p-4">
          {sidebarItems.map((item) => (
            <motion.div
              key={item.name}
              className="relative group"
              whileHover={{ scale: 1.05 }}
            >
              <Link
                to={item.path}
                className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
                  location.pathname === item.path
                    ? 'bg-rose-500/20 text-rose-400'
                    : 'text-gray-300 hover:bg-rose-500/20 hover:text-rose-400'
                }`}
                aria-label={item.name}
              >
                <item.icon className="w-5 h-5 animate-pulse" />
                {isSidebarOpen && <span className="text-sm font-medium">{item.name}</span>}
              </Link>
              {!isSidebarOpen && (
                <motion.span
                  variants={tooltipVariants}
                  initial="hidden"
                  whileHover="visible"
                  className="absolute left-16 bg-gray-800 text-white text-xs px-2 py-1 rounded-md z-50"
                >
                  {item.name}
                </motion.span>
              )}
            </motion.div>
          ))}
        </nav>
        {/* Particles */}
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              backgroundColor: i % 2 === 0 ? 'rgba(236, 72, 153, 0.5)' : 'rgba(34, 211, 238, 0.5)',
            }}
            variants={particleVariants}
            animate="animate"
          />
        ))}
      </motion.aside>

      {/* Top Bar (Modals Only) */}
      <header className="fixed top-4 left-0 right-0 z-30 flex justify-center">
        <motion.div
          className="max-w-md lg:max-w-2xl mx-auto flex items-center justify-between gap-3 bg-gray-900/60 backdrop-blur-md border border-rose-500/20 rounded-full px-4 py-2 shadow-xl"
          style={{
            backgroundPosition: `${50 + mousePosition.x * 5}% ${50 + mousePosition.y * 5}%`,
          }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Logo */}
          <Link
  to="/"
  className="text-2xl font-bold text-rose-400 hover:scale-110 transition-all flex items-center gap-2"
  aria-label="Swytch Home"
>
  <img
    src="/logo.png"
    alt="Swytch Logo"
    className="w-6 h-6"
  />
  Swytch
</Link>

          {/* Payment Actions */}
          <div className="flex gap-2">
            {paymentItems.map((item) => (
              <motion.div
                key={item.name}
                className="relative group"
                whileHover={{ scale: 1.1 }}
              >
                <Button ariaLabel={item.name} onClick={() => setActiveModal(item.name)}>
                  <item.icon className="w-5 h-5 animate-pulse" />
                </Button>
                <motion.span
                  variants={tooltipVariants}
                  initial="hidden"
                  whileHover="visible"
                  className="absolute top-12 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded-md"
                >
                  {item.name}
                </motion.span>
              </motion.div>
            ))}
            {/* Wallet Connect */}
            <motion.div
              className="relative group"
              whileHover={{ scale: 1.1 }}
            >
              <Button ariaLabel="Connect Wallet" onClick={() => setActiveModal('Connect Wallet')}>
                <Wallet className="w-5 h-5 animate-pulse" />
              </Button>
              <motion.span
                variants={tooltipVariants}
                initial="hidden"
                whileHover="visible"
                className="absolute top-12 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded-md"
              >
                Connect Wallet
              </motion.span>
            </motion.div>
            {/* Profile Dropdown */}
            <motion.div
              className="relative group"
              whileHover={{ scale: 1.1 }}
            >
              <Button
                ariaLabel="Profile"
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              >
                <User className="w-5 h-5 animate-pulse" />
              </Button>
              <motion.span
                variants={tooltipVariants}
                initial="hidden"
                whileHover="visible"
                className="absolute top-12 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded-md"
              >
                Profile
              </motion.span>
              <AnimatePresence>
                {showProfileDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-12 right-0 bg-gray-900 border border-rose-500/20 rounded-xl p-4 shadow-xl w-48 text-left"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <img
                        src="/avatar1.jpg"
                        alt="PET Avatar"
                        className="w-8 h-8 rounded-full border border-rose-500/20"
                      />
                      <div>
                        <p className="text-white text-sm font-bold">AstraRebel</p>
                        <p className="text-gray-400 text-xs">Mythic PET</p>
                      </div>
                    </div>
                    <Link
                      to="/profile"
                      className="block text-gray-300 hover:text-rose-400 text-sm mb-2"
                      onClick={() => setShowProfileDropdown(false)}
                    >
                      View Profile
                    </Link>
                    <Link
                      to="/settings"
                      className="block text-gray-300 hover:text-rose-400 text-sm mb-2"
                      onClick={() => setShowProfileDropdown(false)}
                    >
                      Settings
                    </Link>
                    <button
                      className="flex items-center gap-2 text-gray-300 hover:text-red-400 text-sm"
                      onClick={() => setShowProfileDropdown(false)}
                    >
                      <LogOut className="w-4 h-4" /> Log Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </motion.div>
      </header>

      {/* Bottom Bar (Navigation Only) */}
      <nav className="fixed bottom-4 left-0 right-0 z-30 flex justify-center">
        <motion.div
          className="max-w-md lg:max-w-2xl mx-auto flex items-center justify-center gap-3 bg-gray-900/60 backdrop-blur-md border border-rose-500/20 rounded-full px-4 py-2 shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {navItems.map((item) => (
            <motion.div
              key={item.name}
              className="relative group"
              whileHover={{ scale: 1.1 }}
            >
              <Link to={item.path} aria-label={item.name}>
                <button
                  className={`p-2 rounded-full transition-all duration-200 ${
                    location.pathname === item.path
                      ? 'bg-rose-500/20 text-rose-400 scale-110'
                      : 'text-gray-300 hover:bg-rose-500/20 hover:text-rose-400 hover:scale-110'
                  }`}
                >
                  <item.icon className="w-5 h-5 animate-pulse" />
                </button>
              </Link>
              <motion.span
                variants={tooltipVariants}
                initial="hidden"
                whileHover="visible"
                className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded-md"
              >
                {item.name}
              </motion.span>
            </motion.div>
          ))}
        </motion.div>
      </nav>

      {/* Lens Flare and Noise Overlay */}
      <motion.div className="fixed inset-0 pointer-events-none z-20">
        <motion.div
          className="absolute w-96 h-96 bg-gradient-to-br from-rose-400/50 via-pink-500/40 to-cyan-500/30 rounded-full opacity-30 blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0.8, 0.6] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          style={{ top: `${mousePosition.y * 100}%`, left: `${mousePosition.x * 100}%` }}
        />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-15 bg-repeat bg-[length:64px_64px]" />
      </motion.div>

      <AnimatePresence>{activeModal && renderModalContent()}</AnimatePresence>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .blur-3xl { filter: blur(64px); }
        .bg-[url('/noise.png')] {
          background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAC3SURBVFhH7ZZBCsAgCER7/6W9WZoKUSO4ro0Q0v+UQKcZJnTf90EQBF3X9UIIh8Ph0Ov1er3RaDSi0WhEkiSpp9OJIAiC3nEcxyHLMgqCILlcLhFFUdTr9WK5XC6VSqVUKpVUKqVRKpVJutxuNRqMhSRJpmkYkSVKpVCqVSqlUKqVSqZQqlaIoimI4HIZKpVJKpVJutxuNRqNRkiRJMk3TiCRJKpVKqVJKpVIplUqlVColSf4BQUzS2f8eAAAAAElFTkSuQmCC');
        }
        @media (prefers-reduced-motion) {
          .animate-pulse, .animate-bounce, [data-animate] {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </>
  );
};

export default HeaderComponent;