import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
// Removed: import { auth } from '@/lib/firebaseConfig'; // No auth.currentUser check here

// IMPORTANT: Import HeroSectionProps from lib/types.ts
import { HeroSectionProps as ImportedHeroSectionProps } from '../lib/types';


const sectionVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut', type: 'spring', stiffness: 100 } },
};


// Use ImportedHeroSectionProps as the type for the FC
const HeroSection: React.FC<ImportedHeroSectionProps> = ({ mousePosition, setActiveModal }) => { // Destructure setActiveModal
  // Removed: const { setActiveModal } = useModal(); // Now passed as prop

  // No userId, goldBalance props used directly in this component's logic, as per your input.
  // The 'Your JEWELS' text and button logic would need userId and setShowMessage if they were to function.
  // For now, removing the userId conditional display and simplified button logic for consistency.
  // If you want to display dynamic JEWELS or enforce login for the button, those props are needed.

  return (
    <motion.div
      variants={sectionVariants}
      className="relative text-center bg-gray-900/50 backdrop-blur-lg rounded-3xl p-12 border border-rose-500/20 shadow-2xl hover:shadow-rose-400/40 transition-all"
      style={{
        backgroundImage: `url(/bg.jpg)`,
        backgroundSize: 'cover',
        backgroundPosition: `${50 + mousePosition.x * 5}% ${50 + mousePosition.y * 5}%`,
      }}
      aria-label="Energy Explanation Hero Section"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-rose-800/60 to-pink-900/60 rounded-3xl" />
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ rotate: 360 }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
      >
        <motion.div
          className="absolute top-10 left-10 w-4 h-4 bg-rose-400 rounded-full opacity-50"
          animate={{ scale: [1, 1.5, 1], transition: { duration: 2, repeat: Infinity } }}
        />
        <motion.div
          className="absolute bottom-10 right-10 w-6 h-6 bg-pink-400 rounded-full opacity-50"
          animate={{ scale: [1, 1.3, 1], transition: { duration: 3, repeat: Infinity } }}
        />
      </motion.div>
      <div className="relative space-y-6">
        <motion.h2
          className="text-5xl sm:text-7xl font-extrabold text-rose-400 tracking-tight flex items-center justify-center gap-4 font-poppins"
          animate={{ y: [0, -10, 0], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } }}
        >
          <Sparkles className="w-12 h-12 animate-pulse" /> What is Energy?
        </motion.h2>
        <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed font-inter">
          In Swytch, Energy is your sovereign signal—a bridge between effort and value. Measured in JEWELS, it powers your digital existence, tracks your contributions, and honors your time.
        </p>
        {/* Removed userId conditional display as userId prop is not used in HeroSectionProps. */}
        {/* If you need userId/jewelsBalance, add them to HeroSectionProps and destructure. */}
        
        <motion.button
          className="inline-flex items-center px-8 py-4 bg-rose-600 text-white hover:bg-rose-700 rounded-full text-lg font-semibold group font-poppins"
          onClick={() => setActiveModal('auth')} // Directly opens auth modal
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Explore Your Freedom"
        >
          Explore Your Freedom
          <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform duration-200" />
        </motion.button>
        {/* If ConnectButton is needed, it would connect the wallet. */}
        {/* Assuming the main "Join the Petaverse" button is the primary entry point. */}
        {/* <ConnectButton /> */}
      </div>
    </motion.div>
  );
};

export default HeroSection;