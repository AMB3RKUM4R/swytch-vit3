import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

// IMPORTANT: Import Testimonial and TestimonialsCarouselProps from lib/types.ts
import { Testimonial, TestimonialsCarouselProps as ImportedTestimonialsCarouselProps } from '../lib/types';


// Testimonial interface is now imported from lib/types.ts
const testimonialsData: Testimonial[] = [ // Static mock data for testimonials
  {
    id: 1,
    quote: "Swytch PETverse truly redefines what it means to own your digital life. The rewards are real!",
    author: "AstraRebel",
    role: "Community Leader",
    avatar: "/avatar1.jpg",
  },
  {
    id: 2,
    quote: "The yield system is mind-blowing. My JEWELS are growing faster than I imagined!",
    author: "NovaGuardian",
    role: "Early Adopter",
    avatar: "/avatar3.jpg",
  },
  {
    id: 3,
    quote: "Finally, a platform where my voice matters. The DAO governance is incredibly empowering.",
    author: "QuantumSage",
    role: "DAO Contributor",
    avatar: "/avatar2.jpg",
  },
  {
    id: 4,
    quote: "Learning about blockchain through gamified quests? Genius! Swytch is revolutionizing education.",
    author: "CipherOracle",
    role: "Educator",
    avatar: "/avatar4.jpg",
  },
];

// Use ImportedTestimonialsCarouselProps as the type for the FC
const TestimonialsCarousel: React.FC<ImportedTestimonialsCarouselProps> = () => { // No props destructured from FC
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === testimonialsData.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? testimonialsData.length - 1 : prevIndex - 1
    );
  };

  // Autoplay functionality
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000); // Change slide every 5 seconds
    return () => clearInterval(interval);
  }, [currentIndex]); // Restart interval if currentIndex changes manually

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="relative max-w-4xl mx-auto py-12 px-6 sm:px-8 lg:px-16"
    >
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20 rounded-2xl"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1517486804-f58c741499e9?q=80&w=2070&auto=format&fit=crop)' }} // Example background image
      />
      <div className="relative bg-gray-900/70 border border-cyan-500/20 p-8 rounded-2xl shadow-xl backdrop-blur-md">
        <h2 className="text-4xl font-bold text-cyan-400 text-center mb-8 font-poppins">
          What PETs Say
        </h2>
        <div className="overflow-hidden relative h-[250px]"> {/* Fixed height for carousel content */}
          <AnimatePresence initial={false} custom={currentIndex}>
            <motion.div
              key={currentIndex} // Use currentIndex as key for AnimatePresence to detect changes
              custom={currentIndex} // Pass custom prop for transition direction if desired (not implemented here)
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className="absolute w-full h-full flex flex-col justify-center items-center text-center"
            >
              <Star className="w-10 h-10 text-rose-400 mb-4" />
              <p className="text-xl text-gray-200 italic font-inter mb-4">"{testimonialsData[currentIndex].quote}"</p>
              <p className="text-md font-semibold text-white font-poppins">
                - {testimonialsData[currentIndex].author}, <span className="text-gray-400">{testimonialsData[currentIndex].role}</span>
              </p>
              <img src={testimonialsData[currentIndex].avatar} alt={testimonialsData[currentIndex].author} className="w-16 h-16 rounded-full mx-auto mt-4 border-2 border-cyan-400" onError={(e) => { e.currentTarget.src = '/fallback-avatar.jpg'; }}/>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="flex justify-between items-center mt-8">
          <motion.button
            onClick={prevSlide}
            className="p-2 bg-gray-800/50 rounded-full text-cyan-400 hover:bg-gray-700/50"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-6 h-6" />
          </motion.button>
          <div className="flex space-x-2">
            {testimonialsData.map((_, index) => (
              <button
                key={index} // Using index as key for pagination dots is acceptable as they are stable.
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full ${index === currentIndex ? 'bg-rose-400' : 'bg-gray-600'}`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
          <motion.button
            onClick={nextSlide}
            className="p-2 bg-gray-800/50 rounded-full text-cyan-400 hover:bg-gray-700/50"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-6 h-6" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default TestimonialsCarousel;