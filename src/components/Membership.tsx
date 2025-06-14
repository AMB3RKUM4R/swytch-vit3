import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Wallet, Key, Users, Scale, Sparkles, Rocket, Trophy,
  BookOpen, Globe, Lock, Star, CircleDollarSign, TrendingUp,
  ScrollText, ShieldCheck, Brain, BarChart2, Flashlight, Gavel,
  Heart
} from 'lucide-react';
import { useState } from 'react';

// Levels data (reused from previous component)
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
    image: '/bg (28).jpg'
  },
  {
    level: 3,
    title: 'Seeker',
    reward: '1.6%',
    energyRequired: '500 SWYT',
    perks: ['Quest Expansion', 'PET ID Perks'],
    icon: <ScrollText className="w-6 h-6 text-amber-400" />,
    image: '/bg (22).jpg'
  },
  {
    level: 4,
    title: 'Guardian',
    reward: '1.9%',
    energyRequired: '1000 SWYT',
    perks: ['Vault Yield Boost', 'Private Vault Channels'],
    icon: <ShieldCheck className="w-6 h-6 text-orange-400" />,
    image: '/bg (6).jpg'
  },
  {
    level: 5,
    title: 'Sage',
    reward: '2.2%',
    energyRequired: '3000 SWYT',
    perks: ['Beta Testing Rights', 'Voting Access'],
    icon: <Brain className="w-6 h-6 text-pink-400" />,
    image: '/bg (8).jpg'
  },
  {
    level: 6,
    title: 'Archon',
    reward: '2.5%',
    energyRequired: '5000 SWYT',
    perks: ['Early Launch Drops', 'DAO Incentives'],
    icon: <BarChart2 className="w-6 h-6 text-yellow-400" />,
    image: '/bg (9).jpg'
  },
  {
    level: 7,
    title: 'Alchemist',
    reward: '2.8%',
    energyRequired: '7500 SWYT',
    perks: ['Smart Contract Access', 'NFT Mint Tools'],
    icon: <Flashlight className="w-6 h-6 text-violet-400" />,
    image: '/bg (10).jpg'
  },
  {
    level: 8,
    title: 'Elder',
    reward: '3.1%',
    energyRequired: '9000 SWYT',
    perks: ['Legend Quests', 'Energy Bonus Boost'],
    icon: <Trophy className="w-6 h-6 text-lime-400" />,
    image: '/bg (12).jpg'
  },
  {
    level: 9,
    title: 'Mythic PET',
    reward: '3.3%',
    energyRequired: '10000 SWYT',
    perks: ['Max Yield', 'Revenue Sharing', 'Game Designer Roles'],
    icon: <CircleDollarSign className="w-6 h-6 text-teal-400" />,
    image: '/bg (11).jpg'
  }
];

// Animation variants
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};

const fadeLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: 'easeOut' } }
};

const fadeRight = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: 'easeOut' } }
};

const scaleUp = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: 'easeOut' } }
};

// Infinite scroll animation for levels
const infiniteScroll = {
  animate: {
    x: ['0%', '-100%'],
    transition: {
      x: { repeat: Infinity, repeatType: 'loop', duration: 20, ease: 'linear' }
    }
  }
};

const SwytchMembership = () => {
  const [showModal, setShowModal] = useState(false);

  // Duplicate levels for infinite scroll effect
  const extendedLevels = [...levels, ...levels];

  return (
    <section className="relative py-32 px-6 lg:px-24 bg-gradient-to-br from-gray-950 via-indigo-950 to-black text-gray-100 overflow-hidden">
      
        {/* Section 1: Income Beneficiaries Control */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="flex flex-col lg:flex-row items-center gap-12"
        >
          <div className="lg:w-1/2 space-y-6">
            <h2 className="text-4xl lg:text-5xl font-extrabold text-white flex items-center gap-4">
              <Shield className="text-cyan-400 w-12 h-12 animate-pulse" /> Your Control, Your Freedom
            </h2>
            <p className="text-lg text-gray-300 leading-relaxed">
              Income beneficiaries of the Swytch Private Energy Trust retain full control over their game rewards, assets, and personal data. Swytch has no control or guarantee over third-party self-custodial wallets used to interact with the ecosystem.
            </p>
            <ul className="list-none space-y-4 text-lg text-gray-300">
              <li className="flex items-start gap-3"><Wallet className="text-teal-400 w-6 h-6" /> Use your self-custodial wallet for full autonomy.</li>
              <li className="flex items-start gap-3"><Lock className="text-red-400 w-6 h-6" /> Swytch does not access or manage your wallet.</li>
            </ul>
          </div>
          <motion.div variants={scaleUp} className="lg:w-1/2">
            <div className="bg-gray-800/50 p-8 rounded-2xl shadow-2xl border-2 border-cyan-500/30 hover:scale-105 transition-transform duration-300">
              <p className="text-lg text-gray-200 italic">Your assets, your data, your power—Swytch empowers you.</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Section 2: Private Membership Association */}
        <motion.div
          variants={fadeRight}
          initial="hidden"
          animate="visible"
          className="relative bg-gray-900/30 p-10 rounded-2xl shadow-xl"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl" />
          <div className="relative space-y-8 text-center">
            <h2 className="text-4xl lg:text-5xl font-extrabold text-white flex items-center justify-center gap-4">
              <Users className="text-purple-400 w-12 h-12" /> What is a PMA?
            </h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
              A Private Membership Association (PMA) protects members from state and federal interference, secured by the U.S. Constitution and the Universal Declaration of Human Rights. The Swytch PMA empowers individuals to assert their rights to assemble, control their health, and share information freely.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <motion.div variants={fadeUp} className="bg-gray-800/50 p-6 rounded-lg hover:bg-gray-800/70 transition">
                <Scale className="text-teal-400 w-8 h-8 mx-auto mb-4" />
                <p className="text-lg text-gray-200">Contracts are entered freely, protected by law.</p>
              </motion.div>
              <motion.div variants={fadeUp} className="bg-gray-800/50 p-6 rounded-lg hover:bg-gray-800/70 transition">
                <Heart className="text-pink-400 w-8 h-8 mx-auto mb-4" />
                <p className="text-lg text-gray-200">Members share knowledge and experiences privately.</p>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Section 3: How PMA Works */}
        <motion.div
          variants={fadeLeft}
          initial="hidden"
          animate="visible"
          className="flex flex-col lg:flex-row-reverse items-center gap-12"
        >
          <div className="lg:w-1/2 space-y-6">
            <h2 className="text-4xl lg:text-5xl font-extrabold text-white flex items-center gap-4">
              <Key className="text-yellow-400 w-12 h-12 animate-pulse" /> How the Swytch PMA Works
            </h2>
            <p className="text-lg text-gray-300 leading-relaxed">
              The Swytch Private Energy Trust operates as a Private Ministerial Association (PMA), accessible only to members who pay a $50 lifetime membership fee. Members embrace financial empowerment, self-accountability, and private arbitration for disputes.
            </p>
            <ul className="list-none space-y-4 text-lg text-gray-300">
              <li className="flex items-start gap-3"><Rocket className="text-cyan-400 w-6 h-6" /> $50 unlocks the ecosphere and its benefits.</li>
              <li className="flex items-start gap-3"><Gavel className="text-red-400 w-6 h-6" /> Disputes are resolved through private arbitration.</li>
              <li className="flex items-start gap-3"><Users className="text-green-400 w-6 h-6" /> Members give up public rights for private freedom.</li>
            </ul>
            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setShowModal(true)}
                className="px-6 py-3 rounded-full bg-cyan-600 text-white hover:bg-cyan-700 transition-all"
              >
                Accept
              </button>
              <button
                className="px-6 py-3 rounded-full bg-red-600 text-white hover:bg-red-700 transition-all"
              >
                Decline
              </button>
            </div>
          </div>
          <motion.div variants={scaleUp} className="lg:w-1/2">
            <div className="bg-gray-800/50 p-8 rounded-2xl shadow-2xl border-2 border-yellow-500/30 hover:scale-105 transition-transform duration-300">
              <p className="text-lg text-gray-200 italic">Join the PMA to unlock a private financial ecosphere.</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Section 4: Levels & Rewards (Infinite Scroll) */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="space-y-10"
        >
          <h2 className="text-4xl lg:text-5xl font-extrabold text-white flex items-center justify-center gap-4">
            <CircleDollarSign className="text-teal-400 w-12 h-12 animate-pulse" /> Levels & Rewards
          </h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto text-center leading-relaxed">
            Swytch is open to all, from crypto novices to seasoned experts. Each level lets you deposit more JEWELS energy into your PET, earning up to 3.3% monthly yield, plus up to 0.3% extra through education in the Raziel tab.
          </p>
          <div className="relative overflow-hidden">
            <motion.div
              className="flex gap-6"
              variants={infiniteScroll}
              animate="animate"
            >
              {extendedLevels.map((tier, i) => (
                <motion.div
                  key={`${tier.level}-${i}`}
                  className="bg-gray-900/60 border border-teal-500/20 rounded-xl p-6 backdrop-blur-md min-w-[300px] hover:scale-[1.02] transition-all"
                  whileHover={{ y: -10 }}
                >
                  <img src={tier.image} alt={tier.title} className="w-16 h-16 mb-4 rounded-lg border border-teal-500/20" />
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-teal-500/10 rounded-full">{tier.icon}</div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Level {tier.level}: {tier.title}</h3>
                      <p className="text-sm text-teal-300">+{tier.reward} Monthly Yield</p>
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
            </motion.div>
          </div>
          <button className="mt-6 px-6 py-3 rounded-full bg-teal-600 text-white hover:bg-teal-700 transition-all mx-auto block">
            Deposit Energy
          </button>
        </motion.div>

        {/* Section 5: Know Your Freedom */}
        <motion.div
          variants={fadeRight}
          initial="hidden"
          animate="visible"
          className="relative bg-gray-900/30 p-10 rounded-2xl shadow-xl"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-2xl" />
          <div className="relative space-y-8">
            <h2 className="text-4xl lg:text-5xl font-extrabold text-white flex items-center gap-4">
              <BookOpen className="text-blue-400 w-12 h-12" /> Know Your Freedom
            </h2>
            <p className="text-lg text-gray-300 leading-relaxed">
              The “Know Your Freedom” section in the Raziel tab educates you on your rights under the Universal Declaration of Human Rights, empowering you to live freely and confidently.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { article: 1, text: 'All human beings are born free and equal in dignity and rights.' },
                { article: 17, text: 'Everyone has the right to own property alone or with others.' },
                { article: 19, text: 'Everyone has the right to freedom of opinion and expression.' },
                { article: 20, text: 'Everyone has the right to freedom of peaceful assembly and association.' }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className="bg-gray-800/50 p-6 rounded-lg hover:bg-gray-800/70 transition"
                >
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Star className="text-cyan-400 w-6 h-6" /> Article {item.article}
                  </h3>
                  <p className="text-gray-300">{item.text}</p>
                </motion.div>
              ))}
            </div>
            <p className="text-lg text-gray-300 italic">Earn up to 0.3% extra yield by exploring the full declaration.</p>
          </div>
        </motion.div>

        {/* Section 6: What is JEWELS Energy? */}
        <motion.div
          variants={fadeLeft}
          initial="hidden"
          animate="visible"
          className="flex flex-col lg:flex-row items-center gap-12"
        >
          <div className="lg:w-1/2 space-y-6">
            <h2 className="text-4xl lg:text-5xl font-extrabold text-white flex items-center gap-4">
              <Sparkles className="text-yellow-400 w-12 h-12 animate-pulse" /> What is JEWELS Energy?
            </h2>
            <p className="text-lg text-gray-300 leading-relaxed">
              JEWELS (J) is a unit of energy in the Swytch ecosystem, representing mechanical, electrical, or thermal energy. Humans are not energy but require it to function, converting food into movement, nerve impulses, and heat.
            </p>
            <ul className="list-none space-y-4 text-lg text-gray-300">
              <li className="flex items-start gap-3"><Rocket className="text-teal-400 w-6 h-6" /> JEWELS powers your financial and personal growth.</li>
              <li className="flex items-start gap-3"><Heart className="text-pink-400 w-6 h-6" /> Your body transforms energy to thrive—JEWELS does the same for wealth.</li>
            </ul>
          </div>
          <motion.div variants={scaleUp} className="lg:w-1/2">
            <div className="bg-gray-800/50 p-8 rounded-2xl shadow-2xl border-2 border-yellow-500/30 hover:scale-105 transition-transform duration-300">
              <p className="text-lg text-gray-200 italic">JEWELS: The energy of your financial freedom.</p>
            </div>
          
        </motion.div>

        {/* Section 7: Rewards in PET */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="space-y-10 text-center"
        >
          <h2 className="text-4xl lg:text-5xl font-extrabold text-white flex items-center justify-center gap-4">
              <Trophy className="text-orange-400 w-12 h-12" /> How Beneficiaries Get Rewarded
            </h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Beneficiaries of the Swytch Private Energy Trust receive regular distributions based on the trust’s income-generating assets, such as rental properties or dividend-paying stocks, or capital appreciation from asset sales.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <motion.div variants={fadeUp} className="bg-gray-800/50 p-6 rounded-lg hover:bg-gray-800/70 transition">
                <CircleDollarSign className="text-teal-400 w-8 h-8 mx-auto mb-4" />
                <p className="text-lg text-gray-200">Monthly or quarterly income distributions.</p>
              </motion.div>
              <motion.div variants={fadeUp} className="bg-gray-800/50 p-6 rounded-lg hover:bg-gray-800/70 transition">
                <BarChart2 className="text-orange-400 w-8 h-8 mx-auto mb-4" />
                <p className="text-lg text-gray-200">Profits from asset sales or appreciation.</p>
              </motion.div>
            </div>
            <p className="text-lg text-gray-300 italic">Review the trust agreement for your specific rewards.</p>
            <button className="mt-6 px-6 py-3 rounded-full bg-orange-600 text-white hover:bg-orange-700 transition-all">
              Deposit Energy
            </button>
          </motion.div>

          {/* Section 8: Benefits of Decentralization */}
          <motion.div
            variants={fadeRight}
            initial="hidden"
            animate="visible"
            className="relative bg-gray-900/30 p-10 rounded-2xl shadow-xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-teal-500/10 rounded-2xl" />
            <div className="relative space-y-8">
              <h2 className="text-4xl lg:text-5xl font-extrabold text-white flex items-center gap-4">
                <Globe className="text-green-400 w-12 h-12 animate-pulse" /> Benefits of Decentralization
              </h2>
              <p className="text-lg text-gray-300 leading-relaxed">
                Swytch’s decentralized platform offers unmatched security, privacy, and community ownership, making it a revolutionary financial ecosphere for all.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div variants={fadeUp} className="bg-gray-800/50 p-6 rounded-lg hover:bg-gray-800/70 transition">
                  <ShieldCheck className="text-green-400 w-8 h-8 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-white">Increased Security</h3>
                  <p className="text-gray-300">Distributed nodes prevent single-point failures.</p>
                </motion.div>
                <motion.div variants={fadeUp} className="bg-gray-800/50 p-6 rounded-lg hover:bg-gray-800/70 transition">
                  <Lock className="text-teal-400 w-8 h-8 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-white">Privacy</h3>
                  <p className="text-gray-300">Control your data with anonymity options.</p>
                </motion.div>
                <motion.div variants={fadeUp} className="bg-gray-800/50 p-6 rounded-lg hover:bg-gray-800/70 transition">
                  <Users className="text-cyan-400 w-8 h-8 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-white">Community Ownership</h3>
                  <p className="text-gray-300">Shape the platform with your voice.</p>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Modal for Accept/Decline */}
          <AnimatePresence>
            {showModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
              >
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.8 }}
                  className="bg-gray-900 p-8 rounded-2xl max-w-md w-full"
                >
                  <h3 className="text-2xl font-bold text-white mb-4">Join the Swytch PMA</h3>
                  <p className="text-gray-300 mb-6">By accepting, you agree to the terms of the Private Membership Association and embrace private financial freedom.</p>
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={() => setShowModal(false)}
                      className="px-6 py-3 rounded-full bg-cyan-600 text-white hover:bg-cyan-700 transition-all"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => setShowModal(false)}
                      className="px-6 py-3 rounded-full bg-red-600 text-white hover:bg-red-700 transition-all"
                    >
                      Decline
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </section>
    );
};

export default SwytchMembership;