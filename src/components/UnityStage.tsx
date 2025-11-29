// src/components/UnityStage.tsx
import { FC, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Gamepad2, X, AlertTriangle } from 'lucide-react';
import { Unity, useUnityContext } from 'react-unity-webgl';
import { useNavigate } from 'react-router-dom';

const UNITY_CONFIG = {
  // NOTE: These URLs must point to your single, universal WebGL build path
  loaderUrl: "/unity/Build/WebGlBuild.loader.js", 
  dataUrl: "/unity/Build/WebGlBuild.data.unityweb",
  frameworkUrl: "/unity/Build/WebGlBuild.framework.js.unityweb",
  codeUrl: "/unity/Build/WebGlBuild.wasm.unityweb",
};

const UnityStage: FC<{ activeGameId: string | null; setActiveGameId: (id: string | null) => void }> = ({ activeGameId, setActiveGameId }) => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
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

  // --- 1. Handler for Unity Signals (Receives the C# message) ---
  const handleUnityMessage = useCallback((message: string) => {
    // CRITICAL LOGIC: If the customization scene succeeds, unload and navigate.
    if (message === "CHARACTER_SELECTED_SUCCESS") {
      setActiveGameId(null); // Unload the customization scene (closes the WebGL overlay)
      navigate("/home"); // Navigate the web app to the main hub
    }
    // Add other handlers here (e.g., "GAME_OVER_REWARD_CLAIMED")
  }, [setActiveGameId, navigate]);


  useEffect(() => {
    // 2. Subscribe to Unity Messages on mount
    // The C# code uses 'SendWebMessage' which must be exposed via 'WebMessage' event
    addEventListener("WebMessage", handleUnityMessage);
    
    // 3. Unload Unity instance when game is closed
    if (!activeGameId) {
      unload().catch(() => {});
      setError(null);
    } 
    // 4. CRITICAL: Send the initial scene command once loaded
    else if (isLoaded) {
      // This sends the specific scene ID (e.g., "CustomizeScene" or "ManaMinerScene") 
      // to the C# DungeonManager to tell it what to load internally.
      sendMessage('DungeonManager', 'SetAndLoadScene', activeGameId);
    }
    
    // Cleanup: Unsubscribe from event listeners
    return () => {
        removeEventListener("WebMessage", handleUnityMessage);
    };
  }, [activeGameId, unload, isLoaded, sendMessage, addEventListener, removeEventListener, handleUnityMessage]);

  if (!activeGameId) return null;

  if (error) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 bg-red-950 flex items-center justify-center">
        <div className="text-center p-12">
          <AlertTriangle className="w-32 h-32 text-red-500 mx-auto mb-8" />
          <h2 className="text-6xl font-black text-red-500 mb-8">SIMULATION FAILED</h2>
          <button onClick={() => setActiveGameId(null)} className="px-16 py-8 bg-red-600 rounded-3xl text-4xl font-black">
            RETURN TO CONSOLE
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
        </div>
      )}

      <Unity unityProvider={unityProvider} className="w-full h-full" />

      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        onClick={() => setActiveGameId(null)}
        className="absolute top-8 right-8 z-50 p-6 bg-red-600/90 backdrop-blur rounded-full hover:bg-red-700 transition-all"
      >
        <X className="w-12 h-12" />
      </motion.button>
    </motion.div>
  );
};

export default UnityStage;