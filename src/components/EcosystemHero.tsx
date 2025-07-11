import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { EcosystemHeroProps } from '@/lib/types';

const sectionVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut', type: 'spring', stiffness: 100 } },
};

const orbitVariants = {
  animate: { rotate: 360, transition: { duration: 20, repeat: Infinity, ease: 'linear' } },
};

const EcosystemHero: React.FC<EcosystemHeroProps> = ({ userId, goldBalance, mousePosition, setActiveModal, setShowMessage }) => {
  const handleEnterPetaverse = () => {
    if (!userId) {
      setActiveModal('auth');
      setShowMessage('⚠️ Sign in to enter the Petaverse!');
      return;
    }
    setShowMessage('ℹ️ Entering the Petaverse...');
    setActiveModal('payment');
  };

  return (
    <motion.div
      variants={sectionVariants}
      className="relative text-center bg-gray-900/70 backdrop-blur-lg rounded-3xl p-12 border border-rose-500/30 shadow-2xl hover:shadow-cyan-500/50 transition-all"
      style={{
        backgroundImage: `url(https://images.unsplash.com/photo-1612835362596-4b0b2b1b0b0c?q=80&w=2070&auto=format&fit=crop)`,
        backgroundSize: 'cover',
        backgroundPosition: `${50 + mousePosition.x * 5}% ${50 + mousePosition.y * 5}%`,
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-rose-500/60 to-cyan-500/60 rounded-3xl" />
      <motion.div className="absolute inset-0 pointer-events-none" variants={orbitVariants} animate="animate">
        <motion.div className="absolute top-10 left-10 w-4 h-4 bg-rose-400 rounded-full opacity-50" animate={{ scale: [1, 1.5, 1], transition: { duration: 2, repeat: Infinity } }} />
        <motion.div className="absolute bottom-10 right-10 w-6 h-6 bg-cyan-400 rounded-full opacity-50" animate={{ scale: [1, 1.3, 1], transition: { duration: 3, repeat: Infinity } }} />
      </motion.div>
      <div className="relative space-y-6">
        <motion.h2
          className="text-5xl sm:text-7xl font-extrabold text-rose-400 flex items-center justify-center gap-4 font-poppins"
          animate={{ y: [0, -10, 0], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } }}
        >
          <Sparkles className="w-12 h-12 animate-pulse text-cyan-400" /> Swytch Command Hub
        </motion.h2>
        <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto font-inter">
          The AI-orchestrated heart of the Petaverse, where education, identity, and wealth converge.
        </p>
        {userId && (
          <p className="text-gray-300 text-center font-inter">
            Your JEWELS: <span className="font-bold text-cyan-400">{goldBalance} JEWELS</span>
          </p>
        )}
        <motion.button
          className="inline-flex items-center px-8 py-4 bg-rose-600 text-white hover:bg-cyan-500 rounded-full text-lg font-semibold group font-poppins"
          onClick={handleEnterPetaverse}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Enter the Petaverse"
        >
          Enter the Petaverse
          <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform duration-200" />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default EcosystemHero;