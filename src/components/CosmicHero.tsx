
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Volume2, VolumeX } from 'lucide-react';
import { useAuthUser } from '@/hooks/useAuthUser';
import { useModal } from '@/context/ModalContext';
import SwytchErrorBoundary from '@/components/ErrorBoundaryComponent';
import AuthModal from '@/components/AuthModal';
import { auth } from '@/lib/firebaseConfig';

interface CosmicHeroProps {
  userId: string | null;
}

const CosmicHero: React.FC<CosmicHeroProps> = ({ userId }) => {
  const { user, loading } = useAuthUser();
  const [isAudioPlaying, setIsAudioPlaying] = useState(true);
  const { setActiveModal, setShowMessage } = useModal();

  const toggleAudio = () => {
    setIsAudioPlaying(!isAudioPlaying);
  };

  const handleConnect = () => {
    if (!userId || !auth.currentUser || !user) {
      setActiveModal('auth');
      setShowMessage('⚠️ Sign in to connect to the PETverse!');
      return;
    }
    setShowMessage(`ℹ️ Connecting to the PETverse as ${user.email || 'User'}...`);
    setActiveModal('payment');
  };

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
    <SwytchErrorBoundary setShowMessage={function (_value: React.SetStateAction<string>): void {
      throw new Error('Function not implemented.');
    } } setActiveModal={function (_value: React.SetStateAction<string | null>): void {
      throw new Error('Function not implemented.');
    } }>
      <section className="relative w-full h-screen bg-gray-950 overflow-hidden">
        <motion.div
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: `url(https://images.unsplash.com/photo-1695825066269-1b1ff78100b0?q=80&w=2070&auto=format&fit=crop)`, opacity: 0.4 }}
          animate={{ x: ['0%', '-100%'] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute inset-0 z-5 bg-gradient-to-b from-transparent via-rose-900/20 to-cyan-900/50"
          animate={{ opacity: [0.3, 0.5, 0.3], y: [0, -20, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-cyan-400/50"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: Math.random() * 2,
            }}
          />
        ))}
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center text-white">
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
          <motion.p
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.7, ease: 'easeOut', delay: 0.2 }}
            className="text-xl sm:text-2xl md:text-3xl text-gray-300 font-inter mb-10 text-center max-w-3xl mx-auto drop-shadow-md"
          >
            Step into the cosmic carnival!
          </motion.p>
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
        <motion.button
          className="absolute top-4 right-4 z-20 p-2 bg-gray-800 rounded-full text-rose-400 hover:text-cyan-500"
          onClick={toggleAudio}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label={isAudioPlaying ? 'Mute Audio' : 'Unmute Audio'}
        >
          {isAudioPlaying ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
        </motion.button>
        <audio src="/audio/cosmic-hum.mp3" loop preload="auto" />
        <AnimatePresence>
          {userId && (
            <AuthModal
              setShowMessage={setShowMessage}
            />
          )}
        </AnimatePresence>
        <style>{`
          .animate-pulse-slow {
            animation: pulse-slow 3s infinite;
          }
          @keyframes pulse-slow {
            0% { opacity: 0.4; }
            50% { opacity: 0.5; }
            100% { opacity: 0.4; }
          }
          .bg-smoke {
            background: radial-gradient(circle, rgba(34, 211, 238, 0.2) 0%, transparent 70%);
          }
        `}</style>
      </section>
    </SwytchErrorBoundary>
  );
};

export default CosmicHero;
