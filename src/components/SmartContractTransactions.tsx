import { FC, memo } from 'react'; // Added memo for performance optimization
import { motion } from 'framer-motion';
import { Cpu, Rocket, Key, Users, Shield } from 'lucide-react'; // Key is imported as Key, no conflict.
// No useModal or auth imports, as it's a self-contained display component.


// No local interface for SmartContractTransactionsProps as it's self-contained and takes no props.

const SmartContractTransactions: FC = memo(() => { // No props destructured from FC
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, x: 50 }, visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: 'easeOut' } } }}
      className="flex flex-col lg:flex-row-reverse items-center gap-12"
    >
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1620121692029-d088224ddc74?q=80&w=2070&auto=format&fit=crop)' }} // Example background image
      />
      <div className="lg:w-1/2 space-y-6 relative">
        <h2 className="text-4xl lg:text-5xl font-extrabold text-white flex items-center gap-4 font-poppins">
          <Cpu className="text-rose-400 w-12 h-12 animate-pulse" /> Smart Contract Transactions
        </h2>
        <p className="text-lg text-gray-300 leading-relaxed font-inter">
          Transactions are processed via smart contracts, dictating fund distribution and ownership.
        </p>
        <ul className="list-none space-y-4 text-lg text-gray-300">
          <li className="flex items-start gap-3"><Rocket className="text-rose-400 w-6 h-6" /> Transactions are irreversible.</li>
          <li className="flex items-start gap-3"><Key className="text-rose-400 w-6 h-6" /> Evaluate risks before transacting.</li>
          {/* Re-added Users and Shield for consistency, as they're common icons for blockchain concepts.
              You might add more relevant icons here if needed. */}
          <li className="flex items-start gap-3"><Users className="text-rose-400 w-6 h-6" /> Publicly verifiable on blockchain.</li>
          <li className="flex items-start gap-3"><Shield className="text-rose-400 w-6 h-6" /> Secure and transparent.</li>
        </ul>
      </div>
      <motion.div
        variants={{ hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: 'easeOut' } } }}
        className="lg:w-1/2"
      >
        <motion.div
          className="relative bg-gray-900/50 border border-rose-500/20 p-6 rounded-2xl shadow-xl backdrop-blur-md hover:shadow-rose-400/30 transition-all bg-gradient-to-r from-pink-500/10 to-rose-500/10"
          whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(244, 63, 94, 0.5)' }}
        >
          <p className="text-lg text-gray-200 italic font-inter">Smart contracts ensure trustless execution.</p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
});

export default SmartContractTransactions;