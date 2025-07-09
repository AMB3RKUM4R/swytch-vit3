import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { Box, Text } from "@react-three/drei";
import { Wallet, Zap, Trophy, Users, Star, MessageCircleHeart, RefreshCcw, X, Dices, Sparkles } from "lucide-react";
import { useAccount } from "wagmi";
import { doc, getDoc, collection, addDoc, onSnapshot, serverTimestamp, getDocs, QueryDocumentSnapshot, setDoc, runTransaction } from "firebase/firestore";
import { db, auth } from "../lib/firebaseConfig"; // Corrected path
import { useAuthUser } from "../hooks/useAuthUser"; // Corrected path
import { useNavigate, Link } from "react-router-dom";
import { useModal } from '../context/ModalContext'; // Corrected path
import Modal from "../components/SwytchModal"; // Corrected path
import AuthModal from "../components/AuthModal"; // Corrected path
import PaymentModal from "../components/PaymentModal"; // Corrected path
import SwytchErrorBoundary from "../components/ErrorBoundaryComponent"; // Corrected path
import ConfettiExplosion from "react-confetti-explosion";
import { Transaction, PaymentModalProps } from "../lib/types"; // Import types for Transaction and PaymentModalProps

// --- Type Definitions ---
type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
type Value = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

interface Card {
  suit: Suit;
  value: Value;
  numericValue: number; // Added numericValue to the Card interface
}

interface Bet {
  amount: number;
  won: boolean;
  payout: number;
  result: string;
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

interface GameRoom {
  deck: Card[];
  dealerHand: Card[];
  playerHands: { [userId: string]: { hand: Card[]; bet: number; won: boolean; payout: number } };
  phase: 'IDLE' | 'PLAYING' | 'RESULT';
  activePlayer: string | null;
  result: string;
  players: string[];
  game: string;
  roomId: string; // Added roomId to GameRoom interface
}

interface Reward {
  jewels: number;
  xp: number;
  message: string;
}

// Removed local declaration of SwytchErrorBoundaryProps as it's assumed to be defined
// and potentially exported from ErrorBoundaryComponent.tsx, or its props are directly
// passed as needed. This removes the 'is declared but never used' warning.


// --- Animation Variants ---
const sectionVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: "easeOut", type: 'spring', stiffness: 100 } },
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

// --- Initial Data ---
const initialQuests: Quest[] = [
  { id: "caribbeanStud-wins", title: "Win 3 Caribbean Stud Hands", progress: 0, goal: 3, rewardJEWELS: 10, rewardXP: 15, completed: false },
  { id: "caribbeanStud-play", title: "Play 5 Caribbean Stud Rounds", progress: 0, goal: 5, rewardJEWELS: 5, rewardXP: 10, completed: false },
  { id: "caribbeanStud-share", title: "Share Caribbean Stud Win on X", progress: 0, goal: 1, rewardJEWELS: 5, rewardXP: 5, completed: false },
];

const initialAchievements: Achievement[] = [
  { id: "caribbeanStud-master", title: "Caribbean Stud Master", description: "Win 10 multiplayer Caribbean Stud games.", unlocked: false },
];

const mockXPosts: { username: string; content: string; likes: number; timestamp: string }[] = [
  { username: "@PETversePlayer", content: "Crushed Caribbean Stud in Swytch PETverse! 🃏 #SwytchPETverse", likes: 100, timestamp: "2025-07-07T15:00:00Z" },
  { username: "@CryptoGamerX", content: "Caribbean Stud in PETverse is 🔥! Beat the dealer! #SwytchPET", likes: 140, timestamp: "2025-07-06T12:30:00Z" },
];

// Define a full deck with numeric values
const fullDeck: Card[] = (
  ['hearts', 'diamonds', 'clubs', 'spades'] as const
).flatMap(suit =>
  (['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'] as const).map(value => {
    const numericValue = value === 'A' ? 11 : (['J', 'Q', 'K'].includes(value) ? 10 : parseInt(value));
    return { suit, value, numericValue };
  })
);

const cardToEmoji = (card: Card): string => {
  const suitMap: { [key in Suit]: string } = { hearts: '♥', diamonds: '♦', clubs: '♣', spades: '♠' };
  return `${card.value}${suitMap[card.suit]}`;
};

const shuffleDeck = (seed: string): Card[] => {
  let hash = Array.from(seed).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const shuffled = [...fullDeck].sort(() => Math.sin(hash++) * 10000 % 1 - 0.5);
  return shuffled;
};

// --- 3D Card Component ---
const Card3D: React.FC<{ card: Card; position: [number, number, number]; onClick?: () => void }> = ({ card, position, onClick }) => {
  return (
    <group position={position} onClick={onClick}>
      <Box args={[0.8, 1.2, 0.05]} castShadow>
        <meshStandardMaterial color="#ffffff" roughness={0.3} metalness={0.2} />
      </Box>
      <Text position={[0, 0, 0.06]} fontSize={0.3} color="#f43f5e" anchorX="center" anchorY="middle">
        {cardToEmoji(card)} {/* Ensure cardToEmoji receives a Card object */}
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
  return useCallback(
    (..._args: Parameters<T>) => { // Use _args to suppress unused parameter warning
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => callback(..._args), delay);
    },
    [callback, delay]
  );
};

interface CaribbeanStudGameProps {
  userId: string | null;
  setIsPETMember: React.Dispatch<React.SetStateAction<boolean>>;
  updatePlayerFirestore: (updates: Partial<any>) => Promise<void>;
}

const CaribbeanStudGame: React.FC<CaribbeanStudGameProps> = ({ userId, setIsPETMember, updatePlayerFirestore }) => {
  const { user: firebaseAuthUser, loading: authLoading } = useAuthUser();
  const { address } = useAccount();
  const { activeModal, setActiveModal, setShowMessage } = useModal();
  const [jewels, setJewels] = useState<number>(0);
  const [gold, setGold] = useState<number>(0);
  const [stats, setStats] = useState<Stats>({ plays: 0, wins: 0, losses: 0, biggestWin: 0 });
  const [quests, setQuests] = useState<Quest[]>(initialQuests);
  const [achievements, setAchievements] = useState<Achievement[]>(initialAchievements);
  const [showReward, setShowReward] = useState<Reward | null>(null);
  const [showTutorial, setShowTutorial] = useState<boolean>(false);
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'RESULT'>('IDLE');
  const [betAmount, setBetAmount] = useState<number>(10);
  const [useJewels, setUseJewels] = useState<boolean>(true);
  const [autoPlay, setAutoPlay] = useState<boolean>(false);
  const [, setBets] = useState<Bet[]>([]); // This state is not directly used for rendering, consider if needed
  const [gameRoom, setGameRoom] = useState<GameRoom | null>(null);
  const [gameRoomId, setGameRoomId] = useState<string | null>(null);
  const [players, setPlayers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const playSoundRef = useRef<HTMLAudioElement | null>(null);
  const winSoundRef = useRef<HTMLAudioElement | null>(null);
  // Removed modalRef since it was only used in the tutorial modal which is now handled by the Modal component.
  // const modalRef = useRef<HTMLDivElement | null>(null); 

  const navigate = useNavigate();

  const effectiveUserId = userId ?? (address ? address.toLowerCase() : firebaseAuthUser?.uid ?? null);

  // --- Simulated Backend Functions (for production, these would be Firebase Cloud Functions or an API) ---

  const mockBackendLogTransaction = async (type: "deposit" | "withdraw", amount: number, currency: string, game: string, userId: string, adminId: string = "0CfobCbXnPZsJwT662H4OhDrXk33") => {
    try {
      const transactionId = `${userId}_${Date.now()}`;
      await addDoc(collection(db, "transactions"), { // Use lowercase 'transactions'
        transactionId,
        userId,
        amount,
        currency,
        transactionType: type,
        status: "pending",
        timestamp: serverTimestamp(),
        game,
        adminId,
      });
      console.log(`[Backend Mock] Transaction logged: ${type} ${amount} ${currency} for ${userId}`);
    } catch (error) {
      console.error("[Backend Mock] Error logging transaction:", error);
      throw new Error("Failed to log transaction on backend.");
    }
  };

  const mockBackendPlayGame = async (roomId: string, userId: string, bet: number, useJewelsCurrency: boolean) => {
    try {
      const roomRef = doc(db, "GameRooms", roomId);
      const userRef = doc(db, "Players", userId);

      await runTransaction(db, async (transaction) => {
        const roomSnap = await transaction.get(roomRef);
        const userSnap = await transaction.get(userRef);

        if (!roomSnap.exists()) throw new Error("Game room not found.");
        if (!userSnap.exists()) throw new Error("Player data not found.");

        const roomData = roomSnap.data() as GameRoom;
        const userData = userSnap.data();

        if (roomData.phase !== 'IDLE') throw new Error("Game in progress.");
        if ((useJewelsCurrency && (userData?.jewels || 0) < bet) || (!useJewelsCurrency && (userData?.gold || 0) < bet)) {
          throw new Error(`Insufficient ${useJewelsCurrency ? "JEWELS" : "USDT"} balance.`);
        }

        // Deduct bet
        if (useJewelsCurrency) {
          transaction.update(userRef, { jewels: (userData?.jewels || 0) - bet });
          setJewels((prev) => prev - bet); // Update local state
        } else {
          transaction.update(userRef, { gold: (userData?.gold || 0) - bet });
          setGold((prev) => prev - bet); // Update local state
        }
        await mockBackendLogTransaction("withdraw", bet, useJewelsCurrency ? "JEWELS" : "USDT", "caribbean-stud", userId); // Game name updated

        // Deal cards and update game room state
        const newDeck = shuffleDeck(Date.now().toString());
        const playerHand: Card[] = newDeck.splice(0, 5); // Deal 5 cards for Caribbean Stud
        const dealerHand: Card[] = newDeck.splice(0, 5); // Deal 5 cards for dealer

        const updatedPlayerHands = { ...roomData.playerHands, [userId]: { hand: playerHand, bet: bet, won: false, payout: 0 } };

        transaction.update(roomRef, {
          deck: newDeck,
          dealerHand: dealerHand, // Set dealer's hand
          playerHands: updatedPlayerHands,
          phase: 'PLAYING',
          activePlayer: userId, // Set active player
          result: "",
        });

        setShowMessage("🃏 Game started! Dealing hands...");
        if (playSoundRef.current) playSoundRef.current.play().catch((err) => console.error("Audio playback failed:", err));

        // Simulate game result after a delay (this part would be complex backend logic)
        setTimeout(async () => {
          await runTransaction(db, async (innerTransaction) => {
            const currentRoomSnap = await innerTransaction.get(roomRef);
            if (!currentRoomSnap.exists()) return;
            const currentRoomData = currentRoomSnap.data() as GameRoom;

            const playerHandForRank = currentRoomData.playerHands[userId]?.hand || []; // Get player's hand
            const dealerHandForRank = currentRoomData.dealerHand || []; // Get dealer's hand

            // Simplified win/loss logic: random outcome
            const won = Math.random() < 0.5; // 50% chance to win
            const payout = won ? bet * 2 : 0;
            const resultMsg = won ? `You Win! (Random Win)` : `You Lose! (Random Loss)`;

            const finalPlayerHand = { ...currentRoomData.playerHands[userId], won, payout };
            const finalPlayerHands = { ...currentRoomData.playerHands, [userId]: finalPlayerHand };

            innerTransaction.update(roomRef, {
              dealerHand: dealerHandForRank, // Ensure dealer hand is revealed
              playerHands: finalPlayerHands,
              phase: 'RESULT',
              result: resultMsg,
            });

            // Update player stats and give rewards
            const currentUserSnap = await innerTransaction.get(userRef);
            const currentUserData = currentUserSnap.data();
            if (!currentUserData) return;

            const newStats = {
              plays: (currentUserData.caribbeanStudPlays || 0) + 1, // Updated stat name
              wins: won ? (currentUserData.caribbeanStudWins || 0) + 1 : (currentUserData.caribbeanStudWins || 0), // Updated stat name
              losses: won ? (currentUserData.caribbeanStudLosses || 0) : (currentUserData.caribbeanStudLosses || 0) + 1, // Updated stat name
              biggestWin: Math.max((currentUserData.caribbeanStudBiggestWin || 0), payout), // Updated stat name
            };
            innerTransaction.update(userRef, {
              caribbeanStudPlays: newStats.plays, // Updated stat name
              caribbeanStudWins: newStats.wins, // Updated stat name
              caribbeanStudLosses: newStats.losses, // Updated stat name
              caribbeanStudBiggestWin: newStats.biggestWin, // Updated stat name
              updatedAt: serverTimestamp(),
            });

            // Update local stats state
            setStats(newStats);

            if (payout > 0) {
              const rewardCurrency = useJewelsCurrency ? "JEWELS" : "USDT";
              innerTransaction.update(userRef, {
                jewels: useJewelsCurrency ? (currentUserData.jewels || 0) + payout : currentUserData.jewels,
                gold: !useJewelsCurrency ? (currentUserData.gold || 0) + payout : currentUserData.gold,
              });
              await mockBackendLogTransaction("deposit", payout, rewardCurrency, "caribbean-stud_win", userId); // Game name updated
              setShowReward({ jewels: payout, xp: 10, message: `Caribbean Stud! You won +${payout} ${rewardCurrency}!` }); // Game name updated
              if (winSoundRef.current) winSoundRef.current.play().catch((err) => console.error("Audio playback failed:", err));

              // Quest and Achievement updates
              let currentQuests = currentUserData.quests || initialQuests;
              const winQuest = currentQuests.find((q: Quest) => q.id === "caribbeanStud-wins"); // Updated quest ID
              if (winQuest && !winQuest.completed) {
                const newProgress = Math.min(winQuest.progress + 1, winQuest.goal);
                const isQuestCompleted = newProgress >= winQuest.goal;
                currentQuests = currentQuests.map((q: Quest) => (q.id === "caribbeanStud-wins" ? { ...q, progress: newProgress, completed: isQuestCompleted } : q)); // Updated quest ID
                innerTransaction.update(userRef, { quests: currentQuests });
                if (isQuestCompleted) {
                  const rewardAmount = winQuest.rewardJEWELS;
                  innerTransaction.update(userRef, { jewels: (currentUserData.jewels || 0) + rewardAmount });
                  setShowReward({ jewels: rewardAmount, xp: winQuest.rewardXP, message: `Quest Completed: ${winQuest.title}!` });
                  await mockBackendLogTransaction("deposit", rewardAmount, "JEWELS", "caribbean-stud_quest", userId); // Game name updated
                }
              }

              let currentAchievements = currentUserData.achievements || initialAchievements;
              const achievement = currentAchievements.find((a: Achievement) => a.id === "caribbeanStud-master"); // Updated achievement ID
              if (achievement && !achievement.unlocked && newStats.wins >= 10) {
                currentAchievements = currentAchievements.map((a: Achievement) => (a.id === "caribbeanStud-master" ? { ...a, unlocked: true } : a)); // Updated achievement ID
                innerTransaction.update(userRef, { achievements: currentAchievements });
                const achievementRewardJewels = 20;
                const achievementRewardXP = 30;
                innerTransaction.update(userRef, { jewels: (currentUserData.jewels || 0) + achievementRewardJewels });
                setShowReward({ jewels: achievementRewardJewels, xp: achievementRewardXP, message: "Achievement Unlocked: Caribbean Stud Master!" });
                await mockBackendLogTransaction("deposit", achievementRewardJewels, "JEWELS", "caribbean-stud_achievement", userId); // Game name updated
              }
            } else {
              setShowMessage(`😔 No win. ${resultMsg}`);
            }

            // Update play quest regardless of win/loss
            let currentQuestsForPlay = currentUserData.quests || initialQuests; // Re-fetch or pass updated quests
            const playQuest = currentQuestsForPlay.find((q: Quest) => q.id === "caribbeanStud-play"); // Updated quest ID
            if (playQuest && !playQuest.completed) {
              const newProgress = Math.min(playQuest.progress + 1, playQuest.goal);
              const isQuestCompleted = newProgress >= playQuest.goal;
              currentQuestsForPlay = currentQuestsForPlay.map((q: Quest) => (q.id === "caribbeanStud-play" ? { ...q, progress: newProgress, completed: isQuestCompleted } : q)); // Updated quest ID
              innerTransaction.update(userRef, { quests: currentQuestsForPlay });
              if (isQuestCompleted) {
                const rewardAmount = playQuest.rewardJEWELS;
                innerTransaction.update(userRef, { jewels: (currentUserData.jewels || 0) + rewardAmount });
                setShowReward({ jewels: rewardAmount, xp: playQuest.rewardXP, message: `Quest Completed: ${playQuest.title}!` });
                await mockBackendLogTransaction("deposit", rewardAmount, "JEWELS", "caribbean-stud_quest", userId); // Game name updated
              }
            }

            // Reset game room for next round if autoPlay is enabled
            if (autoPlay) {
              setTimeout(async () => {
                await setDoc(roomRef, {
                  deck: shuffleDeck((Date.now() + 2).toString()),
                  dealerHand: [],
                  playerHands: {},
                  phase: 'IDLE',
                  activePlayer: null,
                  result: "",
                  game: "caribbean-stud",
                }, { merge: true });
                setGameState('IDLE'); // Update local state for UI
                setShowMessage("Starting new round automatically...");
                setTimeout(() => mockBackendPlayGame(roomId, userId, bet, useJewelsCurrency), 1000); // Start next game
              }, 2500);
            }
          });
        }, 2000); // Simulate game duration
      });
    } catch (error: any) {
      console.error("[Backend Mock] Error playing game:", error);
      setShowMessage(`⚠️ Game failed: ${error.message}`);
      setActiveModal("error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartGame = async () => {
    if (!effectiveUserId || !gameRoomId) {
      setShowMessage("⚠️ Please sign in and ensure a game room is available.");
      setActiveModal("auth");
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
      return;
    }

    setIsLoading(true);
    try {
      await mockBackendPlayGame(gameRoomId, effectiveUserId, betAmount, useJewels);
    } catch (error) {
      // Error handled in mockBackendPlayGame
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayAgain = async () => {
    if (!effectiveUserId || !gameRoomId) {
      setShowMessage("⚠️ Please sign in and ensure a game room is available.");
      setActiveModal("auth");
      return;
    }
    setIsLoading(true);
    try {
      // Reset game room for next round
      const roomRef = doc(db, "GameRooms", gameRoomId);
      await setDoc(roomRef, {
        deck: shuffleDeck(Date.now().toString()),
        dealerHand: [],
        playerHands: {}, // Clear all player hands
        phase: 'IDLE',
        activePlayer: null,
        result: "",
        game: "caribbean-stud",
      }, { merge: true });
      setGameState('IDLE'); // Update local state for UI
      setShowMessage("Game reset. Ready for a new round!");
    } catch (error) {
      console.error("Error resetting game:", error);
      setShowMessage("⚠️ Failed to reset game. Please try again.");
      setActiveModal("error");
    } finally {
      setIsLoading(false);
    }
  };

  const shareWinOnX = async (event: React.MouseEvent<HTMLButtonElement>): Promise<void> => {
    event.preventDefault();
    if (!effectiveUserId) {
      setShowMessage("⚠️ Please sign in to share.");
      setActiveModal("auth");
      return;
    }
    const shareQuest = quests.find((q: Quest) => q.id === "caribbeanStud-share"); // Explicitly type q
    if (shareQuest && !shareQuest.completed) {
      const shareText = encodeURIComponent("Just won a Caribbean Stud game in Swytch PETverse! 🃏 Join at swytch.io! #SwytchPETverse #CaribbeanStud");
      window.open(`https://x.com/intent/tweet?text=${shareText}`, "_blank");
      setQuests((prev) => prev.map((q) => (q.id === "caribbeanStud-share" ? { ...q, progress: 1, completed: true } : q)));
      setJewels((prev) => prev + shareQuest.rewardJEWELS);
      setShowReward({ jewels: shareQuest.rewardJEWELS, xp: shareQuest.rewardXP, message: `Quest Completed: ${shareQuest.title}!` });
      await mockBackendLogTransaction("deposit", shareQuest.rewardJEWELS, "JEWELS", "caribbeanStud_share_quest", effectiveUserId); // Updated game name
      await updatePlayerFirestore({ quests, jewels: jewels + shareQuest.rewardJEWELS });
      if (winSoundRef.current) winSoundRef.current.play().catch((err) => console.error("Audio playback failed:", err));
    }
  };


  useEffect(() => {
    if (!effectiveUserId) {
      setShowTutorial(true);
      setShowMessage("⚠️ Please sign in to play!");
      setActiveModal("auth");
      setIsLoading(false);
      return;
    }

    const fetchUserDataAndListenToRooms = async () => {
      setIsLoading(true);
      try {
        const userRef = doc(db, "Players", effectiveUserId);
        const userSnap = await getDoc(userRef);
        const data = userSnap.exists() ? userSnap.data() : {};

        setJewels(data.jewels || 0);
        setGold(data.gold || 0);
        setIsPETMember(data.isPETMember || false);
        const mergedQuests = initialQuests.map((initialQuest) => {
          const savedQuest = data.quests?.find((q: Quest) => q.id === initialQuest.id); // Explicitly type q
          return savedQuest && initialQuest.goal === savedQuest.goal ? savedQuest : initialQuest;
        });
        setQuests(mergedQuests);
        setAchievements(data.achievements?.filter((a: Achievement) => initialAchievements.some((ia) => ia.id === a.id)) || initialAchievements);
        setStats({
          plays: data.caribbeanStudPlays || 0,
          wins: data.caribbeanStudWins || 0,
          losses: data.caribbeanStudLosses || 0,
          biggestWin: data.caribbeanStudBiggestWin || 0,
        });

        const roomsQuery = collection(db, "GameRooms");
        const unsubscribeRooms = onSnapshot(roomsQuery, (snapshot) => {
          let foundRoom: GameRoom | null = null;
          snapshot.forEach((docSnap) => {
            const roomData = docSnap.data() as GameRoom;
            // Check if player is already in a caribbean-stud room or if there's a waiting caribbean-stud room to join
            if (roomData.game === "caribbean-stud" && roomData.players && effectiveUserId in roomData.players) {
              foundRoom = { ...roomData, roomId: docSnap.id };
            } else if (roomData.game === "caribbean-stud" && roomData.phase === "IDLE" && Object.keys(roomData.playerHands).length < 4) { // Max 4 players for Caribbean Stud
              foundRoom = { ...roomData, roomId: docSnap.id };
            }
          });

          if (foundRoom) {
            // As per user request: if any Caribbean Stud room is found, redirect to homepage.
            // WARNING: This will prevent the Caribbean Stud game from being played if any room exists.
            // If the intent is to play, this logic needs to be reverted or re-designed.
            navigate('/'); // Redirect to homepage
            setShowMessage("A Caribbean Stud game room was found, redirecting to homepage.");
            setGameRoom(null); // Clear game state
            setGameRoomId(null);
            setIsLoading(false); // Ensure loading is off
          } else {
            setGameRoom(null); // No active or joinable room
            setGameRoomId(null);
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

    fetchUserDataAndListenToRooms();
  }, [effectiveUserId, setShowMessage, setActiveModal, navigate, setIsPETMember, address]);

  useEffect(() => {
    // This useEffect is for saving player stats, quests, achievements etc.
    // It should be debounced to prevent too many writes.
    const debouncedSave = setTimeout(() => {
      if (effectiveUserId) {
        updatePlayerFirestore({
          jewels,
          gold,
          quests,
          achievements,
          caribbeanStudPlays: stats.plays, // Updated stat name
          caribbeanStudWins: stats.wins, // Updated stat name
          caribbeanStudLosses: stats.losses, // Updated stat name
          caribbeanStudBiggestWin: stats.biggestWin, // Updated stat name
        }).catch((err) => {
          console.error("Failed to save state:", err);
          setShowMessage("⚠️ Failed to save data.");
          setActiveModal("error");
        });
      }
    }, 1000); // Debounce for 1 second

    return () => clearTimeout(debouncedSave);
  }, [jewels, gold, stats, quests, achievements, effectiveUserId, updatePlayerFirestore, setShowMessage, setActiveModal]);


  useEffect(() => {
    if (showReward) {
      const timer = setTimeout(() => setShowReward(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [showReward]);

  useEffect(() => {
    // Corrected audio paths to match the root of your project
    playSoundRef.current = new Audio("/audio/reward.mp3"); // Assuming this is for generic game sounds
    winSoundRef.current = new Audio("/audio/reward.mp3"); // Assuming this is specifically for win sounds
    return () => {
      playSoundRef.current?.pause();
      winSoundRef.current?.pause();
    };
  }, []);


  if (authLoading || isLoading || !effectiveUserId) { // Added !effectiveUserId to loading check for initial state
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-gray-950 font-inter">
        <p>Loading Caribbean Stud Poker...</p>
      </div>
    );
  }

  return (
    <section className="relative py-16 px-6 sm:px-8 lg:px-16 bg-gradient-to-br from-gray-950 via-rose-950/20 to-black text-white overflow-hidden font-inter">
      {gameRoom?.phase === 'RESULT' && gameRoom.result.includes('You Win') && ( // Added null check for gameRoom
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
            <Dices className="w-8 h-8 text-cyan-400 animate-pulse" /> Caribbean Stud Poker
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto mt-4 font-inter">
            Beat the dealer in the multiplayer PETverse! Win up to 2x your bet! <Link to="/vault" className="text-cyan-400 hover:underline">Manage vault</Link>.
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
              disabled={gameRoom?.phase !== 'IDLE'}
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
                disabled={gameRoom?.phase !== 'IDLE'}
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
              disabled={gameRoom?.phase !== 'IDLE'}
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
              {gameRoom?.playerHands[playerId] ? `: ${gameRoom.playerHands[playerId].hand.length} cards` : ""}
              {gameRoom?.phase === 'RESULT' && gameRoom.playerHands[playerId]?.won ? " (Won)" : ""}
            </p>
          ))}
        </motion.div>

        <motion.div variants={sectionVariants} className="flex justify-between items-center mb-12 bg-gray-900/70 p-4 rounded-2xl border border-rose-500/30 backdrop-blur-md bg-gradient-to-r from-rose-500/20 to-cyan-500/20">
          <div className="text-lg text-white font-semibold font-poppins">
            JEWELS: <span className="text-cyan-400">{jewels}</span> | USDT: <span className="text-cyan-400">{gold}</span>
          </div>
          <motion.button
            onClick={handleStartGame}
            disabled={gameRoom?.phase !== 'IDLE'}
            className={gameRoom?.phase !== 'IDLE' ? "px-8 py-4 bg-gray-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 font-poppins cursor-not-allowed" : "px-8 py-4 bg-rose-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 font-poppins hover:bg-cyan-500"}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Play Caribbean Stud"
          >
            <Dices className="w-6 h-6 text-cyan-400 animate-pulse" /> Play Caribbean Stud
          </motion.button>
        </motion.div>

        <motion.div variants={sectionVariants} className="relative w-full h-[300px] mb-12 bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
          <SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}>
            <div className="absolute inset-0 bg-gradient-to-r from-rose-500/20 to-cyan-500/20 rounded-lg" />
            <div className="relative w-full flex flex-col items-center">
              {gameRoom?.phase === 'PLAYING' && (
                <motion.div className="text-4xl text-cyan-400 font-bold font-poppins" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.5 }}>
                  Dealing...
                </motion.div>
              )}
              {gameRoom?.phase !== 'PLAYING' && gameRoom?.playerHands && effectiveUserId && gameRoom.playerHands[effectiveUserId]?.hand.length > 0 && (
                <div className="flex flex-col items-center">
                  <div className="text-cyan-400 mb-1 font-poppins">Your Hand</div>
                  <div className="flex gap-2 mb-4">
                    {gameRoom.playerHands[effectiveUserId].hand.map((card, i) => (
                      <Card3D key={`${card.suit}-${card.value}-${i}`} card={card} position={[i * 1 - (gameRoom.playerHands[effectiveUserId].hand.length - 1) / 2, 0, 0]} />
                    ))}
                  </div>
                  <div className="text-cyan-400 mb-1 font-poppins">Dealer Hand</div>
                  <div className="flex gap-2 mb-4">
                    {gameRoom.dealerHand.map((card, i) => ( // Access dealerHand directly from gameRoom
                      <Card3D key={`dealer-${card.suit}-${card.value}-${i}`} card={card} position={[i * 1 - (gameRoom.dealerHand.length - 1) / 2, 0, 0]} />
                    ))}
                  </div>
                  <div className="text-cyan-400 mb-1 font-poppins">Other Players</div>
                  <div className="flex flex-wrap gap-2">
                    {players
                      .filter((pid) => pid !== effectiveUserId)
                      .map((pid, idx) =>
                        gameRoom?.playerHands[pid]?.hand.map((card, i) => (
                          <motion.div
                            key={`${pid}-${card.suit}-${card.value}-${i}`}
                            className="text-xl text-white bg-gray-700 rounded-lg h-12 w-12 flex items-center justify-center"
                            initial={{ x: 50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: (idx * (gameRoom?.playerHands[pid]?.hand.length || 0) + i) * 0.1 }}
                          >
                            {cardToEmoji(card)}
                          </motion.div>
                        ))
                      )}
                  </div>
                </div>
              )}
              {gameRoom?.result && (
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
          </SwytchErrorBoundary>
        </motion.div>

        {gameRoom?.phase === 'RESULT' && (
            <motion.div variants={sectionVariants} className="text-center mt-6">
                <motion.button
                    onClick={handlePlayAgain}
                    className="px-6 py-3 bg-cyan-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 mx-auto font-poppins hover:bg-rose-500"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Play Again"
                >
                    <RefreshCcw className="w-5 h-5 text-white animate-spin-slow" /> Play Again
                </motion.button>
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
              aria-label="Share Caribbean Stud Win on X"
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

        {!effectiveUserId && (
          <motion.div variants={sectionVariants} className="text-center mb-12">
            <p className="text-gray-300 mb-4">Please sign in to play Caribbean Stud Poker!</p>
            <motion.button
              onClick={() => setActiveModal("auth")}
              className="px-6 py-3 bg-rose-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 mx-auto font-poppins hover:bg-cyan-500"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Sign In to Play"
            >
              <Users className="w-5 h-5 text-cyan-400" /> Sign In to Play
            </motion.button>
          </motion.div>
        )}

        {effectiveUserId && !gameRoom && !isLoading && (
          <motion.div variants={sectionVariants} className="text-center mb-12">
            <p className="text-gray-300 mb-4">You are not in an active Caribbean Stud game. Would you like to start a new one?</p>
            <motion.button
              onClick={handleStartGame}
              className="px-6 py-3 bg-rose-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 mx-auto font-poppins hover:bg-cyan-500"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Start New Caribbean Stud Game"
            >
              <Wallet className="w-5 h-5 text-cyan-400 animate-pulse" /> Start New Game
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
            <Modal title="Multiplayer Caribbean Stud Tutorial" onClose={() => setShowTutorial(false)}>
              <div className="text-gray-200 text-sm space-y-4 font-inter">
                <p><b>Objective:</b> Beat the dealer's 5-card poker hand in a multiplayer game.</p>
                <ul className="list-disc pl-6">
                  <li>Bet 10–1000 JEWELS or USDT.</li>
                  <li>You and other players get 5 cards; dealer gets 5 cards.</li>
                  <li>Win 2x your bet if your hand ranks higher (Royal Flush, Straight, etc.).</li>
                  <li>Auto-play continues games until disabled.</li>
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

export default CaribbeanStudGame;
