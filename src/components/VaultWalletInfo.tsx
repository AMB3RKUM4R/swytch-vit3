import { FC, memo } from 'react'; // Added memo for performance optimization
import { motion } from 'framer-motion';
import { LineChart, UserCheck, Banknote } from 'lucide-react';
import { mainnet } from 'viem/chains';
import VaultInfo from './VaultInfo';

// IMPORTANT: Import VaultWalletInfoProps from lib/types.ts
import { VaultWalletInfoProps as ImportedVaultWalletInfoProps } from '../lib/types';


// VaultWalletInfoProps interface is now imported from lib/types.ts

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};

// Use ImportedVaultWalletInfoProps as the type for the FC
const VaultWalletInfo: FC<ImportedVaultWalletInfoProps> = memo(({ // Added memo for performance
  chainId,
  ensName,
  blockNumber
}) => {
  return (
    <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <VaultInfo
        icon={<LineChart className="text-cyan-400" />} 
        label="Network"
        value={chainId === mainnet.id ? '🟢 Ethereum' : (chainId ? `⚪️ Chain ID: ${chainId}` : 'Not connected')}
      />
      
      <VaultInfo icon={<UserCheck className="text-cyan-400" />} label="ENS" value={ensName || 'No ENS'} /> {/* FIX: Changed text-neon-green to text-cyan-400 */}
      <VaultInfo
        icon={<Banknote className="text-cyan-400" />} 
        label="Block #"
        value={blockNumber?.toString() ?? '...'}
      />
    </motion.div>
  );
});

export default VaultWalletInfo;