import { FC, memo } from 'react';
import { motion } from 'framer-motion';
import { auth } from '@/lib/firebaseConfig';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';

// Define props to match WalletSwapForms.tsx
interface ConnectWalletButtonProps {
  setActiveModal: React.Dispatch<React.SetStateAction<string | null>>;
  setShowMessage: React.Dispatch<React.SetStateAction<string>>;
}

const ConnectWalletButton: FC<ConnectWalletButtonProps> = memo(({ setActiveModal, setShowMessage }) => {
  const isConnected = !!auth.currentUser;

  const handleConnect = async () => {
    if (!auth.currentUser) {
      setActiveModal('auth');
      setShowMessage('⚠️ Sign in to connect wallet!');
      return;
    }
    try {
      const userId = auth.currentUser.uid;
      const transactionId = `${userId}_${Date.now()}`;
      await addDoc(collection(db, 'Transactions'), {
        transactionId,
        userId,
        amount: 0,
        currency: 'JEWELS' as 'INR' | 'USD' | 'ETH',
        transactionType: 'connect' as 'membership' | 'deposit' | 'withdraw' | 'connect',
        status: 'success' as 'success' | 'pending' | 'failed',
        timestamp: serverTimestamp(),
        game: 'wallet-connect',
        adminId: '0CfobCbXnPZsJwT662H4OhDrXk33',
      });
      setShowMessage('🎉 Wallet connected!');
      setActiveModal('payment');
    } catch (err) {
      console.error('Connect error:', err);
      setShowMessage('⚠️ Failed to connect wallet. Try again.');
      setActiveModal('error');
    }
  };

  const handleDisconnect = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (userId) {
        const transactionId = `${userId}_${Date.now()}`;
        await addDoc(collection(db, 'Transactions'), {
          transactionId,
          userId,
          amount: 0,
          currency: 'JEWELS' as 'INR' | 'USD' | 'ETH',
          transactionType: 'disconnect' as 'membership' | 'deposit' | 'withdraw' | 'connect' | 'disconnect',
          status: 'success' as 'success' | 'pending' | 'failed',
          timestamp: serverTimestamp(),
          game: 'wallet-connect',
          adminId: '0CfobCbXnPZsJwT662H4OhDrXk33',
        });
      }
      await auth.signOut();
      setShowMessage('🔌 Wallet disconnected.');
    } catch (err) {
      console.error('Disconnect error:', err);
      setShowMessage('⚠️ Failed to disconnect wallet. Try again.');
      setActiveModal('error');
    }
  };

  return (
    <motion.div
      className="flex flex-col items-center gap-4 relative bg-noise"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1620121692029-d088224ddc74?q=80&w=2070&auto=format&fit=crop)' }}
      />
      {!isConnected ? (
        <motion.button
          onClick={handleConnect}
          className="px-6 py-3 rounded-full bg-rose-400 text-white hover:bg-cyan-500 transition-all font-poppins focus:outline-none focus:ring-2 focus:ring-rose-400"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Connect wallet"
        >
          Connect Wallet
        </motion.button>
      ) : (
        <div className="text-center text-gray-200 font-inter relative">
          <p>Connected: {auth.currentUser?.uid.slice(0, 6)}...{auth.currentUser?.uid.slice(-4)}</p>
          <motion.button
            onClick={handleDisconnect}
            className="mt-2 px-6 py-3 rounded-full bg-rose-400 text-white hover:bg-cyan-500 transition-all font-poppins focus:outline-none focus:ring-2 focus:ring-rose-400"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Disconnect wallet"
          >
            Disconnect
          </motion.button>
        </div>
      )}
    </motion.div>
  );
});

export default ConnectWalletButton;