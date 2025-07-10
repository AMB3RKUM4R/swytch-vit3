import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useEffect, useRef } from 'react';
import { Dices, Sparkles, Trophy, Users, Star, MessageCircleHeart, RefreshCcw } from 'lucide-react';
import { doc, getDoc, onSnapshot, setDoc, collection, addDoc, serverTimestamp, runTransaction } from 'firebase/firestore';
import { db, auth } from '../lib/firebaseConfig';
import { useNavigate, Link } from 'react-router-dom';
import { useModal } from '../context/ModalContext';
import { useAuthUser } from '../hooks/useAuthUser';
import { useAccount } from 'wagmi';
import { Canvas } from '@react-three/fiber';
import { Text, Cylinder } from '@react-three/drei';
import Modal from '../components/SwytchModal';
import AuthModal from '../components/AuthModal';
import PaymentModal from '../components/PaymentModal';
import SwytchErrorBoundary from '../components/ErrorBoundaryComponent';
import ConfettiExplosion from 'react-confetti-explosion';

// --- Type Definitions ---
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
  segments: string[];
  bets: { [userId: string]: { amount: number; result: string; won: boolean; payout: number } };
  phase: 'IDLE' | 'SPINNING' | 'RESULT';
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
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: 'easeOut', type: 'spring', stiffness: 100 } },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const flareVariants = {
  animate: { scale: [1, 1.3, 1], opacity: [0.5, 0.7, 0.5], transition: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' } },
};

const particleVariants = {
  animate: { y: [0, -8, 0], opacity: [0.4, 1, 0.4], transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' } },
};

const rewardVariants = {
  initial: { opacity: 0, scale: 0.8, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4 } },
  exit: { opacity: 0, scale: 0.8, y: -20, transition: { duration: 0.3 } },
};

// --- Initial Data ---
const initialQuests: Quest[] = [
  { id: "fortuneWheel-wins", title: "Win 3 Fortune Wheel Spins", progress: 0, goal: 3, rewardJEWELS: 10, rewardXP: 15, completed: false },
  { id: "fortuneWheel-play", title: "Play 5 Fortune Wheel Rounds", progress: 0, goal: 5, rewardJEWELS: 5, rewardXP: 10, completed: false },
  { id: "fortuneWheel-share", title: "Share Fortune Wheel Win on X", progress: 0, goal: 1, rewardJEWELS: 5, rewardXP: 5, completed: false },
];

const initialAchievements: Achievement[] = [
  { id: "fortuneWheel-master", title: "Fortune Wheel Master", description: "Win 10 multiplayer Fortune Wheel games.", unlocked: false },
];

const mockXPosts: { username: string; content: string; likes: number; timestamp: string }[] = [
  { username: "@PETversePlayer", content: "Hit the Jackpot on Fortune Wheel in Swytch PETverse! 🎡 #SwytchPETverse", likes: 110, timestamp: "2025-07-08T14:00:00Z" },
  { username: "@CryptoGamerX", content: "Spinning the Fortune Wheel in PETverse is a blast! Join now! #SwytchPET", likes: 150, timestamp: "2025-07-07T13:15:00Z" },
];

// Segments for the Fortune Wheel
const segments = ['100 JEWELS', '5x', 'Jackpot', 'Try Again', '200 JEWELS', '2x', '50 JEWELS', '10x'];

// Function to generate spin result based on a seed
const generateSpinResult = (seed: string, segmentsArray: string[]): string => {
  const hash = Array.from(seed).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return segmentsArray[Math.abs(Math.floor(Math.sin(hash) * 10000)) % segmentsArray.length];
};

// --- 3D Wheel Segment Component ---
const WheelSegment3D: React.FC<{ segment: string; index: number; totalSegments: number }> = ({ segment, index, totalSegments }) => {
  const angle = (index / totalSegments) * Math.PI * 2;
  return (
    <group rotation={[0, 0, angle]}>
      <Cylinder args={[2, 2, 0.2, 32]} position={[0, 0, 0]} castShadow>
        <meshStandardMaterial color={index % 2 === 0 ? "#f43f5e" : "#22d3ee"} roughness={0.3} metalness={0.5} />
      </Cylinder>
      <Text position={[1.5, 0, 0.3]} fontSize={0.3} color="#ffffff" anchorX="center" anchorY="middle" rotation={[0, 0, -angle]}>
        {segment}
      </Text>
    </group>
  );
};

// Removed PhagocytosisEffect as it was not used in this component.
// Removed useDebounce as it was not used in this component.

interface FortuneWheelProps {
  userId: string | null;
  setIsPETMember: React.Dispatch<React.SetStateAction<boolean>>;
  updatePlayerFirestore: (updates: Partial<any>) => Promise<void>;
}

const FortuneWheel: React.FC<FortuneWheelProps> = ({ userId, setIsPETMember, updatePlayerFirestore }) => {
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
  const [players] = useState<string[]>([]);
  const [betAmount, setBetAmount] = useState<number>(10);
  const [useJewels, setUseJewels] = useState<boolean>(true);
  const [autoPlay, setAutoPlay] = useState<boolean>(false);
  const [] = useState<Bet[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const winSoundRef = useRef<HTMLAudioElement | null>(null);
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
        await mockBackendLogTransaction("withdraw", bet, useJewelsCurrency ? "JEWELS" : "USDT", "fortune-wheel", userId); // Game name updated

        // Simulate spin result and update game room state
        const newResult = generateSpinResult(Date.now().toString(), segments); // Use segments from global variable
        const updatedBets = { ...roomData.bets, [userId]: { amount: bet, result: newResult, won: false, payout: 0 } };

        transaction.update(roomRef, {
          bets: updatedBets,
          phase: 'SPINNING',
          result: "", // Clear previous result
        });

        setShowMessage("🎡 Spinning the wheel...");
        if (winSoundRef.current) { // Use winSoundRef as playSoundRef is removed
          winSoundRef.current.play().catch((err) => console.error("Audio playback failed:", err));
        }

        // Simulate game result after a delay (this part would be complex backend logic)
        setTimeout(async () => {
          await runTransaction(db, async (innerTransaction) => {
            const currentRoomSnap = await innerTransaction.get(roomRef);
            if (!currentRoomSnap.exists()) return;
            const currentRoomData = currentRoomSnap.data() as GameRoom;

            let payout = 0;
            if (newResult === 'Jackpot') payout = bet * 1000;
            else if (newResult.match(/(\d+)x/)) payout = bet * parseInt(newResult);
            else if (newResult.match(/(\d+)\s*JEWELS/)) payout = parseInt(newResult);
            const won = payout > 0;
            const finalPlayerBet = { ...currentRoomData.bets[userId], won, payout, result: newResult };
            const finalBets = { ...currentRoomData.bets, [userId]: finalPlayerBet };

            innerTransaction.update(roomRef, {
              bets: finalBets,
              phase: 'RESULT',
              result: newResult,
            });

            // Update player stats and give rewards
            const currentUserSnap = await innerTransaction.get(userRef);
            const currentUserData = currentUserSnap.data();
            if (!currentUserData) return;

            const newStats = {
              plays: (currentUserData.fortuneWheelPlays || 0) + 1, // Updated stat name
              wins: won ? (currentUserData.fortuneWheelWins || 0) + 1 : (currentUserData.fortuneWheelWins || 0), // Updated stat name
              losses: won ? (currentUserData.fortuneWheelLosses || 0) : (currentUserData.fortuneWheelLosses || 0) + 1, // Updated stat name
              biggestWin: Math.max((currentUserData.fortuneWheelBiggestWin || 0), payout), // Updated stat name
            };
            innerTransaction.update(userRef, {
              fortuneWheelPlays: newStats.plays, // Updated stat name
              fortuneWheelWins: newStats.wins, // Updated stat name
              fortuneWheelLosses: newStats.losses, // Updated stat name
              fortuneWheelBiggestWin: newStats.biggestWin, // Updated stat name
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
              await mockBackendLogTransaction("deposit", payout, rewardCurrency, "fortune-wheel_win", userId); // Game name updated
              setShowReward({ jewels: payout, xp: 10, message: `Fortune Wheel! You won +${payout} ${rewardCurrency}!` }); // Game name updated
              if (winSoundRef.current) winSoundRef.current.play().catch((err) => console.error("Audio playback failed:", err));

              // Quest and Achievement updates
              let currentQuests = currentUserData.quests || initialQuests;
              const winQuest = currentQuests.find((q: Quest) => q.id === "fortuneWheel-wins"); // Updated quest ID
              if (winQuest && !winQuest.completed) {
                const newProgress = Math.min(winQuest.progress + 1, winQuest.goal);
                const isQuestCompleted = newProgress >= winQuest.goal;
                currentQuests = currentQuests.map((q: Quest) => (q.id === "fortuneWheel-wins" ? { ...q, progress: newProgress, completed: isQuestCompleted } : q)); // Updated quest ID
                innerTransaction.update(userRef, { quests: currentQuests });
                if (isQuestCompleted) {
                  const rewardAmount = winQuest.rewardJEWELS;
                  innerTransaction.update(userRef, { jewels: (currentUserData.jewels || 0) + rewardAmount });
                  setShowReward({ jewels: rewardAmount, xp: winQuest.rewardXP, message: `Quest Completed: ${winQuest.title}!` });
                  await mockBackendLogTransaction("deposit", rewardAmount, "JEWELS", "fortuneWheel_quest", userId); // Game name updated
                }
              }

              let currentAchievements = currentUserData.achievements || initialAchievements;
              const achievement = currentAchievements.find((a: Achievement) => a.id === "fortuneWheel-master"); // Updated achievement ID
              if (achievement && !achievement.unlocked && newStats.wins >= 10) {
                currentAchievements = currentAchievements.map((a: Achievement) => (a.id === "fortuneWheel-master" ? { ...a, unlocked: true } : a)); // Updated achievement ID
                innerTransaction.update(userRef, { achievements: currentAchievements });
                const achievementRewardJewels = 20;
                const achievementRewardXP = 30;
                innerTransaction.update(userRef, { jewels: (currentUserData.jewels || 0) + achievementRewardJewels });
                setShowReward({ jewels: achievementRewardJewels, xp: achievementRewardXP, message: "Achievement Unlocked: Fortune Wheel Master!" });
                await mockBackendLogTransaction("deposit", achievementRewardJewels, "JEWELS", "fortuneWheel_achievement", userId); // Game name updated
              }
            } else {
              setShowMessage(`😔 No win. ${newResult}`);
            }

            // Update play quest regardless of win/loss
            let currentQuestsForPlay = currentUserData.quests || initialQuests; // Re-fetch or pass updated quests
            const playQuest = currentQuestsForPlay.find((q: Quest) => q.id === "fortuneWheel-play"); // Updated quest ID
            if (playQuest && !playQuest.completed) {
              const newProgress = Math.min(playQuest.progress + 1, playQuest.goal);
              const isQuestCompleted = newProgress >= playQuest.goal;
              currentQuestsForPlay = currentQuestsForPlay.map((q: Quest) => (q.id === "fortuneWheel-play" ? { ...q, progress: newProgress, completed: isQuestCompleted } : q)); // Updated quest ID
              innerTransaction.update(userRef, { quests: currentQuestsForPlay });
              if (isQuestCompleted) {
                const rewardAmount = playQuest.rewardJEWELS;
                innerTransaction.update(userRef, { jewels: (currentUserData.jewels || 0) + rewardAmount });
                setShowReward({ jewels: rewardAmount, xp: playQuest.rewardXP, message: `Quest Completed: ${playQuest.title}!` });
                await mockBackendLogTransaction("deposit", rewardAmount, "JEWELS", "fortuneWheel_quest", userId); // Game name updated
              }
            }

            // Reset game room for next round if autoPlay is enabled
            if (autoPlay) {
              setTimeout(async () => {
                await setDoc(roomRef, {
                  segments, // Reset segments
                  bets: {},
                  phase: 'IDLE',
                  result: "",
                  players: currentRoomData.players, // Keep current players
                  game: "fortune-wheel",
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
        segments, // Reset segments
        bets: {},
        phase: 'IDLE',
        result: "",
        players: gameRoom?.players || [], // Keep current players
        game: "fortune-wheel",
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
    const shareQuest = quests.find((q: Quest) => q.id === "fortuneWheel-share"); // Explicitly type q
    if (shareQuest && !shareQuest.completed) {
      const shareText = encodeURIComponent("Just won big on the Fortune Wheel in Swytch PETverse! 🎡 Join at swytch.io! #SwytchPETverse #FortuneWheel");
      window.open(`https://x.com/intent/tweet?text=${shareText}`, "_blank");
      setQuests((prev) => prev.map((q) => (q.id === "fortuneWheel-share" ? { ...q, progress: 1, completed: true } : q)));
      setJewels((prev) => prev + shareQuest.rewardJEWELS);
      setShowReward({ jewels: shareQuest.rewardJEWELS, xp: shareQuest.rewardXP, message: `Quest Completed: ${shareQuest.title}!` });
      await mockBackendLogTransaction("deposit", shareQuest.rewardJEWELS, "JEWELS", "fortuneWheel_share_quest", effectiveUserId); // Updated game name
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
          plays: data.fortuneWheelPlays || 0, // Updated stat name
          wins: data.fortuneWheelWins || 0, // Updated stat name
          losses: data.fortuneWheelLosses || 0, // Updated stat name
          biggestWin: data.fortuneWheelBiggestWin || 0, // Updated stat name
        });

        const roomsQuery = collection(db, "GameRooms");
        const unsubscribeRooms = onSnapshot(roomsQuery, (snapshot) => {
          let foundRoom: GameRoom | null = null;
          snapshot.forEach((docSnap) => {
            const roomData = docSnap.data() as GameRoom;
            // Check if player is already in a fortune-wheel room or if there's a waiting fortune-wheel room to join
            if (roomData.game === "fortune-wheel" && roomData.players && effectiveUserId in roomData.players) {
              foundRoom = { ...roomData, roomId: docSnap.id };
            } else if (roomData.game === "fortune-wheel" && roomData.phase === "IDLE" && Object.keys(roomData.bets).length < 4) { // Max 4 players for Fortune Wheel (bets in this case)
              foundRoom = { ...roomData, roomId: docSnap.id };
            }
          });

          if (foundRoom) {
            // As per user request: if any Fortune Wheel room is found, redirect to homepage.
            // WARNING: This will prevent the Fortune Wheel game from being played if any room exists.
            // If the intent is to play, this logic needs to be reverted or re-designed.
            navigate('/'); // Redirect to homepage
            setShowMessage("A Fortune Wheel game room was found, redirecting to homepage.");
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
          fortuneWheelPlays: stats.plays, // Updated stat name
          fortuneWheelWins: stats.wins, // Updated stat name
          fortuneWheelLosses: stats.losses, // Updated stat name
          fortuneWheelBiggestWin: stats.biggestWin, // Updated stat name
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
    // playSoundRef.current = new Audio("/audio/reward.mp3"); // playSoundRef is not used in this component.
    winSoundRef.current = new Audio("/audio/reward.mp3"); // Assuming this is specifically for win sounds
    return () => {
      // playSoundRef.current?.pause(); // playSoundRef is not used in this component.
      winSoundRef.current?.pause();
    };
  }, []);


  if (authLoading || isLoading || !effectiveUserId) { // Added !effectiveUserId to loading check for initial state
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-gray-950 font-inter">
        <p>Loading Fortune Wheel...</p>
      </div>
    );
  }

  return (
    <section className="relative py-16 px-6 sm:px-8 lg:px-16 bg-gradient-to-br from-gray-950 via-rose-950/20 to-black text-white overflow-hidden font-inter">
      {gameRoom?.phase === 'RESULT' && gameRoom.bets[effectiveUserId!]?.won && ( // Added null check for gameRoom
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
            <Dices className="w-8 h-8 text-cyan-400 animate-pulse" /> Fortune Wheel
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto mt-4 font-inter">
            Spin the wheel in the multiplayer PETverse! Win up to 1000x your bet! <Link to="/vault" className="text-cyan-400 hover:underline">Manage vault</Link>.
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
              {gameRoom?.bets[playerId] ? `: Bet ${gameRoom.bets[playerId].amount} ${useJewels ? "JEWELS" : "USDT"}` : ""}
              {gameRoom?.phase === 'RESULT' && gameRoom.bets[playerId]?.won ? ` (Won ${gameRoom.bets[playerId].payout})` : ""}
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
            aria-label="Spin Fortune Wheel"
          >
            <Dices className="w-6 h-6 text-cyan-400 animate-pulse" /> Spin
          </motion.button>
        </motion.div>

        <motion.div variants={sectionVariants} className="relative w-full h-[300px] mb-12 bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
          <SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}>
            <div className="absolute inset-0 bg-gradient-to-r from-rose-500/20 to-cyan-500/20 rounded-lg" />
            <div className="relative w-full flex flex-col items-center">
              {gameRoom?.phase === 'SPINNING' ? (
                <motion.div initial={{ rotate: 0 }} animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                  <Canvas style={{ height: "200px", width: "100%" }} camera={{ position: [0, 0, 5], fov: 50 }}>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} intensity={1} />
                    {segments.map((segment, index) => (
                      <WheelSegment3D key={`segment-${index}`} segment={segment} index={index} totalSegments={segments.length} />
                    ))}
                  </Canvas>
                </motion.div>
              ) : gameRoom?.result && (
                <motion.div className="text-4xl text-cyan-400 font-bold font-poppins" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.5 }}>
                  {gameRoom.result}
                </motion.div>
              )}
              {gameRoom?.bets && effectiveUserId && gameRoom.bets[effectiveUserId] && (
                <motion.div variants={sectionVariants} className="text-center text-white font-inter mt-4">
                  <p>Last Bet: {gameRoom.bets[effectiveUserId].amount} {useJewels ? "JEWELS" : "USDT"} {gameRoom.bets[effectiveUserId].won ? `(Won ${gameRoom.bets[effectiveUserId].payout})` : `(${gameRoom.bets[effectiveUserId].result})`}</p>
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
              aria-label="Share Fortune Wheel Win on X"
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
            <Modal title="Multiplayer Fortune Wheel Tutorial" onClose={() => setShowTutorial(false)}>
              <div className="text-gray-200 text-sm space-y-4 font-inter">
                <p><b>Objective:</b> Spin the wheel in a multiplayer game to win JEWELS or multipliers!</p>
                <ul className="list-disc pl-6">
                  <li>Bet 10–1000 JEWELS or USDT.</li>
                  <li>Spin the wheel to land on rewards like 100 JEWELS, 5x, or Jackpot (1000x).</li>
                  <li>Win payouts based on the wheel’s result.</li>
                  <li>Auto-play continues spins until disabled.</li>
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

export default FortuneWheel;
function setGameState(_arg0: string) {
  throw new Error('Function not implemented.');
}

