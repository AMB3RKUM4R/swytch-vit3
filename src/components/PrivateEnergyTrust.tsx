import { motion } from 'framer-motion';
import { Landmark, ShieldCheck, BookOpen, Scale, FileText } from 'lucide-react';
import { useModal } from '@/context/ModalContext';

const PrivateEnergyTrust: React.FC = () => {
  const { setActiveModal } = useModal();

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 50, scale: 0.95 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut', type: 'spring', stiffness: 80 } } }}
      className="md:col-span-2"
    >
      <motion.div
        className="relative bg-gray-900/50 border border-rose-500/20 p-6 rounded-2xl shadow-xl backdrop-blur-md hover:shadow-rose-400/30 transition-all bg-gradient-to-r from-pink-500/10 to-rose-500/10"
        whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(244, 63, 94, 0.5)' }}
      >
        <div className="space-y-6">
          <div className="flex items-center mb-4 text-rose-400">
            <Landmark className="mr-3 w-8 h-8 animate-pulse" aria-hidden="true" />
            <h3 className="text-3xl font-bold font-poppins">What is a Private Energy Trust?</h3>
          </div>
          <p className="text-lg text-gray-300 font-inter">
            The Swytch Private Energy Trust (PMA) operates outside public jurisdiction, protected by U.S. Constitutional law and UDHR. As a member, you’re a Beneficiary, not a user, with sovereign rights.
          </p>
          <div className="grid sm:grid-cols-2 gap-6">
            <motion.div className="flex items-start gap-4" whileHover={{ x: 5 }}>
              <ShieldCheck className="text-rose-400 w-6 h-6 mt-1 animate-pulse" aria-hidden="true" />
              <p className="text-gray-300 font-inter">Protected by contract law and natural rights, free from government oversight.</p>
            </motion.div>
            <motion.div className="flex items-start gap-4" whileHover={{ x: 5 }}>
              <BookOpen className="text-rose-400 w-6 h-6 mt-1 animate-pulse" aria-hidden="true" />
              <p className="text-gray-300 font-inter">Full legal rights to share, learn, earn, and evolve in the Swytch ecosphere.</p>
            </motion.div>
            <motion.div className="flex items-start gap-4" whileHover={{ x: 5 }}>
              <Scale className="text-rose-400 w-6 h-6 mt-1 animate-pulse" aria-hidden="true" />
              <p className="text-gray-300 font-inter">Disputes resolved via private arbitration, not public courts.</p>
            </motion.div>
            <motion.div className="flex items-start gap-4" whileHover={{ x: 5 }}>
              <FileText className="text-rose-400 w-6 h-6 mt-1 animate-pulse" aria-hidden="true" />
              <p className="text-gray-300 font-inter">Rights enshrined in UDHR and Amendments: 1st, 5th, 9th, 10th, 14th.</p>
            </motion.div>
          </div>
          <motion.a
            href="#freedom"
            className="bg-rose-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 font-poppins"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveModal('Disclosure')}
            aria-label="View Freedom Documents"
          >
            <BookOpen className="w-5 h-5" /> View Freedom Docs
          </motion.a>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PrivateEnergyTrust;