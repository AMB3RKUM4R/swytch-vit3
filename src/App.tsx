// src/App.tsx
import { FC } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Hooks & Context
import { useModal } from '@/components/context/ModalContext';
import { usePlayer } from '@/components/context/PlayerContext';

// Components
import SwytchErrorBoundary from '@/components/ErrorBoundaryComponent';
import AuthModal from '@/components/AuthModal';
import PaymentModal from '@/components/PaymentModal';
import TopNav from '@/components/TopNav';
import BottomNav from '@/components/BottomNav';
import LoadingScreen from '@/components/LoadingScreen';

// Pages
import Home from '@/pages/Home';
import { Vault } from '@/pages/Vault';
import Shop from '@/pages/Shop';
import Community from '@/pages/Community';
import Membership from '@/pages/Membership';
import Inventory from '@/pages/Inventory';
import LandingPage from '@/pages/LandingPage';
import AdminPage from '@/pages/AdminPage';

const App: FC = () => {
  // All modal logic is now cleanly separated
  const { activeModal, setActiveModal, setShowMessage } = useModal();

  // All auth and player data now comes from our new context
  const { userId, initialAuthCheckComplete } = usePlayer();

  if (!initialAuthCheckComplete) {
      return <LoadingScreen message="Initializing PETverse Core..." />;
  }

  return (
      <div className={`min-h-screen flex flex-col font-inter bg-noise`}>
          <div className="relative z-10 flex flex-col min-h-screen overflow-y-auto">
              {/* Components now pull data directly from context, no props needed */}
              <TopNav />
              <main className="flex-grow pt-16 pb-16">
                  <Routes>
                      {/* We pass minimal props to the error boundary */}
                      <Route path="/" element={<SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}><LandingPage /></SwytchErrorBoundary>} />
                      {userId ? (
                          <>
                              {/* All pages now have NO props. They pull data from usePlayer() */}
                              <Route path="/home" element={<SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}><Home /></SwytchErrorBoundary>} />
                              <Route path="/vault" element={<SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}><Vault /></SwytchErrorBoundary>} />
                              <Route path="/shop" element={<SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}><Shop /></SwytchErrorBoundary>} />
                              <Route path="/community" element={<SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}><Community /></SwytchErrorBoundary>} />
                              <Route path="/membership" element={<SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}><Membership /></SwytchErrorBoundary>} />
                              <Route path="/inventory" element={<SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}><Inventory /></SwytchErrorBoundary>} />
                              <Route path="/admin" element={<SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}><AdminPage /></SwytchErrorBoundary>} />
                          </>
                      ) : (
                          <Route path="*" element={<SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}><LandingPage /></SwytchErrorBoundary>} />
                      )}
                  </Routes>
              </main>
              {/* Components now pull data directly from context, no props needed */}
              <BottomNav />
          </div>

          <AnimatePresence>
              {activeModal === 'auth' && <AuthModal setShowMessage={setShowMessage} />}
              {/* PaymentModal also pulls its own data, no props needed */}
              {activeModal === 'payment' && <PaymentModal />}
          </AnimatePresence>
      </div>
  );
};

export default App;
