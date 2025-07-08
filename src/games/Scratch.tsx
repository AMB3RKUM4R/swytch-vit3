import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useEffect, useRef } from 'react';
import { Dices, Trophy, Users, Sparkles, Star, MessageCircleHeart, X } from 'lucide-react';
import { doc, getDoc, onSnapshot, setDoc, collection, addDoc, serverTimestamp, getDocs, QueryDocumentSnapshot } from 'firebase/firestore';
import { db, auth } from '@/lib/firebaseConfig';
import { useNavigate, Link } from 'react-router-dom';
import { useModal } from '@/context/ModalContext';
import { useAuthUser } from '@/hooks/useAuthUser';
import { useAccount } from 'wagmi';
import { Canvas } from '@react-three/fiber';
import { Box, Text } from '@react-three/drei';
import Modal from '@/components/SwytchModal';
import AuthModal from '@/components/AuthModal';
import PaymentModal from '@/components/PaymentModal';
import SwytchErrorBoundary from '@/components/ErrorBoundaryComponent';
import ConfettiExplosion from 'react-confetti-explosion';

interface Bet {
  amount: number;
  won: boolean;
  payout: number;
  result: string[];
}

interface Stats {
  plays: number;
  wins: number;
  losses: number;
  biggestWin: number;
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

interface Paytable {
  [key: string]: number;
}

interface GameRoom {
  paytable: Paytable;
  playerCards: { [userId: string]: { cards: string[]; bet: number; won: boolean; payout: number; result: string } };
  phase: 'IDLE' | 'PLAYING' | 'RESULT';
  result: string;
  players: string[];
  game: string;
}

interface Reward {
  jewels: number;
  xp: number;
  message: string;
}

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


const paytable: Paytable = {
  '💰': 2,
  '⭐': 10,
  '🔔': 20,
  '🍒': 50,
  '7️⃣': 100,
  '💎': 500,
  '🐾': 1000, // Jackpot
};

const symbols = Object.keys(paytable);

const generateScratchCard = (seed: string): string[] => {
  let hash = Array.from(seed).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return Array(9)
    .fill(0)
    .map(() => symbols[Math.abs(Math.floor(Math.sin(hash++) * 10000)) % symbols.length]);
};

const getScratchPayout = (card: string[], paytable: Paytable, bet: number): { payout: number; result: string } => {
  const counts: Record<string, number> = {};
  card.forEach((sym) => {
    counts[sym] = (counts[sym] || 0) + 1;
  });
  let maxSymbol = '';
  let maxCount = 0;
  for (const sym in counts) {
    if (counts[sym] > maxCount) {
      maxCount = counts[sym];
      maxSymbol = sym;
    }
  }
  if (maxCount >= 3 && paytable[maxSymbol]) {
    const payout = bet * paytable[maxSymbol];
    const result = `Win! ${maxCount} ${maxSymbol} (x${paytable[maxSymbol]})`;
    return { payout, result };
  }
  return { payout: 0, result: 'No win' };
};

const ScratchCard3D: React.FC<{ symbol: string; index: number; scratched: boolean; onScratch: () => void }> = ({ symbol, index, scratched, onScratch }) => {
  return (
    <group position={[index % 3 - 1, -(Math.floor(index / 3) - 1), 0]} onClick={onScratch}>
      <Box args={[0.8, 0.8, 0.05]} castShadow>
        <meshStandardMaterial color={scratched ? "#22d3ee" : "#ffffff"} roughness={0.3} metalness={0.2} />
      </Box>
      <Text position={[0, 0, 0.06]} fontSize={0.3} color="#ffffff" anchorX="center" anchorY="middle">
        {scratched ? symbol : '🂠'}
      </Text>
    </group>
  );
};

const initialQuests: Quest[] = [
  { id: "scratchCards-wins", title: "Win 3 Scratch Cards", progress: 0, goal: 3, rewardJEWELS: 10, rewardXP: 15, completed: false },
  { id: "scratchCards-play", title: "Play 5 Scratch Cards", progress: 0, goal: 5, rewardJEWELS: 5, rewardXP: 10, completed: false },
  { id: "scratchCards-share", title: "Share Scratch Cards Win on X", progress: 0, goal: 1, rewardJEWELS: 5, rewardXP: 5, completed: false },
];

const initialAchievements: Achievement[] = [
  { id: "scratchCards-master", title: "Scratch Cards Master", description: "Win 10 multiplayer Scratch Cards games.", unlocked: false },
];

const mockXPosts: { username: string; content: string; likes: number; timestamp: string }[] = [
  { username: "@PETversePlayer", content: "Hit the jackpot on Scratch Cards in Swytch PETverse! 🎫 #SwytchPETverse", likes: 140, timestamp: "2025-07-08T16:30:00Z" },
  { username: "@CryptoGamerX", content: "Scratching my way to victory in PETverse! Join now! #SwytchPET", likes: 180, timestamp: "2025-07-07T15:45:00Z" },
];

interface ScratchCardsGameProps {
  userId: string | null;
  setIsPETMember: React.Dispatch<React.SetStateAction<boolean>>;
  updatePlayerFirestore: (updates: Partial<any>) => Promise<void>;
}

const ScratchCardsGame: React.FC<ScratchCardsGameProps> = ({ userId, setIsPETMember, updatePlayerFirestore }) => {
  const { user: firebaseAuthUser, loading: authLoading } = useAuthUser();
  const { address } = useAccount();
  const { setActiveModal, setShowMessage } = useModal();
  const [jewels, setJewels] = useState<number>(0);
  const [gold, setGold] = useState<number>(0);
  const [stats, setStats] = useState<Stats>({ plays: 0, wins: 0, losses: 0, biggestWin: 0 });
  const [quests, setQuests] = useState<Quest[]>(initialQuests);
  const [achievements, setAchievements] = useState<Achievement[]>(initialAchievements);
  const [showReward, setShowReward] = useState<Reward | null>(null);
  const [showTutorial, setShowTutorial] = useState<boolean>(false);
  const [gameRoom, setGameRoom] = useState<GameRoom | null>(null);
  const [gameRoomId, setGameRoomId] = useState<string | null>(null);
  const [players, setPlayers] = useState<string[]>([]);
  const [betAmount, setBetAmount] = useState<number>(10);
  const [useJewels, setUseJewels] = useState<boolean>(true);
  const [autoPlay, setAutoPlay] = useState<boolean>(false);
  const [bets, setBets] = useState<Bet[]>([]);
  const [scratchedCards, setScratchedCards] = useState<boolean[]>(Array(9).fill(false));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const playSoundRef = useRef<HTMLAudioElement | null>(null);
  const winSoundRef = useRef<HTMLAudioElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);
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
          const savedQuest = data.quests?.find((q: Quest) => q.id === initialQuest.id);
          return savedQuest && initialQuest.goal === savedQuest.goal ? savedQuest : initialQuest;
        });
        setQuests(mergedQuests);
        setAchievements(data.achievements?.filter((a: Achievement) => initialAchievements.some((ia) => ia.id === a.id)) || initialAchievements);
        setStats({
          plays: data.scratchCardsPlays || 0,
          wins: data.scratchCardsWins || 0,
          losses: data.scratchCardsLosses || 0,
          biggestWin: data.scratchCardsBiggestWin || 0,
        });

        const roomsRef = collection(db, "GameRooms");
        const roomsSnap = await getDocs(roomsRef);
        let roomId = roomsSnap.docs.find((doc: QueryDocumentSnapshot) => doc.data().phase === "IDLE" && doc.data().game === "scratch-cards")?.id;
        if (!roomId) {
          const newRoomRef = await addDoc(roomsRef, {
            game: "scratch-cards",
            paytable,
            playerCards: {},
            phase: 'IDLE',
            result: "",
            players: [effectiveUserId],
          });
          roomId = newRoomRef.id;
        } else {
          await setDoc(doc(db, "GameRooms", roomId), {
            players: [...(roomsSnap.docs.find((doc) => doc.id === roomId)?.data().players || []), effectiveUserId],
          }, { merge: true });
        }
        setGameRoomId(roomId);

        const roomRef = doc(db, "GameRooms", roomId);
        const unsubscribe = onSnapshot(roomRef, (doc) => {
          if (doc.exists()) {
            const data = doc.data() as GameRoom;
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
    playSoundRef.current = new Audio("/audio/reward.mp3");
    winSoundRef.current = new Audio("/audio/reward.mp3");
    return () => {
      playSoundRef.current?.pause();
      winSoundRef.current?.pause();
    };
  }, [effectiveUserId, setShowMessage, setActiveModal, navigate, setIsPETMember]);

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
        scratchCardsPlays: stats.plays,
        scratchCardsWins: stats.wins,
        scratchCardsLosses: stats.losses,
        scratchCardsBiggestWin: stats.biggestWin,
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
      await addDoc(collection(db, "Transactions"), {
        transactionId,
        userId: effectiveUserId,
        amount,
        currency: useJewels ? "JEWELS" : "USDT",
        transactionType: type,
        status: "pending",
        timestamp: serverTimestamp(),
        game: "scratch-cards",
        adminId: "0CfobCbXnPZsJwT662H4OhDrXk33",
      });
      setShowMessage(`✅ ${type === "deposit" ? "Win" : "Bet"} of ${amount} ${useJewels ? "JEWELS" : "USDT"} submitted! Admin (0CfobCbXnPZsJwT662H4OhDrXk33) will process.`);
    } catch (err) {
      console.error("Error logging transaction:", err);
      setShowMessage("⚠️ Failed to log transaction.");
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
    const shareQuest = quests.find((q) => q.id === "scratchCards-share");
    if (shareQuest && !shareQuest.completed) {
      const shareText = encodeURIComponent("Just hit big on Scratch Cards in Swytch PETverse! 🎫 Join at swytch.io! #SwytchPETverse #ScratchCards");
      window.open(`https://x.com/intent/tweet?text=${shareText}`, "_blank");
      setQuests((prev) => prev.map((q) => (q.id === "scratchCards-share" ? { ...q, progress: 1, completed: true } : q)));
      setJewels((prev) => prev + shareQuest.rewardJEWELS);
      setShowReward({ jewels: shareQuest.rewardJEWELS, xp: shareQuest.rewardXP, message: `Quest Completed: ${shareQuest.title}!` });
      await logTransaction("deposit", shareQuest.rewardJEWELS);
      await updatePlayerFirestore({ quests, jewels: jewels + shareQuest.rewardJEWELS });
      if (winSoundRef.current) winSoundRef.current.play().catch((err) => console.error("Audio playback failed:", err));
    }
  };

  const playGame = async (): Promise<void> => {
    if (!effectiveUserId || !gameRoomId) {
      setShowMessage("⚠️ Please sign in to play!");
      setActiveModal("auth");
      navigate("/auth");
      return;
    }
    if (gameRoom?.phase !== 'IDLE') {
      setShowMessage("⚠️ Game in progress!");
      setActiveModal("error");
      return;
    }
    if (betAmount < 10 || betAmount > 1000) {
      setShowMessage("⚠️ Bet amount must be between 10 and 1000!");
      setActiveModal("error");
      return;
    }
    if ((useJewels && jewels < betAmount) || (!useJewels && gold < betAmount)) {
      setShowMessage(`⚠️ Not enough ${useJewels ? "JEWELS" : "USDT"}! Please deposit.`);
      setActiveModal("payment");
      navigate("/vault");
      return;
    }
    const roomRef = doc(db, "GameRooms", gameRoomId);
    const roomSnap = await getDoc(roomRef);
    if (!roomSnap.exists()) return;
    const roomData = roomSnap.data() as GameRoom;
    if (roomData.phase !== 'IDLE') return;

    const newCards = generateScratchCard(Date.now().toString());
    const { payout, result } = getScratchPayout(newCards, paytable, betAmount);
    const won = payout > 0;
    const updatedPlayerCards = {
      ...roomData.playerCards,
      [effectiveUserId]: { cards: newCards, bet: betAmount, won, payout, result },
    };
    await setDoc(roomRef, {
      playerCards: updatedPlayerCards,
      phase: 'PLAYING',
      result,
      game: "scratch-cards",
    }, { merge: true });

    if (useJewels) {
      setJewels((prev) => prev - betAmount);
    } else {
      setGold((prev) => prev - betAmount);
    }
    await logTransaction("withdraw", betAmount);
    setBets((prev) => [...prev, { amount: betAmount, won, payout, result: newCards }].slice(-5));
    setScratchedCards(Array(9).fill(false));
    if (playSoundRef.current) {
      playSoundRef.current.play().catch((err) => console.error("Audio playback failed:", err));
    }

    setTimeout(async () => {
      await setDoc(roomRef, { phase: 'RESULT', result }, { merge: true });
      const newStats = {
        plays: stats.plays + 1,
        wins: won ? stats.wins + 1 : stats.wins,
        losses: won ? stats.losses : stats.losses + 1,
        biggestWin: Math.max(stats.biggestWin, payout),
      };
      setStats(newStats);
      if (payout > 0) {
        if (useJewels) {
          setJewels((prev) => prev + payout);
        } else {
          setGold((prev) => prev + payout);
        }
        await logTransaction("deposit", payout);
        setShowReward({ jewels: payout, xp: 10, message: `Scratch Cards! You won +${payout} ${useJewels ? "JEWELS" : "USDT"}! ${result}` });
        if (winSoundRef.current) {
          winSoundRef.current.play().catch((err) => console.error("Audio playback failed:", err));
        }

        const winQuest = quests.find((q) => q.id === "scratchCards-wins");
        if (winQuest && !winQuest.completed) {
          const newProgress = Math.min(winQuest.progress + 1, winQuest.goal);
          const isQuestCompleted = newProgress >= winQuest.goal;
          setQuests((prev) =>
            prev.map((q) => (q.id === "scratchCards-wins" ? { ...q, progress: newProgress, completed: isQuestCompleted } : q))
          );
          if (isQuestCompleted) {
            setJewels((prev) => prev + winQuest.rewardJEWELS);
            setShowReward({ jewels: winQuest.rewardJEWELS, xp: winQuest.rewardXP, message: `Quest Completed: ${winQuest.title}!` });
            await logTransaction("deposit", winQuest.rewardJEWELS);
            await updatePlayerFirestore({ quests, jewels: jewels + winQuest.rewardJEWELS });
            if (winSoundRef.current) winSoundRef.current.play().catch((err) => console.error("Audio playback failed:", err));
          }
        }

        const achievement = achievements.find((a) => a.id === "scratchCards-master");
        if (achievement && !achievement.unlocked && newStats.wins >= 10) {
          setAchievements((prev) => prev.map((a) => (a.id === "scratchCards-master" ? { ...a, unlocked: true } : a)));
          setJewels((prev) => prev + 20);
          setShowReward({ jewels: 20, xp: 30, message: "Achievement Unlocked: Scratch Cards Master!" });
          await logTransaction("deposit", 20);
          await updatePlayerFirestore({ achievements, jewels: jewels + 20 });
          if (winSoundRef.current) winSoundRef.current.play().catch((err) => console.error("Audio playback failed:", err));
        }
      } else {
        setShowReward({ jewels: 0, xp: 0, message: `😔 ${result}` });
      }

      const playQuest = quests.find((q) => q.id === "scratchCards-play");
      if (playQuest && !playQuest.completed) {
        const newProgress = Math.min(playQuest.progress + 1, playQuest.goal);
        const isQuestCompleted = newProgress >= playQuest.goal;
        setQuests((prev) =>
          prev.map((q) => (q.id === "scratchCards-play" ? { ...q, progress: newProgress, completed: isQuestCompleted } : q))
        );
        if (isQuestCompleted) {
          setJewels((prev) => prev + playQuest.rewardJEWELS);
          setShowReward({ jewels: playQuest.rewardJEWELS, xp: playQuest.rewardXP, message: `Quest Completed: ${playQuest.title}!` });
          await logTransaction("deposit", playQuest.rewardJEWELS);
          await updatePlayerFirestore({ quests, jewels: jewels + playQuest.rewardJEWELS });
          if (winSoundRef.current) winSoundRef.current.play().catch((err) => console.error("Audio playback failed:", err));
        }
      }

      await updatePlayerFirestore({
        scratchCardsPlays: newStats.plays,
        scratchCardsWins: newStats.wins,
        scratchCardsLosses: newStats.losses,
        scratchCardsBiggestWin: newStats.biggestWin,
      });

      if (autoPlay) {
        setTimeout(async () => {
          await setDoc(roomRef, { playerCards: {}, phase: 'IDLE', result: "", game: "scratch-cards" }, { merge: true });
          setScratchedCards(Array(9).fill(false));
          setTimeout(playGame, 1000);
        }, 2500);
      }
    }, 2000);
  };

  const handleScratch = (index: number) => {
    if (gameRoom?.phase !== 'PLAYING' || !gameRoom?.playerCards[effectiveUserId!]) return;
    setScratchedCards((prev) => {
      const newScratched = [...prev];
      newScratched[index] = true;
      return newScratched;
    });
    if (playSoundRef.current) {
      playSoundRef.current.play().catch((err) => console.error("Audio playback failed:", err));
    }
  };

  if (authLoading || isLoading || !gameRoom) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-gray-950 font-inter">
        <p>Loading Scratch Cards...</p>
      </div>
    );
  }

  return (
    <section className="relative py-16 px-6 sm:px-8 lg:px-16 bg-gradient-to-br from-gray-950 via-rose-950/20 to-black text-white overflow-hidden font-inter">
      {gameRoom.phase === 'RESULT' && gameRoom.playerCards[effectiveUserId!]?.won && (
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
            <Dices className="w-8 h-8 text-cyan-400 animate-pulse" /> Scratch Cards
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto mt-4 font-inter">
            Scratch to match symbols and win big in the multiplayer PETverse Scratch Cards! <Link to="/vault" className="text-cyan-400 hover:underline">Manage vault</Link>.
          </p>
          <p className="text-sm text-cyan-400 italic mt-2 font-inter">
            🔐 Wallet: {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Not connected"} | 💎 JEWELS: {jewels} | 🪙 USDT: {gold}
          </p>
        </motion.div>

        <motion.div variants={sectionVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12 bg-gray-900/70 p-6 rounded-2xl border border-rose-500/30 backdrop-blur-md bg-gradient-to-r from-rose-500/20 to-cyan-500/20">
          <div className="flex flex-col">
            <label className="text-white font-semibold mb-2 font-poppins">Bet Amount</label>
            <select
              value={betAmount}
              onChange={(e) => setBetAmount(Number(e.target.value))}
              className="bg-gray-800 text-white rounded-lg px-3 py-2 border border-cyan-500/20 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 outline-none font-inter"
              disabled={gameRoom.phase !== 'IDLE'}
            >
              {[10, 50, 100, 250, 500, 1000].map((b) => (
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
                disabled={gameRoom.phase !== 'IDLE'}
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
              disabled={gameRoom.phase !== 'IDLE'}
            />
            <label className="text-white font-semibold font-poppins">Auto-Play</label>
          </div>
        </motion.div>

        <motion.div variants={sectionVariants} className="mb-12 bg-gray-900/70 p-4 rounded-2xl border border-rose-500/30 backdrop-blur-md bg-gradient-to-r from-rose-500/20 to-cyan-500/20">
          <h3 className="text-xl text-white font-bold mb-3 font-poppins flex items-center gap-2">
            <Users className="w-6 h-6 text-cyan-400 animate-pulse" /> Players
          </h3>
          {players.map((playerId, _) => (
            <p key={playerId} className="text-cyan-400 font-inter">
              {address && playerId === address.toLowerCase() ? `${address.slice(0, 6)}...${address.slice(-4)}` : `Player ${playerId.slice(0, 6)}...${playerId.slice(-4)}`}
              {gameRoom.playerCards[playerId] ? `: ${gameRoom.playerCards[playerId].cards.length} cards` : ""}
              {gameRoom.phase === 'RESULT' && gameRoom.playerCards[playerId]?.won ? " (Won)" : ""}
            </p>
          ))}
        </motion.div>

        <motion.div variants={sectionVariants} className="flex justify-between items-center mb-12 bg-gray-900/70 p-4 rounded-2xl border border-rose-500/30 backdrop-blur-md bg-gradient-to-r from-rose-500/20 to-cyan-500/20">
          <div className="text-lg text-white font-semibold font-poppins">
            JEWELS: <span className="text-cyan-400">{jewels}</span> | USDT: <span className="text-cyan-400">{gold}</span>
          </div>
          <motion.button
            onClick={playGame}
            disabled={gameRoom.phase !== 'IDLE'}
            className={gameRoom.phase !== 'IDLE' ? "px-8 py-4 bg-gray-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 font-poppins cursor-not-allowed" : "px-8 py-4 bg-rose-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 font-poppins hover:bg-cyan-500"}
            whileHover={{ scale: gameRoom.phase !== 'IDLE' ? 1 : 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Scratch Card"
          >
            <Dices className="w-6 h-6 text-cyan-400 animate-pulse" /> Scratch 🎫
          </motion.button>
        </motion.div>

        <motion.div variants={sectionVariants} className="relative w-full h-[300px] mb-12 bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
          <SwytchErrorBoundary>
            <div className="absolute inset-0 bg-gradient-to-r from-rose-500/20 to-cyan-500/20 rounded-lg" />
            <div className="relative w-full flex flex-col items-center">
              {gameRoom.phase === 'PLAYING' && !gameRoom.playerCards[effectiveUserId!]?.cards.length && (
                <motion.div className="text-4xl text-cyan-400 font-bold font-poppins" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.5 }}>
                  Scratching...
                </motion.div>
              )}
              {(gameRoom.phase === 'PLAYING' || gameRoom.phase === 'RESULT') && gameRoom.playerCards[effectiveUserId!]?.cards.length > 0 && (
                <div className="flex flex-col items-center">
                  <div className="text-cyan-400 mb-1 font-poppins">Your Card</div>
                  <SwytchErrorBoundary>
                    <Canvas style={{ height: "150px" }} camera={{ position: [0, 0, 5], fov: 50 }}>
                      <ambientLight intensity={0.5} />
                      <pointLight position={[10, 10, 10]} intensity={1} />
                      {gameRoom.playerCards[effectiveUserId!].cards.map((symbol, i) => (
                        <ScratchCard3D
                          key={`card-${i}`}
                          symbol={symbol}
                          index={i}
                          scratched={scratchedCards[i]}
                          onScratch={() => handleScratch(i)}
                        />
                      ))}
                    </Canvas>
                  </SwytchErrorBoundary>
                  <div className="text-cyan-400 mb-1 font-poppins mt-4">Other Players</div>
                  <div className="flex flex-wrap gap-2">
                    {players
                      .filter((pid) => pid !== effectiveUserId)
                      .map((pid) => (
                        <div key={pid} className="flex flex-col">
                          <p className="text-cyan-400 font-inter">Player {address && pid === address.toLowerCase() ? `${address.slice(0, 6)}...${address.slice(-4)}` : `${pid.slice(0, 6)}...${pid.slice(-4)}`}</p>
                          <SwytchErrorBoundary>
                            <Canvas style={{ height: "100px" }} camera={{ position: [0, 0, 5], fov: 50 }}>
                              <ambientLight intensity={0.5} />
                              <pointLight position={[10, 10, 10]} intensity={1} />
                              {gameRoom.playerCards[pid]?.cards.map((symbol, i) => (
                                <ScratchCard3D
                                  key={`${pid}-${i}`}
                                  symbol={symbol}
                                  index={i}
                                  scratched={true}
                                  onScratch={() => {}}
                                />
                              ))}
                            </Canvas>
                          </SwytchErrorBoundary>
                        </div>
                      ))}
                  </div>
                  {gameRoom.result && (
                    <motion.div
                      className="mt-4 text-cyan-400 text-xl font-poppins"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      {gameRoom.result}
                    </motion.div>
                  )}
                </div>
              )}
            </div>
          </SwytchErrorBoundary>
        </motion.div>

        <motion.div variants={sectionVariants} className="mb-12 bg-gray-900/70 p-6 rounded-2xl border border-rose-500/30 backdrop-blur-md bg-gradient-to-r from-rose-500/20 to-cyan-500/20">
          <h3 className="text-xl font-bold text-white mb-3 font-poppins">Paytable</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Object.entries(paytable).map(([symbol, multiplier]) => (
              <p key={symbol} className="text-cyan-400 font-inter">{symbol}: x{multiplier}</p>
            ))}
          </div>
        </motion.div>

        {bets.length > 0 && (
          <motion.div variants={sectionVariants} className="mb-12">
            <h3 className="text-xl text-white font-bold mb-3 font-poppins">Recent Bets</h3>
            {bets.slice(-5).map((bet, i) => (
              <p key={`bet-${i}`} className={bet.won ? "text-green-400 font-inter" : "text-white font-inter"}>
                Bet: {bet.amount} {useJewels ? "JEWELS" : "USDT"} {bet.won ? `(Won ${bet.payout} - ${bet.result.join(', ')})` : `(${bet.result.join(', ')})`}
              </p>
            ))}
          </motion.div>
        )}

        <motion.div variants={sectionVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
          <div className="relative bg-gray-900/70 border border-rose-500/30 p-6 rounded-2xl backdrop-blur-md bg-gradient-to-r from-rose-500/20 to-cyan-500/20">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2 font-poppins">
              <Trophy className="w-6 h-6 text-cyan-400 animate-pulse" /> Your Stats
            </h3>
            <p className="text-cyan-400 font-inter">Plays: {stats.plays}</p>
            <p className="text-cyan-400 font-inter">Wins: {stats.wins}</p>
            <p className="text-cyan-400 font-inter">Losses: {stats.losses}</p>
            <p className="text-cyan-400 font-inter">Biggest Win: {stats.biggestWin} {useJewels ? "JEWELS" : "USDT"}</p>
            <p className="text-cyan-400 font-inter">Win Rate: {stats.plays > 0 ? ((stats.wins / stats.plays) * 100).toFixed(1) : 0}%</p>
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
              aria-label="Share Scratch Cards Win on X"
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

        <motion.div variants={sectionVariants} className="text-center mb-12">
          <motion.button
            onClick={() => setShowTutorial(true)}
            className="px-6 py-3 bg-rose-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 mx-auto font-poppins hover:bg-cyan-500"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Show Scratch Cards Tutorial"
          >
            <Users className="w-5 h-5 text-cyan-400 animate-pulse" /> Show Tutorial
          </motion.button>
        </motion.div>

        <AnimatePresence>
          {showTutorial && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
              role="dialog"
              aria-modal="true"
              aria-label="Scratch Cards Tutorial Modal"
            >
              <motion.div
                ref={modalRef}
                className="bg-gray-900 rounded-2xl max-w-md w-full p-8 border border-rose-500/30 backdrop-blur-lg bg-gradient-to-r from-rose-500/20 to-cyan-500/20"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                transition={{ duration: 0.4 }}
                tabIndex={-1}
              >
                <motion.button
                  onClick={() => setShowTutorial(false)}
                  className="absolute top-4 right-4 text-cyan-400 hover:text-red-500"
                  whileHover={{ rotate: 90 }}
                  aria-label="Close tutorial modal"
                >
                  <X className="w-6 h-6" />
                </motion.button>
                <h3 className="text-xl font-bold text-cyan-400 mb-6 flex items-center gap-3 font-poppins">
                  <Users className="w-6 h-6 text-cyan-400 animate-pulse" /> Scratch Cards Tutorial
                </h3>
                <div className="text-gray-200 text-sm space-y-4 font-inter">
                  <p><b>Objective:</b> Scratch cards to match 3+ symbols for prizes in a multiplayer game.</p>
                  <ul className="list-disc pl-6">
                    <li>Bet 10–1000 JEWELS or USDT.</li>
                    <li>Click "Scratch" to reveal a 3x3 grid of symbols.</li>
                    <li>Click each cell to scratch and reveal symbols.</li>
                    <li>Match 3+ symbols for multipliers (2x–1000x). Auto-play continues games.</li>
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
              </motion.div>
            </motion.div>
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

        <audio ref={playSoundRef} src="/audio/reward.mp3" preload="auto" />
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

export default ScratchCardsGame;