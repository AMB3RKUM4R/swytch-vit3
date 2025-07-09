// App.tsx
import { FC, SetStateAction } from 'react';
import { Routes, Route } from 'react-router-dom';

import SwytchErrorBoundary from './components/ErrorBoundaryComponent';
import AuthModal from './components/AuthModal';
import PaymentModal from './components/PaymentModal';

import LandingPage from './pages/LandingPage';
import Home from './pages/Home';
import Vault from './pages/Vault';
import Tokenomics from './pages/Tokenomics';
import Benefits from './pages/Benefits';
import Vision from './pages/Vision';
import Market from './pages/Market';
import Shop from './pages/Shop';
import Community from './pages/Community';
import Membership from './pages/Membership';
import TermsOfUse from './pages/TermsOfUse';
import DSPETDisclosure from './pages/DSPETDisclosure';
import DSPETPrivacy from './pages/DSPETPrivacy';
import GamesPage from './pages/GamesPage';
import BingoGame from './games/bingo';
import BlackjackGame from './games/blackjack';
import BridgeGame from './games/bridge';
import CaribbeanStudGame from './games/CaribbeanStudGame';
import FortuneWheelGame from './games/FortuneWheel';
import HorseGame from './games/horse';
import PontoonGame from './games/pontoon';
import RedDogGame from './games/reddog';
import RocketCrashGame from './games/rocketcrash';
import ScratchCardsGame from './games/Scratch';
import SolitaireGame from './games/SolitaireGame';
import { Sparkles } from 'lucide-react';
// Removed motion and AnimatePresence imports
// import { motion, AnimatePresence } from 'framer-motion';


interface AppProps {
  userId: string | null;
  activeModal: string | null;
  setActiveModal: React.Dispatch<React.SetStateAction<string | null>>;
  setShowMessage: React.Dispatch<React.SetStateAction<string>>;
  setIsPETMember: React.Dispatch<React.SetStateAction<boolean>>;
  updatePlayerFirestore: (updates: Partial<any>) => Promise<void>;
  jewelsBalance: number;
  goldBalance: number;
  currentLevel: number;
  isPending: boolean;
  authLoading: boolean;
  showWalletModal: boolean;
  setShowWalletModal: React.Dispatch<React.SetStateAction<boolean>>;
  autoPlay?: boolean;
  setAutoPlay?: React.Dispatch<React.SetStateAction<boolean>>;
  mousePosition: { x: number; y: number; };
}

interface PageProps {
  userId: string | null;
  activeModal: string | null;
  setActiveModal: React.Dispatch<SetStateAction<string | null>>;
  setShowMessage: React.Dispatch<SetStateAction<string>>;
  setIsPETMember: React.Dispatch<SetStateAction<boolean>>;
  updatePlayerFirestore: (updates: Partial<any>) => Promise<void>;
  jewelsBalance: number;
  goldBalance: number;
  currentLevel: number;
  isPending: boolean;
  authLoading: boolean;
  showWalletModal: boolean;
  setShowWalletModal: React.Dispatch<SetStateAction<boolean>>;
  autoPlay?: boolean;
  setAutoPlay?: React.Dispatch<SetStateAction<boolean>>;
  mousePosition: { x: number; y: number; };
}

interface GameProps {
  userId: string | null;
  setIsPETMember: React.Dispatch<SetStateAction<boolean>>;
  updatePlayerFirestore: (updates: Partial<any>) => Promise<void>;
  setShowMessage: React.Dispatch<SetStateAction<string>>;
  setActiveModal: React.Dispatch<SetStateAction<string | null>>;
}

interface RedDogGameProps {
  userId: string | null;
  activeModal: string | null;
  setActiveModal: React.Dispatch<SetStateAction<string | null>>;
  setIsPETMember: React.Dispatch<SetStateAction<boolean>>;
  setShowMessage: React.Dispatch<SetStateAction<string>>;
  updatePlayerFirestore: (updates: Partial<any>) => Promise<void>;
}


const App: FC<AppProps> = (props) => {
  const { authLoading, isPending, activeModal, setActiveModal, setShowMessage } = props;

  // Theming for loading state
  // This div will inherit the global background gradient and text color from index.css
  if (authLoading || isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center text-foreground font-inter">
        <div
          className="text-center"
        >
          {/* Using text-primary as defined in your HSL variables */}
          <Sparkles className="w-10 h-10 text-primary animate-pulse mx-auto mb-4" />
          <p>Loading Swytch PETverse...</p>
        </div>
      </div>
    );
  }

  const pageProps: PageProps = {
    ...props,
  };

  const redDogGameProps: RedDogGameProps = {
    userId: props.userId,
    activeModal: props.activeModal,
    setActiveModal: props.setActiveModal,
    setIsPETMember: props.setIsPETMember,
    setShowMessage: props.setShowMessage,
    updatePlayerFirestore: props.updatePlayerFirestore,
  };

  const gameProps: GameProps = {
    userId: props.userId,
    setIsPETMember: props.setIsPETMember,
    updatePlayerFirestore: props.updatePlayerFirestore,
    setShowMessage: props.setShowMessage,
    setActiveModal: props.setActiveModal,
  };

  return (
    <>
      <Routes>
        <Route path="/" element={<SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}><LandingPage {...pageProps} /></SwytchErrorBoundary>} />
        <Route
          path="/home"
          element={
            <SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}>
              <Home {...pageProps} />
            </SwytchErrorBoundary>
          }
        />
        <Route path="/vault" element={<SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}><Vault {...pageProps} /></SwytchErrorBoundary>} />
        <Route path="/tokenomics" element={<SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}><Tokenomics {...pageProps} /></SwytchErrorBoundary>} />
        <Route path="/benefits" element={<SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}><Benefits {...pageProps} /></SwytchErrorBoundary>} />
        <Route path="/vision" element={<SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}><Vision {...pageProps} /></SwytchErrorBoundary>} />
        <Route path="/market" element={<SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}><Market {...pageProps} /></SwytchErrorBoundary>} />
        <Route path="/shop" element={<SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}><Shop {...pageProps} /></SwytchErrorBoundary>} />
        <Route path="/community" element={<SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}><Community {...pageProps} /></SwytchErrorBoundary>} />
        <Route path="/membership" element={<SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}><Membership {...pageProps} /></SwytchErrorBoundary>} />
        <Route path="/terms" element={<SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}><TermsOfUse {...pageProps} /></SwytchErrorBoundary>} />
        <Route path="/disclosure" element={<SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}><DSPETDisclosure {...pageProps} /></SwytchErrorBoundary>} />
        <Route path="/dspet-privacy" element={<SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}><DSPETPrivacy {...pageProps} /></SwytchErrorBoundary>} />
        <Route path="/games" element={<SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}><GamesPage {...pageProps} /></SwytchErrorBoundary>} />
        <Route path="/games/bingo" element={<SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}><BingoGame {...gameProps} /></SwytchErrorBoundary>} />
        <Route path="/games/blackjack" element={<SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}><BlackjackGame {...gameProps} /></SwytchErrorBoundary>} />
        <Route path="/games/bridge" element={<SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}><BridgeGame {...gameProps} /></SwytchErrorBoundary>} />
        <Route path="/games/caribbean-stud" element={<SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}><CaribbeanStudGame {...gameProps} /></SwytchErrorBoundary>} />
        <Route path="/games/fortune-wheel" element={<SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}><FortuneWheelGame {...gameProps} /></SwytchErrorBoundary>} />
        <Route path="/games/horse" element={<SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}><HorseGame {...gameProps} /></SwytchErrorBoundary>} />
        <Route path="/games/pontoon" element={<SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}><PontoonGame {...gameProps} /></SwytchErrorBoundary>} />
        <Route path="/games/reddog" element={<SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}><RedDogGame {...redDogGameProps} /></SwytchErrorBoundary>} />
        <Route path="/games/rocketcrash" element={<SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}><RocketCrashGame {...gameProps} /></SwytchErrorBoundary>} />
        <Route path="/games/Scratch" element={<SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}><ScratchCardsGame {...gameProps} /></SwytchErrorBoundary>} />
        <Route path="/games/solitaire" element={<SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}><SolitaireGame {...gameProps} /></SwytchErrorBoundary>} />
        {/*
          AuthModal and PaymentModal are rendered globally by AppContent.tsx
          based on activeModal state. Routes here are redundant if they are
          always shown as overlays. Keeping them commented out as per typical
          modal pattern. If you need them as standalone pages, uncomment.
        */}
        {/* <Route path="/auth" element={<SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}><AuthModal setShowMessage={setShowMessage} /></SwytchErrorBoundary>} /> */}
        {/* <Route path="/payment" element={<SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}><PaymentModal userId={props.userId} setShowMessage={setShowMessage} setIsPETMember={props.setIsPETMember} updatePlayerFirestore={props.updatePlayerFirestore} /></SwytchErrorBoundary>} /> */}
      </Routes>
      {/* Modals rendered as overlays based on activeModal state */}
      {activeModal === 'auth' && (
        <AuthModal setShowMessage={setShowMessage} />
      )}
      {activeModal === 'payment' && (
        <PaymentModal
          userId={props.userId}
          setShowMessage={setShowMessage}
          setIsPETMember={props.setIsPETMember}
          updatePlayerFirestore={props.updatePlayerFirestore}
        />
      )}
    </>
  );
};

export default App;