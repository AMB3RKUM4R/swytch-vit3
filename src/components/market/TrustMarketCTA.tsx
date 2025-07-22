// src/components/market/TrustMarketCTA.tsx
import { FC } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star } from 'lucide-react';
import SwytchCard from '../SwytchCard';

interface TrustMarketCTAProps {
  setActiveModal: (modalName: string | null) => void;
  setShowMessage: (message: string) => void;
}

const TrustMarketCTA: FC<TrustMarketCTAProps> = ({ setActiveModal, setShowMessage }) => {
  const handleExploreMarketplace = () => {
    setShowMessage('🛒 Navigating to the Item Marketplace!');
  };

  const handleBecomeMember = () => {
    setShowMessage('🌟 Explore membership benefits!');
    setActiveModal('payment'); // Open payment modal for membership
  };

  return (
    <SwytchCard gradient="from-rose-700/20 to-purple-700/20" className="p-6 text-center">
      <h2 className="text-2xl font-bold text-white font-poppins mb-4">
        Ready to Dive Deeper?
      </h2>
      <p className="text-lg text-gray-300 mb-6">
        Explore the full potential of the PETverse Market.
      </p>
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Link
          to="/marketplace"
          className="btn-primary flex items-center justify-center"
          onClick={handleExploreMarketplace}
          aria-label="Explore Item Marketplace"
        >
          <ShoppingCart className="w-5 h-5 mr-2" /> Explore Marketplace
        </Link>
        <motion.button
          className="btn-secondary flex items-center justify-center"
          onClick={handleBecomeMember}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Become a PET Member"
        >
          <Star className="w-5 h-5 mr-2" /> Become a PET Member
        </motion.button>
      </div>
    </SwytchCard>
  );
};

export default TrustMarketCTA;
