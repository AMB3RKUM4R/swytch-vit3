import { FC } from 'react';
import { motion } from 'framer-motion';
import { Gem, Lock, DollarSign, Zap, Sparkles } from 'lucide-react';
import { useModal } from '@/components/context/ModalContext';

const CoreFeaturesShowcase: FC = () => {
  const { setShowMessage } = useModal();

  const features = [
    {
      icon: <Gem className="w-6 h-6 text-[#39FF14]" />,
      title: 'Ownership',
      description: 'Items minted on-chain. Permanent.',
    },
    {
      icon: <DollarSign className="w-6 h-6 text-yellow-500" />,
      title: 'Economy',
      description: 'Convert JOULES to liquid assets.',
    },
    {
      icon: <Lock className="w-6 h-6 text-white" />,
      title: 'Security',
      description: 'Blockchain-backed fairness.',
    },
    {
      icon: <Zap className="w-6 h-6 text-blue-500" />,
      title: 'Unified',
      description: 'One inventory. All realities.',
    },
  ];

  const handleFeatureClick = (title: string) => {
    setShowMessage(`INFO: ${title}`);
  };

  return (
    <div className="font-mono">
      <h2 className="text-xl font-black italic text-white flex items-center justify-center gap-3 mb-8 uppercase tracking-tighter">
        <Sparkles className="w-5 h-5 text-[#39FF14]" /> System Protocols
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {features.map((feature, index) => (
          <motion.div key={index} whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }}>
            <div
              className="bg-black border border-gray-800 p-6 h-full flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#39FF14] transition-colors group"
              onClick={() => handleFeatureClick(feature.title)}
            >
              <div className="mb-4 p-3 bg-black border border-gray-800 rounded-sm group-hover:border-[#39FF14] transition-colors">
                  {feature.icon}
              </div>
              <h3 className="text-sm font-bold text-white mb-2 uppercase tracking-wide group-hover:text-[#39FF14] transition-colors">{feature.title}</h3>
              <p className="text-[10px] text-gray-500 uppercase">{feature.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CoreFeaturesShowcase;