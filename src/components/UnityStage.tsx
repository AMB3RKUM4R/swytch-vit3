import { FC, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Maximize2, Loader2, Gamepad2 } from 'lucide-react';
import { Unity, useUnityContext } from 'react-unity-webgl';
import { usePlayer } from "./context/PlayerContext"; 
import { staticShopItems } from "@/lib/staticShopData";
import { PlayerData } from "@/lib/types";
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'; 
import { db } from '@/lib/firebaseConfig'; 

// HELPER: Convert Firestore Data for Unity C#
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
  if (clean.session?.webTokenCreatedAt) clean.session.webTokenCreatedAt = toMillis(clean.session.webTokenCreatedAt);
  if (clean.inventory?.items) {
    Object.keys(clean.inventory.items).forEach(key => {
      const item = clean.inventory.items[key];
      if (item.acquiredAt) item.acquiredAt = toMillis(item.acquiredAt);
    });
  }
  return clean;
};

interface UnityStageProps {
    activeGameId: string | null;
    setActiveGameId: (id: string | null) => void;
}

const UnityStage: FC<UnityStageProps> = ({ activeGameId, setActiveGameId }) => {
  const [error, setError] = useState<string | null>(null);
  const { playerData, userId } = usePlayer();

  // DYNAMIC CONFIGURATION
  // This expects your public folder to have: /games/[id]/Build/[id].loader.js
  const unityConfig = {
    loaderUrl: `/games/${activeGameId}/Build/${activeGameId}.loader.js`,
    dataUrl: `/games/${activeGameId}/Build/${activeGameId}.data.unityweb`,
    frameworkUrl: `/games/${activeGameId}/Build/${activeGameId}.framework.js.unityweb`,
    codeUrl: `/games/${activeGameId}/Build/${activeGameId}.wasm.unityweb`,
    streamingAssetsUrl: `/games/${activeGameId}/StreamingAssets`,
  };

  const {
    unityProvider,
    isLoaded,
    loadingProgression,
    unload,
    sendMessage,
    addEventListener,
    removeEventListener,
  } = useUnityContext(unityConfig);

  // HANDLE MESSAGES FROM UNITY
  const handleUnityMessage = useCallback(async (messageStr: string) => {
    console.log("Unity Msg:", messageStr);
    
    if (messageStr === "CHARACTER_SELECTED_SUCCESS") {
      setActiveGameId(null); 
    } 
    else if (messageStr.startsWith("GAME_COMPLETE")) {
        try {
            const payloadStr = messageStr.split("|")[1];
            const data = JSON.parse(payloadStr);
            if (data.victory && data.joulesEarned > 0 && userId) {
                await addDoc(collection(db, 'Transactions'), {
                    transactionId: `GAME_${activeGameId}_${Date.now()}`,
                    userId: userId,
                    amount: data.joulesEarned,
                    currency: 'JOULES',
                    transactionType: 'game_reward',
                    status: 'pending',
                    timestamp: serverTimestamp(),
                    itemId: activeGameId 
                });
            }
            setActiveGameId(null);
        } catch (e) {
            console.error(e);
            setActiveGameId(null); 
        }
    }
  }, [setActiveGameId, userId, activeGameId]);

  useEffect(() => {
    // Only bind listeners if a game is active
    if (!activeGameId) return;

    addEventListener("WebMessage", handleUnityMessage);
    
    if (isLoaded) {
      // 1. Send Ready Signal (Optional, depending on your C# setup)
      // sendMessage('GameManager', 'GameReady');

      // 2. Inject Player Data
      if (playerData) {
          sendMessage('AuthManager', 'ReceivePlayerData', JSON.stringify(sanitizeForUnity(playerData)));
      }

      // 3. Inject Shop Data
      sendMessage('EquipmentManager', 'ReceiveItemDefinitions', JSON.stringify(staticShopItems));
    }

    return () => {
        removeEventListener("WebMessage", handleUnityMessage);
    };
  }, [activeGameId, isLoaded, sendMessage, addEventListener, removeEventListener, handleUnityMessage, playerData]);

  // Clean up when closing
  useEffect(() => {
      if (!activeGameId) {
          // Attempt to unload cleanly to free memory
          unload().catch((e) => console.log("Unity unload cleanup:", e));
      }
  }, [activeGameId, unload]);

  if (!activeGameId) return null;

  return (
    <AnimatePresence>
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
        >
            <motion.div 
                initial={{ scale: 0.9, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 50 }}
                className="relative w-full max-w-[450px] aspect-[9/16] max-h-[90vh] bg-black border border-primary shadow-[0_0_50px_rgba(0,255,65,0.2)] rounded-sm overflow-hidden flex flex-col"
            >
                <div className="h-10 bg-black border-b border-white/10 flex items-center justify-between px-3">
                    <div className="flex items-center gap-2">
                         <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                         <span className="text-xs font-mono text-primary tracking-widest uppercase">
                             NET_LINK: {activeGameId}
                         </span>
                    </div>
                    <button onClick={() => setActiveGameId(null)} className="text-white hover:text-red-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 relative bg-gray-900">
                    {!isLoaded && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-10">
                            <Gamepad2 className="w-16 h-16 text-primary animate-bounce mb-6" />
                            <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
                                <motion.div 
                                    className="h-full bg-primary"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${loadingProgression * 100}%` }}
                                />
                            </div>
                            <p className="text-xs text-primary font-mono mt-4">LOADING ASSETS... {(loadingProgression * 100).toFixed(0)}%</p>
                        </div>
                    )}
                    
                    <Unity unityProvider={unityProvider} className="w-full h-full" />
                </div>

                <div className="h-12 bg-black border-t border-white/10 flex items-center justify-center gap-6">
                     <span className="text-[10px] text-gray-500 font-mono">CONTROLS: TOUCH / MOUSE</span>
                     <button className="text-white/50 hover:text-white" title="Fullscreen">
                        <Maximize2 className="w-4 h-4" />
                     </button>
                </div>
            </motion.div>
        </motion.div>
    </AnimatePresence>
  );
};

export default UnityStage;