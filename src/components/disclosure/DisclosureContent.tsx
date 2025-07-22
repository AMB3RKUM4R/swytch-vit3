// src/components/disclosure/DisclosureContent.tsx
import { FC } from 'react';
import SwytchCard from '../SwytchCard'; // Assuming SwytchCard is in components/

interface DisclosureContentProps {
  // No direct props needed, as content is static for this content component
}

const DisclosureContent: FC<DisclosureContentProps> = () => {
  return (
    <SwytchCard gradient="from-rose-500/20 to-cyan-500/20" className="max-w-4xl mx-auto p-8">
      <h2 className="text-2xl font-bold text-white font-poppins mb-4">Important Information</h2>
      <p className="mb-4 text-gray-300 font-inter">
        The Swytch Private Energy Trust (PET) is a decentralized platform designed to empower users with financial sovereignty through gamified rewards and community governance. Participation involves risks, including cryptocurrency volatility and regulatory uncertainties.
      </p>
      <p className="mb-4 text-gray-300 font-inter">
        <strong>Investment Risks:</strong> All interactions within Swytch PET, including JEWELS and membership levels, are subject to market risks. Prices may fluctuate, and past performance is not indicative of future results. Users should exercise caution and conduct their own research before engaging.
      </p>
      <p className="mb-4 text-gray-300 font-inter">
        <strong>Legal Disclaimer:</strong> Swytch PET operates on blockchain technology and is not a registered financial institution, bank, or investment advisor. The platform does not offer financial advice. Users are solely responsible for complying with all local, national, and international regulations regarding cryptocurrency transactions, digital asset ownership, and gaming activities.
      </p>
      <p className="mb-4 text-gray-300 font-inter">
        <strong>No Gambling:</strong> Swytch PET games are designed as games of skill, and any in-game currency or item with real-world value is obtained through skill-based achievements or marketplace transactions, not through games of chance. We adhere strictly to applicable gaming laws and app store policies.
      </p>
      <p className="mb-4 text-gray-300 font-inter">
        <strong>KYC/AML:</strong> For fiat withdrawals and certain high-value transactions, Know Your Customer (KYC) and Anti-Money Laundering (AML) procedures may be required to comply with financial regulations.
      </p>
      <p className="mb-4 text-gray-300 font-inter">
        <strong>Contact:</strong> For support or further inquiries, please reach out to our team via official channels.
      </p>
    </SwytchCard>
  );
};

export default DisclosureContent;
