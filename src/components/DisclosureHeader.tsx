import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit'; // Keep ConnectButton

// IMPORTANT: Import DisclosureHeaderProps from lib/types.ts
import { DisclosureHeaderProps as ImportedDisclosureHeaderProps } from '../lib/types';


// Use ImportedDisclosureHeaderProps as the type for the FC
const DisclosureHeader: React.FC<ImportedDisclosureHeaderProps> = ({ userId, jewelsBalance, setActiveModal, setShowMessage }) => {
  const handleConnectWallet = () => {
    // Rely on userId prop for authentication check, consistent with other components
    if (!userId) { // Using userId prop directly for auth check
      setActiveModal('auth');
      setShowMessage('⚠️ Sign in to connect wallet!');
      return;
    }
    setShowMessage('ℹ️ Connecting wallet...');
    // The ConnectButton.Custom will handle opening the RainbowKit modal here.
    // The flow implies that after connection, the user is prompted for payment.
    setActiveModal('payment');
  };

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } } }}
      className="text-center relative"
    >
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1620121692029-d088224ddc74?q=80&w=2070&auto=format&fit=crop)' }} // Example background image
      />
      <h1 className="text-5xl lg:text-6xl font-extrabold text-white flex items-center justify-center gap-4 font-poppins relative">
        <Sparkles className="text-cyan-400 w-12 h-12 animate-pulse" /> Swytch Disclosure
      </h1>
      {userId && (
        <p className="text-gray-300 mt-4 text-center font-inter relative">
          Your JEWELS: <span className="font-bold text-cyan-400">{jewelsBalance} JEWELS</span> {/* Corrected to jewelsBalance */}
        </p>
      )}
      <ConnectButton.Custom>
        {({ openConnectModal }) => (
          <motion.button
            className="mt-6 inline-flex items-center px-8 py-4 bg-rose-600 text-white hover:bg-cyan-500 rounded-full text-lg font-semibold group font-poppins"
            onClick={() => {
              openConnectModal(); // Always open RainbowKit modal on click
              handleConnectWallet(); // Then trigger the login/payment flow
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Connect Wallet"
          >
            Connect Wallet
            <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform duration-200" />
          </motion.button>
        )}
      </ConnectButton.Custom>
    </motion.div>
  );
};

export default DisclosureHeader;