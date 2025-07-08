import { motion } from 'framer-motion';
import { Globe, Rocket, Users, Shield } from 'lucide-react';
import { useModal } from '@/context/ModalContext';
import { auth } from '@/lib/firebaseConfig';

const DSPETDisclosure: React.FC = () => {
  const { setActiveModal, setShowMessage } = useModal();

  const handleAcknowledgeDisclosure = () => {
    if (!auth.currentUser) {
      setActiveModal('auth');
      setShowMessage('⚠️ Sign in to acknowledge disclosure!');
      return;
    }
    setShowMessage('✅ Disclosure acknowledged!');
    setActiveModal('payment'); // Prompt deposit for disclosure-related actions
  };

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, x: -50 }, visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: 'easeOut' } } }}
      className="flex flex-col lg:flex-row items-center gap-12 relative"
    >
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1620121692029-d088224ddc74?q=80&w=2070&auto=format&fit=crop)' }}
      />
      <div className="lg:w-1/2 space-y-6 relative">
        <h2 className="text-4xl lg:text-5xl font-extrabold text-white flex items-center gap-4 font-poppins">
          <Globe className="text-cyan-400 w-12 h-12 animate-pulse" /> DSPET Disclosure
        </h2>
        <p className="text-lg text-gray-300 leading-relaxed font-inter">
          DSPET enables secure, private energy exchange via blockchain.
        </p>
        <ul className="list-none space-y-4 text-lg text-gray-300">
          <li className="flex items-start gap-3"><Rocket className="text-cyan-400 w-6 h-6" /> Trustless energy exchange (JEWELS).</li>
          <li className="flex items-start gap-3"><Users className="text-cyan-400 w-6 h-6" /> Governed by SWYTCH token holders.</li>
          <li className="flex items-start gap-3"><Shield className="text-cyan-400 w-6 h-6" /> Audited smart contracts.</li>
        </ul>
        <motion.button
          className="px-6 py-3 bg-rose-600 text-white hover:bg-cyan-500 rounded-lg font-semibold font-poppins"
          onClick={handleAcknowledgeDisclosure}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Acknowledge Disclosure"
        >
          Acknowledge Disclosure
        </motion.button>
      </div>
      <motion.div
        variants={{ hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: 'easeOut' } } }}
        className="lg:w-1/2"
      >
        <motion.div
          className="relative bg-gray-900/70 border border-rose-500/30 p-6 rounded-2xl shadow-xl backdrop-blur-md hover:shadow-cyan-500/50 transition-all bg-gradient-to-r from-rose-500/20 to-cyan-500/20"
          whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(34, 211, 238, 0.7)' }}
        >
          <p className="text-lg text-gray-200 italic font-inter">DSPET revolutionizes energy exchange.</p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default DSPETDisclosure;