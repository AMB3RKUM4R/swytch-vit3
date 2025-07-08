import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Testimonial {
  quote: string;
  author: string;
}

const testimonials: Testimonial[] = [
  {
    quote: 'Swytch’s DAO let me propose a new quest that’s now live! I’ve never felt so empowered in a community.',
    author: 'Zara, Mythic PET, London',
  },
  {
    quote: 'Voting on Swytch’s future feels like shaping a digital nation. My voice matters here.',
    author: 'Kai, Elder, Tokyo',
  },
  {
    quote: 'Earning JEWELS for governance contributions is a game-changer. This is true ownership.',
    author: 'Luna, Guardian, Nairobi',
  },
];

const TestimonialsCarousel: React.FC = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div variants={{ hidden: { opacity: 0, y: 50, scale: 0.95 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut', type: 'spring', stiffness: 100 } }}} className="relative space-y-6">
      <h3 className="text-3xl font-bold text-white flex items-center justify-center gap-3 font-poppins">
        <Heart className="w-8 h-8 text-rose-400 animate-pulse" /> PET Voices
      </h3>
      <p className="text-lg text-gray-300 text-center max-w-3xl mx-auto font-inter">
        Hear from PETs shaping the Petaverse.
      </p>
      <motion.div
        className="relative bg-gray-900/50 border border-rose-500/20 p-6 rounded-2xl shadow-xl backdrop-blur-md hover:shadow-rose-400/30 transition-all bg-gradient-to-r from-rose-500/10 to-pink-500/10 max-w-2xl mx-auto"
        whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(244, 63, 94, 0.5)' }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTestimonial}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            className="text-center p-6"
          >
            <p className="text-gray-300 italic mb-2 font-inter">"{testimonials[currentTestimonial].quote}"</p>
            <p className="text-rose-400 font-bold font-poppins">— {testimonials[currentTestimonial].author}</p>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default TestimonialsCarousel;