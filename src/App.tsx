// src/App.tsx
import { FC, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SwytchErrorBoundary from './components/ErrorBoundaryComponent';
import AuthModal from './components/AuthModal';
import PaymentModal from './components/PaymentModal';
import LoadingSpinner from './components/LoadingSpinner';

// Import all main page components
import Home from './pages/Home';
import { Vault } from './pages/Vault';
import Benefits from './pages/benefits';
import Market from './pages/Market';
import Shop from './pages/Shop';
import Community from './pages/Community';
import Membership from './pages/Membership';
import GamesPage from './pages/GamesPage';
import Inventory from './pages/Inventory';
import Marketplace from './pages/Marketplace';
import DSPETDisclosure from './pages/DSPETDisclosure';
import LandingPage from './pages/LandingPage'; // Re-import LandingPage for its potential use as a non-auth route


// Import all required interfaces from lib/types.ts
import { AppProps, PageProps, PaymentModalProps } from './lib/types';


const App: FC<AppProps> = (props) => {
  const { authLoading, isPending, activeModal, setActiveModal, setShowMessage, userId, initialAuthCheckComplete } = props;
  const navigate = useNavigate();

  // Effect to show AuthModal if no user is logged in after initial auth check
  useEffect(() => {
    // Only trigger if auth check is complete, no user is logged in, and AuthModal isn't already active
    if (initialAuthCheckComplete && !userId && activeModal !== 'auth') {
      setActiveModal('auth');
      setShowMessage('👋 Welcome! Please sign in to continue.');
      // Optionally navigate to a specific path like '/' if you want a blank screen behind the modal
      // navigate('/');
    }
  }, [userId, initialAuthCheckComplete, activeModal, setActiveModal, setShowMessage, navigate]);


  // Show a global loading spinner if auth or data is pending
  if (authLoading || isPending) {
    return <LoadingSpinner fullScreen={true} message="Loading Swytch PETverse..." />;
  }

  // Prepare props for different component types using the defined interfaces
  const pageProps: PageProps = { ...props };

  // PaymentModalProps for direct usage
  const paymentModalProps: PaymentModalProps = {
    userId: props.userId,
    setShowMessage: props.setShowMessage,
    setIsPETMember: props.setIsPETMember,
    updatePlayerFirestore: props.updatePlayerFirestore,
  };

  return (
    <>
      <Routes>
        {/* LandingPage is still available but won't be the initial view if AuthModal is forced */}
        <Route path="/" element={<SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}><LandingPage {...pageProps} /></SwytchErrorBoundary>} />
        <Route path="/home" element={<SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}><Home {...pageProps} /></SwytchErrorBoundary>} />
        <Route path="/vault" element={<SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}><Vault {...pageProps} /></SwytchErrorBoundary>} />
        <Route path="/benefits" element={<SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}><Benefits {...pageProps} /></SwytchErrorBoundary>} />
        <Route path="/market" element={<SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}><Market {...pageProps} /></SwytchErrorBoundary>} />
        <Route path="/shop" element={<SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}><Shop {...pageProps} /></SwytchErrorBoundary>} />
        <Route path="/community" element={<SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}><Community {...pageProps} /></SwytchErrorBoundary>} />
        <Route path="/membership" element={<SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}><Membership {...pageProps} /></SwytchErrorBoundary>} />
        <Route path="/games" element={<SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}><GamesPage {...pageProps} /></SwytchErrorBoundary>} />
        <Route path="/dspet-disclosure" element={<SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}><DSPETDisclosure {...pageProps} /></SwytchErrorBoundary>} />

        {/* New Pages for MVP (Inventory and Marketplace) */}
        <Route path="/inventory" element={<SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}><Inventory {...pageProps} /></SwytchErrorBoundary>} />
        <Route path="/marketplace" element={<SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}><Marketplace {...pageProps} /></SwytchErrorBoundary>} />

        {/* Removed specific game routes as per request - Unity games will be launched via a generic link */}
      </Routes>

      {/* Modals rendered as overlays based on activeModal state */}
      <AnimatePresence>
        {activeModal === 'auth' && (
          <AuthModal setShowMessage={setShowMessage} />
        )}
        {activeModal === 'payment' && (
          <PaymentModal {...paymentModalProps} />
        )}
        {activeModal === 'error' && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={`relative modal bg-red-900/80 text-white p-6 rounded-lg max-w-sm w-full mx-4 border border-red-500`}
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
            >
              <h2 className="text-2xl font-bold font-poppins mb-4">Error!</h2>
              <p className="font-inter">An unexpected error occurred. Please try again.</p>
              <button onClick={() => setActiveModal(null)} className="mt-4 btn-primary">Close</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default App;
