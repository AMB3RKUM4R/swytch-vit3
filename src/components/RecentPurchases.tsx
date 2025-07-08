import { FC, memo } from 'react';
import { motion } from 'framer-motion';
import { Wallet } from 'lucide-react';

interface Purchase {
  avatar: string;
  address: string;
  amount: string;
  timestamp: any;
}

const sectionVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut', type: 'spring', stiffness: 80 } }
};

const RecentPurchases: FC<{ recentPurchases: Purchase[] }> = memo(({ recentPurchases }) => {
  return (
    <motion.div variants={sectionVariants} className="space-y-8">
      <h2 className="text-4xl font-extrabold text-white text-center flex items-center justify-center gap-4 font-poppins">
        <Wallet className="w-10 h-10 text-pink-400 animate-pulse" /> Recent PET Purchases
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {recentPurchases.length > 0 ? recentPurchases.map((item, i) => (
          <motion.div
            key={`purchase-${i}`}
            className="bg-gray-900/60 p-4 rounded-lg flex items-center space-x-4 border border-pink-500/20 shadow-xl hover:shadow-pink-500/30 transition-all"
            whileHover={{ scale: 1.03 }}
          >
            <img src={item.avatar} alt={`Avatar for ${item.address}`} className="w-12 h-12 rounded-full border border-pink-500/20" onError={(e) => { e.currentTarget.src = '/avatars/fallback.png'; }} />
            <div>
              <p className="text-pink-300 font-semibold font-poppins">{item.address}</p>
              <p className="text-gray-200 text-sm font-inter">Paid: {item.amount}</p>
            </div>
          </motion.div>
        )) : (
          <p className="text-gray-300 text-center col-span-full font-inter">No recent purchases yet.</p>
        )}
      </div>
    </motion.div>
  );
});

export default RecentPurchases;