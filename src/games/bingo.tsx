import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text, Sphere } from "@react-three/drei";
import { Wallet, Zap, Trophy, Users, Star, Sparkles, MessageCircleHeart } from "lucide-react";
import { useAccount } from "wagmi";
import { doc, getDoc, collection, addDoc, onSnapshot, serverTimestamp, getDocs, QueryDocumentSnapshot, setDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebaseConfig";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useNavigate, Link } from "react-router-dom";
import { useModal } from '@/context/ModalContext';
import Modal from "@/components/SwytchModal";
import AuthModal from "@/components/AuthModal";
import PaymentModal from "@/components/PaymentModal";
import SwytchErrorBoundary from "@/components/ErrorBoundaryComponent";
import ConfettiExplosion from "react-confetti-explosion";

interface BingoCell {
  number: number;
  marked: boolean;
}

interface BingoCard {
  cells: BingoCell[][];
  playerId: string;
}

interface GameState {
  roomId: string;
  players: { [playerId: string]: { name: string; jewels: number; card: BingoCard } };
  calledNumbers: number[];
  status: "waiting" | "playing" | "ended";
  winner: string | null;
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

const useDebounce = <T extends (...args: any[]) => void>(callback: T, delay: number) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => callback(...args), delay);
    },
    [callback, delay]
  );
};

interface BingoGameProps {
  userId: string | null;
  setIsPETMember: React.Dispatch<React.SetStateAction<boolean>>;
  updatePlayerFirestore: (updates: Partial<any>) => Promise<void>;
}

const BingoGame: React.FC<BingoGameProps> = ({ userId, setIsPETMember, updatePlayerFirestore }) => {
  const { user: firebaseAuthUser, loading: authLoading } = useAuthUser();
  const { address } = useAccount();
  const { setActiveModal, setShowMessage } = useModal();
  const [config, setConfig] = useState<GameConfig>({ bet: 100, useJewels: true });
  const [jewels, setJewels] = useState<number>(0);
  const [stats, setStats] = useState<Stats>({ wins: 0, losses: 0, totalGames: 0, highestScore: 0 });
  const [quests, setQuests] = useState<Quest[]>(initialQuests);
  const [achievements, setAchievements] = useState<Achievement[]>(initialAchievements);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [showReward, setShowReward] = useState<Reward | null>(null);
  const [showTutorial, setShowTutorial] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const callIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const winSoundRef = useRef<HTMLAudioElement | null>(null);
  const navigate = useNavigate();

  const effectiveUserId = userId ?? (address ? address.toLowerCase() : firebaseAuthUser?.uid ?? null);

  const saveStateToFirestore = useDebounce(async (state: { jewels?: number; quests?: Quest[]; achievements?: Achievement[]; bingoWins?: number; bingoLosses?: number; bingoHighestScore?: number }) => {
    if (!effectiveUserId) {
      setShowMessage("⚠️ Please sign in to play.");
      setActiveModal("auth");
      navigate("/auth");
      return;
    }
    try {
      await updatePlayerFirestore(state);
    } catch (err) {
      console.error("Failed to save state:", err);
      setShowMessage("⚠️ Failed to save data.");
      setActiveModal("error");
    }
  }, 500);

  const logTransaction = useCallback(async (type: "deposit" | "withdraw", amount: number) => {
    if (!effectiveUserId) return;
    try {
      const transactionId = `${effectiveUserId}_${Date.now()}`;
      await addDoc(collection(db, "Transactions"), {
        transactionId,
        userId: effectiveUserId,
        amount,
        currency: config.useJewels ? "JEWELS" : "USDT",
        transactionType: type,
        status: "pending",
        timestamp: serverTimestamp(),
        game: "bingo",
        adminId: "0CfobCbXnPZsJwT662H4OhDrXk33",
      });
      setShowMessage(`✅ ${type === "deposit" ? "Win" : "Bet"} of ${amount} ${config.useJewels ? "JEWELS" : "USDT"} submitted! Admin (0CfobCbXnPZsJwT662H4OhDrXk33) will process.`);
    } catch (err) {
      console.error("Error logging transaction:", err);
      setShowMessage("⚠️ Failed to log transaction.");
      setActiveModal("error");
    }
  }, [effectiveUserId, config.useJewels, setShowMessage, setActiveModal]);

  useEffect(() => {
    if (!effectiveUserId) {
      setShowTutorial(true);
      setShowMessage("⚠️ Please sign in to play!");
      setActiveModal("auth");
      navigate("/auth");
      setIsLoading(false);
      return;
    }

    const joinRoom = async () => {
      setIsLoading(true);
      try {
        const userRef = doc(db, "Players", effectiveUserId);
        const userSnap = await getDoc(userRef);
        const data = userSnap.exists() ? userSnap.data() : {};

        if (data.jewels !== undefined) setJewels(data.jewels || 0);
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

        const roomsRef = collection(db, "GameRooms");
        const roomsSnap = await getDocs(roomsRef);
        let roomId = roomsSnap.docs.find((doc: QueryDocumentSnapshot) => doc.data().status === "waiting")?.id;
        if (!roomId) {
          const newRoomRef = await addDoc(roomsRef, {
            status: "waiting",
            players: { [effectiveUserId]: { name: address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Player", jewels: data.jewels || 0, card: createBingoCard() } },
            calledNumbers: [],
            winner: null,
            createdAt: serverTimestamp(),
          });
          roomId = newRoomRef.id;
        } else {
          await setDoc(doc(db, "GameRooms", roomId), {
            players: { [effectiveUserId]: { name: address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Player", jewels: data.jewels || 0, card: createBingoCard() } },
          }, { merge: true });
        }

        const roomRef = doc(db, "GameRooms", roomId);
        const unsubscribe = onSnapshot(roomRef, (doc) => {
          if (doc.exists()) {
            setGameState(doc.data() as GameState);
            if (doc.data().status === "playing" && !callIntervalRef.current) {
              startNumberCalling(roomId);
            }
          }
        });

        return () => unsubscribe();
      } catch (err) {
        console.error("Failed to join room:", err);
        setShowMessage("⚠️ Failed to join game room.");
        setActiveModal("error");
        setIsLoading(false);
      }
    };

    joinRoom().finally(() => setIsLoading(false));
  }, [effectiveUserId, setShowMessage, setActiveModal, navigate, setIsPETMember, address]);

  useEffect(() => {
    saveStateToFirestore({
      jewels,
      quests,
      achievements,
      bingoWins: stats.wins,
      bingoLosses: stats.losses,
      bingoHighestScore: stats.highestScore,
    });
  }, [jewels, quests, achievements, stats, saveStateToFirestore]);

  useEffect(() => {
    if (showReward) {
      const timer = setTimeout(() => setShowReward(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [showReward]);

  useEffect(() => {
    winSoundRef.current = new Audio("/audio/reward.mp3");
    return () => {
      if (callIntervalRef.current) clearInterval(callIntervalRef.current);
    };
  }, []);

  const createBingoCard = (): BingoCard => {
    const ranges = [
      { min: 1, max: 15 },
      { min: 16, max: 30 },
      { min: 31, max: 45 },
      { min: 46, max: 60 },
      { min: 61, max: 75 },
    ];
    const cells: BingoCell[][] = Array(5)
      .fill(null)
      .map(() => Array(5).fill(null).map(() => ({ number: 0, marked: false })));

    ranges.forEach((range, col) => {
      const availableNumbers = Array.from({ length: range.max - range.min + 1 }, (_, i) => range.min + i);
      for (let row = 0; row < 5; row++) {
        if (col === 2 && row === 2) {
          cells[row][col] = { number: 0, marked: true };
          continue;
        }
        const randomIndex = Math.floor(Math.random() * availableNumbers.length);
        cells[row][col] = { number: availableNumbers[randomIndex], marked: false };
        availableNumbers.splice(randomIndex, 1);
      }
    });

    return { cells, playerId: effectiveUserId ?? "" };
  };

  const isWinningPattern = (card: BingoCard): boolean => {
    const { cells } = card;
    for (let row = 0; row < 5; row++) {
      if (cells[row].every((cell) => cell.marked)) return true;
    }
    for (let col = 0; col < 5; col++) {
      if (cells.every((row) => row[col].marked)) return true;
    }
    if (cells.every((row, i) => row[i].marked)) return true;
    if (cells.every((row, i) => row[4 - i].marked)) return true;
    return false;
  };

  const startNumberCalling = (roomId: string): void => {
    const interval = 2000;
    let availableNumbers = Array.from({ length: 75 }, (_, i) => i + 1);
    let callCount = 0;
    callIntervalRef.current = setInterval(async () => {
      if (availableNumbers.length === 0 || !gameState || gameState.status !== "playing") {
        if (callIntervalRef.current) clearInterval(callIntervalRef.current);
        await setDoc(doc(db, "GameRooms", roomId), { status: "ended", winner: null }, { merge: true });
        setStats((prev) => ({
          ...prev,
          losses: prev.losses + 1,
          totalGames: prev.totalGames + 1,
        }));
        return;
      }
      const randomIndex = Math.floor(Math.random() * availableNumbers.length);
      const number = availableNumbers[randomIndex];
      availableNumbers.splice(randomIndex, 1);
      await setDoc(doc(db, "GameRooms", roomId), { calledNumbers: [...gameState.calledNumbers, number] }, { merge: true });
      callCount++;
      if (callCount === 35) {
        if (callIntervalRef.current) clearInterval(callIntervalRef.current);
        await setDoc(doc(db, "GameRooms", roomId), { status: "ended", winner: null }, { merge: true });
        setStats((prev) => ({
          ...prev,
          losses: prev.losses + 1,
          totalGames: prev.totalGames + 1,
        }));
      }
    }, interval);
  };

  const markNumber = async (roomId: string, row: number, col: number): Promise<void> => {
    if (!gameState || gameState.status !== "playing" || !effectiveUserId) return;
    const playerCard = gameState.players[effectiveUserId]?.card;
    if (!playerCard) return;
    const cell = playerCard.cells[row][col];
    if (cell.marked || !gameState.calledNumbers.includes(cell.number)) return;

    const newCard = { ...playerCard, cells: playerCard.cells.map((r) => [...r]) };
    newCard.cells[row][col].marked = true;
    await setDoc(doc(db, "GameRooms", roomId), {
      players: { ...gameState.players, [effectiveUserId]: { ...gameState.players[effectiveUserId], card: newCard } },
    }, { merge: true });

    const lineQuest = quests.find((q) => q.id === "bingo-lines");
    if (lineQuest && !lineQuest.completed) {
      const newProgress = Math.min(lineQuest.progress + 1, lineQuest.goal);
      const isQuestCompleted = newProgress >= lineQuest.goal;
      setQuests((prev) =>
        prev.map((q) => (q.id === "bingo-lines" ? { ...q, progress: newProgress, completed: isQuestCompleted } : q))
      );
      if (isQuestCompleted) {
        setJewels((prev) => prev + lineQuest.rewardJEWELS);
        setShowReward({ jewels: lineQuest.rewardJEWELS, xp: lineQuest.rewardXP, message: `Quest Completed: ${lineQuest.title}!` });
        await logTransaction("deposit", lineQuest.rewardJEWELS);
        await updatePlayerFirestore({ quests, jewels: jewels + lineQuest.rewardJEWELS });
        if (winSoundRef.current) winSoundRef.current.play().catch((err) => console.error("Audio playback failed:", err));
      }
    }
  };

  const callBingo = async (roomId: string): Promise<void> => {
    if (!gameState || gameState.status !== "playing" || !effectiveUserId) return;
    const playerCard = gameState.players[effectiveUserId]?.card;
    if (!playerCard) return;

    if (isWinningPattern(playerCard)) {
      const winnings = config.bet * Object.keys(gameState.players).length;
      setGameState({ ...gameState, status: "ended", winner: effectiveUserId });
      await setDoc(doc(db, "GameRooms", roomId), { status: "ended", winner: effectiveUserId }, { merge: true });
      const newStats = {
        wins: stats.wins + 1,
        losses: stats.losses,
        totalGames: stats.totalGames + 1,
        highestScore: Math.max(stats.highestScore, gameState.calledNumbers.length),
      };
      setStats(newStats);
      setJewels((prev) => prev + winnings);
      await logTransaction("deposit", winnings);
      setShowReward({ jewels: winnings, xp: 10, message: `Bingo! You won +${winnings} JEWELS!` });
      if (winSoundRef.current) winSoundRef.current.play().catch((err) => console.error("Audio playback failed:", err));

      const achievement = achievements.find((a) => a.id === "bingo-master");
      if (achievement && !achievement.unlocked && newStats.wins >= 10) {
        setAchievements((prev) => prev.map((a) => (a.id === "bingo-master" ? { ...a, unlocked: true } : a)));
        setJewels((prev) => prev + 20);
        setShowReward({ jewels: 20, xp: 30, message: "Achievement Unlocked: Bingo Master!" });
        await logTransaction("deposit", 20);
        await updatePlayerFirestore({ achievements, jewels: jewels + 20 });
        if (winSoundRef.current) winSoundRef.current.play().catch((err) => console.error("Audio playback failed:", err));
      }
      await updatePlayerFirestore({ jewels: jewels + winnings, bingoWins: newStats.wins, bingoLosses: newStats.losses, bingoHighestScore: newStats.highestScore });

      const playQuest = quests.find((q) => q.id === "bingo-play");
      if (playQuest && !playQuest.completed) {
        const newProgress = Math.min(playQuest.progress + 1, playQuest.goal);
        const isQuestCompleted = newProgress >= playQuest.goal;
        setQuests((prev) =>
          prev.map((q) => (q.id === "bingo-play" ? { ...q, progress: newProgress, completed: isQuestCompleted } : q))
        );
        if (isQuestCompleted) {
          setJewels((prev) => prev + playQuest.rewardJEWELS);
          setShowReward({ jewels: playQuest.rewardJEWELS, xp: playQuest.rewardXP, message: `Quest Completed: ${playQuest.title}!` });
          await logTransaction("deposit", playQuest.rewardJEWELS);
          await updatePlayerFirestore({ quests, jewels: jewels + playQuest.rewardJEWELS });
          if (winSoundRef.current) winSoundRef.current.play().catch((err) => console.error("Audio playback failed:", err));
        }
      }
    } else {
      setShowMessage("⚠️ No Bingo yet. Keep marking!");
      setActiveModal("error");
    }
  };

  const shareWinOnX = async (): Promise<void> => {
    if (!effectiveUserId) {
      setShowMessage("⚠️ Please sign in to share.");
      setActiveModal("auth");
      navigate("/auth");
      return;
    }
    const shareQuest = quests.find((q) => q.id === "bingo-share");
    if (shareQuest && !shareQuest.completed) {
      const shareText = encodeURIComponent("Just won a multiplayer Bingo in Swytch PETverse! 🔥 Join at swytch.io! #SwytchPETverse #Bingo");
      window.open(`https://x.com/intent/tweet?text=${shareText}`, "_blank");
      setQuests((prev) => prev.map((q) => (q.id === "bingo-share" ? { ...q, progress: 1, completed: true } : q)));
      setJewels((prev) => prev + shareQuest.rewardJEWELS);
      setShowReward({ jewels: shareQuest.rewardJEWELS, xp: shareQuest.rewardXP, message: `Quest Completed: ${shareQuest.title}!` });
      await logTransaction("deposit", shareQuest.rewardJEWELS);
      await updatePlayerFirestore({ quests, jewels: jewels + shareQuest.rewardJEWELS });
      if (winSoundRef.current) winSoundRef.current.play().catch((err) => console.error("Audio playback failed:", err));
    }
  };

  const startGame = async (roomId: string): Promise<void> => {
    if (!effectiveUserId) {
      setShowMessage("⚠️ Please sign in to play.");
      setActiveModal("auth");
      navigate("/auth");
      return;
    }
    if (config.useJewels && jewels < config.bet) {
      setShowMessage("⚠️ Not enough JEWELS! Please deposit.");
      setActiveModal("payment");
      navigate("/vault");
      return;
    }
    if (!config.useJewels) {
      setShowMessage("ℹ️ Initiating USDT payment... Admin (0CfobCbXnPZsJwT662H4OhDrXk33) will process.");
      setActiveModal("payment");
      await logTransaction("withdraw", config.bet);
      navigate("/vault");
      return;
    }
    await logTransaction("withdraw", config.bet);
    await setDoc(doc(db, "GameRooms", roomId), { status: "playing" }, { merge: true });
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-gray-950 font-inter">
        <p>Loading Multiplayer Bingo Arena...</p>
      </div>
    );
  }

  return (
    <section className="relative py-16 px-6 sm:px-8 lg:px-16 bg-gradient-to-br from-gray-950 via-rose-950/20 to-black text-white overflow-hidden font-inter">
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
            <SwytchErrorBoundary>
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
                <div className="flex justify-center">
                  <Canvas style={{ height: "400px" }} camera={{ position: [0, 0, 15], fov: 50 }}>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} intensity={1} />
                    {effectiveUserId && gameState.players[effectiveUserId]?.card.cells.map((row: BingoCell[], rowIndex: number) =>
                      row.map((cell: BingoCell, colIndex: number) => (
                        <BingoBall
                          key={`${rowIndex}-${colIndex}`}
                          number={cell.number}
                          position={[(colIndex - 2) * 1.5, (2 - rowIndex) * 1.5, 0]}
                          isMarked={cell.marked}
                          onClick={() => markNumber(gameState.roomId, rowIndex, colIndex)}
                        />
                      ))
                    )}
                    <OrbitControls enablePan={false} enableZoom={false} />
                  </Canvas>
                </div>
                {gameState.status === "playing" && (
                  <motion.button
                    onClick={() => callBingo(gameState.roomId)}
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
                {player.name}: {player.jewels} JEWELS
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
            {mockXPosts.map((post, _) => (
              <div key={post.timestamp} className="mb-2">
                <p className="text-sm font-semibold text-white font-poppins">{post.username}</p>
                <p className="text-sm text-gray-300 font-inter">{post.content}</p>
                <p className="text-xs text-gray-400 font-inter">
                  <Star className="w-4 h-4 inline mr-1 text-cyan-400" /> {post.likes} likes • {new Date(post.timestamp).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {gameState?.status === "waiting" && (
          <motion.div variants={sectionVariants} className="text-center mb-12">
            <motion.button
              onClick={() => startGame(gameState.roomId)}
              className="px-6 py-3 bg-rose-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 mx-auto font-poppins hover:bg-cyan-500"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Start Multiplayer Bingo"
            >
              <Wallet className="w-5 h-5 text-cyan-400 animate-pulse" /> Start Game
            </motion.button>
          </motion.div>
        )}

        <motion.div variants={sectionVariants} className="text-center mb-12">
          <motion.button
            onClick={() => setShowTutorial(true)}
            className="px-6 py-3 bg-rose-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 mx-auto font-poppins hover:bg-cyan-500"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Show Bingo Tutorial"
          >
            <Users className="w-5 h-5 text-cyan-400 animate-pulse" /> Show Tutorial
          </motion.button>
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
            onClick={() => setShowMessage('🌟 Navigating to Benefits!')}
            role="button"
            aria-label="Navigate to Benefits Page"
          >
            Benefits
          </Link>
          <Link
            to="/community"
            className="inline-block bg-rose-600 text-white px-6 py-3 rounded-full font-poppins hover:bg-cyan-500 ml-4"
            onClick={() => setShowMessage('👥 Navigating to Community!')}
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
          {setActiveModal && (
            <AuthModal
              title="Sign In"
              onClose={() => {
                setActiveModal(null);
                setShowMessage("");
              }}
              setShowMessage={setShowMessage}
            />
          )}
          {setActiveModal && (
            <PaymentModal
              userId={effectiveUserId}
              title="Wallet"
              onClose={() => {
                setActiveModal(null);
                setShowMessage("");
              }}
              setShowMessage={setShowMessage}
              setIsPETMember={setIsPETMember}
              updatePlayerFirestore={updatePlayerFirestore}
            />
          )}
          {setActiveModal && (
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