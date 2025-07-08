import { motion } from 'framer-motion';
import { Trophy, CircleDollarSign } from 'lucide-react';
import { SwytchCard } from './SwytchCard';
import { MembershipTier, MEMBERSHIP_TIERS } from '../lib/types';

// Define SwytchLevel to match MembershipTier
interface SwytchLevel {
  id: MembershipTier;
  name: string;
  cost: number; // Cost in JEWELS
  contentRoute: string;
}

interface SwytchLevelsGridProps {
  userId: string | null;
  currentLevel: number;
  isPending: boolean;
  authLoading: boolean;
  updatePlayerFirestore: (updates: Partial<any>) => Promise<void>;
  handlePurchaseLevel: (level: SwytchLevel) => Promise<void>;
}

// Map MEMBERSHIP_TIERS to SwytchLevel for display
const swytchLevels: SwytchLevel[] = Object.entries(MEMBERSHIP_TIERS).map(([id, { name, amount, contentRoute }]) => ({
  id: id as MembershipTier,
  name,
  cost: amount,
  contentRoute
}));

// Map MembershipTier to numeric level for comparison
const levelOrder: Record<MembershipTier, number> = {
  ecosystem: 1,
  gamers: 2,
  gold: 3
};

const SwytchLevelsGrid: React.FC<SwytchLevelsGridProps> = ({ userId, currentLevel, isPending, authLoading, handlePurchaseLevel }) => {
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 50, scale: 0.95 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut', type: 'spring', stiffness: 100 } } }}
      className="space-y-6"
    >
      <h3 className="text-3xl font-bold text-white flex items-center justify-center gap-3 font-poppins">
        <Trophy className="w-8 h-8 text-cyan-400 animate-pulse" /> Yield Levels
      </h3>
      <p className="text-lg text-gray-300 text-center max-w-3xl mx-auto font-inter">
        Ascend levels to unlock epic rewards and PETverse powers. Purchase with USDT!
      </p>
      <motion.div
        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10 text-left"
        animate={{ x: ['0%', '-100%'] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      >
        {swytchLevels.map((level) => (
          <SwytchCard
            key={level.id}
            gradient="from-rose-500/10 to-pink-500/10"
            className="relative bg-gray-900/60 rounded-xl p-6 backdrop-blur-md shadow-xl hover:shadow-rose-500/40 transition-all"
            onClick={() => handlePurchaseLevel(level)}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-pink-500/10 rounded-xl" />
            <div className="relative">
              <img
                src="/bg.jpg"
                alt={level.name}
                className="w-full h-32 object-cover rounded-lg border border-rose-500/20 mb-4"
                onError={(e) => { e.currentTarget.src = '/fallback.jpg'; }}
              />
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-rose-500/10 rounded-full">
                  <Trophy className="w-6 h-6 text-cyan-400 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white font-poppins">Level {levelOrder[level.id]}: {level.name}</h4>
                  <p className="text-sm text-rose-300 font-inter">Unlocks {level.contentRoute}</p>
                </div>
              </div>
              <p className="text-gray-300 mb-2 font-inter">
                Cost: <span className="text-white font-semibold">{level.cost} JEWELS</span> (~${level.cost * 0.01} USDT)
              </p>
              <motion.button
                className={`w-full p-3 rounded-lg font-semibold flex items-center justify-center gap-2 font-poppins ${
                  levelOrder[level.id] <= currentLevel
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : isPending
                    ? 'bg-yellow-600 text-white'
                    : 'bg-rose-600 hover:bg-rose-700 text-white'
                }`}
                onClick={(e) => { e.stopPropagation(); handlePurchaseLevel(level); }}
                disabled={levelOrder[level.id] <= currentLevel || isPending || authLoading || !userId}
                whileHover={{ scale: levelOrder[level.id] > currentLevel && !isPending ? 1.05 : 1 }}
                whileTap={{ scale: levelOrder[level.id] > currentLevel && !isPending ? 0.95 : 1 }}
                aria-label={`Purchase Level ${level.name}`}
              >
                <CircleDollarSign className="w-5 h-5" />
                {isPending
                  ? 'Processing...'
                  : levelOrder[level.id] <= currentLevel
                  ? 'Already Reached'
                  : `Purchase Level (~$${level.cost * 0.01})`}
              </motion.button>
            </div>
          </SwytchCard>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default SwytchLevelsGrid;