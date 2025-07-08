import { motion } from 'framer-motion';
import { Vote, MessageSquare, Trophy, Globe2, ShieldCheck, Star } from 'lucide-react';
import { useModal } from '@/context/ModalContext';
import { auth } from '@/lib/firebaseConfig';

const CommunityFeatures: React.FC = () => {
  const { setActiveModal, setShowMessage } = useModal();

  const handleFeatureClick = (title: string) => {
    if (!auth.currentUser) {
      setActiveModal('auth');
      setShowMessage(`⚠️ Sign in to access ${title}!`);
      return;
    }
    setShowMessage(`ℹ️ Exploring ${title}!`);
    setActiveModal('payment');
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
        {[
          {
            icon: <Vote className="w-6 h-6 text-cyan-400 animate-pulse" />,
            title: 'Decentralized Governance',
            description: 'Vote on proposals using your JEWELS.',
            gradient: 'from-rose-500/20 to-cyan-500/20',
          },
          {
            icon: <MessageSquare className="w-6 h-6 text-cyan-400 animate-pulse" />,
            title: 'Proposal Creation',
            description: 'Submit ideas to drive Swytch forward.',
            gradient: 'from-rose-500/20 to-cyan-500/20',
          },
          {
            icon: <Trophy className="w-6 h-6 text-cyan-400 animate-pulse" />,
            title: 'Contribution Rewards',
            description: 'Earn JEWELS for participation.',
            gradient: 'from-rose-500/20 to-cyan-500/20',
          },
          {
            icon: <Globe2 className="w-6 h-6 text-cyan-400 animate-pulse" />,
            title: 'Global Community',
            description: 'Connect with PETs worldwide.',
            gradient: 'from-rose-500/20 to-cyan-500/20',
          },
          {
            icon: <ShieldCheck className="w-6 h-6 text-cyan-400 animate-pulse" />,
            title: 'Transparent Trust',
            description: 'On-chain governance for fairness.',
            gradient: 'from-rose-500/20 to-cyan-500/20',
          },
        ].map((feature, i) => (
          <motion.div
            key={i}
            className={`relative bg-gray-900/70 border border-rose-500/30 p-6 rounded-2xl shadow-xl backdrop-blur-md hover:shadow-cyan-500/50 transition-all bg-gradient-to-r ${feature.gradient}`}
            whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(34, 211, 238, 0.7)' }}
            onClick={() => handleFeatureClick(feature.title)}
          >
            <motion.div
              variants={{ hidden: { opacity: 0, y: 50, scale: 0.95 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut', type: 'spring', stiffness: 100 } } }}
              whileHover={{ scale: 1.02, y: -10 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="flex items-center mb-4">
                {feature.icon}
                <h4 className="ml-3 text-xl font-bold text-white font-poppins">{feature.title}</h4>
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