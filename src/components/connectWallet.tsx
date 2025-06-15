// connectWallet.tsx
import { useEffect, useState } from 'react';
import {
  useConnect,
  useDisconnect,
  useAccount,
  useReadContract,
  useSwitchChain,
} from 'wagmi';
import { walletConnect } from '@wagmi/connectors';
import { db } from '../lib/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Sparkles } from 'lucide-react';
import { Address } from 'viem';
import { wagmipetAbi, wagmipetAddress } from '../hooks/generated';
import { mainnet, avalanche, polygon } from 'wagmi/chains';

interface Props {
  uid?: string;
}

const buttonVariants = {
  hover: { scale: 1.05, transition: { duration: 0.3 } },
  tap: { scale: 0.95 },
};

const statusVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const inputVariants = {
  focus: { scale: 1.02, borderColor: '#E91E63', transition: { duration: 0.2 } },
};

const ConnectWallet = ({ uid }: Props) => {
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { address, isConnected, chainId } = useAccount();
  const { switchChain } = useSwitchChain();
  const [error, setError] = useState<string | null>(null);
  const [queryAddress, setQueryAddress] = useState('');
  const [queryError, setQueryError] = useState<string | null>(null);

  useEffect(() => {
    const saveToFirestore = async () => {
      if (uid && address) {
        try {
          const userRef = doc(db, 'users', uid);
          await setDoc(userRef, { wallet: address, chainId }, { merge: true });
          console.log('✅ Wallet saved to Firestore:', address, chainId);
        } catch (err: any) {
          setError('Failed to save wallet address.');
          console.error('Firestore error:', err);
        }
      }
    };
    if (isConnected) saveToFirestore();
  }, [uid, address, isConnected, chainId]);

  const shouldRead =
    !!queryAddress &&
    isConnected &&
    /^0x[a-fA-F0-9]{40}$/.test(queryAddress) &&
    !!chainId &&
    !!wagmipetAddress[chainId as keyof typeof wagmipetAddress];

  const { data: loveAmount, isLoading, error: contractError } = useReadContract(
    shouldRead
      ? {
          address: wagmipetAddress[chainId as keyof typeof wagmipetAddress],
          abi: wagmipetAbi,
          functionName: 'love',
          args: [queryAddress as Address],
        }
      : undefined
  );

  const handleConnect = () => {
    setError(null);
    try {
      connect({
        connector: walletConnect({
          projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID,
        }),
      });
    } catch (err: any) {
      setError('Failed to connect wallet.');
      console.error('Connection error:', err);
    }
  };

  const handleDisconnect = () => {
    setError(null);
    setQueryAddress('');
    setQueryError(null);
    disconnect();
  };

  const handleQuery = () => {
    setQueryError(null);
    if (!isConnected) {
      setQueryError('Please connect your wallet first.');
      return;
    }
    if (!/^0x[a-fA-F0-9]{40}$/.test(queryAddress)) {
      setQueryError('Invalid Ethereum address.');
      return;
    }
    if (!chainId || !wagmipetAddress[chainId as keyof typeof wagmipetAddress]) {
      setQueryError('Please select a supported chain.');
      return;
    }
  };

  const handleSwitchChain = (newChainId: number) => {
    setQueryError(null);
    try {
      switchChain({ chainId: newChainId });
    } catch (err: any) {
      setQueryError('Failed to switch chain.');
      console.error('Chain switch error:', err);
    }
  };

  return (
    <motion.div
      className="flex flex-col gap-4 text-white bg-gray-900/60 backdrop-blur-lg p-6 rounded-xl border border-rose-500/20 shadow-xl w-full max-w-sm mx-auto font-sans"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <AnimatePresence mode="wait">
        {!isConnected ? (
          <motion.div
            key="connect"
            variants={statusVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="flex flex-col items-center gap-4"
          >
            <motion.button
              onClick={handleConnect}
              className="bg-gradient-to-r from-rose-600 to-pink-700 text-white px-5 py-2 rounded-lg font-semibold flex items-center gap-2 hover:from-rose-700 hover:to-pink-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              aria-label="Connect wallet"
            >
              <Wallet className="w-5 h-5 animate-pulse" />
              Connect Wallet
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="connected"
            variants={statusVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="flex flex-col gap-4"
          >
            <p className="text-rose-400 text-sm text-center">
              Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
            </p>
            <div className="flex gap-2 justify-center">
              {[mainnet, avalanche, polygon].map((chain) => (
                <motion.button
                  key={chain.id}
                  onClick={() => handleSwitchChain(chain.id)}
                  className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                    chainId === chain.id
                      ? 'bg-rose-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  aria-label={`Switch to ${chain.name}`}
                >
                  {chain.name}
                </motion.button>
              ))}
            </div>
            <motion.button
              onClick={handleDisconnect}
              className="bg-gray-700 text-white px-4 py-1 rounded-lg font-semibold hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              aria-label="Disconnect wallet"
            >
              Disconnect
            </motion.button>
            <div className="border-t border-rose-500/20 pt-4">
              <h3 className="text-xl font-bold text-rose-400 flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 animate-pulse" />
                Wagmipet Love Query
              </h3>
              <motion.input
                type="text"
                placeholder="Enter address (0x...)"
                value={queryAddress}
                onChange={(e) => setQueryAddress(e.target.value)}
                className="bg-gray-900/80 p-3 rounded-md border border-rose-500/20 w-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
                whileFocus="focus"
                variants={inputVariants}
                aria-label="Ethereum address for love query"
              />
              <motion.button
                onClick={handleQuery}
                disabled={isLoading || !isConnected}
                className={`bg-gradient-to-r from-rose-600 to-pink-700 text-white py-2 rounded-lg font-semibold mt-2 w-full ${
                  isLoading || !isConnected
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:from-rose-700 hover:to-pink-800'
                } focus:outline-none focus:ring-2 focus:ring-rose-500`}
                variants={buttonVariants}
                whileHover={isLoading || !isConnected ? {} : 'hover'}
                whileTap={isLoading || !isConnected ? {} : 'tap'}
                aria-label="Query love amount"
              >
                {isLoading ? 'Querying...' : 'Query Love'}
              </motion.button>
              <AnimatePresence>
                {loveAmount !== undefined && (
                  <motion.p
                    className="text-rose-400 text-sm text-center mt-2"
                    variants={statusVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                  >
                    Love Amount: {loveAmount?.toString() ?? '0'}
                  </motion.p>
                )}
                {(queryError || contractError) && (
                  <motion.p
                    className="text-rose-400 text-sm text-center mt-2"
                    variants={statusVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                  >
                    {queryError || contractError?.message || 'Failed to query love amount.'}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {error && (
          <motion.p
            className="text-rose-400 text-sm text-center"
            variants={statusVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ConnectWallet;
