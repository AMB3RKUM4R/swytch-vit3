import { FC, memo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { AchievementCard } from './AchievementCard';
import { SwytchCard } from './SwytchCard';

interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
}

interface TokenomicsAchievementsProps {
  achievements: Achievement[];
}

const sectionVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut' } }
};

const TokenomicsAchievements: FC<TokenomicsAchievementsProps> = memo(({ achievements }) => {
  return (
    <motion.div variants={sectionVariants}>
      <SwytchCard gradient="from-cyan-500/10 to-blue-500/10">
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-white flex items-center gap-2 font-poppins">
            <Sparkles className="w-6 h-6 text-cyan-400 animate-pulse" /> Achievements
          </h3>
          <div className="space-y-3">
            {achievements.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </div>
      </SwytchCard>
    </motion.div>
  );
});

export default TokenomicsAchievements;