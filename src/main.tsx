// src/main.tsx
import React, { useEffect, useState, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { ModalProvider, useModal } from './components/context/ModalContext';
import { ThemeProvider, useTheme } from './components/context/ThemeContext';
import { initializeFirebaseAuthAndListen } from './lib/firebaseConfig';
import SwytchErrorBoundary from './components/ErrorBoundaryComponent';
import App from './App';
import TopNav from './components/TopNav';
import BottomNav from './components/BottomNav';
import MessageDisplay from './components/MessageDisplay'; // Import MessageDisplay
import { useAuthUser } from './hooks/useAuthUser';
import { db } from './lib/firebaseConfig';
import { doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';

import '@rainbow-me/rainbowkit/styles.css';
import './index.css';

import { wagmiConfig } from './lib/wagmi';
import { TopNavProps, BottomNavProps, AppProps as MainAppProps, PlayerData } from './lib/types';


initializeFirebaseAuthAndListen();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60, // Cache data for 1 minute
      gcTime: 1000 * 60 * 5, // Garbage collect after 5 minutes
    },
  },
});

// Define Root component before it's used in ReactDOM.createRoot
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

const AppContent: React.FC = () => {
  const { activeModal, setActiveModal, showMessage, setShowMessage } = useModal();
  const { isDarkMode } = useTheme();
  const { loading: authLoading, user: authUser } = useAuthUser();

  const [userId, setUserId] = useState<string | null>(null);
  const [jewelsBalance, setJewelsBalance] = useState<number>(0);
  const [goldBalance, setGoldBalance] = useState<number>(0);
  const [isPETMember, setIsPETMember] = useState<boolean>(false);
  const [isPending, setIsPending] = useState<boolean>(true);
  const [currentLevel, setCurrentLevel] = useState<number>(0);
  const [initialAuthCheckComplete, setInitialAuthCheckComplete] = useState<boolean>(false);

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  useEffect(() => {
    setUserId(authUser ? authUser.uid : null);
    if (!initialAuthCheckComplete) {
      setInitialAuthCheckComplete(true);
    }
  }, [authUser, initialAuthCheckComplete]);


  const updatePlayerFirestore = useCallback(async (updates: Partial<PlayerData>) => {
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
    let unsubscribeUserData: () => void;

    if (userId && initialAuthCheckComplete) {
      setIsPending(true);
      const userRef = doc(db, 'Players', userId);
      unsubscribeUserData = onSnapshot(
        userRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data() as PlayerData;
            setJewelsBalance(data.jewels || 0);
            setGoldBalance(data.gold || 0);
            setIsPETMember(data.isPETMember || false);
            setCurrentLevel(data.level || 0);

            const now = Date.now();
            const oneDay = 24 * 60 * 60 * 1000;
            // --- IMPORTANT: Daily bonus logic now requires backend Cloud Function ---
            // The client-side app should not directly update 'jewels' or 'lastBonusTime'
            // due to strict Firestore rules. A Cloud Function triggered on a schedule
            // or by a user's action (verified by backend) should handle this.
            //
            // if (data.lastBonusTime === null || (data.lastBonusTime && now - (data.lastBonusTime.toDate().getTime() || 0) > oneDay)) {
            //   // This update will likely fail with current strict rules if done client-side.
            //   // Consider triggering a Cloud Function here to grant daily bonus.
            //   // updatePlayerFirestore({ jewels: (data.jewels || 0) + 500, lastBonusTime: serverTimestamp() });
            //   setShowMessage('🎉 Daily bonus available! Claim via a specific action or it will be auto-granted by backend.');
            // }
            // --- END IMPORTANT ---

          } else {
            if (authUser && !docSnap.exists()) {
              const newPlayerData: PlayerData = {
                userId: authUser.uid,
                username: authUser.displayName || authUser.email?.split('@')[0] || 'User',
                email: authUser.email || null,
                phoneNumber: authUser.phoneNumber || null,
                jewels: 0,
                gold: 0,
                level: 0,
                isPETMember: false,
                membership: 'none',
                walletAddress: null,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                character: null,
                chest: null,
                energy: 100,
                mana: 100,
                xp: 0,
                key: null,
                inventory: { equipped: { armor: '', weapon: '' }, items: {} },
                lastBonusTime: null,
              };
              setDoc(doc(db, 'Players', authUser.uid), newPlayerData)
                .then(() => setShowMessage('Welcome new player!'))
                .catch(error => console.error("Error creating new player doc:", error));
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
    } else if (initialAuthCheckComplete && !userId && !authLoading) {
      setActiveModal('auth');
      setShowMessage('👋 Welcome! Please sign in to continue.');
      setIsPending(false);
    } else if (!initialAuthCheckComplete) {
      setIsPending(true);
    } else {
      setJewelsBalance(0);
      setGoldBalance(0);
      setIsPETMember(false);
      setIsPending(false);
    }

    return () => {
      if (unsubscribeUserData) {
        unsubscribeUserData();
      }
    };
  }, [userId, authLoading, setShowMessage, setActiveModal, updatePlayerFirestore, initialAuthCheckComplete, authUser]);


  const topNavProps: TopNavProps = {
    userId,
    jewelsBalance,
    isPETMember,
    setShowMessage,
    setActiveAuthModal: setActiveModal,
    setShowPaymentModal: (show: boolean) => setActiveModal(show ? 'payment' : null),
  };

  const bottomNavProps: BottomNavProps = {
    userId,
    jewelsBalance,
    isPETMember,
    setShowMessage,
  };

  const appProps: MainAppProps = {
    userId,
    activeModal,
    setActiveModal,
    setShowMessage,
    setIsPETMember,
    updatePlayerFirestore,
    jewelsBalance,
    goldBalance,
    currentLevel,
    isPending,
    authLoading,
    mousePosition,
    initialAuthCheckComplete,
  };

  return (
    <SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}>
      <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-gray-950' : 'bg-gray-100'} text-${isDarkMode ? 'white' : 'gray-900'} font-inter bg-noise`}>
        <TopNav {...topNavProps} />
        <main className="flex-grow">
          <App {...appProps} />
        </main>
        <BottomNav {...bottomNavProps} />

        {/* Global message display */}
        <MessageDisplay message={showMessage} />
      </div>
    </SwytchErrorBoundary>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(<Root />);
