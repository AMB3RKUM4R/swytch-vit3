import { FC, useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Contexts (FIX: Using relative paths for context imports)
import { useModal } from './components/context/ModalContext';
import { usePlayer } from './components/context/PlayerContext';
import { useWebGL } from './components/context/WebglContext'; 

// Components (FIX: Using relative paths for component imports)
import AuthModal from './components/AuthModal';
import PaymentModal from './components/PaymentModal';
import WithdrawModal from './components/WithdrawlModal';
import TopNav from './components/TopNav';
import BottomNav from './components/BottomNav';
import LoadingScreen from './components/LoadingScreen';
import LeftSidebar from './components/LeftSidebar'; 
import UnityStage from './components/UnityStage';

// Pages (FIX: Using relative paths for page imports)
import LandingPage from './pages/LandingPage';
import Home from './pages/Home';
import Customize from './pages/Customize';
import { Vault } from './pages/Vault'; 
import Shop from './pages/Shop';
import Community from './pages/Community';
import Membership from './pages/Membership';
import Inventory from './pages/Inventory';
import AdminPage from './pages/AdminPage';

const App: FC = () => {
  const { activeModal, setActiveModal, setShowMessage } = useModal(); 
  const { 
    userId, 
    initialAuthCheckComplete, 
    playerData
  } = usePlayer();
  
  // CRITICAL: Get activeGameId and setter from the context
  const { activeGameId, setActiveGameId } = useWebGL(); 

  const [showInitialAuthModal, setShowInitialAuthModal] = useState(true); 

  useEffect(() => {
    if (initialAuthCheckComplete && !userId && showInitialAuthModal) {
      setShowInitialAuthModal(false); 
    }
  }, [initialAuthCheckComplete, userId, showInitialAuthModal, setActiveModal]);

  if (!initialAuthCheckComplete) {
    return <LoadingScreen message="Initializing PETverse..." />;
  }

  const hasAvatar = !!playerData?.character?.selectedID;
  const redirectPath = userId ? (hasAvatar ? '/home' : '/customize') : '/';

  return (
    <div className="min-h-screen bg-black text-white font-inter"> 
      {/* Game Overlay - Now connected to WebGL context state */}
      <UnityStage activeGameId={activeGameId} setActiveGameId={setActiveGameId} /> 

      {/* Navigation */}
      <TopNav />
      <LeftSidebar /> 

      {/* Main Content */}
      {/* The lg:pl-80 offset accounts for the LeftSidebar */}
      <main className="pt-[70px] pb-24 md:pb-8 md:pl-0 lg:pl-80"> 
        <AnimatePresence mode="wait">
          <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />

            {/* Auth Flow */}
            {/* This route forces new users to the Customizer screen if they have an ID but no avatar */}
            <Route 
              path="/customize" 
              element={userId ? <Customize /> : <Navigate to="/" replace />} 
            />

            {/* Protected Routes (Requires login and Avatar selection) */}
            {(userId && hasAvatar) ? (
              <>
                <Route path="/home" element={<Home />} />
                <Route path="/vault" element={<Vault />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/community" element={<Community />} />
                <Route path="/membership" element={<Membership />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/admin" element={<AdminPage />} />
                {/* Redirects any invalid path back to the home console */}
                <Route path="*" element={<Navigate to="/home" replace />} /> 
              </>
            ) : (
                // Fallback for logged in user without avatar, or logged out user
                <Route path="*" element={<Navigate to={redirectPath} replace />} />
            )}
          </Routes>
        </AnimatePresence>
      </main>

      <BottomNav />

      {/* MODALS */}
      <AnimatePresence>
        {activeModal === 'auth' && <AuthModal setShowMessage={setShowMessage} />} 
        {(activeModal === 'payment' || activeModal === 'deposit') && <PaymentModal />} 
        {activeModal === 'withdraw' && <WithdrawModal />} 
      </AnimatePresence>
    </div>
  );
};

export default App;