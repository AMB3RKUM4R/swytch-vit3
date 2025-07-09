import { FC, useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { auth, db } from './lib/firebaseConfig'; // Removed initializeFirebaseAuthAndListen import
import { doc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { useAuthUser } from './hooks/useAuthUser';
import { useTheme } from './context/ThemeContext';
import { useModal } from './context/ModalContext'; // Import useModal
import SwytchErrorBoundary from './components/ErrorBoundaryComponent';
import TopNav from './components/TopNav';
import BottomNav from './components/BottomNav';
import RewardPopup from './components/RewardPopup';
import AuthModal from './components/AuthModal';
import PaymentModal from './components/PaymentModal';
// import PhoneLogin from './hooks/PhoneLogin'; // PhoneLogin is a hook, not a component. It should not be directly routed.
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
import { motion, AnimatePresence } from 'framer-motion';

// Define App props
interface AppProps {
  setShowMessage: React.Dispatch<React.SetStateAction<string>>;
  setActiveModal: React.Dispatch<React.SetStateAction<string | null>>;
}

// Define PageProps to match types.ts
interface PageProps {
  userId: string | null;
  activeModal: string | null; // This is the value, not the setter
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
  mousePosition: { x: number; y: number; }; // Made mousePosition required
}

// Define GameProps for most game pages
interface GameProps {
  userId: string | null;
  setIsPETMember: React.Dispatch<React.SetStateAction<boolean>>;
  updatePlayerFirestore: (updates: Partial<any>) => Promise<void>;
  setShowMessage: React.Dispatch<React.SetStateAction<string>>;
  setActiveModal: React.Dispatch<React.SetStateAction<string | null>>;
}

// Define RedDogGameProps (if it needs specific props different from GameProps)
interface RedDogGameProps {
  userId: string | null;
  activeModal: string | null;
  setActiveModal: React.Dispatch<React.SetStateAction<string | null>>;
  setIsPETMember: React.Dispatch<React.SetStateAction<boolean>>;
  setShowMessage: React.Dispatch<React.SetStateAction<string>>;
  updatePlayerFirestore: (updates: Partial<any>) => Promise<void>;
}

// Define TopNavProps
interface TopNavProps {
  userId: string | null;
  jewelsBalance: number;
  isPETMember: boolean;
  setShowMessage: React.Dispatch<React.SetStateAction<string>>;
  setShowWalletModal: React.Dispatch<React.SetStateAction<boolean>>;
}

// Define BottomNavProps
interface BottomNavProps {
  userId: string | null;
  jewelsBalance: number;
  isPETMember: boolean;
  setShowMessage: React.Dispatch<React.SetStateAction<string>>;
  setActiveModal: React.Dispatch<React.SetStateAction<string | null>>; // Use SetStateAction from React
}


const App: FC<AppProps> = ({ setShowMessage, setActiveModal }) => {
  const { loading: authLoading } = useAuthUser(); // Destructure user for firebaseAuthUser
  const { isDarkMode } = useTheme();
  const { activeModal, showMessage: currentGlobalMessage } = useModal(); // Get showMessage value from useModal
  const [userId, setUserId] = useState<string | null>(null);
  const [jewelsBalance, setJewelsBalance] = useState<number>(0);
  const [goldBalance, setGoldBalance] = useState<number>(0);
  const [currentLevel, setCurrentLevel] = useState<number>(0);
  const [isPending, setIsPending] = useState<boolean>(false);
  const [showWalletModal, setShowWalletModal] = useState<boolean>(false);
  const [autoPlay, setAutoPlay] = useState<boolean>(false);
  const [isPETMember, setIsPETMember] = useState<boolean>(false);
  // Removed localShowMessage as setShowMessage prop from Root is sufficient for global popups

  const updatePlayerFirestore = async (updates: Partial<any>) => {
    if (!userId) {
      setShowMessage('⚠️ Please connect your wallet or log in.');
      setActiveModal('auth');
      return;
    }
    try {
      const playerData = {
        ...updates,
        updatedAt: serverTimestamp(),
        character: updates.character || { selectedID: '', skin: '' },
        inventory: updates.inventory || { equipped: { armor: '', weapon: '' }, items: {} },
        chest: updates.chest || '',
        energy: updates.energy || 100,
        mana: updates.mana || 100,
        xp: updates.xp || 0,
        key: updates.key || '',
      };
      await setDoc(doc(db, 'Players', userId), playerData, { merge: true });
    } catch (err) {
      console.error('Firestore update error:', err);
      setShowMessage('⚠️ Failed to update player data. Please check your connection.');
      setActiveModal('error');
    }
  };

  useEffect(() => {
    // This effect handles Firebase auth state changes and initial user data fetching
    const unsubscribeAuth = auth.onAuthStateChanged(
      (authUser) => { // Renamed user to authUser to avoid conflict with `user` from useAuthUser
        setUserId(authUser ? authUser.uid : null);
        setIsPending(false);
      },
      (error) => {
        console.error('Auth state change error:', error);
        setShowMessage('⚠️ Failed to initialize authentication. Please try again.');
        setActiveModal('error');
        setIsPending(false);
      }
    );

    // If userId is available (user is authenticated, including anonymous)
    if (userId) {
      setIsPending(true);
      const userRef = doc(db, 'Players', userId);
      const unsubscribeUserData = onSnapshot(
        userRef,
        (docSnap) => { // Renamed doc to docSnap for clarity
          if (docSnap.exists()) {
            const data = docSnap.data();
            setJewelsBalance(data.jewels || 0);
            setGoldBalance(data.gold || 0);
            setCurrentLevel(data.level || 0);
            setIsPETMember(data.isPETMember || false);
            const now = Date.now();
            const oneDay = 24 * 60 * 60 * 1000;
            if (now - (data.lastBonusTime || 0) > oneDay) {
              // Note: This bonus logic might cause a loop if not handled carefully with Firestore rules
              // and server-side timestamps. For client-side simulation, it's fine.
              setJewelsBalance((prev) => prev + 500);
              updatePlayerFirestore({ jewels: (data.jewels || 0) + 500, lastBonusTime: now });
              setShowMessage('🎉 Claimed 500 JEWELS daily bonus!');
            }
          }
          setIsPending(false);
        },
        (err) => {
          console.error('Failed to fetch balance:', err);
          setShowMessage('⚠️ Failed to load balance. Please check your connection.');
          setActiveModal('error');
          setIsPending(false);
        }
      );

      return () => unsubscribeUserData();
    } else if (!authLoading && userId === null) {
      // If authLoading is false and no user (not even anonymous) is logged in,
      // explicitly show the AuthModal. This covers first-time visits.
      setActiveModal('auth');
      setShowMessage('👋 Welcome! Please sign in to continue.');
    }

    return () => {
      unsubscribeAuth();
    };
  }, [userId, authLoading, setShowMessage, setActiveModal, updatePlayerFirestore]); // Added authLoading to dependencies

  useEffect(() => {
    if (showWalletModal) {
      setActiveModal('auth'); // Assuming wallet modal also triggers AuthModal
      setShowMessage('ℹ️ Opening wallet connection...');
    }
  }, [showWalletModal, setActiveModal, setShowMessage]);

  if (authLoading || isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-gray-950 font-inter">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <Sparkles className="w-10 h-10 text-rose-400 animate-pulse mx-auto mb-4" />
          <p>Loading Swytch PETverse...</p>
        </motion.div>
      </div>
    );
  }

  const pageProps: PageProps = {
    userId,
    activeModal: activeModal, // Pass activeModal value from useModal
    setActiveModal,
    setShowMessage,
    setIsPETMember,
    updatePlayerFirestore,
    jewelsBalance,
    goldBalance,
    currentLevel,
    isPending,
    authLoading,
    showWalletModal,
    setShowWalletModal,
    autoPlay,
    setAutoPlay,
    mousePosition: { x: 0, y: 0 }, // Re-added mousePosition for Home component
  };

  const redDogGameProps: RedDogGameProps = {
    userId,
    activeModal: activeModal, // Pass activeModal value from useModal
    setActiveModal,
    setIsPETMember,
    setShowMessage,
    updatePlayerFirestore,
  };

  const gameProps: GameProps = {
    userId,
    setIsPETMember,
    updatePlayerFirestore,
    setShowMessage,
    setActiveModal,
  };

  const topNavProps: TopNavProps = {
    userId,
    jewelsBalance,
    isPETMember,
    setShowMessage,
    setShowWalletModal,
  };

  const bottomNavProps: BottomNavProps = {
    userId,
    jewelsBalance,
    isPETMember,
    setShowMessage, // Pass setShowMessage (setter) directly to BottomNav
    setActiveModal,
  };

  return (
    <div
      className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-gray-950' : 'bg-gray-100'} text-${isDarkMode ? 'white' : 'gray-900'} font-inter bg-noise`}
      role="application"
      aria-label="Swytch PETverse Application"
    >
      <TopNav {...topNavProps} />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}><LandingPage {...pageProps} /></SwytchErrorBoundary>} />
          <Route
            path="/home"
            element={
              <SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}>
                {/* Home component now expects mousePosition prop */}
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
          {/* AuthModal and PaymentModal should typically be rendered as modals, not as routes */}
          <Route path="/auth" element={<SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}><AuthModal setShowMessage={setShowMessage}  /></SwytchErrorBoundary>} /> {/* Pass setActiveModal */}
          {/* Removed PhoneLogin route as it's a hook, not a component to be routed directly */}
          <Route path="/payment" element={<SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}><PaymentModal userId={userId} setShowMessage={setShowMessage} setIsPETMember={setIsPETMember} updatePlayerFirestore={updatePlayerFirestore} /></SwytchErrorBoundary>} /> {/* Pass required props */}
        </Routes>
      </main>
      <BottomNav {...bottomNavProps} />
      <AnimatePresence>
        {currentGlobalMessage && ( // Use currentGlobalMessage value from useModal
          <RewardPopup
            message={currentGlobalMessage}
            type={currentGlobalMessage.startsWith('⚠️') ? 'error' : 'success'}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
