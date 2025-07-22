// src/components/market/TrustProgression.tsx
import { FC } from 'react';
import { motion } from 'framer-motion';
import { Gauge, TrendingUp, CheckCircle } from 'lucide-react';
import SwytchCard from '../SwytchCard';

interface TrustProgressionProps {
  // Assuming trust progression data will be fetched from Firestore or passed as props
  currentTrustLevel?: number;
  nextTrustLevelGoal?: number;
  trustPoints?: number;
}

const TrustProgression: FC<TrustProgressionProps> = ({
  currentTrustLevel = 1,
  nextTrustLevelGoal = 1000,
  trustPoints = 350,
}) => {
  const progressPercentage = (trustPoints / nextTrustLevelGoal) * 100;

  return (
    <SwytchCard gradient="from-green-700/20 to-teal-700/20" className="p-6">
      <h2 className="text-2xl font-bold text-white font-poppins mb-4 text-center flex items-center justify-center gap-2">
        <Gauge className="w-7 h-7 text-primary" /> Trust Progression
      </h2>
      <p className="text-lg text-gray-300 text-center mb-6">
        Increase your Trust to unlock exclusive market benefits!
      </p>

      <div className="space-y-4">
        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
          <div className="flex justify-between items-center mb-2">
            <p className="text-md font-semibold text-white">Current Trust Level: {currentTrustLevel}</p>
            <p className="text-sm text-gray-400">{trustPoints} / {nextTrustLevelGoal} Points</p>
          </div>
          <div className="w-full bg-gray-600 rounded-full h-2.5">
            <motion.div
              className="bg-primary h-2.5 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1.5 }}
            ></motion.div>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-right">Next Level: {currentTrustLevel + 1}</p>
        </div>

        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-yellow-400" /> How to Earn Trust
          </h3>
          <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
            <li>Complete successful trades on the Marketplace.</li>
            <li>Participate in community events.</li>
            <li>Hold PET Member status.</li>
            <li>Refer new users to the platform.</li>
          </ul>
        </div>

        <div className="text-center mt-6">
          <motion.button
            className="btn-primary flex items-center justify-center mx-auto"
            onClick={() => alert('Learn more about Trust (future feature)')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <CheckCircle className="w-5 h-5 mr-2" /> Learn More
          </motion.button>
        </div>
      </div>
    </SwytchCard>
  );
};

export default TrustProgression;
