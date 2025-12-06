// src/components/UnityStage.tsx
import { FC, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Gamepad2, X, AlertTriangle } from 'lucide-react';
import { Unity, useUnityContext } from 'react-unity-webgl';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from "./context/PlayerContext"; 
import { staticShopItems } from "@/lib/staticShopData";
import { PlayerData } from "@/lib/types";
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'; 
import { db } from '@/lib/firebaseConfig'; 

const UNITY_CONFIG = {
  // Ensure these match your actual build output folder
  loaderUrl: "/unity/Build/WebGlBuild.loader.js", 
  dataUrl: "/unity/Build/WebGlBuild.data.unityweb",
  frameworkUrl: "/unity/Build/WebGlBuild.framework.js.unityweb",
  codeUrl: "/unity/Build/WebGlBuild.wasm.unityweb",
};

// --- HELPER: SANITIZE DATA FOR UNITY ---
// Converts Firestore Timestamps to Numbers so Unity doesn't crash
const sanitizeForUnity = (data: PlayerData | null) => {
  if (!data) return null;
  const clean = JSON.parse(JSON.stringify(data));

  const toMillis = (val: any) => {
    if (!val) return 0;
    if (typeof val === 'number') return val; 
    if (val.toMillis) return val.toMillis(); 
    if (val.seconds) return val.seconds * 1000; 
    return 0;
  };

  if (clean.createdAt) clean.createdAt = toMillis(clean.createdAt);
  if (clean.updatedAt) clean.updatedAt = toMillis(clean.updatedAt);
  if (clean.session?.webTokenCreatedAt) {
     clean.session.webTokenCreatedAt = toMillis(clean.session.webTokenCreatedAt);
  }
  if (clean.inventory?.items) {
    Object.keys(clean.inventory.items).forEach(key => {
      const item = clean.inventory.items[key];
      if (item.acquiredAt) item.acquiredAt = toMillis(item.acquiredAt);
    });
  }
  return clean;
};

const UnityStage: FC<{ activeGameId: string | null; setActiveGameId: (id: string | null) => void }> = ({ activeGameId, setActiveGameId }) => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // Get Player Data & ID for transactions
  const { playerData, userId } = usePlayer();

  const {
    unityProvider,
    isLoaded,
    loadingProgression,
    unload,
    sendMessage,
    addEventListener,
    removeEventListener,
  } = useUnityContext({
    ...UNITY_CONFIG,
    streamingAssetsUrl: "/unity/StreamingAssets",
  });

  // --- 1. HANDLE MESSAGES FROM UNITY ---
  const handleUnityMessage = useCallback(async (messageStr: string) => {
    console.log("Unity Message Received:", messageStr);

    // A. Character Customizer Exit
    if (messageStr === "CHARACTER_SELECTED_SUCCESS") {
      setActiveGameId(null); 
      navigate("/home"); 
    }
    
    // B. Gameplay Result (Win/Loss) from UniversalLevelManager
    else if (messageStr.startsWith("GAME_COMPLETE")) {
        try {
            // Message format: "GAME_COMPLETE|{JSON_DATA}"
            const payloadStr = messageStr.split("|")[1];
            const data = JSON.parse(payloadStr);

            console.log("Game Result Data:", data);

            // If Victory AND User is Logged In -> Create Transaction
            if (data.victory && data.joulesEarned > 0 && userId) {
                await addDoc(collection(db, 'Transactions'), {
                    transactionId: `GAME_${activeGameId}_${Date.now()}`,
                    userId: userId,
                    amount: data.joulesEarned,
                    currency: 'JOULES',
                    transactionType: 'game_reward',
                    status: 'pending', // The new Cloud Function will see this and approve it
                    timestamp: serverTimestamp(),
                    itemId: activeGameId // Tracks which game (e.g. "mana_miner") paid out
                });
                console.log(`Transaction logged for ${data.joulesEarned} JOULES`);
            }
            
            // Close the Game Window regardless of Win/Loss
            setActiveGameId(null);
            navigate("/home");

        } catch (e) {
            console.error("Error processing game result:", e);
            setActiveGameId(null); // Force close so user isn't stuck
        }
    }
  }, [setActiveGameId, navigate, userId, activeGameId]);


  useEffect(() => {
    // 2. Subscribe to Unity Messages
    addEventListener("WebMessage", handleUnityMessage);
    
    // 3. Unload Unity instance when game is closed
    if (!activeGameId) {
      unload().catch(() => {});
      setError(null);
    } 
    // 4. INJECT DATA WHEN UNITY IS READY
    else if (isLoaded) {
      console.log(`Launching Scene: ${activeGameId}`);

      // A. Load the Specific Scene (e.g., "mana_miner", "gatekeeper")
      // CRITICAL: Target is 'GameManager', Function is 'SetAndLoadScene'
      sendMessage('GameManager', 'SetAndLoadScene', activeGameId);

      // B. Inject Player Data (Skins, Stats)
      if (playerData) {
          const cleanData = sanitizeForUnity(playerData);
          sendMessage('AuthManager', 'ReceivePlayerData', JSON.stringify(cleanData));
      }

      // C. Inject Item Database (Prices, Stats)
      sendMessage('EquipmentManager', 'ReceiveItemDefinitions', JSON.stringify(staticShopItems));
    }
    
    return () => {
        removeEventListener("WebMessage", handleUnityMessage);
    };
  }, [activeGameId, unload, isLoaded, sendMessage, addEventListener, removeEventListener, handleUnityMessage, playerData]);

  if (!activeGameId) return null;

  if (error) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 bg-red-950 flex items-center justify-center">
        <div className="text-center p-12">
          <AlertTriangle className="w-32 h-32 text-red-500 mx-auto mb-8" />
          <h2 className="text-6xl font-black text-red-500 mb-8">CONNECTION LOST</h2>
          <button onClick={() => setActiveGameId(null)} className="px-16 py-8 bg-red-600 rounded-3xl text-4xl font-black">
            RETURN TO HUB
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-40 bg-black">
      {!isLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-purple-900 to-black z-10">
          <Gamepad2 className="w-32 h-32 text-cyan-400 animate-pulse mb-12" />
          <div className="w-96 h-6 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-400 to-purple-600"
              initial={{ width: 0 }}
              animate={{ width: `${loadingProgression * 100}%` }}
              transition={{ ease: "easeOut", duration: 0.5 }}
            />
          </div>
          <p className="text-4xl mt-8 text-white font-bold">{(loadingProgression * 100).toFixed(0)}%</p>
          <p className="text-sm mt-4 text-muted-foreground">Initializing Simulation...</p>
        </div>
      )}

      <Unity unityProvider={unityProvider} className="w-full h-full" />

      {/* Emergency Exit Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        onClick={() => setActiveGameId(null)}
        className="absolute top-8 right-8 z-50 p-6 bg-red-600/90 backdrop-blur rounded-full hover:bg-red-700 transition-all border border-white/20"
      >
        <X className="w-8 h-8 text-white" />
      </motion.button>
    </motion.div>
  );
};

export default UnityStage;