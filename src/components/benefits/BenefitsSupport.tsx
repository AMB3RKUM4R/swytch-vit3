// src/components/benefits/BenefitsSupport.tsx
import { FC } from 'react';
import { motion } from 'framer-motion';
import { Headset, Mail, MessageSquare, Phone, ArrowRight } from 'lucide-react';
import SwytchCard from '../SwytchCard';

interface BenefitsSupportProps {
  userId: string | null;
  // Removed logUpiIntent as it is no longer used
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
    action: '/community',
  },
  {
    icon: Phone,
    title: 'Live Chat (Coming Soon)',
    description: 'Instant support from our team during business hours.',
    action: '#',
    comingSoon: true,
  },
];

const BenefitsSupport: FC<BenefitsSupportProps> = ({ userId }) => {
  const handleActionClick = (action: string, comingSoon: boolean = false) => {
    if (comingSoon) {
      alert('This feature is coming soon!');
      return;
    }
    if (action.startsWith('http') || action.startsWith('mailto')) {
      window.open(action, '_blank');
    } else if (action.startsWith('/')) {
      window.location.href = action;
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

    </SwytchCard>
  );
};

export default BenefitsSupport;