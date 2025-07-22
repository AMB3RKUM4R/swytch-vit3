// src/components/disclosure/DisclosureHeader.tsx
import { FC } from 'react';
import { Sparkles } from 'lucide-react';
import SwytchCard from '../SwytchCard'; // Assuming SwytchCard is in components/

interface DisclosureHeaderProps {
  // No direct props needed, as content is static for this header component
}

const DisclosureHeader: FC<DisclosureHeaderProps> = () => {
  return (
    <SwytchCard gradient="from-rose-500/20 to-cyan-500/20" className="max-w-4xl mx-auto p-8">
      <h1 className="text-4xl font-bold text-white flex items-center justify-center gap-3 font-poppins">
        <Sparkles className="w-8 h-8 text-cyan-400 animate-pulse" /> Swytch PET Disclosure
      </h1>
      <p className="text-gray-300 max-w-xl mx-auto mt-4 font-inter text-center">
        Understand the risks and responsibilities of joining the PETverse.
      </p>
    </SwytchCard>
  );
};

export default DisclosureHeader;
