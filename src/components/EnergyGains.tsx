import { motion } from 'framer-motion';
import { Star, Trophy } from 'lucide-react';
import { serverTimestamp } from 'firebase/firestore'; // Keep serverTimestamp


// IMPORTANT: Import Tier and EnergyGainsProps from lib/types.ts
import { Tier, EnergyGainsProps as ImportedEnergyGainsProps } from '../lib/types';


// Tier interface is now imported from lib/types.ts
const tiers: Tier[] = [ // This array remains local, or could be moved to a constants file.
  { level: 1, title: 'Initiate', reward: '1.0%', deposit: '$100-$499', image: '/bg.jpg' },
  { level: 2, title: 'Apprentice', reward: '1.3%', deposit: '$500-$999', image: '/bg.jpg' },
  { level: 3, title: 'Seeker', reward: '1.6%', deposit: '$1000-$2499', image: '/bg.jpg' },
  { level: 4, title: 'Guardian', reward: '1.9%', deposit: '$2500-$4999', image: '/bg.jpg' },
  { level: 5, title: 'Sage', reward: '2.2%', deposit: '$5000-$9999', image: '/bg.jpg' },
  { level: 6, title: 'Archon', reward: '2.5%', deposit: '$10000-$24999', image: '/bg.jpg' },
  { level: 7, title: 'Alchemist', reward: '2.8%', deposit: '$25000-$49999', image: '/bg.jpg' },
  { level: 8, title: 'Elder', reward: '3.1%', deposit: '$50000-$99999', image: '/bg.jpg' },
  { level: 9, title: 'Mythic PET', reward: '3.3%', deposit: '$100000+', image: '/bg.jpg' },
];

const EnergyGains: React.FC<ImportedEnergyGainsProps> = ({ userId, jewelsBalance, energyBalance, setJewelsBalance, setEnergyBalance, updatePlayerFirestore, setActiveModal, setShowMessage }) => {
  // Removed const { setActiveModal, setShowMessage } = useModal(); as they are now passed as props

  const handleDepositNow = async (tier: Tier) => {
    // Rely on userId prop for authentication check, consistent with other components
    if (!userId) { // Using userId prop directly for auth check
      setShowMessage('⚠️ Please sign in to deposit!');
      setActiveModal('auth');
      return;
    }
    const minDeposit = parseFloat(tier.deposit.split('-')[0].replace('$', '')) || parseFloat(tier.deposit.replace('$', '').replace('+', ''));
    const equivalentJewelsCost = minDeposit * 830; // 1 USD = 830 JEWELS

    if (jewelsBalance < equivalentJewelsCost) { // Corrected from goldBalance to jewelsBalance
      setShowMessage(`⚠️ You need at least ${equivalentJewelsCost} JEWELS to deposit for ${tier.title} tier!`);
      setActiveModal('payment'); // Trigger payment modal for deposit
      return;
    }
    try {
      const newJewelsBalance = jewelsBalance - equivalentJewelsCost; // Deduct from jewelsBalance
      const newEnergyBalance = energyBalance + minDeposit;

      // Update Firestore directly via updatePlayerFirestore prop
      await updatePlayerFirestore({
        jewels: newJewelsBalance, // FIX: Update 'jewels' field
        energy: newEnergyBalance,
        // The 'deposits' field structure might need to be explicitly allowed in Firestore rules
        // if it's an array, you'd use arrayUnion. If it's a single object, this is fine.
        deposits: { amount: minDeposit, tier: tier.title, timestamp: serverTimestamp() },
        updatedAt: serverTimestamp(), // Ensure updatedAt is updated
      });

      setJewelsBalance(newJewelsBalance); // Update local state for jewels
      setEnergyBalance(newEnergyBalance); // Update local state for energy
      setShowMessage(`✅ Deposited $${minDeposit} for ${tier.title} tier! ${equivalentJewelsCost} JEWELS deducted.`);
      setActiveModal('depositSuccess'); // Trigger deposit success modal
    } catch (err) {
      console.error('Deposit error:', err);
      setShowMessage('⚠️ Failed to process deposit. Please try again.');
      setActiveModal('error');
    }
  };

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 50, scale: 0.95 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut', type: 'spring', stiffness: 80 } } }}
      className="space-y-8"
    >
      <h2 className="text-4xl font-extrabold text-white text-center flex items-center justify-center gap-4 font-poppins">
        <Trophy className="w-10 h-10 text-rose-400 animate-pulse" /> Energy Gains ⚡
      </h2>
      <p className="text-lg text-gray-300 max-w-3xl mx-auto text-center font-inter">
        Deposit JEWELS to earn up to 3.3% monthly Energy, plus education bonuses via Raziel.
      </p>
      <div className="relative overflow-hidden">
        <motion.div
          className="flex gap-6"
          variants={{ animate: { x: ['0%', '-50%'], transition: { x: { repeat: Infinity, repeatType: 'loop', duration: 20, ease: 'linear' } } } }}
          animate="animate"
        >
          {[...tiers, ...tiers].map((tier, i) => (
            <motion.div
              key={`${tier.level}-${i}`}
              className="relative bg-gray-900/50 border border-rose-500/20 p-6 rounded-2xl shadow-xl backdrop-blur-md hover:shadow-rose-400/30 transition-all bg-gradient-to-r from-rose-500/10 to-pink-500/10 flex-shrink-0 w-[300px]"
              whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(244, 63, 94, 0.5)' }}
              onClick={() => handleDepositNow(tier)}
              role="button"
              tabIndex={0}
              aria-label={`Deposit for ${tier.title} tier`}
            >
              <img
                src={tier.image}
                alt={tier.title}
                className="w-full h-40 object-cover rounded-lg mb-4"
                onError={(e) => { e.currentTarget.src = '/fallback.jpg'; }}
              />
              <h3 className="text-xl font-bold text-rose-400 flex items-center gap-2 font-poppins">
                <Star className="w-5 h-5" /> Level {tier.level}: {tier.title}
              </h3>
              <p className="text-white mb-2 font-inter">Reward: {tier.reward} Monthly</p>
              <p className="text-gray-300 text-sm mb-4 font-inter">Deposit: {tier.deposit}</p>
              <motion.button
                className={`bg-rose-600 text-white hover:bg-rose-700 px-4 py-2 rounded-lg w-full font-semibold font-poppins`}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent card's onClick from firing
                  handleDepositNow(tier);
                }}
                whileHover={{ scale: 1.05 }} // FIX: Simplified whileHover, removed conditional
                disabled={!userId || jewelsBalance < (parseFloat(tier.deposit.split('-')[0].replace('$', '')) * 830)} // Corrected to jewelsBalance
                aria-label={`Deposit for ${tier.title} tier`}
              >
                Deposit Now
              </motion.button>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default EnergyGains;