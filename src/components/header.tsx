import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home, Gamepad2, DollarSign, Banknote, Shield,
  CreditCard, Building, Wallet, UserPlus, X, Coins, UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { name: 'Home', path: '/home', icon: Home },
  { name: 'Games', path: '/games', icon: Gamepad2 },
  { name: 'Pricing', path: '/pricing', icon: DollarSign },
  { name: 'Withdraw', path: '/withdraw', icon: Banknote },
  { name: 'Privacy', path: '/privacy', icon: Shield },
  { name: 'Account', path: '/account', icon: UserCheck },
];

const paymentItems = [
  { name: 'Pay with Card', icon: CreditCard },
  { name: 'Bank Transfer', icon: Building },
  { name: 'View Transactions', icon: Wallet },
  { name: 'Join Membership', icon: UserPlus },
  { name: 'Energy Vault', icon: Coins },
];

const Button = ({ children, onClick, ariaLabel }: any) => (
  <button
    onClick={onClick}
    className="p-2 rounded-full text-cyan-300 hover:bg-cyan-500/10 hover:scale-110 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500"
    aria-label={ariaLabel}
  >
    {children}
  </button>
);

const Modal = ({ title, onClose, children }: any) => (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center px-4">
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-gray-900 border border-cyan-500/20 p-6 rounded-xl shadow-lg w-full max-w-md relative text-left"
    >
      <button className="absolute top-4 right-4 text-white" onClick={onClose}><X /></button>
      <h3 className="text-xl font-bold text-cyan-400 mb-4">{title}</h3>
      {children}
    </motion.div>
  </div>
);

export default function HeaderComponent() {
  const location = useLocation();
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const renderModalContent = () => {
    switch (activeModal) {
      case 'Pay with Card':
        return (
          <Modal title="Pay with Credit/Debit Card" onClose={() => setActiveModal(null)}>
            <form className="grid gap-4 text-white">
              <input placeholder="Card Number" className="bg-gray-800 p-3 rounded-md" />
              <input placeholder="Name on Card" className="bg-gray-800 p-3 rounded-md" />
              <input placeholder="Expiry (MM/YY)" className="bg-gray-800 p-3 rounded-md" />
              <input placeholder="CVV" className="bg-gray-800 p-3 rounded-md" />
              <button className="bg-cyan-600 hover:bg-cyan-700 text-white py-2 rounded-lg">Submit Payment</button>
            </form>
          </Modal>
        );
      case 'Bank Transfer':
        return (
          <Modal title="Initiate Bank Transfer" onClose={() => setActiveModal(null)}>
            <form className="grid gap-4 text-white">
              <input placeholder="Account Holder Name" className="bg-gray-800 p-3 rounded-md" />
              <input placeholder="Bank Name" className="bg-gray-800 p-3 rounded-md" />
              <input placeholder="SWIFT/IFSC Code" className="bg-gray-800 p-3 rounded-md" />
              <input placeholder="Amount (USDT)" className="bg-gray-800 p-3 rounded-md" />
              <button className="bg-cyan-600 hover:bg-cyan-700 text-white py-2 rounded-lg">Transfer Now</button>
            </form>
          </Modal>
        );
      case 'View Transactions':
        return (
          <Modal title="Transaction History" onClose={() => setActiveModal(null)}>
            <ul className="text-sm text-gray-300 space-y-3">
              <li>✅ Paid $50 for Swytch Membership</li>
              <li>🔁 Swapped 20 USDT to JEWELS</li>
              <li>🏆 Claimed 2.8% yield from Vault</li>
            </ul>
          </Modal>
        );
      case 'Join Membership':
        return (
          <Modal title="Join Swytch Membership" onClose={() => setActiveModal(null)}>
            <form className="grid gap-4 text-white">
              <input placeholder="Your Email" className="bg-gray-800 p-3 rounded-md" />
              <input placeholder="Crypto Wallet Address" className="bg-gray-800 p-3 rounded-md" />
              <p className="text-gray-400 text-sm">One-time $50 USDT membership</p>
              <button className="bg-cyan-600 hover:bg-cyan-700 text-white py-2 rounded-lg">Become a PET</button>
            </form>
          </Modal>
        );
      case 'Withdraw':
        return (
          <Modal title="Withdraw Funds" onClose={() => setActiveModal(null)}>
            <form className="grid gap-4 text-white">
              <input placeholder="Destination Wallet" className="bg-gray-800 p-3 rounded-md" />
              <input placeholder="Amount (SWYT / JEWELS)" className="bg-gray-800 p-3 rounded-md" />
              <button className="bg-cyan-600 hover:bg-cyan-700 text-white py-2 rounded-lg">Withdraw</button>
            </form>
          </Modal>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <header className="fixed top-4 left-0 right-0 z-50 flex justify-center">
        <div className="max-w-xs md:max-w-md mx-auto flex items-center gap-3 bg-gray-900/60 backdrop-blur-md border border-cyan-500/20 rounded-full px-4 py-2 shadow-lg">
          <Link
            to="/"
            className="text-2xl font-bold text-cyan-400 hover:scale-110 transition-all"
            aria-label="Swytch Home"
          >
            ⚡
          </Link>
          <div className="flex gap-2">
            {paymentItems.map((item) => (
              <Button
                key={item.name}
                ariaLabel={item.name}
                onClick={() => setActiveModal(item.name)}
              >
                <item.icon className="w-5 h-5" />
              </Button>
            ))}
          </div>
        </div>
      </header>

      <nav className="fixed bottom-4 left-0 right-0 z-50 flex justify-center">
        <div className="max-w-xs md:max-w-md mx-auto flex items-center gap-3 bg-gray-900/60 backdrop-blur-md border border-cyan-500/20 rounded-full px-4 py-2 shadow-lg">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => item.name === 'Withdraw' ? setActiveModal('Withdraw') : null}
              className={`p-2 rounded-full transition-all duration-200 ${
                location.pathname === item.path
                  ? 'bg-cyan-500/20 text-cyan-300 scale-110'
                  : 'text-gray-300 hover:bg-cyan-500/10 hover:text-cyan-300 hover:scale-110'
              }`}
              aria-label={item.name}
            >
              <item.icon className="w-5 h-5" />
            </button>
          ))}
        </div>
      </nav>

      <AnimatePresence>{activeModal && renderModalContent()}</AnimatePresence>
    </>
  );
}