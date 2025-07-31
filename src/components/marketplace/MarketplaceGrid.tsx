// src/components/marketplace/MarketplaceGrid.tsx
import { FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package } from 'lucide-react';
import SwytchCard from '../SwytchCard';
import MarketItemCard from './MarketItemCard';
import { MarketItem } from '@/lib/types';

interface MarketplaceGridProps {
  items: MarketItem[];
  onBuyItem: (item: MarketItem) => void;
  userId: string | null;
  setShowMessage: (message: string) => void;
  setActiveModal: (modalName: string | null) => void;
}

const itemGridVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemCardVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 },
};

const MarketplaceGrid: FC<MarketplaceGridProps> = ({
  items,
  onBuyItem,
  userId,
}) => {
  return (
    <SwytchCard gradient="from-cyan-700/20 to-blue-700/20" className="p-6">
      {items.length === 0 ? (
        <div className="text-center py-10">
          <Package className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400 text-lg font-inter">No items currently listed for sale.</p>
          <p className="text-gray-500 text-sm mt-2">Check back later or list your own items!</p>
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          variants={itemGridVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence>
            {items.map((item) => (
              <motion.div key={item.id} variants={itemCardVariants} exit="hidden">
                <MarketItemCard
                  item={item}
                  onBuyItem={onBuyItem}
                  isOwner={userId === item.ownerId}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </SwytchCard>
  );
};

export default MarketplaceGrid;