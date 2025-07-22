// src/components/RazorWithdraw.tsx
import { useState } from 'react';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
// Removed: import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // No Firebase Storage
import { motion, AnimatePresence } from 'framer-motion';
import { db /* , storage */ } from '@/lib/firebaseConfig'; // Removed storage import
import { RazorTransactionProps, MEMBERSHIP_TIERS, Transaction, PlayerData } from '@/lib/types';
import { PayPalButtons } from '@paypal/react-paypal-js';

const RazorTransaction: React.FC<RazorTransactionProps & { paymentMethod?: 'upi' | 'paypal' }> = ({
  amount,
  currency,
  itemId,
  transactionType,
  userId,
  onSuccess,
  setShowMessage,
  paymentMethod = 'upi',
}) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // Removed: const [screenshot, setScreenshot] = useState<File | null>(null); // No screenshot for storage
  // Removed: const fileInputRef = useRef<HTMLInputElement>(null); // No file input

  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const upiId = import.meta.env.VITE_UPI_ID || 'swytch.pet@upi'; // Placeholder UPI ID
  const upiIntentUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=Swytch&am=${amount}&cu=${currency}${itemId ? `&tn=${transactionType}_${itemId}` : ''}`;

  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.3 } },
    tap: { scale: 0.95 },
  };

  const errorVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  // Removed: handleScreenshotChange as there's no storage

  const checkActiveMembership = async (): Promise<boolean> => {
    if (!userId) return false;
    const userRef = doc(db, 'Players', userId);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.data() as PlayerData;
    return userData?.membership && userData.membership !== 'none';
  };

  const handleSubmission = async (paypalOrderId?: string) => {
    if (!userId) {
      setError('User authentication required. Please connect your wallet or log in.');
      setShowMessage('⚠️ User authentication required. Please connect your wallet or log in.');
      return;
    }

    // Client-side validation based on transaction type
    if (transactionType === 'membership') {
      // Removed: if (paymentMethod === 'upi' && !screenshot) { ... } // No screenshot check
      if (!itemId || !MEMBERSHIP_TIERS[itemId as keyof typeof MEMBERSHIP_TIERS]) {
        setError('Invalid membership tier selected.');
        setShowMessage('⚠️ Invalid membership tier.');
        return;
      }
      const requiredAmount = MEMBERSHIP_TIERS[itemId as keyof typeof MEMBERSHIP_TIERS].amount;
      if (amount !== requiredAmount) {
        setError(`Amount must be ₹${requiredAmount} for ${MEMBERSHIP_TIERS[itemId as keyof typeof MEMBERSHIP_TIERS].name}.`);
        setShowMessage(`⚠️ Amount must be ₹${requiredAmount} for ${MEMBERSHIP_TIERS[itemId as keyof typeof MEMBERSHIP_TIERS].name}.`);
        return;
      }

      const hasActiveMembership = await checkActiveMembership();
      if (hasActiveMembership) {
        setError('You already have an active membership. Cannot purchase another.');
        setShowMessage('⚠️ You already have an active membership.');
        return;
      }
    } else if (transactionType === 'deposit' && currency === 'INR' && amount < 50) {
      setError('Minimum deposit amount is ₹50.');
      setShowMessage('⚠️ Minimum deposit amount is ₹50.');
      return;
    } else if (transactionType === 'withdraw') {
      const userRef = doc(db, 'Players', userId);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data() as PlayerData;
      if (!userData || (userData.jewels || 0) < amount) {
        setError('Insufficient JEWELS balance for withdrawal.');
        setShowMessage('⚠️ Insufficient wallet balance for withdrawal.');
        return;
      }
    }

    setError(null);
    setLoading(true);

    try {
      if (paymentMethod === 'upi' && !upiId) {
        throw new Error('UPI ID is not configured. Please contact support.');
      }

      // Removed: let screenshotUrl = ''; if (paymentMethod === 'upi' && screenshot) { ... } // No screenshot upload

      const transactionId = `${userId}_${Date.now()}`;
      const data: Transaction = {
        transactionId,
        userId,
        amount: Number(amount),
        transactionType,
        currency,
        status: 'pending', // All initial transactions are pending admin verification
        timestamp: serverTimestamp(),
        ...(itemId && { itemId }),
        // Removed: ...(screenshotUrl && { screenshot: screenshotUrl }), // No screenshot field
        ...(paypalOrderId && { paypalOrderId }),
        paymentMethod,
      };

      // Add transaction to Firestore
      await setDoc(doc(db, 'Transactions', transactionId), data);

      // --- IMPORTANT: Removed client-side optimistic updates to PlayerData for jewels/membership. ---
      // Your original Firestore rules do NOT allow client-side updates to 'jewels' or 'membership'
      // by the user. These updates MUST be handled by a trusted backend (e.g., Firebase Cloud Function)
      // after the payment is verified.
      // The client-side app will only create the 'pending' transaction record.
      //
      // if (transactionType === 'membership' && itemId) {
      //   await setDoc(doc(db, 'Players', userId), { membership: itemId, updatedAt: serverTimestamp() }, { merge: true });
      // } else if (transactionType === 'deposit') {
      //   const userRef = doc(db, 'Players', userId);
      //   const userSnap = await getDoc(userRef);
      //   const currentBalance = userSnap.exists() ? (userSnap.data() as PlayerData).jewels || 0 : 0;
      //   await setDoc(userRef, { jewels: currentBalance + amount, updatedAt: serverTimestamp() }, { merge: true });
      // } else if (transactionType === 'withdraw') {
      //   const userRef = doc(db, 'Players', userId);
      //   const userSnap = await getDoc(userRef);
      //   const currentBalance = userSnap.exists() ? (userSnap.data() as PlayerData).jewels || 0 : 0;
      //   await setDoc(userRef, { jewels: currentBalance - amount, updatedAt: serverTimestamp() }, { merge: true });
      // }
      // --- END IMPORTANT ---

      onSuccess(itemId);
      setError(null);
      setShowMessage(`✅ ${transactionType === 'membership' ? 'Membership payment' : transactionType === 'deposit' ? 'Deposit' : 'Withdrawal request'} submitted! Awaiting admin verification. Transaction ID: ${transactionId}`);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred during submission.';
      setError(errorMessage);
      setShowMessage(`⚠️ ${errorMessage}`);
      console.error('Submission error:', err);
    } finally {
      setLoading(false);
      // Removed: setScreenshot(null); if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const membershipDetails = transactionType === 'membership' && itemId ? MEMBERSHIP_TIERS[itemId as keyof typeof MEMBERSHIP_TIERS] : null;

  return (
    <motion.div
      className="flex flex-col gap-4 text-white bg-gray-900/60 backdrop-blur-lg p-4 rounded-xl border border-rose-500/20 shadow-xl font-inter"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {loading ? (
        <p className="text-gray-200 text-sm font-inter text-center">Processing...</p>
      ) : !userId ? (
        <p className="text-rose-400 text-sm font-inter text-center">Please connect your wallet or log in to proceed.</p>
      ) : paymentMethod === 'paypal' ? (
        // PayPal Payment Section
        <>
          <div className="text-sm text-gray-200 text-center">
            <p>
              {transactionType === 'membership' && membershipDetails
                ? `Purchase ${membershipDetails.name} for ${currency} ${amount}.`
                : `Process ${transactionType} of ${currency} ${amount}.`}
            </p>
            <p>Complete the payment using PayPal below.</p>
          </div>
          <PayPalButtons
            style={{ layout: 'vertical', color: 'gold' }}
            createOrder={(_data, actions) => {
              return actions.order.create({
                purchase_units: [
                  {
                    amount: {
                      value: amount.toString(),
                      currency_code: currency === 'INR' ? 'INR' : 'USD',
                    },
                    payee: {
                      email_address: 'swytch.pet@paypal.com', // Replace with your actual PayPal business email
                    },
                  },
                ],
                intent: 'CAPTURE'
              });
            }}
            onApprove={async (_data, actions) => {
              if (actions.order) {
                const order = await actions.order.capture();
                await handleSubmission(order.id);
              }
            }}
            onError={(err) => {
              setError('PayPal payment failed.');
              setShowMessage('⚠️ PayPal payment failed. Please try again.');
              console.error('PayPal error:', err);
            }}
            onCancel={() => {
              setShowMessage('ℹ️ PayPal payment cancelled.');
              setError('PayPal payment cancelled.');
            }}
          />
        </>
      ) : transactionType === 'membership' && membershipDetails ? (
        // UPI Payment Section for Membership
        <>
          <div className="text-sm text-gray-200 text-center">
            <p>
              Hello, <span className="font-bold text-rose-400">{userId.slice(0, 6) + '...' + userId.slice(-4)}</span>!
            </p>
            <p>
              Purchase <span className="font-bold text-rose-400">{membershipDetails.name}</span> for {currency} {membershipDetails.amount}.
            </p>
            <p>{isMobile ? 'Tap the QR code or "Pay Now" to pay via UPI app (e.g., Google Pay, PhonePe):' : 'Scan the QR code below to pay via UPI (e.g., Google Pay, PhonePe):'}</p>
            {/* Placeholder for UPI QR Code image. Ensure this path is correct. */}
            {isMobile ? (
              <a href={upiIntentUri} target="_blank" rel="noopener noreferrer" aria-label="Open UPI app to pay">
                <img
                  src="/upi-qr-code.png"
                  alt="UPI QR Code"
                  className="w-32 h-32 mx-auto my-2 border border-rose-500/20 rounded-md cursor-pointer"
                  onError={(e) => { e.currentTarget.src = "https://placehold.co/128x128/FF0000/FFFFFF?text=QR+Code+Missing"; }}
                />
              </a>
            ) : (
              <img
                src="/upi-qr-code.png"
                alt="UPI QR Code"
                className="w-32 h-32 mx-auto my-2 border border-rose-500/20 rounded-md"
                aria-label="UPI QR Code for payment"
                onError={(e) => { e.currentTarget.src = "https://placehold.co/128x128/FF0000/FFFFFF?text=QR+Code+Missing"; }}
              />
            )}
            <p className="font-bold text-rose-400 font-poppins">UPI ID: {upiId}</p>
            <p className="text-xs text-gray-400 mt-1">
              (Note: Screenshot upload for UPI payments is removed as Firebase Storage is not used. Admin will verify manually.)
            </p>
          </div>
          {/* Removed screenshot input */}
          <motion.button
            onClick={() => handleSubmission()}
            disabled={loading} // Only disable by loading state
            className={`bg-gradient-to-r from-rose-600 to-pink-700 text-white py-2 px-4 rounded-lg font-semibold font-poppins ${
              loading ? 'opacity-50 cursor-not-allowed' : 'hover:from-rose-700 hover:to-pink-800'
            } focus:outline-none focus:ring-2 focus:ring-rose-500`}
            variants={buttonVariants}
            whileHover={loading ? {} : 'hover'}
            whileTap={loading ? {} : 'tap'}
            aria-label="Submit membership payment"
            role="button"
          >
            {loading ? 'Processing...' : 'Submit Payment'}
          </motion.button>
          {isMobile && (
            <motion.a
              href={upiIntentUri}
              target="_blank"
              rel="noopener noreferrer"
              className={`bg-gradient-to-r from-rose-600 to-pink-700 text-white py-2 px-4 rounded-lg font-semibold font-poppins text-center ${
                loading ? 'opacity-50 cursor-not-allowed' : 'hover:from-rose-700 hover:to-pink-800'
              } focus:outline-none focus:ring-2 focus:ring-rose-500 mt-2`}
              variants={buttonVariants}
              whileHover={loading ? {} : 'hover'}
              whileTap={loading ? {} : 'tap'}
              aria-label="Pay now with UPI app"
              role="button"
            >
              Pay Now with UPI App
            </motion.a>
          )}
        </>
      ) : transactionType === 'deposit' ? (
        // UPI Payment Section for Deposit
        <>
          <div className="text-sm text-gray-200 text-center">
            <p>Deposit {currency} {amount} to your JEWELS balance.</p>
            <p>{isMobile ? 'Tap the QR code or "Pay Now" to pay via UPI app (e.g., Google Pay, PhonePe):' : 'Scan the QR code below to pay via UPI (e.g., Google Pay, PhonePe):'}</p>
            {isMobile ? (
              <a href={upiIntentUri} target="_blank" rel="noopener noreferrer" aria-label="Open UPI app to pay">
                <img
                  src="/upi-qr-code.png"
                  alt="UPI QR Code"
                  className="w-32 h-32 mx-auto my-2 border border-rose-500/20 rounded-md cursor-pointer"
                  onError={(e) => { e.currentTarget.src = "https://placehold.co/128x128/FF0000/FFFFFF?text=QR+Code+Missing"; }}
                />
              </a>
            ) : (
              <img
                src="/upi-qr-code.png"
                alt="UPI QR Code"
                className="w-32 h-32 mx-auto my-2 border border-rose-500/20 rounded-md"
                aria-label="UPI QR Code for payment"
                onError={(e) => { e.currentTarget.src = "https://placehold.co/128x128/FF0000/FFFFFF?text=QR+Code+Missing"; }}
              />
            )}
            <p className="font-bold text-rose-400 font-poppins">UPI ID: {upiId}</p>
            <p className="text-xs text-gray-400 mt-1">
              (Note: Screenshot upload for UPI payments is removed as Firebase Storage is not used. Admin will verify manually.)
            </p>
          </div>
          {/* Removed screenshot input */}
          <motion.button
            onClick={() => handleSubmission()}
            disabled={loading} // Only disable by loading state
            className={`bg-gradient-to-r from-rose-600 to-pink-700 text-white py-2 px-4 rounded-lg font-semibold font-poppins ${
              loading ? 'opacity-50 cursor-not-allowed' : 'hover:from-rose-700 hover:to-pink-800'
            } focus:outline-none focus:ring-2 focus:ring-rose-500`}
            variants={buttonVariants}
            whileHover={loading ? {} : 'hover'}
            whileTap={loading ? {} : 'tap'}
            aria-label="Submit deposit payment"
            role="button"
          >
            {loading ? 'Processing...' : 'Submit Payment'}
          </motion.button>
          {isMobile && (
            <motion.a
              href={upiIntentUri}
              target="_blank"
              rel="noopener noreferrer"
              className={`bg-gradient-to-r from-rose-600 to-pink-700 text-white py-2 px-4 rounded-lg font-semibold font-poppins text-center ${
                loading ? 'opacity-50 cursor-not-allowed' : 'hover:from-rose-700 hover:to-pink-800'
              } focus:outline-none focus:ring-2 focus:ring-rose-500 mt-2`}
              variants={buttonVariants}
              whileHover={loading ? {} : 'hover'}
              whileTap={loading ? {} : 'tap'}
              aria-label="Pay now with UPI app"
              role="button"
            >
              Pay Now with UPI App
            </motion.a>
          )}
        </>
      ) : transactionType === 'withdraw' ? (
        // Withdrawal Request Section
        <>
          <div className="text-sm text-gray-200 text-center">
            <p>Request withdrawal of {currency} {amount}.</p>
            <p>Admin will process your request after verification.</p>
            <p className="text-xs text-gray-400 mt-1">
              (Note: For crypto withdrawals, ensure your wallet is connected. For fiat, provide UPI/bank details in your profile.)
            </p>
          </div>
          <motion.button
            onClick={() => handleSubmission()}
            disabled={loading}
            className={`bg-gradient-to-r from-rose-600 to-pink-700 text-white py-2 px-4 rounded-lg font-semibold font-poppins ${
              loading ? 'opacity-50 cursor-not-allowed' : 'hover:from-rose-700 hover:to-pink-800'
            } focus:outline-none focus:ring-2 focus:ring-rose-500`}
            variants={buttonVariants}
            whileHover={loading ? {} : 'hover'}
            whileTap={loading ? {} : 'tap'}
            aria-label="Submit withdrawal request"
            role="button"
          >
            {loading ? 'Processing...' : 'Request Withdrawal'}
          </motion.button>
        </>
      ) : (
        <p className="text-rose-400 text-sm font-inter text-center">Invalid transaction type selected.</p>
      )}
      <AnimatePresence>
        {error && (
          <motion.div
            className="fixed bottom-20 right-4 max-w-sm w-full bg-gray-900 border border-rose-500/20 rounded-xl shadow-2xl p-4 backdrop-blur-lg z-50 font-inter"
            variants={errorVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <div className="flex items-center gap-4">
              <p className="text-white font-bold font-poppins">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default RazorTransaction;
