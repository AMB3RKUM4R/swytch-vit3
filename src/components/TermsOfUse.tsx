import { motion } from 'framer-motion';
import { FileText, Wallet, Shield, Zap } from 'lucide-react';

const TermsOfUse: React.FC = () => {
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } } }}
      className="flex flex-col lg:flex-row items-center gap-12"
    >
      <div className="lg:w-1/2 space-y-6">
        <h2 className="text-4xl lg:text-5xl font-extrabold text-white flex items-center gap-4 font-poppins">
          <FileText className="text-rose-400 w-12 h-12 animate-pulse" /> Terms of Use
        </h2>
        <p className="text-lg text-gray-300 leading-relaxed font-inter">
          To interact with the Swytch Private Energy Trust Protocol, connect via your self-custodial wallet, governed by third-party terms.
        </p>
        <ul className="list-none space-y-4 text-lg text-gray-300">
          <li className="flex items-start gap-3"><Wallet className="text-rose-400 w-6 h-6" /> Review wallet terms for fees and risks.</li>
          <li className="flex items-start gap-3"><Shield className="text-rose-400 w-6 h-6" /> Swytch is not an intermediary or custodian.</li>
          <li className="flex items-start gap-3"><Zap className="text-rose-400 w-6 h-6" /> Gas fees are non-refundable.</li>
        </ul>
      </div>
      <motion.div
        variants={{ hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: 'easeOut' } } }}
        className="lg:w-1/2"
      >
        <motion.div
          className="relative bg-gray-900/50 border border-rose-500/20 p-6 rounded-2xl shadow-xl backdrop-blur-md hover:shadow-rose-400/30 transition-all bg-gradient-to-r from-rose-500/10 to-pink-500/10"
          whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(244, 63, 94, 0.5)' }}
        >
          <p className="text-lg text-gray-200 italic font-inter">Your wallet, your responsibility—comply with its terms.</p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default TermsOfUse;