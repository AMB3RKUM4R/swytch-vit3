import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Star, Volume2, VolumeX } from 'lucide-react';

const CosmicHero: React.FC = () => {
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      isAudioPlaying
        ? audio.play().catch((err) => console.error('Audio playback failed:', err))
        : audio.pause();
    }
  }, [isAudioPlaying]);

  return (
    <section className="relative w-full h-screen bg-background overflow-hidden">
      {/* Scrolling nebula image */}
      <motion.div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{
          backgroundImage:
            'url(https://images.unsplash.com/photo-1695825066269-1b1ff78100b0?q=80&w=2070&auto=format&fit=crop)',
          opacity: 0.4,
        }}
        animate={{ x: ['0%', '-100%'] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      />

      {/* Atmospheric gradient */}
      <motion.div
        className="absolute inset-0 z-5 bg-gradient-to-b from-transparent via-primary/20 to-secondary/50"
        animate={{ opacity: [0.3, 0.5, 0.3], y: [0, -20, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Floating particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-secondary/50"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.8, 0.2],
            scale: [0.5, 1.2, 0.5],
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: Math.random() * 2,
          }}
        />
      ))}

      {/* Text + Art Element */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center text-foreground">
        <motion.h1
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut', type: 'spring', stiffness: 80 }}
          className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-primary font-poppins mb-6 text-center drop-shadow-lg"
        >
          Swytch PETverse
          <motion.span
            animate={{ rotate: [0, 360], scale: [1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="inline-block ml-4"
          >
            <Star className="w-12 h-12 text-secondary animate-pulse" />
          </motion.span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.7, ease: 'easeOut', delay: 0.2 }}
          className="text-xl sm:text-2xl md:text-3xl text-muted-foreground font-inter mb-10 text-center max-w-3xl mx-auto drop-shadow-md"
        >
          Step into the cosmic carnival.
        </motion.p>
      </div>

      {/* Audio Control */}
      <motion.button
        className="absolute top-4 right-4 z-20 p-2 rounded-full text-primary bg-muted hover:text-secondary"
        onClick={() => setIsAudioPlaying((prev) => !prev)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label={isAudioPlaying ? 'Mute Audio' : 'Unmute Audio'}
      >
        {isAudioPlaying ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
      </motion.button>

      {/* Background Audio */}
      <audio ref={audioRef} src="/audio/cosmic-hum.mp3" loop preload="auto" />
    </section>
  );
};

export default CosmicHero;
