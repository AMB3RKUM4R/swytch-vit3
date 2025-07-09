import React, {  } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { ModalProvider, useModal } from './context/ModalContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { initializeFirebaseAuthAndListen } from './lib/firebaseConfig';
import SwytchErrorBoundary from './components/ErrorBoundaryComponent';
import App from './App';
import TopNav from './components/TopNav';
import BottomNav from './components/BottomNav';
import { useAuthUser } from './hooks/useAuthUser';
import { auth, db } from './lib/firebaseConfig';
import { doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
// Removed AnimatePresence and motion imports
import '@rainbow-me/rainbowkit/styles.css';
import './index.css';

import { wagmiConfig } from './lib/wagmi';

initializeFirebaseAuthAndListen();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60,
      gcTime: 1000 * 60 * 5,
    },
  },
});

const AppContent: React.FC = () => {
  const { activeModal, setActiveModal, showMessage, setShowMessage } = useModal();
  const { isDarkMode } = useTheme();
  const { loading: authLoading } = useAuthUser();

  const [userId, setUserId] = React.useState<string | null>(null);
  const [jewelsBalance, setJewelsBalance] = React.useState<number>(0);
  const [goldBalance, setGoldBalance] = React.useState<number>(0);
  const [isPETMember, setIsPETMember] = React.useState<boolean>(false);
  const [isPending, setIsPending] = React.useState<boolean>(false);
  const [showWalletModal, setShowWalletModal] = React.useState<boolean>(false);
  // NEW STATE: To track if initial auth check and potential auth modal display is done
  const [initialAuthCheckComplete, setInitialAuthCheckComplete] = React.useState<boolean>(false);


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

  React.useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(
      (authUser) => {
        setUserId(authUser ? authUser.uid : null);
        setIsPending(false);
        // Mark initial auth check as complete once we have a user or confirm no user
        if (!initialAuthCheckComplete) {
          setInitialAuthCheckComplete(true);
        }
      },
      (error) => {
        console.error('Auth state change error:', error);
        setShowMessage('⚠️ Failed to initialize authentication. Please try again.');
        setActiveModal('error');
        setIsPending(false);
        if (!initialAuthCheckComplete) {
          setInitialAuthCheckComplete(true); // Still mark complete even on error
        }
      }
    );

    // Only proceed with user data fetching and daily bonus logic IF authenticated
    if (userId) {
      setIsPending(true);
      const userRef = doc(db, 'Players', userId);
      const unsubscribeUserData = onSnapshot(
        userRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setJewelsBalance(data.jewels || 0);
            setGoldBalance(data.gold || 0);
            setIsPETMember(data.isPETMember || false);

            // Only show daily bonus if initial auth check is complete and auth modal is not active
            const now = Date.now();
            const oneDay = 24 * 60 * 60 * 1000;
            if (initialAuthCheckComplete && activeModal !== 'auth' && now - (data.lastBonusTime || 0) > oneDay) {
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
    }
    // This block runs if there's no userId and the initial auth check is complete.
    // This ensures the auth modal is shown only after the initial loading and when needed.
    else if (!authLoading && userId === null && initialAuthCheckComplete) {
      setActiveModal('auth');
      setShowMessage('👋 Welcome! Please sign in to continue.');
    }

    return () => {
      unsubscribeAuth();
    };
  }, [userId, authLoading, setShowMessage, setActiveModal, updatePlayerFirestore, initialAuthCheckComplete, activeModal]); // Added activeModal to dependency array


  const navProps = {
    userId,
    jewelsBalance,
    isPETMember,
    setShowMessage,
    setShowWalletModal,
  };

  const appProps = {
    userId,
    activeModal,
    setActiveModal,
    setShowMessage,
    setIsPETMember,
    updatePlayerFirestore,
    jewelsBalance,
    goldBalance,
    currentLevel: 0,
    isPending,
    authLoading,
    showWalletModal,
    setShowWalletModal,
    mousePosition: { x: 0, y: 0 },
  };

  return (
    <SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}>
      <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-gray-950' : 'bg-gray-100'} text-${isDarkMode ? 'white' : 'gray-900'} font-inter bg-noise`}>
        <TopNav {...navProps} />
        <main className="flex-grow">
          <App {...appProps} />
        </main>
        <BottomNav {...navProps} />
        {showMessage && activeModal !== 'auth'}
      </div>
    </SwytchErrorBoundary>
  );
};

const Root: React.FC = () => {
  return (
    <React.StrictMode>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <WagmiProvider config={wagmiConfig}>
            <RainbowKitProvider>
              <ThemeProvider>
                <ModalProvider>
                  <AppContent />
                </ModalProvider>
              </ThemeProvider>
            </RainbowKitProvider>
          </WagmiProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(<Root />);