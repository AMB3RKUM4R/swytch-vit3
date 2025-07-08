// src/games/redDog.tsx
import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useEffect, useRef } from 'react';
import { Dices, Users, X } from 'lucide-react';
import { doc, getDoc, onSnapshot, setDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import { useNavigate } from 'react-router-dom';
import Modal from '@/components/Modal';
import AuthModal from '@/components/AuthModal';
import PaymentModal from '@/components/PaymentModal';
import ConfettiExplosion from 'react-confetti-explosion';

// Types
type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
type Value = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

interface Card {
  suit: Suit;
  value: Value;
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

interface GameRoom {
  deck: Card[];
  playerHands: { [userId: string]: { hand: Card[]; bet: number; won: boolean; payout: number; result: string } };
  phase: 'IDLE' | 'PLAYING' | 'RESULT';
  result: string;
  players: string[];
}

// Animation variants
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

// Card utilities
const deck: Card[] = (
  ['hearts', 'diamonds', 'clubs', 'spades'] as const
).flatMap(suit =>
  (['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'] as const).map(value => ({ suit, value }))
);

const cardToEmoji = (card: Card): string => {
  const suitMap: { [key in Suit]: string } = { hearts: '♥', diamonds: '♦', clubs: '♣', spades: '♠' };
  return `${card.value}${suitMap[card.suit]}`;
};

const shuffleDeck = (seed: string): Card[] => {
  let hash = Array.from(seed).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return [...deck].sort(() => Math.sin(hash++) * 10000 % 1 - 0.5);
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
  const [showMessage, setLocalShowMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const playSoundRef = useRef<HTMLAudioElement | null>(null);
  const winSoundRef = useRef<HTMLAudioElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  // Initialize Firestore and Audio
  useEffect(() => {
    if (userId) {
      const userRef = doc(db, "Players", userId);
      const unsubscribe = onSnapshot(userRef, (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setJewels(data.jewels || 0);
          setGold(data.gold || 0);
          setIsPETMember(data.isPETMember || false);
          setStats({
            plays: data.redDogPlays || 0,
            wins: data.redDogWins || 0,
            losses: data.redDogLosses || 0,
            biggestWin: data.redDogBiggestWin || 0,
          });
          const now = Date.now();
          const oneDay = 24 * 60 * 60 * 1000;
          if (now - (data.lastBonusTime || 0) > oneDay) {
            setJewels((prev) => prev + 500);
            updatePlayerFirestore({ jewels: (data.jewels || 0) + 500, lastBonusTime: now });
            setShowMessage("🎉 Claimed 500 JEWELS daily bonus!");
            setLocalShowMessage("🎉 Claimed 500 JEWELS daily bonus!");
          }
        }
        setIsLoading(false);
      }, (err: unknown) => {
        console.error("Failed to fetch balance:", err);
        setShowMessage("⚠️ Failed to load balance. Please try again.");
        setLocalShowMessage("⚠️ Failed to load balance. Please try again.");
        setActiveModal("error");
        setIsLoading(false);
      });
      playSoundRef.current = new Audio("/audio/race_start.mp3");
      winSoundRef.current = new Audio("/audio/crowd_cheer.mp3");
      return () => {
        unsubscribe();
        playSoundRef.current?.pause();
        winSoundRef.current?.pause();
      };
    } else {
      setShowMessage("⚠️ Please sign in to play!");
      setLocalShowMessage("⚠️ Please sign in to play!");
      setActiveModal("auth");
      navigate("/auth");
      setIsLoading(false);
    }
  }, [userId, setActiveModal, setShowMessage, setIsPETMember, updatePlayerFirestore, navigate]);

  // Join or create game room
  useEffect(() => {
    if (!userId) return;
    const joinGame = async () => {
      const roomId = `redDog_${Date.now()}`;
      const roomRef = doc(db, "GameRooms", roomId);
      const roomSnap = await getDoc(roomRef);
      if (!roomSnap.exists()) {
        await setDoc(roomRef, {
          deck: shuffleDeck(Date.now().toString()),
          playerHands: {},
          phase: 'IDLE',
          result: "",
          players: [userId],
        });
      } else {
        await setDoc(roomRef, { players: [...(roomSnap.data().players || []), userId] }, { merge: true });
      }
      setGameRoomId(roomId);
      const unsubscribe = onSnapshot(roomRef, (doc) => {
        if (doc.exists()) {
          const data = doc.data() as GameRoom;
          setGameRoom(data);
          setPlayers(data.players || []);
        }
      }, (err: unknown) => {
        console.error("Failed to fetch game room:", err);
        setShowMessage("⚠️ Failed to load game. Please try again.");
        setLocalShowMessage("⚠️ Failed to load game. Please try again.");
        setActiveModal("error");
      });
      return () => unsubscribe();
    };
    joinGame();
  }, [userId, setActiveModal, setShowMessage]);

  // Save to Firestore
  useEffect(() => {
    if (userId) {
      updatePlayerFirestore({
        jewels,
        gold,
        redDogPlays: stats.plays,
        redDogWins: stats.wins,
        redDogLosses: stats.losses,
        redDogBiggestWin: stats.biggestWin,
      }).catch((err: unknown) => {
        console.error("Failed to save balance:", err);
        setShowMessage("⚠️ Failed to save data. Please try again.");
        setLocalShowMessage("⚠️ Failed to save data. Please try again.");
        setActiveModal("error");
      });
    }
  }, [jewels, gold, stats, userId, updatePlayerFirestore, setShowMessage, setActiveModal]);

  // Log Transaction
  const logTransaction = async (type: "deposit" | "withdraw", amount: number): Promise<void> => {
    if (!userId) return;
    try {
      const transactionId = `${userId}_${Date.now()}`;
      await addDoc(collection(db, "transactions"), {
        transactionId,
        userId,
        amount,
        currency: useJewels ? "INR" : "USD",
        transactionType: type,
        status: "pending",
        timestamp: serverTimestamp(),
        game: "red-dog",
      });
      setShowMessage(`✅ ${type === "deposit" ? "Win" : "Bet"} submitted! Awaiting admin verification.`);
      setLocalShowMessage(`✅ ${type === "deposit" ? "Win" : "Bet"} submitted! Awaiting admin verification.`);
    } catch (err: unknown) {
      console.error("Error logging transaction:", err);
      setShowMessage("⚠️ Failed to log transaction.");
      setLocalShowMessage("⚠️ Failed to log transaction.");
      setActiveModal("error");
    }
  };

  // Game logic
  const playGame = async (): Promise<void> => {
    if (!userId || !gameRoomId) {
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
    const playerHand = newDeck.slice(0, 3);
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const v1 = values.indexOf(playerHand[0].value);
    const v2 = values.indexOf(playerHand[1].value);
    const v3 = values.indexOf(playerHand[2].value);
    const spread = Math.abs(v1 - v2) - 1;
    let won = false, payout = 0, result = '';
    if (spread <= 0) {
      result = 'Push (no spread)';
      payout = betAmount;
      won = true;
    } else if ((v1 < v3 && v3 < v2) || (v2 < v3 && v3 < v1)) {
      won = true;
      payout = betAmount * Math.max(1, 5 - spread);
      result = `Win! Spread ${spread}. ${cardToEmoji(playerHand[2])} is between ${cardToEmoji(playerHand[0])} and ${cardToEmoji(playerHand[1])}`;
    } else {
      result = `Lose. ${cardToEmoji(playerHand[2])} not between ${cardToEmoji(playerHand[0])} and ${cardToEmoji(playerHand[1])}`;
    }
    const updatedPlayerHands = { ...roomData.playerHands, [userId]: { hand: playerHand, bet: betAmount, won, payout, result } };
    await setDoc(roomRef, {
      deck: newDeck.slice(3),
      playerHands: updatedPlayerHands,
      phase: 'PLAYING',
    }, { merge: true });

    if (useJewels) {
      setJewels((prev) => prev - betAmount);
    } else {
      setGold((prev) => prev - betAmount);
    }
    await logTransaction("withdraw", betAmount);
    setBets((prev) => [...prev, { amount: betAmount, won, payout, result }]);
    if (playSoundRef.current) {
      playSoundRef.current.play().catch((err: unknown) => console.error("Audio playback failed:", err));
    }

    setTimeout(async () => {
      await setDoc(roomRef, { phase: 'RESULT', result }, { merge: true });
      if (payout > 0) {
        if (useJewels) {
          setJewels((prev) => prev + payout);
        } else {
          setGold((prev) => prev + payout);
        }
        setStats((prev) => ({
          ...prev,
          plays: prev.plays + 1,
          wins: prev.wins + 1,
          biggestWin: Math.max(prev.biggestWin, payout),
        }));
        await logTransaction("deposit", payout);
        setShowMessage(`🎉 Won ${payout} ${useJewels ? "JEWELS" : "GOLD"}! ${result}`);
        setLocalShowMessage(`🎉 Won ${payout} ${useJewels ? "JEWELS" : "GOLD"}! ${result}`);
        if (winSoundRef.current) {
          winSoundRef.current.play().catch((err: unknown) => console.error("Audio playback failed:", err));
        }
      } else {
        setStats((prev) => ({ ...prev, plays: prev.plays + 1, losses: prev.losses + 1 }));
        setShowMessage(`😔 No win. ${result}`);
        setLocalShowMessage(`😔 No win. ${result}`);
      }
      setTimeout(async () => {
        await setDoc(roomRef, {
          deck: shuffleDeck((Date.now() + 1).toString()),
          playerHands: {},
          phase: 'IDLE',
          result: "",
        }, { merge: true });
      }, 2500);
    }, 2000);
  };

  if (isLoading || !gameRoom) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-gray-950 font-inter">
        <p>Loading Red Dog...</p>
      </div>
    );
  }

  return (
    <section className="relative py-16 px-6 sm:px-8 lg:px-16 bg-gradient-to-br from-gray-950 via-rose-950/20 to-black text-white overflow-hidden font-inter">
      {gameRoom.phase === 'RESULT' && gameRoom.result.includes('Win') && (
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
              disabled={gameRoom.phase !== 'IDLE'}
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
                disabled={gameRoom.phase !== 'IDLE'}
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
              {gameRoom.playerHands[playerId] ? `: ${gameRoom.playerHands[playerId].hand.length} cards` : ""}
              {gameRoom.phase === 'RESULT' && gameRoom.playerHands[playerId]?.won ? " (Won)" : ""}
            </p>
          ))}
        </motion.div>

        <motion.div variants={sectionVariants} className="flex justify-between items-center mb-12 bg-gray-900/60 p-4 rounded-2xl border border-rose-500/20 backdrop-blur-md">
          <div className="text-lg text-white font-semibold font-poppins">
            JEWELS: <span className="text-rose-400">{jewels}</span> | GOLD: <span className="text-rose-400">{gold}</span>
          </div>
          <motion.button
            onClick={playGame}
            disabled={gameRoom.phase !== 'IDLE'}
            className={gameRoom.phase !== 'IDLE' ? "px-8 py-4 bg-gray-600 text-white rounded-md font-semibold flex items-center justify-center gap-2 font-poppins cursor-not-allowed" : "px-8 py-4 bg-rose-600 text-white rounded-md font-semibold flex items-center justify-center gap-2 font-poppins hover:bg-rose-700"}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Play Red Dog"
          >
            <Dices className="w-6 h-6 animate-pulse" /> Play Red Dog
          </motion.button>
        </motion.div>

        <motion.div variants={sectionVariants} className="relative w-full h-[300px] mb-12 bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-indigo-500/10 rounded-lg" />
          <div className="relative w-full flex flex-col items-center">
            {gameRoom.phase === 'PLAYING' && (
              <motion.div className="text-4xl text-rose-400 font-bold font-poppins" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.5 }}>
                Dealing...
              </motion.div>
            )}
            {(gameRoom.phase === 'RESULT' || gameRoom.playerHands[userId!]?.hand.length > 0) && (
              <div className="flex flex-col items-center">
                <div className="text-rose-400 mb-1 font-poppins">Your Cards</div>
                <div className="flex gap-2 mb-4">
                  {gameRoom.playerHands[userId!]?.hand.map((card, i) => (
                    <motion.div
                      key={i}
                      className="text-xl text-white bg-gray-700 rounded-lg h-12 w-12 flex items-center justify-center"
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      {cardToEmoji(card)}
                    </motion.div>
                  ))}
                </div>
                <div className="text-rose-400 mb-1 font-poppins">Other Players</div>
                <div className="flex flex-wrap gap-2">
                  {players
                    .filter((pid) => pid !== userId)
                    .map((pid, idx) =>
                      gameRoom.playerHands[pid]?.hand.map((card, i) => (
                        <motion.div
                          key={`${pid}-${i}`}
                          className="text-xl text-white bg-gray-700 rounded-lg h-12 w-12 flex items-center justify-center"
                          initial={{ x: 50, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: (idx * gameRoom.playerHands[pid].hand.length + i) * 0.1 }}
                        >
                          {cardToEmoji(card)}
                        </motion.div>
                      ))
                    )}
                </div>
              </div>
            )}
            {gameRoom.result && (
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
        </motion.div>

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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
              role="dialog"
              aria-modal="true"
              aria-label="Red Dog Tutorial Modal"
            >
              <motion.div
                ref={modalRef}
                className="bg-gray-900 rounded-2xl max-w-md w-full p-8 border border-rose-500/20 backdrop-blur-lg"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                transition={{ duration: 0.4 }}
                tabIndex={-1}
              >
                <motion.button
                  onClick={() => setShowTutorial(false)}
                  className="absolute top-4 right-4 text-rose-400 hover:text-red-500"
                  whileHover={{ rotate: 90 }}
                  aria-label="Close tutorial modal"
                >
                  <X className="w-6 h-6" />
                </motion.button>
                <h3 className="text-xl font-bold text-rose-400 mb-6 flex items-center gap-3 font-poppins">
                  <Users className="w-6 h-6 animate-pulse" /> Red Dog Tutorial
                </h3>
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
              </motion.div>
            </motion.div>
          )}
          {activeModal === "auth" && (
            <AuthModal
              title="Sign In"
              onClose={() => {
                setActiveModal(null);
                setShowMessage("");
                setLocalShowMessage("");
              }}
              setShowMessage={setShowMessage}
            />
          )}
          {activeModal === "payment" && (
            <PaymentModal
              userId={userId}
              title="Wallet"
              onClose={() => {
                setActiveModal(null);
                setShowMessage("");
                setLocalShowMessage("");
              }}
              setShowMessage={setShowMessage}
              setIsPETMember={setIsPETMember}
              updatePlayerFirestore={updatePlayerFirestore}
            />
          )}
          {activeModal === "error" && (
            <Modal title="Error" onClose={() => setActiveModal(null)}>
              <div className="space-y-4">
                <p className="text-rose-400 font-inter">{showMessage || "An error occurred. Please try again."}</p>
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
          {showMessage && (
            <motion.div
              variants={rewardVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="fixed bottom-16 right-4 max-w-xs w-full bg-gray-900 border border-rose-500/20 rounded-xl shadow-xl p-4 backdrop-blur-lg z-50"
            >
              <div className="flex items-center gap-3">
                <Dices className="w-6 h-6 text-rose-400 animate-pulse" />
                <p className="text-white font-bold font-poppins">{showMessage}</p>
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
            background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAC3SURBVFhH7ZZBCsAgCER7/6W9WZoKUSO4ro0Q0v+UQKcZJnTf90EQBF3X9UIIh8Ph0Ov1er3RaDSi0WhEkiSpp9OJIAiC3nEcxyHLMgqCILlcLhFFUdTr9WK5XC6VSqVUKpVKqVRKpVJutxuNRqMhSRJpmkYkSVKpVCqVSqlUKqVSqZQqlaIoimI4HIZKpVJKpVJutxuNRqNRkiRJMk3TiCRJKpVKqVJKpVIplUqlVColSf4BQUzS2f8eAAAAAElFTkSuQmCC");
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