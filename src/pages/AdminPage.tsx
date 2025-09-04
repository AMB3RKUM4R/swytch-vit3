import { FC, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Settings, UserPlus, BarChart2, ShieldAlert } from 'lucide-react';
import { useAccount } from 'wagmi';

import SwytchErrorBoundary from '../components/ErrorBoundaryComponent';
import StarfieldBackground from '../components/StarfieldBackground';
import { db } from '../lib/firebaseConfig'; 
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { PageProps } from '../lib/types';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.3 } },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
};

const tabContentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: 'easeIn' } },
}

const AdminPage: FC<PageProps> = ({
  setShowMessage,
  setActiveModal,
  isPending,
  authLoading,
}) => {
  // Primary admin wallet address (case-insensitive comparison)
  const adminWalletAddress = '0xDE9978913D9a969d799A2ba9381FB82450b92CE0';
  
  const { address: connectedAddress } = useAccount();
  const isAdmin = connectedAddress?.toLowerCase() === adminWalletAddress.toLowerCase();

  const [newAdminAddress, setNewAdminAddress] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'management' | 'stats'>('management');

  const handleGrantAdmin = useCallback(async () => {
    if (!isAdmin) {
      setShowMessage('⚠️ Access Denied: You are not authorized for this action.');
      return;
    }
    // Basic address validation
    if (!/^0x[a-fA-F0-9]{40}$/.test(newAdminAddress.trim())) {
      setShowMessage('⚠️ Please enter a valid Ethereum wallet address.');
      return;
    }

    setUpdateLoading(true);
    try {
      // This action should be secured by Firestore rules allowing only admins to write
      const adminConfigRef = doc(db, 'AdminConfig', 'globalConfig');
      await updateDoc(adminConfigRef, {
        admins: arrayUnion(newAdminAddress.trim().toLowerCase()), // Store addresses in lowercase
      });
      
      setShowMessage(`✅ Admin access granted to address: ${newAdminAddress}!`);
      setNewAdminAddress('');
    } catch (err) {
      console.error('Failed to grant admin access:', err);
      setShowMessage('⚠️ Operation failed. See console for details.');
    } finally {
      setUpdateLoading(false);
    }
  }, [isAdmin, newAdminAddress, setShowMessage]);

  if (authLoading || isPending) {
    return null; // Render nothing during initial loading states
  }

  // --- Access Denied View ---
  if (!isAdmin) {
    return (
      <SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}>
        <div className="min-h-screen text-foreground font-orbitron bg-noise">
          <StarfieldBackground />
          <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
            <motion.div variants={sectionVariants} initial="hidden" animate="visible" className="text-center p-8 bg-black/20 rounded-lg border border-[hsl(var(--destructive),0.2)] backdrop-blur-sm max-w-2xl">
              <ShieldAlert className="mx-auto w-16 h-16 text-[hsl(var(--destructive))] animate-pulse mb-4" />
              <h1 className="text-4xl lg:text-5xl font-extrabold text-foreground font-russo mb-4 text-glow-destructive tracking-tight">
                Access Denied
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8 font-inter">
                You do not have the required clearance to access the Admin Command Center. This area is restricted to authorized wallet addresses only.
              </p>
              <Link to="/home" className="btn-system-glow text-lg font-semibold group">
                Return to Home
              </Link>
            </motion.div>
          </div>
        </div>
      </SwytchErrorBoundary>
    );
  }

  // --- Main Admin Dashboard ---
  return (
    <SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}>
      <motion.div
        className="min-h-screen text-foreground font-orbitron bg-noise"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <StarfieldBackground />
        <div className="relative z-10 max-w-5xl mx-auto py-16 px-4 sm:px-6 lg:px-8 space-y-12">
            {/* Header */}
            <motion.section variants={sectionVariants} className="text-center">
                <Settings className="mx-auto w-16 h-16 text-[hsl(var(--secondary))] animate-neon-pulse mb-4" />
                <h1 className="text-5xl lg:text-7xl font-extrabold text-foreground font-russo mb-4 text-glow-primary tracking-tight">
                Admin Command Center
                </h1>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-inter">
                Manage user permissions, monitor system activity, and configure the PETverse.
                </p>
            </motion.section>

            {/* Tabbed Interface */}
            <motion.section variants={sectionVariants}>
                <div className="flex justify-center items-center gap-4 sm:gap-8 mb-10 p-2 bg-black/20 border border-[hsl(var(--primary),0.1)] rounded-lg">
                    {(['management', 'stats'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`relative w-full text-center px-4 py-3 font-russo text-lg capitalize rounded-md transition-colors duration-300 ${activeTab === tab ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                        {activeTab === tab && (
                            <motion.div layoutId="admin-tab-indicator" className="absolute inset-0 bg-[hsl(var(--primary),0.2)] rounded-md z-0" transition={{ type: 'spring', stiffness: 300, damping: 30 }} />
                        )}
                        <span className="relative z-10 flex items-center justify-center gap-2">
                           {tab === 'management' && <UserPlus size={20} />}
                           {tab === 'stats' && <BarChart2 size={20} />}
                           {tab === "management" ? "User Management" : "System Stats"}
                        </span>
                    </button>
                    ))}
                </div>

                <div className="min-h-[250px] p-8 bg-black/20 rounded-lg border border-[hsl(var(--primary),0.1)] backdrop-blur-sm">
                    <AnimatePresence mode="wait">
                        {activeTab === 'management' && (
                            <motion.div key="management" variants={tabContentVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6 max-w-lg mx-auto">
                                <h3 className="text-2xl font-bold font-russo text-glow-secondary">Grant Admin Privileges</h3>
                                <div className="flex flex-col sm:flex-row items-center gap-4">
                                    <input
                                        type="text"
                                        placeholder="Enter wallet address (0x...)"
                                        value={newAdminAddress}
                                        onChange={(e) => setNewAdminAddress(e.target.value)}
                                        className="input-system w-full flex-grow"
                                        aria-label="Wallet Address to Promote"
                                        disabled={updateLoading}
                                    />
                                    <button
                                        className="btn-system-glow w-full sm:w-auto flex-shrink-0"
                                        onClick={handleGrantAdmin}
                                        disabled={updateLoading || !newAdminAddress.trim()}
                                    >
                                        {updateLoading ? 'Granting...' : 'Grant Access'}
                                    </button>
                                </div>
                                <p className="text-xs text-muted-foreground text-center font-inter pt-2">
                                    This action will add a new wallet address to the list of platform administrators. Ensure the address is correct as this is irreversible without database intervention.
                                </p>
                            </motion.div>
                        )}
                        {activeTab === 'stats' && (
                             <motion.div key="stats" variants={tabContentVariants} initial="hidden" animate="visible" exit="exit" className="text-center">
                                <h3 className="text-2xl font-bold font-russo text-glow-secondary">System Statistics</h3>
                                <p className="text-muted-foreground mt-4 font-inter">
                                    System health monitoring and analytics dashboards will be available in a future update.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.section>
        </div>
      </motion.div>
    </SwytchErrorBoundary>
  );
};

export default AdminPage;
