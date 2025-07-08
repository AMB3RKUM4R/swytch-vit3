import { motion, AnimatePresence } from 'framer-motion';
import { Quote } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Testimonial {
  id: number;
  quote: string;
  author: string;
  avatar: string;
  role?: string;
}

const testimonials: Testimonial[] = [
  { id: 1, quote: 'Swytch changed my life! Earning JEWELS feels like a game with real rewards.', author: 'AstraRebel', avatar: '/avatar1.jpg', role: 'Web3 Enthusiast' },
  { id: 2, quote: 'The Petaverse is freedom in action. I’m a Sage and proud!', author: 'QuantumSage', avatar: '/avatar2.jpg', role: 'Privacy Advocate' },
  { id: 3, quote: 'Raziel’s education tab is a game-changer. Knowledge = power.', author: 'NovaGuardian', avatar: '/avatar3.jpg', role: 'Storyteller' },
];

const ExplanationTestimonials: React.FC = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 50, scale: 0.95 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut', type: 'spring', stiffness: 80 } } }}
      className="space-y-6"
    >
      <h2 className="text-4xl font-extrabold text-white text-center flex items-center justify-center gap-4 font-poppins">
        <Quote className="w-10 h-10 text-rose-400 animate-pulse" /> PET Testimonials
      </h2>
      <p className="text-lg text-gray-300 max-w-3xl mx-auto text-center font-inter">
        Hear from those thriving in the PETverse’s cosmic expanse.
      </p>
      <motion.div
        className="relative bg-gray-900/50 border border-rose-500/20 p-6 rounded-2xl shadow-xl backdrop-blur-md hover:shadow-rose-400/30 transition-all bg-gradient-to-r from-rose-500/10 to-pink-500/10"
        whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(244, 63, 94, 0.5)' }}
      >
        <div className="relative h-[200px] overflow-hidden">
          <AnimatePresence initial={false}>
            <motion.div
              key={currentTestimonial}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 flex items-center justify-center p-6"
            >
              <div className="text-center">
                <img
                  src={testimonials[currentTestimonial].avatar}
                  alt={testimonials[currentTestimonial].author}
                  className="w-16 h-16 rounded-full mx-auto mb-4 border border-rose-500/20"
                  onError={(e) => { e.currentTarget.src = '/fallback-avatar.jpg'; }}
                />
                <p className="text-gray-300 italic mb-2 font-inter">"{testimonials[currentTestimonial].quote}"</p>
                <p className="text-rose-400 font-semibold font-poppins">{testimonials[currentTestimonial].author}</p>
                <p className="text-gray-300 text-xs sm:text-sm font-inter">{testimonials[currentTestimonial].role}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="flex justify-center gap-2 mt-4">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentTestimonial(i)}
              className={`w-3 h-3 rounded-full ${i === currentTestimonial ? 'bg-rose-600' : 'bg-gray-600'}`}
              aria-label={`View testimonial ${i + 1}`}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ExplanationTestimonials;