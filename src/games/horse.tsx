import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { Dices, Trophy, Users, Sparkles, Star, MessageCircleHeart, X } from "lucide-react";
import { useAccount, useBalance, useWriteContract, useConnect } from "wagmi";
import { doc, getDoc, setDoc, serverTimestamp, collection, addDoc, getDocs, QueryDocumentSnapshot, onSnapshot } from "firebase/firestore";
import { db, auth } from "@/lib/firebaseConfig";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useModal } from "@/context/ModalContext";
import * as THREE from "three";
import { useNavigate, Link } from "react-router-dom";
import Modal from "@/components/SwytchModal";
import AuthModal from "@/components/AuthModal";
import PaymentModal from "@/components/PaymentModal";
import SwytchErrorBoundary from "@/components/ErrorBoundaryComponent";
import ConfettiExplosion from "react-confetti-explosion";

interface Horse {
  id: number;
  name: string;
  odds: { win: number; place: number; show: number; exacta: number; trifecta: number };
  position: number;
  emoji: string;
}

interface Bet {
  horseId: number | [number, number] | [number, number, number];
  type: "win" | "place" | "show" | "exacta" | "trifecta";
  amount: number;
  won: boolean;
  payout: number;
  vrfRequestId?: string;
}

interface Stats {
  wins: number;
  losses: number;
  totalRaces: number;
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

interface RaceResult {
  raceId: string;
  results: { position: number; horseId: number }[];
  timestamp: string;
  postTime: string;
}

interface ChainlinkVRFResponse {
  requestId: string;
  randomNumber: string;
  verificationUrl: string;
}

interface GameRoom {
  bets: { [userId: string]: Bet[] };
  phase: "IDLE" | "RACING" | "RESULT" | "REPLAY";
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
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: "easeOut", type: "spring", stiffness: 100 } },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const flareVariants = {
  animate: { scale: [1, 1.3, 1], opacity: [0.5, 0.7, 0.5], transition: { duration: 3.5, repeat: Infinity, ease: "easeInOut" } },
};

const particleVariants = {
  animate: { y: [0, -8, 0], opacity: [0.4, 1, 0.4], transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" } },
};

const rewardVariants = {
  initial: { opacity: 0, scale: 0.8, y: 50 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5 } },
  exit: { opacity: 0, scale: 0.8, y: -50, transition: { duration: 0.3 } },
};

const initialQuests: Quest[] = [
  { id: "horse-wins", title: "Win 3 Horse Races", progress: 0, goal: 3, rewardJEWELS: 10, rewardXP: 15, completed: false },
  { id: "horse-play", title: "Play 5 Horse Races", progress: 0, goal: 5, rewardJEWELS: 5, rewardXP: 10, completed: false },
  { id: "horse-share", title: "Share Horse Race Win on X", progress: 0, goal: 1, rewardJEWELS: 5, rewardXP: 5, completed: false },
];

const initialAchievements: Achievement[] = [
  { id: "horse-master", title: "Horse Racing Master", description: "Win 10 multiplayer horse races.", unlocked: false },
];

const fetchRaceData = async (): Promise<Horse[]> => {
  return [
    { id: 1, name: "Thunderbolt", odds: { win: 4.5, place: 2.2, show: 1.6, exacta: 20, trifecta: 80 }, position: 0, emoji: "⚡" },
    { id: 2, name: "Midnight", odds: { win: 5.8, place: 2.8, show: 1.9, exacta: 30, trifecta: 100 }, position: 0, emoji: "🌙" },
    { id: 3, name: "Blaze", odds: { win: 7.2, place: 3.5, show: 2.1, exacta: 40, trifecta: 150 }, position: 0, emoji: "🔥" },
    { id: 4, name: "Shadow", odds: { win: 9.0, place: 4.2, show: 2.7, exacta: 50, trifecta: 200 }, position: 0, emoji: "👤" },
  ];
};

const fetchRecentResults = async (): Promise<RaceResult[]> => {
  return [
    { raceId: "race1", results: [{ position: 1, horseId: 1 }, { position: 2, horseId: 2 }, { position: 3, horseId: 3 }], timestamp: "2025-07-07T16:50:00Z", postTime: "4:50 PM IST" },
    { raceId: "race2", results: [{ position: 1, horseId: 3 }, { position: 2, horseId: 4 }, { position: 3, horseId: 1 }], timestamp: "2025-07-07T16:45:00Z", postTime: "4:45 PM IST" },
  ];
};

const requestChainlinkVRF = async (): Promise<ChainlinkVRFResponse> => {
  return {
    requestId: "vrf-" + Date.now(),
    randomNumber: (Math.random() * 1000000).toFixed(0),
    verificationUrl: "https://vrf.chain.link/verify/" + Date.now(),
  };
};

const TRACK_LENGTH = 1000;

const HorseModel: React.FC<{ position: number; lane: number; color: string }> = ({ position, lane }) => {
  const { scene } = useGLTF("/models/horse.glb");
  const ref = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (ref.current) {
      ref.current.position.x = (position / TRACK_LENGTH) * 20 - 10;
      ref.current.position.z = lane * 2 - 4;
    }
  });

  return <primitive object={scene} ref={ref} scale={0.5} rotation={[0, Math.PI / 2, 0]} />;
};

const WinParticles: React.FC<{ trigger: boolean }> = ({ trigger }) => {
  const particlesRef = useRef<THREE.InstancedMesh>(null);
  const count = 50;

  useEffect(() => {
    if (!trigger || !particlesRef.current) return;
    const mesh = particlesRef.current;
    const dummy = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      dummy.position.set(
        (Math.random() - 0.5) * 20,
        Math.random() * 5,
        (Math.random() - 0.5) * 10
      );
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, [trigger]);

  return (
    <instancedMesh ref={particlesRef} args={[new THREE.SphereGeometry(0.1), new THREE.MeshBasicMaterial({ color: "#22d3ee" }), count]}>
      <sphereGeometry args={[0.1, 16, 16]} />
      <meshBasicMaterial color="#22d3ee" />
    </instancedMesh>
  );
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

const mockXPosts: { username: string; content: string; likes: number; timestamp: string }[] = [
  { username: "@PETversePlayer", content: "Won big at Anderomeda Raceway! 🏇 #SwytchPETverse", likes: 120, timestamp: "2025-07-08T15:30:00Z" },
  { username: "@CryptoGamerX", content: "Thunderbolt crushed it in PETverse! Join the race! #SwytchPET", likes: 160, timestamp: "2025-07-07T14:45:00Z" },
];

interface HorseRacingProps {
  userId: string | null;
  setIsPETMember: React.Dispatch<React.SetStateAction<boolean>>;
  updatePlayerFirestore: (updates: Partial<any>) => Promise<void>;
}

const HorseRacing: React.FC<HorseRacingProps> = ({ userId, setIsPETMember, updatePlayerFirestore }) => {
  const { user: firebaseAuthUser, loading: authLoading } = useAuthUser();
  const { address } = useAccount();
  const { setActiveModal, setShowMessage } = useModal();
  useConnect();
  useBalance({ address });
  const { writeContractAsync: placeBetOnChain } = useWriteContract();
  const [jewels, setJewels] = useState<number>(0);
  const [gold, setGold] = useState<number>(0);
  const [stats, setStats] = useState<Stats>({ wins: 0, losses: 0, totalRaces: 0, biggestWin: 0 });
  const [quests, setQuests] = useState<Quest[]>(initialQuests);
  const [achievements, setAchievements] = useState<Achievement[]>(initialAchievements);
  const [showReward, setShowReward] = useState<Reward | null>(null);
  const [showTutorial, setShowTutorial] = useState<boolean>(false);
  const [showFairness, setShowFairness] = useState<boolean>(false);
  const [gameState, setGameState] = useState<"IDLE" | "RACING" | "RESULT" | "REPLAY">("IDLE");
  const [bets, setBets] = useState<Bet[]>([]);
  const [gameRoom, setGameRoom] = useState<GameRoom | null>(null);
  const [gameRoomId, setGameRoomId] = useState<string | null>(null);
  const [raceResults, setRaceResults] = useState<number[]>([]);
  const [recentResults, setRecentResults] = useState<RaceResult[]>([]);
  const [betAmount, setBetAmount] = useState<number>(500);
  const [betType, setBetType] = useState<"win" | "place" | "show" | "exacta" | "trifecta">("win");
  const [selectedHorses, setSelectedHorses] = useState<number[]>([]);
  const [useJewels, setUseJewels] = useState<boolean>(true);
  const [autoBet, setAutoBet] = useState<boolean>(false);
  const [liveHorses, setLiveHorses] = useState<Horse[]>([]);
  const [raceEvents, setRaceEvents] = useState<string[]>([]);
  const [vrfResponse, setVrfResponse] = useState<ChainlinkVRFResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [, setPlayers] = useState<string[]>([]);
  const raceSoundRef = useRef<HTMLAudioElement | null>(null);
  const winSoundRef = useRef<HTMLAudioElement | null>(null);
  const animationFrameRef = useRef<number>();
  const navigate = useNavigate();
  const effectiveUserId = userId ?? (address ? address.toLowerCase() : firebaseAuthUser?.uid ?? null);

  const saveStateToFirestore = useDebounce(async (state: { jewels?: number; gold?: number; quests?: Quest[]; achievements?: Achievement[]; horseWins?: number; horseLosses?: number; horseBiggestWin?: number }) => {
    if (!effectiveUserId) return;
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
        currency: useJewels ? "JEWELS" : "USDT",
        transactionType: type,
        status: "pending",
        timestamp: serverTimestamp(),
        game: "horse-racing",
        adminId: "0CfobCbXnPZsJwT662H4OhDrXk33",
      });
      setShowMessage(`✅ ${type === "deposit" ? "Win" : "Bet"} of ${amount} ${useJewels ? "JEWELS" : "USDT"} submitted! Admin (0CfobCbXnPZsJwT662H4OhDrXk33) will process.`);
    } catch (err) {
      console.error("Error logging transaction:", err);
      setShowMessage("⚠️ Failed to log transaction.");
      setActiveModal("error");
    }
  }, [effectiveUserId, useJewels, setShowMessage, setActiveModal]);

  useEffect(() => {
    if (!effectiveUserId) {
      setShowTutorial(true);
      setShowMessage("⚠️ Please sign in to play!");
      setActiveModal("auth");
      navigate("/auth");
      setIsLoading(false);
      return;
    }

    const init = async () => {
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
          wins: data.horseWins || 0,
          losses: data.horseLosses || 0,
          totalRaces: (data.horseWins || 0) + (data.horseLosses || 0),
          biggestWin: data.horseBiggestWin || 0,
        });

        const horses = await fetchRaceData();
        setLiveHorses(horses);
        const results = await fetchRecentResults();
        setRecentResults(results);

        const roomsRef = collection(db, "GameRooms");
        const roomsSnap = await getDocs(roomsRef);
        let roomId = roomsSnap.docs.find((doc: QueryDocumentSnapshot) => doc.data().phase === "IDLE" && doc.data().game === "horse-racing")?.id;
        if (!roomId) {
          const newRoomRef = await addDoc(roomsRef, {
            game: "horse-racing",
            bets: {},
            phase: "IDLE",
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

    init();
    raceSoundRef.current = new Audio("/audio/reward.mp3");
    winSoundRef.current = new Audio("/audio/reward.mp3");
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      raceSoundRef.current?.pause();
      winSoundRef.current?.pause();
    };
  }, [effectiveUserId, setShowMessage, setActiveModal, setIsPETMember, navigate]);

  useEffect(() => {
    if (showReward) {
      const timer = setTimeout(() => setShowReward(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [showReward]);

  useEffect(() => {
    saveStateToFirestore({
      jewels,
      gold,
      quests,
      achievements,
      horseWins: stats.wins,
      horseLosses: stats.losses,
      horseBiggestWin: stats.biggestWin,
    });
  }, [jewels, gold, stats, quests, achievements, saveStateToFirestore]);

  const shareWinOnX = async (): Promise<void> => {
    if (!effectiveUserId) {
      setShowMessage("⚠️ Please sign in to share.");
      setActiveModal("auth");
      navigate("/auth");
      return;
    }
    const shareQuest = quests.find((q) => q.id === "horse-share");
    if (shareQuest && !shareQuest.completed) {
      const shareText = encodeURIComponent("Just won big at Anderomeda Raceway in Swytch PETverse! 🏇 Join at swytch.io! #SwytchPETverse #HorseRacing");
      window.open(`https://x.com/intent/tweet?text=${shareText}`, "_blank");
      setQuests((prev) => prev.map((q) => (q.id === "horse-share" ? { ...q, progress: 1, completed: true } : q)));
      setJewels((prev) => prev + shareQuest.rewardJEWELS);
      setShowReward({ jewels: shareQuest.rewardJEWELS, xp: shareQuest.rewardXP, message: `Quest Completed: ${shareQuest.title}!` });
      await logTransaction("deposit", shareQuest.rewardJEWELS);
      await updatePlayerFirestore({ quests, jewels: jewels + shareQuest.rewardJEWELS });
      if (winSoundRef.current) winSoundRef.current.play().catch((err) => console.error("Audio playback failed:", err));
    }
  };

  const placeBet = async (horseId: number | [number, number] | [number, number, number], type: "win" | "place" | "show" | "exacta" | "trifecta"): Promise<void> => {
    if (!effectiveUserId) {
      setShowMessage("⚠️ Please sign in to play!");
      setActiveModal("auth");
      navigate("/auth");
      return;
    }
    if (gameState !== "IDLE") {
      setShowMessage("🏁 Race in progress! Wait for the current race to finish.");
      setActiveModal("error");
      return;
    }
    if (betAmount < 500 || betAmount > 5000) {
      setShowMessage("⚠️ Bet amount must be between 500 and 5000!");
      setActiveModal("error");
      return;
    }
    if (useJewels && jewels < betAmount) {
      setShowMessage("⚠️ Not enough JEWELS! Please deposit.");
      setActiveModal("payment");
      navigate("/vault");
      return;
    }
    if (!useJewels && gold < betAmount) {
      setShowMessage("⚠️ Not enough USDT! Please deposit.");
      setActiveModal("payment");
      navigate("/vault");
      return;
    }
    if (type === "exacta" && (!Array.isArray(horseId) || horseId.length !== 2)) {
      setShowMessage("⚠️ Exacta bet requires selecting two horses!");
      setActiveModal("error");
      return;
    }
    if (type === "trifecta" && (!Array.isArray(horseId) || horseId.length !== 3)) {
      setShowMessage("⚠️ Trifecta bet requires selecting three horses!");
      setActiveModal("error");
      return;
    }
    if (!Array.isArray(horseId) && !liveHorses.find((h) => h.id === horseId)) {
      setShowMessage("⚠️ Invalid horse selected!");
      setActiveModal("error");
      return;
    }
    if (Array.isArray(horseId) && horseId.some((id) => !liveHorses.find((h) => h.id === id))) {
      setShowMessage("⚠️ Invalid horses selected!");
      setActiveModal("error");
      return;
    }

    try {
      const vrfResponse = await requestChainlinkVRF();
      setVrfResponse(vrfResponse);

      if (useJewels) {
        setJewels((prev) => prev - betAmount);
      } else {
        setGold((prev) => prev - betAmount);
      }
      await logTransaction("withdraw", betAmount);

      await placeBetOnChain({
        address: "0xYourBettingContractAddress", // Replace with actual contract address
        abi: [
          {
            name: "placeBet",
            type: "function",
            inputs: [
              { name: "horseId", type: "uint256[]" },
              { name: "betType", type: "string" },
              { name: "amount", type: "uint256" },
            ],
            outputs: [],
            stateMutability: "payable",
          },
        ],
        functionName: "placeBet",
        args: [Array.isArray(horseId) ? horseId.map(BigInt) : [BigInt(horseId)], type, BigInt(betAmount)],
        value: BigInt(0),
      });

      const newBet = { horseId, type, amount: betAmount, won: false, payout: 0, vrfRequestId: vrfResponse.requestId };
      setBets((prev) => [...prev, newBet]);

      if (gameRoomId) {
        const roomRef = doc(db, "GameRooms", gameRoomId);
        await setDoc(roomRef, {
          bets: { ...gameRoom?.bets, [effectiveUserId]: [...(gameRoom?.bets[effectiveUserId] || []), newBet] },
        }, { merge: true });
      }

      setShowMessage(`🏇 Placed ${type.toUpperCase()} bet of ${betAmount} ${useJewels ? "JEWELS" : "USDT"} on ${Array.isArray(horseId) ? horseId.map((id) => liveHorses.find((h) => h.id === id)?.name).join(" & ") : liveHorses.find((h) => h.id === horseId)?.name}`);
    } catch (err) {
      console.error("Bet placement error:", err);
      setShowMessage("⚠️ Failed to place bet. Please try again.");
      setActiveModal("error");
    }
  };

  const startRace = async (): Promise<void> => {
    if (!gameRoomId || bets.length === 0) {
      setShowMessage("⚠️ Place at least one bet!");
      setActiveModal("error");
      return;
    }
    const roomRef = doc(db, "GameRooms", gameRoomId);
    await setDoc(roomRef, { phase: "RACING" }, { merge: true });
    setGameState("RACING");
    setRaceResults([]);
    setRaceEvents([]);
    setLiveHorses(liveHorses.map((h) => ({ ...h, position: 0 })));
    if (raceSoundRef.current) {
      raceSoundRef.current.play().catch((err) => console.error("Audio playback failed:", err));
    }

    const vrf = await requestChainlinkVRF();
    setVrfResponse(vrf);

    let tick = 0;
    const animate = () => {
      tick++;
      setLiveHorses((prev) => {
        const seed = vrf.randomNumber + tick;
        let events: string[] = [];
        const updated = prev.map((horse) => {
          const move = Math.floor((Math.sin(Array.from(seed + horse.id.toString()).reduce((acc, char) => acc + char.charCodeAt(0), 0)) * 10000) % 1 * 10 + 5);
          if (Math.random() < 0.1 && tick > 1 && horse.position < TRACK_LENGTH - 100) {
            events.push(`${horse.name} surges ahead in the paddock!`);
            return { ...horse, position: Math.min(TRACK_LENGTH, horse.position + move + 10) };
          }
          return { ...horse, position: Math.min(TRACK_LENGTH, horse.position + move) };
        });
        if (events.length) setRaceEvents((ev) => [...ev, ...events]);
        return updated;
      });
      if (liveHorses.every((h) => h.position >= TRACK_LENGTH)) {
        const sorted = [...liveHorses].sort((a, b) => b.position - a.position);
        setRaceResults(sorted.map((h) => h.id));
        setGameState("RESULT");
        checkResults(sorted.map((h) => h.id));
        return;
      }
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animationFrameRef.current = requestAnimationFrame(animate);
  };

  const checkResults = async (results: number[]): Promise<void> => {
    if (!gameRoomId) return;
    const roomRef = doc(db, "GameRooms", gameRoomId);
    let totalWinnings = 0;
    const updatedBets = bets.map((bet) => {
      let won = false;
      let payout = 0;
      let horse: Horse | undefined;
      if (Array.isArray(bet.horseId)) {
        horse = liveHorses.find((h) => h.id === bet.horseId);
      } else {
        horse = liveHorses.find((h) => h.id === bet.horseId);
      }
      if (!horse) return bet;
      if (bet.type === "win" && !Array.isArray(bet.horseId) && bet.horseId === results[0]) {
        won = true;
        payout = bet.amount * horse.odds.win;
      } else if (bet.type === "place" && !Array.isArray(bet.horseId) && (bet.horseId === results[0] || bet.horseId === results[1])) {
        won = true;
        payout = bet.amount * horse.odds.place;
      } else if (bet.type === "show" && !Array.isArray(bet.horseId) && (bet.horseId === results[0] || bet.horseId === results[1] || bet.horseId === results[2])) {
        won = true;
        payout = bet.amount * horse.odds.show;
      } else if (bet.type === "exacta" && Array.isArray(bet.horseId) && bet.horseId[0] === results[0] && bet.horseId[1] === results[1]) {
        won = true;
        payout = bet.amount * horse.odds.exacta;
      } else if (bet.type === "trifecta" && Array.isArray(bet.horseId) && bet.horseId[0] === results[0] && bet.horseId[1] === results[1] && bet.horseId[2] === results[2]) {
        won = true;
        payout = bet.amount * horse.odds.trifecta;
      }
      totalWinnings += payout;
      return { ...bet, won, payout };
    });
    setBets(updatedBets);
    await setDoc(roomRef, { bets: { ...gameRoom?.bets, [effectiveUserId!]: updatedBets }, phase: "RESULT", result: results.map((id, i) => `${i + 1}. ${liveHorses.find((h) => h.id === id)?.name}`).join(", ") }, { merge: true });

    const newStats = {
      wins: totalWinnings > 0 ? stats.wins + 1 : stats.wins,
      losses: totalWinnings === 0 ? stats.losses + 1 : stats.losses,
      totalRaces: stats.totalRaces + 1,
      biggestWin: Math.max(stats.biggestWin, totalWinnings),
    };
    setStats(newStats);

    if (totalWinnings > 0) {
      if (useJewels) {
        setJewels((prev) => prev + totalWinnings);
      } else {
        setGold((prev) => prev + totalWinnings);
      }
      await logTransaction("deposit", totalWinnings);
      setShowReward({ jewels: totalWinnings, xp: 10, message: `🏆 Won ${totalWinnings} ${useJewels ? "JEWELS" : "USDT"}!` });
      if (winSoundRef.current) winSoundRef.current.play().catch((err) => console.error("Audio playback failed:", err));

      const winQuest = quests.find((q) => q.id === "horse-wins");
      if (winQuest && !winQuest.completed) {
        const newProgress = Math.min(winQuest.progress + 1, winQuest.goal);
        const isQuestCompleted = newProgress >= winQuest.goal;
        setQuests((prev) =>
          prev.map((q) => (q.id === "horse-wins" ? { ...q, progress: newProgress, completed: isQuestCompleted } : q))
        );
        if (isQuestCompleted) {
          setJewels((prev) => prev + winQuest.rewardJEWELS);
          setShowReward({ jewels: winQuest.rewardJEWELS, xp: winQuest.rewardXP, message: `Quest Completed: ${winQuest.title}!` });
          await logTransaction("deposit", winQuest.rewardJEWELS);
          await updatePlayerFirestore({ quests, jewels: jewels + winQuest.rewardJEWELS });
          if (winSoundRef.current) winSoundRef.current.play().catch((err) => console.error("Audio playback failed:", err));
        }
      }

      const achievement = achievements.find((a) => a.id === "horse-master");
      if (achievement && !achievement.unlocked && newStats.wins >= 10) {
        setAchievements((prev) => prev.map((a) => (a.id === "horse-master" ? { ...a, unlocked: true } : a)));
        setJewels((prev) => prev + 20);
        setShowReward({ jewels: 20, xp: 30, message: "Achievement Unlocked: Horse Racing Master!" });
        await logTransaction("deposit", 20);
        await updatePlayerFirestore({ achievements, jewels: jewels + 20 });
        if (winSoundRef.current) winSoundRef.current.play().catch((err) => console.error("Audio playback failed:", err));
      }
    } else {
      setShowReward({ jewels: 0, xp: 0, message: `😔 No wins this race.` });
    }

    const playQuest = quests.find((q) => q.id === "horse-play");
    if (playQuest && !playQuest.completed) {
      const newProgress = Math.min(playQuest.progress + 1, playQuest.goal);
      const isQuestCompleted = newProgress >= playQuest.goal;
      setQuests((prev) =>
        prev.map((q) => (q.id === "horse-play" ? { ...q, progress: newProgress, completed: isQuestCompleted } : q))
      );
      if (isQuestCompleted) {
        setJewels((prev) => prev + playQuest.rewardJEWELS);
        setShowReward({ jewels: playQuest.rewardJEWELS, xp: playQuest.rewardXP, message: `Quest Completed: ${playQuest.title}!` });
        await logTransaction("deposit", playQuest.rewardJEWELS);
        await updatePlayerFirestore({ quests, jewels: jewels + playQuest.rewardJEWELS });
        if (winSoundRef.current) winSoundRef.current.play().catch((err) => console.error("Audio playback failed:", err));
      }
    }

    setRecentResults((prev) => [
      { raceId: `race-${Date.now()}`, results: results.map((id, i) => ({ position: i + 1, horseId: id })), timestamp: new Date().toISOString(), postTime: new Date().toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" }) },
      ...prev.slice(0, 4),
    ]);
    await updatePlayerFirestore({
      horseWins: newStats.wins,
      horseLosses: newStats.losses,
      horseBiggestWin: newStats.biggestWin,
    });

    setTimeout(async () => {
      await setDoc(roomRef, { phase: "REPLAY" }, { merge: true });
      setGameState("REPLAY");
      setTimeout(async () => {
        await setDoc(roomRef, { bets: {}, phase: "IDLE", result: "" }, { merge: true });
        setGameState("IDLE");
        setBets(autoBet ? bets.map((bet) => ({ ...bet, won: false, payout: 0 })) : []);
        if (autoBet) setTimeout(startRace, 1000);
      }, 2500);
    }, 2500);
  };

  const selectHorse = (horseId: number) => {
    if (betType === "exacta" && selectedHorses.length < 2) {
      setSelectedHorses((prev) => [...prev, horseId]);
    } else if (betType === "trifecta" && selectedHorses.length < 3) {
      setSelectedHorses((prev) => [...prev, horseId]);
    } else if (betType !== "exacta" && betType !== "trifecta") {
      setSelectedHorses([horseId]);
    }
  };

  if (authLoading || isLoading || !gameRoom) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-gray-950 font-inter">
        <p>Loading Anderomeda Raceway...</p>
      </div>
    );
  }

  return (
    <section className="relative py-16 px-4 sm:px-8 lg:px-16 bg-gradient-to-br from-gray-950 via-rose-950/20 to-black text-white overflow-hidden font-inter">
      {gameState === "RESULT" && bets.some((b) => b.won) && (
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
      {gameState === "RESULT" && !bets.some((b) => b.won) && <WinParticles trigger={true} />}
      <motion.div className="fixed inset-0 pointer-events-none z-10" variants={containerVariants} initial="hidden" animate="visible">
        <motion.div className="absolute w-96 h-96 bg-gradient-to-br from-rose-400/50 via-cyan-500/40 to-rose-400/30 rounded-full opacity-30 blur-3xl" variants={flareVariants} animate="animate" style={{ top: "33%", left: "33%" }} />
        <motion.div className="absolute w-64 h-64 bg-gradient-to-br from-cyan-400/40 via-rose-500/30 to-cyan-400/20 rounded-full opacity-20 blur-2xl" variants={flareVariants} animate="animate" style={{ top: "50%", right: "25%" }} />
        <div className="absolute inset-0 bg-[url('/noise.png')] bg-repeat bg-[length:64px_64px] opacity-15" />
        {[...Array(10)].map((_, i) => (
          <motion.div key={`particle-${i}`} className="absolute w-1.5 h-1.5 bg-cyan-400 rounded-full opacity-30" style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }} variants={particleVariants} animate="animate" />
        ))}
      </motion.div>

      <motion.div className="relative z-10 max-w-6xl mx-auto" variants={containerVariants} initial="hidden" animate="visible">
        <motion.div variants={sectionVariants} className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold text-rose-400 flex items-center justify-center gap-3 font-poppins">
            <Dices className="w-8 h-8 text-cyan-400 animate-pulse" /> Anderomeda Raceway
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto mt-4 font-inter">
            Place your bets in the pari-mutuel Anderomeda Raceway! Pick your horses, watch the 3D race, and win big! <Link to="/vault" className="text-cyan-400 hover:underline">Manage vault</Link>.
          </p>
          <p className="text-sm text-cyan-400 italic mt-2 font-inter">
            🔐 Wallet: {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Not connected"} | 💎 JEWELS: {jewels} | 🪙 USDT: {gold}
          </p>
          <p className="text-sm text-cyan-400 mt-2 font-inter">Next Post Time: {new Date(Date.now() + 5 * 60 * 1000).toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" })}</p>
        </motion.div>

        <motion.div variants={sectionVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12 bg-gray-900/70 p-6 rounded-2xl border border-rose-500/30 backdrop-blur-md bg-gradient-to-r from-rose-500/20 to-cyan-500/20">
          <div className="flex flex-col">
            <label className="text-white font-semibold mb-2 font-poppins">Bet Amount</label>
            <select
              value={betAmount}
              onChange={(e) => setBetAmount(Number(e.target.value))}
              className="bg-gray-800 text-white rounded-lg px-3 py-2 border border-cyan-500/20 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 outline-none font-inter"
              disabled={gameState !== "IDLE"}
            >
              {[500, 1000, 2000, 3000, 4000, 5000].map((b) => (
                <option key={b} value={b}>
                  {b} {useJewels ? "JEWELS" : "USDT"}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-white font-semibold mb-2 font-poppins">Bet Type</label>
            <select
              value={betType}
              onChange={(e) => setBetType(e.target.value as "win" | "place" | "show" | "exacta" | "trifecta")}
              className="bg-gray-800 text-white rounded-lg px-3 py-2 border border-cyan-500/20 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 outline-none font-inter"
              disabled={gameState !== "IDLE"}
            >
              <option value="win">Win</option>
              <option value="place">Place</option>
              <option value="show">Show</option>
              <option value="exacta">Exacta</option>
              <option value="trifecta">Trifecta</option>
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
                disabled={gameState !== "IDLE"}
              />
              <label className="text-white font-semibold font-poppins">Use JEWELS</label>
            </div>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={autoBet}
              onChange={() => setAutoBet((prev) => !prev)}
              className="mr-2"
              disabled={gameState !== "IDLE"}
            />
            <label className="text-white font-semibold font-poppins">Auto-Bet</label>
          </div>
        </motion.div>

        <motion.div variants={sectionVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {liveHorses.map((horse) => (
            <motion.div
              key={horse.id}
              className="bg-gray-900/70 p-4 rounded-lg border border-rose-500/30 backdrop-blur-md bg-gradient-to-r from-rose-500/20 to-cyan-500/20"
              whileHover={{ scale: 1.05 }}
            >
              <h3 className="text-white font-semibold flex items-center gap-2 font-poppins">
                <span className="text-2xl">{horse.emoji}</span> {horse.name}
              </h3>
              <p className="text-cyan-400 text-sm font-inter">Win: {horse.odds.win}:1 | Place: {horse.odds.place}:1 | Show: {horse.odds.show}:1</p>
              <p className="text-cyan-400 text-sm font-inter">Exacta: {horse.odds.exacta}:1 | Trifecta: {horse.odds.trifecta}:1</p>
              <motion.button
                onClick={() => selectHorse(horse.id)}
                className="mt-2 bg-rose-600 px-3 py-1 rounded-full text-white font-semibold hover:bg-cyan-500 font-poppins text-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={gameState !== "IDLE" || (betType === "exacta" && selectedHorses.length >= 2) || (betType === "trifecta" && selectedHorses.length >= 3)}
                aria-label={`Select ${horse.name} for betting`}
              >
                Select
              </motion.button>
            </motion.div>
          ))}
        </motion.div>

        {selectedHorses.length > 0 && (
          <motion.div variants={sectionVariants} className="mb-12 bg-gray-900/70 p-4 rounded-2xl border border-rose-500/30 backdrop-blur-md bg-gradient-to-r from-rose-500/20 to-cyan-500/20">
            <h3 className="text-xl text-white font-bold mb-3 font-poppins">Selected Horses</h3>
            <p className="text-cyan-400 font-inter">{selectedHorses.map((id) => liveHorses.find((h) => h.id === id)?.name).join(" & ")}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <motion.button
                onClick={() => placeBet(betType === "exacta" ? [selectedHorses[0], selectedHorses[1]] : betType === "trifecta" ? [selectedHorses[0], selectedHorses[1], selectedHorses[2]] : selectedHorses[0], betType)}
                className="bg-rose-600 px-3 py-1 rounded-full text-white font-semibold hover:bg-cyan-500 font-poppins text-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={gameState !== "IDLE" || (betType === "exacta" && selectedHorses.length !== 2) || (betType === "trifecta" && selectedHorses.length !== 3)}
                aria-label={`Place ${betType} bet`}
              >
                Place {betType.toUpperCase()} Bet
              </motion.button>
              <motion.button
                onClick={() => setSelectedHorses([])}
                className="bg-gray-600 px-3 py-1 rounded-full text-white font-semibold hover:bg-gray-700 font-poppins text-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Clear selected horses"
              >
                Clear Selection
              </motion.button>
            </div>
          </motion.div>
        )}

        <motion.div variants={sectionVariants} className="flex justify-between items-center mb-12 bg-gray-900/70 p-4 rounded-2xl border border-rose-500/30 backdrop-blur-md bg-gradient-to-r from-rose-500/20 to-cyan-500/20">
          <div className="text-lg text-white font-semibold font-poppins">
            JEWELS: <span className="text-cyan-400">{jewels}</span> | USDT: <span className="text-cyan-400">{gold}</span>
          </div>
          <motion.button
            onClick={startRace}
            disabled={gameState !== "IDLE"}
            className={gameState !== "IDLE" ? "px-8 py-4 bg-gray-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 font-poppins cursor-not-allowed" : "px-8 py-4 bg-rose-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 font-poppins hover:bg-cyan-500"}
            whileHover={{ scale: gameState !== "IDLE" ? 1 : 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Start Race"
          >
            <Dices className="w-6 h-6 text-cyan-400 animate-pulse" /> Start Race 🏁
          </motion.button>
        </motion.div>

        {(gameState === "RACING" || gameState === "RESULT" || gameState === "REPLAY") && (
          <motion.div variants={sectionVariants} className="relative w-full h-[400px] sm:h-[500px] mb-12 bg-gray-800 rounded-lg overflow-hidden">
            <SwytchErrorBoundary>
              <Canvas camera={{ position: [0, 5, 15], fov: 60 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                {liveHorses.map((horse, idx) => (
                  <HorseModel key={horse.id} position={horse.position} lane={idx} color="#22d3ee" />
                ))}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
                  <planeGeometry args={[20, 10]} />
                  <meshStandardMaterial color="#1a1a1a" />
                </mesh>
                <OrbitControls enableZoom={false} maxPolarAngle={Math.PI / 2} />
                {gameState === "RESULT" && !bets.some((b) => b.won) && <WinParticles trigger={true} />}
              </Canvas>
              <div className="absolute right-0 top-0 h-full w-2 bg-rose-400 z-10" />
              <AnimatePresence>
                {raceEvents.slice(-2).map((event, i) => (
                  <motion.div
                    key={`event-${i}`}
                    className="absolute left-1/2 top-2 text-white text-lg font-bold bg-black/70 px-4 py-2 rounded-xl font-poppins"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    style={{ transform: `translateX(-50%) translateY(${i * 40}px)` }}
                  >
                    {event}
                  </motion.div>
                ))}
              </AnimatePresence>
              {gameState === "RESULT" && (
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xl sm:text-2xl text-cyan-400 font-bold bg-black/80 px-6 py-2 rounded-full font-poppins">
                  Results: {raceResults.map((id, i) => `${i + 1}. ${liveHorses.find((h) => h.id === id)?.name}`).join(", ")}
                </div>
              )}
              {gameState === "REPLAY" && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <span className="text-4xl sm:text-6xl animate-bounce">🎉</span>
                </motion.div>
              )}
            </SwytchErrorBoundary>
          </motion.div>
        )}

        {bets.length > 0 && (
          <motion.div variants={sectionVariants} className="mb-12">
            <h3 className="text-xl text-white font-bold mb-3 font-poppins">Current Bets</h3>
            {bets.map((bet, i) => (
              <p key={`bet-${i}`} className={bet.won ? "text-green-400 font-inter" : "text-white font-inter"}>
                {bet.type.toUpperCase()} on {Array.isArray(bet.horseId) ? bet.horseId.map((id) => liveHorses.find((h) => h.id === id)?.name).join(" & ") : liveHorses.find((h) => h.id === bet.horseId)?.name}: {bet.amount} {useJewels ? "JEWELS" : "USDT"} {bet.won ? `(Won ${bet.payout})` : ""}
              </p>
            ))}
          </motion.div>
        )}

        <motion.div variants={sectionVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
          <div className="relative bg-gray-900/70 border border-rose-500/30 p-6 rounded-2xl backdrop-blur-md bg-gradient-to-r from-rose-500/20 to-cyan-500/20">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2 font-poppins">
              <Trophy className="w-6 h-6 text-cyan-400 animate-pulse" /> Your Stats
            </h3>
            <p className="text-cyan-400 font-inter">Wins: {stats.wins}</p>
            <p className="text-cyan-400 font-inter">Losses: {stats.losses}</p>
            <p className="text-cyan-400 font-inter">Total Races: {stats.totalRaces}</p>
            <p className="text-cyan-400 font-inter">Biggest Win: {stats.biggestWin} {useJewels ? "JEWELS" : "USDT"}</p>
            <p className="text-cyan-400 font-inter">Win Rate: {stats.totalRaces > 0 ? ((stats.wins / stats.totalRaces) * 100).toFixed(1) : 0}%</p>
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
              aria-label="Share Horse Race Win on X"
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

        {recentResults.length > 0 && (
          <motion.div variants={sectionVariants} className="mb-12">
            <h3 className="text-xl text-white font-bold mb-3 font-poppins">Recent Race Results</h3>
            {recentResults.map((result, i) => (
              <p key={`result-${i}`} className="text-cyan-400 font-inter">
                Post Time: {result.postTime} - {result.results.map((r) => `${r.position}. ${liveHorses.find((h) => h.id === r.horseId)?.name || "Unknown"}`).join(", ")}
              </p>
            ))}
          </motion.div>
        )}

        <motion.div variants={sectionVariants} className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
          <motion.button
            onClick={() => setShowTutorial(true)}
            className="px-6 py-3 bg-rose-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 font-poppins hover:bg-cyan-500"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Show Horse Racing Tutorial"
          >
            <Users className="w-5 h-5 text-cyan-400 animate-pulse" /> Show Tutorial
          </motion.button>
          <motion.button
            onClick={() => setShowFairness(true)}
            className="px-6 py-3 bg-rose-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 font-poppins hover:bg-cyan-500"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={!vrfResponse}
            aria-label="Verify RNG Fairness"
          >
            <Dices className="w-5 h-5 text-cyan-400 animate-pulse" /> Verify Fairness
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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
              role="dialog"
              aria-modal="true"
              aria-label="Horse Racing Tutorial Modal"
            >
              <motion.div
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
                  <Users className="w-6 h-6 text-cyan-400 animate-pulse" /> Anderomeda Raceway Tutorial
                </h3>
                <div className="text-gray-200 text-sm space-y-4 font-inter">
                  <p><b>Objective:</b> Bet on holographic horses in the pari-mutuel Anderomeda Raceway.</p>
                  <ul className="list-disc pl-6">
                    <li>Sign in to bet with 500–5000 JEWELS or USDT.</li>
                    <li>Choose Win (1st), Place (1st/2nd), Show (1st/2nd/3rd), Exacta (1st & 2nd), or Trifecta (1st, 2nd, 3rd).</li>
                    <li>Races run every 5 minutes, watch in 3D with Chainlink VRF fairness.</li>
                    <li>Win up to 200x your bet; enable auto-bet for continuous racing.</li>
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
          {showFairness && vrfResponse && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
              role="dialog"
              aria-modal="true"
              aria-label="RNG Fairness Modal"
            >
              <motion.div
                className="bg-gray-900 rounded-2xl max-w-md w-full p-8 border border-rose-500/30 backdrop-blur-lg bg-gradient-to-r from-rose-500/20 to-cyan-500/20"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                transition={{ duration: 0.4 }}
                tabIndex={-1}
              >
                <motion.button
                  onClick={() => setShowFairness(false)}
                  className="absolute top-4 right-4 text-cyan-400 hover:text-red-500"
                  whileHover={{ rotate: 90 }}
                  aria-label="Close fairness modal"
                >
                  <X className="w-6 h-6" />
                </motion.button>
                <h3 className="text-xl font-bold text-cyan-400 mb-6 flex items-center gap-3 font-poppins">
                  <Dices className="w-6 h-6 text-cyan-400 animate-pulse" /> RNG Fairness
                </h3>
                <div className="text-gray-200 text-sm space-y-4 font-inter">
                  <p>Races use Chainlink VRF for provably fair results.</p>
                  <p><b>Request ID:</b> {vrfResponse.requestId}</p>
                  <p><b>Random Number:</b> {vrfResponse.randomNumber}</p>
                  <p>
                    <b>Verify:</b>{" "}
                    <a href={vrfResponse.verificationUrl} target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline">
                      Check on Chainlink
                    </a>
                  </p>
                  <motion.button
                    onClick={() => setShowFairness(false)}
                    className="mt-4 px-6 py-3 bg-rose-600 text-white rounded-lg font-semibold font-poppins hover:bg-cyan-500"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Close fairness modal"
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

        <audio ref={raceSoundRef} src="/audio/reward.mp3" preload="auto" />
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

export default HorseRacing;