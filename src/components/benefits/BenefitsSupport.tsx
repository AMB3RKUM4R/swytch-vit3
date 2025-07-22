// src/components/benefits/BenefitsSupport.tsx
import { FC } from 'react';
import { motion } from 'framer-motion';
import { Headset, Mail, MessageSquare, Phone, ArrowRight } from 'lucide-react';
import SwytchCard from '../SwytchCard';

interface BenefitsSupportProps {
  userId: string | null;
  logUpiIntent: (amount: number) => Promise<void>; // Example prop for a support-related action
}

const supportOptions = [
  {
    icon: Mail,
    title: 'Email Support',
    description: 'Get personalized assistance via email for any queries.',
    action: 'mailto:support@swytch.pet',
  },
  {
    icon: MessageSquare,
    title: 'Community Forum',
    description: 'Connect with other players and find answers in our forum.',
    action: '/community', // Link to community page
  },
  {
    icon: Phone,
    title: 'Live Chat (Coming Soon)',
    description: 'Instant support from our team during business hours.',
    action: '#', // Placeholder for live chat
    comingSoon: true,
  },
];

const BenefitsSupport: FC<BenefitsSupportProps> = ({ userId, logUpiIntent }) => {
  const handleActionClick = (action: string, comingSoon: boolean = false) => {
    if (comingSoon) {
      alert('This feature is coming soon!');
      return;
    }
    if (action.startsWith('http') || action.startsWith('mailto')) {
      window.open(action, '_blank');
    } else if (action.startsWith('/')) {
      // For internal links, Link component would be better, but for buttons:
      // This would require navigate from react-router-dom, or a direct link
      window.location.href = action; // Simple redirect for now
    }
  };

  return (
    <SwytchCard gradient="from-teal-700/20 to-green-700/20" className="p-6">
      <h2 className="text-2xl font-bold text-white font-poppins mb-4 text-center flex items-center justify-center gap-2">
        <Headset className="w-7 h-7 text-primary" /> Need Support?
      </h2>
      <p className="text-lg text-gray-300 text-center mb-6">
        We're here to help you every step of the way.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {supportOptions.map((option, index) => (
          <motion.div key={index} whileHover={{ scale: option.comingSoon ? 1 : 1.03 }} whileTap={{ scale: option.comingSoon ? 1 : 0.98 }}>
            <div
              className={`bg-gray-800/50 p-4 rounded-lg border border-gray-700 text-center h-full flex flex-col items-center justify-center
                          ${option.comingSoon ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
              onClick={() => handleActionClick(option.action, option.comingSoon)}
            >
              {option.icon && <option.icon className="w-8 h-8 text-cyan-400 mb-3" />}
              <h3 className="text-xl font-semibold text-white mb-2">{option.title}</h3>
              <p className="text-sm text-gray-300">{option.description}</p>
              {option.comingSoon && (
                <span className="text-xs text-yellow-400 mt-2">Coming Soon</span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {userId && (
        <div className="text-center mt-6">
          <motion.button
            className="btn-primary flex items-center justify-center mx-auto"
            onClick={() => logUpiIntent(100)} // Example: log a UPI intent for 100 INR for support
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Make a small UPI deposit for support"
          >
            <ArrowRight className="w-5 h-5 mr-2" /> Quick Support Deposit (UPI)
          </motion.button>
        </div>
      )}
    </SwytchCard>
  );
};

export default BenefitsSupport;
