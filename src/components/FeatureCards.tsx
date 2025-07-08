import { motion } from 'framer-motion';
import { Star, Flame, Users, Landmark, BarChart3, Globe, BookOpen, ShieldCheck, Scale } from 'lucide-react';

interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
}

const features: Feature[] = [
  { icon: Star, title: 'Vision: Unmatched', description: 'Swytch fuses psychology, economy, governance, and tech. PETs are citizens of a new metaverse.' },
  { icon: Flame, title: 'Emotional Driver: Real AF', description: 'Swytch ignites hope and empowers rebels. It’s a movement that feels alive.' },
  { icon: Users, title: 'Scalable & Sustainable', description: 'Rewards effort, education, and community for a lasting ecosphere.' },
  { icon: Landmark, title: 'Private Energy Trust', description: 'Smart contract vault for autonomy, privacy, and rewards.' },
  { icon: BarChart3, title: 'Decentralized Rewards', description: 'Up to 3% monthly returns, plus 0.3% JEWELS via Raziel education.' },
  { icon: Globe, title: 'Raziel: The Executor', description: 'AI guardian manages assets with transparent logic.' },
  { icon: BookOpen, title: 'Know Your Freedom', description: 'Learn rights via UDHR, U.S. Constitution, and PMA charter.' },
  { icon: ShieldCheck, title: 'Membership & PMA Rights', description: 'Private contract protects under constitutional law.' },
  { icon: Scale, title: 'Self-Sovereign Control', description: 'You hold your keys, identity, and decisions.' },
];

const FeatureCards: React.FC = () => {
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 50, scale: 0.95 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut', type: 'spring', stiffness: 80 } } }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
    >
      {features.map((feature, i) => (
        <motion.div
          key={i}
          className="relative bg-gray-900/50 border border-rose-500/20 p-6 rounded-2xl shadow-xl backdrop-blur-md hover:shadow-rose-400/30 transition-all bg-gradient-to-r from-rose-500/10 to-pink-500/10"
          whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(244, 63, 94, 0.5)' }}
        >
          <div className="flex items-start space-x-6">
            <div className="p-4 bg-rose-400/20 rounded-full shadow-lg">
              <feature.icon className="w-8 h-8 text-rose-400 animate-pulse" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-white mb-3 tracking-tight font-poppins">{feature.title}</h3>
              <p className="text-gray-300 text-lg leading-relaxed font-inter">{feature.description}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default FeatureCards;