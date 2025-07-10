import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { Box, Text } from "@react-three/drei";
import { Wallet, Zap, Trophy, Users, Star, Sparkles, MessageCircleHeart, RefreshCcw } from "lucide-react"; // Added RefreshCcw
import { useAccount } from "wagmi";
import { doc, getDoc, collection, addDoc, onSnapshot, serverTimestamp, setDoc, runTransaction } from "firebase/firestore"; // Added runTransaction
import { db, auth } from "../lib/firebaseConfig"; // Corrected path
import { useAuthUser } from "../hooks/useAuthUser"; // Corrected path
import { useNavigate, Link } from "react-router-dom";
import { useModal } from '../context/ModalContext'; // Corrected path
import Modal from "../components/SwytchModal"; // Corrected path
import AuthModal from "../components/AuthModal"; // Corrected path
import PaymentModal from "../components/PaymentModal"; // Corrected path
import SwytchErrorBoundary from "../components/ErrorBoundaryComponent"; // Corrected path
import ConfettiExplosion from "react-confetti-explosion";

// --- Type Definitions ---
interface Card {
  suit: string;
  value: string;
  numericValue: number;
}

interface PlayerHand {
  cards: Card[];
  total: number;
  status: "playing" | "bust" | "stand" | "blackjack";
}

interface BlackjackGameState {
  game: string;
  roomId: string;
  players: { [playerId: string]: { name: string; jewels: number; hand: PlayerHand } };
  dealerHand: PlayerHand;
  status: "waiting" | "playing" | "ended";
  winner: string | null;
  deck: Card[]; // Added for simulated backend to manage
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
  { id: "blackjack-wins", title: "Win 3 Blackjack Hands", progress: 0, goal: 3, rewardJEWELS: 10, rewardXP: 15, completed: false },
  { id: "blackjack-play", title: "Play 5 Blackjack Rounds", progress: 0, goal: 5, rewardJEWELS: 5, rewardXP: 10, completed: false },
  { id: "blackjack-share", title: "Share Blackjack Win on X", progress: 0, goal: 1, rewardJEWELS: 5, rewardXP: 5, completed: false },
];

const initialAchievements: Achievement[] = [
  { id: "blackjack-master", title: "Blackjack Master", description: "Win 10 multiplayer Blackjack games.", unlocked: false },
];

const mockXPosts: { username: string; content: string; likes: number; timestamp: string }[] = [
  { username: "@PETversePlayer", content: "Nailed a Blackjack in Swytch PETverse! 🃏 #SwytchPETverse", likes: 90, timestamp: "2025-07-05T12:00:00Z" },
  { username: "@CryptoGamerX", content: "Blackjack in PETverse is 🔥! Beat the dealer! #SwytchPET", likes: 110, timestamp: "2025-07-04T10:15:00Z" },
];

// --- 3D Card Component ---
const Card3D: React.FC<{ card: Card; position: [number, number, number]; onClick?: () => void }> = ({ card, position, onClick }) => {
  return (
    <group position={position} onClick={onClick}>
      <Box args={[0.8, 1.2, 0.05]} castShadow>
        <meshStandardMaterial color="#ffffff" roughness={0.3} metalness={0.2} />
      </Box>
      <Text position={[0, 0, 0.06]} fontSize={0.3} color="#f43f5e" anchorX="center" anchorY="middle">
        {card.value} {card.suit}
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

// --- Main Blackjack Game Component ---
interface BlackjackGameProps {
  userId: string | null;
  setIsPETMember: React.Dispatch<React.SetStateAction<boolean>>;
  updatePlayerFirestore: (updates: Partial<any>) => Promise<void>;
}

const BlackjackGame: React.FC<BlackjackGameProps> = ({ userId, setIsPETMember, updatePlayerFirestore }) => {
  const { user: firebaseAuthUser, loading: authLoading } = useAuthUser();
  const { address } = useAccount();
  const { activeModal, setActiveModal, setShowMessage } = useModal();
  const [config, setConfig] = useState<GameConfig>({ bet: 100, useJewels: true });
  const [jewels, setJewels] = useState<number>(0);
  const [stats, setStats] = useState<Stats>({ wins: 0, losses: 0, totalGames: 0, highestScore: 0 });
  const [quests, setQuests] = useState<Quest[]>(initialQuests);
  const [achievements, setAchievements] = useState<Achievement[]>(initialAchievements);
  const [gameState, setGameState] = useState<BlackjackGameState | null>(null);
  const [showReward, setShowReward] = useState<Reward | null>(null);
  const [showTutorial, setShowTutorial] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const dealerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const winSoundRef = useRef<HTMLAudioElement | null>(null);
  const navigate = useNavigate();

  // Determine the effective user ID for Firestore operations
  const effectiveUserId = userId ?? firebaseAuthUser?.uid ?? (address ? address.toLowerCase() : null);

  // --- Helper Functions for Game Logic (Simulated Backend) ---
  const createDeck = (): Card[] => {
    const suits = ["♠", "♥", "♣", "♦"];
    const values = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
    const deck: Card[] = [];
    suits.forEach((suit) => {
      values.forEach((value) => {
        const numericValue = value === "A" ? 11 : ["J", "Q", "K"].includes(value) ? 10 : parseInt(value);
        deck.push({ suit, value, numericValue });
      });
    });
    // Shuffle the deck
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  };

  const dealCard = (deck: Card[]): Card => {
    if (deck.length === 0) {
      // In a real game, you'd reshuffle or use multiple decks.
      // For this mock, let's just create a fresh deck to avoid errors.
      console.warn("Deck is empty, creating a new one for dealCard.");
      const newDeck = createDeck();
      return newDeck.pop()!; // Deal from the new deck
    }
    return deck.pop()!; // Remove and return the last card
  };

  const calculateHandTotal = (hand: Card[]): number => {
    let total = 0;
    let aces = 0;
    hand.forEach((card) => {
      total += card.numericValue;
      if (card.value === "A") aces++;
    });
    while (total > 21 && aces > 0) {
      total -= 10;
      aces--;
    }
    return total;
  };

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


  const mockBackendHit = async (roomId: string, userId: string) => {
    try {
      await runTransaction(db, async (transaction) => {
        const roomRef = doc(db, "GameRooms", roomId);
        const roomSnap = await transaction.get(roomRef);
        if (!roomSnap.exists()) throw new Error("Game room not found.");
        const currentGameState = roomSnap.data() as BlackjackGameState;
        const player = currentGameState.players[userId];
        if (!player || player.hand.status !== "playing") throw new Error("Invalid player or hand status.");

        const deck = currentGameState.deck; // Get deck from game state
        const newCard = dealCard(deck);
        player.hand.cards.push(newCard);
        player.hand.total = calculateHandTotal(player.hand.cards);
        if (player.hand.total > 21) player.hand.status = "bust";
        else if (player.hand.total === 21) player.hand.status = "stand"; // Automatically stand on 21

        transaction.update(roomRef, {
          [`players.${userId}.hand`]: player.hand,
          deck: deck, // Update deck in Firestore
        });
      });
      setShowMessage("🃏 You hit!");
    } catch (error: any) {
      console.error("[Backend Mock] Error hitting:", error);
      setShowMessage(`⚠️ Hit failed: ${error.message}`);
      setActiveModal("error");
    }
  };

  const mockBackendStand = async (roomId: string, userId: string) => {
    try {
      await runTransaction(db, async (transaction) => {
        const roomRef = doc(db, "GameRooms", roomId);
        const roomSnap = await transaction.get(roomRef);
        if (!roomSnap.exists()) throw new Error("Game room not found.");
        const currentGameState = roomSnap.data() as BlackjackGameState;
        const player = currentGameState.players[userId];
        if (!player || player.hand.status !== "playing") throw new Error("Invalid player or hand status.");

        player.hand.status = "stand";
        transaction.update(roomRef, { [`players.${userId}.hand`]: player.hand });
      });
      setShowMessage("🧍 You stand!");
    } catch (error: any) {
      console.error("[Backend Mock] Error standing:", error);
      setShowMessage(`⚠️ Stand failed: ${error.message}`);
      setActiveModal("error");
    }
  };

  const mockBackendDoubleDown = async (roomId: string, userId: string) => {
    try {
      await runTransaction(db, async (transaction) => {
        const roomRef = doc(db, "GameRooms", roomId);
        const userRef = doc(db, "Players", userId);
        const roomSnap = await transaction.get(roomRef);
        const userSnap = await transaction.get(userRef);

        if (!roomSnap.exists()) throw new Error("Game room not found.");
        if (!userSnap.exists()) throw new Error("Player not found.");

        const currentGameState = roomSnap.data() as BlackjackGameState;
        const player = currentGameState.players[userId];
        const playerData = userSnap.data();

        if (!player || player.hand.status !== "playing" || player.hand.cards.length !== 2) throw new Error("Cannot double down.");
        if (playerData.jewels < config.bet) throw new Error("Not enough JEWELS for double down.");

        // Deduct double bet
        transaction.update(userRef, { jewels: playerData.jewels - config.bet, updatedAt: serverTimestamp() });
        setJewels(playerData.jewels - config.bet); // Update client-side jewels
        await mockBackendLogTransaction("withdraw", config.bet, config.useJewels ? "JEWELS" : "USDT", "blackjack_doubledown", userId);

        const deck = currentGameState.deck;
        const newCard = dealCard(deck);
        player.hand.cards.push(newCard);
        player.hand.total = calculateHandTotal(player.hand.cards);
        player.hand.status = player.hand.total > 21 ? "bust" : "stand"; // Auto stand after double down hit

        transaction.update(roomRef, {
          [`players.${userId}.hand`]: player.hand,
          deck: deck,
        });
      });
      setShowMessage("📈 Doubled down!");
    } catch (error: any) {
      console.error("[Backend Mock] Error doubling down:", error);
      setShowMessage(`⚠️ Double down failed: ${error.message}`);
      setActiveModal("error");
    }
  };

  const mockBackendDetermineWinnerAndDistributeRewards = async (roomId: string) => {
    try {
      await runTransaction(db, async (transaction) => {
        const roomRef = doc(db, "GameRooms", roomId);
        const roomSnap = await transaction.get(roomRef);
        if (!roomSnap.exists()) throw new Error("Game room not found.");
        const currentGameState = roomSnap.data() as BlackjackGameState;
        if (currentGameState.status !== "playing") return; // Only process if game is playing

        const dealerHand = currentGameState.dealerHand;
        let winnerId: string | null = null;
        let highestPlayerTotal = 0;

        // Find best player hand
        Object.entries(currentGameState.players).forEach(([, player]) => {
          if (player.hand.status !== "bust" && player.hand.total <= 21 && player.hand.total > highestPlayerTotal) {
            highestPlayerTotal = player.hand.total;
          }
        });

        if (dealerHand.status === "bust") {
          // Dealer busted, all non-busted players win
          Object.entries(currentGameState.players).forEach(([id, player]) => {
            if (player.hand.status !== "bust" && player.hand.total <= 21) {
              // Mark as winner if not busted
              if (!winnerId) winnerId = id; // Just take the first valid winner for now
              // Reward this player (transaction logic inside)
              handlePlayerWin(id, currentGameState, transaction);
            } else {
              handlePlayerLoss(id, currentGameState, transaction);
            }
          });
        } else {
          // Compare player hands to dealer's hand
          Object.entries(currentGameState.players).forEach(([id, player]) => {
            if (player.hand.status === "blackjack") { // Blackjack is automatic win
                handlePlayerWin(id, currentGameState, transaction);
                if (!winnerId) winnerId = id;
            } else if (player.hand.status === "bust") {
              handlePlayerLoss(id, currentGameState, transaction);
            } else if (player.hand.total > dealerHand.total) {
              handlePlayerWin(id, currentGameState, transaction);
              if (!winnerId) winnerId = id;
            } else if (player.hand.total === dealerHand.total) {
              // Push (tie), no win/loss, bet returned (handled by initial bet logic)
              setShowMessage(`Push with dealer for ${player.name}`);
            } else {
              handlePlayerLoss(id, currentGameState, transaction);
            }
          });
        }

        transaction.update(roomRef, { status: "ended", winner: winnerId });
        setShowMessage("Game ended! Results are in.");
      });
    } catch (error) {
      console.error("[Backend Mock] Error determining winner:", error);
      setShowMessage("⚠️ Failed to determine winner.");
      setActiveModal("error");
    }
  };

  const handlePlayerWin = async (playerId: string, gameState: BlackjackGameState, transaction: any) => {
    const winnings = config.bet * 2; // Standard Blackjack payout (1:1 win + original bet back)
    const userRef = doc(db, "Players", playerId);
    const userSnap = await transaction.get(userRef);
    const userData = userSnap.data();
    if (!userData) return;

    let currentJewels = (userData.jewels || 0) + winnings;
    let currentWins = (userData.blackjackWins || 0) + 1;
    let totalGames = (userData.totalGames || 0) + 1;
    let highestScore = Math.max(userData.blackjackHighestScore || 0, gameState.players[playerId]?.hand.total || 0);

    transaction.update(userRef, {
      jewels: currentJewels,
      blackjackWins: currentWins,
      totalGames: totalGames,
      blackjackHighestScore: highestScore,
      updatedAt: serverTimestamp(),
    });
    // Update client state based on the transaction outcome
    if (playerId === effectiveUserId) {
        setJewels(currentJewels);
        setStats(prev => ({ ...prev, wins: currentWins, totalGames: totalGames, highestScore: highestScore }));
        setShowReward({ jewels: winnings, xp: 10, message: `You won +${winnings} JEWELS!` });
        if (winSoundRef.current) winSoundRef.current.play().catch((err) => console.error("Audio playback failed:", err));
    }
    await mockBackendLogTransaction("deposit", winnings, "JEWELS", "blackjack_win", playerId);

    // Quest and Achievement updates (also part of the transaction)
    let currentQuests = userData.quests || initialQuests;
    const winQuest = currentQuests.find((q: Quest) => q.id === "blackjack-wins");
    if (winQuest && !winQuest.completed) {
      const newProgress = Math.min(winQuest.progress + 1, winQuest.goal);
      const isQuestCompleted = newProgress >= winQuest.goal;
      currentQuests = currentQuests.map((q: Quest) => (q.id === "blackjack-wins" ? { ...q, progress: newProgress, completed: isQuestCompleted } : q));
      transaction.update(userRef, { quests: currentQuests });
      if (isQuestCompleted) {
        const rewardAmount = winQuest.rewardJEWELS;
        transaction.update(userRef, { jewels: currentJewels + rewardAmount });
        if (playerId === effectiveUserId) setShowReward({ jewels: rewardAmount, xp: winQuest.rewardXP, message: `Quest Completed: ${winQuest.title}!` });
        await mockBackendLogTransaction("deposit", rewardAmount, "JEWELS", "blackjack_quest", playerId);
      }
    }

    let currentAchievements = userData.achievements || initialAchievements;
    const achievement = currentAchievements.find((a: Achievement) => a.id === "blackjack-master");
    if (achievement && !achievement.unlocked && currentWins >= 10) {
      currentAchievements = currentAchievements.map((a: Achievement) => (a.id === "blackjack-master" ? { ...a, unlocked: true } : a));
      transaction.update(userRef, { achievements: currentAchievements });
      const achievementRewardJewels = 20;
      const achievementRewardXP = 30;
      transaction.update(userRef, { jewels: currentJewels + achievementRewardJewels });
      if (playerId === effectiveUserId) setShowReward({ jewels: achievementRewardJewels, xp: achievementRewardXP, message: "Achievement Unlocked: Blackjack Master!" });
      await mockBackendLogTransaction("deposit", achievementRewardJewels, "JEWELS", "blackjack_achievement", playerId);
    }
  };

  const handlePlayerLoss = async (playerId: string, _gameState: BlackjackGameState, transaction: any) => {
    const userRef = doc(db, "Players", playerId);
    const userSnap = await transaction.get(userRef);
    const userData = userSnap.data();
    if (!userData) return;

    let currentLosses = (userData.blackjackLosses || 0) + 1;
    let totalGames = (userData.totalGames || 0) + 1;

    transaction.update(userRef, {
      blackjackLosses: currentLosses,
      totalGames: totalGames,
      updatedAt: serverTimestamp(),
    });
    if (playerId === effectiveUserId) {
        setStats(prev => ({ ...prev, losses: currentLosses, totalGames: totalGames }));
        setShowMessage("You lost.");
    }
  };


  // --- Game Initialization & Listeners ---
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
          wins: data.blackjackWins || 0,
          losses: data.blackjackLosses || 0,
          totalGames: (data.blackjackWins || 0) + (data.blackjackLosses || 0),
          highestScore: data.blackjackHighestScore || 0,
        });

        const roomsQuery = collection(db, "GameRooms");
        const unsubscribeRooms = onSnapshot(roomsQuery, (snapshot) => {
          let foundRoom: BlackjackGameState | null = null;
          snapshot.forEach((docSnap) => {
            const roomData = docSnap.data() as BlackjackGameState;
            if (roomData.game === "blackjack" && roomData.players && effectiveUserId in roomData.players) {
              foundRoom = { ...roomData, roomId: docSnap.id };
            } else if (roomData.game === "blackjack" && roomData.status === "waiting" && Object.keys(roomData.players).length < 2) { // Max 2 players for now
              foundRoom = { ...roomData, roomId: docSnap.id };
            }
          });

          if (foundRoom) {
            // User explicitly requested to apply Bingo's 'exit to homepage' logic
            // WARNING: This will prevent the Blackjack game from being played if any room exists.
            // If the intent is to play, this logic needs to be reverted or re-designed.
            navigate('/'); // Redirect to homepage
            setShowMessage("A Blackjack game room was found, redirecting to homepage.");
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
          if (dealerIntervalRef.current) clearInterval(dealerIntervalRef.current);
        };
      } catch (err) {
        console.error("Failed to initialize game data:", err);
        setShowMessage("⚠️ Failed to load game data.");
        setActiveModal("error");
        setIsLoading(false);
      }
    };

    joinRoomAndListen();
  }, [effectiveUserId, setShowMessage, setActiveModal, navigate, setIsPETMember, address]);

  useEffect(() => {
    saveStateToFirestore({
      jewels,
      quests,
      achievements,
      blackjackWins: stats.wins,
      blackjackLosses: stats.losses,
      blackjackHighestScore: stats.highestScore,
      totalGames: stats.totalGames, // Save totalGames stat
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
  }, []);

  const handleStartGame = async () => {
    if (!effectiveUserId) {
      setShowMessage("⚠️ Please sign in to play!");
      setActiveModal("auth");
      return;
    }
    if (config.useJewels && jewels < config.bet) {
      setShowMessage("⚠️ Not enough JEWELS! Please deposit.");
      setActiveModal("payment");
      return;
    }
    setIsLoading(true);
    try {
      // Once game is started by backend, client will listen via onSnapshot
      // We don't directly set game state here, rely on the listener.
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
            hand: { cards: [], total: 0, status: "playing" }, // Reset player hand
          }
        },
        dealerHand: { cards: [], total: 0, status: "playing" }, // Reset dealer hand
        status: "waiting", // Back to waiting
        winner: null,
        deck: createDeck(), // New deck for next round
      }, { merge: true });

      // If this was the only player, reset the room status completely
      const roomSnap = await getDoc(roomRef);
      const currentPlayers = roomSnap.data()?.players;
      if (currentPlayers && Object.keys(currentPlayers).length === 1 && currentPlayers[effectiveUserId]) {
        await setDoc(roomRef, { status: "waiting" }, { merge: true });
      }
      setShowMessage("Game reset. Ready for a new round!");
    } catch (error) {
      console.error("Error resetting game:", error);
      setShowMessage("⚠️ Failed to reset game. Please try again.");
      setActiveModal("error");
    } finally {
      setIsLoading(false);
    }
  };

  const hit = async (): Promise<void> => {
    if (!gameState || !effectiveUserId || !gameState.roomId) return;
    await mockBackendHit(gameState.roomId, effectiveUserId);
  };

  const stand = async (): Promise<void> => {
    if (!gameState || !effectiveUserId || !gameState.roomId) return;
    await mockBackendStand(gameState.roomId, effectiveUserId);
    // After player stands, if all players are done, trigger dealer's turn
    const allPlayersDone = Object.values(gameState.players).every(p => p.hand.status !== "playing");
    if (allPlayersDone) {
      mockBackendDetermineWinnerAndDistributeRewards(gameState.roomId); // Dealer's turn and winner
    }
  };

  const doubleDown = async (): Promise<void> => {
    if (!gameState || !effectiveUserId || !gameState.roomId) return;
    await mockBackendDoubleDown(gameState.roomId, effectiveUserId);
  };


  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-gray-950 font-inter">
        <p>Loading Multiplayer Blackjack Arena...</p>
      </div>
    );
  }

function shareWinOnX(_event: React.MouseEvent<HTMLButtonElement>): void {
    throw new Error("Function not implemented.");
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
            <Zap className="w-8 h-8 text-cyan-400 animate-pulse" /> Multiplayer Blackjack Arena
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto mt-4 font-inter">
            Beat the dealer in the PETverse! Get closest to 21 and win pooled JEWELS! <Link to="/vault" className="text-cyan-400 hover:underline">Manage vault</Link>.
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
                <h3 className="text-xl font-bold text-white mb-4 font-poppins">Dealer Hand (Total: {gameState.dealerHand.total})</h3>
                <div className="flex justify-center gap-2 mb-8">
                  <Canvas style={{ height: "100px", width: "100%" }} camera={{ position: [0, 0, 5], fov: 50 }}>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} intensity={1} />
                    {/* Render dealer's first card, and second card only if game ended or player stood */}
                    {gameState.dealerHand.cards[0] && (
                        <Card3D card={gameState.dealerHand.cards[0]} position={[-0.5, 0, 0]} />
                    )}
                    {gameState.dealerHand.cards[1] && (gameState.status === "ended" || gameState.players[effectiveUserId!]?.hand.status === "stand") ? (
                        <Card3D card={gameState.dealerHand.cards[1]} position={[0.5, 0, 0]} />
                    ) : (
                        // Placeholder for face-down card
                        <Box args={[0.8, 1.2, 0.05]} position={[0.5, 0, 0]} castShadow>
                            <meshStandardMaterial color="#6b7280" roughness={0.3} metalness={0.2} /> {/* Dark gray for back of card */}
                            <Text position={[0, 0, 0.06]} fontSize={0.3} color="#ffffff" anchorX="center" anchorY="middle">?</Text>
                        </Box>
                    )}
                  </Canvas>
                </div>
                <h3 className="text-xl font-bold text-white mb-4 font-poppins">Your Hand (Total: {gameState.players[effectiveUserId!]?.hand.total || 0})</h3>
                <div className="flex justify-center gap-2 mb-8">
                  <Canvas style={{ height: "100px", width: "100%" }} camera={{ position: [0, 0, 5], fov: 50 }}>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} intensity={1} />
                    {effectiveUserId && gameState.players[effectiveUserId]?.hand.cards.map((card, index) => (
                      <Card3D key={`${card.suit}-${card.value}`} card={card} position={[index * 1 - (gameState.players[effectiveUserId].hand.cards.length - 1) / 2, 0, 0]} />
                    ))}
                  </Canvas>
                </div>
                {gameState.status === "playing" && gameState.players[effectiveUserId!]?.hand.status === "playing" && (
                  <div className="flex justify-center gap-4">
                    <motion.button
                      onClick={hit}
                      className="px-6 py-3 bg-rose-600 text-white rounded-lg font-semibold font-poppins hover:bg-cyan-500"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label="Hit"
                    >
                      Hit
                    </motion.button>
                    <motion.button
                      onClick={stand}
                      className="px-6 py-3 bg-rose-600 text-white rounded-lg font-semibold font-poppins hover:bg-cyan-500"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label="Stand"
                    >
                      Stand
                    </motion.button>
                    {gameState.players[effectiveUserId!]?.hand.cards.length === 2 && (
                      <motion.button
                        onClick={doubleDown}
                        className="px-6 py-3 bg-rose-600 text-white rounded-lg font-semibold font-poppins hover:bg-cyan-500"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        aria-label="Double Down"
                      >
                        Double Down
                      </motion.button>
                    )}
                  </div>
                )}
                {gameState.status === "ended" && gameState.winner === effectiveUserId && (
                  <motion.div
                    className="mt-6 text-xl text-cyan-400 font-bold text-center bg-black/80 px-6 py-3 rounded-lg font-poppins"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    🎉 You win the Blackjack!
                  </motion.div>
                )}
                {gameState.status === "ended" && gameState.winner && gameState.winner !== effectiveUserId && (
                  <motion.div
                    className="mt-6 text-xl text-rose-400 font-bold text-center bg-black/80 px-6 py-3 rounded-lg font-poppins"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    ❌ {gameState.players[gameState.winner]?.name || "Dealer"} wins!
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

        {gameState?.status === "ended" && (
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
                {player.name}: {player.jewels} JEWELS (Hand: {player.hand.total})
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
              aria-label="Share Blackjack Win on X"
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

        {!effectiveUserId && (
          <motion.div variants={sectionVariants} className="text-center mb-12">
            <p className="text-gray-300 mb-4">Please sign in to join the Blackjack game!</p>
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

        {effectiveUserId && !gameState && !isLoading && (
          <motion.div variants={sectionVariants} className="text-center mb-12">
            <p className="text-gray-300 mb-4">You are not in an active Blackjack game. Would you like to start a new one?</p>
            <motion.button
              onClick={handleStartGame}
              className="px-6 py-3 bg-rose-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 mx-auto font-poppins hover:bg-cyan-500"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Start New Blackjack Game"
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
              if (!auth.currentUser) {
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
              if (!auth.currentUser) {
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
            <Modal title="Multiplayer Blackjack Tutorial" onClose={() => setShowTutorial(false)}>
              <div className="text-gray-200 text-sm space-y-4 font-inter">
                <p>Objective: Beat the dealer by getting a hand value closest to 21 without going over!</p>
                <ul className="list-disc pl-6">
                  <li>Select bet amount (100–500 JEWELS).</li>
                  <li>Join a game room and wait for players (up to 4).</li>
                  <li>Hit to draw a card, Stand to stop, or Double Down to double your bet and draw one card.</li>
                  <li>Win by having a higher total than the dealer without busting (over 21).</li>
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

export default BlackjackGame;

function saveStateToFirestore(_arg0: { jewels: number; quests: Quest[]; achievements: Achievement[]; blackjackWins: number; blackjackLosses: number; blackjackHighestScore: number; totalGames: number; }) {
  throw new Error("Function not implemented.");
}
