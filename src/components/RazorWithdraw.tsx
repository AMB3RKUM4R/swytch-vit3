// src/components/RazorWithdraw.tsx
import { useState, useEffect, useRef } from 'react';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/lib/firebaseConfig';
import { RazorTransactionProps, MEMBERSHIP_TIERS, Transaction, PlayerData } from '@/lib/types';
import { PayPalButtons } from '@paypal/react-paypal-js';
// No external QR code library import, using native canvas

// Minimal QR code generation function for canvas
// This is a placeholder. For production, consider using a robust QR code library
// that can generate actual QR code patterns (e.g., 'qrcode' npm package on a backend,
// or a more sophisticated client-side library that draws to canvas).
// This current implementation draws a simple black square with "QR" text.
const drawPlaceholderQRCode = (canvas: HTMLCanvasElement, _text: string, size: number) => {
  const context = canvas.getContext('2d');
  if (!context) return;

  canvas.width = size;
  canvas.height = size;
  context.clearRect(0, 0, size, size);
  context.fillStyle = '#333'; // Dark gray background
  context.fillRect(0, 0, size, size);

  context.fillStyle = '#fff'; // White text
  context.font = `${size / 5}px Arial`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText("QR", size / 2, size / 2);

  context.font = `${size / 12}px Arial`;
  context.fillText("Scan Me", size / 2, size * 0.8);
};


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
  const qrCanvasRef = useRef<HTMLCanvasElement>(null); // Ref for the QR code canvas

  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const upiId = 'deamonstillalive@icici'; // Your specified UPI ID
  const upiIntentUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=Swytch&am=${amount}&cu=${currency}${itemId ? `&tn=${transactionType}_${itemId}` : ''}`;

  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.3 } },
    tap: { scale: 0.95 },
  };

  const errorVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  // Effect to draw the QR code on canvas when relevant data changes
  useEffect(() => {
    if (qrCanvasRef.current && (transactionType === 'membership' || transactionType === 'deposit')) {
      const qrText = `upi://pay?pa=${upiId}&pn=Swytch&am=${amount}&cu=${currency}`;
      drawPlaceholderQRCode(qrCanvasRef.current, qrText, 128); // Draw QR code on canvas
    }
  }, [amount, currency, transactionType, upiId]);


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
        // Removed screenshot field from transaction data as Firebase Storage is not used.
        ...(paypalOrderId && { paypalOrderId }),
        paymentMethod,
      };

      await setDoc(doc(db, 'Transactions', transactionId), data);

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
      ) : (transactionType === 'membership' || transactionType === 'deposit') ? (
        // UPI Payment Section for Membership & Deposit
        <>
          <div className="text-sm text-gray-200 text-center">
            <p>
              Hello, <span className="font-bold text-rose-400">{userId.slice(0, 6) + '...' + userId.slice(-4)}</span>!
            </p>
            <p dangerouslySetInnerHTML={{ __html: transactionType === 'membership' && membershipDetails
                ? `Purchase <span class="font-bold text-rose-400">${membershipDetails.name}</span> for ${currency} ${membershipDetails.amount}.`
                : `Deposit ${currency} ${amount} to your JEWELS balance.` }}
            />
            <p>{isMobile ? 'Tap "Pay Now" to pay via UPI app (e.g., Google Pay, PhonePe):' : 'Scan the QR code below to pay via UPI (e.g., Google Pay, PhonePe):'}</p>

            <div className="w-32 h-32 mx-auto my-2 border border-rose-500/20 rounded-md bg-white p-1">
              {/* Render QR code on canvas */}
              <canvas ref={qrCanvasRef} className="w-full h-full"></canvas>
            </div>

            <p className="font-bold text-rose-400 font-poppins">UPI ID: {upiId}</p>
            <p className="text-xs text-gray-400 mt-1">
              (Note: Admin will verify payment manually.)
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
            aria-label="Submit payment"
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
