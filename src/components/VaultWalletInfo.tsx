import { FC } from 'react';
import { motion } from 'framer-motion';
import { LineChart, ArrowRight, UserCheck, Banknote, Coins } from 'lucide-react';
import { formatUnits } from 'viem';
import { mainnet } from 'viem/chains';
import VaultInfo from './VaultInfo';

interface VaultWalletInfoProps {
  isConnected: boolean;
  address: string | undefined;
  chainId: number;
  ensName: string | null;
  blockNumber: bigint | undefined;
  feeData: { gasPrice: bigint | undefined } | undefined;
  usdtBalance: { value: bigint; decimals: number } | undefined;
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};

const VaultWalletInfo: FC<VaultWalletInfoProps> = ({
  isConnected,
  address,
  chainId,
  ensName,
  blockNumber,
  feeData,
  usdtBalance,
}) => {
  return (
    <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <VaultInfo
        icon={<LineChart className="text-neon-green" />}
        label="Network"
        value={chainId === mainnet.id ? '🟢 Ethereum' : '⚪️ Switch to Mainnet'}
      />
      <VaultInfo
        icon={<ArrowRight className="text-neon-green" />}
        label="Address"
        value={isConnected && address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not connected'}
      />
      <VaultInfo icon={<UserCheck className="text-neon-green" />} label="ENS" value={ensName || 'No ENS'} />
      <VaultInfo icon={<Banknote className="text-neon-green" />} label="Block #" value={blockNumber?.toString() ?? '...'} />
      <VaultInfo
        icon={<Coins className="text-neon-green" />}
        label="Gas Price"
        value={feeData?.gasPrice ? `${formatUnits(feeData.gasPrice, 9)} gwei` : '...'}
      />
      <VaultInfo
        icon={<Banknote className="text-neon-green" />}
        label="USDT Balance"
        value={`${formatUnits(usdtBalance?.value || 0n, 6)} USDT`}
      />
    </motion.div>
  );
};

export default VaultWalletInfo;