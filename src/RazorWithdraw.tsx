
import { useState, useRef } from 'react';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebaseConfig';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthUser } from './hooks/useAuthUser';
import { MembershipTier, MEMBERSHIP_TIERS } from '@/lib/types';

interface RazorTransactionProps {
  amount: number;
  itemId?: string;
  transactionType: 'membership' | 'withdraw' | 'content_purchase' | 'deposit';
  userId: string; // Added userId
  onSuccess: (itemId?: string) => void;
}

const RazorTransaction: React.FC<RazorTransactionProps> = ({ amount, itemId, transactionType, userId, onSuccess }) => {
  const { user, membership, loading: authLoading } = useAuthUser();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const upiId = import.meta.env.VITE_UPI_ID || 'swytch.pet@upi';
  const upiIntentUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=Swytch&am=${amount}&cu=INR${itemId ? `&tn=${transactionType}_${itemId}` : ''}`;

  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.3 } },
    tap: { scale: 0.95 },
  };

  const errorVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        setError('Please upload a PNG or JPEG image.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB.');
        return;
      }
      setScreenshot(file);
      setError(null);
    }
  };

  const checkActiveMembership = async () => {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.data();
    return userData?.membership && userData.membership !== 'none';
  };

  const handleSubmission = async () => {
    if (!userId) {
      setError('User authentication required. Please connect your wallet or log in.');
      return;
    }

    if (transactionType === 'membership') {
      if (!screenshot) {
        setError('Please upload a UPI payment screenshot.');
        return;
      }
      if (!itemId || !MEMBERSHIP_TIERS[itemId as MembershipTier]) {
        setError('Invalid membership tier.');
        return;
      }
      if (amount !== MEMBERSHIP_TIERS[itemId as MembershipTier].amount) {
        setError(`Amount must be ₹${MEMBERSHIP_TIERS[itemId as MembershipTier].amount} for ${MEMBERSHIP_TIERS[itemId as MembershipTier].name}.`);
        return;
      }

      const hasActiveMembership = await checkActiveMembership();
      if (hasActiveMembership) {
        setError('You already have an active membership.');
        return;
      }
    } else if (transactionType === 'content_purchase' && !itemId) {
      setError('Content ID is required for purchase.');
      return;
    } else if (transactionType === 'deposit' && amount < 50) {
      setError('Minimum deposit amount is ₹50.');
      return;
    } else if (transactionType === 'withdraw') {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();
      if (!userData || userData.WalletBalance < amount) {
        setError('Insufficient wallet balance for withdrawal.');
        return;
      }
    }

    setError(null);
    setLoading(true);

    try {
      if (!upiId) {
        throw new Error('UPI ID is not configured. Please contact support.');
      }

      let screenshotUrl = '';
      if (screenshot) {
        const path = `tx_screenshots/${userId}_${Date.now()}`;
        const fileRef = ref(storage, path);
        await uploadBytes(fileRef, screenshot);
        screenshotUrl = await getDownloadURL(fileRef);
      }

      const transactionId = `${userId}_${Date.now()}`;
      const data = {
        userId,
        amount: amount.toString(),
        transactionId,
        transactionType,
        status: 'pending',
        timestamp: serverTimestamp(),
        ...(itemId && { itemId }),
        ...(screenshotUrl && { screenshot: screenshotUrl }),
      };

      await setDoc(doc(db, 'transactions', transactionId), data);

      if (transactionType === 'membership' && itemId) {
        await setDoc(doc(db, 'users', userId), { membership: itemId }, { merge: true });
      } else if (transactionType === 'deposit') {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        const currentBalance = userSnap.exists() ? userSnap.data().WalletBalance || 0 : 0;
        await setDoc(userRef, { WalletBalance: currentBalance + amount, updatedAt: serverTimestamp() }, { merge: true });
      } else if (transactionType === 'withdraw') {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        const currentBalance = userSnap.exists() ? userSnap.data().WalletBalance || 0 : 0;
        await setDoc(userRef, { WalletBalance: currentBalance - amount, updatedAt: serverTimestamp() }, { merge: true });
      }

      onSuccess(itemId);

      alert(`${transactionType === 'membership' ? 'Membership payment' : transactionType === 'content_purchase' ? 'Content purchase' : transactionType === 'deposit' ? 'Deposit' : 'Withdrawal request'} submitted! Awaiting admin verification. Transaction ID: ${transactionId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to submit request.');
      console.error('Submission error:', err);
    } finally {
      setLoading(false);
      setScreenshot(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const membershipDetails = transactionType === 'membership' && itemId ? MEMBERSHIP_TIERS[itemId as MembershipTier] : null;

  return (
    <motion.div
      className="flex flex-col gap-4 text-white bg-gray-900/60 backdrop-blur-lg p-4 rounded-xl border border-rose-500/20 shadow-xl"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {authLoading ? (
        <p className="text-gray-200 text-sm">Loading authentication...</p>
      ) : !userId ? (
        <p className="text-rose-400 text-sm">Please connect your wallet or log in to proceed.</p>
      ) : transactionType === 'membership' && membershipDetails ? (
        <>
          <div className="text-sm text-gray-200">
            <p>
              Hello, <span className="font-bold text-rose-400">{user?.displayName || userId.slice(0, 6) + '...' + userId.slice(-4)}</span>!
            </p>
            {membership && membership !== 'none' ? (
              <p className="text-rose-400">You already have an active {MEMBERSHIP_TIERS[membership as MembershipTier]?.name || 'membership'}.</p>
            ) : (
              <>
                <p>Purchase <span className="font-bold text-rose-400">{membershipDetails.name}</span> for ₹{membershipDetails.amount}.</p>
                <p>{isMobile ? 'Tap the QR code or "Pay Now" to pay via UPI app (e.g., Google Pay, PhonePe):' : 'Scan the QR code below to pay via UPI (e.g., Google Pay, PhonePe):'}</p>
                {isMobile ? (
                  <a href={upiIntentUri} target="_blank" rel="noopener noreferrer" aria-label="Open UPI app to pay">
                    <img
                      src="/upi-qr-code.png"
                      alt="UPI QR Code"
                      className="w-32 h-32 mx-auto my-2 border border-rose-500/20 rounded-md cursor-pointer"
                    />
                  </a>
                ) : (
                  <img
                    src="/upi-qr-code.png"
                    alt="UPI QR Code"
                    className="w-32 h-32 mx-auto my-2 border border-rose-500/20 rounded-md"
                    aria-label="UPI QR Code for payment"
                  />
                )}
                <p className="font-bold text-rose-400">UPI ID: {upiId}</p>
                <p>Upload your payment screenshot below to submit your request.</p>
              </>
            )}
          </div>
          {membership === 'none' || membership === null ? (
            <>
              {isMobile && (
                <motion.a
                  href={upiIntentUri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`bg-gradient-to-r from-rose-600 to-pink-700 text-white py-2 px-4 rounded-lg font-semibold text-center ${
                    loading ? 'opacity-50 cursor-not-allowed' : 'hover:from-rose-700 hover:to-pink-800'
                  } focus:outline-none focus:ring-2 focus:ring-rose-500`}
                  variants={buttonVariants}
                  whileHover={loading ? {} : 'hover'}
                  whileTap={loading ? {} : 'tap'}
                  aria-label="Pay now with UPI app"
                  role="button"
                >
                  Pay Now with UPI App
                </motion.a>
              )}
              <input
                type="file"
                accept="image/png,image/jpeg"
                onChange={handleScreenshotChange}
                ref={fileInputRef}
                className="bg-gray-900/80 p-2 rounded-md border border-rose-500/20 w-full text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                aria-label="Upload UPI payment screenshot"
                disabled={loading}
              />
              <motion.button
                onClick={handleSubmission}
                disabled={loading || !screenshot}
                className={`bg-gradient-to-r from-rose-600 to-pink-700 text-white py-2 px-4 rounded-lg font-semibold ${
                  loading || !screenshot ? 'opacity-50 cursor-not-allowed' : 'hover:from-rose-700 hover:to-pink-800'
                } focus:outline-none focus:ring-2 focus:ring-rose-500`}
                variants={buttonVariants}
                whileHover={loading || !screenshot ? {} : 'hover'}
                whileTap={loading || !screenshot ? {} : 'tap'}
                aria-label="Submit membership payment"
                role="button"
              >
                {loading ? 'Processing...' : 'Submit Payment'}
              </motion.button>
            </>
          ) : null}
        </>
      ) : transactionType === 'content_purchase' || transactionType === 'deposit' ? (
        <>
          <div className="text-sm text-gray-200">
            <p>{transactionType === 'content_purchase' ? `Purchase content for ₹${amount}.` : `Deposit ₹${amount} to Energy Vault.`}</p>
            <p>{isMobile ? 'Tap the QR code or "Pay Now" to pay via UPI app (e.g., Google Pay, PhonePe):' : 'Scan the QR code below to pay via UPI (e.g., Google Pay, PhonePe):'}</p>
            {isMobile ? (
              <a href={upiIntentUri} target="_blank" rel="noopener noreferrer" aria-label="Open UPI app to pay">
                <img
                  src="/upi-qr-code.png"
                  alt="UPI QR Code"
                  className="w-32 h-32 mx-auto my-2 border border-rose-500/20 rounded-md cursor-pointer"
                />
              </a>
            ) : (
              <img
                src="/upi-qr-code.png"
                alt="UPI QR Code"
                className="w-32 h-32 mx-auto my-2 border border-rose-500/20 rounded-md"
                aria-label="UPI QR Code for payment"
              />
            )}
            <p className="font-bold text-rose-400">UPI ID: {upiId}</p>
            <p>Upload your payment screenshot below to submit your request.</p>
          </div>
          {isMobile && (
            <motion.a
              href={upiIntentUri}
              target="_blank"
              rel="noopener noreferrer"
              className={`bg-gradient-to-r from-rose-600 to-pink-700 text-white py-2 px-4 rounded-lg font-semibold text-center ${
                loading ? 'opacity-50 cursor-not-allowed' : 'hover:from-rose-700 hover:to-pink-800'
              } focus:outline-none focus:ring-2 focus:ring-rose-500`}
              variants={buttonVariants}
              whileHover={loading ? {} : 'hover'}
              whileTap={loading ? {} : 'tap'}
              aria-label="Pay now with UPI app"
              role="button"
            >
              Pay Now with UPI App
            </motion.a>
          )}
          <input
            type="file"
            accept="image/png,image/jpeg"
            onChange={handleScreenshotChange}
            ref={fileInputRef}
            className="bg-gray-900/80 p-2 rounded-md border border-rose-500/20 w-full text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            aria-label="Upload UPI payment screenshot"
            disabled={loading}
          />
          <motion.button
            onClick={handleSubmission}
            disabled={loading || !screenshot}
            className={`bg-gradient-to-r from-rose-600 to-pink-700 text-white py-2 px-4 rounded-lg font-semibold ${
              loading || !screenshot ? 'opacity-50 cursor-not-allowed' : 'hover:from-rose-700 hover:to-pink-800'
            } focus:outline-none focus:ring-2 focus:ring-rose-500`}
            variants={buttonVariants}
            whileHover={loading || !screenshot ? {} : 'hover'}
            whileTap={loading || !screenshot ? {} : 'tap'}
            aria-label={`Submit ${transactionType === 'content_purchase' ? 'content purchase' : 'deposit'} payment`}
            role="button"
          >
            {loading ? 'Processing...' : 'Submit Payment'}
          </motion.button>
        </>
      ) : transactionType === 'withdraw' ? (
        <>
          <div className="text-sm text-gray-200">
            <p>Request withdrawal of ₹{amount}.</p>
            <p>Admin will process your request after verification.</p>
          </div>
          <motion.button
            onClick={handleSubmission}
            disabled={loading}
            className={`bg-gradient-to-r from-rose-600 to-pink-700 text-white py-2 px-4 rounded-lg font-semibold ${
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
        <p className="text-rose-400 text-sm">Invalid transaction type.</p>
      )}
      <AnimatePresence>
        {error && (
          <motion.p
            className="text-rose-400 text-sm"
            variants={errorVariants}
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

export default RazorTransaction;