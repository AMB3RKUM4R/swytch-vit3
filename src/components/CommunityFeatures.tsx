import { motion } from 'framer-motion';
import { Vote, MessageSquare, Trophy, Globe2, ShieldCheck, Star } from 'lucide-react';

// IMPORTANT: Import FeatureItem and CommunityFeaturesProps from lib/types.ts
import { FeatureItem, CommunityFeaturesProps as ImportedCommunityFeaturesProps } from '../lib/types';


// FeatureItem interface is now imported from lib/types.ts
const features: FeatureItem[] = [ // This array remains local, or could be moved to a constants file.
  {
    icon: Vote,
    title: 'Decentralized Governance',
    description: 'Vote on proposals using your JEWELS.',
    gradient: 'from-rose-500/20 to-cyan-500/20',
  },
  {
    icon: MessageSquare,
    title: 'Proposal Creation',
    description: 'Submit ideas to drive Swytch forward.',
    gradient: 'from-rose-500/20 to-cyan-500/20',
  },
  {
    icon: Trophy,
    title: 'Contribution Rewards',
    description: 'Earn JEWELS for participation.',
    gradient: 'from-rose-500/20 to-cyan-500/20',
  },
  {
    icon: Globe2,
    title: 'Global Community',
    description: 'Connect with PETs worldwide.',
    gradient: 'from-rose-500/20 to-cyan-500/20',
  },
  {
    icon: ShieldCheck,
    title: 'Transparent Trust',
    description: 'On-chain governance for fairness.',
    gradient: 'from-rose-500/20 to-cyan-500/20',
  },
];



// Use ImportedCommunityFeaturesProps as the type for the FC
const CommunityFeatures: React.FC<ImportedCommunityFeaturesProps> = ({ userId, setActiveModal, setShowMessage }) => {
  const handleFeatureClick = (title: string) => {
    // Rely on userId prop for authentication check, consistent with other components
    if (!userId) { // Using userId prop directly for auth check
      setActiveModal('auth');
      setShowMessage(`⚠️ Sign in to access ${title}!`);
      return;
    }
    setShowMessage(`ℹ️ Exploring ${title}!`);
    setActiveModal('payment'); // Trigger payment modal as intended
  };

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 50, scale: 0.95 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut', type: 'spring', stiffness: 100 } } }}
      className="relative space-y-6"
    >
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1612835362596-4b0b2b1b0b0c?q=80&w=2070&auto=format&fit=crop)' }}
      />
      <h3 className="text-3xl font-bold text-white flex items-center justify-center gap-3 font-poppins">
        <Star className="w-8 h-8 text-cyan-400 animate-pulse" /> Why PETs Own Swytch
      </h3>
      <p className="text-lg text-gray-300 text-center max-w-3xl mx-auto font-inter">
        Swytch empowers every PET to shape the Petaverse.
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10 relative">
        {features.map((feature, i) => ( // Use feature.title as key, assuming it's unique
          <motion.div
            key={feature.title} // Use unique title as key
            className={`relative bg-gray-900/70 border border-rose-500/30 p-6 rounded-2xl shadow-xl backdrop-blur-md hover:shadow-cyan-500/50 transition-all bg-gradient-to-r ${feature.gradient}`}
            whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(34, 211, 238, 0.7)' }}
            onClick={() => handleFeatureClick(feature.title)}
          >
            <motion.div
              variants={{ hidden: { opacity: 0, y: 50, scale: 0.95 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut', type: 'spring', stiffness: 100 } } }} // Reuse sectionVariants here for consistency
              initial="hidden" // Ensure initial and animate are set for inner motion.div
              animate="visible"
              transition={{ delay: i * 0.1 }}
            >
              <div className="flex items-center mb-4"> <h4 className="ml-3 text-xl font-bold text-white font-poppins">{feature.title}</h4>
              </div>
              <p className="text-gray-300 text-sm font-inter">{feature.description}</p>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default CommunityFeatures;