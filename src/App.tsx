import { FC, useState, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Contexts
import { useModal } from './components/context/ModalContext';
import { usePlayer } from './components/context/PlayerContext';

// Components
import AuthModal from './components/AuthModal';
import PaymentModal from './components/PaymentModal';
import WithdrawModal from './components/WithdrawlModal';
import TopNav from './components/TopNav'; 
import BottomNav from './components/BottomNav'; 
import SplashScreen from './components/SplashScreen'; 
import CommunityChat from './components/community/CommunityChat'; 
import CommunityRankings from './components/community/CommunityRankings';

// Pages
import Home from './pages/Home'; 
import Customize from './pages/Customize';
import { Vault } from './pages/Vault'; 
import Shop from './pages/Shop';
import Inventory from './pages/Inventory';
import AdminPage from './pages/AdminPage';
import Community from './pages/Community';     // NEW
import Membership from './pages/Membership';   // NEW

const App: FC = () => {
  const { activeModal, setActiveModal, setShowMessage } = useModal(); 
  const { userId } = usePlayer();
  
  const [showSplash, setShowSplash] = useState(true);
  
  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
    if (!userId) {
      setActiveModal('auth');
    }
  }, [setShowSplash, userId, setActiveModal]);

  return (
    <div className="min-h-screen bg-transparent text-white font-inter overflow-hidden selection:bg-[#39FF14] selection:text-black"> 
      
      {/* 1. SPLASH SCREEN */}
      <AnimatePresence>
        {showSplash && (
          <SplashScreen onComplete={handleSplashComplete} />
        )}
      </AnimatePresence>

      <div className="h-screen flex flex-col">
         
         {/* TOP NAV */}
         <TopNav />

         <div className="flex-grow flex overflow-hidden relative pt-[70px]">
             
             {/* CENTER CONTENT */}
             <main className="flex-1 overflow-y-auto relative z-10 bg-transparent scrollbar-thin scrollbar-thumb-[#39FF14] scrollbar-track-black">
                 <div className="w-full h-full"> 
                     <AnimatePresence mode="wait">
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/home" element={<Home />} />
                        
                        {/* Protected Routes */}
                        <Route path="/customize" element={userId ? <Customize /> : <Navigate to="/" />} />
                        <Route path="/vault" element={userId ? <Vault /> : <Navigate to="/" />} />
                        
                        {/* Public/Feature Routes */}
                        <Route path="/shop" element={<Shop />} />
                        <Route path="/inventory" element={<Inventory />} />
                        <Route path="/community" element={<Community />} />
                        <Route path="/membership" element={<Membership />} />
                        
                        {/* Admin */}
                        <Route path="/admin" element={<AdminPage />} />
                        
                        {/* Fallback */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                      </Routes>
                    </AnimatePresence>
                 </div>
             </main>

             {/* RIGHT SIDEBAR (Chat & Ranks) - Hidden on Mobile */}
             <aside className="hidden xl:flex w-[350px] border-l border-white/10 bg-black/80 backdrop-blur-md flex-col z-20 flex-shrink-0">
                 <div className="h-1/2 flex flex-col border-b border-white/10">
                    <div className="p-3 bg-black border-b border-white/5 font-mono text-[10px] text-[#39FF14] tracking-widest uppercase flex items-center gap-2">
                        <span className="w-2 h-2 bg-[#39FF14] animate-pulse rounded-full"></span> GLOBAL_UPLINK
                    </div>
                    <div className="flex-grow overflow-hidden">
                        <CommunityChat />
                    </div>
                 </div>
                 <div className="h-1/2 flex flex-col">
                    <div className="p-3 bg-black border-b border-white/5 font-mono text-[10px] text-gray-500 tracking-widest uppercase">
                        // ELITE_OPERATORS
                    </div>
                    <div className="flex-grow overflow-y-auto p-0">
                        <CommunityRankings />
                    </div>
                 </div>
             </aside>
         </div>

         {/* MOBILE BOTTOM NAV */}
         <div className="lg:hidden">
            <BottomNav />
         </div>

      </div>

      {/* GLOBAL MODALS */}
      <AnimatePresence>
        {activeModal === 'auth' && <AuthModal setShowMessage={setShowMessage} />} 
        {(activeModal === 'payment' || activeModal === 'deposit') && <PaymentModal />} 
        {activeModal === 'withdraw' && <WithdrawModal />} 
      </AnimatePresence>
    </div>
  );
};

export default App;