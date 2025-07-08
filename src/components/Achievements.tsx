import { motion } from 'framer-motion';
import { Award, Star } from 'lucide-react';
import { useModal } from '@/context/ModalContext';
import { auth } from '@/lib/firebaseConfig';

interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
}

interface AchievementsProps {
  achievements: Achievement[];
}

const Achievements: React.FC<AchievementsProps> = ({ achievements }) => {
  const { setActiveModal, setShowMessage } = useModal();

  const handleAchievementClick = (title: string) => {
    if (!auth.currentUser) {
      setActiveModal('auth');
      setShowMessage('⚠️ Sign in to unlock achievements!');
      return;
    }
    setShowMessage(`ℹ️ Viewing ${title}! Deposit to unlock more!`);
    setActiveModal('payment');
  };

  return (
    <motion.div
      className="relative bg-gray-900/70 border border-rose-500/30 p-6 rounded-2xl shadow-xl backdrop-blur-md hover:shadow-cyan-500/50 transition-all bg-gradient-to-r from-rose-500/20 to-cyan-500/20"
      whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(34, 211, 238, 0.7)' }}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20 rounded-2xl"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop)' }}
      />
      <div className="space-y-6 relative">
        <h3 className="text-3xl font-bold text-white flex items-center justify-center gap-3 font-poppins">
          <Award className="w-8 h-8 text-cyan-400 animate-pulse" /> Achievements
        </h3>
        <p className="text-gray-300 font-inter">Earn milestones to showcase your mastery in the Swytch Petaverse!</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {achievements.map((achievement) => (
            <motion.div
              key={achievement.id}
              className={`p-4 rounded-lg border ${achievement.unlocked ? 'border-cyan-400 bg-gray-800/50' : 'border-gray-600 opacity-50'}`}
              onClick={() => handleAchievementClick(achievement.title)}
              whileHover={{ scale: 1.03 }}
            >
              <div className="flex items-center gap-3 mb-2">
                <Star className={`w-6 h-6 ${achievement.unlocked ? 'text-cyan-400' : 'text-gray-400'}`} />
                <p className="text-white font-semibold font-poppins">{achievement.title}</p>
              </div>
              <p className="text-sm text-gray-400 font-inter">{achievement.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default Achievements;