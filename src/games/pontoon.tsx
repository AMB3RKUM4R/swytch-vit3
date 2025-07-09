import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Dices, Trophy, Users, Sparkles, Star, MessageCircleHeart, X, RefreshCcw } from 'lucide-react';
import { doc, getDoc, onSnapshot, setDoc, collection, addDoc, serverTimestamp, getDocs, QueryDocumentSnapshot, runTransaction } from 'firebase/firestore';
import { db, auth } from '../lib/firebaseConfig'; // Corrected path
import { useNavigate, Link } from 'react-router-dom';
import { useModal } from '../context/ModalContext'; // Corrected path
import { useAuthUser } from '../hooks/useAuthUser'; // Corrected path
import { useAccount } from 'wagmi';
import { Canvas } from '@react-three/fiber';
import { Box, Text, Cylinder } from '@react-three/drei'; // Added Cylinder, Box, Text
import Modal from '../components/SwytchModal'; // Corrected path
import AuthModal from '../components/AuthModal'; // Corrected path
import PaymentModal from '../components/PaymentModal'; // Corrected path
import SwytchErrorBoundary from '../components/ErrorBoundaryComponent'; // Corrected path
import ConfettiExplosion from 'react-confetti-explosion';
import { Transaction, PaymentModalProps } from '../lib/types'; // Import types

// --- Type Definitions ---
type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
type Value = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

interface Card {
  suit: Suit;
  value: Value;
  numericValue: number; // Added numericValue to Card interface
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
  phase: 'IDLE' | 'PLAYER' | 'DEALER' | 'RESULT';
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

// --- Initial Data ---
const initialQuests: Quest[] = [
  { id: "pontoon-wins", title: "Win 3 Pontoon Games", progress: 0, goal: 3, rewardJEWELS: 10, rewardXP: 15, completed: false },
  { id: "pontoon-play", title: "Play 5 Pontoon Rounds", progress: 0, goal: 5, rewardJEWELS: 5, rewardXP: 10, completed: false },
  { id: "pontoon-share", title: "Share Pontoon Win on X", progress: 0, goal: 1, rewardJEWELS: 5, rewardXP: 5, completed: false },
];

const initialAchievements: Achievement[] = [
  { id: "pontoon-master", title: "Pontoon Master", description: "Win 10 multiplayer Pontoon games.", unlocked: false },
];

const mockXPosts: { username: string; content: string; likes: number; timestamp: string }[] = [
  { username: "@PETversePlayer", content: "Nailed a Pontoon in Swytch PETverse! 🃏 #SwytchPETverse", likes: 160, timestamp: "2025-07-08T17:30:00Z" },
  { username: "@CryptoGamerX", content: "Pontoon in PETverse is a blast! Join the table! #SwytchPET", likes: 200, timestamp: "2025-07-07T16:45:00Z" },
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
  return [...fullDeck].sort(() => Math.sin(hash++) * 10000 % 1 - 0.5);
};

const getHandValue = (cards: Card[]): { value: number; isPontoon: boolean; isFiveCardTrick: boolean } => {
  let value = 0, aces = 0;
  for (const card of cards) {
    if (card.value === 'A') aces++;
    else if (['J', 'Q', 'K'].includes(card.value)) value += 10;
    else value += parseInt(card.value);
  }
  // Adjust for Aces
  while (aces > 0 && value + 11 > 21) { // If adding 11 busts, add 1 instead
    value += 1;
    aces--;
  }
  value += aces * 11; // Add remaining aces as 11 (if they don't bust)

  const isPontoon = cards.length === 2 && value === 21;
  const isFiveCardTrick = cards.length === 5 && value <= 21;
  return { value, isPontoon, isFiveCardTrick };
};

const Card3D: React.FC<{ card: Card; position: [number, number, number]; index: number; faceUp: boolean }> = ({ card, position, faceUp }) => {
  return (
    <group position={position}>
      <Box args={[0.8, 1.2, 0.05]} castShadow>
        <meshStandardMaterial color="#ffffff" roughness={0.3} metalness={0.2} />
      </Box>
      <Text position={[0, 0, 0.06]} fontSize={0.3} color={card.suit === 'hearts' || card.suit === 'diamonds' ? "#f43f5e" : "#000000"} anchorX="center" anchorY="middle">
        {faceUp ? cardToEmoji(card) : '�'}
      </Text>
    </group>
  );
};

interface PontoonGameProps {
  userId: string | null;
  setIsPETMember: React.Dispatch<React.SetStateAction<boolean>>;
  updatePlayerFirestore: (updates: Partial<any>) => Promise<void>;
}

const PontoonGame: React.FC<PontoonGameProps> = ({ userId, setIsPETMember, updatePlayerFirestore }) => {
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
  const [gameRoom, setGameRoom] = useState<GameRoom | null>(null);
  const [gameRoomId, setGameRoomId] = useState<string | null>(null);
  const [players, setPlayers] = useState<string[]>([]);
  const [betAmount, setBetAmount] = useState<number>(10);
  const [useJewels, setUseJewels] = useState<boolean>(true);
  const [autoPlay, setAutoPlay] = useState<boolean>(false);
  const [bets, setBets] = useState<Bet[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const playSoundRef = useRef<HTMLAudioElement | null>(null);
  const winSoundRef = useRef<HTMLAudioElement | null>(null);
  const navigate = useNavigate();

  const effectiveUserId = userId ?? (address ? address.toLowerCase() : firebaseAuthUser?.uid ?? null);

  // --- Simulated Backend Functions (for production, these would be Firebase Cloud Functions or an API) ---

  const mockBackendLogTransaction = async (type: "deposit" | "withdraw", amount: number, currency: string, game: string, userId: string, adminId: string = "0CfobCbXnPZsJwT662H4OhDrXk33") => {
    try {
      const transactionId = `${userId}_${Date.now()}`;
      await addDoc(collection(db, "transactions"), { // Use lowercase 'transactions'
        transactionId,
        userId: effectiveUserId, // Use effectiveUserId here
        amount,
        currency,
        transactionType: type,
        status: "pending",
        timestamp: serverTimestamp(),
        game,
        adminId,
      });
      setShowMessage(`✅ ${type === "deposit" ? "Win" : "Bet"} of ${amount} ${currency} submitted! Admin (0CfobCbXnPZsJwT662H4OhDrXk33) will process.`);
    } catch (err) {
      console.error("Error logging transaction:", err);
      setShowMessage("⚠️ Failed to log transaction.");
      setActiveModal("error");
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
        await mockBackendLogTransaction("withdraw", bet, useJewelsCurrency ? "JEWELS" : "USDT", "pontoon", userId);

        // Deal initial hands
        const newDeck = shuffleDeck(Date.now().toString());
        const pHand = [newDeck.shift()!, newDeck.shift()!]; // Player gets two cards
        const dHand = [newDeck.shift()!, newDeck.shift()!]; // Dealer gets two cards

        const updatedPlayerHands = { ...roomData.playerHands, [userId]: { hand: pHand, bet: bet, won: false, payout: 0 } };

        transaction.update(roomRef, {
          deck: newDeck, // Remaining deck
          dealerHand: dHand,
          playerHands: updatedPlayerHands,
          phase: 'PLAYER', // Start in player phase
          activePlayer: userId,
          result: "",
        });

        setShowMessage("🃏 Game started! Dealing hands...");
        if (playSoundRef.current) playSoundRef.current.play().catch((err) => console.error("Audio playback failed:", err));

        // Check for immediate Pontoon or Five Card Trick
        const { isPontoon, isFiveCardTrick } = getHandValue(pHand);
        if (isPontoon || isFiveCardTrick) {
          // If immediate Pontoon/5-Card Trick, move to dealer's turn/result directly
          setTimeout(() => finishPontoon(roomId, userId, bet, useJewelsCurrency), 1200);
        }
      });
    } catch (error: any) {
      console.error("[Backend Mock] Error playing game:", error);
      setShowMessage(`⚠️ Game failed: ${error.message}`);
      setActiveModal("error");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePontoonAction = async (action: 'twist' | 'stick'): Promise<void> => { // Changed 'hit' to 'twist', 'stand' to 'stick' for Pontoon terminology
    if (!effectiveUserId || !gameRoomId || !gameRoom || gameRoom.phase !== 'PLAYER' || gameRoom.activePlayer !== effectiveUserId) return;
    const roomRef = doc(db, "GameRooms", gameRoomId);
    const userRef = doc(db, "Players", effectiveUserId);

    await runTransaction(db, async (transaction) => {
      const roomSnap = await transaction.get(roomRef);
      const userSnap = await transaction.get(userRef);
      if (!roomSnap.exists()) throw new Error("Game room not found.");
      if (!userSnap.exists()) throw new Error("Player data not found.");

      const currentRoomData = roomSnap.data() as GameRoom;
      const currentUserData = userSnap.data();
      const playerData = currentRoomData.playerHands[effectiveUserId];
      if (!playerData) throw new Error("Player hand not found in room.");

      let newDeck = [...currentRoomData.deck];
      let newPlayerHand = [...playerData.hand];
      let newPhase: 'PLAYER' | 'DEALER' = 'PLAYER';
      let resultMsg = "";

      if (action === 'twist') {
        if (newDeck.length === 0) {
          setShowMessage("⚠️ No cards left in deck!");
          return; // Cannot twist, exit transaction
        }
        newPlayerHand.push(newDeck.shift()!); // Draw a card
        const { value, isPontoon, isFiveCardTrick } = getHandValue(newPlayerHand);

        if (value > 21) {
          resultMsg = 'Bust!';
          newPhase = 'DEALER'; // Move to dealer's turn after bust
        } else if (isPontoon || isFiveCardTrick) {
          newPhase = 'DEALER'; // Move to dealer's turn after Pontoon/5-Card Trick
        }
      } else if (action === 'stick') { // 'stand' is now 'stick'
        newPhase = 'DEALER'; // Move to dealer's turn
      }

      // Update player hand and deck in Firestore
      transaction.update(roomRef, {
        deck: newDeck,
        [`playerHands.${effectiveUserId}.hand`]: newPlayerHand,
        phase: newPhase,
        result: resultMsg, // Update result if busted
      });

      // If phase moved to DEALER, trigger finishPontoon
      if (newPhase === 'DEALER') {
        setTimeout(() => finishPontoon(gameRoomId!, effectiveUserId, playerData.bet, useJewels), 1200);
      }
    });
  };

  const finishPontoon = async (roomId: string, userId: string, bet: number, useJewelsCurrency: boolean): Promise<void> => {
    if (!roomId || !userId) return; // Ensure basic info is present
    const roomRef = doc(db, "GameRooms", roomId);
    const userRef = doc(db, "Players", userId);

    await runTransaction(db, async (transaction) => {
      const roomSnap = await transaction.get(roomRef);
      const userSnap = await transaction.get(userRef);

      if (!roomSnap.exists()) throw new Error("Game room not found.");
      if (!userSnap.exists()) throw new Error("Player data not found.");

      const currentRoomData = roomSnap.data() as GameRoom;
      const currentUserData = userSnap.data();

      let dealerHand = [...currentRoomData.dealerHand];
      let currentDeck = [...currentRoomData.deck];

      // Dealer's turn: Twist until 17 or more
      while (getHandValue(dealerHand).value < 17 && currentDeck.length > 0) {
        dealerHand.push(currentDeck.shift()!);
      }

      const playerData = currentRoomData.playerHands[userId];
      if (!playerData) throw new Error("Player hand not found in room for result calculation.");

      const playerHandInfo = getHandValue(playerData.hand);
      const dealerHandInfo = getHandValue(dealerHand);

      let won = false, payout = 0, result = "";

      // Pontoon specific win conditions
      if (playerHandInfo.value > 21) {
        result = `Bust! You: ${playerHandInfo.value} Dealer: ${dealerHandInfo.value}`;
        won = false;
        payout = 0;
      } else if (dealerHandInfo.value > 21) {
        result = `Dealer Busts! You: ${playerHandInfo.value} Dealer: ${dealerHandInfo.value}`;
        won = true;
        payout = playerData.bet * 2; // Dealer busts, player wins 2x
      } else if (playerHandInfo.isPontoon) {
        result = `Pontoon! You win! (${playerHandInfo.value} vs ${dealerHandInfo.value})`;
        won = true;
        payout = playerData.bet * 2; // Pontoon pays 2x
      } else if (playerHandInfo.isFiveCardTrick) {
        result = `Five Card Trick! You win! (${playerHandInfo.value} vs ${dealerHandInfo.value})`;
        won = true;
        payout = playerData.bet * 2; // Five Card Trick pays 2x
      } else if (playerHandInfo.value > dealerHandInfo.value) {
        result = `You Win! (${playerHandInfo.value} vs ${dealerHandInfo.value})`;
        won = true;
        payout = playerData.bet * 2; // Beat dealer, win 2x
      } else if (playerHandInfo.value === dealerHandInfo.value) {
        result = `Push! (${playerHandInfo.value} vs ${dealerHandInfo.value})`;
        won = false; // Push in Pontoon means dealer wins ties
        payout = 0; // No payout on push, bet is lost
      } else {
        result = `Dealer Wins! (${dealerHandInfo.value} vs ${playerHandInfo.value})`;
        won = false;
        payout = 0;
      }

      const updatedPlayerHand = { ...playerData, won, payout, result };
      const updatedPlayerHands = { ...currentRoomData.playerHands, [userId]: updatedPlayerHand };

      // Update game room with final state
      transaction.update(roomRef, {
        dealerHand: dealerHand,
        deck: currentDeck,
        playerHands: updatedPlayerHands,
        phase: 'RESULT',
        result: result,
      });

      // Update player stats and give rewards
      const newStats = {
        plays: (currentUserData.pontoonPlays || 0) + 1,
        wins: won ? (currentUserData.pontoonWins || 0) + 1 : (currentUserData.pontoonWins || 0),
        losses: won ? (currentUserData.pontoonLosses || 0) : (currentUserData.pontoonLosses || 0) + 1,
        biggestWin: Math.max((currentUserData.pontoonBiggestWin || 0), payout),
      };
      transaction.update(userRef, {
        pontoonPlays: newStats.plays,
        pontoonWins: newStats.wins,
        pontoonLosses: newStats.losses,
        pontoonBiggestWin: newStats.biggestWin,
        updatedAt: serverTimestamp(),
      });
      setStats(newStats); // Update local stats state

      if (payout > 0) {
        const rewardCurrency = useJewelsCurrency ? "JEWELS" : "USDT";
        transaction.update(userRef, {
          jewels: useJewelsCurrency ? (currentUserData.jewels || 0) + payout : currentUserData.jewels,
          gold: !useJewelsCurrency ? (currentUserData.gold || 0) + payout : currentUserData.gold,
        });
        setJewels((prev) => prev + payout); // Update local jewels/gold
        setShowReward({ jewels: payout, xp: 10, message: `Pontoon! You won +${payout} ${rewardCurrency}! ${result}` });
        if (winSoundRef.current) winSoundRef.current.play().catch((err) => console.error("Audio playback failed:", err));

        // Quest and Achievement updates
        let currentQuests = currentUserData.quests || initialQuests;
        const winQuest = currentQuests.find((q: Quest) => q.id === "pontoon-wins");
        if (winQuest && !winQuest.completed) {
          const newProgress = Math.min(winQuest.progress + 1, winQuest.goal);
          const isQuestCompleted = newProgress >= winQuest.goal;
          currentQuests = currentQuests.map((q: Quest) => (q.id === "pontoon-wins" ? { ...q, progress: newProgress, completed: isQuestCompleted } : q));
          transaction.update(userRef, { quests: currentQuests });
          if (isQuestCompleted) {
            const rewardAmount = winQuest.rewardJEWELS;
            transaction.update(userRef, { jewels: (currentUserData.jewels || 0) + rewardAmount });
            setShowReward({ jewels: rewardAmount, xp: winQuest.rewardXP, message: `Quest Completed: ${winQuest.title}!` });
            await mockBackendLogTransaction("deposit", rewardAmount, "JEWELS", "pontoon_quest", userId);
          }
        }

        let currentAchievements = currentUserData.achievements || initialAchievements;
        const achievement = currentAchievements.find((a: Achievement) => a.id === "pontoon-master");
        if (achievement && !achievement.unlocked && newStats.wins >= 10) {
          currentAchievements = currentAchievements.map((a: Achievement) => (a.id === "pontoon-master" ? { ...a, unlocked: true } : a));
          transaction.update(userRef, { achievements: currentAchievements });
          const achievementRewardJewels = 20;
          const achievementRewardXP = 30;
          transaction.update(userRef, { jewels: (currentUserData.jewels || 0) + achievementRewardJewels });
          setShowReward({ jewels: achievementRewardJewels, xp: achievementRewardXP, message: "Achievement Unlocked: Pontoon Master!" });
          await mockBackendLogTransaction("deposit", achievementRewardJewels, "JEWELS", "pontoon_achievement", userId);
        }
      } else {
        setShowMessage(`😔 ${result}`);
      }

      // Update play quest regardless of win/loss
      let currentQuestsForPlay = currentUserData.quests || initialQuests;
      const playQuest = currentQuestsForPlay.find((q: Quest) => q.id === "pontoon-play");
      if (playQuest && !playQuest.completed) {
        const newProgress = Math.min(playQuest.progress + 1, playQuest.goal);
        const isQuestCompleted = newProgress >= playQuest.goal;
        currentQuestsForPlay = currentQuestsForPlay.map((q: Quest) => (q.id === "pontoon-play" ? { ...q, progress: newProgress, completed: isQuestCompleted } : q));
        transaction.update(userRef, { quests: currentQuestsForPlay });
        if (isQuestCompleted) {
          const rewardAmount = playQuest.rewardJEWELS;
          transaction.update(userRef, { jewels: (currentUserData.jewels || 0) + rewardAmount });
          setShowReward({ jewels: rewardAmount, xp: playQuest.rewardXP, message: `Quest Completed: ${playQuest.title}!` });
          await mockBackendLogTransaction("deposit", rewardAmount, "JEWELS", "pontoon_quest", userId);
        }
      }

      // Reset game room for next round if autoPlay is enabled
      if (autoPlay) {
        setTimeout(async () => {
          await resetGame(roomId); // Call resetGame with roomId
          setTimeout(() => mockBackendPlayGame(roomId, userId, bet, useJewelsCurrency), 1000); // Start next game
        }, 2500);
      }
    });
  };

  const resetGame = async (roomId: string): Promise<void> => { // Accept roomId
    if (!roomId) return;
    const roomRef = doc(db, "GameRooms", roomId);
    await setDoc(roomRef, {
      deck: shuffleDeck(Date.now().toString()),
      dealerHand: [],
      playerHands: {},
      phase: 'IDLE',
      activePlayer: null,
      result: "",
      game: "pontoon",
    }, { merge: true });
    setGameState('IDLE'); // Update local state for UI
    setShowMessage("Game reset. Ready for a new round!");
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
      await resetGame(gameRoomId); // Call resetGame with gameRoomId
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
    const shareQuest = quests.find((q: Quest) => q.id === "pontoon-share"); // Explicitly type q
    if (shareQuest && !shareQuest.completed) {
      const shareText = encodeURIComponent("Just scored a Pontoon in Swytch PETverse! 🃏 Join at swytch.io! #SwytchPETverse #Pontoon");
      window.open(`https://x.com/intent/tweet?text=${shareText}`, "_blank");
      setQuests((prev) => prev.map((q) => (q.id === "pontoon-share" ? { ...q, progress: 1, completed: true } : q)));
      setJewels((prev) => prev + shareQuest.rewardJEWELS);
      setShowReward({ jewels: shareQuest.rewardJEWELS, xp: shareQuest.rewardXP, message: `Quest Completed: ${shareQuest.title}!` });
      await mockBackendLogTransaction("deposit", shareQuest.rewardJEWELS, "JEWELS", "pontoon_share_quest", effectiveUserId);
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
          plays: data.pontoonPlays || 0,
          wins: data.pontoonWins || 0,
          losses: data.pontoonLosses || 0,
          biggestWin: data.pontoonBiggestWin || 0,
        });

        const roomsQuery = collection(db, "GameRooms");
        const unsubscribeRooms = onSnapshot(roomsQuery, (snapshot) => {
          let foundRoom: GameRoom | null = null;
          snapshot.forEach((docSnap) => {
            const roomData = docSnap.data() as GameRoom;
            // Check if player is already in a pontoon room or if there's a waiting pontoon room to join
            if (roomData.game === "pontoon" && roomData.players && effectiveUserId in roomData.players) {
              foundRoom = { ...roomData, roomId: docSnap.id };
            } else if (roomData.game === "pontoon" && roomData.phase === "IDLE" && Object.keys(roomData.playerHands).length < 4) { // Max 4 players for Pontoon
              foundRoom = { ...roomData, roomId: docSnap.id };
            }
          });

          if (foundRoom) {
            // As per user request: if any Pontoon room is found, redirect to homepage.
            // WARNING: This will prevent the Pontoon game from being played if any room exists.
            // If the intent is to play, this logic needs to be reverted or re-designed.
            navigate('/'); // Redirect to homepage
            setShowMessage("A Pontoon game room was found, redirecting to homepage.");
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
          pontoonPlays: stats.plays,
          pontoonWins: stats.wins,
          pontoonLosses: stats.losses,
          pontoonBiggestWin: stats.biggestWin,
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
    // playSoundRef.current is not used in this component.
    winSoundRef.current = new Audio("/audio/reward.mp3"); // Assuming this is specifically for win sounds
    return () => {
      winSoundRef.current?.pause();
    };
  }, []);


  if (authLoading || isLoading || !effectiveUserId) { // Added !effectiveUserId to loading check for initial state
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-gray-950 font-inter">
        <p>Loading Pontoon...</p>
      </div>
    );
  }

  return (
    <section className="relative py-16 px-6 sm:px-8 lg:px-16 bg-gradient-to-br from-gray-950 via-rose-950/20 to-black text-white overflow-hidden font-inter">
      {gameRoom?.phase === 'RESULT' && gameRoom.playerHands[effectiveUserId!]?.won && ( // Added null check for gameRoom
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
            <Dices className="w-8 h-8 text-cyan-400 animate-pulse" /> Pontoon
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto mt-4 font-inter">
            Beat the dealer in the multiplayer PETverse Pontoon! Win up to 2x your bet with a Pontoon or Five Card Trick! <Link to="/vault" className="text-cyan-400 hover:underline">Manage vault</Link>.
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
              {gameRoom?.playerHands[playerId] ? `: ${getHandValue(gameRoom.playerHands[playerId].hand).value}` : ""}
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
            whileHover={{ scale: gameRoom?.phase !== 'IDLE' ? 1 : 1.05 }} // Added null check
            whileTap={{ scale: 0.95 }}
            aria-label="Play Pontoon"
          >
            <Dices className="w-6 h-6 text-cyan-400 animate-pulse" /> Play Pontoon
          </motion.button>
        </motion.div>

        <motion.div variants={sectionVariants} className="relative w-full h-[300px] mb-12 bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
          <SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}>
            <div className="absolute inset-0 bg-gradient-to-r from-rose-500/20 to-cyan-500/20 rounded-lg" />
            <div className="relative w-full flex flex-col items-center">
              {(gameRoom?.phase === 'PLAYER' || gameRoom?.phase === 'DEALER' || gameRoom?.phase === 'RESULT') && gameRoom?.playerHands[effectiveUserId!]?.hand.length > 0 && (
                <div className="w-full flex flex-col items-center">
                  <div className="flex gap-8 mb-4">
                    <div>
                      <div className="text-cyan-400 mb-1 font-poppins">Your Hand ({gameRoom.playerHands[effectiveUserId!].hand ? getHandValue(gameRoom.playerHands[effectiveUserId!].hand).value : '?'})</div>
                      <Canvas style={{ height: "100px", width: "100%" }} camera={{ position: [0, 0, 5], fov: 50 }}>
                        <ambientLight intensity={0.5} />
                        <pointLight position={[10, 10, 10]} intensity={1} />
                        {gameRoom.playerHands[effectiveUserId!]?.hand.map((card, i) => (
                          <Card3D
                            key={`player-${i}`}
                            card={card}
                            position={[i * 1 - (gameRoom.playerHands[effectiveUserId!].hand.length - 1) / 2, 0, 0]}
                            index={i}
                            faceUp={true}
                          />
                        ))}
                      </Canvas>
                    </div>
                    <div>
                      <div className="text-cyan-400 mb-1 font-poppins">Dealer Hand ({gameRoom.phase === 'RESULT' || gameRoom.phase === 'DEALER' ? getHandValue(gameRoom.dealerHand).value : '?'})</div>
                      <Canvas style={{ height: "100px", width: "100%" }} camera={{ position: [0, 0, 5], fov: 50 }}>
                        <ambientLight intensity={0.5} />
                        <pointLight position={[10, 10, 10]} intensity={1} />
                        {gameRoom.dealerHand.map((card, i) => (
                          <Card3D
                            key={`dealer-${i}`}
                            card={card}
                            position={[i * 1 - (gameRoom.dealerHand.length - 1) / 2, 0, 0]}
                            index={i}
                            faceUp={gameRoom.phase === 'RESULT' || gameRoom.phase === 'DEALER' || i === 0}
                          />
                        ))}
                      </Canvas>
                    </div>
                  </div>
                  {gameRoom.phase === 'PLAYER' && gameRoom.activePlayer === effectiveUserId && (
                    <div className="flex gap-4">
                      <motion.button
                        onClick={() => handlePontoonAction('twist')}
                        className="px-6 py-3 bg-rose-600 rounded-lg text-white font-semibold hover:bg-cyan-500 font-poppins"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        aria-label="Twist"
                      >
                        Twist
                      </motion.button>
                      <motion.button
                        onClick={() => handlePontoonAction('stick')}
                        className="px-6 py-3 bg-rose-600 rounded-lg text-white font-semibold hover:bg-cyan-500 font-poppins"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        aria-label="Stick"
                      >
                        Stick
                      </motion.button>
                    </div>
                  )}
                  <div className="text-cyan-400 mb-1 font-poppins mt-4">Other Players</div>
                  <div className="flex flex-wrap gap-2">
                    {players
                      .filter((pid) => pid !== effectiveUserId)
                      .map((pid, _idx) => ( // Use _idx for unused index
                        <div key={pid} className="flex flex-col">
                          <p className="text-cyan-400 font-inter">Player {address && pid === address.toLowerCase() ? `${address.slice(0, 6)}...${address.slice(-4)}` : `${pid.slice(0, 6)}...${pid.slice(-4)}`}</p>
                          <Canvas style={{ height: "100px", width: "100%" }} camera={{ position: [0, 0, 5], fov: 50 }}>
                            <ambientLight intensity={0.5} />
                            <pointLight position={[10, 10, 10]} intensity={1} />
                            {gameRoom.playerHands[pid]?.hand.map((card, i) => ( // Added null check for gameRoom.playerHands[pid]
                              <Card3D
                                key={`${pid}-${i}`}
                                card={card}
                                position={[i * 1 - (gameRoom.playerHands[pid].hand.length - 1) / 2, 0, 0]}
                                index={i}
                                faceUp={gameRoom.phase === 'RESULT'} // Only show other players' cards when result is known
                              />
                            ))}
                          </Canvas>
                        </div>
                      ))}
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
            <motion.button
                onClick={handlePlayAgain}
                className="px-6 py-3 bg-cyan-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 mx-auto font-poppins hover:bg-rose-500"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Play Again"
            >
                <RefreshCcw className="w-5 h-5 text-white animate-spin-slow" /> Play Again
            </motion.button>
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
              aria-label="Share Pontoon Win on X"
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
            <p className="text-gray-300 mb-4">Please sign in to play Pontoon!</p>
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
            <p className="text-gray-300 mb-4">You are not in an active Pontoon game. Would you like to start a new one?</p>
            <motion.button
              onClick={handleStartGame}
              className="px-6 py-3 bg-rose-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 mx-auto font-poppins hover:bg-cyan-500"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Start New Pontoon Game"
            >
              <Dices className="w-5 h-5 text-cyan-400 animate-pulse" /> Start New Game
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
            <Modal title="Multiplayer Pontoon Tutorial" onClose={() => setShowTutorial(false)}>
              <div className="text-gray-200 text-sm space-y-4 font-inter">
                <p><b>Objective:</b> Get a hand value closer to 21 than the dealer without busting in a multiplayer game.</p>
                <ul className="list-disc pl-6">
                  <li>Bet 10–1000 JEWELS or USDT.</li>
                  <li>You and other players get two cards each; dealer gets two (one hidden).</li>
                  <li>Twist to draw cards or Stick to end your turn.</li>
                  <li>Pontoon (Ace + 10/J/Q/K) or Five Card Trick (5 cards ≤ 21) pays 2x; beat dealer for 2x, push to return bet.</li>
                  <li>Dealer draws to 17+. Auto-play continues rounds. Complete quests for rewards!</li>
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

export default PontoonGame;
function setGameState(arg0: string) {
  throw new Error('Function not implemented.');
}

