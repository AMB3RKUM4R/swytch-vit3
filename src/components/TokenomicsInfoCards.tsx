import { FC, memo } from 'react';
import { motion } from 'framer-motion';
import { SwytchCard } from './SwytchCard';

interface Token {
  icon: string;
  title: string;
  description: string;
}

const tokenData: Token[] = [
  { icon: '/icon_energy.gif', title: 'JEWELS = Pure Energy', description: 'Earn JEWELS through deposits, education, and engagement. They’re your proof-of-purpose, unlocking the Swytch ecosystem’s full potential.' },
  { icon: '/icon_swap.gif', title: 'Stable Value, Zero Volatility', description: 'JSIT, FDMT, and SWYT tokens are pegged at $1, ensuring accessibility and shielding you from crypto market chaos.' },
  { icon: '/icon_reward.gif', title: '3.3% Monthly Yield', description: 'Earn up to 3.3% monthly yield at Mythic PET level through active participation—no staking, no lock-ups.' },
  { icon: '/icon_learning.gif', title: 'Knowledge Fuels Wealth', description: 'Master quests in the Raziel Library to boost your yield tier. Your learning becomes your stake in the Petaverse.' },
  { icon: '/icon_privacy.gif', title: 'Sovereign by Design', description: 'Swytch never touches your funds. Smart contracts ensure transparent rewards. Your keys, your vault, your freedom.' },
];

const sectionVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut' } }
};

const TokenomicsInfoCards: FC = memo(() => {
  return (
    <motion.div variants={sectionVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
      {tokenData.map((token, i) => (
        <SwytchCard key={i} gradient="from-cyan-500/10 to-blue-500/10">
          <div className="flex items-center mb-3 text-rose-400">
            <img
              src={token.icon}
              alt={token.title}
              className="w-6 h-6 mr-2 rounded animate-pulse"
              onError={(e) => { e.currentTarget.src = '/fallback-icon.png'; }}
            />
            <h4 className="text-lg font-bold font-poppins">{token.title}</h4>
          </div>
          <p className="text-gray-300 text-sm font-inter">{token.description}</p>
        </SwytchCard>
      ))}
    </motion.div>
  );
});

export default TokenomicsInfoCards;