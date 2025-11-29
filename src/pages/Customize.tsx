// src/pages/Customize.tsx
import { FC, useEffect } from 'react'; // Added useEffect
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import SwytchErrorBoundary from '../components/ErrorBoundaryComponent';
import SwytchCard from '../components/SwytchCard';
import { usePlayer } from '@/components/context/PlayerContext';
import { useModal } from '@/components/context/ModalContext';
import LoadingSpinner from '@/components/LoadingSpinner';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } },
};

const CUSTOMIZE_STAGE_ID = "CustomizeScene"; // Define the specific stage ID

const Customize: FC = () => {
  const { setShowMessage, setActiveModal } = useModal();
  const { playerData, dataLoading, authLoading } = usePlayer();
  const navigate = useNavigate();
  
  // NOTE: This component needs access to the activeGameId state management from App.tsx/Context.
  // Assuming the context provides setActiveGameId.
  // For demonstration, we assume a context or prop provides this setter:
  const setActiveGameId = (id: string | null) => { 
      // Replace this with your actual state setter logic
      console.log(`Setting active game ID to: ${id}`);
  };


  useEffect(() => {
    // CRITICAL: On load, launch the dedicated customization stage in the Unity WebGL instance.
    setActiveGameId(CUSTOMIZE_STAGE_ID);
    
    // If the user already has an avatar, redirect them immediately.
    if (playerData?.character?.selectedID) {
        navigate('/home', { replace: true });
    }
    
    // Cleanup function when the component unmounts
    return () => setActiveGameId(null);
  }, [playerData?.character?.selectedID, navigate, setActiveGameId]);


  const isPending = dataLoading || authLoading;

  if (isPending) {
    return <LoadingSpinner fullScreen message="Checking authorization..." />;
  }

  // NOTE: The Continue button logic is now handled by the Unity client signaling the web app.
  // This React-based component now primarily hosts the WebGL screen.

  return (
    <SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}>
      <motion.div
        className="min-h-screen text-foreground max-w-7xl mx-auto py-24 px-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.section variants={sectionVariants} className="text-center mb-12">
          <User className="mx-auto w-16 h-16 text-primary text-glow-primary mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold text-foreground font-russo mb-4">
            Identity Genesis
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto font-inter">
            Select your Hunter Archetype in the 3D terminal below.
          </p>
        </motion.section>

        {/* The 3D Unity Customization Stage will be rendered via UnityStage.tsx component */}
        <SwytchCard variant="holographic" className="p-8 h-[600px] flex items-center justify-center">
            <p className="text-xl text-muted-foreground">3D Customization Stage Loading...</p>
        </SwytchCard>

      </motion.div>
    </SwytchErrorBoundary>
  );
};

export default Customize;