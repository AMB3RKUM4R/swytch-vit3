import { FC, useEffect } from 'react'; 
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { User, Loader2 } from 'lucide-react'; // Added Loader2
import SwytchErrorBoundary from '../components/ErrorBoundaryComponent';
import SwytchCard from '../components/SwytchCard';
// FIX: Using relative paths for context imports
import { usePlayer } from '../components/context/PlayerContext';
import { useModal } from '../components/context/ModalContext';
import LoadingSpinner from '../components/LoadingSpinner'; // FIX: Relative path
import { useWebGL } from '../components/context/WebglContext'; // FIX: Relative path

const CUSTOMIZE_STAGE_ID = "CustomizeScene"; 

const Customize: FC = () => {
  const { setShowMessage, setActiveModal } = useModal();
  const { playerData, dataLoading, authLoading } = usePlayer();
  // CRITICAL: Get setter and current active state
  const { activeGameId, setActiveGameId } = useWebGL(); 
  const navigate = useNavigate();

  const isCustomizerActive = activeGameId === CUSTOMIZE_STAGE_ID;
  
  // Checks if data loading is complete AND player has no avatar selected yet
  const needsCustomization = !dataLoading && !authLoading && !playerData?.character?.selectedID;
  const isPending = dataLoading || authLoading;

  useEffect(() => {
    // 1. If player data is ready and avatar is selected, redirect them home
    if (!dataLoading && playerData?.character?.selectedID) {
        navigate('/home', { replace: true });
        return;
    }
    
    // 2. Automatically launch the dedicated customization stage if needed and not already launched
    if (needsCustomization && !isCustomizerActive) {
        setActiveGameId(CUSTOMIZE_STAGE_ID);
        setShowMessage("Launching 3D Sentinel Terminal for Identity Genesis...");
    }
    
    // NOTE: We do not add cleanup here, as we want the customization to run until finished/closed by the Unity C# script.
    // The C# script calls CloseGameSession() which calls setActiveGameId(null).
  }, [dataLoading, playerData?.character?.selectedID, navigate, setActiveGameId, needsCustomization, isCustomizerActive, setShowMessage]);


  if (isPending || playerData?.character?.selectedID) {
    return <LoadingSpinner fullScreen message="Checking authorization and identity status..." />;
  }
  
  // If we reach here, we are waiting for the WebGL client to load the customization scene.
  return (
    <SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}>
      <motion.div
        className="min-h-screen text-foreground max-w-7xl mx-auto py-24 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.section className="text-center mb-12">
          <User className="mx-auto w-16 h-16 text-primary text-glow-primary mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold text-foreground font-russo mb-4">
            Identity Genesis
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto font-inter">
            Select your Hunter Archetype in the 3D terminal below. The interface will be full-screen for maximum immersion.
          </p>
        </motion.section>

        {/* This placeholder is shown *behind* the UnityStage overlay while it loads. 
            It confirms the process is happening. */}
        <SwytchCard variant="holographic" className="p-8 h-[600px] flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
            <p className="text-xl text-muted-foreground">3D Customizer Loading... Please wait for the full-screen terminal.</p>
        </SwytchCard>

      </motion.div>
    </SwytchErrorBoundary>
  );
};

export default Customize;