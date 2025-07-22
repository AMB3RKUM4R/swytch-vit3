// src/components/shop/RecentPurchases.tsx
// This is a version specifically for the Shop page,
// it might focus on item purchases rather than general market activity.
import { FC } from 'react';
import { motion } from 'framer-motion';
import { History, ShoppingBag } from 'lucide-react';
import SwytchCard from '../SwytchCard';
import { Purchase } from '@/lib/types'; // Import Purchase type

interface RecentPurchasesProps {
  recentPurchases: Purchase[]; // Array of recent purchase data
}

const RecentPurchases: FC<RecentPurchasesProps> = ({ recentPurchases }) => {
  // Placeholder data for demonstration, focusing on shop-like purchases
  const dummyPurchases: Purchase[] = [
    { id: 'sp1', avatar: 'https://placehold.co/40x40/FF5733/FFFFFF?text=P1', address: '0xshop...abc', amount: '1 NFT', timestamp: new Date(Date.now() - 120000) },
    { id: 'sp2', avatar: 'https://placehold.co/40x40/33FF57/000000?text=P2', address: '0xshop...def', amount: 'Gold Membership', timestamp: new Date(Date.now() - 300000) },
    { id: 'sp3', avatar: 'https://placehold.co/40x40/3357FF/FFFFFF?text=P3', address: '0xshop...ghi', amount: '1000 JEWELS', timestamp: new Date(Date.now() - 600000) },
  ];

  const displayPurchases = recentPurchases.length > 0 ? recentPurchases : dummyPurchases;

  return (
    <SwytchCard gradient="from-gray-700/20 to-gray-800/20" className="p-6">
      <h2 className="text-2xl font-bold text-white font-poppins mb-4 text-center flex items-center justify-center gap-2">
        <History className="w-7 h-7 text-primary" /> Recent Shop Activity
      </h2>
      {displayPurchases.length === 0 ? (
        <p className="text-gray-400 text-center">No recent shop purchases to display.</p>
      ) : (
        <div className="space-y-4">
          {displayPurchases.map((purchase, index) => (
            <motion.div
              key={purchase.id || index} // Use ID if available, fallback to index
              className="flex items-center bg-gray-800/50 p-3 rounded-lg border border-gray-700"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <img
                src={purchase.avatar}
                alt="User Avatar"
                className="w-10 h-10 rounded-full mr-3 object-cover"
                onError={(e) => e.currentTarget.src = `https://placehold.co/40x40/random/FFFFFF?text=User`} // Fallback
              />
              <div className="flex-grow">
                <p className="text-white font-semibold text-md truncate">{purchase.address.slice(0, 6)}...{purchase.address.slice(-4)}</p>
                <p className="text-gray-400 text-sm">{typeof purchase.timestamp === 'string' ? purchase.timestamp : purchase.timestamp.toLocaleString()}</p>
              </div>
              <p className="text-primary font-bold text-lg ml-4">{purchase.amount}</p>
            </motion.div>
          ))}
        </div>
      )}
      <div className="text-center mt-6">
        <motion.button
          className="btn-secondary flex items-center justify-center mx-auto"
          onClick={() => alert('View all shop transactions (future feature)')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ShoppingBag className="w-5 h-5 mr-2" /> View All Purchases
        </motion.button>
      </div>
    </SwytchCard>
  );
};

export default RecentPurchases;
