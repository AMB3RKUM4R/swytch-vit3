import { motion } from 'framer-motion';
import { AlertTriangle, Code, Link, Server } from 'lucide-react';
import { useModal } from '@/context/ModalContext';
import { auth } from '@/lib/firebaseConfig';

const AssumptionOfRisk: React.FC = () => {
  const { setActiveModal, setShowMessage } = useModal();

  const handleRiskAcknowledgment = () => {
    if (!auth.currentUser) {
      setActiveModal('auth');
      setShowMessage('⚠️ Sign in to acknowledge risks!');
      return;
    }
    setShowMessage('✅ Risks acknowledged. Secure your assets!');
    setActiveModal('payment'); // Prompt deposit for asset protection
  };

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, x: -50 }, visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: 'easeOut' } } }}
      initial="hidden"
      animate="visible"
      className="relative"
    >
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20 rounded-2xl"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1620121692029-d088224ddc74?q=80&w=2070&auto=format&fit=crop)' }}
      />
      <motion.div
        className="relative bg-gray-900/70 border border-rose-500/30 p-6 rounded-2xl shadow-xl backdrop-blur-md hover:shadow-cyan-500/50 transition-all bg-gradient-to-r from-rose-500/20 to-cyan-500/20"
        whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(34, 211, 238, 0.7)' }}
      >
        <div className="space-y-8">
          <h2 className="text-4xl lg:text-5xl font-extrabold text-white flex items-center gap-4 font-poppins">
            <AlertTriangle className="text-cyan-400 w-12 h-12 animate-pulse" /> Assumption of Risk
          </h2>
          <p className="text-lg text-gray-300 leading-relaxed font-inter">
            Engaging with experimental blockchain technology carries inherent risks.
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-lg text-gray-300">
            <li className="flex items-start gap-3 bg-gray-800/50 p-4 rounded-lg hover:bg-gray-800/70 transition">
              <Code className="text-cyan-400 w-6 h-6" /> Bugs or cyberattacks may disrupt operations.
            </li>
            <li className="flex items-start gap-3 bg-gray-800/50 p-4 rounded-lg hover:bg-gray-800/70 transition">
              <Link className="text-rose-400 w-6 h-6" /> Forks may lead to total loss.
            </li>
            <li className="flex items-start gap-3 bg-gray-800/50 p-4 rounded-lg hover:bg-gray-800/70 transition">
              <Link className="text-rose-400 w-6 h-6" /> Swytch assumes no liability.
            </li>
            <li className="flex items-start gap-3 bg-gray-800/50 p-4 rounded-lg hover:bg-gray-800/70 transition">
              <Server className="text-cyan-400 w-6 h-6" /> Third-party services are not Swytch’s responsibility.
            </li>
          </ul>
          <motion.button
            onClick={handleRiskAcknowledgment}
            className="bg-rose-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-rose-700 font-poppins"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Acknowledge Risks
          </motion.button>
          <p className="text-xl text-cyan-300 italic font-inter">Avoid blockchain if uncomfortable with risks.</p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AssumptionOfRisk;