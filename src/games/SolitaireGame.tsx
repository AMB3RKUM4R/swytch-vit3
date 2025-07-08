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

type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
type Value = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

interface Card {
  suit: Suit;
  value: Value;
  faceUp: boolean;
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

interface SolitaireState {
  tableau: Card[][];
  stock: Card[];
  waste: Card[];
  foundation: { [key in Suit]: Card[] };
}

interface GameRoom {
  playerStates: { [userId: string]: { state: SolitaireState; bet: number; won: boolean; payout: number; result: string } };
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

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const deck: Card[] = (
  ['hearts', 'diamonds', 'clubs', 'spades'] as const
).flatMap(suit =>
  (['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'] as const).map(value => ({ suit, value, faceUp: false }))
);

const cardToEmoji = (card: Card): string => {
  const suitMap: { [key in Suit]: string } = { hearts: '♥', diamonds: '♦', clubs: '♣', spades: '♠' };
  return `${card.value}${suitMap[card.suit]}`;
};

const shuffleDeck = (seed: string): Card[] => {
  let hash = Array.from(seed).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return [...deck].sort(() => Math.sin(hash++) * 10000 % 1 - 0.5);
};

const isValidTableauMove = (card: Card, target: Card): boolean => {
  const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const cardValueIndex = values.indexOf(card.value);
  const targetValueIndex = values.indexOf(target.value);
  const isOppositeColor = (card.suit === 'hearts' || card.suit === 'diamonds') !== (target.suit === 'hearts' || target.suit === 'diamonds');
  return isOppositeColor && cardValueIndex === targetValueIndex - 1;
};

const isValidFoundationMove = (card: Card, foundation: Card[]): boolean => {
  if (foundation.length === 0) return card.value === 'A';
  const topCard = foundation[foundation.length - 1];
  const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  return card.suit === topCard.suit && values.indexOf(card.value) === values.indexOf(topCard.value) + 1;
};

const Card3D: React.FC<{ card: Card; position: [number, number, number]; index: number; isSelected: boolean; onClick: () => void }> = ({ card, position, isSelected, onClick }) => {
  return (
    <group position={position} onClick={onClick}>
      <Box args={[0.8, 1.2, 0.05]} castShadow>
        <meshStandardMaterial color={isSelected ? "#22d3ee" : "#ffffff"} roughness={0.3} metalness={0.2} />
      </Box>
      <Text position={[0, 0, 0.06]} fontSize={0.3} color={card.suit === 'hearts' || card.suit === 'diamonds' ? "#f43f5e" : "#000000"} anchorX="center" anchorY="middle">
        {card.faceUp ? cardToEmoji(card) : '🂠'}
      </Text>
    </group>
  );
};

const initialQuests: Quest[] = [
  { id: "solitaire-wins", title: "Win 3 Solitaire Games", progress: 0, goal: 3, rewardJEWELS: 10, rewardXP: 15, completed: false },
  { id: "solitaire-play", title: "Play 5 Solitaire Rounds", progress: 0, goal: 5, rewardJEWELS: 5, rewardXP: 10, completed: false },
  { id: "solitaire-share", title: "Share Solitaire Win on X", progress: 0, goal: 1, rewardJEWELS: 5, rewardXP: 5, completed: false },
];

const initialAchievements: Achievement[] = [
  { id: "solitaire-master", title: "Solitaire Master", description: "Win 10 multiplayer Solitaire games.", unlocked: false },
];

const mockXPosts: { username: string; content: string; likes: number; timestamp: string }[] = [
  { username: "@PETversePlayer", content: "Aced Solitaire in Swytch PETverse! 🃏 #SwytchPETverse", likes: 130, timestamp: "2025-07-08T16:00:00Z" },
  { username: "@CryptoGamerX", content: "Solitaire in PETverse is next-level! Join the fun! #SwytchPET", likes: 170, timestamp: "2025-07-07T15:20:00Z" },
];

interface SolitaireGameProps {
  userId: string | null;
  setIsPETMember: React.Dispatch<React.SetStateAction<boolean>>;
  updatePlayerFirestore: (updates: Partial<any>) => Promise<void>;
}

const SolitaireGame: React.FC<SolitaireGameProps> = ({ userId, setIsPETMember, updatePlayerFirestore }) => {
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
  const [selectedCard, setSelectedCard] = useState<{ pile: string; index: number } | null>(null);
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
          plays: data.solitairePlays || 0,
          wins: data.solitaireWins || 0,
          losses: data.solitaireLosses || 0,
          biggestWin: data.solitaireBiggestWin || 0,
        });

        const roomsRef = collection(db, "GameRooms");
        const roomsSnap = await getDocs(roomsRef);
        let roomId = roomsSnap.docs.find((doc: QueryDocumentSnapshot) => doc.data().phase === "IDLE" && doc.data().game === "solitaire")?.id;
        if (!roomId) {
          const shuffled = shuffleDeck(Date.now().toString()).map((card, i) => ({
            ...card,
            faceUp: i >= 28 ? false : i >= 21 ? true : i >= 15 ? i >= 16 : i >= 10 ? i >= 12 : i >= 6 ? i >= 8 : i >= 3,
          }));
          const tableau: Card[][] = Array.from({ length: 7 }, (_, i) => shuffled.slice(i * 7, i * 7 + i + 1));
          const stock = shuffled.slice(28);
          const initialState: SolitaireState = {
            tableau,
            stock,
            waste: [],
            foundation: { hearts: [], diamonds: [], clubs: [], spades: [] },
          };
          const newRoomRef = await addDoc(roomsRef, {
            game: "solitaire",
            playerStates: { [effectiveUserId]: { state: initialState, bet: 0, won: false, payout: 0, result: "" } },
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
            setGameState(data.phase);
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
  }, [effectiveUserId, setShowMessage, setActiveModal, navigate, setIsPETMember]);

  useEffect(() => {
    if (effectiveUserId) {
      updatePlayerFirestore({
        jewels,
        gold,
        quests,
        achievements,
        solitairePlays: stats.plays,
        solitaireWins: stats.wins,
        solitaireLosses: stats.losses,
        solitaireBiggestWin: stats.biggestWin,
      }).catch((err) => {
        console.error("Failed to save state:", err);
        setShowMessage("⚠️ Failed to save data.");
        setActiveModal("error");
      });
    }
  }, [jewels, gold, stats, quests, achievements, effectiveUserId, updatePlayerFirestore, setShowMessage, setActiveModal]);

  useEffect(() => {
    if (showReward) {
      const timer = setTimeout(() => setShowReward(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [showReward]);

  useEffect(() => {
    playSoundRef.current = new Audio("/audio/reward.mp3");
    winSoundRef.current = new Audio("/audio/reward.mp3");
    return () => {
      playSoundRef.current?.pause();
      winSoundRef.current?.pause();
    };
  }, []);

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
        game: "solitaire",
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
    const shareQuest = quests.find((q) => q.id === "solitaire-share");
    if (shareQuest && !shareQuest.completed) {
      const shareText = encodeURIComponent("Just aced Solitaire in Swytch PETverse! 🃏 Join at swytch.io! #SwytchPETverse #Solitaire");
      window.open(`https://x.com/intent/tweet?text=${shareText}`, "_blank");
      setQuests((prev) => prev.map((q) => (q.id === "solitaire-share" ? { ...q, progress: 1, completed: true } : q)));
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

    const shuffled = shuffleDeck(Date.now().toString()).map((card, i) => ({
      ...card,
      faceUp: i >= 28 ? false : i >= 21 ? true : i >= 15 ? i >= 16 : i >= 10 ? i >= 12 : i >= 6 ? i >= 8 : i >= 3,
    }));
    const tableau: Card[][] = Array.from({ length: 7 }, (_, i) => shuffled.slice(i * 7, i * 7 + i + 1));
    const stock = shuffled.slice(28);
    const newState: SolitaireState = {
      tableau,
      stock,
      waste: [],
      foundation: { hearts: [], diamonds: [], clubs: [], spades: [] },
    };
    const updatedPlayerStates = {
      ...roomData.playerStates,
      [effectiveUserId]: { state: newState, bet: betAmount, won: false, payout: 0, result: "" },
    };
    await setDoc(roomRef, {
      playerStates: updatedPlayerStates,
      phase: 'PLAYING',
      game: "solitaire",
    }, { merge: true });

    if (useJewels) {
      setJewels((prev) => prev - betAmount);
    } else {
      setGold((prev) => prev - betAmount);
    }
    await logTransaction("withdraw", betAmount);
    setBets((prev) => [...prev, { amount: betAmount, won: false, payout: 0, result: "" }]);
    if (playSoundRef.current) {
      playSoundRef.current.play().catch((err) => console.error("Audio playback failed:", err));
    }
  };

  const handleCardClick = async (pile: string, index: number): Promise<void> => {
    if (!effectiveUserId || !gameRoomId || !gameRoom || gameRoom.phase !== 'PLAYING' || !gameRoom.playerStates[effectiveUserId]) return;
    const roomRef = doc(db, "GameRooms", gameRoomId);
    const playerState = gameRoom.playerStates[effectiveUserId].state;

    if (selectedCard) {
      const { pile: fromPile, index: fromIndex } = selectedCard;
      let newState = { ...playerState };
      let moved = false;

      if (fromPile === pile && fromIndex === index) {
        setSelectedCard(null);
        return;
      }

      if (fromPile.startsWith('tableau') && pile.startsWith('tableau')) {
        const fromPileIndex = parseInt(fromPile.split('-')[1]);
        const toPileIndex = parseInt(pile.split('-')[1]);
        const card = playerState.tableau[fromPileIndex][fromIndex];
        const targetPile = playerState.tableau[toPileIndex];
        const targetCard = targetPile[targetPile.length - 1];
        if (!targetCard || isValidTableauMove(card, targetCard)) {
          newState.tableau[fromPileIndex] = playerState.tableau[fromPileIndex].slice(0, fromIndex);
          newState.tableau[toPileIndex] = [...playerState.tableau[toPileIndex], { ...card, faceUp: true }];
          if (newState.tableau[fromPileIndex].length > 0) {
            newState.tableau[fromPileIndex][newState.tableau[fromPileIndex].length - 1] = {
              ...newState.tableau[fromPileIndex][newState.tableau[fromPileIndex].length - 1],
              faceUp: true,
            };
          }
          moved = true;
        }
      }

      if (fromPile.startsWith('tableau') && pile.startsWith('foundation')) {
        const fromPileIndex = parseInt(fromPile.split('-')[1]);
        const suit = pile.split('-')[1] as Suit;
        const card = playerState.tableau[fromPileIndex][fromIndex];
        if (isValidFoundationMove(card, playerState.foundation[suit])) {
          newState.tableau[fromPileIndex] = playerState.tableau[fromPileIndex].slice(0, fromIndex);
          newState.foundation[suit] = [...playerState.foundation[suit], card];
          if (newState.tableau[fromPileIndex].length > 0) {
            newState.tableau[fromPileIndex][newState.tableau[fromPileIndex].length - 1] = {
              ...newState.tableau[fromPileIndex][newState.tableau[fromPileIndex].length - 1],
              faceUp: true,
            };
          }
          moved = true;
        }
      }

      if (fromPile === 'waste' && pile.startsWith('tableau')) {
        const toPileIndex = parseInt(pile.split('-')[1]);
        const card = playerState.waste[fromIndex];
        const targetPile = playerState.tableau[toPileIndex];
        const targetCard = targetPile[targetPile.length - 1];
        if (!targetCard || isValidTableauMove(card, targetCard)) {
          newState.waste = playerState.waste.slice(0, fromIndex);
          newState.tableau[toPileIndex] = [...playerState.tableau[toPileIndex], { ...card, faceUp: true }];
          moved = true;
        }
      }

      if (fromPile === 'waste' && pile.startsWith('foundation')) {
        const suit = pile.split('-')[1] as Suit;
        const card = playerState.waste[fromIndex];
        if (isValidFoundationMove(card, playerState.foundation[suit])) {
          newState.waste = playerState.waste.slice(0, fromIndex);
          newState.foundation[suit] = [...playerState.foundation[suit], card];
          moved = true;
        }
      }

      if (moved) {
        const updatedPlayerStates = { ...gameRoom.playerStates, [effectiveUserId]: { ...gameRoom.playerStates[effectiveUserId], state: newState } };
        await setDoc(roomRef, { playerStates: updatedPlayerStates }, { merge: true });
        if (playSoundRef.current) {
          playSoundRef.current.play().catch((err) => console.error("Audio playback failed:", err));
        }
        setSelectedCard(null);

        if (Object.values(newState.foundation).every(pile => pile.length === 13)) {
          const payout = betAmount * 2;
          const updatedPlayerStatesWin = {
            ...updatedPlayerStates,
            [effectiveUserId]: { ...updatedPlayerStates[effectiveUserId], won: true, payout, result: "Completed Solitaire!" },
          };
          await setDoc(roomRef, { playerStates: updatedPlayerStatesWin, phase: 'RESULT', result: `Player ${effectiveUserId.slice(0, 6)}...${effectiveUserId.slice(-4)} won!`, game: "solitaire" }, { merge: true });
          if (useJewels) {
            setJewels((prev) => prev + payout);
          } else {
            setGold((prev) => prev + payout);
          }
          const newStats = {
            plays: stats.plays + 1,
            wins: stats.wins + 1,
            biggestWin: Math.max(stats.biggestWin, payout),
            losses: stats.losses,
          };
          setStats(newStats);
          await logTransaction("deposit", payout);
          setBets((prev) => [
            ...prev.slice(0, -1),
            { ...prev[prev.length - 1], won: true, payout, result: "Completed Solitaire!" },
          ]);
          setShowReward({ jewels: payout, xp: 10, message: `Solitaire! You won +${payout} ${useJewels ? "JEWELS" : "USDT"}! Completed Solitaire!` });
          if (winSoundRef.current) {
            winSoundRef.current.play().catch((err) => console.error("Audio playback failed:", err));
          }

          const winQuest = quests.find((q) => q.id === "solitaire-wins");
          if (winQuest && !winQuest.completed) {
            const newProgress = Math.min(winQuest.progress + 1, winQuest.goal);
            const isQuestCompleted = newProgress >= winQuest.goal;
            setQuests((prev) =>
              prev.map((q) => (q.id === "solitaire-wins" ? { ...q, progress: newProgress, completed: isQuestCompleted } : q))
            );
            if (isQuestCompleted) {
              setJewels((prev) => prev + winQuest.rewardJEWELS);
              setShowReward({ jewels: winQuest.rewardJEWELS, xp: winQuest.rewardXP, message: `Quest Completed: ${winQuest.title}!` });
              await logTransaction("deposit", winQuest.rewardJEWELS);
              await updatePlayerFirestore({ quests, jewels: jewels + winQuest.rewardJEWELS });
              if (winSoundRef.current) winSoundRef.current.play().catch((err) => console.error("Audio playback failed:", err));
            }
          }

          const achievement = achievements.find((a) => a.id === "solitaire-master");
          if (achievement && !achievement.unlocked && newStats.wins >= 10) {
            setAchievements((prev) => prev.map((a) => (a.id === "solitaire-master" ? { ...a, unlocked: true } : a)));
            setJewels((prev) => prev + 20);
            setShowReward({ jewels: 20, xp: 30, message: "Achievement Unlocked: Solitaire Master!" });
            await logTransaction("deposit", 20);
            await updatePlayerFirestore({ achievements, jewels: jewels + 20 });
            if (winSoundRef.current) winSoundRef.current.play().catch((err) => console.error("Audio playback failed:", err));
          }

          const playQuest = quests.find((q) => q.id === "solitaire-play");
          if (playQuest && !playQuest.completed) {
            const newProgress = Math.min(playQuest.progress + 1, playQuest.goal);
            const isQuestCompleted = newProgress >= playQuest.goal;
            setQuests((prev) =>
              prev.map((q) => (q.id === "solitaire-play" ? { ...q, progress: newProgress, completed: isQuestCompleted } : q))
            );
            if (isQuestCompleted) {
              setJewels((prev) => prev + playQuest.rewardJEWELS);
              setShowReward({ jewels: playQuest.rewardJEWELS, xp: playQuest.rewardXP, message: `Quest Completed: ${playQuest.title}!` });
              await logTransaction("deposit", playQuest.rewardJEWELS);
              await updatePlayerFirestore({ quests, jewels: jewels + playQuest.rewardJEWELS });
              if (winSoundRef.current) winSoundRef.current.play().catch((err) => console.error("Audio playback failed:", err));
            }
          }
        }
      } else {
        setShowMessage("⚠️ Invalid move!");
        setSelectedCard(null);
      }
    } else {
      setSelectedCard({ pile, index });
    }
  };

  const handleStockClick = async (): Promise<void> => {
    if (!effectiveUserId || !gameRoomId || !gameRoom || gameRoom.phase !== 'PLAYING' || !gameRoom.playerStates[effectiveUserId]) return;
    const roomRef = doc(db, "GameRooms", gameRoomId);
    const playerState = gameRoom.playerStates[effectiveUserId].state;
    let newState = { ...playerState };

    if (playerState.stock.length > 0) {
      newState.stock = playerState.stock.slice(1);
      newState.waste = [{ ...playerState.stock[0], faceUp: true }, ...playerState.waste];
    } else if (playerState.waste.length > 0) {
      newState.stock = [...playerState.waste].reverse().map(card => ({ ...card, faceUp: false }));
      newState.waste = [];
    } else {
      return;
    }

    const updatedPlayerStates = { ...gameRoom.playerStates, [effectiveUserId]: { ...gameRoom.playerStates[effectiveUserId], state: newState } };
    await setDoc(roomRef, { playerStates: updatedPlayerStates }, { merge: true });
    if (playSoundRef.current) {
      playSoundRef.current.play().catch((err) => console.error("Audio playback failed:", err));
    }
  };

  const forfeitGame = async (): Promise<void> => {
    if (!effectiveUserId || !gameRoomId || !gameRoom || gameRoom.phase !== 'PLAYING') return;
    const roomRef = doc(db, "GameRooms", gameRoomId);
    const updatedPlayerStates = {
      ...gameRoom.playerStates,
      [effectiveUserId]: { ...gameRoom.playerStates[effectiveUserId], won: false, payout: 0, result: "Forfeited" },
    };
    await setDoc(roomRef, { playerStates: updatedPlayerStates, phase: 'RESULT', result: `Player ${effectiveUserId.slice(0, 6)}...${effectiveUserId.slice(-4)} forfeited`, game: "solitaire" }, { merge: true });
    const newStats = { plays: stats.plays + 1, losses: stats.losses + 1, wins: stats.wins, biggestWin: stats.biggestWin };
    setStats(newStats);
    setBets((prev) => [
      ...prev.slice(0, -1),
      { ...prev[prev.length - 1], won: false, payout: 0, result: "Forfeited" },
    ]);
    setShowReward({ jewels: 0, xp: 0, message: `😔 Forfeited game.` });

    const playQuest = quests.find((q) => q.id === "solitaire-play");
    if (playQuest && !playQuest.completed) {
      const newProgress = Math.min(playQuest.progress + 1, playQuest.goal);
      const isQuestCompleted = newProgress >= playQuest.goal;
      setQuests((prev) =>
        prev.map((q) => (q.id === "solitaire-play" ? { ...q, progress: newProgress, completed: isQuestCompleted } : q))
      );
      if (isQuestCompleted) {
        setJewels((prev) => prev + playQuest.rewardJEWELS);
        setShowReward({ jewels: playQuest.rewardJEWELS, xp: playQuest.rewardXP, message: `Quest Completed: ${playQuest.title}!` });
        await logTransaction("deposit", playQuest.rewardJEWELS);
        await updatePlayerFirestore({ quests, jewels: jewels + playQuest.rewardJEWELS });
        if (winSoundRef.current) winSoundRef.current.play().catch((err) => console.error("Audio playback failed:", err));
      }
    }

    await updatePlayerFirestore({ solitairePlays: newStats.plays, solitaireLosses: newStats.losses });
    if (autoPlay) {
      setTimeout(async () => {
        await resetGame();
        setTimeout(playGame, 1000);
      }, 2500);
    }
  };

  const resetGame = async (): Promise<void> => {
    if (!gameRoomId || !gameRoom || gameRoom.phase !== 'RESULT') return;
    const roomRef = doc(db, "GameRooms", gameRoomId);
    await setDoc(roomRef, {
      playerStates: {},
      phase: 'IDLE',
      result: "",
      game: "solitaire",
    }, { merge: true });
  };

  if (authLoading || isLoading || !gameRoom) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-gray-950 font-inter">
        <p>Loading Solitaire...</p>
      </div>
    );
  }

  return (
    <section className="relative py-16 px-6 sm:px-8 lg:px-16 bg-gradient-to-br from-gray-950 via-rose-950/20 to-black text-white overflow-hidden font-inter">
      {gameRoom.phase === 'RESULT' && gameRoom.playerStates[effectiveUserId!]?.won && (
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
            <Dices className="w-8 h-8 text-cyan-400 animate-pulse" /> Solitaire
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto mt-4 font-inter">
            Build foundations to win in the multiplayer PETverse Solitaire! Race to complete first! <Link to="/vault" className="text-cyan-400 hover:underline">Manage vault</Link>.
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
              {gameRoom.playerStates[playerId] ? `: ${gameRoom.playerStates[playerId].state.tableau.reduce((sum, pile) => sum + pile.length, 0)} cards` : ""}
              {gameRoom.phase === 'RESULT' && gameRoom.playerStates[playerId]?.won ? " (Won)" : ""}
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
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Play Solitaire"
          >
            <Dices className="w-6 h-6 text-cyan-400 animate-pulse" /> Play Solitaire
          </motion.button>
        </motion.div>

        <motion.div variants={sectionVariants} className="relative w-full h-[500px] mb-12 bg-gray-800 rounded-lg overflow-hidden flex flex-col items-center justify-center">
          <SwytchErrorBoundary>
            <div className="absolute inset-0 bg-gradient-to-r from-rose-500/20 to-cyan-500/20 rounded-lg" />
            <div className="relative w-full flex flex-col items-center">
              {gameRoom.phase === 'PLAYING' && !gameRoom.playerStates[effectiveUserId!]?.state && (
                <motion.div className="text-4xl text-cyan-400 font-bold font-poppins" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.5 }}>
                  Dealing...
                </motion.div>
              )}
              {gameRoom.phase === 'PLAYING' && gameRoom.playerStates[effectiveUserId!]?.state && (
                <div className="flex flex-col items-center w-full p-4">
                  <div className="flex justify-between w-full mb-4">
                    <div className="flex gap-2">
                      <motion.div
                        className="w-12 h-16 bg-gray-700 rounded-lg flex items-center justify-center cursor-pointer"
                        onClick={handleStockClick}
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        {gameRoom.playerStates[effectiveUserId!].state.stock.length > 0 ? '🂠' : '↻'}
                      </motion.div>
                      <div className="flex gap-1">
                        <SwytchErrorBoundary>
                          <Canvas style={{ width: "150px", height: "100px" }} camera={{ position: [0, 0, 5], fov: 50 }}>
                            <ambientLight intensity={0.5} />
                            <pointLight position={[10, 10, 10]} intensity={1} />
                            {gameRoom.playerStates[effectiveUserId!].state.waste.slice(0, 3).map((card, i) => (
                              <Card3D
                                key={`waste-${i}`}
                                card={card}
                                position={[i * 1 - 1, 0, 0]}
                                index={i}
                                isSelected={selectedCard?.pile === 'waste' && selectedCard.index === i}
                                onClick={() => handleCardClick('waste', i)}
                              />
                            ))}
                          </Canvas>
                        </SwytchErrorBoundary>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <SwytchErrorBoundary>
                        <Canvas style={{ width: "200px", height: "100px" }} camera={{ position: [0, 0, 5], fov: 50 }}>
                          <ambientLight intensity={0.5} />
                          <pointLight position={[10, 10, 10]} intensity={1} />
                          {(['hearts', 'diamonds', 'clubs', 'spades'] as Suit[]).map((suit, i) => (
                            <Card3D
                              key={`foundation-${suit}`}
                              card={gameRoom.playerStates[effectiveUserId!].state.foundation[suit].length > 0
                                ? gameRoom.playerStates[effectiveUserId!].state.foundation[suit][gameRoom.playerStates[effectiveUserId!].state.foundation[suit].length - 1]
                                : { suit, value: 'A', faceUp: true }}
                              position={[i * 1 - 1.5, 0, 0]}
                              index={i}
                              isSelected={selectedCard?.pile === `foundation-${suit}`}
                              onClick={() => handleCardClick(`foundation-${suit}`, 0)}
                            />
                          ))}
                        </Canvas>
                      </SwytchErrorBoundary>
                    </div>
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {gameRoom.playerStates[effectiveUserId!].state.tableau.map((pile, pileIndex) => (
                      <div key={`tableau-${pileIndex}`} className="flex flex-col">
                        <SwytchErrorBoundary>
                          <Canvas style={{ height: `${pile.length * 30 + 100}px` }} camera={{ position: [0, 0, 5], fov: 50 }}>
                            <ambientLight intensity={0.5} />
                            <pointLight position={[10, 10, 10]} intensity={1} />
                            {pile.map((card, cardIndex) => (
                              <Card3D
                                key={`${pileIndex}-${cardIndex}`}
                                card={card}
                                position={[0, -cardIndex * 0.3, 0]}
                                index={cardIndex}
                                isSelected={selectedCard?.pile === `tableau-${pileIndex}` && selectedCard.index === cardIndex}
                                onClick={() => card.faceUp && handleCardClick(`tableau-${pileIndex}`, cardIndex)}
                              />
                            ))}
                          </Canvas>
                        </SwytchErrorBoundary>
                      </div>
                    ))}
                  </div>
                  <motion.button
                    onClick={forfeitGame}
                    className="mt-4 px-6 py-3 bg-red-600 rounded-lg text-white font-semibold font-poppins hover:bg-red-700"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Forfeit Game"
                  >
                    Forfeit
                  </motion.button>
                </div>
              )}
              {gameRoom.phase === 'RESULT' && (
                <div className="flex flex-col items-center">
                  <div className="text-cyan-400 mb-1 font-poppins">Other Players</div>
                  <div className="flex flex-wrap gap-2">
                    {players
                      .filter((pid) => pid !== effectiveUserId)
                      .map((pid, _idx) => (
                        <div key={pid} className="flex flex-col">
                          <p className="text-cyan-400 font-inter">Player {address && pid === address.toLowerCase() ? `${address.slice(0, 6)}...${address.slice(-4)}` : `${pid.slice(0, 6)}...${pid.slice(-4)}`}</p>
                          <div className="grid grid-cols-7 gap-1">
                            <SwytchErrorBoundary>
                              <Canvas style={{ height: "150px" }} camera={{ position: [0, 0, 5], fov: 50 }}>
                                <ambientLight intensity={0.5} />
                                <pointLight position={[10, 10, 10]} intensity={1} />
                                {gameRoom.playerStates[pid]?.state.tableau.map((pile, pileIndex) => (
                                  <group key={`other-${pid}-${pileIndex}`} position={[pileIndex * 1 - 3, 0, 0]}>
                                    {pile.map((card, cardIndex) => (
                                      <Card3D
                                        key={`${pid}-${pileIndex}-${cardIndex}`}
                                        card={card}
                                        position={[0, -cardIndex * 0.3, 0]}
                                        index={cardIndex}
                                        isSelected={false}
                                        onClick={() => {}}
                                      />
                                    ))}
                                  </group>
                                ))}
                              </Canvas>
                            </SwytchErrorBoundary>
                          </div>
                        </div>
                      ))}
                  </div>
                  <motion.div
                    className="mt-4 text-cyan-400 text-xl font-poppins"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    {gameRoom.result}
                  </motion.div>
                  <motion.button
                    onClick={resetGame}
                    className="mt-4 px-6 py-3 bg-rose-600 rounded-lg text-white font-semibold font-poppins hover:bg-cyan-500"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Play Again"
                  >
                    Play Again
                  </motion.button>
                </div>
              )}
            </div>
          </SwytchErrorBoundary>
        </motion.div>

        {bets.length > 0 && (
          <motion.div variants={sectionVariants} className="mb-12">
            <h3 className="text-xl text-white font-bold mb-3 font-poppins">Recent Bets</h3>
            {bets.slice(-5).map((bet, i) => (
              <p key={`bet-${i}`} className={bet.won ? "text-green-400 font-inter" : "text-white font-inter"}>
                Bet: {bet.amount} {useJewels ? "JEWELS" : "USDT"} {bet.won ? `(Won ${bet.payout} - ${bet.result})` : `(${bet.result})`}
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
              aria-label="Share Solitaire Win on X"
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
            aria-label="Show Solitaire Tutorial"
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
              aria-label="Solitaire Tutorial Modal"
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
                  <Users className="w-6 h-6 text-cyan-400 animate-pulse" /> Solitaire Tutorial
                </h3>
                <div className="text-gray-200 text-sm space-y-4 font-inter">
                  <p><b>Objective:</b> Build four foundation piles from Ace to King by suit to win in a multiplayer race.</p>
                  <ul className="list-disc pl-6">
                    <li>Bet 10–1000 JEWELS or USDT.</li>
                    <li>Click "Play Solitaire" to start a Klondike game with other players.</li>
                    <li>Move cards: tableau to tableau (opposite color, descending), tableau/waste to foundation (same suit, ascending).</li>
                    <li>Click stock to draw cards to waste. First to complete all foundations wins 2x bet.</li>
                    <li>Forfeit if stuck. Auto-play continues games. Complete quests for rewards!</li>
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


export default SolitaireGame;

function setGameState(_phase: string) {
  throw new Error('Function not implemented.');
}
