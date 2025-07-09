import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Volume2, VolumeX } from 'lucide-react';
import { useAuthUser } from '@/hooks/useAuthUser';
import { useModal } from '@/context/ModalContext';
import SwytchErrorBoundary from '@/components/ErrorBoundaryComponent';
// AuthModal is typically rendered globally via useModal in Root.tsx,
// so explicit import here for direct rendering might be redundant if so.
// import AuthModal from '@/components/AuthModal';
import { auth } from '@/lib/firebaseConfig'; // Used for auth.currentUser check if user is not available

interface CosmicHeroProps {
  userId: string | null;
}

const CosmicHero: React.FC<CosmicHeroProps> = ({ userId }) => {
  const { user, loading } = useAuthUser(); // Get user and loading state from auth hook
  const [isAudioPlaying, setIsAudioPlaying] = useState(true);
  const { setActiveModal, setShowMessage } = useModal(); // Destructure activeModal as well for potential local use

  // Toggles background audio playback
  const toggleAudio = () => {
    setIsAudioPlaying(!isAudioPlaying);
  };

  // Handles the 'Connect' button click, guiding user to sign in or payment
  const handleConnect = () => {
    // Check if user is logged in via Firebase auth or has a userId
    if (!userId || !auth.currentUser || !user) {
      setActiveModal('auth'); // Trigger the AuthModal
      setShowMessage('⚠️ Sign in to connect to the PETverse!');
      return;
    }
    // If user is logged in, proceed to payment modal or show connection message
    setShowMessage(`ℹ️ Connecting to the PETverse as ${user.email || 'User'}...`);
    setActiveModal('payment'); // Trigger the PaymentModal
  };

  // Display a loading state while authentication or user data is being fetched
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-gray-950 font-inter">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <Star className="w-10 h-10 text-cyan-400 animate-pulse mx-auto mb-4" />
          <p>Loading Cosmic Carnival...</p>
        </motion.div>
      </div>
    );
  }

  return (
    // SwytchErrorBoundary wraps the section to catch and display errors gracefully within this component tree
    <SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}>
      <section className="relative w-full h-screen bg-gray-950 overflow-hidden">
        {/* Dynamic background image with a subtle horizontal parallax effect */}
        <motion.div
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: `url(https://images.unsplash.com/photo-1695825066269-1b1ff78100b0?q=80&w=2070&auto=format&fit=crop)`, opacity: 0.4 }}
          animate={{ x: ['0%', '-100%'] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
        {/* Subtle gradient overlay for atmospheric depth and color blending */}
        <motion.div
          className="absolute inset-0 z-5 bg-gradient-to-b from-transparent via-rose-900/20 to-cyan-900/50"
          animate={{ opacity: [0.3, 0.5, 0.3], y: [0, -20, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Animated background particles for a 'star dust' or 'cosmic glitter' effect */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-cyan-400/50"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0], // Subtle vertical float for depth
              opacity: [0.2, 0.8, 0.2], // Fading in and out for shimmer
              scale: [0.5, 1, 0.5], // Subtle size change for sparkle
            }}
            transition={{
              duration: Math.random() * 3 + 2, // Varied durations for a natural, non-repeating look
              repeat: Infinity,
              ease: 'easeInOut',
              delay: Math.random() * 2, // Staggered start times for organic motion
            }}
          />
        ))}
        {/* Main content layer, positioned above all background elements with higher z-index */}
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center text-white">
          {/* Main title with a dynamic, glowing effect and a continuously spinning star icon */}
          <motion.h1
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1.5, ease: 'easeOut', type: 'spring', stiffness: 80 }}
            className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-rose-400 font-poppins mb-6 text-center drop-shadow-lg"
          >
            Swytch PETverse
            <motion.span
              animate={{ rotate: [0, 360], scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="inline-block ml-4"
            >
              <Star className="w-12 h-12 text-cyan-400 animate-pulse" />
            </motion.span>
          </motion.h1>
          {/* Subtitle providing a clear call to action or welcoming message with subtle animation */}
          <motion.p
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.7, ease: 'easeOut', delay: 0.2 }}
            className="text-xl sm:text-2xl md:text-3xl text-gray-300 font-inter mb-10 text-center max-w-3xl mx-auto drop-shadow-md"
          >
            Step into the cosmic carnival!
          </motion.p>
          {/* Primary Call to Action button with engaging hover and tap animations */}
          <motion.button
            className="px-8 py-4 bg-rose-600 text-white rounded-md font-poppins hover:bg-cyan-500 transition-colors duration-200 shadow-lg flex items-center justify-center gap-2"
            onClick={handleConnect}
            whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(34, 211, 238, 0.7)' }}
            whileTap={{ scale: 0.95 }}
            aria-label="Connect to PETverse"
          >
            <Star className="w-6 h-6" /> Connect
          </motion.button>
        </div>
        {/* Audio toggle button, fixed at the top-right corner */}
        <motion.button
          className="absolute top-4 right-4 z-20 p-2 bg-gray-800 rounded-full text-rose-400 hover:text-cyan-500"
          onClick={toggleAudio}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label={isAudioPlaying ? 'Mute Audio' : 'Unmute Audio'}
        >
          {isAudioPlaying ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
        </motion.button>
        {/* Background audio loop for immersive experience */}
        <audio src="/audio/cosmic-hum.mp3" loop preload="auto" />

        {/* Note on Modals: AuthModal (and PaymentModal) are typically rendered by the global ModalProvider
            in Root.tsx based on the `activeModal` state from `useModal()`.
            Thus, direct rendering here is usually not necessary if they are global.
            If your setup requires local rendering, uncomment the AnimatePresence block below.
        */}
        {/*
        <AnimatePresence>
          {activeModal === 'auth' && ( // Condition to show AuthModal based on global state
            <AuthModal setShowMessage={setShowMessage} />
          )}
        </AnimatePresence>
        */}
      </section>
    </SwytchErrorBoundary>
  );
};

export default CosmicHero;