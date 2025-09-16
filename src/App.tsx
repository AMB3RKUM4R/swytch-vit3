// src/App.tsx
import { FC, useState, useEffect, useCallback, useMemo } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { User } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, updateDoc, onSnapshot, Timestamp } from 'firebase/firestore';
import { db, performInitialSignIn, listenForAuthChanges } from '@/lib/firebaseConfig';

// Hooks & Context
import { useModal } from '@/components/context/ModalContext';
import { useAuthUserFirebase } from './hooks/useAuthUserFirebase';
import { useAuthUserWagmi } from './hooks/useAuthUserWagmi';

// Components
import SwytchErrorBoundary from '@/components/ErrorBoundaryComponent';
import AuthModal from '@/components/AuthModal';
import PaymentModal from '@/components/PaymentModal';
import TopNav from '@/components/TopNav';
import BottomNav from '@/components/BottomNav';
import LoadingScreen from '@/components/LoadingScreen';

// Pages
import Home from '@/pages/Home';
import { Vault } from '@/pages/Vault';
import Shop from '@/pages/Shop';
import Community from '@/pages/Community';
import Membership from '@/pages/Membership';
import Inventory from '@/pages/Inventory';
import LandingPage from '@/pages/LandingPage';
import AdminPage from '@/pages/AdminPage';

// Types
import { PlayerData, Transaction } from '@/lib/types';

const createNewPlayerData = (user: User, walletAddress: string | null = null): PlayerData => {
    const now = Timestamp.now();
    return {
        userId: user.uid,
        username: user.displayName || user.email?.split('@')[0] || `Hunter${Math.floor(1000 + Math.random() * 9000)}`,
        email: user.email,
        phoneNumber: user.phoneNumber,
        joules: 0,
        gold: 0,
        level: 1,
        xp: 0,
        energy: 100,
        mana: 100,
        isPETMember: true,
        membership: 'ecosystem',
        walletAddress: walletAddress,
        character: null,
        inventory: null,
        createdAt: now,
        updatedAt: now,
    };
};

const App: FC = () => {
    const navigate = useNavigate();
    const { user: firebaseUser, loading: firebaseLoading } = useAuthUserFirebase();
    const { address: wagmiAddress, isConnected: wagmiIsConnected, isDisconnected: wagmiIsDisconnected } = useAuthUserWagmi();

    const [playerData, setPlayerData] = useState<PlayerData | null>(null);
    const [isPETMember, setIsPETMember] = useState(false);
    
    const { activeModal, setActiveModal, showMessage, setShowMessage } = useModal();
    const [isPending, setIsPending] = useState(false);
    const [initialAuthCheckComplete, setInitialAuthCheckComplete] = useState(false);
    
    const userId = firebaseUser?.uid || wagmiAddress;
    const authLoading = firebaseLoading;

    // A single effect to handle authentication and data fetching
    useEffect(() => {
        if (!userId) {
            setPlayerData(null);
            setIsPETMember(false);
            setInitialAuthCheckComplete(true);
            return;
        }

        setIsPending(true);
        const playerRef = doc(db, 'Players', userId);
        const unsubscribe = onSnapshot(playerRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data() as PlayerData;
                setPlayerData(data);
                setIsPETMember(data.isPETMember || false);
                // Redirect to home page on successful login
                if (window.location.pathname === '/') {
                    navigate('/home');
                }
            } else {
                if (firebaseUser) {
                    const newPlayerData = createNewPlayerData(firebaseUser, wagmiAddress);
                    setDoc(playerRef, newPlayerData);
                } else {
                    // Handle creation for wagmi-only users if needed
                    console.log('User signed in with Wagmi but no Firebase user found.');
                }
            }
            setIsPending(false);
            setInitialAuthCheckComplete(true);
        }, (error) => {
            console.error("Firestore snapshot error:", error);
            setShowMessage("⚠️ Could not load player data.");
            setIsPending(false);
        });

        return () => unsubscribe();
    }, [userId, firebaseUser, wagmiAddress, setShowMessage, navigate]);

    const updatePlayerFirestore = useCallback(async (updates: Partial<PlayerData>) => {
        if (!userId) return;
        await updateDoc(doc(db, 'Players', userId), { ...updates, updatedAt: serverTimestamp() });
    }, [userId]);

    const logTransaction = useCallback(async (txData: Omit<Transaction, 'transactionId' | 'timestamp'>) => {
        if (!userId) return;
        await addDoc(collection(db, 'Transactions'), { ...txData, timestamp: serverTimestamp() });
    }, [userId]);


    const pageProps = useMemo(() => ({
        userId,
        activeModal, setActiveModal,
        setShowMessage, setIsPETMember,
        updatePlayerFirestore, logTransaction,
        jewelsBalance: playerData?.joules ?? 0,
        goldBalance: playerData?.gold ?? 0,
        currentLevel: playerData?.level ?? 0,
        isPending, authLoading,
        initialAuthCheckComplete,
        isPETMember,
        playerData,
    }), [userId, playerData, isPending, authLoading, initialAuthCheckComplete, isPETMember, activeModal, setActiveModal, setShowMessage, updatePlayerFirestore, logTransaction]);

    const topNavProps = useMemo(() => ({
        userId,
        jewelsBalance: playerData?.joules ?? 0,
        isPETMember,
        setShowMessage,
        setActiveAuthModal: () => setActiveModal('auth'),
        setShowPaymentModal: (show: boolean) => setActiveModal(show ? 'payment' : null),
    }), [userId, playerData, isPETMember, setShowMessage, setActiveModal]);
    
    const bottomNavProps = useMemo(() => ({
        userId,
        jewelsBalance: playerData?.joules ?? 0,
        isPETMember,
        setShowMessage,
        globalMessage: showMessage,
    }), [userId, playerData, isPETMember, setShowMessage, showMessage]);


    if (authLoading && !initialAuthCheckComplete) {
        return <LoadingScreen message="Initializing PETverse Core..." />;
    }

    return (
        <div className={`min-h-screen flex flex-col font-inter bg-noise`}>
            <div className="relative z-10 flex flex-col min-h-screen overflow-y-auto">
                <TopNav {...topNavProps} />
                <main className="flex-grow pt-16 pb-16">
                    <Routes>
                        <Route path="/" element={<SwytchErrorBoundary {...pageProps}><LandingPage {...pageProps} /></SwytchErrorBoundary>} />
                        {userId ? (
                            <>
                                <Route path="/home" element={<SwytchErrorBoundary {...pageProps}><Home {...pageProps} /></SwytchErrorBoundary>} />
                                <Route path="/vault" element={<SwytchErrorBoundary {...pageProps}><Vault {...pageProps} /></SwytchErrorBoundary>} />
                                <Route path="/shop" element={<SwytchErrorBoundary {...pageProps}><Shop {...pageProps} /></SwytchErrorBoundary>} />
                                <Route path="/community" element={<SwytchErrorBoundary {...pageProps}><Community {...pageProps} /></SwytchErrorBoundary>} />
                                <Route path="/membership" element={<SwytchErrorBoundary {...pageProps}><Membership {...pageProps} /></SwytchErrorBoundary>} />
                                <Route path="/inventory" element={<SwytchErrorBoundary {...pageProps}><Inventory {...pageProps} /></SwytchErrorBoundary>} />
                                <Route path="/admin" element={<SwytchErrorBoundary {...pageProps}><AdminPage {...pageProps} /></SwytchErrorBoundary>} />
                            </>
                        ) : (
                            <Route path="*" element={<SwytchErrorBoundary {...pageProps}><LandingPage {...pageProps} /></SwytchErrorBoundary>} />
                        )}
                    </Routes>
                </main>
                <BottomNav {...bottomNavProps} />
            </div>

            <AnimatePresence>
                {activeModal === 'auth' && <AuthModal setShowMessage={setShowMessage} />}
                {activeModal === 'payment' && <PaymentModal {...pageProps} />}
            </AnimatePresence>
        </div>
    );
};

export default App;