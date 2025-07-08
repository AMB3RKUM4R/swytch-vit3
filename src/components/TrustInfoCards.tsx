import { motion } from 'framer-motion';
import { ShieldCheck, LockKeyhole, BookOpen, Coins, Key, Globe } from 'lucide-react';
import { useState } from 'react';
import { useModal } from '@/context/ModalContext';

interface InfoCard {
  icon: JSX.Element;
  title: string;
  text: string;
  details: string;
}

const infoCards: InfoCard[] = [
  {
    icon: <ShieldCheck className="w-8 h-8 text-rose-400 animate-pulse" />,
    title: 'PMA-Backed Structure',
    text: 'Swytch thrives under a Private Ministerial Association, free from corporate control.',
    details: 'Members opt-in via contract, securing constitutional sovereignty. Backed by UDHR, Swytch ensures privacy and autonomy.'
  },
  {
    icon: <LockKeyhole className="w-8 h-8 text-rose-400 animate-pulse" />,
    title: 'Immutable by Design',
    text: 'Actions and rewards are etched on an open blockchain with smart contracts.',
    details: 'No admin overrides—just deterministic logic. Anti-corruption tech safeguards your Energy.'
  },
  {
    icon: <BookOpen className="w-8 h-8 text-rose-400 animate-pulse" />,
    title: 'Education is Yield',
    text: 'Boost JEWELS yield through quests in the Raziel Library.',
    details: 'Raziel tracks your knowledge journey. Unlock quests to earn extra yield monthly.'
  },
  {
    icon: <Coins className="w-8 h-8 text-rose-400 animate-pulse" />,
    title: 'JEWELS as Proof',
    text: 'Tokens earned through effort symbolize your service.',
    details: 'JEWELS are proof-of-work, unlocking vault upgrades, access, or stablecoin liquidity.'
  },
  {
    icon: <Key className="w-8 h-8 text-rose-400 animate-pulse" />,
    title: 'Zero Data Collection',
    text: 'No emails, no KYC—just contract-based autonomy.',
    details: 'Your PET vault and identity are encrypted, ensuring sovereignty by default.'
  },
  {
    icon: <Globe className="w-8 h-8 text-rose-400 animate-pulse" />,
    title: 'Cross-Chain Ready',
    text: 'Swytch operates across EVM chains like Avalanche and Polygon.',
    details: 'Smart adapters enable seamless operation across networks, adapting to your needs.'
  },
];

const TrustInfoCards: React.FC = () => {
  const [selectedCard, setSelectedCard] = useState<InfoCard | null>(null);
  const { setActiveModal } = useModal();

  return (
    <>
      <motion.div
        variants={{ hidden: { opacity: 0, y: 50, scale: 0.95 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut', type: 'spring', stiffness: 80 } } }}
        className="space-y-8"
      >
        <h3 className="text-3xl font-bold text-white flex items-center justify-center gap-3 font-poppins">
          <Star className="w-8 h-8 text-rose-400 animate-pulse" /> Why Swytch?
        </h3>
        <p className="text-lg text-gray-300 max-w-3xl mx-auto text-center font-inter">
          Discover the pillars of the Private Energy Trust, empowering your autonomy.
        </p>
        <div className="relative overflow-hidden no-scrollbar">
          <motion.div
            className="flex gap-6"
            variants={{ animate: { x: ['0%', '-50%'], transition: { x: { repeat: Infinity, repeatType: 'loop', duration: 20, ease: 'linear' } } } }}
            animate="animate"
          >
            {[...infoCards, ...infoCards].map((card, i) => (
              <motion.div
                key={`${card.title}-${i}`}
                className="relative bg-gray-900/50 border border-rose-500/20 p-6 rounded-2xl shadow-xl backdrop-blur-md hover:shadow-rose-400/30 transition-all bg-gradient-to-r from-rose-500/10 to-pink-500/10 flex-shrink-0 w-[300px] cursor-pointer"
                whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(244, 63, 94, 0.5)' }}
                onClick={() => setSelectedCard(card)}
                role="button"
                tabIndex={0}
                aria-label={`View details for ${card.title}`}
              >
                <div className="flex items-center mb-4 text-rose-400">
                  {card.icon}
                  <h3 className="text-xl font-bold ml-3 font-poppins">{card.title}</h3>
                </div>
                <p className="text-gray-300 text-sm font-inter">{card.text}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>
      <AnimatePresence>
        {selectedCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-gray-900 border border-rose-500/20 rounded-xl p-8 w-full max-w-md shadow-2xl backdrop-blur-lg font-inter"
              tabIndex={-1}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 id="modal-title" className="text-2xl font-bold text-rose-400 flex items-center gap-2 font-poppins">
                  <Sparkles className="w-6 h-6 animate-pulse" /> {selectedCard.title}
                </h2>
                <button onClick={() => setSelectedCard(null)} aria-label="Close modal">
                  <X className="w-6 h-6 text-rose-400 hover:text-red-500" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center mb-4">
                  {selectedCard.icon}
                  <h3 className="text-2xl font-bold text-rose-400 ml-3 font-poppins">{selectedCard.title}</h3>
                </div>
                <p className="text-lg text-gray-300 leading-relaxed font-inter">{selectedCard.details}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default TrustInfoCards;