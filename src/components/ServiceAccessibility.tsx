import { motion } from 'framer-motion';
import { Server } from 'lucide-react';

const ServiceAccessibility: React.FC = () => {
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, x: -50 }, visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: 'easeOut' } } }}
      className="flex flex-col lg:flex-row items-center gap-12"
    >
      <div className="lg:w-1/2 space-y-6">
        <h2 className="text-4xl lg:text-5xl font-extrabold text-white flex items-center gap-4 font-poppins">
          <Server className="text-rose-400 w-12 h-12 animate-pulse" /> Service Accessibility
        </h2>
        <p className="text-lg text-gray-300 leading-relaxed font-inter">
          Swytch does not guarantee service quality or accessibility. Conduct due diligence.
        </p>
        <p className="text-xl text-rose-300 italic font-inter">Use Swytch if suitable for your finances.</p>
      </div>
      <motion.div
        variants={{ hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: 'easeOut' } } }}
        className="lg:w-1/2"
      >
        <motion.div
          className="relative bg-gray-900/50 border border-rose-500/20 p-6 rounded-2xl shadow-xl backdrop-blur-md hover:shadow-rose-400/30 transition-all bg-gradient-to-r from-cyan-500/10 to-rose-500/10"
          whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(244, 63, 94, 0.5)' }}
        >
          <p className="text-lg text-gray-200 italic font-inter">Due diligence is critical—services may face disruptions.</p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default ServiceAccessibility;