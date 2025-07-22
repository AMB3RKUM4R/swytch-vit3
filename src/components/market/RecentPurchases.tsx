// src/components/market/RecentPurchases.tsx
import { FC } from 'react';
import { motion } from 'framer-motion';
import { History, ShoppingCart } from 'lucide-react';
import SwytchCard from '../SwytchCard';
import { Purchase } from '@/lib/types'; // Import Purchase type

interface RecentPurchasesProps {
  recentPurchases: Purchase[]; // Array of recent purchase data
}

const RecentPurchases: FC<RecentPurchasesProps> = ({ recentPurchases }) => {
  // Placeholder data for demonstration
  const dummyPurchases: Purchase[] = [
    { id: 'p1', avatar: 'https://placehold.co/40x40/FF0000/FFFFFF?text=A1', address: '0xabc...123', amount: '0.05 ETH', timestamp: new Date(Date.now() - 3600000) },
    { id: 'p2', avatar: 'https://placehold.co/40x40/00FF00/000000?text=B2', address: '0xdef...456', amount: '1000 JEWELS', timestamp: new Date(Date.now() - 7200000) },
    { id: 'p3', avatar: 'https://placehold.co/40x40/0000FF/FFFFFF?text=C3', address: '0xghi...789', amount: '0.1 USDT', timestamp: new Date(Date.now() - 10800000) },
  ];

  const displayPurchases = recentPurchases.length > 0 ? recentPurchases : dummyPurchases;

  return (
    <SwytchCard gradient="from-gray-700/20 to-gray-800/20" className="p-6">
      <h2 className="text-2xl font-bold text-white font-poppins mb-4 text-center flex items-center justify-center gap-2">
        <History className="w-7 h-7 text-primary" /> Recent Market Activity
      </h2>
      {displayPurchases.length === 0 ? (
        <p className="text-gray-400 text-center">No recent purchases to display.</p>
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
          onClick={() => alert('View all transactions (future feature)')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ShoppingCart className="w-5 h-5 mr-2" /> View All Transactions
        </motion.button>
      </div>
    </SwytchCard>
  );
};

export default RecentPurchases;
