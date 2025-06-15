import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home, Gamepad2, DollarSign, Banknote, Shield, CreditCard, Building, UserPlus,
  UserCheck, MonitorSmartphone, X, Sparkles, Menu, LayoutDashboard, Users,
  Trophy, Settings, LogIn
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import RazorTransaction from '@/RazorWithdraw';
import PhoneLogin from '@/hooks/PhoneLogin';
import { useAuthUser } from '@/hooks/useAuthUser';

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
  { name: 'View Transactions', icon: Building },
  { name: 'Join Membership', icon: UserPlus },
];

const sidebarItems: NavItem[] = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Community', path: '/community', icon: Users },
  { name: 'Rewards', path: '/GamesPage', icon: Trophy },
  { name: 'Swytch Center', path: '/LandingPage', icon: Settings },
  { name: 'Energy Vault', path: '/Trust', icon: DollarSign },
  { name: 'Withdraw', path: '/withdraw', icon: Banknote },
  { name: 'Login / Signup', path: '/login', icon: LogIn },
];

// Animation Variants
const tooltipVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.9 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.2 } }
};

const sidebarVariants = {
  visible: { x: 0, opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } },
  hidden: { x: '-100%', opacity: 0, transition: { duration: 0.3, ease: 'easeIn' } }
};

const particleVariants = {
  animate: { y: [0, -8, 0], opacity: [0.4, 1, 0.4], transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' } }
};

// Components
const Button = ({ children, onClick, ariaLabel, className }: {
  children: React.ReactNode;
  onClick?: () => void;
  ariaLabel: string;
  className?: string;
}) => (
  <button
    onClick={onClick}
    className={`p-2 rounded-full text-rose-400 hover:bg-rose-600/20 hover:scale-110 transition-all focus:outline-none focus:ring-2 focus:ring-rose-500 ${className}`}
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
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center px-4"
    role="dialog"
    aria-modal="true"
    aria-label={title}
  >
    <motion.div
      className="bg-gray-900/80 border border-rose-500/20 p-6 rounded-xl shadow-2xl w-full max-w-md relative text-left backdrop-blur-lg font-sans"
      initial={{ scale: 0.8 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0.8 }}
      transition={{ duration: 0.4 }}
    >
      <motion.button
        className="absolute top-4 right-4 text-rose-400 hover:text-red-500"
        onClick={onClose}
        whileHover={{ rotate: 90 }}
        aria-label="Close modal"
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, loading, error, signInWithGoogle, signInWithFacebook, signOutUser } = useAuthUser();

  // Handle loading state
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;
  }

  // Handle error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="text-center">
          <p>Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-rose-600 text-white rounded-md"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const renderModalContent = () => {
    switch (activeModal) {
      case 'Pay with Card':
        return (
          <Modal title="Pay with Razorpay" onClose={() => setActiveModal(null)}>
            <div className="grid gap-4 text-white">
              {user ? (
                <>
                  <p className="text-gray-200">Pay $50 for premium content.</p>
                  <RazorTransaction
                    uid={user.uid}
                    amount={50}
                    mode="buy"
                    to="inventory"
                  />
                </>
              ) : (
                <>
                  <p className="text-red-400">Please log in to proceed with payment.</p>
                  <div className="flex gap-4 justify-center">
                    <motion.button
                      onClick={signInWithGoogle}
                      className="px-4 py-2 bg-rose-600 text-white rounded-md font-semibold hover:bg-rose-700"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Sign in with Google
                    </motion.button>
                    <motion.button
                      onClick={signInWithFacebook}
                      className="px-4 py-2 bg-rose-600 text-white rounded-md font-semibold hover:bg-rose-700"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Sign in with Facebook
                    </motion.button>
                  </div>
                </>
              )}
            </div>
          </Modal>
        );
      case 'Bank Transfer':
        return (
          <Modal title="Initiate Bank Transfer" onClose={() => setActiveModal(null)}>
            <form className="grid gap-4 text-white">
              <input
                placeholder="Account Holder Name"
                className="bg-gray-900/80 p-3 rounded-md border border-rose-500/20 w-full text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <input
                placeholder="Bank Name"
                className="bg-gray-900/80 p-3 rounded-md border border-rose-500/20 w-full text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <input
                placeholder="SWIFT/IFSC Code"
                className="bg-gray-900/80 p-3 rounded-md border border-rose-500/20 w-full text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <input
                placeholder="Amount (USDT)"
                className="bg-gray-900/80 p-3 rounded-md border border-rose-500/20 w-full text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <motion.button
                className="bg-rose-600 text-white py-2 rounded-lg font-bold hover:bg-rose-700"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Transfer Now
              </motion.button>
            </form>
          </Modal>
        );
      case 'View Transactions':
        return (
          <Modal title="Transaction History" onClose={() => setActiveModal(null)}>
            <ul className="text-sm text-gray-200 space-y-3">
              <li className="flex items-center gap-2">
                <span className="text-green-400">✅</span> Paid $50 for Swytch Membership
              </li>
              <li className="flex items-center gap-2">
                <span className="text-rose-400">🔁</span> Swapped 20 USDT to JEWELS
              </li>
              <li className="flex items-center gap-2">
                <span className="text-red-400">🏆</span> Claimed 2.8% yield from Vault
              </li>
            </ul>
          </Modal>
        );
      case 'Join Membership':
        return (
          <Modal title="Join Swytch Membership" onClose={() => setActiveModal(null)}>
            <div className="grid gap-4 text-white">
              {user ? (
                <>
                  <p className="text-gray-200">One-time $50 USDT membership.</p>
                  <RazorTransaction
                    uid={user.uid}
                    amount={50}
                    mode="buy"
                    to="inventory"
                  />
                </>
              ) : (
                <>
                  <p className="text-red-400">Please log in to proceed with membership.</p>
                  <div className="flex gap-4 justify-center">
                    <motion.button
                      onClick={signInWithGoogle}
                      className="px-4 py-2 bg-rose-600 text-white rounded-md font-semibold hover:bg-rose-700"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Sign in with Google
                    </motion.button>
                    <motion.button
                      onClick={signInWithFacebook}
                      className="px-4 py-2 bg-rose-600 text-white rounded-md font-semibold hover:bg-rose-700"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Sign in with Facebook
                    </motion.button>
                  </div>
                </>
              )}
            </div>
          </Modal>
        );
      case 'Energy Vault':
        return (
          <Modal title="Access Energy Vault" onClose={() => setActiveModal(null)}>
            <div className="text-white space-y-4">
              <p className="text-gray-200">Your Vault Balance: <span className="font-bold text-rose-400">500 JEWELS</span></p>
              <p className="text-gray-200">Current Yield: <span className="font-bold text-rose-400">2.5% Monthly</span></p>
              <motion.button
                className="w-full bg-rose-600 text-white py-2 rounded-lg font-bold hover:bg-rose-700"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Claim Yield
              </motion.button>
            </div>
          </Modal>
        );
      case 'Withdraw':
        return (
          <Modal title="Withdraw Funds" onClose={() => setActiveModal(null)}>
            {user ? (
              <RazorTransaction
                uid={user.uid}
                amount={50}
                mode="withdraw"
                from="wallet"
                to="wallet"
              />
            ) : (
              <>
                <p className="text-red-400">Please log in to withdraw funds.</p>
                <div className="flex gap-4 justify-center">
                  <motion.button
                    onClick={signInWithGoogle}
                    className="px-4 py-2 bg-rose-600 text-white rounded-md font-semibold hover:bg-rose-700"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Sign in with Google
                  </motion.button>
                  <motion.button
                    onClick={signInWithFacebook}
                    className="px-4 py-2 bg-rose-600 text-white rounded-md font-semibold hover:bg-rose-700"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Sign in with Facebook
                  </motion.button>
                </div>
              </>
            )}
          </Modal>
        );
      case 'Login / Signup':
        return (
          <Modal title="Login or Signup" onClose={() => setActiveModal(null)}>
            <div className="grid gap-4 text-white">
              <PhoneLogin />
              <div className="flex gap-4 justify-center">
                <motion.button
                  onClick={signInWithGoogle}
                  className="px-4 py-2 bg-rose-600 text-white rounded-md font-semibold hover:bg-rose-700"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Sign in with Google
                </motion.button>
                <motion.button
                  onClick={signInWithFacebook}
                  className="px-4 py-2 bg-rose-600 text-white rounded-md font-semibold hover:bg-rose-700"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Sign in with Facebook
                </motion.button>
              </div>
              {user && (
                <motion.button
                  onClick={signOutUser}
                  className="px-4 py-2 bg-red-600 text-white rounded-md font-semibold hover:bg-red-700"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Sign Out
                </motion.button>
              )}
            </div>
          </Modal>
        );
      default:
        return null;
    }
  };

  return (
    <div className="font-sans relative">
      {/* Noise Overlay and Particles */}
      <motion.div className="fixed inset-0 pointer-events-none z-20">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 bg-repeat bg-[length:64px_64px]" />
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-rose-400 opacity-30"
            style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }}
            variants={particleVariants}
            animate="animate"
          />
        ))}
      </motion.div>

      {/* Sidebar */}
      <motion.aside
        className={`fixed top-0 left-0 h-full bg-gray-900/60 backdrop-blur-md border-r border-rose-500/20 z-40 transition-all duration-300 ${isSidebarOpen ? 'w-48' : 'w-16'}`}
        variants={sidebarVariants}
        animate={isSidebarOpen ? 'visible' : 'visible'}
        initial="visible"
      >
        <div className="p-4">
          <Button
            ariaLabel={isSidebarOpen ? 'Close Sidebar' : 'Open Sidebar'}
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full flex justify-center"
          >
            <Menu className="w-6 h-6" />
          </Button>
        </div>
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
                    ? 'bg-rose-600/20 text-rose-400'
                    : 'text-gray-200 hover:bg-rose-600/20 hover:text-rose-400'
                }`}
                aria-label={item.name}
                onClick={() => {
                  if (item.name === 'Login / Signup' || item.name === 'Withdraw') {
                    setActiveModal(item.name);
                  }
                }}
              >
                <item.icon className="w-5 h-5 animate-pulse" />
                {isSidebarOpen && <span className="text-sm font-medium">{item.name}</span>}
              </Link>
              {!isSidebarOpen && (
                <motion.span
                  variants={tooltipVariants}
                  initial="hidden"
                  whileHover="visible"
                  className="absolute left-16 bg-gray-900/80 text-white text-xs px-2 py-1 rounded-md z-50 border border-rose-500/20"
                >
                  {item.name}
                </motion.span>
              )}
            </motion.div>
          ))}
        </nav>
      </motion.aside>

      {/* Header */}
      <header className="fixed top-4 left-0 right-0 z-30 flex justify-center">
        <motion.div
          className="max-w-md lg:max-w-2xl mx-auto flex items-center justify-between gap-3 bg-gray-900/60 backdrop-blur-md border border-rose-500/20 rounded-full px-4 py-2 shadow-xl"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link
            to="/"
            className="text-2xl font-bold text-rose-400 hover:scale-110 transition-all flex items-center gap-2"
            aria-label="Swytch Home"
          >
            <Sparkles className="w-6 h-6 animate-pulse" />
            Swytch
          </Link>
          <div className="flex gap-2 items-center">
            {user ? (
              <>
                <span className="text-white text-sm">Welcome, {user.displayName || 'User'}</span>
                <Button
                  ariaLabel="Sign out"
                  onClick={signOutUser}
                  className="text-red-400 hover:text-red-500"
                >
                  <LogIn className="w-5 h-5" />
                </Button>
              </>
            ) : (
              <>
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
                      className="absolute top-12 left-1/2 -translate-x-1/2 bg-gray-900/80 text-white text-xs px-2 py-1 rounded-md border border-rose-500/20"
                    >
                      {item.name}
                    </motion.span>
                  </motion.div>
                ))}
              </>
            )}
          </div>
        </motion.div>
      </header>

      {/* Bottom Navigation */}
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
                      ? 'bg-rose-600/20 text-rose-400 scale-110'
                      : 'text-gray-200 hover:bg-rose-600/20 hover:text-rose-400 hover:scale-110'
                  }`}
                >
                  <item.icon className="w-5 h-5 animate-pulse" />
                </button>
              </Link>
              <motion.span
                variants={tooltipVariants}
                initial="hidden"
                whileHover="visible"
                className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-gray-900/80 text-white text-xs px-2 py-1 rounded-md border border-rose-500/20"
              >
                {item.name}
              </motion.span>
            </motion.div>
          ))}
        </motion.div>
      </nav>

      <AnimatePresence>{activeModal && renderModalContent()}</AnimatePresence>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .bg-[url('/noise.png')] {
          background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAC3SURBVFhH7ZZBCsAgCER7/6W9WZoKUSO4ro0Q0v+UQKcZJnTf90EQBF3X9UIIh8Ph0Ov1er3RaDSi0WhEkiQpp9OJIAiC3nEcxyHLMgqCILlcLhFFUdTr9WK5XC6VSqVUKpVJutxuNRqMhSRJpmkYkSVKpVCqVSqlUKqVSqZQqlaIoimI4HIZKpVJKpVJutxuNRqNRkiRJMk3TiCRJKpVKqVJKpVIplUqlVColSf4BQUzS2f8eAAAAAElFTkSuQmCC');
          background-repeat: repeat;
          background-size: 64px 64px;
        }
        @media (prefers-reduced-motion) {
          .animate-pulse, .motion-div {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default HeaderComponent;