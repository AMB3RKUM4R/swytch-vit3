import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useEffect, useRef } from 'react'; // Removed useCallback as it's not directly used
import { Rocket, Trophy, Users, Sparkles, Star, MessageCircleHeart, Wallet } from 'lucide-react';
import { doc, getDoc, onSnapshot, setDoc, collection, addDoc, serverTimestamp, getDocs, QueryDocumentSnapshot } from 'firebase/firestore'; // runTransaction is used
import { db, auth } from '../lib/firebaseConfig'; // Corrected path
import { useNavigate, Link } from 'react-router-dom';
import { useModal } from '../context/ModalContext'; // Corrected path
import { useAuthUser } from '../hooks/useAuthUser'; // Corrected path
import { useAccount } from 'wagmi';
import { Canvas, useFrame } from '@react-three/fiber';
import { Mesh } from 'three'; // Explicitly import Mesh from 'three'
import { OrbitControls, Text } from '@react-three/drei';
import Modal from '../components/SwytchModal'; // Corrected path
import AuthModal from '../components/AuthModal'; // Corrected path
import PaymentModal from '../components/PaymentModal'; // Corrected path
import SwytchErrorBoundary from '../components/ErrorBoundaryComponent'; // Corrected path
import ConfettiExplosion from 'react-confetti-explosion';


// --- Type Definitions ---
interface Bet {
  amount: number;
  multiplier?: number;
  cashedOut: boolean;
}

interface Stats {
  wins: number;
  losses: number;
  totalGames: number;
  highestMultiplier: number;
}

interface Quest {
  id: string;
  title: string;
  progress: number;
  goal: number;
  rewardJEWELS: number;
  rewardXP: number;
  completed: boolean;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
}

interface Stage {
  name: string;
  threshold: number;
  color: string;
  emoji: string;
}

interface GameRoom {
  bets: { [userId: string]: { bets: Bet[]; cashedOut: boolean; multiplier?: number } };
  multiplier: number;
  crashPoint: number;
  phase: 'BETTING' | 'FLYING' | 'CRASHED';
  players: string[];
  game: string;
  roomId: string; // Added roomId for consistency
}

interface Reward {
  jewels: number;
  xp: number;
  message: string;
}

// --- Animation Variants ---
const sectionVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut', type: 'spring', stiffness: 100 } },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const flareVariants = {
  animate: { scale: [1, 1.3, 1], opacity: [0.5, 0.7, 0.5], transition: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' } },
};

const particleVariants = {
  animate: { y: [0, -8, 0], opacity: [0.4, 1, 0.4], transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' } },
};

const rewardVariants = {
  initial: { opacity: 0, scale: 0.8, y: 50 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5 } },
  exit: { opacity: 0, scale: 0.8, y: -50, transition: { duration: 0.3 } },
};

const STAGES: Stage[] = [
  { name: 'First Stage', threshold: 2, color: '#4b5563', emoji: '🛰️' },
  { name: 'Second Stage', threshold: 5, color: '#9ca3af', emoji: '🚀' },
  { name: 'Third Stage', threshold: 10, color: '#60a5fa', emoji: '🛸' },
  { name: 'Shuttle', threshold: 100, color: '#ffffff', emoji: '🧑‍🚀' },
];

const generateCrashPoint = (seed: string): number => {
  const hash = Array.from(seed).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random = (Math.sin(hash) * 10000) % 1;
  const min = 1.01;
  const max = 100;
  return Number((min + (max - min) * Math.pow(random, 2)).toFixed(2)); // Skewed distribution for realism
};

const getActiveStages = (multiplier: number): number => {
  return STAGES.filter(stage => multiplier < stage.threshold).length;
};

const RocketModel: React.FC<{ phase: 'BETTING' | 'FLYING' | 'CRASHED' }> = ({ phase }) => {
  const ref = useRef<Mesh>(null); // Correctly typed as Mesh
  useFrame(() => {
    if (ref.current && phase === 'FLYING') {
      ref.current.position.y += 0.05;
      ref.current.rotation.x += 0.01;
    }
  });

  return (
    <group position={[0, phase === 'CRASHED' ? -5 : 0, 0]} rotation={[phase === 'CRASHED' ? Math.PI : 0, 0, 0]}>
      <mesh ref={ref}>
        <coneGeometry args={[0.5, 1.5, 32]} />
        <meshStandardMaterial color="#f43f5e" roughness={0.3} metalness={0.5} />
      </mesh>
      <Text position={[0, 1, 0]} fontSize={0.3} color="#22d3ee" anchorX="center" anchorY="middle">
        {phase === 'CRASHED' ? '💥' : '🚀'}
      </Text>
    </group>
  );
};

const initialQuests: Quest[] = [
  { id: "rocketCrash-wins", title: "Win 3 Rocket Crash Rounds", progress: 0, goal: 3, rewardJEWELS: 10, rewardXP: 15, completed: false },
  { id: "rocketCrash-play", title: "Play 5 Rocket Crash Rounds", progress: 0, goal: 5, rewardJEWELS: 5, rewardXP: 10, completed: false },
  { id: "rocketCrash-share", title: "Share Rocket Crash Win on X", progress: 0, goal: 1, rewardJEWELS: 5, rewardXP: 5, completed: false },
];

const initialAchievements: Achievement[] = [
  { id: "rocketCrash-master", title: "Rocket Crash Master", description: "Win 10 multiplayer Rocket Crash rounds.", unlocked: false },
];

const mockXPosts: { username: string; content: string; likes: number; timestamp: string }[] = [
  { username: "@PETversePlayer", content: "Cashed out at 50x in Rocket Crash! 🚀 #SwytchPETverse", likes: 150, timestamp: "2025-07-08T17:00:00Z" },
  { username: "@CryptoGamerX", content: "Rocket Crash in PETverse is wild! Join the ride! #SwytchPET", likes: 190, timestamp: "2025-07-07T16:15:00Z" },
];

interface RocketCrashGameProps {
  userId: string | null;
  setIsPETMember: React.Dispatch<React.SetStateAction<boolean>>;
  updatePlayerFirestore: (updates: Partial<any>) => Promise<void>;
}

const RocketCrashGame: React.FC<RocketCrashGameProps> = ({ userId, setIsPETMember, updatePlayerFirestore }) => {
  const { user: firebaseAuthUser, loading: authLoading } = useAuthUser();
  const { address } = useAccount();
  const { activeModal, setActiveModal, setShowMessage } = useModal();
  const [jewels, setJewels] = useState<number>(0);
  const [gold, setGold] = useState<number>(0);
  const [stats, setStats] = useState<Stats>({ wins: 0, losses: 0, totalGames: 0, highestMultiplier: 0 });
  const [quests, setQuests] = useState<Quest[]>(initialQuests);
  const [achievements, setAchievements] = useState<Achievement[]>(initialAchievements);
  const [showReward, setShowReward] = useState<Reward | null>(null);
  const [showTutorial, setShowTutorial] = useState<boolean>(false);
  const [gameRoom, setGameRoom] = useState<GameRoom | null>(null);
  const [gameRoomId, setGameRoomId] = useState<string | null>(null);
  const [players, setPlayers] = useState<string[]>([]);
  const [bets, setBets] = useState<Bet[]>([{ amount: 10, cashedOut: false }, { amount: 0, cashedOut: false }]);
  const [useJewels, setUseJewels] = useState<boolean>(true);
  const [autoPlay, setAutoPlay] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const rocketSoundRef = useRef<HTMLAudioElement | null>(null);
  const cashoutSoundRef = useRef<HTMLAudioElement | null>(null);
  const explosionSoundRef = useRef<HTMLAudioElement | null>(null);
  const animationFrameRef = useRef<number>();
  const navigate = useNavigate();
  const effectiveUserId = userId ?? (address ? address.toLowerCase() : firebaseAuthUser?.uid ?? null);

  useEffect(() => {
    if (!effectiveUserId) {
      setShowTutorial(true);
      setShowMessage("⚠️ Please sign in to play!");
      setActiveModal("auth");
      navigate("/auth");
      setIsLoading(false);
      return;
    }

    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const userRef = doc(db, "Players", effectiveUserId);
        const userSnap = await getDoc(userRef);
        const data = userSnap.exists() ? userSnap.data() : {};

        if (data.jewels !== undefined) setJewels(data.jewels || 0);
        if (data.gold !== undefined) setGold(data.gold || 0);
        setIsPETMember(data.isPETMember || false);
        const mergedQuests = initialQuests.map((initialQuest) => {
          const savedQuest = data.quests?.find((q: Quest) => q.id === initialQuest.id); // Explicitly type q
          return savedQuest && initialQuest.goal === savedQuest.goal ? savedQuest : initialQuest;
        });
        setQuests(mergedQuests);
        setAchievements(data.achievements?.filter((a: Achievement) => initialAchievements.some((ia) => ia.id === a.id)) || initialAchievements);
        setStats({
          wins: data.rocketCrashWins || 0,
          losses: data.rocketCrashLosses || 0,
          totalGames: data.rocketCrashTotalGames || 0,
          highestMultiplier: data.rocketCrashHighestMultiplier || 0,
        });

        const roomsRef = collection(db, "GameRooms");
        const roomsSnap = await getDocs(roomsRef);
        let roomId = roomsSnap.docs.find((docSnap: QueryDocumentSnapshot) => docSnap.data().phase === "BETTING" && docSnap.data().game === "rocket-crash")?.id; // Use docSnap
        if (!roomId) {
          const newRoomRef = await addDoc(roomsRef, {
            game: "rocket-crash",
            bets: {},
            multiplier: 1,
            crashPoint: 0,
            phase: 'BETTING',
            players: [effectiveUserId],
          });
          roomId = newRoomRef.id;
        } else {
          await setDoc(doc(db, "GameRooms", roomId), {
            players: [...(roomsSnap.docs.find((docSnap) => docSnap.id === roomId)?.data().players || []), effectiveUserId], // Use docSnap
          }, { merge: true });
        }
        setGameRoomId(roomId);

        const roomRef = doc(db, "GameRooms", roomId);
        const unsubscribe = onSnapshot(roomRef, (docSnap) => { // Renamed doc to docSnap to avoid conflict
          if (docSnap.exists()) {
            const data = docSnap.data() as GameRoom;
            setGameRoom(data);
            setPlayers(data.players || []);
          }
        }, (err) => {
          console.error("Failed to fetch game room:", err);
          setShowMessage("⚠️ Failed to load game. Please try again.");
          setActiveModal("error");
        });

        return () => unsubscribe();
      } catch (err) {
        console.error("Failed to join room:", err);
        setShowMessage("⚠️ Failed to join game room.");
        setActiveModal("error");
        setIsLoading(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
    rocketSoundRef.current = new Audio("/audio/reward.mp3"); // Assuming this is the rocket sound
    cashoutSoundRef.current = new Audio("/audio/reward.mp3"); // Assuming this is the cashout sound
    explosionSoundRef.current = new Audio("/audio/reward.mp3"); // Assuming this is the explosion sound
    return () => {
      rocketSoundRef.current?.pause();
      cashoutSoundRef.current?.pause();
      explosionSoundRef.current?.pause();
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [effectiveUserId, setShowMessage, setActiveModal, navigate, setIsPETMember, updatePlayerFirestore, address]); // Added updatePlayerFirestore and address to dependencies

  useEffect(() => {
    if (showReward) {
      const timer = setTimeout(() => setShowReward(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [showReward]);

  useEffect(() => {
    if (effectiveUserId) {
      updatePlayerFirestore({
        jewels,
        gold,
        quests,
        achievements,
        rocketCrashWins: stats.wins,
        rocketCrashLosses: stats.losses,
        rocketCrashTotalGames: stats.totalGames,
        rocketCrashHighestMultiplier: stats.highestMultiplier,
      }).catch((err) => {
        console.error("Failed to save state:", err);
        setShowMessage("⚠️ Failed to save data.");
        setActiveModal("error");
      });
    }
  }, [jewels, gold, stats, quests, achievements, effectiveUserId, updatePlayerFirestore, setShowMessage, setActiveModal]);

  const logTransaction = async (type: "deposit" | "withdraw", amount: number): Promise<void> => {
    if (!effectiveUserId) return;
    try {
      const transactionId = `${effectiveUserId}_${Date.now()}`;
      await addDoc(collection(db, "transactions"), { // Use lowercase 'transactions'
        transactionId,
        userId: effectiveUserId, // Use effectiveUserId here
        amount,
        currency: useJewels ? "JEWELS" : "USDT",
        transactionType: type,
        status: "pending",
        timestamp: serverTimestamp(),
        game: "rocket-crash",
        adminId: "0CfobCbXnPZsJwT662H4OhDrXk33",
      });
      setShowMessage(`✅ ${type === "deposit" ? "Win" : "Bet"} of ${amount} ${useJewels ? "JEWELS" : "USDT"} submitted! Admin (0CfobCbXnPZsJwT662H4OhDrXk33) will process.`);
    } catch (err) {
      console.error("Error logging transaction:", err);
      setShowMessage("⚠️ Failed to log transaction.");
      setActiveModal("error");
    }
  };

  const shareWinOnX = async (event: React.MouseEvent<HTMLButtonElement>): Promise<void> => { // Added event type
    event.preventDefault(); // Prevent default form submission
    if (!effectiveUserId) {
      setShowMessage("⚠️ Please sign in to share.");
      setActiveModal("auth");
      navigate("/auth");
      return;
    }
    const shareQuest = quests.find((q: Quest) => q.id === "rocketCrash-share"); // Explicitly type q
    if (shareQuest && !shareQuest.completed) {
      const shareText = encodeURIComponent("Cashed out big in Rocket Crash on Swytch PETverse! 🚀 Join at swytch.io! #SwytchPETverse #RocketCrash");
      window.open(`https://x.com/intent/tweet?text=${shareText}`, "_blank");
      setQuests((prev) => prev.map((q) => (q.id === "rocketCrash-share" ? { ...q, progress: 1, completed: true } : q)));
      setJewels((prev) => prev + shareQuest.rewardJEWELS);
      setShowReward({ jewels: shareQuest.rewardJEWELS, xp: shareQuest.rewardXP, message: `Quest Completed: ${shareQuest.title}!` });
      await logTransaction("deposit", shareQuest.rewardJEWELS);
      await updatePlayerFirestore({ quests, jewels: jewels + shareQuest.rewardJEWELS });
      if (cashoutSoundRef.current) cashoutSoundRef.current.play().catch((_err: unknown) => console.error("Audio playback failed:", _err)); // Use _err
    }
  };

  const startRound = async (): Promise<void> => {
    if (!effectiveUserId || !gameRoomId) {
      setShowMessage("⚠️ Please sign in to play!");
      setActiveModal("auth");
      navigate("/auth");
      return;
    }
    if (gameRoom?.phase !== 'BETTING') {
      setShowMessage("⚠️ Game in progress!");
      setActiveModal("error");
      return;
    }
    if (bets[0].amount === 0 && bets[1].amount === 0) {
      setShowMessage("⚠️ Place at least one bet!");
      setActiveModal("error");
      return;
    }
    if (bets[0].amount < 10 || bets[0].amount > 1000 || bets[1].amount < 0 || bets[1].amount > 1000) {
      setShowMessage("⚠️ Bet amounts must be between 10-1000 for Bet 1 and 0-1000 for Bet 2!");
      setActiveModal("error");
      return;
    }
    if ((useJewels && jewels < bets[0].amount + bets[1].amount) || (!useJewels && gold < bets[0].amount + bets[1].amount)) {
      setShowMessage(`⚠️ Not enough ${useJewels ? "JEWELS" : "USDT"}! Please deposit.`);
      setActiveModal("payment");
      navigate("/vault");
      return;
    }
    const roomRef = doc(db, "GameRooms", gameRoomId);
    const roomSnap = await getDoc(roomRef);
    if (!roomSnap.exists()) return;
    const roomData = roomSnap.data() as GameRoom;
    if (roomData.phase !== 'BETTING') return;

    const crash = generateCrashPoint(Date.now().toString());
    const updatedBets = { ...roomData.bets, [effectiveUserId]: { bets, cashedOut: false } }; // Use effectiveUserId here
    await setDoc(roomRef, {
      bets: updatedBets,
      multiplier: 1,
      crashPoint: crash,
      phase: 'FLYING',
      game: "rocket-crash",
    }, { merge: true });

    if (useJewels) {
      setJewels((prev) => prev - (bets[0].amount + bets[1].amount));
    } else {
      setGold((prev) => prev - (bets[0].amount + bets[1].amount));
    }
    await logTransaction("withdraw", bets[0].amount + bets[1].amount);
    if (rocketSoundRef.current) {
      rocketSoundRef.current.play().catch((_err: unknown) => console.error("Audio playback failed:", _err)); // Use _err
    }

    const animate = () => {
      setGameRoom((prev) => {
        if (!prev) return prev;
        const newMultiplier = prev.multiplier * 1.05; // Smoother curve
        if (newMultiplier >= prev.crashPoint) {
          handleCrash();
          return prev;
        }
        const updatedRoom = { ...prev, multiplier: Number(newMultiplier.toFixed(2)) };
        setDoc(roomRef, { multiplier: updatedRoom.multiplier }, { merge: true });
        animationFrameRef.current = requestAnimationFrame(animate);
        return updatedRoom;
      });
    };
    animationFrameRef.current = requestAnimationFrame(animate);
  };

  const cashOut = async (betIndex: number): Promise<void> => {
    if (!effectiveUserId || !gameRoomId || !gameRoom || gameRoom.phase !== 'FLYING' || gameRoom.bets[effectiveUserId]?.bets[betIndex].cashedOut) return;
    const roomRef = doc(db, "GameRooms", gameRoomId);
    const updatedBets = [...gameRoom.bets[effectiveUserId].bets]; // Use effectiveUserId here
    updatedBets[betIndex] = { ...updatedBets[betIndex], multiplier: gameRoom.multiplier, cashedOut: true };
    const updatedPlayerBets = { ...gameRoom.bets, [effectiveUserId]: { bets: updatedBets, cashedOut: updatedBets.every(bet => bet.cashedOut || bet.amount === 0) } }; // Use effectiveUserId here
    await setDoc(roomRef, { bets: updatedPlayerBets }, { merge: true });

    const winnings = bets[betIndex].amount * gameRoom.multiplier;
    if (useJewels) {
      setJewels((prev) => prev + winnings);
    } else {
      setGold((prev) => prev + winnings);
    }
    const newStats = { // Declare newStats here
      wins: stats.wins + 1,
      losses: stats.losses,
      totalGames: stats.totalGames,
      highestMultiplier: Math.max(stats.highestMultiplier, gameRoom.multiplier),
    };
    setStats(newStats);
    setBets(updatedBets);
    await logTransaction("deposit", winnings);
    setShowReward({ jewels: winnings, xp: 10, message: `Cashed out at ${gameRoom.multiplier}x! +${winnings.toFixed(0)} ${useJewels ? "JEWELS" : "USDT"}` });
    if (cashoutSoundRef.current) {
      cashoutSoundRef.current.play().catch((_err: unknown) => console.error("Audio playback failed:", _err)); // Use _err
    }

    const winQuest = quests.find((q: Quest) => q.id === "rocketCrash-wins"); // Explicitly type q
    if (winQuest && !winQuest.completed) {
      const newProgress = Math.min(winQuest.progress + 1, winQuest.goal);
      const isQuestCompleted = newProgress >= winQuest.goal;
      setQuests((prev) =>
        prev.map((q) => (q.id === "rocketCrash-wins" ? { ...q, progress: newProgress, completed: isQuestCompleted } : q))
      );
      if (isQuestCompleted) {
        const rewardAmount = winQuest.rewardJEWELS;
        setJewels((prev) => prev + rewardAmount);
        setShowReward({ jewels: rewardAmount, xp: winQuest.rewardXP, message: `Quest Completed: ${winQuest.title}!` });
        await logTransaction("deposit", rewardAmount);
        await updatePlayerFirestore({ quests, jewels: jewels + rewardAmount });
        if (cashoutSoundRef.current) cashoutSoundRef.current.play().catch((_err: unknown) => console.error("Audio playback failed:", _err)); // Use _err
      }
    }

    const achievement = achievements.find((a: Achievement) => a.id === "rocketCrash-master"); // Explicitly type a
    if (achievement && !achievement.unlocked && newStats.wins >= 10) {
      setAchievements((prev) => prev.map((a) => (a.id === "rocketCrash-master" ? { ...a, unlocked: true } : a)));
      setJewels((prev) => prev + 20);
      setShowReward({ jewels: 20, xp: 30, message: "Achievement Unlocked: Rocket Crash Master!" });
      await logTransaction("deposit", 20);
      await updatePlayerFirestore({ achievements, jewels: jewels + 20 });
      if (cashoutSoundRef.current) cashoutSoundRef.current.play().catch((_err: unknown) => console.error("Audio playback failed:", _err)); // Use _err
    }
  };

  const handleCrash = async (): Promise<void> => {
    if (!gameRoomId || !gameRoom || gameRoom.phase !== 'FLYING') return;
    const roomRef = doc(db, "GameRooms", gameRoomId);
    rocketSoundRef.current?.pause();
    if (explosionSoundRef.current) {
      explosionSoundRef.current.play().catch((_err: unknown) => console.error("Audio playback failed:", _err)); // Use _err
    }
    const lost = gameRoom.bets[effectiveUserId!]?.bets.some((bet) => bet.amount > 0 && !bet.cashedOut); // Use effectiveUserId!
    const newStats = { // Declare newStats here
      wins: stats.wins,
      losses: lost ? stats.losses + 1 : stats.losses,
      totalGames: stats.totalGames + 1,
      highestMultiplier: stats.highestMultiplier,
    };
    setStats(newStats);
    if (lost) {
      setShowReward({ jewels: 0, xp: 0, message: `Rocket exploded at ${gameRoom.crashPoint}x!` });
    }
    await setDoc(roomRef, { phase: 'CRASHED', game: "rocket-crash" }, { merge: true });

    const playQuest = quests.find((q: Quest) => q.id === "rocketCrash-play"); // Explicitly type q
    if (playQuest && !playQuest.completed) {
      const newProgress = Math.min(playQuest.progress + 1, playQuest.goal);
      const isQuestCompleted = newProgress >= playQuest.goal;
      setQuests((prev) =>
        prev.map((q) => (q.id === "rocketCrash-play" ? { ...q, progress: newProgress, completed: isQuestCompleted } : q))
      );
      if (isQuestCompleted) {
        const rewardAmount = playQuest.rewardJEWELS;
        setJewels((prev) => prev + rewardAmount);
        setShowReward({ jewels: rewardAmount, xp: playQuest.rewardXP, message: `Quest Completed: ${playQuest.title}!` });
        await logTransaction("deposit", rewardAmount);
        await updatePlayerFirestore({ quests, jewels: jewels + rewardAmount });
        if (cashoutSoundRef.current) cashoutSoundRef.current.play().catch((_err: unknown) => console.error("Audio playback failed:", _err)); // Use _err
      }
    }

    await updatePlayerFirestore({
      rocketCrashWins: newStats.wins,
      rocketCrashLosses: newStats.losses,
      rocketCrashTotalGames: newStats.totalGames,
      rocketCrashHighestMultiplier: newStats.highestMultiplier,
    });

    if (autoPlay) {
      setTimeout(async () => {
        await setDoc(roomRef, {
          bets: {},
          multiplier: 1,
          crashPoint: 0,
          phase: 'BETTING',
          game: "rocket-crash",
        }, { merge: true });
        setBets([{ amount: 10, cashedOut: false }, { amount: 0, cashedOut: false }]);
        setTimeout(startRound, 1000);
      }, 2500);
    } else {
      setTimeout(async () => {
        await setDoc(roomRef, {
          bets: {},
          multiplier: 1,
          crashPoint: 0,
          phase: 'BETTING',
          game: "rocket-crash",
        }, { merge: true });
        setBets([{ amount: 10, cashedOut: false }, { amount: 0, cashedOut: false }]);
      }, 2500);
    }
  };

  if (authLoading || isLoading || !effectiveUserId) { // Added !effectiveUserId to loading check for initial state
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-gray-950 font-inter">
        <p>Loading Rocket Crash...</p>
      </div>
    );
  }

  return (
    <section className="relative py-16 px-6 sm:px-8 lg:px-16 bg-gradient-to-br from-gray-950 via-rose-950/20 to-black text-white overflow-hidden font-inter">
      {gameRoom?.phase === 'CRASHED' && gameRoom.bets[effectiveUserId!]?.bets.some(bet => bet.amount > 0 && bet.cashedOut) && ( // Check if any bet was cashed out
        <div className="absolute inset-0 flex justify-center items-center">
          <ConfettiExplosion
            force={0.8}
            duration={3000}
            particleCount={150}
            width={1200}
            colors={["#f43f5e", "#22d3ee", "#ffffff"]}
          />
        </div>
      )}
      <motion.div
        className="fixed inset-0 pointer-events-none z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="absolute w-96 h-96 bg-gradient-to-br from-rose-400/50 via-cyan-500/40 to-rose-400/30 rounded-full opacity-30 blur-3xl"
          variants={flareVariants}
          animate="animate"
          style={{ top: "33%", left: "33%" }}
        />
        <motion.div
          className="absolute w-64 h-64 bg-gradient-to-br from-cyan-400/40 via-rose-500/30 to-cyan-400/20 rounded-full opacity-20 blur-2xl"
          variants={flareVariants}
          animate="animate"
          style={{ top: "50%", right: "25%" }}
        />
        <div className="absolute inset-0 bg-[url('/noise.png')] bg-repeat bg-[length:64px_64px] opacity-15" />
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute w-1.5 h-1.5 bg-cyan-400 rounded-full opacity-30"
            style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }}
            variants={particleVariants}
            animate="animate"
          />
        ))}
      </motion.div>

      <motion.div
        className="relative z-10 max-w-6xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={sectionVariants} className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold text-rose-400 flex items-center justify-center gap-3 font-poppins">
            <Rocket className="w-8 h-8 text-cyan-400 animate-pulse" /> Rocket Crash
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto mt-4 font-inter">
            Launch into the multiplayer PETverse and cash out before the rocket crashes! <Link to="/vault" className="text-cyan-400 hover:underline">Manage vault</Link>.
          </p>
          <p className="text-sm text-cyan-400 italic mt-2 font-inter">
            🔐 Wallet: {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Not connected"} | 💎 JEWELS: {jewels} | 🪙 USDT: {gold}
          </p>
        </motion.div>

        <motion.div variants={sectionVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12 bg-gray-900/70 p-6 rounded-2xl border border-rose-500/30 backdrop-blur-md bg-gradient-to-r from-rose-500/20 to-cyan-500/20">
          <div className="flex flex-col">
            <label className="text-white font-semibold mb-2 font-poppins">Bet 1</label>
            <select
              value={bets[0].amount}
              onChange={(e) => setBets((prev) => [{ ...prev[0], amount: Number(e.target.value) }, prev[1]])}
              className="bg-gray-800 text-white rounded-lg px-3 py-2 border border-cyan-500/20 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 outline-none font-inter"
              disabled={gameRoom?.phase !== 'BETTING'}
            >
              {[10, 50, 100, 250, 500, 1000].map((b) => (
                <option key={b} value={b}>
                  {b} {useJewels ? "JEWELS" : "USDT"}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-white font-semibold mb-2 font-poppins">Bet 2</label>
            <select
              value={bets[1].amount}
              onChange={(e) => setBets((prev) => [prev[0], { ...prev[1], amount: Number(e.target.value) }])}
              className="bg-gray-800 text-white rounded-lg px-3 py-2 border border-cyan-500/20 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 outline-none font-inter"
              disabled={gameRoom?.phase !== 'BETTING'}
            >
              {[0, 10, 50, 100, 250, 500, 1000].map((b) => (
                <option key={b} value={b}>
                  {b} {useJewels ? "JEWELS" : "USDT"}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-white font-semibold mb-2 font-poppins">Currency</label>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={useJewels}
                onChange={() => setUseJewels((prev) => !prev)}
                className="mr-2"
                disabled={gameRoom?.phase !== 'BETTING'}
              />
              <label className="text-white font-semibold font-poppins">Use JEWELS</label>
            </div>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={autoPlay}
              onChange={() => setAutoPlay((prev) => !prev)}
              className="mr-2"
              disabled={gameRoom?.phase !== 'BETTING'}
            />
            <label className="text-white font-semibold font-poppins">Auto-Play</label>
          </div>
        </motion.div>

        <motion.div variants={sectionVariants} className="mb-12 bg-gray-900/70 p-4 rounded-2xl border border-rose-500/30 backdrop-blur-md bg-gradient-to-r from-rose-500/20 to-cyan-500/20">
          <h3 className="text-xl text-white font-bold mb-3 font-poppins flex items-center gap-2">
            <Users className="w-6 h-6 text-cyan-400 animate-pulse" /> Players
          </h3>
          {players.map((playerId, _idx) => (
            <p key={playerId} className="text-cyan-400 font-inter">
              {address && playerId === address.toLowerCase() ? `${address.slice(0, 6)}...${address.slice(-4)}` : `Player ${playerId.slice(0, 6)}...${playerId.slice(-4)}`}
              {gameRoom?.bets[playerId] ? `: Bet ${gameRoom.bets[playerId].bets[0].amount + gameRoom.bets[playerId].bets[1].amount} ${useJewels ? "JEWELS" : "USDT"}` : ""}
              {gameRoom?.bets[playerId]?.cashedOut ? ` (Cashed at ${gameRoom.bets[playerId]?.multiplier}x)` : ""} {/* Added null check for multiplier */}
            </p>
          ))}
        </motion.div>

        <motion.div variants={sectionVariants} className="flex justify-between items-center mb-12 bg-gray-900/70 p-4 rounded-2xl border border-rose-500/30 backdrop-blur-md bg-gradient-to-r from-rose-500/20 to-cyan-500/20">
          <div className="text-lg text-white font-semibold font-poppins">
            JEWELS: <span className="text-cyan-400">{jewels}</span> | USDT: <span className="text-cyan-400">{gold}</span>
          </div>
          <motion.button
            onClick={startRound}
            disabled={gameRoom?.phase !== 'BETTING'}
            className={gameRoom?.phase !== 'BETTING' ? "px-8 py-4 bg-gray-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 font-poppins cursor-not-allowed" : "px-8 py-4 bg-rose-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 font-poppins hover:bg-cyan-500"}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Start Launch"
          >
            <Rocket className="w-6 h-6 text-cyan-400 animate-pulse" /> Start Launch
          </motion.button>
        </motion.div>

        {gameRoom?.phase !== 'BETTING' && ( // Added null check
          <motion.div variants={sectionVariants} className="relative bg-gray-900/70 p-8 rounded-2xl border border-rose-500/30 backdrop-blur-md bg-gradient-to-r from-rose-500/20 to-cyan-500/20 mb-12 h-[400px]">
            <SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}>
              <div className="absolute inset-0 bg-gradient-to-t from-rose-500/20 to-cyan-500/20 rounded-2xl" />
              <div className="relative flex flex-col items-center justify-center h-full">
                <Canvas style={{ height: "300px", width: "100%" }} camera={{ position: [0, 5, 10], fov: 60 }}>
                  <ambientLight intensity={0.5} />
                  <pointLight position={[10, 10, 10]} intensity={1} />
                  {gameRoom && <RocketModel phase={gameRoom.phase} />} {/* Added null check */}
                  <OrbitControls enableZoom={false} maxPolarAngle={Math.PI / 2} />
                  {gameRoom && <Text position={[0, 2, 0]} fontSize={1} color="#22d3ee" anchorX="center" anchorY="middle">
                    {gameRoom.multiplier.toFixed(2)}x {/* gameRoom.multiplier is guaranteed */}
                  </Text>}
                </Canvas>
                <div className="absolute bottom-12 flex flex-col items-center transition-all duration-300">
                  <AnimatePresence>
                    {gameRoom && STAGES.map((stage, idx) => { // Added null check for gameRoom
                      const activeStages = getActiveStages(gameRoom.multiplier); // gameRoom.multiplier is guaranteed
                      if (idx < activeStages) {
                        return (
                          <motion.div
                            key={stage.name}
                            className={`w-16 h-16 rounded-lg shadow-lg mb-[-10px] flex items-center justify-center`}
                            style={{ backgroundColor: stage.color }}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -30 }}
                            transition={{ delay: idx * 0.1 }}
                          >
                            <span className="text-3xl">{stage.emoji}</span>
                          </motion.div>
                        );
                      }
                      return null;
                    })}
                  </AnimatePresence>
                  {gameRoom?.phase === 'CRASHED' && (
                    <motion.div
                      className="absolute bottom-0 text-6xl"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1.2 }}
                      exit={{ scale: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      💥
                    </motion.div>
                  )}
                </div>
                {gameRoom?.phase === 'CRASHED' && (
                  <div className="absolute top-1/2 text-3xl text-red-400 font-bold text-center font-poppins">
                    Rocket exploded at {gameRoom.crashPoint}x {/* gameRoom.crashPoint is guaranteed */}
                  </div>
                )}
              </div>
            </SwytchErrorBoundary>
          </motion.div>
        )}

        {gameRoom?.phase === 'FLYING' && ( // Added null check
          <motion.div variants={sectionVariants} className="flex justify-center gap-4 mb-12">
            {gameRoom.bets[effectiveUserId!]?.bets.map((bet, i) => ( // effectiveUserId!
              bet.amount > 0 && !bet.cashedOut && (
                <motion.button
                  key={`cashout-${i}`}
                  onClick={() => cashOut(i)}
                  className="px-6 py-3 bg-rose-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-cyan-500 font-poppins"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={`Cash Out Bet ${i + 1}`}
                >
                  <Wallet className="w-5 h-5 text-cyan-400 animate-pulse" /> Cash Out Bet {i + 1} ({(bet.amount * gameRoom.multiplier).toFixed(0)} {useJewels ? "JEWELS" : "USDT"})
                </motion.button>
              )
            ))}
          </motion.div>
        )}

        <motion.div variants={sectionVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
          <div className="relative bg-gray-900/70 border border-rose-500/30 p-6 rounded-2xl backdrop-blur-md bg-gradient-to-r from-rose-500/20 to-cyan-500/20">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2 font-poppins">
              <Trophy className="w-6 h-6 text-cyan-400 animate-pulse" /> Your Stats
            </h3>
            <p className="text-cyan-400 font-inter">Wins: {stats.wins}</p>
            <p className="text-cyan-400 font-inter">Losses: {stats.losses}</p>
            <p className="text-cyan-400 font-inter">Total Games: {stats.totalGames}</p>
            <p className="text-cyan-400 font-inter">Highest Multiplier: {stats.highestMultiplier}x</p>
            <p className="text-cyan-400 font-inter">Win Rate: {stats.totalGames > 0 ? ((stats.wins / stats.totalGames) * 100).toFixed(1) : 0}%</p>
          </div>
          <div className="relative bg-gray-900/70 border border-rose-500/30 p-6 rounded-2xl backdrop-blur-md bg-gradient-to-r from-rose-500/20 to-cyan-500/20">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2 font-poppins">
              <Star className="w-6 h-6 text-cyan-400 animate-pulse" /> Quests
            </h3>
            {quests.map((quest) => (
              <div key={quest.id} className="mb-2">
                <p className="text-cyan-400 font-semibold font-poppins">{quest.title}</p>
                <p className="text-sm text-gray-300 font-inter">
                  Progress: {quest.progress}/{quest.goal} | Reward: {quest.rewardJEWELS} JEWELS, {quest.rewardXP} XP
                </p>
              </div>
            ))}
            <motion.button
              onClick={shareWinOnX}
              className="mt-4 px-4 py-2 bg-rose-600 text-white rounded-lg font-semibold font-poppins flex items-center justify-center gap-2 hover:bg-cyan-500"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Share Rocket Crash Win on X"
            >
              <MessageCircleHeart className="w-5 h-5 text-cyan-400" /> Share Win on X
            </motion.button>
          </div>
          <div className="relative bg-gray-900/70 border border-rose-500/30 p-6 rounded-2xl backdrop-blur-md bg-gradient-to-r from-rose-500/20 to-cyan-500/20">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2 font-poppins">
              <Star className="w-6 h-6 text-cyan-400 animate-pulse" /> Community Wins
            </h3>
            {mockXPosts.map((post, index) => ( // Added index for key
              <div key={index} className="mb-2">
                <p className="text-sm font-semibold text-white font-poppins">{post.username}</p>
                <p className="text-sm text-gray-300 font-inter">{post.content}</p>
                <p className="text-xs text-gray-400 font-inter">
                  <Star className="w-4 h-4 inline mr-1 text-cyan-400" /> {post.likes} likes • {new Date(post.timestamp).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={sectionVariants} className="text-center py-8">
          <Link
            to="/games"
            className="inline-block bg-rose-600 text-white px-6 py-3 rounded-full font-poppins hover:bg-cyan-500"
            onClick={() => {
              if (!auth.currentUser) {
                setShowMessage('⚠️ Sign in to access Games!');
                setActiveModal('auth');
              } else {
                setShowMessage('🎮 Navigating to Games!');
              }
            }}
            role="button"
            aria-label="Navigate to Games Page"
          >
            Explore Games
          </Link>
          <Link
            to="/vault"
            className="inline-block bg-rose-600 text-white px-6 py-3 rounded-full font-poppins hover:bg-cyan-500 ml-4"
            onClick={() => {
              if (!auth.currentUser) {
                setShowMessage('⚠️ Sign in to access Vault!');
                setActiveModal('auth');
              } else {
                setShowMessage('💰 Navigating to Vault!');
              }
            }}
            role="button"
            aria-label="Navigate to Vault Page"
          >
            Visit Vault
          </Link>
          <Link
            to="/market"
            className="inline-block bg-rose-600 text-white px-6 py-3 rounded-full font-poppins hover:bg-cyan-500 ml-4"
            onClick={() => {
              if (!auth.currentUser) {
                setShowMessage('⚠️ Sign in to access Market!');
                setActiveModal('auth');
              } else {
                setShowMessage('🛒 Navigating to Market!');
              }
            }}
            role="button"
            aria-label="Navigate to Market Page"
          >
            Visit Market
          </Link>
          <Link
            to="/shop"
            className="inline-block bg-rose-600 text-white px-6 py-3 rounded-full font-poppins hover:bg-cyan-500 ml-4"
            onClick={() => {
              if (!auth.currentUser) {
                setShowMessage('⚠️ Sign in to access Shop!');
                setActiveModal('auth');
              } else {
                setShowMessage('🛒 Navigating to Shop!');
              }
            }}
            role="button"
            aria-label="Navigate to Shop Page"
          >
            Visit Shop
          </Link>
          <Link
            to="/benefits"
            className="inline-block bg-rose-600 text-white px-6 py-3 rounded-full font-poppins hover:bg-cyan-500 ml-4"
            onClick={() => {
              if (!auth.currentUser) { // Check if user is authenticated before navigating
                setShowMessage('⚠️ Sign in to access Benefits!');
                setActiveModal('auth');
              } else {
                setShowMessage('🌟 Navigating to Benefits!');
              }
            }}
            role="button"
            aria-label="Navigate to Benefits Page"
          >
            Benefits
          </Link>
          <Link
            to="/community"
            className="inline-block bg-rose-600 text-white px-6 py-3 rounded-full font-poppins hover:bg-cyan-500 ml-4"
            onClick={() => {
              if (!auth.currentUser) { // Check if user is authenticated before navigating
                setShowMessage('👥 Sign in to access Community!');
                setActiveModal('auth');
              } else {
                setShowMessage('👥 Navigating to Community!');
              }
            }}
            role="button"
            aria-label="Navigate to Community Page"
          >
            Community
          </Link>
          <Link
            to="/tokenomics"
            className="inline-block bg-rose-600 text-white px-6 py-3 rounded-full font-poppins hover:bg-cyan-500 ml-4"
            onClick={() => setShowMessage('💸 Navigating to Tokenomics!')}
            role="button"
            aria-label="Navigate to Tokenomics Page"
          >
            Tokenomics
          </Link>
        </motion.div>

        <AnimatePresence>
          {showTutorial && (
            <Modal title="Multiplayer Rocket Crash Tutorial" onClose={() => setShowTutorial(false)}>
              <div className="text-gray-200 text-sm space-y-4 font-inter">
                <p><b>Objective:</b> Cash out before the rocket crashes to win your bet multiplied by the current multiplier in a multiplayer game.</p>
                <ul className="list-disc pl-6">
                  <li>Bet 10–1000 JEWELS or USDT for Bet 1, 0–1000 for Bet 2.</li>
                  <li>Join other players, click "Start Launch" to begin.</li>
                  <li>Rocket ascends, multiplier increases. Cash out to win bet × multiplier.</li>
                  <li>Crash point is random (1.01x to 100x). Auto-play continues rounds.</li>
                  <li>Complete quests for extra JEWELS and XP.</li>
                </ul>
                <motion.button
                  onClick={() => setShowTutorial(false)}
                  className="mt-4 px-6 py-3 bg-rose-600 text-white rounded-lg font-semibold font-poppins hover:bg-cyan-500"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Close tutorial modal"
                >
                  Close
                </motion.button>
              </div>
            </Modal>
          )}
          {activeModal === "auth" && (
            <AuthModal
              setShowMessage={setShowMessage}
            />
          )}
          {activeModal === "payment" && (
            <PaymentModal
              userId={effectiveUserId}
              setShowMessage={setShowMessage}
             
            />
          )}
          {activeModal === "error" && (
            <Modal title="Error" onClose={() => setActiveModal(null)}>
              <div className="space-y-4">
                <p className="text-rose-400 font-inter">{showReward?.message || "An error occurred. Please try again."}</p>
                <motion.button
                  className="w-full p-3 bg-rose-600 text-white rounded-lg font-semibold font-poppins hover:bg-cyan-500"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveModal(null)}
                  aria-label="Close error modal"
                >
                  Close
                </motion.button>
              </div>
            </Modal>
          )}
          {showReward && (
            <motion.div
              variants={rewardVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="fixed bottom-16 right-4 max-w-xs w-full bg-gray-900/70 border border-rose-500/30 rounded-xl shadow-xl p-4 backdrop-blur-lg z-50 bg-gradient-to-r from-rose-500/20 to-cyan-500/20"
            >
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-cyan-400 animate-pulse" />
                <div>
                  <p className="text-white font-bold font-poppins">{showReward.message}</p>
                  <p className="text-sm text-gray-300 font-inter">+{showReward.jewels} JEWELS, +{showReward.xp} XP</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <audio ref={rocketSoundRef} src="/audio/reward.mp3" preload="auto" />
        <audio ref={cashoutSoundRef} src="/audio/reward.mp3" preload="auto" />
        <audio ref={explosionSoundRef} src="/audio/reward.mp3" preload="auto" />

        <style>{`
          :root {
            --rose-500: #ec4899;
            --cyan-500: #22d3ee;
          }
          .bg-noise {
            background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAC3SURBVFhH7ZZBCsAgCER7/6W9WZoKUSO4ro0Q0v+UQKcZJnTf90EQBF3X9UIIh8Ph0Ov1er3RaDSi0WhEkiSpp9OJIAiC3nEcxyHLMgqCILlcLhFFUdTr9WK5XC6VSqVUkqVJutxuNRqMhSRJpmkYkSVKpVJutxuNRqNRkiRJMk3TiCRJKpVKqVJutxuNRqVSqlUKqVSqZQqlaIoimI4HIZKpVJKpVJutxuNRqNRkiRJMk3TqCRZQqlUKqlaVSqlUKqVqlaKQlJ/kfgBQUzS2f8eAAAAAElFTkSuQmCC");
            background-repeat: repeat;
            background-size: 64px 64px;
          }
          .blur-3xl { filter: blur(64px); }
          .blur-2xl { filter: blur(32px); }
          input:focus, select:focus, button:focus, [role="button"]:focus {
            outline: none;
            box-shadow: 0 0 0 2px rgba(34, 211, 238, 0.5);
          }
          .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            border: 0;
          }
          @media (prefers-reduced-motion) {
            .animate-pulse { animation: none !important; }
          }
        `}</style>
      </motion.div>
    </section>
  );
};

export default RocketCrashGame;
