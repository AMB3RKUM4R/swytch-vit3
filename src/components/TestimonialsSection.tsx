import { motion, AnimatePresence } from 'framer-motion';
import { Quote } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Testimonial {
  quote: string;
  author: string;
  role: string;
}

const testimonials: Testimonial[] = [
  {
    quote: 'Joining Swytch felt like stepping into a sci-fi epic. The onboarding is a game-changer!',
    author: 'Zara, London',
    role: 'Web3 Enthusiast'
  },
  {
    quote: 'Swytch’s privacy-first approach made me feel in control. It’s a true digital homeland.',
    author: 'Eli, Berlin',
    role: 'Privacy Advocate'
  },
  {
    quote: 'The PETverse’s lore pulled me in. I’m already crafting my own stories!',
    author: 'Nova, Sydney',
    role: 'Storyteller'
  }
];

const TestimonialsSection: React.FC = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 50, scale: 0.95 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut', type: 'spring', stiffness: 100 } } }}
      className="relative space-y-8"
    >
      <h3 className="text-3xl sm:text-4xl font-bold text-white flex items-center justify-center gap-3 font-poppins">
        <Quote className="w-8 h-8 sm:w-10 sm:h-10 text-rose-400 animate-pulse" /> PET Voices
      </h3>
      <p className="text-lg sm:text-xl text-gray-200 text-center max-w-4xl mx-auto font-inter">
        Hear from those thriving in the PETverse’s cosmic expanse.
      </p>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentTestimonial}
          className="relative bg-gray-900/50 border border-rose-500/20 p-6 rounded-2xl shadow-xl backdrop-blur-md hover:shadow-rose-400/30 transition-all bg-gradient-to-r from-rose-500/10 to-pink-500/10 max-w-3xl mx-auto text-center"
          whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(244, 63, 94, 0.5)' }}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.6 }}
          aria-label={`Testimonial by ${testimonials[currentTestimonial].author}`}
        >
          <p className="text-gray-200 italic text-sm sm:text-base mb-4 font-inter">"{testimonials[currentTestimonial].quote}"</p>
          <p className="text-rose-400 font-bold text-sm sm:text-base font-poppins">{testimonials[currentTestimonial].author}</p>
          <p className="text-gray-300 text-xs sm:text-sm font-inter">{testimonials[currentTestimonial].role}</p>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default TestimonialsSection;