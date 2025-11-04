// src/components/RecentPurchases.tsx
import { FC, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { History, ShoppingCart, Loader2, Star, ArrowUpCircle } from 'lucide-react';
import SwytchCard from './SwytchCard';
import { Transaction } from '@/lib/types'; // Import main Transaction type
import { collection, query, orderBy, limit, onSnapshot, Timestamp, where } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import { timeAgo } from '@/lib/utils'; // We'll add this utility function

// This component is now self-sufficient and fetches its own data.
const RecentPurchases: FC = () => {
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Query for the last 5 successful transactions
    const q = query(
      collection(db, 'Transactions'),
      where('status', 'in', ['success', 'completed']), // Show successful ones
      orderBy('timestamp', 'desc'),
      limit(5)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const transactions: Transaction[] = [];
      snapshot.forEach(doc => {
        transactions.push({ id: doc.id, ...doc.data() } as unknown as Transaction);
      });
      setRecentTransactions(transactions);
      setLoading(false);
    }, (err) => {
      console.error("Failed to fetch recent transactions:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getTransactionIcon = (type: Transaction['transactionType']) => {
     switch(type) {
       case 'item-purchase': return <ShoppingCart className="w-5 h-5 text-primary" />;
       case 'membership': return <Star className="w-5 h-5 text-yellow-400" />;
       case 'deposit': return <ArrowUpCircle className="w-5 h-5 text-green-400" />;
       default: return <History className="w-5 h-5 text-muted-foreground" />;
     }
  }

  return (
    <SwytchCard variant="default" className="p-6">
      <h2 className="text-2xl font-bold text-foreground font-poppins mb-4 text-center flex items-center justify-center gap-2">
        <History className="w-7 h-7 text-primary" /> Market Activity
      </h2>
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : recentTransactions.length === 0 ? (
        <p className="text-gray-400 text-center py-10">No recent market activity.</p>
      ) : (
        <div className="space-y-4">
          {recentTransactions.map((tx, index) => (
            <motion.div
              key={tx.id || index}
              className="flex items-center bg-black/20 p-3 rounded-lg border border-border"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="w-10 h-10 rounded-full bg-secondary flex-shrink-0 flex items-center justify-center mr-3">
                 {getTransactionIcon(tx.transactionType)}
              </div>
              <div className="flex-grow overflow-hidden">
                <p className="text-foreground font-semibold text-sm truncate capitalize">
                  {tx.transactionType.replace('-', ' ')}
                </p>
                <p className="text-muted-foreground text-xs">
                  {timeAgo(tx.timestamp as Timestamp)} by {tx.userId.slice(0, 6)}...
                </p>
              </div>
              <p className="text-primary font-bold text-sm ml-4">
                {tx.amount.toFixed(2)} {tx.currency}
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </SwytchCard>
  );
};

export default RecentPurchases;
