import { motion } from 'framer-motion';
import { Scale, Database, Sparkles } from 'lucide-react';

const TaxesSection: React.FC = () => {
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, x: 50 }, visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: 'easeOut' } } }}
    >
      <motion.div
        className="relative bg-gray-900/50 border border-rose-500/20 p-6 rounded-2xl shadow-xl backdrop-blur-md hover:shadow-rose-400/30 transition-all bg-gradient-to-r from-rose-500/10 to-pink-500/10"
        whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(244, 63, 94, 0.5)' }}
      >
        <div className="space-y-8">
          <h2 className="text-4xl lg:text-5xl font-extrabold text-white flex items-center gap-4 font-poppins">
            <Scale className="text-rose-400 w-12 h-12 animate-pulse" /> Taxes
          </h2>
          <p className="text-lg text-gray-300 leading-relaxed font-inter">
            You are responsible for all taxes related to Swytch services or assets.
          </p>
          <ul className="list-none space-y-4 text-lg text-gray-300">
            <li className="flex items-start gap-3"><Database className="text-rose-400 w-6 h-6" /> Tax treatment is uncertain.</li>
            <li className="flex items-start gap-3"><Sparkles className="text-rose-400 w-6 h-6" /> See “Know Your Freedom” for tax education.</li>
          </ul>
          <p className="text-xl text-rose-300 italic font-inter">All tax obligations are yours.</p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TaxesSection;