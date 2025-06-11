import { motion } from 'framer-motion';

import { Flame, Landmark, Users, Globe2, Rocket, HeartHandshake, Lock, BookOpenCheck, Trophy, Compass } from 'lucide-react';
import ecosystemImg from '@/assets/swytch/bg (108).jpg';
import trustImg from '@/assets/swytch/bg (108).jpg';
import flowImg from '@/assets/swytch/bg (108).jpg';

const Ecosystem = () => {
  const variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  const sections = [
    {
      icon: Landmark,
      title: 'Private Energy Trust',
      description:
        'This is the core of the Swytch architecture. A sovereign vault backed by PMA legal structure where energy becomes a measurable asset. You own your rewards. No centralized custody. 100% opt-in freedom.',
      image: trustImg,
    },
    {
      icon: Users,
      title: 'PET Membership',
      description:
        'You dont join a platform — you join a movement. PETs (People of Energy & Truth) are contributors, not consumers. Earn your way. Vote. Propose. Grow. PET identity is sacred: lore-bound, sovereign, and evolving.',
    },
    {
      icon: Rocket,
      title: 'Multiplayer Energy Economy',
      description:
        'Everything in Swytch is multiplayer. Earnings are social. You can stake, lend, transfer, or co-create Energy. Build factions. Launch missions. Trigger trust-based micro-economies.',
    },
    {
      icon: HeartHandshake,
      title: 'Ethical Tokenomics',
      description:
        'Swytch doesn’t inflate or speculate. JEWELS and FDMT are anchored in proof-of-purpose. The value loop is closed: Earn → Learn → Withdraw → Re-enter. All tracked. All fair.',
    },
    {
      icon: BookOpenCheck,
      title: 'Knowledge as Currency',
      description:
        'Raziel, our AI Archive Guardian, unlocks monthly quests. Read articles. Take consciousness tests. Explore legal sovereignty. Get rewarded in JEWELS just for evolving.',
    },
    {
      icon: Lock,
      title: 'Jurisdiction-Free Privacy',
      description:
        'No KYC. No third-party surveillance. Swytch runs on zero-knowledge trust. You never give up rights — you reclaim them.',
    },
    {
      icon: Flame,
      title: 'Gamified Onboarding Protocol',
      description:
        'Join not by signup — but by transformation. NPCs initiate you into the PETverse. Missions test your values. Your name? It’s lore-encrypted, fate-bound, and power-linked.',
    },
    {
      icon: Trophy,
      title: 'Energy Rewards Protocol',
      description:
        'Every JEWEL in your vault works for you. Monthly, your balance grows — up to 3.3% — just for being part of the ecosystem. Loyalty isn’t tracked. It’s felt.',
    },
    {
      icon: Compass,
      title: 'Infinite Expandability',
      description:
        'The Swytch ecosystem is built modular. New planets, new lore, new financial plugins, NFTs, lending, health data, spiritual tools — all opt-in. It’s not just Web3. It’s WebWe.',
    },
    {
      icon: Globe2,
      title: 'Sovereign Network Layer',
      description:
        'Swytch is not an app. It’s a parallel digital society, operating over any chain, protocol, or platform. Think less “dashboard” — more “digital homeland.”',
    },
  ];

  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black to-gray-900 text-center">
      <motion.div
        className="max-w-6xl mx-auto relative z-10"
        variants={variants}
        initial="hidden"
        animate="visible"
      >
        <h2 className="text-5xl font-extrabold text-cyan-400 mb-8 tracking-tight">
          The Swytch Ecosystem
        </h2>
        <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto">
          Swytch isn’t a product — it’s a protocol for freedom. We’re not just unlocking new ways to play, but new ways to live. Every layer is intentional. Every click is coded in truth.
        </p>

        <img
          src={ecosystemImg}
          alt="Swytch Ecosystem Map"
          className="w-full rounded-xl border border-cyan-500/20 shadow-xl mb-16"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 text-left">
          {sections.map(({ icon: Icon, title, description, image }, index) => (
            <motion.div
              key={index}
              className="bg-gray-900/50 border border-cyan-500/20 rounded-2xl p-6 backdrop-blur-md"
              variants={variants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.1 * index }}
            >
              <div className="flex items-center mb-4 text-cyan-400">
                <Icon className="mr-3" />
                <h3 className="text-xl font-bold">{title}</h3>
              </div>
              <p className="text-gray-300 mb-2">{description}</p>
              {image && (
                <img src={image} alt={title} className="mt-4 rounded-xl border border-cyan-500/10" />
              )}
            </motion.div>
          ))}
        </div>

        <img
          src={flowImg}
          alt="Swytch Flow"
          className="w-full rounded-xl border border-cyan-500/20 shadow-xl mt-20"
        />

        <p className="mt-10 text-gray-400 italic text-sm">
          Note: Swytch is a living ecosystem. All values are derived from your actions, not your status. Once you Swytch — you don’t return. You evolve.
        </p>
      </motion.div>
    </section>
  );
};

export default Ecosystem;