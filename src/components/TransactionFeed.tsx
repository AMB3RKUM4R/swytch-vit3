import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, Gift, ShoppingCart, TrendingUp, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Transaction {
  icon: JSX.Element;
  address: string;
  action: string;
  amount: string;
  forToken: string;
}

const initialTransactions: Transaction[] = [
  { icon: <ArrowUpRight className="text-rose-400 w-4 h-4 animate-pulse" />, address: '0x4b...d9A3', action: 'Swapped', amount: '₹1000', forToken: 'JEWELS' },
  { icon: <TrendingUp className="text-rose-400 w-4 h-4 animate-pulse" />, address: '0x7c...eE12', action: 'Bet', amount: '₹500', forToken: 'JEWELS' },
  { icon: <ShoppingCart className="text-rose-400 w-4 h-4 animate-pulse" />, address: '0x19...a1F8', action: 'Purchased', amount: '₹2000', forToken: 'GOLD' },
  { icon: <Gift className="text-rose-400 w-4 h-4 animate-pulse" />, address: '0x32...BbC0', action: 'Claimed', amount: '₹300', forToken: 'JEWELS' },
  { icon: <Zap className="text-rose-400 w-4 h-4 animate-pulse" />, address: '0xAF...11eB', action: 'Upgraded PET', amount: '₹830', forToken: '' },
];

const generateRandomTx = (): Transaction => {
  const actions = ['Bet', 'Swapped', 'Deposited', 'Claimed Reward', 'Purchased'];
  const icons = [ArrowUpRight, TrendingUp, Gift, Zap, ShoppingCart];
  const amounts = ['₹500', '₹1000', '₹2000', '₹300', '₹1500'];
  const tokens = ['JEWELS', 'GOLD', ''];
  const address = `0x${Math.random().toString(16).substring(2, 6)}...${Math.random().toString(16).substring(2, 6)}`;
  const index = Math.floor(Math.random() * actions.length);
  const IconEl = icons[index % icons.length];

  return {
    icon: <IconEl className="text-rose-400 w-4 h-4 animate-pulse" />,
    address,
    action: actions[index],
    amount: amounts[Math.floor(Math.random() * amounts.length)],
    forToken: tokens[Math.floor(Math.random() * tokens.length)],
  };
};

const TransactionFeed: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);

  useEffect(() => {
    const interval = setInterval(() => {
      setTransactions((prev) => {
        const newTx = generateRandomTx();
        return [newTx, ...prev.slice(0, 4)];
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="max-w-5xl mx-auto space-y-6"
    >
      <h3 className="text-3xl font-bold text-white flex items-center justify-center gap-3 font-poppins">
        <Zap className="w-8 h-8 text-rose-400 animate-pulse" /> Live Transactions
      </h3>
      <p className="text-lg text-gray-300 text-center max-w-3xl mx-auto font-inter">
        Real-time bets and rewards fuel the Petaverse!
      </p>
      <div
        className="bg-gray-900/60 backdrop-blur-lg border border-rose-500/20 rounded-2xl p-6 h-[500px] overflow-y-auto no-scrollbar shadow-xl"
        role="log"
        aria-live="polite"
        aria-label="Live Transaction Feed"
      >
        <AnimatePresence>
          {transactions.map((tx, index) => (
            <motion.div
              key={`${tx.address}-${index}`}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="flex items-start space-x-4 bg-gray-900/40 p-4 rounded-lg hover:bg-gray-900/60 transition-all mb-2"
            >
              <div className="p-2 bg-rose-400/20 rounded-full">{tx.icon}</div>
              <div className="text-sm">
                <p className="text-white font-mono mb-1">{tx.address}</p>
                <p className="text-gray-300 font-inter">
                  <span className="text-rose-400 font-medium">{tx.action}</span> {tx.amount}{' '}
                  {tx.forToken && <span className="text-rose-400">for {tx.forToken}</span>}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <p className="text-sm text-rose-400 italic text-center max-w-xl mx-auto font-inter">
        💠 All transactions power the Swytch Petaverse ecosystem.
      </p>
    </motion.div>
  );
};

export default TransactionFeed;