import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home, Gamepad2, DollarSign, Banknote, Shield, CreditCard, Building, Wallet, UserPlus, Coins,
  UserCheck, MonitorSmartphone, X, User, LogOut, Sparkles} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { name: 'Home', path: '/home', icon: Home },
  { name: 'Games', path: '/GamesPage', icon: Gamepad2 },
  { name: 'Landing', path: '/LandingPage', icon: MonitorSmartphone },
  { name: 'Pricing', path: '/Trust', icon: DollarSign },
  { name: 'Privacy', path: '/Privacy', icon: Shield },
  { name: 'Account', path: '/Withdraw', icon: UserCheck },
];

const paymentItems = [
  { name: 'Pay with Card', icon: CreditCard },
  { name: 'Bank Transfer', icon: Building },
  { name: 'View Transactions', icon: Wallet },
  { name: 'Join Membership', icon: UserPlus },
  { name: 'Energy Vault', icon: Coins },
  { name: 'Withdraw', icon: Banknote },
];

const Button = ({ children, onClick, ariaLabel, className }: any) => (
  <button
    onClick={onClick}
    className={`p-2 rounded-full text-cyan-300 hover:bg-cyan-500/20 hover:scale-110 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500 ${className}`}
    aria-label={ariaLabel}
  >
    {children}
  </button>
);

const Modal = ({ title, onClose, children }: any) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center px-4"
  >
    <motion.div
      className="bg-gray-900 border border-cyan-500/20 p-6 rounded-xl shadow-2xl w-full max-w-md relative text-left backdrop-blur-md"
      animate={{ rotate: [0, 2, -2, 0], transition: { duration: 5, repeat: Infinity, ease: 'easeInOut' } }}
    >
      <motion.button
        className="absolute top-4 right-4 text-cyan-400 hover:text-red-500"
        onClick={onClose}
        whileHover={{ rotate: 90 }}
      >
        <X className="w-6 h-6" />
      </motion.button>
      <h3 className="text-xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
        <Sparkles className="w-5 h-5 animate-pulse" /> {title}
      </h3>
      {children}
    </motion.div>
  </motion.div>
);

export default function HeaderComponent() {
  const location = useLocation();
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Animation variants
  const tooltipVariants = {
    hidden: { opacity: 0, y: 10, scale: 0.9 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.2 } },
  };

  // Parallax effect for top bar
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
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
                className="bg-gray-800 p-3 rounded-md border border-cyan-500/20 focus:border-cyan-500"
              />
              <input
                placeholder="Name on Card"
                className="bg-gray-800 p-3 rounded-md border border-cyan-500/20 focus:border-cyan-500"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  placeholder="Expiry (MM/YY)"
                  className="bg-gray-800 p-3 rounded-md border border-cyan-500/20 focus:border-cyan-500"
                />
                <input
                  placeholder="CVV"
                  className="bg-gray-800 p-3 rounded-md border border-cyan-500/20 focus:border-cyan-500"
                />
              </div>
              <button className="bg-cyan-600 hover:bg-cyan-700 text-white py-2 rounded-lg font-semibold">
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
                className="bg-gray-800 p-3 rounded-md border border-cyan-500/20 focus:border-cyan-500"
              />
              <input
                placeholder="Bank Name"
                className="bg-gray-800 p-3 rounded-md border border-cyan-500/20 focus:border-cyan-500"
              />
              <input
                placeholder="SWIFT/IFSC Code"
                className="bg-gray-800 p-3 rounded-md border border-cyan-500/20 focus:border-cyan-500"
              />
              <input
                placeholder="Amount (USDT)"
                className="bg-gray-800 p-3 rounded-md border border-cyan-500/20 focus:border-cyan-500"
              />
              <button className="bg-cyan-600 hover:bg-cyan-700 text-white py-2 rounded-lg font-semibold">
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
                <span className="text-cyan-400">🔁</span> Swapped 20 USDT to JEWELS
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
                className="bg-gray-800 p-3 rounded-md border border-cyan-500/20 focus:border-cyan-500"
              />
              <input
                placeholder="Crypto Wallet Address"
                className="bg-gray-800 p-3 rounded-md border border-cyan-500/20 focus:border-cyan-500"
              />
              <p className="text-gray-400 text-sm">One-time $50 USDT membership</p>
              <button className="bg-cyan-600 hover:bg-cyan-700 text-white py-2 rounded-lg font-semibold">
                Become a PET
              </button>
            </form>
          </Modal>
        );
      case 'Energy Vault':
        return (
          <Modal title="Access Energy Vault" onClose={() => setActiveModal(null)}>
            <div className="text-white space-y-4">
              <p className="text-gray-300">Your Vault Balance: <span className="font-bold text-cyan-400">500 JEWELS</span></p>
              <p className="text-gray-300">Current Yield: <span className="font-bold text-cyan-400">2.5% Monthly</span></p>
              <button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-2 rounded-lg font-semibold">
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
                className="bg-gray-800 p-3 rounded-md border border-cyan-500/20 focus:border-cyan-500"
              />
              <input
                placeholder="Amount (SWYT / JEWELS)"
                className="bg-gray-800 p-3 rounded-md border border-cyan-500/20 focus:border-cyan-500"
              />
              <button className="bg-cyan-600 hover:bg-cyan-700 text-white py-2 rounded-lg font-semibold">
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
                className="w-full p-3 bg-cyan-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2"
                whileHover={{ scale: 1.05 }}
              >
                <Wallet className="w-5 h-5" /> Connect MetaMask
              </motion.button>
              <motion.button
                className="w-full p-3 bg-teal-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2"
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
      {/* Top Bar (Modals Only) */}
      <header className="fixed top-4 left-0 right-0 z-50 flex justify-center">
        <motion.div
          className="max-w-md lg:max-w-2xl mx-auto flex items-center justify-between gap-3 bg-gray-900/60 backdrop-blur-md border border-cyan-500/20 rounded-full px-4 py-2 shadow-xl"
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
            className="text-2xl font-bold text-cyan-400 hover:scale-110 transition-all flex items-center gap-2"
            aria-label="Swytch Home"
          >
            <Sparkles className="w-6 h-6 animate-pulse" /> Swytch
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
                    className="absolute top-12 right-0 bg-gray-900 border border-cyan-500/20 rounded-xl p-4 shadow-xl w-48 text-left"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <img
                        src="/avatar1.jpg"
                        alt="PET Avatar"
                        className="w-8 h-8 rounded-full border border-cyan-500/20"
                      />
                      <div>
                        <p className="text-white text-sm font-bold">AstraRebel</p>
                        <p className="text-gray-400 text-xs">Mythic PET</p>
                      </div>
                    </div>
                    <Link
                      to="/profile"
                      className="block text-gray-300 hover:text-cyan-400 text-sm mb-2"
                      onClick={() => setShowProfileDropdown(false)}
                    >
                      View Profile
                    </Link>
                    <Link
                      to="/settings"
                      className="block text-gray-300 hover:text-cyan-400 text-sm mb-2"
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
      <nav className="fixed bottom-4 left-0 right-0 z-50 flex justify-center">
        <motion.div
          className="max-w-md lg:max-w-2xl mx-auto flex items-center justify-center gap-3 bg-gray-900/60 backdrop-blur-md border border-cyan-500/20 rounded-full px-4 py-2 shadow-xl"
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
                      ? 'bg-cyan-500/20 text-cyan-400 scale-110'
                      : 'text-gray-300 hover:bg-cyan-500/20 hover:text-cyan-400 hover:scale-110'
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

      <AnimatePresence>{activeModal && renderModalContent()}</AnimatePresence>

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
}