import { FC } from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import React from 'react';

// Define props to match PageProps from App.tsx and Shop.tsx
interface MembershipUpgradeProps {
  userId: string | null;
  setIsPETMember: React.Dispatch<React.SetStateAction<boolean>>;
  updatePlayerFirestore: (updates: Partial<any>) => Promise<void>;
  setActiveModal: React.Dispatch<React.SetStateAction<string | null>>;
  setShowMessage: React.Dispatch<React.SetStateAction<string>>;
}

const cardVariants = {
  hover: { scale: 1.05, boxShadow: '0 0 15px rgba(236, 72, 153, 0.5)' },
};

const MembershipUpgrade: FC<MembershipUpgradeProps> = ({ userId, setIsPETMember, updatePlayerFirestore, setActiveModal, setShowMessage }) => {
  const [isPending, setIsPending] = React.useState<boolean>(false);

  const payMembership = async () => {
    if (!userId) {
      setShowMessage('⚠️ Please sign in to purchase PET membership!');
      setActiveModal('auth');
      return;
    }
    setIsPending(true);
    try {
      const transactionId = `${userId}_${Date.now()}`;
      await addDoc(collection(db, 'Transactions'), {
        transactionId,
        userId,
        amount: 10, // $10 USDT
        currency: 'USD' as 'INR' | 'USD' | 'ETH',
        transactionType: 'membership' as 'membership' | 'deposit' | 'withdraw' | 'connect' | 'disconnect',
        status: 'pending' as 'success' | 'pending' | 'failed',
        timestamp: serverTimestamp(),
        game: 'membership-upgrade',
        adminId: '0CfobCbXnPZsJwT662H4OhDrXk33',
      });
      await updatePlayerFirestore({ isPETMember: true });
      setIsPETMember(true);
      setShowMessage('🎉 PET Membership purchased! Welcome to the Swytch PETverse!');
      setActiveModal('payment');
    } catch (err) {
      console.error('Payment error:', err);
      setShowMessage('⚠️ Failed to initiate membership payment. Please try again.');
      setActiveModal('error');
    }
    setIsPending(false);
  };

  return (
    <motion.div
      className="relative bg-gray-900/50 border border-rose-400/20 p-6 rounded-2xl shadow-xl backdrop-blur-md bg-gradient-to-r from-rose-400/10 to-cyan-500/10 bg-noise"
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
};

export default MembershipUpgrade;