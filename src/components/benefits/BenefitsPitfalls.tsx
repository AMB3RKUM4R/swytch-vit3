// src/components/benefits/BenefitsPitfalls.tsx
import { FC, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Info, ArrowLeft, ArrowRight } from 'lucide-react';
import SwytchCard from '../SwytchCard';
import { Dont } from '@/lib/types';

interface BenefitsPitfallsProps {
  handlePitfallsView: () => void;
  userId: string | null;
  setActiveModal: (modalName: string | null) => void;
  setShowMessage: (message: string) => void;
}

const pitfalls: Dont[] = [
  {
    title: 'Market Volatility',
    description: 'Cryptocurrency prices can be highly volatile.',
    details: 'The value of cryptocurrencies and NFTs can fluctuate rapidly. Invest only what you are comfortable losing. Market trends are unpredictable, and past performance does not guarantee future results.',
  },
  {
    title: 'Regulatory Uncertainty',
    description: 'The legal landscape for crypto and NFTs is still evolving.',
    details: 'Regulations regarding digital assets vary by jurisdiction and are subject to change. Users are responsible for understanding and complying with local laws. Swytch PET is not a financial institution and does not provide legal or financial advice.',
  },
  {
    title: 'Phishing & Scams',
    description: 'Be vigilant against malicious attempts to steal your assets.',
    details: 'Always verify URLs, never share your private keys or seed phrases, and be wary of unsolicited messages or offers. Only interact with official Swytch PET channels and platforms. Enable two-factor authentication (2FA) for added security.',
  },
  {
    title: 'Network Congestion & Fees',
    description: 'Blockchain network activity can impact transaction times and costs.',
    details: 'During periods of high network traffic, transaction fees (gas fees) can increase, and confirmation times may be longer. Plan your transactions accordingly and monitor network conditions.',
  },
];

const BenefitsPitfalls: FC<BenefitsPitfallsProps> = ({
  setShowMessage,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const handleLearnMoreClick = () => {
    setShowDetails(!showDetails);
    setShowMessage(showDetails ? 'Hiding pitfalls details.' : 'Revealing potential pitfalls...');
  };

  return (
    <SwytchCard gradient="from-red-700/20 to-orange-700/20" className="p-6">
      <h2 className="text-2xl font-bold text-white font-poppins mb-4 text-center flex items-center justify-center gap-2">
        <AlertTriangle className="w-7 h-7 text-yellow-400" /> Potential Pitfalls
      </h2>
      <p className="text-lg text-gray-300 text-center mb-6">
        Understand the risks involved in the digital asset space.
      </p>

      <div className="space-y-4">
        {pitfalls.map((pitfall, index) => (
          <motion.div key={index} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.99 }}>
            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 cursor-pointer" onClick={() => handleLearnMoreClick()}>
              <h3 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-400" /> {pitfall.title}
              </h3>
              <p className="text-sm text-gray-300">{pitfall.description}</p>
              <AnimatePresence>
                {showDetails && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-xs text-gray-400 mt-3"
                  >
                    {pitfall.details}
                  </motion.p>
                )}
              </AnimatePresence>
              <motion.button
                className="mt-3 text-primary text-sm font-semibold flex items-center gap-1"
                onClick={(e) => { e.stopPropagation(); handleLearnMoreClick(); }}
                whileHover={{ x: 5 }}
              >
                {showDetails ? 'Show Less' : 'Read More'} <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="text-center mt-6">
        <motion.button
          className="btn-secondary flex items-center justify-center mx-auto"
          onClick={handleLearnMoreClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label={showDetails ? "Hide Pitfalls Details" : "Learn More About Pitfalls"}
        >
          {showDetails ? (
            <> <ArrowLeft className="w-5 h-5 mr-2" /> Hide Details </>
          ) : (
            <> <Info className="w-5 h-5 mr-2" /> Learn More </>
          )}
        </motion.button>
      </div>
    </SwytchCard>
  );
};

export default BenefitsPitfalls;