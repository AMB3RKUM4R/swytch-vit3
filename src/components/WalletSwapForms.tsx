import { FC, useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Coins } from 'lucide-react';
import { useModal } from '@/context/ModalContext'; // Keep useModal for context functions
import { addDoc, collection, serverTimestamp, getDoc, doc } from 'firebase/firestore'; // Added getDoc, doc
import { db } from '@/lib/firebaseConfig';
import ConnectWalletButton from './ConnectWalletButton';

// IMPORTANT: Import WalletSwapFormsProps, YieldForm, SupportedCurrency, TransactionType, TransactionStatus from lib/types.ts
import { WalletSwapFormsProps as ImportedWalletSwapFormsProps, YieldForm, SupportedCurrency, TransactionType, TransactionStatus } from '../lib/types';


// WalletSwapFormsProps interface is now imported from lib/types.ts
// YieldForm interface is now imported from lib/types.ts

const containerVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut', type: 'spring', stiffness: 80 } },
};

const cardVariants = {
  hover: { scale: 1.05, boxShadow: '0 0 15px rgba(236, 72, 153, 0.5)' },
};

// Use ImportedWalletSwapFormsProps as the type for the FC
const WalletSwapForms: FC<ImportedWalletSwapFormsProps> = ({ userId, setShowMessage, updatePlayerFirestore }) => {
  const [yieldForm, setYieldForm] = useState<YieldForm>({ deposit: '', network: 'Avalanche', withdraw: '', token: 'USDT', quests: '0' });
  const { setActiveModal } = useModal();

  const handleDeposit = async (amount: string, network: string) => {
    if (!userId) {
      setShowMessage('⚠️ Please connect your wallet or log in.');
      setActiveModal('auth');
      return;
    }
    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount) || depositAmount <= 0) {
      setShowMessage('⚠️ Please enter a valid deposit amount.');
      return;
    }
    try {
      // Fetch current jewels balance before updating
      const userRef = doc(db, 'Players', userId);
      const userSnap = await getDoc(userRef);
      const currentJewels = userSnap.exists() ? userSnap.data().jewels || 0 : 0;

      const transactionId = `${userId}_${Date.now()}`;
      await addDoc(collection(db, 'Transactions'), {
        transactionId,
        userId,
        amount: depositAmount,
        currency: 'JEWELS' as SupportedCurrency, // Correctly typed
        transactionType: 'deposit' as TransactionType,
        status: 'pending' as TransactionStatus,
        timestamp: serverTimestamp(),
        game: 'wallet-swap',
        adminId: '0CfobCbXnPZsJwT662H4OhDrXk33',
      });
      // FIX: Update jewels by adding the deposit amount
      await updatePlayerFirestore({ jewels: currentJewels + depositAmount });
      setShowMessage(`🎉 Deposited ${depositAmount} JEWELS via ${network}!`);
      setActiveModal('payment'); // Trigger payment modal
    } catch (err) {
      console.error('Deposit error:', err);
      setShowMessage('⚠️ Failed to process deposit. Try again.');
      setActiveModal('error');
    }
  };

  const handleWithdraw = async (amount: string, token: string) => {
    if (!userId) {
      setShowMessage('⚠️ Please connect your wallet or log in.');
      setActiveModal('auth');
      return;
    }
    const withdrawAmount = parseFloat(amount);
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      setShowMessage('⚠️ Please enter a valid withdrawal amount.');
      return;
    }
    try {
      // Fetch current jewels balance before updating
      const userRef = doc(db, 'Players', userId);
      const userSnap = await getDoc(userRef);
      const currentJewels = userSnap.exists() ? userSnap.data().jewels || 0 : 0;

      if (currentJewels < withdrawAmount) {
        setShowMessage('⚠️ Insufficient JEWELS balance for withdrawal.');
        return;
      }

      const transactionId = `${userId}_${Date.now()}`;
      await addDoc(collection(db, 'Transactions'), {
        transactionId,
        userId,
        amount: withdrawAmount,
        currency: token as SupportedCurrency, // Use the selected token as currency
        transactionType: 'withdraw' as TransactionType,
        status: 'pending' as TransactionStatus,
        timestamp: serverTimestamp(),
        game: 'wallet-swap',
        adminId: '0CfobCbXnPZsJwT662H4OhDrXk33',
      });
      // FIX: Update jewels by deducting the withdrawal amount
      await updatePlayerFirestore({ jewels: currentJewels - withdrawAmount });
      setShowMessage(`🎉 Withdrawn ${withdrawAmount} JEWELS to ${token}!`);
      setActiveModal('payment');
    } catch (err) {
      console.error('Withdraw error:', err);
      setShowMessage('⚠️ Failed to process withdrawal. Try again.');
      setActiveModal('error');
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto"
    >
      <motion.div
        className="relative bg-gray-900/50 border border-rose-400/20 p-6 rounded-2xl shadow-xl backdrop-blur-md bg-gradient-to-r from-rose-400/10 to-cyan-500/10 bg-noise"
        variants={cardVariants}
        whileHover="hover"
        transition={{ duration: 0.3 }}
      >
        <div className="space-y-4">
          <h4 className="text-2xl font-semibold text-white flex items-center gap-3 font-poppins">
            <Wallet className="w-6 h-6 text-rose-400 animate-pulse" aria-hidden="true" />
            Connect Wallet
          </h4>
          {userId ? (
            <p className="text-gray-300 font-inter">Connected: {userId.slice(0, 6)}...{userId.slice(-4)}</p>
          ) : (
            <ConnectWalletButton userId={userId} setActiveModal={setActiveModal} setShowMessage={setShowMessage} />
          )}
          <p className="text-gray-400 text-sm font-inter">Use your Avalanche-compatible address.</p>
        </div>
      </motion.div>

      <motion.div
        className="relative bg-gray-900/50 border border-rose-400/20 p-6 rounded-2xl shadow-xl backdrop-blur-md bg-gradient-to-r from-rose-400/10 to-cyan-500/10 bg-noise"
        variants={cardVariants}
        whileHover="hover"
        transition={{ duration: 0.3 }}
      >
        <div className="space-y-4">
          <h4 className="text-2xl font-semibold text-white flex items-center gap-3 font-poppins">
            <Coins className="w-6 h-6 text-rose-400 animate-pulse" aria-hidden="true" />
            Deposit JEWELS
          </h4>
          <input
            type="number"
            placeholder="Amount in USDT"
            className="w-full p-3 rounded bg-gray-900 text-white border border-gray-700 focus:border-rose-400 focus:ring-2 focus:ring-rose-400"
            onChange={(e) => setYieldForm({ ...yieldForm, deposit: e.target.value })}
            aria-label="Deposit amount in USDT"
            disabled={!userId}
          />
          <select
            className="w-full p-3 rounded bg-gray-900 text-white border border-gray-700 focus:border-rose-400 focus:ring-2 focus:ring-rose-400"
            onChange={(e) => setYieldForm({ ...yieldForm, network: e.target.value })}
            value={yieldForm.network}
            aria-label="Select network for deposit"
            disabled={!userId}
          >
            <option value="Avalanche">Avalanche</option>
            <option value="Polygon">Polygon</option>
          </select>
          <motion.button
            className="w-full py-3 px-4 bg-rose-600 text-white rounded-lg hover:bg-cyan-500 font-semibold font-poppins focus:outline-none focus:ring-2 focus:ring-rose-400"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleDeposit(yieldForm.deposit, yieldForm.network)}
            aria-label="Deposit JEWELS"
            disabled={!userId || parseFloat(yieldForm.deposit) <= 0}
          >
            Deposit
          </motion.button>
        </div>
      </motion.div>

      <motion.div
        className="relative bg-gray-900/50 border border-rose-400/20 p-6 rounded-2xl shadow-xl backdrop-blur-md bg-gradient-to-r from-rose-400/10 to-cyan-500/10 bg-noise"
        variants={cardVariants}
        whileHover="hover"
        transition={{ duration: 0.3 }}
      >
        <div className="space-y-4">
          <h4 className="text-2xl font-semibold text-white flex items-center gap-3 font-poppins">
            <Coins className="w-6 h-6 text-rose-400 animate-pulse" aria-hidden="true" />
            Withdraw & Swap
          </h4>
          <input
            type="number"
            placeholder="Amount to Withdraw"
            className="w-full p-3 rounded bg-gray-900 text-white border border-gray-700 focus:border-rose-400 focus:ring-2 focus:ring-rose-400"
            onChange={(e) => setYieldForm({ ...yieldForm, withdraw: e.target.value })}
            aria-label="Withdraw amount"
            disabled={!userId}
          />
          <select
            className="w-full p-3 rounded bg-gray-900 text-white border border-gray-700 focus:border-rose-400 focus:ring-2 focus:ring-rose-400"
            onChange={(e) => setYieldForm({ ...yieldForm, token: e.target.value })}
            value={yieldForm.token}
            aria-label="Select target token for withdrawal"
            disabled={!userId}
          >
            <option value="USDT">USDT</option>
            <option value="FDMT">FDMT</option>
            <option value="JSIT">JSIT</option>
          </select>
          <motion.button
            className="w-full py-3 px-4 bg-rose-600 text-white rounded-lg hover:bg-cyan-500 font-semibold font-poppins focus:outline-none focus:ring-2 focus:ring-rose-400"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleWithdraw(yieldForm.withdraw, yieldForm.token)}
            aria-label="Swap and Withdraw JEWELS"
            disabled={!userId || parseFloat(yieldForm.withdraw) <= 0}
          >
            Swap & Withdraw
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default WalletSwapForms;