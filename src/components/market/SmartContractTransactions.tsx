// src/components/market/SmartContractTransactions.tsx
import { FC, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Layers, ExternalLink, Hash } from 'lucide-react';
import SwytchCard from '../SwytchCard';
import { db } from '@/lib/firebaseConfig';
import { collection, query, orderBy, limit, onSnapshot, QueryDocumentSnapshot } from 'firebase/firestore'; // Import QueryDocumentSnapshot
import { Transaction } from '@/lib/types'; // Import Transaction type

interface SmartContractTransactionsProps {
  // No direct props, fetches data internally
}

const SmartContractTransactions: FC<SmartContractTransactionsProps> = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    // Query the 'Transactions' collection to display recent activity
    const q = query(
      collection(db, 'Transactions'),
      orderBy('timestamp', 'desc'), // Order by latest
      limit(5) // Show only the 5 most recent
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedTransactions: Transaction[] = [];
      snapshot.forEach((docSnap: QueryDocumentSnapshot) => { // Explicitly type docSnap
        fetchedTransactions.push(docSnap.data() as Transaction);
      });
      setTransactions(fetchedTransactions);
      setLoading(false);
      setError(null);
    }, (err) => {
      console.error('Failed to fetch smart contract transactions:', err);
      setError('Failed to load recent transactions.');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getTransactionLabel = (type: Transaction['transactionType']) => {
    switch (type) {
      case 'item-sale': return 'Item Sale';
      case 'item-purchase': return 'Item Purchase';
      case 'crypto-swap': return 'Crypto Swap';
      case 'deposit': return 'Deposit';
      case 'withdraw': return 'Withdrawal';
      case 'membership': return 'Membership';
      case 'level-purchase': return 'Level Purchase';
      case 'quest-reward': return 'Quest Reward';
      case 'payout': return 'Payout';
      case 'connect': return 'Wallet Connect';
      case 'disconnect': return 'Wallet Disconnect';
      default: return 'Transaction';
    }
  };

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'success': return 'text-green-500';
      case 'pending': return 'text-yellow-500';
      case 'failed': return 'text-red-500';
      case 'approved': return 'text-blue-500';
      case 'completed': return 'text-green-500';
      case 'rejected': return 'text-red-500';
      default: return 'text-gray-400';
    }
  };

  return (
    <SwytchCard gradient="from-blue-700/20 to-cyan-700/20" className="p-6">
      <h2 className="text-2xl font-bold text-white font-poppins mb-4 text-center flex items-center justify-center gap-2">
        <Layers className="w-7 h-7 text-primary" /> Recent Smart Contract Activity
      </h2>
      {loading ? (
        <p className="text-center text-gray-400">Loading transactions...</p>
      ) : error ? (
        <p className="text-center text-rose-400">{error}</p>
      ) : transactions.length === 0 ? (
        <p className="text-center text-gray-400">No recent smart contract transactions.</p>
      ) : (
        <div className="space-y-4">
          {transactions.map((tx) => (
            <motion.div
              key={tx.transactionId}
              className="bg-gray-800/50 p-3 rounded-lg border border-gray-700 flex items-center justify-between"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div>
                <p className="text-white font-semibold">{getTransactionLabel(tx.transactionType)}</p>
                <p className="text-sm text-gray-400">
                  User: {tx.userId.slice(0, 6)}...{tx.userId.slice(-4)}
                </p>
                {tx.walletAddress && (
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Hash className="w-3 h-3" />
                    Wallet: {tx.walletAddress.slice(0, 6)}...{tx.walletAddress.slice(-4)}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-primary font-bold">{tx.amount} {tx.currency}</p>
                <p className={`text-sm ${getStatusColor(tx.status)}`}>{tx.status.toUpperCase()}</p>
                {/* Display transaction hash if available, linking to explorer */}
                {tx.paypalOrderId && ( // Using paypalOrderId to store crypto transaction hash
                  <a
                    href={`https://snowtrace.io/tx/${tx.paypalOrderId}`} // Example for Avalanche C-Chain explorer
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-400 hover:underline flex items-center gap-1 justify-end"
                  >
                    View TX <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
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
          <Layers className="w-5 h-5 mr-2" /> View All
        </motion.button>
      </div>
    </SwytchCard>
  );
};

export default SmartContractTransactions;
