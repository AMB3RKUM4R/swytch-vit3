// src/App.tsx - FINAL, COMPLETE AND CORRECTED VERSION
import { FC, useState, useEffect, useCallback, useMemo } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { User } from "firebase/auth";
import { doc, setDoc, onSnapshot, Timestamp, serverTimestamp, updateDoc, collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import { useAuthUserFirebase } from "./hooks/useAuthUserFirebase";
import { useAuthUserWagmi } from "./hooks/useAuthUserWagmi";
import { useModal } from "@/components/context/ModalContext";
import { useComponentProps } from "./hooks/useComponentProps";
import SwytchErrorBoundary from "@/components/ErrorBoundaryComponent";
import AuthModal from "@/components/AuthModal";
import PaymentModal from "@/components/PaymentModal";
import TopNav from "@/components/TopNav";
import BottomNav from "@/components/BottomNav";
import LoadingScreen from "@/components/LoadingScreen";
import Home from "@/pages/Home";
import { Vault } from "@/pages/Vault";
import Shop from "@/pages/Shop";
import Community from "@/pages/Community";
import Membership from "@/pages/Membership";
import Inventory from "@/pages/Inventory";
import LandingPage from "@/pages/LandingPage";
import AdminPage from "@/pages/AdminPage";
import { PlayerData, Transaction, PageProps, SwytchErrorBoundaryProps } from "@/lib/types";

const createNewPlayerData = (user: User): PlayerData => {
  const now = Timestamp.now();
  return {
    userId: user.uid,
    username: user.displayName || user.email?.split("@")[0] || `Hunter${Math.floor(1000 + Math.random() * 9000)}`,
    email: user.email,
    phoneNumber: user.phoneNumber,
    joules: 0, gold: 0, level: 1, xp: 0, energy: 100, mana: 100,
    isPETMember: true, membership: "ecosystem",
    walletAddress: null,
    character: null, inventory: null,
    createdAt: now, updatedAt: now,
  };
};

const App: FC = () => {
  const navigate = useNavigate();
  const { address: wagmiAddress, disconnect: wagmiDisconnect } = useAuthUserWagmi();
  const { user: firebaseUser, loading: firebaseLoading } = useAuthUserFirebase({ disconnectWagmi: wagmiDisconnect });
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const { activeModal, setActiveModal, showMessage, setShowMessage } = useModal();
  const [isPending, setIsPending] = useState(false);
  const [initialAuthCheckComplete, setInitialAuthCheckComplete] = useState(false);
  const userId = firebaseUser?.uid || null;
  const authLoading = firebaseLoading;

  const updatePlayerFirestore = useCallback(async (updates: Partial<PlayerData>) => {
    if (!userId) return;
    await updateDoc(doc(db, "Players", userId), { ...updates, updatedAt: serverTimestamp() });
  }, [userId]);

  useEffect(() => {
    if (firebaseUser && wagmiAddress && playerData && playerData.walletAddress !== wagmiAddress.toLowerCase()) {
      updatePlayerFirestore({ walletAddress: wagmiAddress.toLowerCase() });
      setShowMessage("✅ Wallet successfully linked to your account!");
    }
  }, [firebaseUser, wagmiAddress, playerData, updatePlayerFirestore, setShowMessage]);

  useEffect(() => {
    if (!userId) {
      if (!authLoading) { setPlayerData(null); setInitialAuthCheckComplete(true); }
      return;
    }
    setIsPending(true);
    const playerRef = doc(db, "Players", userId);
    const unsubscribe = onSnapshot(playerRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as PlayerData;
        setPlayerData(data);
        if (window.location.pathname === "/") navigate("/home");
      } else {
        if (firebaseUser) {
          const newPlayerData = createNewPlayerData(firebaseUser);
          setDoc(playerRef, newPlayerData);
        }
      }
      setIsPending(false); setInitialAuthCheckComplete(true);
    });
    return () => unsubscribe();
  }, [userId, firebaseUser, navigate]);

  useEffect(() => {
    if (firebaseUser && activeModal === "auth") setActiveModal(null);
  }, [firebaseUser, activeModal, setActiveModal]);

  const logTransaction = useCallback(async (txData: Omit<Transaction, "transactionId" | "timestamp">) => {
    if (!userId) return;
    await addDoc(collection(db, "Transactions"), { ...txData, timestamp: serverTimestamp() });
  }, [userId]);

  const { topNavProps, bottomNavProps } = useComponentProps({
    userId, playerData, authLoading, setActiveModal, showMessage, setShowMessage,
  });

  const pageProps: PageProps = useMemo(() => ({
    userId, activeModal, setActiveModal, setShowMessage,
    updatePlayerFirestore, logTransaction,
    jewelsBalance: playerData?.joules ?? 0,
    goldBalance: playerData?.gold ?? 0,
    currentLevel: playerData?.level ?? 0,
    isPending, authLoading, initialAuthCheckComplete, isPETMember: playerData?.isPETMember ?? false, playerData,
    // The setIsPETMember function is part of the PageProps type but is only used on specific pages,
    // so we provide a placeholder here. A better long-term solution would be a global state context.
    setIsPETMember: () => {}, 
  }), [userId, playerData, isPending, authLoading, initialAuthCheckComplete, activeModal, setActiveModal, setShowMessage, updatePlayerFirestore, logTransaction]);

  const errorBoundaryProps: Omit<SwytchErrorBoundaryProps, "children"> = { setShowMessage, setActiveModal };

  if (authLoading && !initialAuthCheckComplete) {
    return <LoadingScreen message="Initializing PETverse Core..." />;
  }

  return (
    <div className="min-h-screen flex flex-col font-inter bg-noise">
      <div className="relative z-10 flex flex-col min-h-screen overflow-y-auto">
        <TopNav {...topNavProps} />
        <main className="flex-grow pt-16 pb-16">
          <Routes>
            <Route path="/" element={<SwytchErrorBoundary {...errorBoundaryProps}><LandingPage {...pageProps} /></SwytchErrorBoundary>} />
            <Route path="/home" element={<SwytchErrorBoundary {...errorBoundaryProps}><Home {...pageProps} /></SwytchErrorBoundary>} />
            <Route path="/vault" element={<SwytchErrorBoundary {...errorBoundaryProps}><Vault {...pageProps} /></SwytchErrorBoundary>} />
            <Route path="/shop" element={<SwytchErrorBoundary {...errorBoundaryProps}><Shop {...pageProps} /></SwytchErrorBoundary>} />
            <Route path="/community" element={<SwytchErrorBoundary {...errorBoundaryProps}><Community {...pageProps} /></SwytchErrorBoundary>} />
            <Route path="/membership" element={<SwytchErrorBoundary {...errorBoundaryProps}><Membership {...pageProps} /></SwytchErrorBoundary>} />
            <Route path="/inventory" element={<SwytchErrorBoundary {...errorBoundaryProps}><Inventory {...pageProps} /></SwytchErrorBoundary>} />
            <Route path="/admin" element={userId ? (<SwytchErrorBoundary {...errorBoundaryProps}><AdminPage {...pageProps} /></SwytchErrorBoundary>) : (<Navigate to="/" replace />)} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <BottomNav {...bottomNavProps} />
      </div>
      <AnimatePresence>
        {activeModal === "auth" && <AuthModal setShowMessage={setShowMessage} />}
        {activeModal === "payment" && <PaymentModal {...pageProps} />}
      </AnimatePresence>
    </div>
  );
};
export default App;