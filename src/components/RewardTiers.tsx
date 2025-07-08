import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { useState } from 'react';
import { useModal } from '@/context/ModalContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';

interface RewardTier {
  id: number;
  title: string;
  reward: string;
  requirement: string;
  image: string;
}

interface RewardTiersProps {
  userId: string | null;
  goldBalance: number;
  setGoldBalance: React.Dispatch<React.SetStateAction<number>>;
  updatePlayerFirestore: (updates: Partial<any>) => Promise<void>;
}

const rewardTiers: RewardTier[] = [
  { id: 1, title: 'Initiate', reward: '1.0% Monthly', requirement: 'Basic Activity', image: '/bg.jpg' },
  { id: 2, title: 'Apprentice', reward: '1.3% Monthly', requirement: '$500 Deposit', image: '/bg.jpg' },
  { id: 3, title: 'Seeker', reward: '1.6% Monthly', requirement: '$1000 Deposit', image: '/bg.jpg' },
  { id: 4, title: 'Guardian', reward: '1.9% Monthly', requirement: '$2500 Deposit', image: '/bg.jpg' },
  { id: 5, title: 'Sage', reward: '2.2% Monthly', requirement: '$5000 Deposit + Raziel Quests', image: '/bg.jpg' },
  { id: 6, title: 'Archon', reward: '2.5% Monthly', requirement: '$10000 Deposit + Full Raziel', image: '/bg.jpg' },
  { id: 7, title: 'Alchemist', reward: '2.8% Monthly', requirement: '$25000 Deposit', image: '/bg.jpg' },
  { id: 8, title: 'Elder', reward: '3.1% Monthly', requirement: '$50000 Deposit', image: '/bg.jpg' },
  { id: 9, title: 'Mythic PET', reward: '3.3% Monthly', requirement: '$100000 Deposit + Full Raziel', image: '/bg.jpg' },
];

const RewardTiers: React.FC<RewardTiersProps> = ({ userId, goldBalance, setGoldBalance, updatePlayerFirestore }) => {
  const [isScrolling, setIsScrolling] = useState(true);
  const { setActiveModal, setShowMessage } = useModal();

  const handleUnlockTier = async (tier: RewardTier) => {
    if (!userId) {
      setShowMessage('⚠️ Please sign in to unlock tiers!');
      setActiveModal('auth');
      return;
    }
    const minDeposit = tier.requirement.includes('Deposit')
      ? parseFloat(tier.requirement.match(/\$([\d,]+)/)?.[1].replace(',', '') || '0')
      : 0;
    const equivalentJewelCost = minDeposit * 830;

    if (goldBalance < equivalentJewelCost) {
      setShowMessage(`⚠️ You need at least ${equivalentJewelCost} JEWELS to unlock ${tier.title} tier!`);
      setActiveModal('error');
      return;
    }
    try {
      const newGoldBalance = goldBalance - equivalentJewelCost;
      await updatePlayerFirestore({
        jewels: newGoldBalance,
        level: tier.title,
      });
      await addDoc(collection(db, 'TierUnlocks'), {
        userId,
        tier: tier.title,
        jewelsDeducted: equivalentJewelCost,
        timestamp: serverTimestamp(),
      });
      setGoldBalance(newGoldBalance);
      setShowMessage(`✅ Unlocked ${tier.title} tier! ${equivalentJewelCost} JEWELS deducted.`);
      setActiveModal('unlockSuccess');
    } catch (err) {
      console.error('Unlock error:', err);
      setShowMessage('⚠️ Failed to unlock tier. Please try again.');
      setActiveModal('error');
    }
  };

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 50, scale: 0.95 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut', type: 'spring', stiffness: 80 } } }}
      className="space-y-8 max-w-7xl mx-auto"
      onMouseEnter={() => setIsScrolling(false)}
      onMouseLeave={() => setIsScrolling(true)}
    >
      <h2 className="text-4xl font-extrabold text-white text-center flex items-center justify-center gap-4 font-poppins">
        <Star className="w-10 h-10 text-rose-400 animate-pulse" /> Energy Reward Tiers
      </h2>
      <p className="text-lg text-gray-300 max-w-3xl mx-auto text-center font-inter">
        Climb the ranks of the Petaverse by earning JEWELS. Each tier unlocks higher monthly rewards and exclusive benefits.
      </p>
      <div className="relative overflow-hidden no-scrollbar">
        <motion.div
          className="flex gap-6"
          variants={{ animate: { x: ['0%', '-50%'], transition: { x: { repeat: Infinity, repeatType: 'loop', duration: 20, ease: 'linear' } } } }}
          animate={isScrolling ? 'animate' : undefined}
        >
          {[...rewardTiers, ...rewardTiers].map((tier, i) => (
            <motion.div
              key={`${tier.id}-${i}`}
              className="relative bg-gray-900/50 border border-rose-500/20 p-6 rounded-2xl shadow-xl backdrop-blur-md hover:shadow-rose-400/30 transition-all bg-gradient-to-r from-rose-500/10 to-pink-500/10 flex-shrink-0 w-[280px]"
              whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(244, 63, 94, 0.5)' }}
              onClick={() => handleUnlockTier(tier)}
              role="button"
              tabIndex={0}
              aria-label={`Unlock ${tier.title} Tier`}
            >
              <img src={tier.image} alt={`${tier.title} Tier`} className="w-full h-36 object-cover rounded-lg mb-4" onError={(e) => { e.currentTarget.src = '/fallback.jpg'; }} />
              <h3 className="text-xl font-bold text-rose-400 flex items-center gap-2 font-poppins">
                <Star className="w-5 h-5 animate-pulse" /> {tier.title}
              </h3>
              <p className="text-white mb-2 font-inter">Reward: {tier.reward}</p>
              <p className="text-gray-300 text-sm mb-4 font-inter">Requirement: {tier.requirement}</p>
              <motion.button
                className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg w-full font-semibold font-poppins"
                onClick={(e) => {
                  e.stopPropagation();
                  handleUnlockTier(tier);
                }}
                whileHover={{ scale: 1.05 }}
                disabled={!userId || goldBalance < (parseFloat(tier.requirement.match(/\$([\d,]+)/)?.[1].replace(',', '') || '0') * 830)}
                aria-label={`Unlock ${tier.title} Tier`}
              >
                Unlock Tier
              </motion.button>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default RewardTiers;