// src/App.tsx
import { FC, useState, useEffect, useCallback, useMemo } from 'react';
import { Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, updateDoc, collection, addDoc, onSnapshot } from 'firebase/firestore';

// Import Firebase config and functions
import { db, performInitialSignIn, listenForAuthChanges } from './lib/firebaseConfig';

// Import Contexts
import { useModal } from './components/context/ModalContext';
import { useTheme } from './components/context/ThemeContext';

// Import Components
import SwytchErrorBoundary from './components/ErrorBoundaryComponent';
import AuthModal from './components/AuthModal';
import PaymentModal from './components/PaymentModal';
import TopNav from './components/TopNav';
import BottomNav from './components/BottomNav';
import LoadingScreen from './components/LoadingScreen';
import StarfieldBackground from './components/StarfieldBackground';

// Import Pages
import Home from './pages/Home';
import { Vault } from './pages/Vault';
import Market from './pages/Market';
import Shop from './pages/Shop';
import Community from './pages/Community';
import Membership from './pages/Membership';
import GamesPage from './pages/GamesPage';
import Inventory from './pages/Inventory';
import Marketplace from './pages/Marketplace';
import DSPETDisclosure from './pages/DSPETDisclosure';
import LandingPage from './pages/LandingPage';
import AdminPage from './pages/AdminPage';
import Benefits from './pages/Benefits';

// Import Types
import { PlayerData, Transaction } from './lib/types';
import { useCharacter } from './hooks/useCharacter';

const App: FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [playerData, setPlayerData] = useState<PlayerData | null>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [isPending, setIsPending] = useState(false);
    const [initialAuthCheckComplete, setInitialAuthCheckComplete] = useState(false);
    const [isPETMember, setIsPETMember] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    const { characterModel, updateCharacter } = useCharacter();
    const { activeModal, setActiveModal, showMessage, setShowMessage } = useModal();
    useTheme();

    useEffect(() => {
        performInitialSignIn().then(() => {
            const unsubscribe = listenForAuthChanges((firebaseUser) => {
                setUser(firebaseUser);
                setAuthLoading(false);
                setInitialAuthCheckComplete(true);
            });
            return () => unsubscribe();
        });
    }, []);

    useEffect(() => {
        if (!user) {
            setPlayerData(null);
            return;
        }
        setIsPending(true);
        const playerRef = doc(db, 'Players', user.uid);
        const unsubscribe = onSnapshot(playerRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data() as PlayerData;
                setPlayerData(data);
                setIsPETMember(data.isPETMember || false);
            } else {
                 const newPlayerData: PlayerData = {
                    userId: user.uid,
                    username: user.displayName || `Player${user.uid.substring(0, 5)}`,
                    email: user.email,
                    jewels: 0,
                    gold: 0,
                    level: 1,
                    isPETMember: false,
                    membership: 'none',
                    walletAddress: null,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                    character: null, chest: null, energy: 100, mana: 100, xp: 0, key: null, inventory: null, lastBonusTime: null, quests: [],
                    phoneNumber: user.phoneNumber || null,
                };
                setDoc(playerRef, newPlayerData);
            }
            setIsPending(false);
        }, (error) => {
            console.error("Firestore snapshot error:", error);
            setIsPending(false);
        });
        return () => unsubscribe();
    }, [user]);

    useEffect(() => {
        const handleMouseMove = (event: MouseEvent) => setMousePosition({ x: event.clientX, y: event.clientY });
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const updatePlayerFirestore = useCallback(async (updates: Partial<PlayerData>) => {
        if (!user) return;
        await updateDoc(doc(db, 'Players', user.uid), { ...updates, updatedAt: serverTimestamp() });
    }, [user]);

    const logTransaction = useCallback(async (txData: Omit<Transaction, 'transactionId' | 'timestamp'>) => {
        if (!user) return;
        await addDoc(collection(db, 'Transactions'), { ...txData, timestamp: serverTimestamp() });
    }, [user]);

    const pageProps = useMemo(() => ({
        userId: user?.uid || null,
        activeModal, setActiveModal,
        setShowMessage, setIsPETMember,
        updatePlayerFirestore, logTransaction,
        jewelsBalance: playerData?.jewels ?? 0,
        goldBalance: playerData?.gold ?? 0,
        currentLevel: playerData?.level ?? 0,
        isPending, authLoading,
        mousePosition, initialAuthCheckComplete,
        isPETMember,
        characterModel,
        updateCharacter,
    }), [user, playerData, isPending, authLoading, mousePosition, initialAuthCheckComplete, isPETMember, activeModal, setActiveModal, setShowMessage, setIsPETMember, updatePlayerFirestore, logTransaction, characterModel, updateCharacter]);

    const topNavProps = useMemo(() => ({
        userId: user?.uid || null,
        jewelsBalance: playerData?.jewels ?? 0,
        isPETMember,
        setShowMessage,
        setActiveAuthModal: () => setActiveModal('auth'),
        setShowPaymentModal: (show: boolean) => setActiveModal(show ? 'payment' : null),
    }), [user, playerData, isPETMember, setShowMessage, setActiveModal]);

    const bottomNavProps = useMemo(() => ({
        userId: user?.uid || null,
        jewelsBalance: playerData?.jewels ?? 0,
        isPETMember,
        setShowMessage,
        globalMessage: showMessage,
    }), [user, playerData, isPETMember, setShowMessage, showMessage]);

    if (authLoading || isPending) {
        return <LoadingScreen message="Initializing PETverse Core..." />;
    }

    return (
        <div className={`min-h-screen flex flex-col font-inter bg-noise`}>
            {/* The fixed background component */}
            <StarfieldBackground />

            {/* The scrollable content container */}
            <div className="relative z-10 flex flex-col min-h-screen overflow-y-auto">
              <TopNav {...topNavProps} />
              <main className="flex-grow">
                  <Routes>
                      <Route path="/" element={<SwytchErrorBoundary {...pageProps}><LandingPage {...pageProps} /></SwytchErrorBoundary>} />
                      <Route path="/home" element={<SwytchErrorBoundary {...pageProps}><Home {...pageProps} /></SwytchErrorBoundary>} />
                      <Route path="/vault" element={<SwytchErrorBoundary {...pageProps}><Vault {...pageProps} /></SwytchErrorBoundary>} />
                      <Route path="/benefits" element={<SwytchErrorBoundary {...pageProps}><Benefits {...pageProps} /></SwytchErrorBoundary>} />
                      <Route path="/market" element={<SwytchErrorBoundary {...pageProps}><Market {...pageProps} /></SwytchErrorBoundary>} />
                      <Route path="/shop" element={<SwytchErrorBoundary {...pageProps}><Shop {...pageProps} /></SwytchErrorBoundary>} />
                      <Route path="/community" element={<SwytchErrorBoundary {...pageProps}><Community {...pageProps} /></SwytchErrorBoundary>} />
                      <Route path="/membership" element={<SwytchErrorBoundary {...pageProps}><Membership {...pageProps} /></SwytchErrorBoundary>} />
                      <Route path="/games" element={<SwytchErrorBoundary {...pageProps}><GamesPage {...pageProps} /></SwytchErrorBoundary>} />
                      <Route path="/dspet-disclosure" element={<SwytchErrorBoundary {...pageProps}><DSPETDisclosure {...pageProps} /></SwytchErrorBoundary>} />
                      <Route path="/inventory" element={<SwytchErrorBoundary {...pageProps}><Inventory {...pageProps} /></SwytchErrorBoundary>} />
                      <Route path="/marketplace" element={<SwytchErrorBoundary {...pageProps}><Marketplace {...pageProps} /></SwytchErrorBoundary>} />
                      <Route path="/admin" element={<SwytchErrorBoundary {...pageProps}><AdminPage {...pageProps} /></SwytchErrorBoundary>} />
                  </Routes>
              </main>
              <BottomNav {...bottomNavProps} />
            </div>

            <AnimatePresence>
                {activeModal === 'auth' && <AuthModal setShowMessage={setShowMessage} />}
                {activeModal === 'payment' && <PaymentModal {...pageProps} />}
                 {activeModal === 'error' && (
                    <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <motion.div className="relative modal bg-red-900/80 text-white p-6 rounded-lg max-w-sm w-full mx-4 border border-red-500" initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 50 }}>
                            <h2 className="text-2xl font-bold font-poppins mb-4">Error!</h2>
                            <p className="font-inter">An unexpected error occurred. Please try again.</p>
                            <button onClick={() => setActiveModal(null)} className="mt-4 btn-primary">Close</button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default App;