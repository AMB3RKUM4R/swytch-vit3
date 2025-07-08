import { motion } from 'framer-motion';
import { Key, Link, UserX } from 'lucide-react';

const WalletSecurity: React.FC = () => {
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } } }}
      className="text-center"
    >
      <motion.div
        className="relative bg-gray-900/50 border border-rose-500/20 p-6 rounded-2xl shadow-xl backdrop-blur-md hover:shadow-rose-400/30 transition-all bg-gradient-to-r from-rose-500/10 to-cyan-500/10"
        whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(244, 63, 94, 0.5)' }}
      >
        <div className="space-y-10">
          <h2 className="text-4xl lg:text-5xl font-extrabold text-white flex items-center justify-center gap-4 font-poppins">
            <Key className="text-rose-400 w-12 h-12 animate-pulse" /> Wallet Security
          </h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed font-inter">
            You are responsible for securing your self-custodial wallet’s private keys.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <motion.div
              variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } } }}
              className="bg-gray-800/50 p-6 rounded-lg hover:bg-gray-800/70 transition"
            >
              <Link className="text-rose-400 w-8 h-8 mx-auto mb-4" />
              <p className="text-lg text-gray-200 font-inter">Swytch cannot recover lost keys.</p>
            </motion.div>
            <motion.div
              variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } } }}
              className="bg-gray-800/50 p-6 rounded-lg hover:bg-gray-800/70 transition"
            >
              <UserX className="text-rose-400 w-8 h-8 mx-auto mb-4" />
              <p className="text-lg text-gray-200 font-inter">You manage wallet security.</p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default WalletSecurity;