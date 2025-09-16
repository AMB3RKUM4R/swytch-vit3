// src/App.tsx
import { FC, useState, useEffect, useCallback, useMemo } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { User } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, updateDoc, collection, addDoc, onSnapshot, Timestamp } from 'firebase/firestore';
import { db, performInitialSignIn, listenForAuthChanges } from '@/lib/firebaseConfig';

// Hooks & Context
import { useModal } from '@/components/context/ModalContext';

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

// The new player creation function now matches your Firestore rules
const createNewPlayerData = (user: { uid: string; email: string | null; phoneNumber: string | null; }): PlayerData => {
    const now = Timestamp.now();
    return {
        userId: user.uid,
        username: `Hunter${Math.floor(1000 + Math.random() * 9000)}`,
        email: user.email,
        phoneNumber: user.phoneNumber,
        joules: 0, // Enforcing rules: must be 0 on creation
        gold: 0, // Enforcing rules: must be 0 on creation
        level: 1, // Enforcing rules: must be 1 on creation
        xp: 0, // Enforcing rules: must be 0 on creation
        energy: 100, // Enforcing rules: must be 100 on creation
        mana: 100, // Enforcing rules: must be 100 on creation
        isPETMember: true, // Enforcing rules: must be true on creation
        membership: 'ecosystem', // Enforcing rules: must be 'ecosystem' on creation
        walletAddress: null,
        character: null,
        inventory: null,
        createdAt: now,
        updatedAt: now,
    };
};


const App: FC = () => {
    // Core State
    const [user, setUser] = useState<User | null>(null);
    const [playerData, setPlayerData] = useState<PlayerData | null>(null);
    const [isPETMember, setIsPETMember] = useState(false);
    
    // UI & Loading State
    const { activeModal, setActiveModal, showMessage, setShowMessage } = useModal();
    const [authLoading, setAuthLoading] = useState(true);
    const [isPending, setIsPending] = useState(false);
    const [initialAuthCheckComplete, setInitialAuthCheckComplete] = useState(false);
    
    
    // --- Authentication & Data Fetching ---
    useEffect(() => {
        performInitialSignIn().then(() => {
            const unsubscribe = listenForAuthChanges((firebaseUser) => {
                setUser(firebaseUser);
                if (!firebaseUser) {
                    setAuthLoading(false);
                    setInitialAuthCheckComplete(true);
                }
            });
            return () => unsubscribe();
        });
    }, []);

    useEffect(() => {
        if (!user) {
            setPlayerData(null);
            setIsPETMember(false);
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
                const newPlayerData = createNewPlayerData(user);
                setDoc(playerRef, newPlayerData);
            }
            setIsPending(false);
            setAuthLoading(false);
            setInitialAuthCheckComplete(true);
        }, (error) => {
            console.error("Firestore snapshot error:", error);
            setShowMessage("⚠️ Could not load player data.");
            setIsPending(false);
            setAuthLoading(false);
        });

        return () => unsubscribe();
    }, [user, setShowMessage]);


    // --- Firestore Callbacks ---
    const updatePlayerFirestore = useCallback(async (updates: Partial<PlayerData>) => {
        if (!user) return;
        await updateDoc(doc(db, 'Players', user.uid), { ...updates, updatedAt: serverTimestamp() });
    }, [user]);

    const logTransaction = useCallback(async (txData: Omit<Transaction, 'transactionId' | 'timestamp'>) => {
        if (!user) return;
        await addDoc(collection(db, 'Transactions'), { ...txData, timestamp: serverTimestamp() });
    }, [user]);


    // --- Memoized Props for Child Components ---
    const pageProps = useMemo(() => ({
        userId: user?.uid || null,
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
    }), [user, playerData, isPending, authLoading, initialAuthCheckComplete, isPETMember, activeModal, setActiveModal, setShowMessage, updatePlayerFirestore, logTransaction]);

    const topNavProps = useMemo(() => ({
        userId: user?.uid || null,
        jewelsBalance: playerData?.joules ?? 0,
        isPETMember,
        setShowMessage,
        setActiveAuthModal: () => setActiveModal('auth'),
        setShowPaymentModal: (show: boolean) => setActiveModal(show ? 'payment' : null),
    }), [user, playerData, isPETMember, setShowMessage, setActiveModal]);
    
    const bottomNavProps = useMemo(() => ({
        userId: user?.uid || null,
        jewelsBalance: playerData?.joules ?? 0,
        isPETMember,
        setShowMessage,
        globalMessage: showMessage,
    }), [user, playerData, isPETMember, setShowMessage, showMessage]);


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
                        <Route path="/home" element={<SwytchErrorBoundary {...pageProps}><Home {...pageProps} /></SwytchErrorBoundary>} />
                        <Route path="/vault" element={<SwytchErrorBoundary {...pageProps}><Vault {...pageProps} /></SwytchErrorBoundary>} />
                        <Route path="/shop" element={<SwytchErrorBoundary {...pageProps}><Shop {...pageProps} /></SwytchErrorBoundary>} />
                        <Route path="/community" element={<SwytchErrorBoundary {...pageProps}><Community {...pageProps} /></SwytchErrorBoundary>} />
                        <Route path="/membership" element={<SwytchErrorBoundary {...pageProps}><Membership {...pageProps} /></SwytchErrorBoundary>} />
                        <Route path="/inventory" element={<SwytchErrorBoundary {...pageProps}><Inventory {...pageProps} /></SwytchErrorBoundary>} />
                        <Route path="/admin" element={<SwytchErrorBoundary {...pageProps}><AdminPage {...pageProps} /></SwytchErrorBoundary>} />
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