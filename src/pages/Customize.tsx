// src/pages/Customize.tsx
import { FC } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, User } from 'lucide-react'; // Added User icon
import SwytchErrorBoundary from '../components/ErrorBoundaryComponent';
import SwytchCard from '../components/SwytchCard';
import AvatarSelector from '@/components/Inventory/AvatarSelector';
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

const Customize: FC = () => {
  const { setShowMessage, setActiveModal } = useModal();
  const { playerData, dataLoading, authLoading } = usePlayer();
  const navigate = useNavigate();

  const isPending = dataLoading || authLoading;

  const hasSelectedAvatar = !!playerData?.character?.selectedID;

  if (isPending) {
    return <LoadingSpinner fullScreen message="Checking authorization..." />;
  }
  
  const handleContinue = () => {
    if (hasSelectedAvatar) {
      setShowMessage("🎉 Welcome to the PETverse! Sending you home...");
      navigate('/home');
    } else {
      setShowMessage("⚠️ Please select an avatar to continue.");
    }
  };

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
            Customize Your Hunter
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto font-inter">
            Select your starting avatar to begin your journey in the Petaverse. This is your digital identity.
          </p>
        </motion.section>

        <motion.section variants={sectionVariants} className="mb-12">
          <SwytchCard variant="holographic" className="p-8">
            <h2 className="text-3xl font-semibold font-poppins text-center text-primary mb-8">
              Choose Your Archetype
            </h2>
            <AvatarSelector playerData={playerData} /> 
          </SwytchCard>
        </motion.section>

        <motion.section variants={sectionVariants} className="text-center">
          <SwytchCard variant="default" className="p-6 max-w-2xl mx-auto">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <CheckCircle className={`w-8 h-8 mr-4 ${hasSelectedAvatar ? 'text-green-500' : 'text-gray-500'}`} />
                <span className={`text-xl font-poppins ${hasSelectedAvatar ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {hasSelectedAvatar ? 'Avatar Selected!' : 'Select an Avatar to Continue.'}
                </span>
              </div>
              <motion.button
                onClick={handleContinue}
                disabled={!hasSelectedAvatar}
                className="btn-primary flex items-center px-6 py-3 disabled:opacity-50"
                whileHover={hasSelectedAvatar ? { scale: 1.05 } : {}}
                whileTap={hasSelectedAvatar ? { scale: 0.95 } : {}}
              >
                Continue to Home <ArrowRight className="w-5 h-5 ml-2" />
              </motion.button>
            </div>
          </SwytchCard>
        </motion.section>
      </motion.div>
    </SwytchErrorBoundary>
  );
};

export default Customize;