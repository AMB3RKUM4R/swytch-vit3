import { motion } from 'framer-motion';
import { EyeOff, Database, Users } from 'lucide-react';
import { useModal } from '@/context/ModalContext';
import { auth } from '@/lib/firebaseConfig';

const DSPETPrivacy: React.FC = () => {
  const { setActiveModal, setShowMessage } = useModal();

  const handleAcknowledgePrivacy = () => {
    if (!auth.currentUser) {
      setActiveModal('auth');
      setShowMessage('⚠️ Sign in to acknowledge privacy statement!');
      return;
    }
    setShowMessage('✅ Privacy statement acknowledged!');
    setActiveModal('payment'); // Prompt deposit for privacy-related actions
  };

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } } }}
      className="text-center relative"
    >
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1620121692029-d088224ddc74?q=80&w=2070&auto=format&fit=crop)' }}
      />
      <motion.div
        className="relative bg-gray-900/70 border border-rose-500/30 p-6 rounded-2xl shadow-xl backdrop-blur-md hover:shadow-cyan-500/50 transition-all bg-gradient-to-r from-rose-500/20 to-cyan-500/20"
        whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(34, 211, 238, 0.7)' }}
      >
        <div className="space-y-8">
          <h2 className="text-4xl lg:text-5xl font-extrabold text-white flex items-center justify-center gap-4 font-poppins">
            <EyeOff className="text-cyan-400 w-12 h-12 animate-pulse" /> DSPET Privacy Statement
          </h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed font-inter">
            DSPET safeguards privacy, collecting no user data.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <motion.div
              variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } } }}
              className="bg-gray-800/50 p-6 rounded-lg hover:bg-gray-800/70 transition"
            >
              <Database className="text-cyan-400 w-8 h-8 mx-auto mb-4" />
              <p className="text-lg text-gray-200 font-inter">No data used for operations.</p>
            </motion.div>
            <motion.div
              variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } } }}
              className="bg-gray-800/50 p-6 rounded-lg hover:bg-gray-800/70 transition"
            >
              <Users className="text-cyan-400 w-8 h-8 mx-auto mb-4" />
              <p className="text-lg text-gray-200 font-inter">Encrypted, pseudonymous data.</p>
            </motion.div>
          </div>
          <motion.button
            className="px-6 py-3 bg-rose-600 text-white hover:bg-cyan-500 rounded-lg font-semibold font-poppins"
            onClick={handleAcknowledgePrivacy}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Acknowledge Privacy"
          >
            Acknowledge Privacy
          </motion.button>
          <p className="text-xl text-cyan-300 italic font-inter">Consent to DSPET’s privacy practices.</p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DSPETPrivacy;