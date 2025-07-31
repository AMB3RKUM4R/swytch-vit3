import { FC, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogTrigger } from '@radix-ui/react-dialog';
import Tilt from 'react-parallax-tilt';
import { Settings, Banknote, Wallet, CreditCard, Key, Info, Database, Link } from 'lucide-react';
import SwytchCard from '../components/SwytchCard';
import SwytchErrorBoundary from '../components/ErrorBoundaryComponent';
import StarfieldBackground from '../components/StarfieldBackground';
import { db } from '@/lib/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { PageProps } from '../lib/types';

// Define AdminConfig interface
interface AdminConfig {
  upiId: string;
  metamaskWalletAddress: string;
  paypalMerchantId: string;
  paypalClientId: string;
  paypalClientSecret: string; // For UI demo only; not stored client-side in production
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.4 } },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: 'easeOut' } },
};

const imageVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.9, ease: 'easeOut' } },
};

const AdminPage: FC<PageProps> = ({
  userId,
  setActiveModal,
  setShowMessage,
  isPending,
  authLoading,
}) => {
  const adminUID = '0CfobCbXnPZsJwT662H4OhDrXk33';
  const isAdmin = userId === adminUID;
  const [upiId, setUpiId] = useState('');
  const [metamaskWalletAddress, setMetamaskWalletAddress] = useState('');
  const [paypalMerchantId, setPaypalMerchantId] = useState('');
  const [paypalClientId, setPaypalClientId] = useState('');
  const [paypalClientSecret, setPaypalClientSecret] = useState('');
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      if (!isAdmin) {
        setLoadingConfig(false);
        return;
      }
      setLoadingConfig(true);
      try {
        const configRef = doc(db, 'AdminConfig', 'globalConfig');
        const configSnap = await getDoc(configRef);
        if (configSnap.exists()) {
          const configData = configSnap.data() as AdminConfig;
          setUpiId(configData.upiId || '');
          setMetamaskWalletAddress(configData.metamaskWalletAddress || '');
          setPaypalMerchantId(configData.paypalMerchantId || '');
          setPaypalClientId(configData.paypalClientId || '');
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
      paypalClientSecret,
    };
    try {
      setShowMessage('✅ Configuration update request submitted! (Requires backend processing)');
      console.log('Admin config update requested:', newConfig);
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
    return null;
  }

  if (!isAdmin) {
    return (
      <SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}>
        <motion.div
          className="min-h-screen text-foreground font-orbitron bg-noise"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <StarfieldBackground />
          <motion.div className="relative z-20 flex items-center justify-center min-h-screen">
            <motion.div variants={sectionVariants} className="text-center">
              <h1 className="text-5xl font-extrabold text-foreground font-russo mb-6 text-glow-primary">
                <Settings className="inline-block w-12 h-12 text-[hsl(var(--secondary))] animate-neon-pulse mr-4" />
                Access Denied
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8 font-inter">
                You do not have the cosmic clearance to access the Admin Command Center.
              </p>
              <Dialog>
                <DialogTrigger asChild>
                  <Link
                    to="/home"
                    className="btn-system-glow text-lg font-semibold group"
                    onClick={() => setShowMessage('🏠 Redirecting to Home.')}
                  >
                    Return to Home <Link className="ml-3 w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                  </Link>
                </DialogTrigger>
                <DialogContent className="tooltip max-w-md p-6">
                  <p className="text-sm text-muted-foreground">Navigate back to the PETverse home to continue your journey!</p>
                </DialogContent>
              </Dialog>
            </motion.div>
          </motion.div>
        </motion.div>
      </SwytchErrorBoundary>
    );
  }

  return (
    <SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}>
      <motion.div
        className="min-h-screen text-foreground font-orbitron bg-noise"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <StarfieldBackground />
        <motion.div className="relative z-20 max-w-5xl mx-auto py-16 px-6 sm:px-8 lg:px-16">
          {/* Hero Section */}
          <motion.section variants={sectionVariants} className="text-center mb-16">
            <Tilt tiltMaxAngleX={12} tiltMaxAngleY={12} glareEnable={true} glareMaxOpacity={0.4} glareColor="hsl(var(--primary))">
              <motion.div className="holographic-card mb-8 mx-auto max-w-5xl overflow-hidden animated-aura" variants={imageVariants}>
                <img
                  src="https://via.placeholder.com/1000x500?text=Admin+Command+Center"
                  alt="Admin Command Center"
                  className="w-full h-80 object-cover rounded-lg"
                />
              </motion.div>
            </Tilt>
            <h1 className="text-5xl lg:text-7xl font-extrabold text-foreground font-russo mb-6 text-glow-primary">
              <Settings className="inline-block w-12 h-12 text-[hsl(var(--secondary))] animate-neon-pulse mr-4" />
              Admin Command Center
            </h1>
            <p className="text-xl lg:text-2xl text-muted-foreground max-w-4xl mx-auto font-inter mb-8">
              Configure the PETverse’s galactic economy with precision. Securely manage payment and wallet settings.
            </p>
          </motion.section>

          {/* Configuration Overview */}
          <motion.section variants={sectionVariants} className="mb-16">
            <h2 className="text-4xl font-bold text-foreground font-russo text-center mb-8 text-glow-secondary">
              <Database className="inline-block w-10 h-10 text-[hsl(var(--accent))] animate-neon-pulse mr-3" />
              Configuration Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  title: 'UPI Payments',
                  image: 'https://via.placeholder.com/300x200?text=UPI+Config',
                  description: 'Set up UPI for seamless fiat transactions.',
                  tooltip: 'Configure the UPI ID for player withdrawals and deposits.',
                },
                {
                  title: 'MetaMask Wallet',
                  image: 'https://via.placeholder.com/300x200?text=MetaMask+Config',
                  description: 'Manage crypto payments with MetaMask.',
                  tooltip: 'Set the wallet address for receiving NFT and crypto payments.',
                },
                {
                  title: 'PayPal Merchant',
                  image: 'https://via.placeholder.com/300x200?text=PayPal+Merchant',
                  description: 'Configure PayPal for global transactions.',
                  tooltip: 'Enter the PayPal Merchant ID for secure payouts.',
                },
                {
                  title: 'PayPal API',
                  image: 'https://via.placeholder.com/300x200?text=PayPal+API',
                  description: 'Set up PayPal API credentials.',
                  tooltip: 'Manage Client ID and Secret for PayPal integration (backend only).',
                },
              ].map((config, index) => (
                <motion.div key={index} variants={sectionVariants}>
                  <Tilt tiltMaxAngleX={6} tiltMaxAngleY={6} glareEnable={true} glareMaxOpacity={0.3}>
                    <div className="holographic-card p-8 text-center animated-aura">
                      <Dialog>
                        <DialogTrigger asChild>
                          <div className="relative group">
                            <img src={config.image} alt={config.title} className="w-full h-48 object-cover rounded-lg mb-6" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                              <Info className="w-8 h-8 text-[hsl(var(--secondary))] animate-neon-pulse" />
                            </div>
                          </div>
                        </DialogTrigger>
                        <DialogContent className="tooltip max-w-md p-6">
                          <h3 className="text-lg font-bold text-foreground font-russo mb-2">{config.title}</h3>
                          <p className="text-sm text-muted-foreground">{config.tooltip}</p>
                        </DialogContent>
                      </Dialog>
                      <h3 className="text-2xl font-semibold text-foreground font-russo mt-4">{config.title}</h3>
                      <p className="text-sm text-muted-foreground mt-2">{config.description}</p>
                    </div>
                  </Tilt>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Payment & Wallet Configurations */}
          <motion.section variants={sectionVariants} className="mb-16">
            <h2 className="text-4xl font-bold text-foreground font-russo text-center mb-8 text-glow-accent">
              <Settings className="inline-block w-10 h-10 text-[hsl(var(--primary))] animate-neon-pulse mr-3" />
              Configure Settings
            </h2>
            <SwytchCard gradient="from-[hsl(var(--primary),0.2)] to-[hsl(var(--secondary),0.2)]" className="p-8 holographic-card">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <Banknote className="w-6 h-6 text-[hsl(var(--secondary))] animate-neon-pulse" />
                  <Dialog>
                    <DialogTrigger asChild>
                      <input
                        type="text"
                        placeholder="UPI ID (e.g., yourname@bank)"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="input-system w-full"
                        aria-label="UPI ID"
                      />
                    </DialogTrigger>
                    <DialogContent className="tooltip max-w-md p-6">
                      <p className="text-sm text-muted-foreground">Enter the UPI ID for processing player fiat transactions.</p>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="flex items-center gap-3">
                  <Wallet className="w-6 h-6 text-[hsl(var(--secondary))] animate-neon-pulse" />
                  <Dialog>
                    <DialogTrigger asChild>
                      <input
                        type="text"
                        placeholder="MetaMask Wallet Address (0x...)"
                        value={metamaskWalletAddress}
                        onChange={(e) => setMetamaskWalletAddress(e.target.value)}
                        className="input-system w-full"
                        aria-label="MetaMask Wallet Address"
                      />
                    </DialogTrigger>
                    <DialogContent className="tooltip max-w-md p-6">
                      <p className="text-sm text-muted-foreground">Set the MetaMask address for receiving crypto payments.</p>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="flex items-center gap-3">
                  <CreditCard className="w-6 h-6 text-[hsl(var(--secondary))] animate-neon-pulse" />
                  <Dialog>
                    <DialogTrigger asChild>
                      <input
                        type="text"
                        placeholder="PayPal Merchant ID"
                        value={paypalMerchantId}
                        onChange={(e) => setPaypalMerchantId(e.target.value)}
                        className="input-system w-full"
                        aria-label="PayPal Merchant ID"
                      />
                    </DialogTrigger>
                    <DialogContent className="tooltip max-w-md p-6">
                      <p className="text-sm text-muted-foreground">Configure the PayPal Merchant ID for global payouts.</p>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="flex items-center gap-3">
                  <Key className="w-6 h-6 text-[hsl(var(--secondary))] animate-neon-pulse" />
                  <Dialog>
                    <DialogTrigger asChild>
                      <input
                        type="text"
                        placeholder="PayPal Client ID"
                        value={paypalClientId}
                        onChange={(e) => setPaypalClientId(e.target.value)}
                        className="input-system w-full"
                        aria-label="PayPal Client ID"
                      />
                    </DialogTrigger>
                    <DialogContent className="tooltip max-w-md p-6">
                      <p className="text-sm text-muted-foreground">Enter the PayPal Client ID for API integration.</p>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="flex items-center gap-3">
                  <Key className="w-6 h-6 text-[hsl(var(--secondary))] animate-neon-pulse" />
                  <Dialog>
                    <DialogTrigger asChild>
                      <input
                        type="password"
                        placeholder="PayPal Client Secret (NEVER EXPOSE IN PROD)"
                        value={paypalClientSecret}
                        onChange={(e) => setPaypalClientSecret(e.target.value)}
                        className="input-system w-full"
                        aria-label="PayPal Client Secret"
                      />
                    </DialogTrigger>
                    <DialogContent className="tooltip max-w-md p-6">
                      <p className="text-sm text-muted-foreground">Set the PayPal Client Secret (handled securely on backend in production).</p>
                    </DialogContent>
                  </Dialog>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <motion.button
                      className="btn-system-glow w-full flex items-center justify-center gap-3 text-lg"
                      onClick={handleUpdateConfig}
                      disabled={updateLoading}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {updateLoading ? 'Updating...' : 'Update Configurations'} <Settings className="w-6 h-6" />
                    </motion.button>
                  </DialogTrigger>
                  <DialogContent className="tooltip max-w-md p-6">
                    <p className="text-sm text-muted-foreground">Submit updated configurations to the backend for processing.</p>
                  </DialogContent>
                </Dialog>
                <AnimatePresence>
                  {error && (
                    <motion.p
                      className="text-rose-400 text-sm text-center mt-4 font-inter system-message"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>
                <p className="text-xs text-muted-foreground mt-4 text-center font-inter">
                  *Note: Sensitive keys like Client Secret are managed securely on the backend in production (e.g., Firebase Cloud Functions).
                </p>
              </div>
            </SwytchCard>
          </motion.section>

          {/* Admin Actions */}
          <motion.section variants={sectionVariants} className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground font-russo mb-8 text-glow-accent">
              <Database className="inline-block w-10 h-10 text-[hsl(var(--secondary))] animate-neon-pulse mr-3" />
              Admin Actions
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8 font-inter">
              Manage transaction logs, review player activities, or deploy new configurations across the PETverse.
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <motion.button
                  className="btn-accent text-lg font-semibold group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="View Transaction Logs"
                >
                  View Transaction Logs <Database className="ml-3 w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                </motion.button>
              </DialogTrigger>
              <DialogContent className="tooltip max-w-md p-6">
                <p className="text-sm text-muted-foreground">Access transaction logs to monitor player activities (placeholder action).</p>
              </DialogContent>
            </Dialog>
          </motion.section>
        </motion.div>
      </motion.div>
    </SwytchErrorBoundary>
  );
};

export default AdminPage;