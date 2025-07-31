// src/pages/AdminPage.tsx
import { FC, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogTrigger } from '@radix-ui/react-dialog';
import Tilt from 'react-parallax-tilt';
import { Settings, User, Database, Link, Key, Users } from 'lucide-react';
import SwytchCard from '../components/SwytchCard';
import SwytchErrorBoundary from '../components/ErrorBoundaryComponent';
import StarfieldBackground from '../components/StarfieldBackground';
import { db } from '@/lib/firebaseConfig';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { PageProps } from '../lib/types';

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
  const [newAdminId, setNewAdminId] = useState('');
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // This hook simulates fetching a config, but for now we will just assume permissions are handled.
    setLoadingConfig(false);
  }, []);

  const handleGrantAdmin = async () => {
    if (!isAdmin) {
      setShowMessage('⚠️ Access Denied: You are not authorized to grant admin access.');
      return;
    }
    if (!newAdminId.trim()) {
      setShowMessage('⚠️ Please enter a valid User ID.');
      return;
    }

    setUpdateLoading(true);
    setError(null);

    try {
      // In a production environment, this would be a secure backend call (Cloud Function)
      // For this implementation, we will log a request to a Firestore collection
      const adminConfigRef = doc(db, 'AdminConfig', 'globalConfig');
      await updateDoc(adminConfigRef, {
        admins: arrayUnion(newAdminId.trim()),
      });
      
      setShowMessage(`✅ Admin access granted to User ID: ${newAdminId}!`);
      setNewAdminId('');
    } catch (err) {
      console.error('Failed to grant admin access:', err);
      setError('Failed to grant admin access. Check console for details.');
      setShowMessage('⚠️ Failed to grant admin access.');
    } finally {
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
              Configure the PETverse’s galactic economy with precision. Securely manage platform settings and user permissions.
            </p>
          </motion.section>

          <motion.section variants={sectionVariants} className="mb-16">
            <h2 className="text-4xl font-bold text-foreground font-russo text-center mb-8 text-glow-accent">
              <Users className="inline-block w-10 h-10 text-[hsl(var(--primary))] animate-neon-pulse mr-3" />
              Manage Admin Access
            </h2>
            <SwytchCard gradient="from-purple-700/20 to-pink-700/20" className="p-8 holographic-card">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <User className="w-6 h-6 text-[hsl(var(--secondary))] animate-neon-pulse" />
                  <Dialog>
                    <DialogTrigger asChild>
                      <input
                        type="text"
                        placeholder="Enter User ID to promote"
                        value={newAdminId}
                        onChange={(e) => setNewAdminId(e.target.value)}
                        className="input-system w-full"
                        aria-label="User ID to Promote"
                        disabled={updateLoading}
                      />
                    </DialogTrigger>
                    <DialogContent className="tooltip max-w-md p-6">
                      <p className="text-sm text-muted-foreground">Enter the unique User ID of the player you wish to grant admin access to.</p>
                    </DialogContent>
                  </Dialog>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <motion.button
                      className="btn-system-glow w-full flex items-center justify-center gap-3 text-lg"
                      onClick={handleGrantAdmin}
                      disabled={updateLoading || !newAdminId.trim()}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {updateLoading ? 'Granting Access...' : 'Grant Admin Access'} <Key className="w-6 h-6" />
                    </motion.button>
                  </DialogTrigger>
                  <DialogContent className="tooltip max-w-md p-6">
                    <p className="text-sm text-muted-foreground">Submit a request to grant admin privileges. This action is irreversible.</p>
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
                  *This action requires the primary admin's clearance. The updated list of admins will be reflected across the platform.
                </p>
              </div>
            </SwytchCard>
          </motion.section>

          <motion.section variants={sectionVariants} className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground font-russo mb-8 text-glow-accent">
              <Database className="inline-block w-10 h-10 text-[hsl(var(--secondary))] animate-neon-pulse mr-3" />
              Admin Actions
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-inter mb-8">
              Manage transaction logs, review player activities, and more.
              <br/>
              <span className="text-sm text-gray-500 italic">Withdrawal management will be available in the upcoming alpha launch.</span>
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