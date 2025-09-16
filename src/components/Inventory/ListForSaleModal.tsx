// src/components/Inventory/ListForSaleModal.tsx
import { FC, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, DollarSign, Tag } from 'lucide-react';
import { useTheme } from '@/components/context/ThemeContext';
// UPDATED: All necessary types are now imported
import { InventoryItem, ItemDefinition, SupportedCurrency, PageProps } from '@/lib/types';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';

// Placeholder for the deployed marketplace contract information
// You will need to replace this with your actual deployed contract address and ABI
const MARKETPLACE_CONTRACT_ADDRESS = '0xYourMarketplaceContractAddressHere' as `0x${string}`;
const MARKETPLACE_CONTRACT_ABI = [
  // This should contain the ABI for your contract's listing function
  {
    "inputs": [
      {"internalType": "uint256", "name": "tokenId", "type": "uint256"},
      {"internalType": "uint256", "name": "price", "type": "uint256"},
      {"internalType": "address", "name": "currency", "type": "address"}
    ],
    "name": "listItem",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
] as const;

// FIX: The interface now extends PageProps to get all necessary props from the parent
interface ListForSaleModalProps extends PageProps {
  item: InventoryItem;
  definition: ItemDefinition;
  instanceId: string;
  onClose: () => void;
  onSuccess: (instanceId: string) => void;
}

const ListForSaleModal: FC<ListForSaleModalProps> = ({
  definition,
  instanceId,
  userId,
  onClose,
  onSuccess,
  setShowMessage,
}) => {
  const { isDarkMode } = useTheme();
  const { isConnected, address } = useAccount();
  const [price, setPrice] = useState<string>('');
  const [currency, setCurrency] = useState<SupportedCurrency>('JOULES');
  
  const { data: hash, writeContract, isPending: isTxPending } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  const handleList = async () => {
    if (!userId || !address) {
      setShowMessage('⚠️ User or wallet not connected.');
      return;
    }
    if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      setShowMessage('⚠️ Please enter a valid price.');
      return;
    }

    try {
      // FIX: This now triggers an on-chain transaction instead of direct Firestore write.
      writeContract({
        address: MARKETPLACE_CONTRACT_ADDRESS,
        abi: MARKETPLACE_CONTRACT_ABI,
        functionName: 'listItem',
        args: [BigInt(instanceId), parseEther(price), address as `0x${string}`], // Example args
      });
      
      setShowMessage(`ℹ️ Listing transaction submitted! Awaiting confirmation.`);
      onSuccess(instanceId);

    } catch (err: any) {
      console.error('Failed to list item for sale:', err);
      // FIX: The error is now caught by the wagmi hook
      setShowMessage('⚠️ Failed to list item for sale.');
    }
  };

  const imageUrl = definition.visuals?.iconName;
  const isLoading = isTxPending || isConfirming;

  return (
    <AnimatePresence>
      <motion.div
        className={`fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md`}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      >
        <motion.div
          className={`relative modal ${isDarkMode ? 'glass-dark' : 'glass-light'} p-6 rounded-lg max-w-sm w-full mx-4 border border-rose-400/20`}
          initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 50 }}
        >
          <button onClick={onClose} className="absolute top-4 right-4 text-foreground"><X /></button>
          <h2 className="text-2xl font-bold font-poppins text-primary mb-4">List {definition.itemName}</h2>
          
          <div className="text-center mb-4">
              <img
                src={imageUrl || `https://placehold.co/96x96/1a202c/FFFFFF?text=Item`}
                alt={definition.itemName}
                className="w-24 h-24 object-contain p-2 rounded-md mx-auto border border-gray-700"
              />
            <p className="text-sm text-gray-300 mt-2">{definition.description}</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Enter price"
                className="input bg-gray-700 p-3 rounded-md border border-rose-400/20 w-full text-gray-200"
                min="0"
              />
            </div>
            <div className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-primary" />
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as SupportedCurrency)}
                className="input bg-gray-700 p-3 rounded-md border border-rose-400/20 w-full text-gray-200"
              >
                <option value="JOULES">JOULES</option>
                <option value="ETH">ETH</option>
                <option value="USDT">USDT</option>
              </select>
            </div>
            <motion.button
              className="btn-primary w-full"
              onClick={handleList}
              disabled={isLoading || !price || parseFloat(price) <= 0 || !isConnected}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isLoading ? 'Listing...' : 'Confirm Listing'}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ListForSaleModal;