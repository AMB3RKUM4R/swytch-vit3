
import { motion } from 'framer-motion';
import React, { useState } from 'react';
import { X, Rocket, KeyRound, Terminal, ShieldCheck, Coins, Flame, Workflow, BadgeCheck, Eye, BarChart3, HelpCircle, UserCheck } from 'lucide-react';
import visionImg from '@/assets/swytch/bg1.jpg';
import onboardingImg from '@/assets/swytch/bg (74).jpg';
import vaultImg from '@/assets/swytch/bg (117).jpg';
import rebellionImg from '@/assets/swytch/bg (58).jpg';
import agentImg from '@/assets/swytch/bg (66).jpg';
import chartImg from '@/assets/swytch/bg (88).jpg';
import diagramImg from '@/assets/swytch/bg (62).jpg';

const ecosystemSections = [
  {
    title: "Your Vision: More Than a Game",
    description: "Swytch transforms gaming into education, empowerment, and economics. You’re making crypto meaningful through gameplay, story, and purpose-driven loops.",
    icon: <Rocket className="text-cyan-400 w-6 h-6" />,
    image: visionImg,
    modal: `Gaming is no longer a pastime. It’s a gateway to decentralized wealth. Players become income beneficiaries — not customers. The vaults you earn open to identity, legacy, and rewards rooted in real crypto economics. This is Swytch.`
  },
  {
    title: "Reinventing Onboarding",
    description: "Onboarding isn’t a screen — it’s an awakening. PETs don’t create accounts, they unlock identities, narratives, and multi-chain access to value.",
    icon: <KeyRound className="text-yellow-400 w-6 h-6" />,
    image: onboardingImg,
    modal: `Your name becomes your legacy. Onboarding at Swytch connects players to real-world principles and private trust benefits. The PMA foundation secures rights under the U.S. Constitution and UDHR.`
  },
  {
    title: "Narrative-Led Identity Creation",
    description: "Character isn’t cosmetic — it’s fate. Identity on Swytch is soul-bound, story-driven, and upgrades as you engage with quests, education, and trust.",
    icon: <Terminal className="text-pink-400 w-6 h-6" />,
    image: agentImg,
    modal: `Each decision rewrites your character’s arc. As a PET, you can access roles like Oracle, Rebel, Alchemist — unlocking exclusive perks, NFTs, and even governance influence.`
  },
  {
    title: "The PET Omertà",
    description: "Swytch is governed by a code of trust, not contracts. This self-sovereign trust system gives income beneficiaries absolute control.",
    icon: <ShieldCheck className="text-green-400 w-6 h-6" />,
    image: chartImg,
    modal: `You're operating outside of public jurisdiction. The PET Omertà means private arbitration, PMA rights, and a bond beyond code — a living protocol for freedom.`
  },
  {
    title: "Crypto Without Saying ‘Crypto’",
    description: "Gold, chests, keys = value. Swytch hides the complex terms behind intuitive metaphors to onboard billions.",
    icon: <Coins className="text-orange-400 w-6 h-6" />,
    image: vaultImg,
    modal: `No confusing tokenomics. Instead: treasure chests, bonus spells, vault upgrades. Players build wealth via gameplay while remaining fully in control of their crypto wallets.`
  },
  {
    title: "A New Standard: The Swytch Protocol",
    description: "You’re not offering a product — you’re inviting them into a new dimension of ownership, identity, and evolution.",
    icon: <Flame className="text-red-400 w-6 h-6" />,
    image: rebellionImg,
    modal: `Swytch is the first PMA-backed, education-powered, crypto-native private trust. The Swytch Protocol harmonizes law, rights, yield, and game theory.`
  },
  {
    title: "How It All Connects",
    description: "Experience the Swytch lifecycle from game to vault, token to PET identity.",
    icon: <Workflow className="text-blue-400 w-6 h-6" />,
    image: diagramImg,
    modal: `Earn JEWELS, convert into SWYT, stake into your level, access vaults, collect yield — repeat. It’s a DAO-powered decentralized income engine.`
  },
  {
    title: "Vault Access",
    description: "$10 unlocks your Swytch Wallet. Get your PET ID and first mission.",
    icon: <BadgeCheck className="text-purple-400 w-6 h-6" />,
    image: vaultImg,
    modal: `You become a verified PET. This opens permanent access to vaults, quests, NFTs, and education portals — while retaining full custody of your keys.`
  },
  {
    title: "Support Spells",
    description: "Ads are optional — and magical. Support Spells reward attention with tokens and PET yield boosts.",
    icon: <Eye className="text-teal-400 w-6 h-6" />,
    image: visionImg,
    modal: `Instead of interruption, ads appear as opt-in spells — turning time into token. These can boost your earnings or be traded with others.`
  },
  {
    title: "Ecosystem Metrics & Growth",
    description: "Visualize the expansion of Swytch. From adoption to APY to DAO votes.",
    icon: <BarChart3 className="text-lime-400 w-6 h-6" />,
    image: chartImg,
    modal: `All data is on-chain and visible to members. From energy flow to game quests, analytics are presented as narrative progress.`
  },
  {
    title: "FAQ & Truth Panel",
    description: "Got questions? The Truth Panel is where AI, humans, and DAO knowledge converge.",
    icon: <HelpCircle className="text-gray-300 w-6 h-6" />,
    image: chartImg,
    modal: `Our decentralized AI NPC will answer based on constitution, trust law, and protocol rules. Ask anything. PETs always speak truth.`
  },
  {
    title: "Sentinel Evolution",
    description: "Choose your role: Oracle, Rebel, Architect, Guardian. Shape your evolution.",
    icon: <UserCheck className="text-cyan-300 w-6 h-6" />,
    image: onboardingImg,
    modal: `Each class aligns with your behavior and upgrades your rewards. Your vault perks, yields, and roles evolve with your character.`
  }
];

const EcosystemIntro = () => {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black to-gray-900 overflow-hidden min-h-screen">
       
      <div className="relative z-10 max-w-7xl mx-auto space-y-24">
        <h2 className="text-4xl sm:text-5xl space-y-24 text-center font-extrabold text-cyan-400 mb-4">
          Swytch Education Stack
        </h2>
        {ecosystemSections.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: index * 0.1 }}
            className="grid lg:grid-cols-2 gap-10 items-center"
          >
            <div className="space-y-4 text-left">
              <div className="flex items-center gap-3 text-cyan-400">{item.icon}<span className="text-lg font-semibold text-white">{item.title}</span></div>
              <p className="text-gray-300 text-lg">{item.description}</p>
              <button onClick={() => setActiveModal(item.title)} className="text-cyan-400 hover:text-cyan-300 mt-4 underline text-sm">Learn More</button>
            </div>
            <img src={item.image} alt={item.title} className="rounded-xl shadow-lg w-full max-h-[300px] object-cover" />
          </motion.div>
        ))}

        {activeModal && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center px-4 py-12">
            <div className="bg-gray-900 p-6 rounded-xl shadow-xl w-full max-w-2xl relative">
              <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 text-cyan-400 hover:text-red-400">
                <X className="w-6 h-6" />
              </button>
              <h3 className="text-2xl font-bold text-cyan-400 mb-4">{activeModal}</h3>
              <p className="text-gray-300 text-base leading-relaxed whitespace-pre-line">
                {ecosystemSections.find((d) => d.title === activeModal)?.modal}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default EcosystemIntro;
