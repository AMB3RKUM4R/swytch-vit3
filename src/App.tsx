import { FC, useState } from 'react';
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
import TopNav from './components/TopNav'; // Mobile Top Bar
import BottomNav from './components/BottomNav'; // Mobile Bottom Bar
import LeftSidebar from './components/LeftSidebar'; // Desktop Left Rail
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
  const { activeModal, setShowMessage } = useModal(); 
  const { userId } = usePlayer();
  const { activeGameId, setActiveGameId } = useWebGL(); 
  
  const [showSplash, setShowSplash] = useState(true);

  // Layout Logic
  const showNav = !activeGameId;

  return (
    <div className="min-h-screen bg-black text-white font-inter overflow-hidden selection:bg-primary/30"> 
      
      {/* 1. CINEMATIC SPLASH */}
      <AnimatePresence>
        {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      </AnimatePresence>

      {/* 2. GAME LAYER (Unity Overlay) */}
      <UnityStage activeGameId={activeGameId} setActiveGameId={setActiveGameId} /> 

      {/* 3. MAIN APP LAYER */}
      <div className={`h-screen flex flex-col ${activeGameId ? 'hidden' : 'flex'}`}>
         
         {/* MOBILE TOP NAV (Hidden on Desktop) */}
         <div className="lg:hidden">
            {showNav && <TopNav />}
         </div>

         {/* 3-COLUMN DESKTOP LAYOUT */}
         <div className="flex-grow flex overflow-hidden relative pt-[60px] lg:pt-0 pb-[60px] md:pb-0">
             
             {/* LEFT COLUMN: NAVIGATION (Desktop Only) */}
             <aside className="hidden lg:flex w-[280px] border-r border-white/10 bg-black flex-col z-30">
                 <LeftSidebar />
             </aside>

             {/* CENTER COLUMN: FEED / CONTENT (Scrollable) */}
             <main className="flex-1 overflow-y-auto relative z-10 bg-black scrollbar-thin scrollbar-thumb-primary">
                 <div className="max-w-2xl mx-auto w-full"> {/* Center Constraints */}
                     <AnimatePresence mode="wait">
                      <Routes>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/home" element={<LandingPage />} />
                        
                        {/* Protected Pages */}
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

             {/* RIGHT COLUMN: SOCIAL / STATS (Desktop Only) */}
             <aside className="hidden xl:flex w-[380px] border-l border-white/10 bg-black/50 backdrop-blur-sm flex-col z-20">
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

      {/* MODAL LAYER */}
      <AnimatePresence>
        {activeModal === 'auth' && <AuthModal setShowMessage={setShowMessage} />} 
        {(activeModal === 'payment' || activeModal === 'deposit') && <PaymentModal />} 
        {activeModal === 'withdraw' && <WithdrawModal />} 
      </AnimatePresence>
    </div>
  );
};

export default App;