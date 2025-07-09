import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Dices, Trophy, Users, Sparkles, Star, MessageCircleHeart, X, RefreshCcw } from 'lucide-react'; // Added RefreshCcw
import { doc, getDoc, onSnapshot, setDoc, collection, addDoc, serverTimestamp, getDocs, QueryDocumentSnapshot, runTransaction } from 'firebase/firestore'; // Added runTransaction
import { db, auth } from '../lib/firebaseConfig'; // Corrected path
import { useNavigate, Link } from 'react-router-dom';
import { useModal } from '../context/ModalContext'; // Corrected path
import { useAuthUser } from '../hooks/useAuthUser'; // Corrected path
import { useAccount } from 'wagmi';
import { Canvas } from '@react-three/fiber';
import { Box, Text } from '@react-three/drei'; // Only Box and Text are needed for Card3D
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
  numericValue: number; // Added numericValue for Red Dog logic
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
  playerHands: { [userId: string]: { hand: Card[]; bet: number; won: boolean; payout: number; result: string } };
  phase: 'IDLE' | 'PLAYING' | 'RESULT';
  result: string; // Overall game result message
  players: string[];
  game: string;
  roomId: string; // Added roomId for consistency
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



// Define a full deck with numeric values for Red Dog
const fullDeck: Card[] = (
  ['hearts', 'diamonds', 'clubs', 'spades'] as const
).flatMap(suit =>
  (['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'] as const).map(value => {
    const numericValue = value === 'A' ? 14 : (['K'].includes(value) ? 13 : (['Q'].includes(value) ? 12 : (['J'].includes(value) ? 11 : parseInt(value))));
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

// --- 3D Card Component for Red Dog ---
const Card3D: React.FC<{ card: Card; position: [number, number, number]; faceUp: boolean }> = ({ card, position, faceUp }) => {
  return (
    <group position={position}>
      <Box args={[0.8, 1.2, 0.05]} castShadow>
        <meshStandardMaterial color="#ffffff" roughness={0.3} metalness={0.2} />
      </Box>
      <Text position={[0, 0, 0.06]} fontSize={0.3} color={card.suit === 'hearts' || card.suit === 'diamonds' ? "#f43f5e" : "#000000"} anchorX="center" anchorY="middle">
        {faceUp ? cardToEmoji(card) : '🂠'}
      </Text>
    </group>
  );
};

interface RedDogGameProps {
  userId: string | null;
  activeModal: string | null;
  setActiveModal: React.Dispatch<React.SetStateAction<string | null>>;
  setShowMessage: React.Dispatch<React.SetStateAction<string>>;
  setIsPETMember: React.Dispatch<React.SetStateAction<boolean>>;
  updatePlayerFirestore: (updates: Partial<any>) => Promise<void>;
}

const RedDogGame: React.FC<RedDogGameProps> = ({ userId, activeModal, setActiveModal, setShowMessage, setIsPETMember, updatePlayerFirestore }) => {
  const { user: firebaseAuthUser, loading: authLoading } = useAuthUser();
  const { address } = useAccount();
  // activeModal, setActiveModal, setShowMessage are already destructured from props
  const [jewels, setJewels] = useState<number>(0);
  const [gold, setGold] = useState<number>(0);
  const [stats, setStats] = useState<Stats>({ plays: 0, wins: 0, losses: 0, biggestWin: 0 });
  const [showTutorial, setShowTutorial] = useState<boolean>(false);
  const [gameRoom, setGameRoom] = useState<GameRoom | null>(null);
  const [gameRoomId, setGameRoomId] = useState<string | null>(null);
  const [players, setPlayers] = useState<string[]>([]);
  const [betAmount, setBetAmount] = useState<number>(10);
  const [useJewels, setUseJewels] = useState<boolean>(true);
  const [bets, setBets] = useState<Bet[]>([]);
  const [localShowMessage, setLocalShowMessage] = useState<string>(""); // Use local state for message display
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
        userId: effectiveUserId!, // Use effectiveUserId here with non-null assertion
        amount,
        currency,
        transactionType: type,
        status: "pending",
        timestamp: serverTimestamp(),
        game,
        adminId,
      });
      setShowMessage(`✅ ${type === "deposit" ? "Win" : "Bet"} of ${amount} ${currency} submitted! Admin (0CfobCbXnPZsJwT662H4OhDrXk33) will process.`);
      setLocalShowMessage(`✅ ${type === "deposit" ? "Win" : "Bet"} of ${amount} ${currency} submitted! Awaiting admin verification.`);
    } catch (err) {
      console.error("Error logging transaction:", err);
      setShowMessage("⚠️ Failed to log transaction.");
      setLocalShowMessage("⚠️ Failed to log transaction.");
      setActiveModal("error");
    }
  };

  // Game logic for Red Dog
  const playGame = async (): Promise<void> => {
    if (!effectiveUserId || !gameRoomId) {
      setShowMessage("⚠️ Please sign in to play!");
      setLocalShowMessage("⚠️ Please sign in to play!");
      setActiveModal("auth");
      navigate("/auth");
      return;
    }
    if (gameRoom?.phase !== 'IDLE') {
      setShowMessage("⚠️ Game in progress!");
      setLocalShowMessage("⚠️ Game in progress!");
      setActiveModal("error");
      return;
    }
    if (betAmount < 10 || betAmount > 1000) {
      setShowMessage("⚠️ Bet amount must be between 10 and 1000!");
      setLocalShowMessage("⚠️ Bet amount must be between 10 and 1000!");
      setActiveModal("error");
      return;
    }
    if ((useJewels && jewels < betAmount) || (!useJewels && gold < betAmount)) {
      setShowMessage(`⚠️ Not enough ${useJewels ? "JEWELS" : "GOLD"}! Please deposit.`);
      setLocalShowMessage(`⚠️ Not enough ${useJewels ? "JEWELS" : "GOLD"}! Please deposit.`);
      setActiveModal("payment");
      navigate("/payment");
      return;
    }
    const roomRef = doc(db, "GameRooms", gameRoomId);
    const roomSnap = await getDoc(roomRef);
    if (!roomSnap.exists()) return;
    const roomData = roomSnap.data() as GameRoom;
    if (roomData.phase !== 'IDLE') return;

    const newDeck = shuffleDeck(Date.now().toString());
    const playerHand = newDeck.slice(0, 3); // Deal 3 cards for Red Dog
    
    // Determine Red Dog outcome
    const v1 = playerHand[0].numericValue;
    const v2 = playerHand[1].numericValue;
    const v3 = playerHand[2].numericValue;

    const minVal = Math.min(v1, v2);
    const maxVal = Math.max(v1, v2);
    const spread = (maxVal - minVal) - 1; // Number of values between the two cards

    let won = false, payout = 0, result = '';

    if (v1 === v2) { // Pair
      if (v3 === v1) { // Three of a kind
        won = true;
        payout = betAmount * 11; // 11:1 payout for three of a kind
        result = `Three of a Kind! ${cardToEmoji(playerHand[0])} ${cardToEmoji(playerHand[1])} ${cardToEmoji(playerHand[2])}. You win 11x!`;
      } else {
        result = `Pair. ${cardToEmoji(playerHand[0])} ${cardToEmoji(playerHand[1])}. No win.`;
        won = false;
        payout = 0; // Bet is returned on a pair if third card is not the same value
      }
    } else if (spread <= 0) { // Adjacent cards (spread 0) or same cards (spread -1)
      result = 'No Spread. Push.';
      won = true; // Bet is returned on a push
      payout = betAmount;
    } else if (v3 > minVal && v3 < maxVal) { // Third card is between the first two
      won = true;
      // Payout based on spread
      if (spread === 1) payout = betAmount * 5; // 1 card spread (e.g., 7-9, 8 is between)
      else if (spread === 2) payout = betAmount * 4; // 2 card spread
      else if (spread === 3) payout = betAmount * 2; // 3 card spread
      else payout = betAmount * 1; // 4+ card spread (1:1)
      
      result = `Win! Spread ${spread}. ${cardToEmoji(playerHand[2])} is between ${cardToEmoji(playerHand[0])} and ${cardToEmoji(playerHand[1])}.`;
    } else {
      result = `Lose. ${cardToEmoji(playerHand[2])} not between ${cardToEmoji(playerHand[0])} and ${cardToEmoji(playerHand[1])}.`;
      won = false;
      payout = 0;
    }

    const updatedPlayerHands = { ...roomData.playerHands, [effectiveUserId]: { hand: playerHand, bet: betAmount, won, payout, result } }; // Use effectiveUserId here
    await setDoc(roomRef, {
      deck: newDeck.slice(3), // Remove dealt cards from deck
      playerHands: updatedPlayerHands,
      phase: 'PLAYING', // Set phase to PLAYING while showing cards
      result: "", // Clear overall room result until final
    }, { merge: true });

    if (useJewels) {
      setJewels((prev) => prev - betAmount);
    } else {
      setGold((prev) => prev - betAmount);
    }
    await mockBackendLogTransaction("withdraw", betAmount, useJewels ? "JEWELS" : "USDT", "red-dog", effectiveUserId!); // Use USDT for gold, effectiveUserId!
    setBets((prev) => [...prev, { amount: betAmount, won: false, payout: 0, result: "" }]); // Add initial bet to local history
    if (playSoundRef.current) {
      playSoundRef.current.play().catch((_err: unknown) => console.error("Audio playback failed:", _err));
    }

    // Simulate result display and update after a delay
    setTimeout(async () => {
      await setDoc(roomRef, { phase: 'RESULT', result }, { merge: true }); // Update room with final result
      
      let newStats: Stats; // Declare newStats here to ensure it's in scope
      if (payout > 0) {
        if (useJewels) {
          setJewels((prev) => prev + payout);
        } else {
          setGold((prev) => prev + payout);
        }
        newStats = { // Initialize newStats
          plays: stats.plays + 1,
          wins: stats.wins + 1,
          losses: stats.losses,
          biggestWin: Math.max(stats.biggestWin, payout),
        };
        setStats(newStats);
        await mockBackendLogTransaction("deposit", payout, useJewels ? "JEWELS" : "USDT", "red-dog_win", effectiveUserId!); // effectiveUserId!
        setShowMessage(`🎉 Won ${payout} ${useJewels ? "JEWELS" : "USDT"}! ${result}`);
        setLocalShowMessage(`🎉 Won ${payout} ${useJewels ? "JEWELS" : "USDT"}! ${result}`);
        if (winSoundRef.current) {
          winSoundRef.current.play().catch((_err: unknown) => console.error("Audio playback failed:", _err));
        }
      } else {
        newStats = { // Initialize newStats
          plays: stats.plays + 1,
          wins: stats.wins,
          losses: stats.losses + 1,
          biggestWin: stats.biggestWin,
        };
        setStats(newStats);
        setShowMessage(`😔 No win. ${result}`);
        setLocalShowMessage(`😔 No win. ${result}`);
      }

      // Update player Firestore stats
      await updatePlayerFirestore({
        redDogPlays: newStats.plays, // Now newStats is defined
        redDogWins: newStats.wins,
        redDogLosses: newStats.losses,
        redDogBiggestWin: newStats.biggestWin,
      });

      // Reset game room for next round after a delay
      setTimeout(async () => {
        await setDoc(roomRef, {
          deck: shuffleDeck((Date.now() + 1).toString()),
          playerHands: {},
          phase: 'IDLE',
          result: "",
        }, { merge: true });
        // After reset, update local state for bets to reflect the won/lost status
        setBets((prev) => prev.map((bet, i) => (i === prev.length - 1 ? { ...bet, won, payout, result } : bet)));
      }, 2500); // Delay before resetting game room
    }, 2000); // Delay before showing result
  };

  const resetGame = async (roomId: string): Promise<void> => { // Accept roomId
    if (!roomId) return;
    const roomRef = doc(db, "GameRooms", roomId);
    await setDoc(roomRef, {
      deck: shuffleDeck(Date.now().toString()),
      playerHands: {},
      phase: 'IDLE',
      result: "",
      game: "red-dog",
    }, { merge: true });
    setGameRoom(null); // Clear gameRoom state to trigger re-initialization
    setGameRoomId(null); // Clear gameRoomId
    setIsLoading(true); // Set loading to true to re-initiate fetchUserData
    setShowMessage("Game reset. Ready for a new round!");
  };

  if (authLoading || isLoading || !effectiveUserId) { // Added !effectiveUserId to loading check for initial state
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-gray-950 font-inter">
        <p>Loading Red Dog...</p>
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
            particleCount={200}
            width={1600}
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
          className="absolute w-96 h-96 bg-gradient-to-br from-rose-400/50 via-pink-500/40 to-cyan-500/30 rounded-full opacity-30 blur-3xl"
          variants={flareVariants}
          animate="animate"
          style={{ top: "33%", left: "33%" }}
        />
        <motion.div
          className="absolute w-64 h-64 bg-gradient-to-br from-cyan-400/40 via-rose-500/30 to-pink-400/20 rounded-full opacity-20 blur-2xl"
          variants={flareVariants}
          animate="animate"
          style={{ top: "50%", right: "25%" }}
        />
        <div className="absolute inset-0 bg-[url('/noise.png')] bg-repeat bg-[length:64px_64px] opacity-15" />
        {[...Array(10)].map((_, _i: number) => (
          <motion.div
            key={_i}
            className="absolute w-1.5 h-1.5 bg-rose-400 rounded-full opacity-30"
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
            <Dices className="w-8 h-8 animate-pulse" /> Red Dog
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto mt-4 font-inter">
            Bet on the third card falling between the first two in the multiplayer PETverse Red Dog!
          </p>
          <p className="text-sm text-rose-300 italic mt-2 font-inter">
            💎 JEWELS: {jewels} | 🪙 GOLD: {gold}
          </p>
        </motion.div>

        <motion.div variants={sectionVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12 bg-gray-900/60 p-6 rounded-2xl border border-rose-500/20 backdrop-blur-md">
          <div className="flex flex-col">
            <label className="text-white font-semibold mb-2 font-poppins">Bet Amount</label>
            <select
              value={betAmount}
              onChange={(e) => setBetAmount(Number(e.target.value))}
              className="bg-gray-800 text-white rounded-lg px-3 py-2 border border-rose-500/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-500 outline-none font-inter"
              disabled={gameRoom?.phase !== 'IDLE'} // Added null check
            >
              {[10, 50, 100, 250, 500, 1000].map((b) => (
                <option key={b} value={b}>
                  {b} {useJewels ? "JEWELS" : "GOLD"}
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
                disabled={gameRoom?.phase !== 'IDLE'} // Added null check
              />
              <label className="text-white font-semibold font-poppins">Use JEWELS (INR)</label>
            </div>
          </div>
        </motion.div>

        <motion.div variants={sectionVariants} className="mb-12 bg-gray-900/60 p-4 rounded-2xl border border-rose-500/20 backdrop-blur-md">
          <h3 className="text-xl text-white font-bold mb-3 font-poppins flex items-center gap-2">
            <Users className="w-6 h-6 text-rose-400 animate-pulse" /> Players
          </h3>
          {players.map((playerId, _i) => (
            <p key={_i} className="text-rose-400 font-inter">
              Player {playerId.slice(0, 6)}...{playerId.slice(-4)}
              {gameRoom?.playerHands[playerId] ? `: ${gameRoom.playerHands[playerId].hand.length} cards` : ""}
              {gameRoom?.phase === 'RESULT' && gameRoom.playerHands[playerId]?.won ? " (Won)" : ""}
            </p>
          ))}
        </motion.div>

        <motion.div variants={sectionVariants} className="flex justify-between items-center mb-12 bg-gray-900/60 p-4 rounded-2xl border border-rose-500/20 backdrop-blur-md">
          <div className="text-lg text-white font-semibold font-poppins">
            JEWELS: <span className="text-rose-400">{jewels}</span> | GOLD: <span className="text-rose-400">{gold}</span>
          </div>
          <motion.button
            onClick={playGame}
            disabled={gameRoom?.phase !== 'IDLE'} // Added null check
            className={gameRoom?.phase !== 'IDLE' ? "px-8 py-4 bg-gray-600 text-white rounded-md font-semibold flex items-center justify-center gap-2 font-poppins cursor-not-allowed" : "px-8 py-4 bg-rose-600 text-white rounded-md font-semibold flex items-center justify-center gap-2 font-poppins hover:bg-rose-700"}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Play Red Dog"
          >
            <Dices className="w-6 h-6 animate-pulse" /> Play Red Dog
          </motion.button>
        </motion.div>

        <motion.div variants={sectionVariants} className="relative w-full h-[300px] mb-12 bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
          <SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}>
            <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-indigo-500/10 rounded-lg" />
            <div className="relative w-full flex flex-col items-center">
              {gameRoom?.phase === 'PLAYING' && ( // Added null check
                <motion.div className="text-4xl text-rose-400 font-bold font-poppins" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.5 }}>
                  Dealing...
                </motion.div>
              )}
              {(gameRoom?.phase === 'RESULT' || (gameRoom?.playerHands && effectiveUserId && gameRoom.playerHands[effectiveUserId]?.hand.length > 0)) && ( // Added null checks
                <div className="flex flex-col items-center">
                  <div className="text-rose-400 mb-1 font-poppins">Your Cards</div>
                  <div className="flex gap-2 mb-4">
                    {gameRoom?.playerHands[effectiveUserId!]?.hand.map((card, i) => ( // Added null check
                      <Card3D
                        key={i}
                        card={card}
                        position={[i * 1 - (gameRoom.playerHands[effectiveUserId!].hand.length - 1) / 2, 0, 0]}
                        faceUp={gameRoom.phase === 'RESULT' || gameRoom.phase === 'PLAYING'} // Show cards during PLAYING and RESULT
                      />
                    ))}
                  </div>
                  <div className="text-rose-400 mb-1 font-poppins">Other Players</div>
                  <div className="flex flex-wrap gap-2">
                    {players
                      .filter((pid) => pid !== effectiveUserId)
                      .map((pid, idx) =>
                        gameRoom?.playerHands[pid]?.hand.map((card, i) => ( // Added null check
                          <motion.div
                            key={`${pid}-${i}`}
                            className="text-xl text-white bg-gray-700 rounded-lg h-12 w-12 flex items-center justify-center"
                            initial={{ x: 50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: (idx * (gameRoom?.playerHands[pid]?.hand.length || 0) + i) * 0.1 }} // Added null check
                          >
                            {cardToEmoji(card)}
                          </motion.div>
                        ))
                      )}
                  </div>
                </div>
              )}
              {gameRoom?.result && ( // Added null check
                <motion.div
                  className="mt-4 text-rose-400 text-xl font-poppins"
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

        {gameRoom?.phase === 'RESULT' && ( // Added null check
          <motion.div variants={sectionVariants} className="text-center mt-8">
            <motion.button
              onClick={async () => { // Made async to await resetGame
                if (gameRoomId) await resetGame(gameRoomId);
                setShowMessage("Game reset. Ready for a new round!");
                setLocalShowMessage("Game reset. Ready for a new round!");
              }}
              className="px-6 py-3 bg-cyan-600 text-white rounded-md font-semibold flex items-center justify-center gap-2 font-poppins"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Play Again"
            >
              <RefreshCcw className="w-5 h-5 animate-pulse" /> Play Again
            </motion.button>
          </motion.div>
        )}

        {bets.length > 0 && (
          <motion.div variants={sectionVariants} className="mb-12">
            <h3 className="text-xl text-white font-bold mb-3 font-poppins">Recent Plays</h3>
            {bets.slice(-5).map((bet, i) => (
              <p key={i} className={bet.won ? "text-green-400 font-inter" : "text-white font-inter"}>
                Bet: {bet.amount} {useJewels ? "JEWELS" : "GOLD"} {bet.won ? `(Won ${bet.payout} - ${bet.result})` : `(${bet.result})`}
              </p>
            ))}
          </motion.div>
        )}

        <motion.div variants={sectionVariants} className="text-center mt-8">
          <motion.button
            onClick={() => setShowTutorial(true)}
            className="px-6 py-3 bg-rose-600 text-white rounded-md font-semibold flex items-center justify-center gap-2 font-poppins"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Show Red Dog Tutorial"
          >
            <Users className="w-5 h-5 animate-pulse" /> Show Tutorial
          </motion.button>
        </motion.div>

        <AnimatePresence>
          {showTutorial && (
            <Modal title="Multiplayer Red Dog Tutorial" onClose={() => setShowTutorial(false)}>
              <div className="text-gray-200 text-sm space-y-4 font-inter">
                <p><b>Objective:</b> Bet if the third card falls between the first two in value in a multiplayer game.</p>
                <ul className="list-disc pl-6">
                  <li>Bet 10–1000 JEWELS (INR) or GOLD (USD).</li>
                  <li>Three cards are dealt; first two set the spread.</li>
                  <li>Win if third card is between them. Payout based on spread (1-5x).</li>
                  <li>Sign in to play, deposit via Wallet if needed.</li>
                </ul>
                <motion.button
                  onClick={() => setShowTutorial(false)}
                  className="mt-4 px-6 py-3 bg-rose-600 text-white rounded-md font-semibold font-poppins"
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
              userId={userId}
              setShowMessage={setShowMessage}
              setIsPETMember={setIsPETMember}
              updatePlayerFirestore={updatePlayerFirestore}
            />
          )}
          {activeModal === "error" && (
            <Modal title="Error" onClose={() => setActiveModal(null)}>
              <div className="space-y-4">
                <p className="text-rose-400 font-inter">{localShowMessage || "An error occurred. Please try again."}</p>
                <motion.button
                  className="w-full p-3 bg-rose-600 text-white rounded-md font-semibold font-poppins"
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
          {localShowMessage && ( // Use localShowMessage for the popup
            <motion.div
              variants={rewardVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="fixed bottom-16 right-4 max-w-xs w-full bg-gray-900 border border-rose-500/20 rounded-xl shadow-xl p-4 backdrop-blur-lg z-50"
            >
              <div className="flex items-center gap-3">
                <Dices className="w-6 h-6 text-rose-400 animate-pulse" />
                <p className="text-white font-bold font-poppins">{localShowMessage}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <audio ref={playSoundRef} src="/audio/race_start.mp3" preload="auto" />
        <audio ref={winSoundRef} src="/audio/crowd_cheer.mp3" preload="auto" />

        <style>{`
          :root {
            --rose-500: #ec4899;
            --cyan-500: #22d3ee;
          }
          .bg-noise {
            background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAC3SURBVFhH7ZZBCsAsCER7/6W9WZoKUSO4ro0Q0v+UQKcZJnTf90EQBF3X9UIIh8Ph0Ov1er3RaDSi0WhEkiSpp9OJIAiC3nEcxyHLMgqCILlcLhFFUdTr9WK5XC6VSqVUKpVKqVRKpVJutxuNRqMhSRJpmkYkSVKpVCqVSqlUKqVSqZQqlaIoimI4HIZKpVJKpVJutxuNRqNRkiRJMk3TqCRZQqlUKqlaVSqlUKqVqlaKQlJ/kfgBQUzS2f8eAAAAAElFTkSuQmCC");
            background-repeat: repeat;
            background-size: 64px 64px;
          }
          .blur-3xl { filter: blur(64px); }
          .blur-2xl { filter: blur(32px); }
          input:focus, select:focus, button:focus, [role="button"]:focus {
            outline: none;
            box-shadow: 0 0 0 2px rgba(236, 72, 153, 0.5);
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

export default RedDogGame;
