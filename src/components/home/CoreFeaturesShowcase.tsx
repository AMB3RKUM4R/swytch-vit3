import { FC } from 'react';
import { motion } from 'framer-motion';
import { Gem, Lock, DollarSign, Zap, Sparkles } from 'lucide-react';
import { useModal } from '@/components/context/ModalContext';

const CoreFeaturesShowcase: FC = () => {
  const { setShowMessage } = useModal();

  const features = [
    {
      icon: <Gem className="w-8 h-8 text-primary" />,
      title: 'TRUE OWNERSHIP',
      description: 'Items minted as NFTs. Tradable. Permanent.',
    },
    {
      icon: <DollarSign className="w-8 h-8 text-green-500" />,
      title: 'CRYPTO ECONOMY',
      description: 'Convert JOULES to Fiat/Crypto instantly.',
    },
    {
      icon: <Lock className="w-8 h-8 text-red-500" />,
      title: 'SECURE PROTOCOL',
      description: 'Blockchain-backed security ensures fair play.',
    },
    {
      icon: <Zap className="w-8 h-8 text-yellow-500" />,
      title: 'CROSS-GAME ASSETS',
      description: 'One inventory across all simulated realities.',
    },
  ];

  const handleFeatureClick = (title: string) => {
    setShowMessage(`INFO: ${title}`);
  };

  return (
    <>
      <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-3 font-russo mb-8 uppercase tracking-widest">
        <Sparkles className="w-6 h-6 text-primary" /> SYSTEM PROTOCOLS
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {features.map((feature, index) => (
          <motion.div key={index} whileHover={{ y: -5 }} whileTap={{ scale: 0.98 }}>
            <div
              className="bg-black border border-white/10 p-6 h-full flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary/50 transition-colors group"
              onClick={() => handleFeatureClick(feature.title)}
            >
              <div className="mb-4 p-3 bg-white/5 rounded-none border border-white/10 group-hover:border-primary/30 transition-colors">
                  {feature.icon}
              </div>
              <h3 className="text-lg font-bold text-white mb-2 font-russo uppercase">{feature.title}</h3>
              <p className="text-xs text-gray-500 font-mono leading-relaxed">{feature.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </>
  );
};

export default CoreFeaturesShowcase;