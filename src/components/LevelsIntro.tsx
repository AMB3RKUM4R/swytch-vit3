import { motion } from 'framer-motion';
import {
  TrendingUp, Star, ShieldCheck, Brain, BarChart2, Sparkles, Gift, BookOpen, ScrollText,
  Trophy, Users, Flashlight, Layers3, Settings2, CircleDollarSign
} from 'lucide-react';

const levels = [
  {
    level: 1,
    title: 'Initiate',
    reward: '1.0%',
    energyRequired: '100 SWYT',
    perks: ['Basic Vault Access', 'Library Quests', 'NFT View Mode'],
    icon: <TrendingUp className="w-6 h-6 text-cyan-400" />,
    image: '/bg (29).jpg'
  },
  {
    level: 2,
    title: 'Apprentice',
    reward: '1.3%',
    energyRequired: '250 SWYT',
    perks: ['Chatbot Assistant', 'NFT Discounts'],
    icon: <Star className="w-6 h-6 text-purple-400" />,
    image: 'bg (28).jpg'
  },
  {
    level: 3,
    title: 'Seeker',
    reward: '1.6%',
    energyRequired: '500 SWYT',
    perks: ['Quest Expansion', 'PET ID Perks'],
    icon: <ScrollText className="w-6 h-6 text-amber-400" />,
    image: 'bg (22).jpg'
  },
  {
    level: 4,
    title: 'Guardian',
    reward: '1.9%',
    energyRequired: '1000 SWYT',
    perks: ['Vault Yield Boost', 'Private Vault Channels'],
    icon: <ShieldCheck className="w-6 h-6 text-orange-400" />,
    image: 'bg (6).jpg'
  },
  {
    level: 5,
    title: 'Sage',
    reward: '2.2%',
    energyRequired: '3000 SWYT',
    perks: ['Beta Testing Rights', 'Voting Access'],
    icon: <Brain className="w-6 h-6 text-pink-400" />,
    image: 'bg (8).jpg'
  },
  {
    level: 6,
    title: 'Archon',
    reward: '2.5%',
    energyRequired: '5000 SWYT',
    perks: ['Early Launch Drops', 'DAO Incentives'],
    icon: <BarChart2 className="w-6 h-6 text-yellow-400" />,
    image: 'bg (9).jpg'
  },
  {
    level: 7,
    title: 'Alchemist',
    reward: '2.8%',
    energyRequired: '7500 SWYT',
    perks: ['Smart Contract Access', 'NFT Mint Tools'],
    icon: <Flashlight className="w-6 h-6 text-violet-400" />,
    image: 'bg (10).jpg'
  },
  {
    level: 8,
    title: 'Elder',
    reward: '3.1%',
    energyRequired: '9000 SWYT',
    perks: ['Legend Quests', 'Energy Bonus Boost'],
    icon: <Trophy className="w-6 h-6 text-lime-400" />,
    image: 'bg (12).jpg'
  },
  {
    level: 9,
    title: 'Mythic PET',
    reward: '3.3%',
    energyRequired: '10000 SWYT',
    perks: ['Max Yield', 'Revenue Sharing', 'Game Designer Roles'],
    icon: <CircleDollarSign className="w-6 h-6 text-teal-400" />,
    image: 'bg (11).jpg'
  }
];

const LevelsIntro = () => {
  const variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black to-gray-900 text-center overflow-hidden">
      <motion.div
        className="max-w-6xl mx-auto"
        variants={variants}
        initial="hidden"
        animate="visible"
      >
        <h2 className="text-5xl font-extrabold text-cyan-400 mb-6">Swytch Levels & Yield Tiers</h2>
        <p className="text-lg text-gray-300 max-w-3xl mx-auto mb-6">
          Level up to unlock a smarter financial dimension. Each tier increases your autonomy, yield, access, and trust benefits.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10 text-left">
          {levels.map((tier, i) => (
            <motion.div
              key={tier.level}
              className="bg-gray-900/60 border border-cyan-500/20 rounded-xl p-6 backdrop-blur-md hover:scale-[1.02] transition-all"
              variants={variants}
              initial="hidden"
              animate="visible"
              transition={{ delay: i * 0.1 }}
            >
              <img src={tier.image} alt={tier.title} className="w-16 h-16 mb-4 rounded-lg border border-cyan-500/20" />
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-cyan-500/10 rounded-full">
                  {tier.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Level {tier.level}: {tier.title}</h3>
                  <p className="text-sm text-cyan-300">+{tier.reward} Monthly Yield</p>
                </div>
              </div>
              <p className="text-gray-300 mb-2">Required: <span className="text-white font-semibold">{tier.energyRequired}</span></p>
              <ul className="list-disc list-inside text-gray-400 space-y-1">
                {tier.perks.map((perk, j) => (
                  <li key={j}>{perk}</li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <div className="mt-20 text-cyan-300 text-sm italic max-w-2xl mx-auto">
          🧠 Your rank updates monthly through staking, learning, and gameplay. The more energy you emit, the faster you evolve.
        </div>

        <div className="mt-16 max-w-3xl mx-auto text-left text-gray-300 text-sm space-y-4">
          <p><Sparkles className="inline w-4 h-4 text-cyan-400 mr-2" /> Advanced levels offer DAO rights, in-game design access, and real-world energy conversion tools.</p>
          <p><BookOpen className="inline w-4 h-4 text-cyan-400 mr-2" /> Wisdom Energy boosts your level acceleration and unlocks exclusive PET-only lore missions.</p>
          <p><Gift className="inline w-4 h-4 text-cyan-400 mr-2" /> Engage with NFTs, events, or friends to trigger yield multipliers and retroactive rewards.</p>
        </div>

        <div className="mt-24 text-center border-t border-cyan-500/20 pt-10">
          <h3 className="text-3xl text-white font-bold mb-4">New to Swytch?</h3>
          <p className="text-gray-400 mb-4">Start with just $50 to unlock PET identity, Vault #1, and your first yield quest.</p>
          <button className="px-6 py-3 rounded-full bg-cyan-600 text-white hover:bg-cyan-700 transition-all">
            Join Swytch & Begin Earning
          </button>
        </div>
      </motion.div>
    </section>
  );
};

export default LevelsIntro;
