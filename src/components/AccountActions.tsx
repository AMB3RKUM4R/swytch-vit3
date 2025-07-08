import { motion } from 'framer-motion';
import { User, Users, Award, DollarSign } from 'lucide-react';
import { useModal } from '@/context/ModalContext';
import { useAccount } from 'wagmi';
import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebaseConfig'; // Firebase auth import

interface AccountActionsProps {
  userId: string | null;
  referralViews: number;
  setReferralViews: React.Dispatch<React.SetStateAction<number>>;
  updatePlayerFirestore: (updates: Partial<any>) => Promise<void>;
}

const AccountActions: React.FC<AccountActionsProps> = ({ userId, referralViews, setReferralViews, updatePlayerFirestore }) => {
  const { setActiveModal, setShowMessage } = useModal();
  const { chain, address } = useAccount();
  const [activePETs, setActivePETs] = useState(0); // Dynamic PET count

  // Update activePETs based on user actions or Firestore data
  useEffect(() => {
    const fetchPETs = async () => {
      if (userId && auth.currentUser) {
        // Mock fetch: Assume Firestore stores activePETs or calculate based on referrals/deposits
        const petCount = referralViews >= 5 ? 2 : 1; // Example: 2 PETs for 5+ referrals
        setActivePETs(petCount);
        await updatePlayerFirestore({ activePETs: petCount });
      }
    };
    fetchPETs();
  }, [userId, referralViews, updatePlayerFirestore]);

  const handleAccountDetailsClick = () => {
    if (!userId || !auth.currentUser) {
      setActiveModal('auth');
      setShowMessage('⚠️ Sign in to view account details!');
      return;
    }
    const network = chain?.name || 'Unknown';
    setShowMessage(`ℹ️ Connected to ${network} network`);
    setActiveModal('accountDetails');
  };

  const handleReferralClick = () => {
    if (!userId || !auth.currentUser) {
      setActiveModal('auth');
      setShowMessage('⚠️ Please sign in to share referrals!');
      return;
    }
    setReferralViews((prev) => {
      const newViews = prev + 1;
      updatePlayerFirestore({ referralViews: newViews, jewels: newViews >= 5 ? 50 : 0 }); // Reward 50 JEWELS for 5+ referrals
      if (newViews >= 5) {
        setActivePETs((prev) => prev + 1); // Increment PETs for milestone
      }
      return newViews;
    });
    setActiveModal('referralShared');
    setShowMessage('✅ Referral link copied: https://swytch.io/ref/0xAB...CDEF');
  };

  const handleDepositClick = () => {
    if (!userId || !auth.currentUser) {
      setActiveModal('auth');
      setShowMessage('⚠️ Sign in to deposit!');
      return;
    }
    setActiveModal('payment');
    setShowMessage('ℹ️ Opening deposit modal...');
    // Simulate PET activation after deposit (mock)
    setActivePETs((prev) => prev + 1);
  };

  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto relative"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20 rounded-2xl"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1695825066269-1b1ff78100b0?q=80&w=2070&auto=format&fit=crop)' }}
      />
      {/* Account Details */}
      <motion.div
        className="relative bg-gray-900/70 border border-rose-500/30 p-6 rounded-2xl shadow-xl backdrop-blur-md hover:shadow-cyan-500/50 transition-all bg-gradient-to-r from-rose-500/20 to-cyan-500/20 flex flex-col items-center"
        whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(34, 211, 238, 0.7)' }}
        onClick={handleAccountDetailsClick}
      >
        <User className="w-8 h-8 text-cyan-400 animate-pulse" />
        <p className="text-white font-poppins text-lg font-semibold mt-2">Account Details</p>
        <p className="text-gray-400 text-sm font-inter">{address ? `Connected: ${address.slice(0, 6)}...` : 'Connect Wallet'}</p>
      </motion.div>
      {/* Referrals */}
      <motion.div
        className="relative bg-gray-900/70 border border-rose-500/30 p-6 rounded-2xl shadow-xl backdrop-blur-md hover:shadow-cyan-500/50 transition-all bg-gradient-to-r from-rose-500/20 to-cyan-500/20 flex flex-col items-center"
        whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(34, 211, 238, 0.7)' }}
        onClick={handleReferralClick}
      >
        <Users className="w-8 h-8 text-cyan-400 animate-pulse" />
        <p className="text-white font-poppins text-lg font-semibold mt-2">Referrals</p>
        <p className="text-rose-400 text-sm font-inter">Views: {referralViews} {referralViews >= 5 && <span className="text-cyan-400">+50 JEWELS!</span>}</p>
      </motion.div>
      {/* Active PETs */}
      <motion.div
        className="relative bg-gray-900/70 border border-rose-500/30 p-6 rounded-2xl shadow-xl backdrop-blur-md hover:shadow-cyan-500/50 transition-all bg-gradient-to-r from-rose-500/20 to-cyan-500/20 flex flex-col items-center"
        whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(34, 211, 238, 0.7)' }}
      >
        <Award className="w-8 h-8 text-cyan-400 animate-pulse" />
        <p className="text-white font-poppins text-lg font-semibold mt-2">Active PETs</p>
        <p className="text-cyan-400 font-semibold text-2xl mt-1 font-poppins">{activePETs}</p>
        <p className="text-gray-400 text-sm font-inter">Stake to activate more!</p>
      </motion.div>
      {/* Deposit */}
      <motion.div
        className="relative bg-gray-900/70 border border-rose-500/30 p-6 rounded-2xl shadow-xl backdrop-blur-md hover:shadow-cyan-500/50 transition-all bg-gradient-to-r from-rose-500/20 to-cyan-500/20 flex flex-col items-center"
        whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(34, 211, 238, 0.7)' }}
        onClick={handleDepositClick}
      >
        <DollarSign className="w-8 h-8 text-cyan-400 animate-pulse" />
        <p className="text-white font-poppins text-lg font-semibold mt-2">Deposit</p>
        <p className="text-gray-400 text-sm font-inter">Add JEWELS or GOLD</p>
      </motion.div>
    </motion.div>
  );
};

export default AccountActions;