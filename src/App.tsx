// src/App.tsx
import { FC, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SwytchErrorBoundary from './components/ErrorBoundaryComponent';
import AuthModal from './components/AuthModal';
import PaymentModal from './components/PaymentModal';
import LoadingSpinner from './components/LoadingSpinner';

// Import all main page components
import Home from './pages/Home';
import { Vault } from './pages/Vault';
import Market from './pages/Market';
import Shop from './pages/Shop';
import Community from './pages/Community';
import Membership from './pages/Membership';
import GamesPage from './pages/GamesPage';
import Inventory from './pages/Inventory';
import Marketplace from './pages/Marketplace';
import DSPETDisclosure from './pages/DSPETDisclosure';
import LandingPage from './pages/LandingPage';
import AdminPage from './pages/AdminPage';
import Benefits from './pages/benefits'; // FIX: Corrected import casing to lowercase 'benefits'


// Import all required interfaces from lib/types.ts
import { AppProps, PageProps, PaymentModalProps } from './lib/types';


const App: FC<AppProps> = (props) => {
  const { authLoading, isPending, activeModal, setActiveModal, setShowMessage, userId, initialAuthCheckComplete } = props;
  const navigate = useNavigate();
  const location = useLocation();

  // Define restricted paths that require authentication
  const restrictedPaths = [
    '/home', '/vault', '/benefits', '/market', '/shop', '/community',
    '/membership', '/games', '/inventory', '/marketplace', '/admin'
  ];

  // Effect to handle authentication and redirection
  useEffect(() => {
    if (initialAuthCheckComplete && !userId) {
      if (restrictedPaths.includes(location.pathname) && location.pathname !== '/') {
        navigate('/');
        if (activeModal !== 'auth') {
          setActiveModal('auth');
          setShowMessage('👋 Please sign in to access this page.');
        }
      } else if (location.pathname === '/' && activeModal !== 'auth') {
        setActiveModal('auth');
        setShowMessage('👋 Welcome! Please sign in to continue.');
      }
    } else if (initialAuthCheckComplete && userId) {
      if (activeModal === 'auth') {
        setActiveModal(null);
        setShowMessage('🎉 Signed in successfully!');
      }
    }
  }, [userId, initialAuthCheckComplete, activeModal, setActiveModal, setShowMessage, navigate, location.pathname]);


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

        <Route path="/inventory" element={<SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}><Inventory {...pageProps} /></SwytchErrorBoundary>} />
        <Route path="/marketplace" element={<SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}><Marketplace {...pageProps} /></SwytchErrorBoundary>} />

        <Route path="/admin" element={<SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}><AdminPage {...pageProps} /></SwytchErrorBoundary>} />
      </Routes>

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
