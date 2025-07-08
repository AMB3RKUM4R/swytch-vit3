import { motion } from 'framer-motion';
import { Coins, LineChart, DollarSign, CreditCard } from 'lucide-react';
import { useAccount, useBalance } from 'wagmi';
import { formatUnits } from 'viem';
import { wagmiConfig } from '@/lib/wagmi';

const USDT_ADDRESS = '0xdAC17F958D2ee523a2206206994597C13D831ec7';

interface StatsOverviewProps {
  goldBalance: number;
  energyBalance: number;
}

const StatsOverview: React.FC<StatsOverviewProps> = ({ goldBalance, energyBalance }) => {
  const { address, isConnected } = useAccount();
  const { data: ethBalance } = useBalance({ address, chainId: wagmiConfig.chains[0].id });
  const { data: usdtBalance } = useBalance({ address, token: USDT_ADDRESS, chainId: wagmiConfig.chains[0].id });

  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto"
    >
      <motion.div
        className="relative bg-gray-900/50 border border-rose-500/20 p-6 rounded-2xl shadow-xl backdrop-blur-md hover:shadow-rose-400/30 transition-all bg-gradient-to-r from-rose-500/10 to-rose-400/10 flex flex-col items-center"
        whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(244, 63, 94, 0.5)' }}
      >
        <Coins className="w-8 h-8 text-rose-400 mb-2 animate-pulse" />
        <p className="text-sm text-gray-400 font-inter">Your JEWELS</p>
        <p className="text-xl font-bold text-white font-poppins">{goldBalance} JEWELS</p>
        {isConnected && (
          <>
            <p className="text-sm text-gray-400 font-inter">ETH</p>
            <p className="text-xl font-bold text-white font-poppins">{ethBalance ? `${formatUnits(ethBalance.value, ethBalance.decimals)} ETH` : 'N/A'}</p>
            <p className="text-sm text-gray-400 font-inter">USDT</p>
            <p className="text-xl font-bold text-white font-poppins">{usdtBalance ? `${formatUnits(usdtBalance.value, usdtBalance.decimals)} USDT` : 'N/A'}</p>
          </>
        )}
      </motion.div>
      <motion.div
        className="relative bg-gray-900/50 border border-rose-500/20 p-6 rounded-2xl shadow-xl backdrop-blur-md hover:shadow-rose-400/30 transition-all bg-gradient-to-r from-rose-500/10 to-rose-400/10 flex flex-col items-center"
        whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(244, 63, 94, 0.5)' }}
      >
        <LineChart className="w-8 h-8 text-rose-400 mb-2 animate-pulse" />
        <p className="text-sm text-gray-400 font-inter">Energy</p>
        <p className="text-xl font-bold text-white font-poppins">{energyBalance} Energy</p>
      </motion.div>
      <motion.div
        className="relative bg-gray-900/50 border border-rose-500/20 p-6 rounded-2xl shadow-xl backdrop-blur-md hover:shadow-rose-400/30 transition-all bg-gradient-to-r from-rose-500/10 to-rose-400/10 flex flex-col items-center"
        whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(244, 63, 94, 0.5)' }}
      >
        <DollarSign className="w-8 h-8 text-rose-400 mb-2 animate-pulse" />
        <p className="text-sm text-gray-400 font-inter">Total Deposit</p>
        <p className="text-xl font-bold text-white font-poppins">9,839 INR</p>
      </motion.div>
      <motion.div
        className="relative bg-gray-900/50 border border-rose-500/20 p-6 rounded-2xl shadow-xl backdrop-blur-md hover:shadow-rose-400/30 transition-all bg-gradient-to-r from-rose-500/10 to-rose-400/10 flex flex-col items-center"
        whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(244, 63, 94, 0.5)' }}
      >
        <CreditCard className="w-8 h-8 text-rose-400 mb-2 animate-pulse" />
        <p className="text-sm text-gray-400 font-inter">Total Withdrawals</p>
        <p className="text-xl font-bold text-white font-poppins">9,870 INR</p>
      </motion.div>
    </motion.div>
  );
};

export default StatsOverview;