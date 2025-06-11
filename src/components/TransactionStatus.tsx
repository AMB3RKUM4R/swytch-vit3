import { motion } from 'framer-motion';
import { ArrowUpRight, CheckCircle, Gift, ShoppingCart, TrendingUp, Zap, Coins, CreditCard, DollarSign, LineChart, User, Users } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const initialTransactions = [
  {
    icon: <ArrowUpRight className="text-green-400 w-4 h-4" />, 
    address: '0x4b...d9A3',
    action: 'Swapped',
    amount: '$25 USDT',
    forToken: 'JEWELS'
  },
  {
    icon: <TrendingUp className="text-yellow-400 w-4 h-4" />, 
    address: '0x7c...eE12',
    action: 'Staked',
    amount: '$100 ETH',
    forToken: 'Energy Vault'
  },
  {
    icon: <ShoppingCart className="text-blue-400 w-4 h-4" />, 
    address: '0x19...a1F8',
    action: 'Purchased',
    amount: 'NFT #9',
    forToken: 'Vault Guardian'
  },
  {
    icon: <Gift className="text-pink-400 w-4 h-4" />, 
    address: '0x32...BbC0',
    action: 'Claimed',
    amount: '3.3% yield',
    forToken: 'Trust Rewards'
  },
  {
    icon: <Zap className="text-indigo-400 w-4 h-4" />, 
    address: '0xAF...11eB',
    action: 'Upgraded PET to Level 4',
    amount: 'Bonus JEWELS',
    forToken: ''
  },
];

const generateRandomTx = () => {
  const actions = [
    'Arbitraged', 'Swapped', 'Deposited', 'Claimed Reward', 'Purchased', 'Staked'
  ];
  const icons = [ArrowUpRight, TrendingUp, Gift, Zap, ShoppingCart, CheckCircle];
  const amounts = ['$12.50', '$47.20', '$89.00', '$13.33', '$101.00'];
  const tokens = ['JEWELS', 'FDMT', 'USDT', 'ETH', 'NFT'];
  const address = `0x${Math.random().toString(16).substring(2, 6)}...${Math.random().toString(16).substring(2, 6)}`;
  const index = Math.floor(Math.random() * actions.length);
  const IconEl = icons[index % icons.length];

  return {
    icon: <IconEl className="text-cyan-400 w-4 h-4" />,
    address,
    action: actions[index],
    amount: amounts[Math.floor(Math.random() * amounts.length)],
    forToken: tokens[Math.floor(Math.random() * tokens.length)]
  };
};

const TransactionStatus = () => {
  const [transactions, setTransactions] = useState(initialTransactions);
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setTransactions(prev => [generateRandomTx(), ...prev.slice(0, 50)]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-900 to-black text-center relative overflow-hidden">
      <motion.div variants={variants} initial="hidden" animate="visible">
        <h2 className="text-4xl sm:text-5xl font-extrabold text-cyan-400 mb-4">
          Decentralized Energy Trust
        </h2>
        <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto mb-8">
          Witness every 2 seconds as the Swytch Bot executes trades across 5 DEXes — funding your 3.3% monthly yield.
        </p>

        <div ref={feedRef} className="max-w-5xl mx-auto bg-gray-800/60 backdrop-blur-lg border border-cyan-500/10 rounded-2xl p-6 sm:p-8 shadow-lg text-left h-[500px] overflow-hidden space-y-4">
          {transactions.map((tx, index) => (
            <div key={index} className="flex items-start space-x-4 bg-gray-900/40 p-4 rounded-lg hover:bg-gray-900 transition-all">
              <div className="p-2 bg-cyan-500/10 rounded-full">
                {tx.icon}
              </div>
              <div className="text-sm">
                <p className="text-white font-mono mb-1">{tx.address}</p>
                <p className="text-gray-300">
                  <span className="text-cyan-400 font-medium">{tx.action}</span> {tx.amount} {tx.forToken && (<span className="text-cyan-300">for {tx.forToken}</span>)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-cyan-300 text-sm max-w-xl mx-auto italic">
          💠 All Swytch Vault Deposits fund AI-powered arbitrage trading across Uniswap, SushiSwap, PancakeSwap, Curve, and Balancer — ensuring real yield, real fast.
        </div>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto text-white">
          <div className="bg-gray-800 p-6 rounded-xl shadow-md flex flex-col items-center">
            <Coins className="w-8 h-8 text-orange-400 mb-2" />
            <p className="text-sm text-gray-400">Your Balance</p>
            <p className="text-xl font-bold">26 SWYT</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-xl shadow-md flex flex-col items-center">
            <LineChart className="w-8 h-8 text-blue-400 mb-2" />
            <p className="text-sm text-gray-400">Profit</p>
            <p className="text-xl font-bold">57 SWYT</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-xl shadow-md flex flex-col items-center">
            <DollarSign className="w-8 h-8 text-pink-400 mb-2" />
            <p className="text-sm text-gray-400">Total Deposit</p>
            <p className="text-xl font-bold">9,839 SWYT</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-xl shadow-md flex flex-col items-center">
            <CreditCard className="w-8 h-8 text-purple-400 mb-2" />
            <p className="text-sm text-gray-400">Total Withdrawals</p>
            <p className="text-xl font-bold">9,870 SWYT</p>
          </div>
        </div>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <div className="bg-gray-800 p-6 rounded-xl text-center">
            <p className="text-blue-300 text-3xl font-bold">4.21%</p>
            <p className="text-gray-300 text-sm mt-2">Swytch Profits for Last Month<br />May 2025</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-xl text-center">
            <p className="text-blue-300 text-3xl font-bold">3.79%</p>
            <p className="text-gray-300 text-sm mt-2">Your Maximum Profits for Last Month<br />May 2025</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-xl text-center">
            <p className="text-blue-300 text-3xl font-bold">462.14%</p>
            <p className="text-gray-300 text-sm mt-2">Swytch Profits from Inception</p>
          </div>
        </div>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <div className="bg-gray-800 p-6 rounded-xl flex items-center gap-4">
            <User className="w-6 h-6 text-cyan-400" />
            <p className="text-white">Account Details</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-xl flex items-center gap-4">
            <Users className="w-6 h-6 text-cyan-400" />
            <p className="text-white">Referrals</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-xl text-center">
            <p className="text-white text-lg font-bold">Active</p>
            <p className="text-cyan-400 font-semibold text-2xl mt-1">0</p>
          </div>
        </div>

        <div className="mt-12 text-sm text-cyan-300 max-w-xl mx-auto italic">
          🔐 Wallet: 0xAB...CDEF | 🔗 Network: Avalanche | 💼 Status: Active
        </div>
      </motion.div>
    </section>
  );
};

export default TransactionStatus;
