import { FC, useState, useEffect } from 'react';
import { History, ShoppingCart, Loader2, Star, ArrowUpCircle } from 'lucide-react';
import { Transaction } from '@/lib/types';
import { collection, query, orderBy, limit, onSnapshot, Timestamp, where } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import { timeAgo } from '@/lib/utils';
import CurrencyHUD from '@/components/CurrencyHUD'; 

const RecentPurchases: FC = () => {
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const q = query(
      collection(db, 'Transactions'),
      where('status', 'in', ['success', 'completed']),
      orderBy('timestamp', 'desc'),
      limit(5)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const transactions: Transaction[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        transactions.push({ 
            id: doc.id, 
            ...data,
            timestamp: data.timestamp as Timestamp 
        } as Transaction);
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
       case 'item-purchase': return <ShoppingCart className="w-4 h-4 text-white" />;
       case 'membership': return <Star className="w-4 h-4 text-yellow-500" />;
       case 'deposit': return <ArrowUpCircle className="w-4 h-4 text-[#39FF14]" />;
       default: return <History className="w-4 h-4 text-gray-500" />;
     }
  }

  return (
    <div className="flex flex-col gap-4 font-mono">
        <div className="flex items-center justify-between pb-4 border-b border-gray-800">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">History Log</h3>
            <CurrencyHUD className="scale-90 origin-right" />
        </div>

        {loading ? (
            <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-[#39FF14]" /></div>
        ) : recentTransactions.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-600 uppercase tracking-wide">NO ACTIVITY LOGGED</div>
        ) : (
            <div className="space-y-0 divide-y divide-gray-800">
            {recentTransactions.map((tx, index) => (
                <div key={tx.id || index} className="flex items-center justify-between py-3 hover:bg-[#39FF14]/5 transition-colors px-2 group">
                    <div className="flex items-center gap-3">
                        {getTransactionIcon(tx.transactionType)}
                        <div>
                            <p className="text-white text-xs font-bold uppercase group-hover:text-[#39FF14] transition-colors">{tx.transactionType.replace('-', ' ')}</p>
                            <p className="text-[10px] text-gray-500">
                                {timeAgo(tx.timestamp as Timestamp)}
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[#39FF14] text-xs font-bold">
                            {tx.amount.toFixed(0)} {tx.currency}
                        </p>
                    </div>
                </div>
            ))}
            </div>
        )}
    </div>
  );
};

export default RecentPurchases;