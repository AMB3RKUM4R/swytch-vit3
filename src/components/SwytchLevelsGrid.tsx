import { FC } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Sparkles, DollarSign } from 'lucide-react';
import { Level, SwytchLevelsGridProps, MembershipTier, MEMBERSHIP_TIERS } from '@/lib/types';

const swytchLevels: Level[] = Object.entries(MEMBERSHIP_TIERS).map(([id, { name, amount, contentRoute }]) => ({
  id: id as MembershipTier,
  title: name,
  cost: amount,
  contentRoute,
  level: 0,
  reward: '',
  energyRequired: '',
  perks: [],
  icon: Sparkles,
  image: '/bg.jpg',
}));

const levelOrder: Record<MembershipTier, number> = {
  ecosystem: 1,
  gamers: 2,
  gold: 3,
};

const SwytchLevelsGrid: FC<SwytchLevelsGridProps> = ({ userId, currentLevel, isPending, authLoading, setShowMessage }) => {
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
      <div className="relative overflow-hidden">
        <motion.div
          className="flex space-x-6"
          variants={{ animate: { x: ['0%', '-50%'], transition: { x: { repeat: Infinity, repeatType: 'loop', duration: 20, ease: 'linear' } } } }}
          animate="animate"
        >
          {swytchLevels.map((level, index) => (
            <motion.div
              key={`${level.id}-${index}`}
              className="min-w-[250px] bg-gray-900/50 p-6 rounded-2xl border border-cyan-400/20 hover:shadow-cyan-400/30 transition-all backdrop-blur-md"
              whileHover={{ scale: 1.05 }}
            >
              <div className="relative">
                <div className="flex items-center gap-2 mb-4">
                  {level.icon && <level.icon className="w-6 h-6 text-cyan-400" />}
                  <h4 className="text-xl font-bold text-white font-poppins">Level {levelOrder[level.id]}: {level.title}</h4>
                </div>
                <p className="text-sm text-rose-300 font-inter">Unlocks {level.contentRoute}</p>
                <p className="text-cyan-400 font-semibold font-poppins">{level.reward} Monthly Yield</p>
                <p className="text-gray-400 text-sm font-inter">Deposit: ${level.cost} USDT</p>
                <ul className="mt-4 space-y-2 text-gray-300 text-sm font-inter">
                  {level.perks.map((perk, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-cyan-400" /> {perk}
                    </li>
                  ))}
                </ul>
                <motion.button
                  className={`w-full p-3 rounded-lg font-semibold flex items-center justify-center gap-2 font-poppins ${
                    levelOrder[level.id] <= currentLevel
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      : isPending
                      ? 'bg-yellow-600 text-white'
                      : 'bg-rose-600 hover:bg-rose-700 text-white'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMessage(`ℹ️ Purchasing ${level.title}`);
                  }}
                  disabled={levelOrder[level.id] <= currentLevel || isPending || authLoading || !userId}
                  whileHover={{ scale: levelOrder[level.id] > currentLevel && !isPending ? 1.05 : 1 }}
                  whileTap={{ scale: levelOrder[level.id] > currentLevel && !isPending ? 0.95 : 1 }}
                  aria-label={isPending ? 'Processing Payment' : levelOrder[level.id] <= currentLevel ? 'Already Reached' : `Purchase ${level.title}`}
                >
                  <DollarSign className="w-5 h-5" />
                  {isPending
                    ? 'Processing...'
                    : levelOrder[level.id] <= currentLevel
                    ? 'Already Reached'
                    : `Purchase ${level.title}`}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SwytchLevelsGrid;