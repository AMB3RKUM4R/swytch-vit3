// src/pages/AdminPage.tsx
import { FC, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Key, Banknote, CreditCard, Wallet, Link } from 'lucide-react';
import SwytchCard from '../components/SwytchCard';
import SwytchErrorBoundary from '../components/ErrorBoundaryComponent';
import { PageProps } from '../lib/types';
import { db } from '@/lib/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

// Define a simple interface for the AdminConfig data stored in Firestore
interface AdminConfig {
  upiId: string;
  metamaskWalletAddress: string;
  paypalMerchantId: string;
  paypalClientId: string;
  // Note: clientSecret should NEVER be stored or handled client-side.
  // It's included here only for UI representation of what an admin might configure.
  // In a real app, it would be managed securely on the backend.
  paypalClientSecret: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const AdminPage: FC<PageProps> = ({
  userId,
  setActiveModal,
  setShowMessage,
  isPending,
  authLoading,
}) => {
  const adminUID = '0CfobCbXnPZsJwT662H4OhDrXk33'; // Your designated admin UID
  const isAdmin = userId === adminUID;

  const [upiId, setUpiId] = useState('');
  const [metamaskWalletAddress, setMetamaskWalletAddress] = useState('');
  const [paypalMerchantId, setPaypalMerchantId] = useState('');
  const [paypalClientId, setPaypalClientId] = useState('');
  const [paypalClientSecret, setPaypalClientSecret] = useState(''); // Sensitive: for UI representation only
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch current configurations from Firestore on component mount
  useEffect(() => {
    const fetchConfig = async () => {
      if (!isAdmin) {
        setLoadingConfig(false);
        return;
      }
      setLoadingConfig(true);
      try {
        // Assuming configurations are stored in a single document in a collection
        const configRef = doc(db, 'AdminConfig', 'globalConfig');
        const configSnap = await getDoc(configRef);
        if (configSnap.exists()) {
          const configData = configSnap.data() as AdminConfig;
          setUpiId(configData.upiId || '');
          setMetamaskWalletAddress(configData.metamaskWalletAddress || '');
          setPaypalMerchantId(configData.paypalMerchantId || '');
          setPaypalClientId(configData.paypalClientId || '');
          // clientSecret should NOT be fetched client-side in a real app.
          // This is just for demonstration of the UI field.
          setPaypalClientSecret(configData.paypalClientSecret || '');
        } else {
          setShowMessage('ℹ️ Admin configuration document not found. Using defaults.');
        }
      } catch (err) {
        console.error('Failed to fetch admin config:', err);
        setShowMessage('⚠️ Failed to load admin configurations.');
        setError('Failed to load configurations.');
      } finally {
        setLoadingConfig(false);
      }
    };

    fetchConfig();
  }, [isAdmin, setShowMessage]);

  const handleUpdateConfig = async () => {
    if (!isAdmin) {
      setShowMessage('⚠️ Access Denied: You are not authorized to update configurations.');
      return;
    }

    setUpdateLoading(true);
    setError(null);

    const newConfig: AdminConfig = {
      upiId,
      metamaskWalletAddress,
      paypalMerchantId,
      paypalClientId,
      paypalClientSecret, // Again, for UI demo; in production, this is handled securely.
    };

    try {
      // --- IMPORTANT: This update MUST be handled by a Firebase Cloud Function ---
      // Direct client-side writes to sensitive config documents will be denied by rules.
      // A Cloud Function would receive this data securely and then update Firestore.
      //
      // For MVP, we will simulate the update and log a message.
      // In a real app, you'd call a Callable Cloud Function here:
      // await firebase.functions().httpsCallable('updateAdminConfig')(newConfig);

      setShowMessage('✅ Configuration update request submitted! (Requires backend processing)');
      console.log('Admin config update requested:', newConfig);

      // Simulate a successful update for UI feedback
      setTimeout(() => {
        setShowMessage('✅ Configuration update simulated successfully!');
        setUpdateLoading(false);
      }, 1500);

    } catch (err) {
      console.error('Admin config update failed:', err);
      setError('Failed to update configuration. Check console for details.');
      setShowMessage('⚠️ Failed to update configuration.');
      setUpdateLoading(false);
    }
  };

  if (authLoading || isPending || loadingConfig) {
    return null; // LoadingSpinner is handled by App.tsx
  }

  if (!isAdmin) {
    return (
      <SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}>
        <motion.div
          className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-rose-950/20 to-black text-white font-inter bg-noise"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={sectionVariants} className="text-center">
            <h1 className="text-4xl font-bold text-rose-400 mb-4">Access Denied</h1>
            <p className="text-lg text-gray-300">You do not have administrative privileges to view this page.</p>
            <Link to="/home" className="btn-primary mt-6 inline-block" onClick={() => setShowMessage('🏠 Redirecting to Home.')}>
              Go to Home
            </Link>
          </motion.div>
        </motion.div>
      </SwytchErrorBoundary>
    );
  }

  return (
    <SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}>
      <motion.div
        className="min-h-screen bg-gradient-to-br from-gray-950 via-rose-950/20 to-black text-white font-inter bg-noise"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="relative z-10 max-w-4xl mx-auto py-16 px-6 sm:px-8 lg:px-16">
          <h1 className="text-4xl font-bold text-rose-400 flex items-center justify-center gap-3 font-poppins mb-8">
            <Settings className="w-8 h-8 text-cyan-400 animate-spin-slow" /> Admin Panel
          </h1>

          <motion.div variants={sectionVariants} className="mb-8">
            <SwytchCard gradient="from-gray-800/20 to-gray-700/20" className="p-6">
              <h2 className="text-2xl font-bold text-white font-poppins mb-4">Payment & Wallet Configurations</h2>
              <div className="space-y-4">
                {/* UPI ID */}
                <div className="flex items-center gap-2">
                  <Banknote className="w-5 h-5 text-primary" />
                  <input
                    type="text"
                    placeholder="UPI ID (e.g., yourname@bank)"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="input"
                    aria-label="UPI ID"
                  />
                </div>

                {/* MetaMask Wallet Address (for receiving payments/NFTs) */}
                <div className="flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-primary" />
                  <input
                    type="text"
                    placeholder="MetaMask Wallet Address (0x...)"
                    value={metamaskWalletAddress}
                    onChange={(e) => setMetamaskWalletAddress(e.target.value)}
                    className="input"
                    aria-label="MetaMask Wallet Address"
                  />
                </div>

                {/* PayPal Merchant ID */}
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  <input
                    type="text"
                    placeholder="PayPal Merchant ID"
                    value={paypalMerchantId}
                    onChange={(e) => setPaypalMerchantId(e.target.value)}
                    className="input"
                    aria-label="PayPal Merchant ID"
                  />
                </div>

                {/* PayPal Client ID */}
                <div className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-primary" />
                  <input
                    type="text"
                    placeholder="PayPal Client ID"
                    value={paypalClientId}
                    onChange={(e) => setPaypalClientId(e.target.value)}
                    className="input"
                    aria-label="PayPal Client ID"
                  />
                </div>

                {/* PayPal Client Secret (Highly Sensitive - for UI demo only) */}
                <div className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-primary" />
                  <input
                    type="password" // Use password type for sensitivity
                    placeholder="PayPal Client Secret (NEVER EXPOSE IN PROD)"
                    value={paypalClientSecret}
                    onChange={(e) => setPaypalClientSecret(e.target.value)}
                    className="input"
                    aria-label="PayPal Client Secret"
                  />
                </div>

                <motion.button
                  className="btn-primary w-full flex items-center justify-center gap-2"
                  onClick={handleUpdateConfig}
                  disabled={updateLoading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {updateLoading ? 'Updating...' : 'Update Configurations'}
                </motion.button>
              </div>
              <AnimatePresence>
                {error && (
                  <motion.p
                    className="text-rose-400 text-sm text-center mt-4 font-inter"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>
              <p className="text-xs text-gray-500 mt-4 text-center">
                *Note: In a production environment, sensitive keys like Client Secret should be managed securely on the backend (e.g., Firebase Remote Config, Cloud Functions, or Google Secret Manager) and never exposed client-side. Updates would be handled via secure Cloud Functions.
              </p>
            </SwytchCard>
          </motion.div>
        </motion.div>
      </motion.div>
    </SwytchErrorBoundary>
  );
};

export default AdminPage;
