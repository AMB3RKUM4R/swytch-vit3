import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

interface RewardTier {
  id: number;
  title: string;
  reward: string;
  requirement: string;
  image: string;
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

const TrustRewardTiers: React.FC = () => {
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 50, scale: 0.95 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut', type: 'spring', stiffness: 80 } } }}
      className="space-y-8"
    >
      <h3 className="text-3xl font-bold text-white flex items-center justify-center gap-3 font-poppins">
        <Star className="w-8 h-8 text-rose-400 animate-pulse" /> Reward Tiers
      </h3>
      <p className="text-lg text-gray-300 max-w-3xl mx-auto text-center font-inter">
        Climb the ranks to unlock higher monthly yields in the Swytch ecosystem.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {rewardTiers.map((tier) => (
          <motion.div
            key={tier.id}
            className="relative bg-gray-900/50 border border-rose-500/20 p-6 rounded-2xl shadow-xl backdrop-blur-md hover:shadow-rose-400/30 transition-all bg-gradient-to-r from-rose-500/10 to-pink-500/10"
            whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(244, 63, 94, 0.5)' }}
          >
            <div className="flex flex-col items-center text-center">
              <img src={tier.image} alt={tier.title} className="w-full h-40 object-cover rounded-lg mb-4" onError={(e) => { e.currentTarget.src = '/fallback.jpg'; }} />
              <h4 className="text-xl font-bold text-rose-400 font-poppins">{tier.title}</h4>
              <p className="text-gray-300 font-inter">Reward: {tier.reward}</p>
              <p className="text-gray-400 text-sm font-inter">Requirement: {tier.requirement}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default TrustRewardTiers;