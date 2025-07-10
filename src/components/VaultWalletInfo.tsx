import { FC } from 'react';
import { motion } from 'framer-motion';
import { LineChart, ArrowRight, UserCheck, Banknote, Coins } from 'lucide-react';
import { formatUnits } from 'viem';
import { mainnet } from 'viem/chains';
import VaultInfo from './VaultInfo';

// IMPORTANT: Updated VaultWalletInfoProps to match passed data and common Wagmi V2 types
interface VaultWalletInfoProps {
  isConnected: boolean;
  address: `0x${string}` | undefined; // Use template literal type for addresses
  chainId: number | undefined; // chainId can be undefined if not connected or loading
  ensName: string | null | undefined; // ensName can be null or undefined
  blockNumber: bigint | null | undefined; // blockNumber is bigint or null/undefined
  // feeData can be undefined. If it exists, it should have gasPrice (bigint or undefined)
  feeData: { gasPrice?: bigint | undefined; maxFeePerGas?: bigint | undefined; maxPriorityFeePerGas?: bigint | undefined; } | undefined;
  // usdtBalance should match the structure returned by useBalance or a custom hook
  usdtBalance: { value: bigint; decimals: number; formatted: string; } | undefined; // usdtBalance is an object or undefined
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
        // chainId can be undefined, so provide a default
        value={chainId === mainnet.id ? '🟢 Ethereum' : (chainId ? `⚪️ Chain ID: ${chainId}` : 'Not connected')}
      />
      <VaultInfo
        icon={<ArrowRight className="text-neon-green" />}
        label="Address"
        value={isConnected && address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not connected'}
      />
      <VaultInfo icon={<UserCheck className="text-neon-green" />} label="ENS" value={ensName || 'No ENS'} />
      <VaultInfo
        icon={<Banknote className="text-neon-green" />}
        label="Block #"
        value={blockNumber?.toString() ?? '...'} // blockNumber is bigint, toString() for display
      />
      <VaultInfo
        icon={<Coins className="text-neon-green" />}
        label="Gas Price"
        // FIX: Ensure feeData and gasPrice are checked before formatUnits
        value={feeData?.gasPrice ? `${formatUnits(feeData.gasPrice, 9)} gwei` : '...'}
      />
      <VaultInfo
        icon={<Banknote className="text-neon-green" />}
        label="USDT Balance"
        // FIX: Ensure usdtBalance.value exists before formatUnits. Use usdtBalance.formatted if available.
        value={usdtBalance?.value ? `${formatUnits(usdtBalance.value, usdtBalance.decimals)} USDT` : '0.00 USDT'}
      />
    </motion.div>
  );
};

export default VaultWalletInfo;