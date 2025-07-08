import { motion } from 'framer-motion';
import { Trophy, Sparkles } from 'lucide-react';

interface Level {
  level: number;
  title: string;
  reward: string;
  energyRequired: string;
  perks: string[];
  icon: JSX.Element;
  image: string;
}

const fadeLeft: Variants = { hidden: { opacity: 0, x: -50 }, visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: 'easeOut' } } };
const infiniteScroll: Variants = { animate: { x: ['0%', '-100%'], transition: { x: { repeat: Infinity, repeatType: 'loop', duration: 20, ease: 'linear' } } } };

const levels: Level[] = [
  { level: 1, title: 'Initiate', reward: '1.0%', energyRequired: '100', perks: ['Basic Vault Access', 'Library Quests', 'NFT View Mode'], icon: <TrendingUp className="w-6 h-6 text-neon-green" />, image: '/bg.jpg' },
  { level: 2, title: 'Apprentice', reward: '1.3%', energyRequired: '250', perks: ['Chatbot Assistant', 'NFT Discounts'], icon: <Star className="w-6 h-6 text-neon-green" />, image: '/bg.jpg' },
  { level: 3, title: 'Seeker', reward: '1.6%', energyRequired: '500', perks: ['Quest Expansion', 'PET ID Perks'], icon: <ScrollText className="w-6 h-6 text-neon-green" />, image: '/bg.jpg' },
  { level: 4, title: 'Guardian', reward: '1.9%', energyRequired: '1000', perks: ['Vault Yield Boost', 'Private Vault Channels'], icon: <ShieldCheck className="w-6 h-6 text-neon-green" />, image: '/bg.jpg' },
  { level: 5, title: 'Sage', reward: '2.2%', energyRequired: '3000', perks: ['Beta Testing Rights', 'Voting Access'], icon: <Brain className="w-6 h-6 text-neon-green" />, image: '/bg.jpg' },
  { level: 6, title: 'Archon', reward: '2.5%', energyRequired: '5000', perks: ['Early Launch Drops', 'DAO Incentives'], icon: <BarChart2 className="w-6 h-6 text-neon-green" />, image: '/bg.jpg' },
  { level: 7, title: 'Alchemist', reward: '2.8%', energyRequired: '7500', perks: ['Smart Contract Access', 'NFT Mint Tools'], icon: <Flashlight className="w-6 h-6 text-neon-green" />, image: '/bg.jpg' },
  { level: 8, title: 'Elder', reward: '3.1%', energyRequired: '9000', perks: ['Legend Quests', 'Energy Bonus Boost'], icon: <Trophy className="w-6 h-6 text-neon-green" />, image: '/bg.jpg' },
  { level: 9, title: 'Mythic PET', reward: '3.3%', energyRequired: '10000', perks: ['Max Yield', 'Revenue Sharing', 'Game Designer Roles'], icon: <CircleDollarSign className="w-6 h-6 text-neon-green" />, image: '/bg.jpg' }
];

const MembershipLevels: React.FC = () => {
  const extendedLevels = [...levels, ...levels];

  return (
    <motion.div variants={fadeLeft}>
      <h3 className="text-3xl font-bold text-white flex items-center gap-3 mb-6 font-poppins">
        <Trophy className="w-8 h-8 text-neon-green animate-pulse" /> Membership Levels
      </h3>
      <p className="text-lg text-gray-300 mb-6 font-inter">
        Progress through PET levels by earning SWYT via gameplay and arbitrage, unlocking higher yields and exclusive perks.
      </p>
      <div className="relative overflow-hidden">
        <motion.div
          className="flex space-x-6"
          variants={infiniteScroll}
          animate="animate"
        >
          {extendedLevels.map((level, index) => (
            <motion.div
              key={`${level.level}-${index}`}
              className="min-w-[250px] bg-gray-900/50 p-6 rounded-lg border border-neon-green/20 hover:shadow-neon-green/30 transition-all backdrop-blur-md"
              whileHover={{ scale: 1.05 }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-dark-gray/80 rounded-lg" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-4">
                  {level.icon}
                  <h4 className="text-xl font-bold text-white font-poppins">{level.title}</h4>
                </div>
                <p className="text-neon-green font-semibold font-poppins">{level.reward} Monthly Yield</p>
                <p className="text-gray-400 text-sm font-inter">{level.energyRequired} Required</p>
                <ul className="mt-4 space-y-2 text-gray-300 text-sm font-inter">
                  {level.perks.map((perk, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-neon-green" /> {perk}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default MembershipLevels;