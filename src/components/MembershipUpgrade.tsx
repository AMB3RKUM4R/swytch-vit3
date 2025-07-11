import { FC, memo, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';

// IMPORTANT: Import MembershipUpgradeProps, SupportedCurrency, TransactionType, TransactionStatus from lib/types.ts
import { MembershipUpgradeProps as ImportedMembershipUpgradeProps, SupportedCurrency, TransactionType, TransactionStatus } from '../lib/types';


const cardVariants = {
  hover: { scale: 1.05, boxShadow: '0 0 15px rgba(236, 72, 153, 0.5)' },
};

// Use ImportedMembershipUpgradeProps as the type for the FC
const MembershipUpgrade: FC<ImportedMembershipUpgradeProps> = memo(({ userId, setIsPETMember, updatePlayerFirestore, setActiveModal, setShowMessage }) => {
  const [isPending, setIsPending] = useState<boolean>(false); // Use useState from React

  const payMembership = async () => {
    // Rely on userId prop for authentication check, consistent with other components
    if (!userId) { // Using userId prop directly for auth check
      setShowMessage('⚠️ Please sign in to purchase PET membership!');
      setActiveModal('auth');
      return;
    }
    setIsPending(true);
    try {
      const transactionId = `${userId}_${Date.now()}`;
      await addDoc(collection(db, 'Transactions'), { // Ensure 'Transactions' matches your Firestore rule
        transactionId,
        userId,
        amount: 10, // $10 USDT
        currency: 'USD' as SupportedCurrency, // FIX: Correctly typed as SupportedCurrency
        transactionType: 'membership' as TransactionType, // FIX: Correctly typed as TransactionType
        status: 'pending' as TransactionStatus, // FIX: Correctly typed as TransactionStatus
        timestamp: serverTimestamp(),
        game: 'membership-upgrade',
        adminId: '0CfobCbXnPZsJwT662H4OhDrXk33',
      });
      await updatePlayerFirestore({ isPETMember: true }); // Update Firestore
      setIsPETMember(true); // Update local state
      setShowMessage('🎉 PET Membership purchased! Welcome to the Swytch PETverse!');
      setActiveModal('payment'); // Trigger payment modal as intended
    } catch (err) {
      console.error('Payment error:', err);
      setShowMessage('⚠️ Failed to initiate membership payment. Please try again.');
      setActiveModal('error');
    }
    setIsPending(false);
  };

  return (
    <motion.div
      className="relative bg-gray-900/50 border border-rose-400/20 p-6 rounded-2xl shadow-xl backdrop-blur-md bg-gradient-to-r from-rose-400/10 to-cyan-500/10 bg-noise" // Added bg-noise class
      variants={cardVariants}
      whileHover="hover"
      transition={{ duration: 0.3 }}
    >
      <div className="space-y-6 text-center">
        <h3 className="text-3xl font-bold text-white flex items-center justify-center gap-3 font-poppins">
          <Trophy className="w-8 h-8 text-rose-400 animate-pulse" aria-hidden="true" />
          PET Membership
        </h3>
        <p className="text-lg text-gray-300 font-inter">
          Become a Swytch PET for $10 USDT (₹830) to unlock exclusive rewards and games.
        </p>
        <motion.button
          className={`px-8 py-4 rounded-lg text-lg font-semibold text-white font-poppins ${isPending ? 'bg-gray-600 cursor-not-allowed' : 'bg-rose-400 hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-rose-400'}`}
          onClick={payMembership}
          disabled={isPending}
          whileHover={{ scale: isPending ? 1 : 1.05 }}
          whileTap={{ scale: isPending ? 1 : 0.95 }}
          aria-label={isPending ? 'Processing Payment' : 'Buy Swytch PET for $10 USDT'}
        >
          {isPending ? 'Processing...' : 'Buy Swytch PET for $10 USDT'}
        </motion.button>
      </div>
    </motion.div>
  );
});

export default MembershipUpgrade;