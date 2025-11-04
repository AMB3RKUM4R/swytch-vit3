// src/components/market/TrustMarketCTA.tsx
import { FC } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star } from 'lucide-react';
import SwytchCard from '../SwytchCard';
import { useModal } from '@/components/context/ModalContext'; // Import modal hook

// This component is now self-sufficient and requires no props.

const TrustMarketCTA: FC = () => {
  // Pull data from our global context
  const { setShowMessage } = useModal();

  const handleExploreMarketplace = () => {
    setShowMessage('🛒 Navigating to the Item Marketplace!');
  };


  return (
    <SwytchCard variant="holographic" className="p-8 text-center">
      <h2 className="text-3xl font-bold text-foreground font-poppins mb-4">
        Ready to Dive Deeper?
      </h2>
      <p className="text-lg text-muted-foreground mb-6 font-inter">
        Explore the full potential of the PETverse Market.
      </p>
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link
            to="/shop" // Use the main shop page
            className="btn-primary flex items-center justify-center w-full sm:w-auto"
            onClick={handleExploreMarketplace}
            aria-label="Explore Item Marketplace"
          >
            <ShoppingCart className="w-5 h-5 mr-2" /> Explore Marketplace
          </Link>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link
            to="/membership" // Link to membership page
            className="btn-secondary flex items-center justify-center w-full sm:w-auto"
            onClick={() => setShowMessage('🌟 Explore membership benefits!')}
            aria-label="Become a PET Member"
          >
            <Star className="w-5 h-5 mr-2" /> Become a PET Member
          </Link>
        </motion.div>
      </div>
    </SwytchCard>
  );
};

export default TrustMarketCTA;
