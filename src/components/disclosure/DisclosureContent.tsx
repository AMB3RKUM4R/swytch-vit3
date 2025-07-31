// src/components/disclosure/DisclosureContent.tsx
import { FC } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, ShieldCheck, Layers, Eye } from 'lucide-react';
import SwytchCard from '../SwytchCard';

interface DisclosureContentProps {
  // No direct props needed, as content is static for this content component
}

const DisclosureContent: FC<DisclosureContentProps> = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <SwytchCard gradient="from-gray-800/20 to-gray-700/20" className="p-8">
        <h2 className="text-2xl font-bold text-white font-poppins mb-4 flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-yellow-400" /> Investment Risks
        </h2>
        <p className="mb-4 text-gray-300 font-inter">
          Participation in the Swytch PET ecosystem involves risks inherent to digital assets. The value of cryptocurrencies and NFTs, including in-game items like JEWELS, is highly volatile and can fluctuate dramatically. There is a risk of total or partial loss of your digital assets. Past performance is not an indicator of future results. We strongly advise users to engage with the platform only with funds they are comfortable losing and to conduct their own thorough research.
        </p>
      </SwytchCard>

      <SwytchCard gradient="from-gray-800/20 to-gray-700/20" className="p-8">
        <h2 className="text-2xl font-bold text-white font-poppins mb-4 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-green-400" /> Legal & Regulatory Disclaimer
        </h2>
        <p className="mb-4 text-gray-300 font-inter">
          Swytch PET is a technology platform built on decentralized blockchain technology. It is not a registered financial institution, bank, or investment advisor. We do not provide financial, legal, or investment advice. Users are solely responsible for understanding and complying with all relevant local, national, and international regulations concerning cryptocurrency transactions and digital asset ownership.
        </p>
      </SwytchCard>

      <SwytchCard gradient="from-gray-800/20 to-gray-700/20" className="p-8">
        <h2 className="text-2xl font-bold text-white font-poppins mb-4 flex items-center gap-2">
          <Layers className="w-6 h-6 text-blue-400" /> Security & Accountability
        </h2>
        <p className="mb-4 text-gray-300 font-inter">
          The security of your digital assets is paramount. We utilize secure smart contracts and industry best practices to protect the platform. However, you are solely responsible for the security of your crypto wallet and private keys. Swytch PET will never ask for your private keys or seed phrase. Be vigilant against phishing attempts and only interact with official Swytch PET channels and contracts.
        </p>
      </SwytchCard>

      <SwytchCard gradient="from-gray-800/20 to-gray-700/20" className="p-8">
        <h2 className="text-2xl font-bold text-white font-poppins mb-4 flex items-center gap-2">
          <Eye className="w-6 h-6 text-primary" /> No Gambling
        </h2>
        <p className="mb-4 text-gray-300 font-inter">
          All games and activities within the Swytch PET ecosystem are designed as games of skill. Any in-game currency or items with real-world value are obtained through skillful play or marketplace transactions, not through games of chance. Our platform operates in strict adherence to applicable gaming laws and app store policies to ensure a fair and skill-based environment.
        </p>
      </SwytchCard>
    </motion.div>
  );
};

export default DisclosureContent;