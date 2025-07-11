import { motion } from 'framer-motion';
import { User, Users, Award, DollarSign } from 'lucide-react';
// Removed: import { useModal } from '@/context/ModalContext'; // Not needed as setActiveModal/setShowMessage are passed as props
import { useAccount } from 'wagmi'; // Added useNetwork for 'chain'
import { useState, useEffect } from 'react';

// IMPORTANT: Import AccountActionsProps from types.ts
import { AccountActionsProps as ImportedAccountActionsProps } from '@/lib/types';


const AccountActions: React.FC<ImportedAccountActionsProps> = ({
  userId,
  referralViews,
  setReferralViews,
  updatePlayerFirestore,
  // Props received from parent (AppContent/App/Page component)
  setActiveModal,
  setShowMessage,
}) => {
  // Removed: const { setActiveModal, setShowMessage } = useModal(); // Redundant as props are passed
  const { chain, address } = useAccount(); // Use chain from useNetwork
  const [activePETs, setActivePETs] = useState(0); // Dynamic PET count

  // Update activePETs based on user actions or Firestore data
  useEffect(() => {
    const fetchPETs = async () => {
      // Use userId directly as it's the effective user ID for Firestore operations
      if (userId) {
        // Mock fetch: Assume Firestore stores activePETs or calculate based on referrals/deposits
        // This is a client-side mock for now; in a real app, you might fetch initial activePETs from Firestore
        // and then update it based on referralViews milestone here.
        const petCount = referralViews >= 5 ? 2 : 1; // Example: 2 PETs for 5+ referrals
        setActivePETs(petCount);
        // Only update Firestore if it's different to avoid unnecessary writes
        await updatePlayerFirestore({ activePETs: petCount });
      }
    };
    fetchPETs();
  }, [userId, referralViews, updatePlayerFirestore]); // Added updatePlayerFirestore to deps

  const handleAccountDetailsClick = () => {
    if (!userId) {
      setActiveModal('auth');
      setShowMessage('⚠️ Sign in to view account details!');
      return;
    }
    const network = chain?.name || 'Unknown';
    setShowMessage(`ℹ️ Connected to ${network} network`);
    // Assuming 'accountDetails' is a valid modal key in your ModalContext.
    // If not, fall back to 'auth' or define a new modal.
    setActiveModal('accountDetails'); // Open the specific account details modal
  };

  const handleReferralClick = () => {
    if (!userId) {
      setActiveModal('auth');
      setShowMessage('⚠️ Please sign in to share referrals!');
      return;
    }
    setReferralViews((prev) => {
      const newViews = prev + 1;
      // This immediately rewards locally, the Firestore update will happen via updatePlayerFirestore.
      updatePlayerFirestore({ referralViews: newViews, jewels: (newViews >= 5 ? 50 : 0) }); // Reward 50 JEWELS for 5+ referrals
      
      // Update activePETs locally based on referral milestones
      if (newViews === 5) { // Example: Increment PETs at 5 referrals
          setActivePETs((prevCount) => prevCount + 1);
      } else if (newViews === 10) { // Example: Another milestone at 10 referrals
          setActivePETs((prevCount) => prevCount + 1);
      }
      return newViews;
    });
    // Assuming 'info' or 'success' is a generic modal type, otherwise define 'referralShared' in ModalContext.
    setActiveModal('info'); // Open a modal to confirm referral copied
    setShowMessage('✅ Referral link copied: https://swytch.io/ref/0xAB...CDEF');
  };

  const handleDepositClick = () => {
    if (!userId) {
      setActiveModal('auth');
      setShowMessage('⚠️ Sign in to deposit!');
      return;
    }
    setActiveModal('payment'); // Open the payment modal
    setShowMessage('ℹ️ Opening deposit modal...');
    // Simulate PET activation after deposit (mock)
    // This logic might need to be tied to actual successful deposits from PaymentModal's callback.
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