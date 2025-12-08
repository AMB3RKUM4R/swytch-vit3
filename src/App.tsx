import { FC, useState, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Contexts
import { useModal } from './components/context/ModalContext';
import { usePlayer } from './components/context/PlayerContext';
import { useWebGL } from './components/context/WebglContext'; 

// Components
import AuthModal from './components/AuthModal';
import PaymentModal from './components/PaymentModal';
import WithdrawModal from './components/WithdrawlModal';
import TopNav from './components/TopNav'; 
import BottomNav from './components/BottomNav'; 
import SplashScreen from './components/SplashScreen'; 
import UnityStage from './components/UnityStage';
import CommunityChat from './components/community/CommunityChat'; 
import CommunityRankings from './components/community/CommunityRankings';

// Pages
import LandingPage from './pages/LandingPage';
import Customize from './pages/Customize';
import { Vault } from './pages/Vault'; 
import Shop from './pages/Shop';
import Inventory from './pages/Inventory';
import AdminPage from './pages/AdminPage';

const App: FC = () => {
  const { activeModal, setActiveModal, setShowMessage } = useModal(); 
  const { userId } = usePlayer();
  const { activeGameId, setActiveGameId } = useWebGL(); 
  
  const [showSplash, setShowSplash] = useState(true);
  const showNav = !activeGameId;

  // --- NEW: Handle Splash Screen Completion ---
  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
    // If user is NOT logged in, open the Auth Modal immediately
    if (!userId) {
      setActiveModal('auth');
    }
  }, [setShowSplash, userId, setActiveModal]);

  return (
    <div className="min-h-screen bg-black text-white font-inter overflow-hidden selection:bg-primary/30"> 
      
      {/* 1. SPLASH SCREEN (Gatekeeper) */}
      <AnimatePresence>
        {showSplash && (
          <SplashScreen onComplete={handleSplashComplete} />
        )}
      </AnimatePresence>

      <UnityStage activeGameId={activeGameId} setActiveGameId={setActiveGameId} /> 

      <div className={`h-screen flex flex-col ${activeGameId ? 'hidden' : 'flex'}`}>
         
         {/* TOP NAV ALWAYS VISIBLE */}
         {showNav && <TopNav />}

         <div className="flex-grow flex overflow-hidden relative pt-[70px]">
             
             {/* CENTER: FEED */}
             <main className="flex-1 overflow-y-auto relative z-10 bg-black scrollbar-thin scrollbar-thumb-primary">
                 <div className="w-full h-full"> 
                     <AnimatePresence mode="wait">
                      <Routes>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/home" element={<LandingPage />} />
                        
                        <Route path="/customize" element={userId ? <Customize /> : <Navigate to="/" />} />
                        <Route path="/vault" element={userId ? <Vault /> : <Navigate to="/" />} />
                        <Route path="/shop" element={<Shop />} />
                        <Route path="/inventory" element={<Inventory />} />
                        <Route path="/admin" element={<AdminPage />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                      </Routes>
                    </AnimatePresence>
                 </div>
             </main>

             {/* RIGHT: CHAT */}
             <aside className="hidden xl:flex w-[380px] border-l border-white/10 bg-black/50 backdrop-blur-sm flex-col z-20 flex-shrink-0">
                 <div className="h-1/2 flex flex-col border-b border-white/10">
                    <div className="p-3 bg-white/5 border-b border-white/5 font-mono text-[10px] text-primary tracking-widest uppercase">
                        // GLOBAL_CHAT_RELAY
                    </div>
                    <div className="flex-grow overflow-hidden">
                        <CommunityChat />
                    </div>
                 </div>
                 <div className="h-1/2 flex flex-col">
                    <div className="p-3 bg-white/5 border-b border-white/5 font-mono text-[10px] text-white/50 tracking-widest uppercase">
                        // ELITE_OPERATORS
                    </div>
                    <div className="flex-grow overflow-y-auto p-4">
                        <CommunityRankings />
                    </div>
                 </div>
             </aside>
         </div>

         {/* MOBILE BOTTOM NAV */}
         <div className="lg:hidden">
            {showNav && <BottomNav />}
         </div>

      </div>

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