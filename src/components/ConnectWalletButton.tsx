import { FC, memo } from 'react';
import { motion } from 'framer-motion';
import { auth } from '@/lib/firebaseConfig'; // Keep auth for auth.currentUser check
import { useAccount, useDisconnect } from 'wagmi'; // FIX: Added useDisconnect for actual wallet disconnection
import { ConnectButton } from '@rainbow-me/rainbowkit'; // Import ConnectButton.Custom for the actual UI
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'; // For logging transactions
import { db } from '@/lib/firebaseConfig'; // For logging transactions

// IMPORTANT: Import ConnectWalletButtonProps and SupportedCurrency, TransactionType, TransactionStatus from types.ts
import { ConnectWalletButtonProps as ImportedConnectWalletButtonProps, SupportedCurrency, TransactionType, TransactionStatus } from '@/lib/types';


const ConnectWalletButton: FC<ImportedConnectWalletButtonProps> = memo(({ userId, setActiveModal, setShowMessage }) => {
  // Wagmi V2 hooks
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect(); // Hook for disconnecting wallet

  // Use userId for Firebase Auth state check, isConnected for Wagmi wallet state
  const isFirebaseAuthenticated = !!auth.currentUser;

  // No specific handleConnect is needed for the primary button when using ConnectButton.Custom,
  // as RainbowKit handles opening its modal on click. We just need a way to log it.
  const logConnectTransaction = async () => {
    if (!userId || !isFirebaseAuthenticated) {
      setShowMessage('⚠️ Not signed in. Please sign in first.');
      setActiveModal('auth');
      return;
    }
    // Only log if a wallet is actually connected or is about to connect
    if (address && isConnected) {
      try {
        await addDoc(collection(db, 'Transactions'), {
          transactionId: `${userId}_${Date.now()}_connect`,
          userId,
          amount: 0,
          currency: 'JEWELS' as SupportedCurrency, // Assuming JEWELS as a placeholder currency
          transactionType: 'connect' as TransactionType,
          status: 'success' as TransactionStatus, // Assuming connection logging is 'success' if triggered
          timestamp: serverTimestamp(),
          game: 'wallet-connect',
          walletAddress: address,
          adminId: '0CfobCbXnPZsJwT662H4OhDrXk33', // Admin ID for logging
        });
        setShowMessage('🎉 Wallet connection logged!');
        // No setActiveModal('payment') here unless the direct purpose of connection IS payment.
        // Usually, connecting wallet leads back to the app, then user chooses payment.
        // For now, based on previous behavior, if connection implies payment, keep it.
        // If not, remove it. I'll keep it as the previous versions did this.
        setActiveModal('payment');
      } catch (err) {
        console.error('Connect log error:', err);
        setShowMessage('⚠️ Failed to log wallet connection. Try again.');
        setActiveModal('error');
      }
    } else {
        // If not connected yet, but user is authenticated in Firebase, this implies connect modal is opening.
        setShowMessage('ℹ️ Opening wallet connection...');
    }
  };

  const handleDisconnect = async () => {
    if (!userId || !isFirebaseAuthenticated) {
      setShowMessage('⚠️ Not signed in. No wallet to disconnect related to your account.');
      setActiveModal('auth');
      return;
    }
    if (!isConnected) {
      setShowMessage('⚠️ No wallet currently connected.');
      return;
    }

    try {
      // Disconnect the Wagmi wallet
      disconnect(); // This is the actual Wagmi disconnect action

      // Log the disconnect transaction
      await addDoc(collection(db, 'Transactions'), {
        transactionId: `${userId}_${Date.now()}_disconnect`,
        userId,
        amount: 0,
        currency: 'JEWELS' as SupportedCurrency, // Placeholder currency
        transactionType: 'disconnect' as TransactionType,
        status: 'success' as TransactionStatus,
        timestamp: serverTimestamp(),
        game: 'wallet-disconnect',
        walletAddress: address, // Log the address that was disconnected
        adminId: '0CfobCbXnPZsJwT662H4OhDrXk33',
      });
      // await auth.signOut(); // Removed this, as disconnecting wallet != signing out of Firebase Auth
      setShowMessage('🔌 Wallet disconnected.');
    } catch (err) {
      console.error('Disconnect error:', err);
      setShowMessage('⚠️ Failed to disconnect wallet. Try again.');
      setActiveModal('error');
    }
  };

  return (
    <motion.div
      className="flex flex-col items-center gap-4 relative bg-noise"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1620121692029-d088224ddc74?q=80&w=2070&auto=format&fit=crop)' }}
      />
      {/* Use RainbowKit's ConnectButton.Custom for the actual connect UI */}
      <ConnectButton.Custom>
        {({ openConnectModal }) => {
          // This button will either trigger connection or manage connected wallet
          const buttonText = isConnected ? 'Manage Wallet' : 'Connect Wallet';
          const onClickAction = isConnected ? logConnectTransaction : openConnectModal; // If connected, just log/manage. If not, open connect modal.

          return (
            <motion.button
              onClick={() => {
                onClickAction();
                // If opening connect modal, set message. The logConnectTransaction also sets message.
                if (!isConnected) {
                    setShowMessage('ℹ️ Opening wallet connection...');
                }
              }}
              className="px-6 py-3 rounded-full bg-rose-400 text-white hover:bg-cyan-500 transition-all font-poppins focus:outline-none focus:ring-2 focus:ring-rose-400"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label={buttonText}
            >
              {buttonText}
            </motion.button>
          );
        }}
      </ConnectButton.Custom>

      {/* Display connected info and Disconnect button if connected */}
      {isConnected && address && isFirebaseAuthenticated ? (
        <div className="text-center text-gray-200 font-inter relative">
          <p>Connected: {address.slice(0, 6)}...{address.slice(-4)}</p>
          <motion.button
            onClick={handleDisconnect}
            className="mt-2 px-6 py-3 rounded-full bg-rose-400 text-white hover:bg-cyan-500 transition-all font-poppins focus:outline-none focus:ring-2 focus:ring-rose-400"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Disconnect wallet"
          >
            Disconnect
          </motion.button>
        </div>
      ) : (
        // Show sign-in prompt if not authenticated in Firebase
        <div className="text-center text-gray-200 font-inter relative">
          <p>{!isFirebaseAuthenticated ? "Please sign in to connect a wallet." : "Wallet not connected."}</p>
        </div>
      )}
    </motion.div>
  );
});

export default ConnectWalletButton;