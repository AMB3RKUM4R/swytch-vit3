import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home, Gamepad2, DollarSign, Banknote, Shield, CreditCard, Building, Wallet, UserPlus, Coins,
  UserCheck, MonitorSmartphone, X, User, LogOut, Sparkles, BookOpenCheck, Vote, Compass,
  Star, Zap, Menu, XCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { name: 'Home', path: '/home', icon: Home },
  { name: 'Games', path: '/GamesPage', icon: Gamepad2 },
  { name: 'Landing', path: '/LandingPage', icon: MonitorSmartphone },
  { name: 'Pricing', path: '/Trust', icon: DollarSign },
  { name: 'Privacy', path: '/Privacy', icon: Shield },
  { name: 'Account', path: '/Withdraw', icon: UserCheck },
  { name: 'Lore', path: '/Lore', icon: BookOpenCheck },
  { name: 'Community', path: '/Community', icon: Vote }
];

const sidebarItems = [
  { name: 'Quests', path: '/Quests', icon: Compass },
  { name: 'NFT Marketplace', path: '/NFTMarketplace', icon: Star },
  { name: 'Governance', path: '/Governance', icon: Vote },
  { name: 'Energy Dashboard', path: '/EnergyDashboard', icon: Zap }
];

const paymentItems = [
  { name: 'Pay with Card', icon: CreditCard },
  { name: 'Bank Transfer', icon: Building },
  { name: 'View Transactions', icon: Wallet },
  { name: 'Join Membership', icon: UserPlus },
  { name: 'Energy Vault', icon: Coins },
  { name: 'Withdraw', icon: Banknote },
  { name: 'Learn Tokens', icon: Coins },
  { name: 'PET Guide', icon: UserCheck }
];

interface ButtonProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  ariaLabel: string;
  className?: string;
}

const Button = ({ children, onClick, ariaLabel, className }: ButtonProps) => (
  <button
    onClick={onClick}
    className={`p-2 rounded-full text-rose-300 hover:bg-rose-500/20 hover:scale-110 transition-all focus:outline-none focus:ring-2 focus:ring-rose-500 ${className}`}
    aria-label={ariaLabel}
  >
    {children}
  </button>
);

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal = ({ title, onClose, children }: ModalProps) => {
  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (modalRef.current) {
      modalRef.current.focus();
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <motion.div
        ref={modalRef}
        className="bg-gray-900 border border-rose-500/20 p-6 rounded-xl shadow-2xl w-full max-w-md relative text-left backdrop-blur-md"
        animate={{ rotate: [0, 2, -2, 0], transition: { duration: 5, repeat: Infinity, ease: 'easeInOut' } }}
        tabIndex={-1}
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
};

const HeaderComponent: React.FC = () => {
  const location = useLocation();
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Animation variants
  const tooltipVariants = {
    hidden: { opacity: 0, y: 10, scale: 0.9 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.2 } }
  };

  const dustVariants = {
    animate: { scale: [1, 1.2, 1], opacity: [0.6, 0.8, 0.6], transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' } }
  };

  // Parallax and dust effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const renderModalContent = () => {
    switch (activeModal) {
      case 'Pay with Card':
        return (
          <Modal title="Pay with Credit/Debit Card" onClose={() => setActiveModal(null)}>
            <form className="grid gap-4 text-white">
              <input
                placeholder="Card Number"
                className="bg-gray-800 p-3 rounded-md border border-rose-500/20 focus:border-rose-500"
                aria-label="Card Number"
              />
              <input
                placeholder="Name on Card"
                className="bg-gray-800 p-3 rounded-md border border-rose-500/20 focus:border-rose-500"
                aria-label="Name on Card"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  placeholder="Expiry (MM/YY)"
                  className="bg-gray-800 p-3 rounded-md border border-rose-500/20 focus:border-rose-500"
                  aria-label="Expiry Date"
                />
                <input
                  placeholder="CVV"
                  className="bg-gray-800 p-3 rounded-md border border-rose-500/20 focus:border-rose-500"
                  aria-label="CVV"
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
                aria-label="Account Holder Name"
              />
              <input
                placeholder="Bank Name"
                className="bg-gray-800 p-3 rounded-md border border-rose-500/20 focus:border-rose-500"
                aria-label="Bank Name"
              />
              <input
                placeholder="SWIFT/IFSC Code"
                className="bg-gray-800 p-3 rounded-md border border-rose-500/20 focus:border-rose-500"
                aria-label="SWIFT or IFSC Code"
              />
              <input
                placeholder="Amount (USDT)"
                className="bg-gray-800 p-3 rounded-md border border-rose-500/20 focus:border-rose-500"
                aria-label="Amount in USDT"
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
              <li className="flex items-center gap-2">
                <span className="text-cyan-400">📤</span> Withdrew 100 JEWELS to Wallet
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
                aria-label="Email Address"
              />
              <input
                placeholder="Crypto Wallet Address"
                className="bg-gray-800 p-3 rounded-md border border-rose-500/20 focus:border-rose-500"
                aria-label="Crypto Wallet Address"
              />
              <p className="text-gray-400 text-sm">One-time $50 USDT membership fee to become a PET</p>
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
              <p className="text-gray-400 text-sm">Stake JEWELS to earn passive rewards, reinvest, or withdraw anytime.</p>
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
                aria-label="Destination Wallet Address"
              />
              <input
                placeholder="Amount (SWYT / JEWELS)"
                className="bg-gray-800 p-3 rounded-md border border-rose-500/20 focus:border-rose-500"
                aria-label="Withdrawal Amount"
              />
              <button className="bg-rose-600 hover:bg-rose-700 text-white py-2 rounded-lg font-semibold">
                Withdraw
              </button>
            </form>
          </Modal>
        );
      case 'Learn Tokens':
        return (
          <Modal title="Swytch Tokenomics" onClose={() => setActiveModal(null)}>
            <div className="text-white space-y-4">
              <p className="text-gray-300"><span className="font-bold text-rose-400">JEWELS</span>: Governance and reward token, capped at 100M. Earn via quests, staking, or contributions.</p>
              <p className="text-gray-300"><span className="font-bold text-rose-400">FDMT</span>: Energy-backed token tied to real-world contributions. Redeem for services or trade.</p>
              <p className="text-gray-400 text-sm">Swytch’s ethical tokenomics ensure no inflation, with rewards tied to proof-of-purpose.</p>
              <button className="w-full bg-rose-600 hover:bg-rose-700 text-white py-2 rounded-lg font-semibold">
                Explore Tokenomics
              </button>
            </div>
          </Modal>
        );
      case 'PET Guide':
        return (
          <Modal title="PETverse Guide" onClose={() => setActiveModal(null)}>
            <div className="text-white space-y-4">
              <p className="text-gray-300">As a <span className="font-bold text-rose-400">PET (Person of Energy & Truth)</span>, you’re a creator in the PETverse.</p>
              <ul className="text-gray-300 text-sm space-y-2">
                <li className="flex items-center gap-2"><Star className="w-4 h-4 text-rose-400" /> Complete quests to earn JEWELS</li>
                <li className="flex items-center gap-2"><Shield className="w-4 h-4 text-rose-400" /> Enjoy zero-KYC privacy with zk-SNARKs</li>
                <li className="flex items-center gap-2"><Vote className="w-4 h-4 text-rose-400" /> Vote on governance proposals</li>
              </ul>
              <button className="w-full bg-rose-600 hover:bg-rose-700 text-white py-2 rounded-lg font-semibold">
                Start Your Journey
              </button>
            </div>
          </Modal>
        );
      case 'Connect Wallet':
        return (
          <Modal title="Connect to Swytch" onClose={() => setActiveModal(null)}>
            <div className="grid gap-4">
              <motion.button
                className="w-full p-3 bg-rose-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Connect with MetaMask"
              >
                <Wallet className="w-5 h-5" /> Connect MetaMask
              </motion.button>
              <motion.button
                className="w-full p-3 bg-pink-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Connect with WalletConnect"
              >
                <Wallet className="w-5 h-5" /> Connect WalletConnect
              </motion.button>
              <motion.button
                className="w-full p-3 bg-gray-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Generate new wallet"
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
      {/* Lens Dirt and Dust Effect */}
      <motion.div className="fixed inset-0 pointer-events-none z-10">
        {/* Primary Lens Flare */}
        <motion.div
          className="absolute w-96 h-96 bg-gradient-to-br from-rose-400/50 via-pink-500/40 to-cyan-500/30 rounded-full opacity-30 blur-3xl"
          variants={dustVariants}
          animate="animate"
          style={{ top: `${mousePosition.y - 192}px`, left: `${mousePosition.x - 192}px` }}
        />
        {/* Secondary Flare */}
        <motion.div
          className="absolute w-64 h-64 bg-gradient-to-br from-cyan-400/40 via-rose-500/30 to-pink-400/20 rounded-full opacity-20 blur-2xl"
          variants={dustVariants}
          animate="animate"
          style={{ top: `${mousePosition.y - 128}px`, left: `${mousePosition.x - 128}px` }}
        />
        {/* Noise Texture Overlay */}
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-15" />
        {/* Dust Particles */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full"
            style={{
              top: `${mousePosition.y - 50 + Math.random() * 100}px`,
              left: `${mousePosition.x - 50 + Math.random() * 100}px`,
              backgroundColor: i % 2 === 0 ? 'rgba(236, 72, 153, 0.5)' : 'rgba(34, 211, 238, 0.5)'
            }}
            variants={dustVariants}
            animate="animate"
          />
        ))}
      </motion.div>

      {/* Sidebar */}
      <motion.nav
        className={`fixed top-0 left-0 h-full z-50 bg-gray-900/60 backdrop-blur-md border-r border-rose-500/20 shadow-xl transition-transform duration-300 ${
          showSidebar ? 'translate-x-0' : '-translate-x-full'
        } sm:translate-x-0 sm:w-20 sm:hover:w-48 group`}
        initial={{ x: -256 }}
        animate={{ x: showSidebar ? 0 : -256 }}
        transition={{ duration: 0.3 }}
        aria-label="Sidebar Navigation"
      >
        <div className="flex flex-col items-center py-6 space-y-6 w-20 sm:w-full h-full">
          {/* Toggle Button (Mobile) */}
          <motion.button
            className="sm:hidden text-rose-400 hover:text-red-500 p-2"
            onClick={() => setShowSidebar(false)}
            whileHover={{ rotate: 90 }}
            aria-label="Close Sidebar"
          >
            <XCircle className="w-6 h-6" />
          </motion.button>
          {sidebarItems.map((item) => (
            <motion.div
              key={item.name}
              className="relative group"
              whileHover={{ scale: 1.1 }}
            >
              <Link
                to={item.path}
                className={`flex flex-col items-center p-2 rounded-lg transition-all duration-200 ${
                  location.pathname === item.path
                    ? 'bg-rose-500/20 text-rose-400'
                    : 'text-gray-300 hover:bg-rose-500/20 hover:text-rose-400'
                }`}
                onClick={() => setShowSidebar(false)}
                aria-label={item.name}
              >
                <item.icon className="w-6 h-6 animate-pulse" />
                <span className="mt-1 text-xs sm:hidden sm:group-hover:block">{item.name}</span>
              </Link>
              <motion.span
                variants={tooltipVariants}
                initial="hidden"
                whileHover="visible"
                className="absolute left-20 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded-md sm:hidden"
              >
                {item.name}
              </motion.span>
            </motion.div>
          ))}
        </div>
      </motion.nav>

      {/* Header (Top Bar) */}
      <header className="fixed top-4 left-0 right-0 z-40 flex justify-center">
        <motion.div
          className="max-w-4xl mx-auto flex items-center justify-between gap-3 bg-gray-900/60 backdrop-blur-md border border-rose-500/20 rounded-full px-4 py-2 shadow-xl"
          style={{
            backgroundPosition: `${50 + mousePosition.x * 5}% ${50 + mousePosition.y * 5}%`
          }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Logo and Sidebar Toggle */}
          <div className="flex items-center gap-4">
            <motion.button
              className="sm:hidden text-rose-400 hover:text-rose-500 p-2"
              onClick={() => setShowSidebar(true)}
              whileHover={{ scale: 1.1 }}
              aria-label="Open Sidebar"
            >
              <Menu className="w-6 h-6" />
            </motion.button>
            <Link
              to="/"
              className="text-2xl font-bold text-rose-400 hover:scale-110 transition-all flex items-center gap-2"
              aria-label="Swytch Home"
            >
              <Sparkles className="w-6 h-6 animate-pulse" /> Swytch
            </Link>
          </div>

          {/* Payment and Profile Actions */}
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
                aria-hidden="true"
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
                aria-hidden="true"
              >
                Profile
              </motion.span>
              <AnimatePresence>
                {showProfileDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-12 right-0 bg-gray-900 border border-rose-500/20 rounded-xl p-4 shadow-xl w-56 text-left"
                    role="menu"
                    aria-label="Profile Menu"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <img
                        src="/avatar1.jpg"
                        alt="PET Avatar"
                        className="w-10 h-10 rounded-full border border-rose-500/20"
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
                      role="menuitem"
                    >
                      View Profile
                    </Link>
                    <Link
                      to="/quests"
                      className="block text-gray-300 hover:text-rose-400 text-sm mb-2"
                      onClick={() => setShowProfileDropdown(false)}
                      role="menuitem"
                    >
                      My Quests
                    </Link>
                    <Link
                      to="/nfts"
                      className="block text-gray-300 hover:text-rose-400 text-sm mb-2"
                      onClick={() => setShowProfileDropdown(false)}
                      role="menuitem"
                    >
                      My NFTs
                    </Link>
                    <Link
                      to="/settings"
                      className="block text-gray-300 hover:text-rose-400 text-sm mb-2"
                      onClick={() => setShowProfileDropdown(false)}
                      role="menuitem"
                    >
                      Settings
                    </Link>
                    <button
                      className="flex items-center gap-2 text-gray-300 hover:text-red-400 text-sm"
                      onClick={() => setShowProfileDropdown(false)}
                      role="menuitem"
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

      <AnimatePresence>{activeModal && renderModalContent()}</AnimatePresence>

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .blur-3xl {
          filter: blur(64px);
        }
        .blur-2xl {
          filter: blur(32px);
        }
        /* Noise texture placeholder */
        .bg-[url('/noise.png')] {
          background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAC3SURBVFhH7ZZBCsAgCER7/6W9WZoKUSO4ro0Q0v+UQKcZJnTf90EQBF3X9UIIh8Ph0Ov1er3RaDSi0WhEkiQpp9OJIAiC3nEcxyHLMgqCILlcLhFFUdTr9WK5XC6VSqVUKpVKqVRKpVJutxuNRqMhSRJpmkYkSVKpVCqVSqlUKqVSqZQqlaIoimI4HIZKpVJKpVJutxuNRqNRkiRJMk3TiCRJKpVKqVJKpVIplUqlVColSf4BQUzS2f8eAAAAAElFTkSuQmCC');
          background-repeat: repeat;
          background-size: 64px 64px;
        }
      `}</style>
    </>
  );
};

export default HeaderComponent;