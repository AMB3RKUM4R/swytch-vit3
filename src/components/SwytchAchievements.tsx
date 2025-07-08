import { motion } from 'framer-motion';
import { Award } from 'lucide-react';
import { SwytchCard } from './SwytchCard';
import { Dispatch, SetStateAction } from 'react';

interface SwytchAchievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
}

interface SwytchAchievementsProps {
  achievements: SwytchAchievement[];
  userId: string | null;
  setShowMessage: Dispatch<SetStateAction<string>>;
  setActiveModal: Dispatch<SetStateAction<string | null>>;
  setShowWalletModal: Dispatch<SetStateAction<boolean>>;
}

const SwytchAchievements: React.FC<SwytchAchievementsProps> = ({ achievements, userId, setShowMessage, setActiveModal, setShowWalletModal }) => {
  const handleClaimAchievement = async (achievementId: string) => {
    if (!userId) {
      setShowMessage('⚠️ Please sign in to claim achievements!');
      setActiveModal('auth');
      return;
    }
    try {
      setShowMessage(`ℹ️ Opening payment for achievement "${achievements.find(a => a.id === achievementId)?.title}". Admin will process your claim.`);
      setActiveModal('payment');
      setShowWalletModal(true);
    } catch (err) {
      console.error('Achievement claim error:', err);
      setShowMessage('⚠️ Failed to initiate achievement claim. Try again.');
      setActiveModal('error');
    }
  };

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 50, scale: 0.95 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut', type: 'spring', stiffness: 100 } } }}
    >
      <SwytchCard gradient="from-cyan-500/10 to-blue-500/10">
        <div className="space-y-6">
          <h3 className="text-3xl font-bold text-white flex items-center gap-3 font-poppins">
            <Award className="w-8 h-8 text-cyan-400 animate-pulse" /> Achievements
          </h3>
          <p className="text-gray-300 font-inter">Unlock milestones to earn rewards and glory!</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {achievements.map(achievement => (
              <div
                key={achievement.id}
                className={`p-4 rounded-lg border ${achievement.unlocked ? 'border-cyan-500 bg-gray-800/50' : 'border-gray-600 opacity-50'}`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Award className={`w-6 h-6 ${achievement.unlocked ? 'text-cyan-400' : 'text-gray-400'}`} />
                  <p className="text-white font-semibold font-poppins">{achievement.title}</p>
                </div>
                <p className="text-sm text-gray-400 font-inter">{achievement.description}</p>
                {!achievement.unlocked && (
                  <motion.button
                    className="mt-2 px-4 py-2 rounded-lg bg-cyan-600 text-white hover:bg-cyan-700 font-semibold font-poppins"
                    onClick={() => handleClaimAchievement(achievement.id)}
                    disabled={!userId}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label={`Claim ${achievement.title} Achievement`}
                  >
                    Claim
                  </motion.button>
                )}
              </div>
            ))}
          </div>
        </div>
      </SwytchCard>
    </motion.div>
  );
};

export default SwytchAchievements;