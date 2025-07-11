// main.tsx (Updated: Fixed typo in setQuests(fetchedMessages) to setQuests(fetchedQuests). Added optional doc creation for new users. Memoized updatePlayerFirestore with useCallback. No other logic changes.)

import React, { useEffect, useState, useCallback } from 'react';
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

import '@rainbow-me/rainbowkit/styles.css';
import './index.css';

import { wagmiConfig } from './lib/wagmi';
// Import TopNavProps and BottomNavProps from types.ts
import { TopNavProps, BottomNavProps, AppProps as MainAppProps } from './lib/types';


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

  const [userId, setUserId] = useState<string | null>(null);
  const [jewelsBalance, setJewelsBalance] = useState<number>(0);
  const [goldBalance, setGoldBalance] = useState<number>(0);
  const [isPETMember, setIsPETMember] = useState<boolean>(false);
  const [isPending, setIsPending] = useState<boolean>(true);
  const [initialAuthCheckComplete, setInitialAuthCheckComplete] = useState<boolean>(false);


  const updatePlayerFirestore = useCallback(async (updates: Partial<any>) => {
    if (!userId) {
      setShowMessage('⚠️ Please sign in to update data.');
      setActiveModal('auth');
      return;
    }
    try {
      const playerData = {
        ...updates,
        updatedAt: serverTimestamp(),
      };
      await setDoc(doc(db, 'Players', userId), playerData, { merge: true });
    } catch (err) {
      console.error('Firestore update error:', err);
      setShowMessage('⚠️ Failed to update player data. Please check your connection.');
      setActiveModal('error');
    }
  }, [userId, setShowMessage, setActiveModal]);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(
      (authUser) => {
        setUserId(authUser ? authUser.uid : null);
        if (!initialAuthCheckComplete) {
          setInitialAuthCheckComplete(true);
        }
      },
      (error) => {
        console.error('Auth state change error:', error);
        setShowMessage('⚠️ Failed to initialize authentication. Please try again.');
        setActiveModal('error');
        if (!initialAuthCheckComplete) {
          setInitialAuthCheckComplete(true);
        }
      }
    );

    let unsubscribeUserData: () => void;
    if (userId) {
      setIsPending(true);
      const userRef = doc(db, 'Players', userId);
      unsubscribeUserData = onSnapshot(
        userRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setJewelsBalance(data.jewels || 0);
            setGoldBalance(data.gold || 0);
            setIsPETMember(data.isPETMember || false);

            const now = Date.now();
            const oneDay = 24 * 60 * 60 * 1000;
            if (initialAuthCheckComplete && activeModal !== 'auth' && now - (data.lastBonusTime || 0) > oneDay) {
              updatePlayerFirestore({ jewels: (data.jewels || 0) + 500, lastBonusTime: now });
              setShowMessage('🎉 Claimed 500 JEWELS daily bonus!');
            }
          } else {
            // Create user doc if it doesn't exist
            if (auth.currentUser && !docSnap.exists()) {
              setDoc(userRef, {
                userId: auth.currentUser.uid,
                username: auth.currentUser.displayName || auth.currentUser.email || 'User',
                email: auth.currentUser.email || '',
                jewels: 0,
                gold: 0,
                level: 0,
                isPETMember: false,
                membership: 'none',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              }).then(() => setShowMessage('Welcome new player!'));
            }
          }
          setIsPending(false);
        },
        (err) => {
          console.error('Failed to fetch user data:', err);
          setShowMessage('⚠️ Failed to load user data. Please check your connection.');
          setActiveModal('error');
          setIsPending(false);
        }
      );
    } else {
      setJewelsBalance(0);
      setGoldBalance(0);
      setIsPETMember(false);
      setIsPending(false);
    }

    if (!authLoading && userId === null && initialAuthCheckComplete) {
      setActiveModal('auth');
      setShowMessage('👋 Welcome! Please sign in to continue.');
    }

    return () => {
      unsubscribeAuth();
      if (unsubscribeUserData) {
        unsubscribeUserData();
      }
    };
  }, [userId, authLoading, setShowMessage, setActiveModal, updatePlayerFirestore, initialAuthCheckComplete, activeModal]);


  // Props for TopNav
  const topNavProps: TopNavProps = { // Explicitly type navProps
    userId,
    jewelsBalance,
    isPETMember,
    setShowMessage,
    setActiveAuthModal: setActiveModal,
    setShowPaymentModal: (show: boolean) => setActiveModal(show ? 'payment' : null), // FIX 1: Corrected usage
  };

  // Props for BottomNav
  const bottomNavProps: BottomNavProps = { // Explicitly type bottomNavProps
    userId,
    jewelsBalance,
    isPETMember,
    setShowMessage,
  };

  // Props for App component
  const appProps: MainAppProps = { // Explicitly type appProps
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
    mousePosition: { x: 0, y: 0 },
  };

  return (
    <SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}>
      <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-gray-950' : 'bg-gray-100'} text-${isDarkMode ? 'white' : 'gray-900'} font-inter bg-noise`}>
        <TopNav {...topNavProps} />
        <main className="flex-grow">
          <App {...appProps} />
        </main>
        <BottomNav {...bottomNavProps} />

        {/* Global message display (no animation) */}
        {showMessage && (
          <div className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-[100] p-3 rounded-lg shadow-lg text-sm font-inter text-center
                           ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} border border-primary`}>
            {showMessage}
          </div>
        )}
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