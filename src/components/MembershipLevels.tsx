import { motion, Variants } from 'framer-motion';
import { Trophy, Sparkles, BarChart2, Brain, CircleDollarSign, Flashlight, ScrollText, ShieldCheck, Star } from 'lucide-react';

// IMPORTANT: Import Level and MembershipLevelsProps from lib/types.ts
import { Level, MembershipLevelsProps as ImportedMembershipLevelsProps } from '../lib/types';


// Level interface is now imported from lib/types.ts and renamed to Level (if it was conflicting)
const levels: Level[] = [ // Use Level type
  {
    level: 1, title: 'Initiate', reward: '1.0%', energyRequired: '100', perks: ['Basic Vault Access', 'Library Quests', 'NFT View Mode'], icon: Star, image: '/bg.jpg',
    id: 'gold',
    cost: 0,
    contentRoute: ''
  }, // FIX: Icon type
  {
    level: 2, title: 'Apprentice', reward: '1.3%', energyRequired: '250', perks: ['Chatbot Assistant', 'NFT Discounts'], icon: Star, image: '/bg.jpg',
    id: 'gold',
    cost: 0,
    contentRoute: ''
  }, // FIX: Icon type
  {
    level: 3, title: 'Seeker', reward: '1.6%', energyRequired: '500', perks: ['Quest Expansion', 'PET ID Perks'], icon: ScrollText, image: '/bg.jpg',
    id: 'gold',
    cost: 0,
    contentRoute: ''
  },
  {
    level: 4, title: 'Guardian', reward: '1.9%', energyRequired: '1000', perks: ['Vault Yield Boost', 'Private Vault Channels'], icon: ShieldCheck, image: '/bg.jpg',
    id: 'gold',
    cost: 0,
    contentRoute: ''
  },
  {
    level: 5, title: 'Sage', reward: '2.2%', energyRequired: '3000', perks: ['Beta Testing Rights', 'Voting Access'], icon: Brain, image: '/bg.jpg',
    id: 'gold',
    cost: 0,
    contentRoute: ''
  },
  {
    level: 6, title: 'Archon', reward: '2.5%', energyRequired: '5000', perks: ['Early Launch Drops', 'DAO Incentives'], icon: BarChart2, image: '/bg.jpg',
    id: 'gold',
    cost: 0,
    contentRoute: ''
  },
  {
    level: 7, title: 'Alchemist', reward: '2.8%', energyRequired: '7500', perks: ['Smart Contract Access', 'NFT Mint Tools'], icon: Flashlight, image: '/bg.jpg',
    id: 'gold',
    cost: 0,
    contentRoute: ''
  },
  {
    level: 8, title: 'Elder', reward: '3.1%', energyRequired: '9000', perks: ['Legend Quests', 'Energy Bonus Boost'], icon: Trophy, image: '/bg.jpg',
    id: 'gold',
    cost: 0,
    contentRoute: ''
  },
  {
    level: 9, title: 'Mythic PET', reward: '3.3%', energyRequired: '10000', perks: ['Max Yield', 'Revenue Sharing', 'Game Designer Roles'], icon: CircleDollarSign, image: '/bg.jpg',
    id: 'gold',
    cost: 0,
    contentRoute: ''
  }
];

const fadeLeft: Variants = { hidden: { opacity: 0, x: -50 }, visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: 'easeOut' } } };
const infiniteScroll: Variants = { animate: { x: ['0%', '-50%'], transition: { x: { repeat: Infinity, repeatType: 'loop', duration: 20, ease: 'linear' } } } };


// Use ImportedMembershipLevelsProps as the type for the FC
const MembershipLevels: React.FC<ImportedMembershipLevelsProps> = () => { // No props destructured from FC
  const extendedLevels = [...levels, ...levels];

  return (
    <motion.div variants={fadeLeft}>
      <h3 className="text-3xl font-bold text-white flex items-center justify-center gap-3 font-poppins">
        <Trophy className="w-8 h-8 text-cyan-400 animate-pulse" /> {/* FIX: Changed text-neon-green to text-cyan-400 */}
        Membership Levels
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
              key={`${level.level}-${index}`} // Using level.level and index for key
              className="min-w-[250px] bg-gray-900/50 p-6 rounded-lg border border-cyan-400/20 hover:shadow-cyan-400/30 transition-all backdrop-blur-md" // FIX: Changed neon-green to cyan-400
              whileHover={{ scale: 1.05 }} // FIX: Simplified boxShadow
            >
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900/80 rounded-lg" /> {/* FIX: Changed dark-gray to gray-900 */}
              <div className="relative">
                <div className="flex items-center gap-2 mb-4">
                  {/* Dynamically render icon component */}
                  {level.icon && <level.icon className="w-6 h-6 text-cyan-400" />} {/* FIX: Icon color to cyan-400 */}
                  <h4 className="text-xl font-bold text-white font-poppins">{level.title}</h4>
                </div>
                <p className="text-cyan-400 font-semibold font-poppins">{level.reward} Monthly Yield</p> {/* FIX: Icon color to cyan-400 */}
                <p className="text-gray-400 text-sm font-inter">{level.energyRequired} Required</p>
                <ul className="mt-4 space-y-2 text-gray-300 text-sm font-inter">
                  {level.perks.map((perk, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-cyan-400" /> {/* FIX: Icon color to cyan-400 */} {perk}
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