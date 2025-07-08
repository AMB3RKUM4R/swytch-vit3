import { motion } from 'framer-motion';

const PerformanceMetrics: React.FC = () => {
  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
    >
      <motion.div
        className="relative bg-gray-900/50 border border-rose-500/20 p-6 rounded-2xl shadow-xl backdrop-blur-md hover:shadow-rose-400/30 transition-all bg-gradient-to-r from-rose-500/10 to-rose-400/10 text-center"
        whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(244, 63, 94, 0.5)' }}
      >
        <p className="text-rose-400 text-3xl font-bold font-poppins">4.21%</p>
        <p className="text-gray-300 text-sm mt-2 font-inter">Swytch Profits for July 2025</p>
      </motion.div>
      <motion.div
        className="relative bg-gray-900/50 border border-rose-500/20 p-6 rounded-2xl shadow-xl backdrop-blur-md hover:shadow-rose-400/30 transition-all bg-gradient-to-r from-rose-500/10 to-rose-400/10 text-center"
        whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(244, 63, 94, 0.5)' }}
      >
        <p className="text-rose-400 text-3xl font-bold font-poppins">3.79%</p>
        <p className="text-gray-300 text-sm mt-2 font-inter">Your Max Profits for July 2025</p>
      </motion.div>
      <motion.div
        className="relative bg-gray-900/50 border border-rose-500/20 p-6 rounded-2xl shadow-xl backdrop-blur-md hover:shadow-rose-400/30 transition-all bg-gradient-to-r from-rose-500/10 to-rose-400/10 text-center"
        whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(244, 63, 94, 0.5)' }}
      >
        <p className="text-rose-400 text-3xl font-bold font-poppins">462.14%</p>
        <p className="text-gray-300 text-sm mt-2 font-inter">Swytch Profits Since Inception</p>
      </motion.div>
    </motion.div>
  );
};

export default PerformanceMetrics;