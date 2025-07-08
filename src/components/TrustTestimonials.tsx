import { motion } from 'framer-motion';
import { Users } from 'lucide-react';

interface Testimonial {
  id: number;
  quote: string;
  author: string;
  avatar: string;
  role: string;
}

const testimonials: Testimonial[] = [
  { id: 1, quote: 'Swytch changed my life! Earning JEWELS feels like a game with real rewards.', author: 'AstraRebel', avatar: '/avatar1.jpg', role: 'Web3 Enthusiast' },
  { id: 2, quote: 'The Petaverse is freedom in action. I’m a Sage and proud!', author: 'QuantumSage', avatar: '/avatar2.jpg', role: 'Privacy Advocate' },
  { id: 3, quote: 'Raziel’s education tab is a game-changer. Knowledge = power.', author: 'NovaGuardian', avatar: '/avatar3.jpg', role: 'Storyteller' },
];

const TrustTestimonials: React.FC = () => {
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 50, scale: 0.95 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut', type: 'spring', stiffness: 80 } } }}
      className="space-y-8"
    >
      <h3 className="text-3xl font-bold text-white flex items-center justify-center gap-3 font-poppins">
        <Users className="w-8 h-8 text-rose-400 animate-pulse" /> What Our Community Says
      </h3>
      <p className="text-lg text-gray-300 max-w-3xl mx-auto text-center font-inter">
        Hear from PETs who are thriving in the Swytch ecosystem.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((testimonial) => (
          <motion.div
            key={testimonial.id}
            className="relative bg-gray-900/50 border border-rose-500/20 p-6 rounded-2xl shadow-xl backdrop-blur-md hover:shadow-rose-400/30 transition-all bg-gradient-to-r from-cyan-500/10 to-blue-500/10"
            whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(244, 63, 94, 0.5)' }}
          >
            <div className="flex flex-col items-center text-center">
              <img
                src={testimonial.avatar}
                alt={testimonial.author}
                className="w-16 h-16 rounded-full mb-4 border border-rose-500/20"
                onError={(e) => { e.currentTarget.src = '/fallback-avatar.jpg'; }}
              />
              <p className="text-gray-300 italic font-inter">"{testimonial.quote}"</p>
              <p className="text-rose-400 font-bold mt-2 font-poppins">{testimonial.author}</p>
              <p className="text-gray-400 text-sm font-inter">{testimonial.role}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default TrustTestimonials;