import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text, Sphere } from "@react-three/drei";
import { Wallet, Zap, Trophy, Users, Star, Sparkles, MessageCircleHeart, RefreshCcw, User } from "lucide-react";
import { doc, getDoc, collection, addDoc, onSnapshot, serverTimestamp, getDocs, QueryDocumentSnapshot, setDoc, runTransaction } from "firebase/firestore";
import { db, auth } from "../lib/firebaseConfig"; // Corrected path
import { useAuthUser } from "../hooks/useAuthUser"; // Corrected path
import { Link, useNavigate } from "react-router-dom";
import { useModal } from '../context/ModalContext'; // Corrected path
import Modal from "../components/SwytchModal"; // Corrected path
import AuthModal from "../components/AuthModal"; // Corrected path
import PaymentModal from "../components/PaymentModal"; // Corrected path
import SwytchErrorBoundary from "../components/ErrorBoundaryComponent"; // Corrected path
import ConfettiExplosion from "react-confetti-explosion";
import { useAccount } from "wagmi";
import { Transaction } from "../lib/types"; // Corrected path

// --- Type Definitions ---
interface BingoCell {
  number: number;
  marked: boolean;
}

interface BingoCard {
  cells: BingoCell[][];
  playerId: string;
}

interface PlayerInRoom {
  name: string;
  jewels: number; // Current jewels balance when joining the room
  card: BingoCard;
  isReady: boolean; // New: to indicate player readiness
}

interface GameState {
  roomId: string;
  players: { [playerId: string]: PlayerInRoom };
  calledNumbers: number[];
  status: "waiting" | "playing" | "ended";
  winner: string | null;
  currentCallerId: string | null; // New: to track which player (or backend) is calling numbers
  lastCalledNumber: number | null; // New: to show the most recent number
}

interface GameConfig {
  bet: number;
  useJewels: boolean;
}

interface Stats {
  wins: number;
  losses: number;
  totalGames: number;
  highestScore: number;
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

interface Reward {
  jewels: number;
  xp: number;
  message: string;
}



// --- Animation Variants ---
const sectionVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: "easeOut" } },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const flareVariants = {
  animate: { scale: [1, 1.2, 1], opacity: [0.6, 0.8, 0.6], transition: { duration: 4, repeat: Infinity } },
};

const particleVariants = {
  animate: { y: [0, -8, 0], opacity: [0.4, 1, 0.4], transition: { duration: 1.5, repeat: Infinity } },
};

const rewardVariants = {
  initial: { opacity: 0, scale: 0.8, y: 50 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5 } },
  exit: { opacity: 0, scale: 0.8, y: -50, transition: { duration: 0.3 } },
};

// --- Initial Data ---
const initialQuests: Quest[] = [
  { id: "bingo-lines", title: "Complete 5 Bingo Lines", progress: 0, goal: 5, rewardJEWELS: 10, rewardXP: 15, completed: false },
  { id: "bingo-play", title: "Play 5 Bingo Rounds", progress: 0, goal: 5, rewardJEWELS: 5, rewardXP: 10, completed: false },
  { id: "bingo-share", title: "Share Bingo Win on X", progress: 0, goal: 1, rewardJEWELS: 5, rewardXP: 5, completed: false },
];

const initialAchievements: Achievement[] = [
  { id: "bingo-master", title: "Bingo Master", description: "Win 10 multiplayer Bingo games.", unlocked: false },
];

const mockXPosts: { username: string; content: string; likes: number; timestamp: string }[] = [
  { username: "@PETversePlayer", content: "Crushed a multiplayer Bingo in Swytch PETverse! 🔥 #SwytchPETverse", likes: 85, timestamp: "2025-07-04T14:00:00Z" },
  { username: "@CryptoGamerX", content: "Bingo with friends in PETverse is next-level! Join us! #SwytchPET", likes: 120, timestamp: "2025-07-03T09:30:00Z" },
];

// --- 3D Bingo Ball Component ---
const BingoBall: React.FC<{ number: number; position: [number, number, number]; isMarked: boolean; onClick: () => void }> = ({ number, position, isMarked, onClick }) => {
  return (
    <group position={position} onClick={onClick}>
      <Sphere args={[0.5, 32, 32]} castShadow>
        <meshStandardMaterial color={isMarked ? "#22d3ee" : "#1f2937"} roughness={0.3} metalness={0.5} />
      </Sphere>
      <Text position={[0, 0, 0.6]} fontSize={0.3} color="#f43f5e" anchorX="center" anchorY="middle">
        {number || "FREE"}
      </Text>
    </group>
  );
};

// --- Phagocytosis Effect (for losing) ---
const PhagocytosisEffect: React.FC<{ trigger: boolean }> = ({ trigger }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!trigger || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: { x: number; y: number; size: number; speedX: number; speedY: number }[] = [];
    for (let i = 0; i < 30; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 4 + 2,
        speedX: (Math.random() - 0.5) * 3,
        speedY: (Math.random() - 0.5) * 3,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(34, 211, 238, 0.5)";
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
        if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      const animationId = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(animationId);
    };

    const timeout = setTimeout(() => animate(), 0);
    return () => clearTimeout(timeout);
  }, [trigger]);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />;
};

// --- Debounce Hook ---
const useDebounce = <T extends (...args: any[]) => void>(callback: T, delay: number) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Using '_' prefix for unused parameters to suppress warnings
  return useCallback(
    (..._args: Parameters<T>) => { // Changed to _args
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => callback(..._args), delay); // Changed to _args
    },
    [callback, delay]
  );
};

// --- Main Bingo Game Component ---
interface BingoGameProps {
  userId: string | null;
  setIsPETMember: React.Dispatch<React.SetStateAction<boolean>>;
  updatePlayerFirestore: (updates: Partial<any>) => Promise<void>;
}

const BingoGame: React.FC<BingoGameProps> = ({ userId, setIsPETMember, updatePlayerFirestore }) => {
  const { user: firebaseAuthUser, loading: authLoading } = useAuthUser();
  const { address } = useAccount();
  const { activeModal, setActiveModal, setShowMessage } = useModal();
  const [config, setConfig] = useState<GameConfig>({ bet: 100, useJewels: true });
  const [jewels, setJewels] = useState<number>(0);
  const [stats, setStats] = useState<Stats>({ wins: 0, losses: 0, totalGames: 0, highestScore: 0 });
  const [quests, setQuests] = useState<Quest[]>(initialQuests);
  const [achievements, setAchievements] = useState<Achievement[]>(initialAchievements);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [showReward, setShowReward] = useState<Reward | null>(null);
  const [showTutorial, setShowTutorial] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // Type for pendingTransaction now uses the `Transaction` interface from types.ts
  const [pendingTransaction, setPendingTransaction] = useState<Pick<Transaction, 'amount' | 'currency' | 'transactionType' | 'game'> | null>(null);
  const winSoundRef = useRef<HTMLAudioElement | null>(null);
  const navigate = useNavigate(); // Re-added useNavigate for homepage redirection

  // Determine the effective user ID for Firestore operations
  const effectiveUserId = userId ?? firebaseAuthUser?.uid ?? (address ? address.toLowerCase() : null);

  // Monitor transactions to update game state and isPETMember
  useEffect(() => {
    if (!effectiveUserId) return;

    // Listen to the 'transactions' collection (lowercase 't')
    const transactionsQuery = collection(db, "transactions");
    const unsubscribe = onSnapshot(transactionsQuery, (snapshot) => {
      snapshot.forEach((docSnap) => {
        const transaction = docSnap.data() as Transaction; // Cast to Transaction interface
        if (transaction.userId === effectiveUserId && transaction.status === "success") {
          if (transaction.transactionType === "membership") {
            updatePlayerFirestore({ isPETMember: true });
            setIsPETMember(true);
            setShowMessage("🎉 Membership activated!");
          } else if (transaction.transactionType === "withdraw" && transaction.game === "bingo") {
            // Proceed with game start after successful bet payment
            if (pendingTransaction && pendingTransaction.amount === transaction.amount && transaction.currency === pendingTransaction.currency) { // Explicitly check currency
              startGameAfterPayment(effectiveUserId, pendingTransaction.amount, pendingTransaction.currency === "JEWELS");
              setPendingTransaction(null);
            }
          }
          // Handle rewards from quests/achievements if they are processed via transactions
          if (transaction.transactionType === "deposit" && (transaction.game === "bingo_quest" || transaction.game === "bingo_win" || transaction.game === "bingo_achievement")) {
            // This listener ensures that if a reward transaction is marked 'success' by an admin,
            // the client's jewels balance is updated.
            setJewels(prevJewels => prevJewels + transaction.amount);
            setShowMessage(`🎉 Received ${transaction.amount} JEWELS for ${transaction.game.replace('bingo_', '').replace('_', ' ')}!`);
          }
        }
      });
    }, (err) => {
      console.error("Error listening to transactions:", err);
      setShowMessage("⚠️ Failed to load transaction data.");
      setActiveModal("error");
    });

    return () => unsubscribe();
  }, [effectiveUserId, setShowMessage, setActiveModal, setIsPETMember, updatePlayerFirestore, pendingTransaction]);

  // Game start logic after successful payment
  const startGameAfterPayment = async (userId: string, bet: number, useJewels: boolean) => {
    try {
      const userRef = doc(db, "Players", userId);
      await runTransaction(db, async (transaction) => {
        const userSnap = await transaction.get(userRef);
        if (!userSnap.exists()) {
          throw new Error("Player not found.");
        }
        const playerData = userSnap.data();
        if (useJewels) {
          let currentBalance = playerData.jewels || 0;
          if (currentBalance < bet) {
            throw new Error("Insufficient JEWELS balance.");
          }
          currentBalance -= bet;
          transaction.update(userRef, { jewels: currentBalance, updatedAt: serverTimestamp() });
          setJewels(currentBalance);
          console.log(`[Game] Deducted ${bet} JEWELS from ${userId}. New balance: ${currentBalance}`);
        }
      });

      const roomsRef = collection(db, "GameRooms");
      const roomsSnap = await getDocs(roomsRef);
      let roomId = roomsSnap.docs.find((doc: QueryDocumentSnapshot) => doc.data().status === "waiting")?.id;

      if (!roomId) {
        const newRoomRef = await addDoc(roomsRef, {
          status: "waiting",
          players: { [userId]: { name: firebaseAuthUser?.displayName || (address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Player"), jewels: jewels, card: createBingoCard(userId), isReady: true } },
          calledNumbers: [],
          winner: null,
          currentCallerId: null,
          lastCalledNumber: null,
          createdAt: serverTimestamp(),
        });
        roomId = newRoomRef.id;
        console.log(`[Game] Created new room: ${roomId}`);
        setShowMessage("🎉 New game room created! Waiting for more players...");
      } else {
        const roomRef = doc(db, "GameRooms", roomId);
        await setDoc(roomRef, {
          players: { [userId]: { name: firebaseAuthUser?.displayName || (address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Player"), jewels: jewels, card: createBingoCard(userId), isReady: true } },
        }, { merge: true });
        console.log(`[Game] Player ${userId} joined room: ${roomId}`);
        setShowMessage("🎉 Joined existing game room! Waiting for game to start...");
      }

      const roomDoc = await getDoc(doc(db, "GameRooms", roomId));
      const currentPlayers = roomDoc.data()?.players;
      if (currentPlayers && Object.keys(currentPlayers).length >= 1) {
        await setDoc(doc(db, "GameRooms", roomId), { status: "playing", currentCallerId: "backend_caller" }, { merge: true });
        console.log(`[Game] Game in room ${roomId} started!`);
        setShowMessage("🚀 Game started! Numbers are being called.");
        startNumberCallingClientSide(roomId);
      }
    } catch (error: any) {
      console.error("[Game] Error starting game:", error);
      setShowMessage(`⚠️ Game start failed: ${error.message}`);
      setActiveModal("error");
    } finally {
      setIsLoading(false); // Ensure loading state is reset
    }
  };

  const mockBackendMarkNumber = async (roomId: string, userId: string, row: number, col: number) => {
    try {
      await runTransaction(db, async (transaction) => {
        const roomRef = doc(db, "GameRooms", roomId);
        const roomSnap = await transaction.get(roomRef);
        if (!roomSnap.exists()) {
          throw new Error("Game room not found.");
        }
        const currentGameState = roomSnap.data() as GameState;
        if (currentGameState.status !== "playing") {
          throw new Error("Game is not active.");
        }

        const playerCard = currentGameState.players[userId]?.card;
        if (!playerCard) {
          throw new Error("Player card not found.");
        }

        const cell = playerCard.cells[row][col];
        if (cell.marked) {
          throw new Error("Cell already marked.");
        }
        if (!currentGameState.calledNumbers.includes(cell.number) && cell.number !== 0) {
          throw new Error("Number not called yet.");
        }

        const newCard = { ...playerCard, cells: playerCard.cells.map((r) => [...r]) };
        newCard.cells[row][col].marked = true;

        transaction.update(roomRef, {
          [`players.${userId}.card`]: newCard,
        });

        const userRef = doc(db, "Players", userId);
        const userSnap = await transaction.get(userRef);
        const userData = userSnap.data();
        let currentQuests = userData?.quests || initialQuests;

        const lineQuest = currentQuests.find((q: Quest) => q.id === "bingo-lines");
        if (lineQuest && !lineQuest.completed) {
          const newProgress = Math.min(lineQuest.progress + 1, lineQuest.goal);
          const isQuestCompleted = newProgress >= lineQuest.goal;
          currentQuests = currentQuests.map((q: Quest) => (q.id === "bingo-lines" ? { ...q, progress: newProgress, completed: isQuestCompleted } : q));
          transaction.update(userRef, { quests: currentQuests });
          if (isQuestCompleted) {
            const rewardAmount = lineQuest.rewardJEWELS;
            transaction.update(userRef, { jewels: (userData?.jewels || 0) + rewardAmount });
            setJewels((prev) => prev + rewardAmount); // Update local state immediately
            await mockBackendLogTransaction("deposit", rewardAmount, "JEWELS", "bingo_quest", userId);
            setShowReward({ jewels: rewardAmount, xp: lineQuest.rewardXP, message: `Quest Completed: ${lineQuest.title}!` });
            if (winSoundRef.current) winSoundRef.current.play().catch((err) => console.error("Audio playback failed:", err));
          }
        }
      });
      console.log(`[Backend Mock] Player ${userId} marked cell (${row},${col}) in room ${roomId}`);
    } catch (error: any) {
      console.error("[Backend Mock] Error marking number:", error);
      setShowMessage(`⚠️ Failed to mark number: ${error.message}`);
      setActiveModal("error");
    }
  };

  const mockBackendCallBingo = async (roomId: string, userId: string) => {
    try {
      await runTransaction(db, async (transaction) => {
        const roomRef = doc(db, "GameRooms", roomId);
        const roomSnap = await transaction.get(roomRef);
        if (!roomSnap.exists()) {
          throw new Error("Game room not found.");
        }
        const currentGameState = roomSnap.data() as GameState;
        if (currentGameState.status !== "playing") {
          throw new Error("Game is not active.");
        }

        const playerCard = currentGameState.players[userId]?.card;
        if (!playerCard) {
          throw new Error("Player card not found.");
        }

        if (!isWinningPattern(playerCard)) {
          throw new Error("Not a winning pattern yet.");
        }

        transaction.update(roomRef, { status: "ended", winner: userId });
        console.log(`[Backend Mock] Player ${userId} called Bingo and won in room ${roomId}!`);

        const winnings = config.bet * Object.keys(currentGameState.players).length;
        const userRef = doc(db, "Players", userId);
        const userSnap = await transaction.get(userRef);
        const userData = userSnap.data();
        let currentJewels = (userData?.jewels || 0) + winnings;
        let currentWins = (userData?.bingoWins || 0) + 1;
        let currentLosses = (userData?.bingoLosses || 0);
        let currentHighestScore = Math.max(userData?.bingoHighestScore || 0, currentGameState.calledNumbers.length);
        let currentAchievements = userData?.achievements || initialAchievements;
        let currentQuests = userData?.quests || initialQuests;

        transaction.update(userRef, {
          jewels: currentJewels,
          bingoWins: currentWins,
          bingoLosses: currentLosses,
          bingoHighestScore: currentHighestScore,
          updatedAt: serverTimestamp(),
        });
        setJewels(currentJewels); // Update local state immediately
        setStats((prev) => ({
          ...prev,
          wins: currentWins,
          totalGames: currentWins + currentLosses,
          highestScore: currentHighestScore,
        }));

        await mockBackendLogTransaction("deposit", winnings, "JEWELS", "bingo_win", userId);
        setShowReward({ jewels: winnings, xp: 10, message: `Bingo! You won +${winnings} JEWELS!` });
        if (winSoundRef.current) winSoundRef.current.play().catch((err) => console.error("Audio playback failed:", err));

        const achievement = currentAchievements.find((a: Achievement) => a.id === "bingo-master");
        if (achievement && !achievement.unlocked && currentWins >= 10) {
          currentAchievements = currentAchievements.map((a: Achievement) => (a.id === "bingo-master" ? { ...a, unlocked: true } : a));
          transaction.update(userRef, { achievements: currentAchievements });
          const achievementRewardJewels = 20;
          const achievementRewardXP = 30;
          transaction.update(userRef, { jewels: currentJewels + achievementRewardJewels });
          setJewels((prev) => prev + achievementRewardJewels); // Update local state immediately
          await mockBackendLogTransaction("deposit", achievementRewardJewels, "JEWELS", "bingo_achievement", userId);
          setShowReward({ jewels: achievementRewardJewels, xp: achievementRewardXP, message: "Achievement Unlocked: Bingo Master!" });
          if (winSoundRef.current) winSoundRef.current.play().catch((err) => console.error("Audio playback failed:", err));
        }

        const playQuest = currentQuests.find((q: Quest) => q.id === "bingo-play");
        if (playQuest && !playQuest.completed) {
          const newProgress = Math.min(playQuest.progress + 1, playQuest.goal);
          const isQuestCompleted = newProgress >= playQuest.goal;
          currentQuests = currentQuests.map((q: Quest) => (q.id === "bingo-play" ? { ...q, progress: newProgress, completed: isQuestCompleted } : q));
          transaction.update(userRef, { quests: currentQuests });
          if (isQuestCompleted) {
            const rewardAmount = playQuest.rewardJEWELS;
            transaction.update(userRef, { jewels: currentJewels + rewardAmount });
            setJewels((prev) => prev + rewardAmount); // Update local state immediately
            await mockBackendLogTransaction("deposit", rewardAmount, "JEWELS", "bingo_quest", userId);
            setShowReward({ jewels: rewardAmount, xp: playQuest.rewardXP, message: `Quest Completed: ${playQuest.title}!` });
            if (winSoundRef.current) winSoundRef.current.play().catch((err) => console.error("Audio playback failed:", err));
          }
        }
      });
    } catch (error: any) {
      console.error("[Backend Mock] Error calling Bingo:", error);
      setShowMessage(`⚠️ Bingo call failed: ${error.message}`);
      setActiveModal("error");
    }
  };

  const startNumberCallingClientSide = (roomId: string): void => {
    const interval = 2000;
    let availableNumbers = Array.from({ length: 75 }, (_, i) => i + 1);
    let callCount = 0;

    const callNextNumber = async () => {
      const roomSnap = await getDoc(doc(db, "GameRooms", roomId));
      const roomData = roomSnap.data(); // Get raw data

      // Explicitly check and assert type for currentGameState
      if (!roomData) {
        console.log("Stopping number calling: No room data.");
        // If no room data, assume game ended or invalid state, and stop.
        return;
      }
      const currentGameState: GameState = roomData as GameState; // Assert type here

      // Now, TypeScript knows currentGameState is a GameState object
      if (currentGameState.status !== "playing" || availableNumbers.length === 0 || callCount >= 35) {
        console.log("Stopping number calling.");
        if (currentGameState.status === "playing") { // This check is now safe
          await setDoc(doc(db, "GameRooms", roomId), { status: "ended", winner: null }, { merge: true });
          for (const playerId in currentGameState.players) {
            if (playerId !== currentGameState.winner) {
              const playerRef = doc(db, "Players", playerId);
              const playerSnap = await getDoc(playerRef);
              if (playerSnap.exists()) {
                const playerData = playerSnap.data();
                await setDoc(playerRef, { bingoLosses: (playerData.bingoLosses || 0) + 1, totalGames: (playerData.totalGames || 0) + 1 }, { merge: true });
              }
            }
          }
          setShowMessage("Game ended: No winner! Try again.");
        }
        return;
      }

      const randomIndex = Math.floor(Math.random() * availableNumbers.length);
      const number = availableNumbers[randomIndex];
      availableNumbers.splice(randomIndex, 1);
      callCount++;

      await setDoc(doc(db, "GameRooms", roomId), {
        calledNumbers: [...currentGameState.calledNumbers, number],
        lastCalledNumber: number,
      }, { merge: true });

      setTimeout(callNextNumber, interval);
    };

    callNextNumber();
  };

  // --- Data Loading and Real-time Listeners ---
  useEffect(() => {
    if (!effectiveUserId) {
      setShowTutorial(true);
      setShowMessage("⚠️ Please sign in to play!");
      setActiveModal("auth");
      setIsLoading(false);
      return;
    }

    const joinRoomAndListen = async () => {
      setIsLoading(true);
      try {
        const userRef = doc(db, "Players", effectiveUserId);
        const userSnap = await getDoc(userRef);
        const data = userSnap.exists() ? userSnap.data() : {};

        setJewels(data.jewels || 0);
        setIsPETMember(data.isPETMember || false);
        const mergedQuests = initialQuests.map((initialQuest) => {
          const savedQuest = data.quests?.find((q: Quest) => q.id === initialQuest.id);
          return savedQuest && initialQuest.goal === savedQuest.goal ? savedQuest : initialQuest;
        });
        setQuests(mergedQuests);
        setAchievements(data.achievements?.filter((a: Achievement) => initialAchievements.some((ia) => ia.id === a.id)) || initialAchievements);
        setStats({
          wins: data.bingoWins || 0,
          losses: data.bingoLosses || 0,
          totalGames: (data.bingoWins || 0) + (data.bingoLosses || 0),
          highestScore: data.bingoHighestScore || 0,
        });

        const roomsQuery = collection(db, "GameRooms");
        const unsubscribeRooms = onSnapshot(roomsQuery, (snapshot) => {
          let foundRoom: GameState | null = null;
          snapshot.forEach((docSnap) => {
            const roomData = docSnap.data() as GameState;
            if (roomData.players && effectiveUserId in roomData.players) {
              foundRoom = { ...roomData, roomId: docSnap.id };
            } else if (roomData.status === "waiting" && Object.keys(roomData.players).length < 2) {
              foundRoom = { ...roomData, roomId: docSnap.id };
            }
          });

          if (foundRoom) {
            // User explicitly requested to remove checks for status, currentCallerId, roomId
            // and instead, if a room is found, redirect to homepage.
            // WARNING: This will prevent the Bingo game from being played if any room exists.
            // If the intent is to play, this logic needs to be reverted or re-designed.
            navigate('/'); // Redirect to homepage
            setShowMessage("A game room was found, redirecting to homepage.");
            setGameState(null); // Clear game state
            setIsLoading(false); // Ensure loading is off
          } else {
            setGameState(null);
            setIsLoading(false);
          }
        }, (err) => {
          console.error("Error listening to game rooms:", err);
          setShowMessage("⚠️ Failed to load game rooms.");
          setActiveModal("error");
          setIsLoading(false);
        });

        return () => {
          unsubscribeRooms();
        };
      } catch (err) {
        console.error("Failed to initialize game data:", err);
        setShowMessage("⚠️ Failed to load game data.");
        setActiveModal("error");
        setIsLoading(false);
      }
    };

    joinRoomAndListen();
  }, [effectiveUserId, setShowMessage, setActiveModal, setIsPETMember, address, navigate]); // Added navigate to dependency array


  const savePlayerStateToFirestore = useDebounce(async (state: { jewels?: number; quests?: Quest[]; achievements?: Achievement[]; bingoWins?: number; bingoLosses?: number; bingoHighestScore?: number; totalGames?: number }) => {
    if (!effectiveUserId) {
      console.warn("Cannot save state: No effective user ID.");
      return;
    }
    try {
      await updatePlayerFirestore(state);
      console.log("Player state saved:", state);
    } catch (err) {
      console.error("Failed to save player state:", err);
      setShowMessage("⚠️ Failed to save player data.");
      setActiveModal("error");
    }
  }, 1000);

  useEffect(() => {
    savePlayerStateToFirestore({
      jewels,
      quests,
      achievements,
      bingoWins: stats.wins,
      bingoLosses: stats.losses,
      bingoHighestScore: stats.highestScore,
      totalGames: stats.totalGames,
    });
  }, [jewels, quests, achievements, stats, savePlayerStateToFirestore]);


  useEffect(() => {
    if (showReward) {
      const timer = setTimeout(() => setShowReward(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [showReward]);

  useEffect(() => {
    winSoundRef.current = new Audio("/audio/reward.mp3");
  }, []);

  // --- Game Logic Functions ---
  const createBingoCard = (playerId: string): BingoCard => {
    const ranges = [
      { min: 1, max: 15 }, // B
      { min: 16, max: 30 }, // I
      { min: 31, max: 45 }, // N
      { min: 46, max: 60 }, // G
      { min: 61, max: 75 }, // O
    ];
    const cells: BingoCell[][] = Array(5)
      .fill(null)
      .map(() => Array(5).fill(null).map(() => ({ number: 0, marked: false })));

    ranges.forEach((range, col) => {
      const columnNumbers: number[] = [];
      const availableNumbersInColumn = Array.from({ length: range.max - range.min + 1 }, (_, i) => range.min + i);

      for (let row = 0; row < 5; row++) {
        if (col === 2 && row === 2) { // Center free space
          cells[row][col] = { number: 0, marked: true };
          continue;
        }
        let randomNumber;
        // Ensure uniqueness within the column for numbers from the range
        do {
          const randomIndex = Math.floor(Math.random() * availableNumbersInColumn.length);
          randomNumber = availableNumbersInColumn[randomIndex];
          availableNumbersInColumn.splice(randomIndex, 1); // Remove used number from available
        } while (columnNumbers.includes(randomNumber)); // This check is redundant if splicing, but harmless.
        
        columnNumbers.push(randomNumber); // Add to column's numbers
        cells[row][col] = { number: randomNumber, marked: false };
      }
    });

    return { cells, playerId };
  };

  const isWinningPattern = (card: BingoCard): boolean => {
    const { cells } = card;
    // Check rows
    for (let row = 0; row < 5; row++) {
      if (cells[row].every((cell) => cell.marked)) return true;
    }
    // Check columns
    for (let col = 0; col < 5; col++) {
      if (cells.every((row) => row[col].marked)) return true;
    }
    // Check diagonals
    if (cells.every((row, i) => row[i].marked)) return true; // Top-left to bottom-right
    if (cells.every((row, i) => row[4 - i].marked)) return true; // Top-right to bottom-left
    return false;
  };

  const handleMarkNumber = async (row: number, col: number): Promise<void> => {
    if (!gameState || gameState.status !== "playing" || !effectiveUserId) return;
    await mockBackendMarkNumber(gameState.roomId, effectiveUserId, row, col);
  };

  const handleCallBingo = async (): Promise<void> => {
    if (!gameState || gameState.status !== "playing" || !effectiveUserId) return;
    await mockBackendCallBingo(gameState.roomId, effectiveUserId);
  };

  const shareWinOnX = async (): Promise<void> => {
    if (!effectiveUserId) {
      setShowMessage("⚠️ Please sign in to share.");
      setActiveModal("auth");
      return;
    }
    const shareQuest = quests.find((q) => q.id === "bingo-share");
    if (shareQuest && !shareQuest.completed) {
      const shareText = encodeURIComponent("Just won a multiplayer Bingo in Swytch PETverse! 🔥 Join at swytch.io! #SwytchPETverse #Bingo");
      window.open(`https://x.com/intent/tweet?text=${shareText}`, "_blank");
      const updatedQuests = quests.map((q) => (q.id === "bingo-share" ? { ...q, progress: 1, completed: true } : q));
      setQuests(updatedQuests);
      setShowReward({ jewels: shareQuest.rewardJEWELS, xp: shareQuest.rewardXP, message: `Quest Completed: ${shareQuest.title}!` });
      await mockBackendLogTransaction("deposit", shareQuest.rewardJEWELS, "JEWELS", "bingo_share_quest", effectiveUserId);
      if (winSoundRef.current) winSoundRef.current.play().catch((err) => console.error("Audio playback failed:", err));
      savePlayerStateToFirestore({ quests: updatedQuests, jewels: jewels + shareQuest.rewardJEWELS });
    }
  };

  const handleStartGame = async () => {
    if (!effectiveUserId) {
      setShowMessage("⚠️ Please sign in to play!");
      setActiveModal("auth");
      return;
    }
    if (config.useJewels && jewels < config.bet) {
      setShowMessage("⚠️ Not enough JEWELS! Please deposit.");
      setActiveModal("payment");
      setPendingTransaction({ amount: config.bet, currency: "JEWELS", transactionType: "deposit", game: "bingo" }); // Set pending transaction for deposit
      return;
    }
    setIsLoading(true);
    try {
      await mockBackendStartGame(effectiveUserId, config.bet, config.useJewels);
    } catch (error) {
      // Error handled in mockBackendStartGame
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayAgain = async () => {
    if (!effectiveUserId) {
      setShowMessage("⚠️ Please sign in to play!");
      setActiveModal("auth");
      return;
    }
    setIsLoading(true);
    try {
      const roomRef = doc(db, "GameRooms", gameState!.roomId);
      await setDoc(roomRef, {
        players: {
          [effectiveUserId]: {
            ...gameState!.players[effectiveUserId],
            card: createBingoCard(effectiveUserId),
            isReady: true
          }
        },
        calledNumbers: [],
        status: "waiting",
        winner: null,
        lastCalledNumber: null,
      }, { merge: true });

      const roomSnap = await getDoc(roomRef);
      const currentPlayers = roomSnap.data()?.players;
      if (currentPlayers && Object.keys(currentPlayers).length === 1 && currentPlayers[effectiveUserId]) {
        await setDoc(roomRef, { status: "waiting", currentCallerId: null }, { merge: true });
      }

      setGameState(null);
      setShowMessage("Game reset. Ready for a new round!");
    } catch (error) {
      console.error("Error resetting game:", error);
      setShowMessage("⚠️ Failed to reset game. Please try again.");
      setActiveModal("error");
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-gray-950 font-inter">
        <p>Loading Multiplayer Bingo Arena...</p>
      </div>
    );
  }

  return (
    <section className="relative py-16 px-6 sm:px-8 lg:px-16 bg-gradient-to-br from-gray-950 via-rose-950/20 to-black text-white overflow-hidden font-inter min-h-screen">
      {gameState?.status === "ended" && gameState.winner !== effectiveUserId && <PhagocytosisEffect trigger={true} />}
      {gameState?.status === "ended" && gameState.winner === effectiveUserId && (
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
        className="relative z-10 max-w-5xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={sectionVariants} className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold text-rose-400 flex items-center justify-center gap-3 font-poppins">
            <Zap className="w-8 h-8 text-cyan-400 animate-pulse" /> Multiplayer Bingo Arena
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto mt-4 font-inter">
            Battle players in the PETverse! Mark numbers, call Bingo, and win pooled JEWELS! <Link to="/vault" className="text-cyan-400 hover:underline">Manage vault</Link>.
          </p>
          <p className="text-sm text-cyan-400 italic mt-2 font-inter">
            🔐 Wallet: {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Not connected"} | 💎 JEWELS: {jewels}
          </p>
        </motion.div>

        <motion.div variants={sectionVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12 bg-gray-900/70 p-6 rounded-2xl border border-rose-500/30 backdrop-blur-md bg-gradient-to-r from-rose-500/20 to-cyan-500/20">
          <div className="flex flex-col">
            <label className="text-white font-semibold mb-2 font-poppins">Bet Amount</label>
            <select
              value={config.bet}
              onChange={(e) => setConfig({ ...config, bet: parseInt(e.target.value) })}
              className="bg-gray-800 text-white rounded-lg px-3 py-2 border border-cyan-500/20 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 outline-none font-inter"
              disabled={gameState?.status === "playing"}
            >
              {[100, 200, 500].map((b) => (
                <option key={b} value={b}>{b} JEWELS</option>
              ))}
            </select>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={config.useJewels}
              onChange={(e) => setConfig({ ...config, useJewels: e.target.checked })}
              className="mr-2"
              disabled={gameState?.status === "playing"}
            />
            <label className="text-white font-semibold font-poppins">Use JEWELS</label>
          </div>
        </motion.div>

        {gameState && (
          <motion.div variants={sectionVariants} className="mb-12">
            <SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}>
              <div className="relative bg-gray-900/70 p-8 rounded-2xl border border-rose-500/30 backdrop-blur-md bg-gradient-to-r from-rose-500/20 to-cyan-500/20">
                <div className="flex flex-wrap gap-3 justify-center mb-8">
                  <AnimatePresence>
                    {gameState.calledNumbers.slice(-12).map((number) => (
                      <motion.div
                        key={number}
                        className="w-12 h-12 rounded-full bg-rose-600 text-white font-bold flex items-center justify-center font-poppins"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {number}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
                {gameState.lastCalledNumber && (
                    <motion.p
                        className="text-center text-3xl font-bold text-cyan-400 mb-6 font-poppins"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={gameState.lastCalledNumber}
                    >
                        Last Called: {gameState.lastCalledNumber}
                    </motion.p>
                )}
                <div className="flex justify-center">
                  <Canvas style={{ height: "400px", width: "100%" }} camera={{ position: [0, 0, 15], fov: 50 }}>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} intensity={1} />
                    {effectiveUserId && gameState.players[effectiveUserId]?.card.cells.map((row: BingoCell[], rowIndex: number) =>
                      row.map((cell: BingoCell, colIndex: number) => (
                        <BingoBall
                          key={`${rowIndex}-${colIndex}`}
                          number={cell.number}
                          position={[(colIndex - 2) * 1.5, (2 - rowIndex) * 1.5, 0]}
                          isMarked={cell.marked}
                          onClick={() => handleMarkNumber(rowIndex, colIndex)}
                        />
                      ))
                    )}
                    <OrbitControls enablePan={false} enableZoom={false} />
                  </Canvas>
                </div>
                {gameState.status === "playing" && (
                  <motion.button
                    onClick={handleCallBingo}
                    className="mt-6 px-6 py-3 bg-rose-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 mx-auto font-poppins hover:bg-cyan-500"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Call Bingo"
                  >
                    <Trophy className="w-5 h-5 text-cyan-400 animate-pulse" /> Call Bingo!
                  </motion.button>
                )}
                {gameState.status === "ended" && gameState.winner === effectiveUserId && (
                  <motion.div
                    className="mt-6 text-xl text-cyan-400 font-bold text-center bg-black/80 px-6 py-3 rounded-lg font-poppins"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    🎉 You win the Bingo!
                  </motion.div>
                )}
                {gameState.status === "ended" && gameState.winner && gameState.winner !== effectiveUserId && (
                  <motion.div
                    className="mt-6 text-xl text-rose-400 font-bold text-center bg-black/80 px-6 py-3 rounded-lg font-poppins"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    ❌ {gameState.players[gameState.winner]?.name} wins!
                  </motion.div>
                )}
                {gameState.status === "ended" && !gameState.winner && (
                  <motion.div
                    className="mt-6 text-xl text-rose-400 font-bold text-center bg-black/80 px-6 py-3 rounded-lg font-poppins"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    ❌ No winner! Try again.
                  </motion.div>
                )}
                {gameState.status === "ended" && (
                    <motion.button
                        onClick={handlePlayAgain}
                        className="mt-6 px-6 py-3 bg-cyan-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 mx-auto font-poppins hover:bg-rose-500"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        aria-label="Play Again"
                    >
                        <RefreshCcw className="w-5 h-5 text-white animate-spin-slow" /> Play Again
                    </motion.button>
                )}
              </div>
            </SwytchErrorBoundary>
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
            <p className="text-cyan-400 font-inter">Highest Score: {stats.highestScore}</p>
            <p className="text-cyan-400 font-inter">Win Rate: {stats.totalGames > 0 ? ((stats.wins / stats.totalGames) * 100).toFixed(1) : 0}%</p>
          </div>
          <div className="relative bg-gray-900/70 border border-rose-500/30 p-6 rounded-2xl backdrop-blur-md bg-gradient-to-r from-rose-500/20 to-cyan-500/20">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2 font-poppins">
              <Users className="w-6 h-6 text-cyan-400 animate-pulse" /> Players
            </h3>
            {gameState && Object.entries(gameState.players).map(([playerId, player]) => (
              <p key={playerId} className="text-cyan-400 font-inter">
                {player.name}: {player.jewels} JEWELS {playerId === effectiveUserId ? "(You)" : ""} {player.isReady ? "(Ready)" : ""}
              </p>
            ))}
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
              aria-label="Share Bingo Win on X"
            >
              <MessageCircleHeart className="w-5 h-5 text-cyan-400" /> Share Win on X
            </motion.button>
          </div>
          <div className="relative bg-gray-900/70 border border-rose-500/30 p-6 rounded-2xl backdrop-blur-md bg-gradient-to-r from-rose-500/20 to-cyan-500/20">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2 font-poppins">
              <Star className="w-6 h-6 text-cyan-400 animate-pulse" /> Community Wins
            </h3>
            {mockXPosts.map((post, index) => (
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

        {gameState?.status === "waiting" && effectiveUserId && !gameState.players[effectiveUserId]?.isReady && (
            <motion.div variants={sectionVariants} className="text-center mb-12">
                <p className="text-gray-300 mb-4">You are in room: {gameState.roomId}. Waiting for more players to join or for you to start.</p>
                <motion.button
                    onClick={handleStartGame}
                    className="px-6 py-3 bg-rose-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 mx-auto font-poppins hover:bg-cyan-500"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Start Multiplayer Bingo"
                >
                    <Wallet className="w-5 h-5 text-cyan-400 animate-pulse" /> Start Game
                </motion.button>
            </motion.div>
        )}
        {gameState?.status === "waiting" && effectiveUserId && gameState.players[effectiveUserId]?.isReady && (
            <motion.div variants={sectionVariants} className="text-center mb-12">
                <p className="text-gray-300 mb-4">You are ready in room: {gameState.roomId}. Waiting for game to begin...</p>
            </motion.div>
        )}
        {!effectiveUserId && (
             <motion.div variants={sectionVariants} className="text-center mb-12">
                <p className="text-gray-300 mb-4">Please sign in to join the Bingo game!</p>
                <motion.button
                    onClick={() => setActiveModal("auth")}
                    className="px-6 py-3 bg-rose-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 mx-auto font-poppins hover:bg-cyan-500"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Sign In to Play"
                >
                    <User className="w-5 h-5 text-cyan-400" /> Sign In to Play
                </motion.button>
            </motion.div>
        )}


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
            <Modal title="Multiplayer Bingo Tutorial" onClose={() => setShowTutorial(false)}>
              <div className="text-gray-200 text-sm space-y-4 font-inter">
                <p>Objective: Compete with players to complete a row, column, or diagonal first!</p>
                <ul className="list-disc pl-6">
                  <li>Select bet amount (100–500 JEWELS).</li>
                  <li>Join a game room and wait for players.</li>
                  <li>Numbers are called every 2 seconds. Click 3D balls to mark them.</li>
                  <li>Call Bingo when you complete a pattern to win the pooled bets!</li>
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
              setIsPETMember={setIsPETMember}
              updatePlayerFirestore={updatePlayerFirestore}
            />
          )}
          {activeModal === "error" && (
            <Modal title="Error" onClose={() => setActiveModal(null)}>
              <div className="space-y-4">
                <p className="text-rose-400 font-inter">An error occurred. Please try again.</p>
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

        <audio ref={winSoundRef} src="/audio/reward.mp3" preload="auto" />

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

export default BingoGame;
function mockBackendLogTransaction(_arg0: string, _rewardAmount: any, _arg2: string, _arg3: string, _userId: string) {
  throw new Error("Function not implemented.");
}

function mockBackendStartGame(_effectiveUserId: string, _bet: number, _useJewels: boolean) {
  throw new Error("Function not implemented.");
}

