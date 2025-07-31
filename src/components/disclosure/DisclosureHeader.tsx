// src/components/disclosure/DisclosureHeader.tsx
import { FC } from 'react';
import { Sparkles } from 'lucide-react';
import SwytchCard from '../SwytchCard';

interface DisclosureHeaderProps {
  // No direct props needed, as content is static for this header component
}

const DisclosureHeader: FC<DisclosureHeaderProps> = () => {
  return (
    <SwytchCard gradient="from-rose-500/20 to-cyan-500/20" className="max-w-4xl mx-auto p-8 text-center">
      <h1 className="text-4xl font-bold text-white flex items-center justify-center gap-3 font-poppins mb-2">
        <Sparkles className="w-8 h-8 text-cyan-400 animate-pulse" /> Swytch PET Disclosure
      </h1>
      <p className="text-gray-300 max-w-xl mx-auto mt-2 font-inter">
        A transparent overview of the platform's policies, risks, and your responsibilities in the PETverse ecosystem.
      </p>
    </SwytchCard>
  );
};

export default DisclosureHeader;