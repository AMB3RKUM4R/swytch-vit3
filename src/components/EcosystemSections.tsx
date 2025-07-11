import { motion } from 'framer-motion';
import { Rocket, KeyRound, Terminal, ShieldCheck, Coins, Flame, Workflow, BadgeCheck, Eye, BarChart3, HelpCircle, UserCheck, Zap } from 'lucide-react';
import { useModal } from '@/context/ModalContext';
import { EcosystemSection, EcosystemSectionsProps } from '@/lib/types';

const ecosystemSections: EcosystemSection[] = [
  {
    title: 'Your Vision: More Than a Game',
    description: 'Swytch redefines gaming as a portal to education, empowerment, and decentralized wealth.',
    icon: <Rocket className="text-rose-400 w-6 h-6 animate-pulse" />,
    image: '/bg.jpg',
    modal: 'Gaming transcends entertainment. Swytch turns players into income beneficiaries with crypto-backed rewards.'
  },
  {
    title: 'Reinventing Onboarding',
    description: 'Onboarding forges PET identities and multi-chain access, seamlessly entering the Swytch ecosystem.',
    icon: <KeyRound className="text-rose-400 w-6 h-6 animate-pulse" />,
    image: '/bg.jpg',
    modal: 'Your PET identity secures rights under PMA principles, connecting you to decentralized value.'
  },
  {
    title: 'Narrative-Led Identity Creation',
    description: 'Your PET evolves through quests, education, and trust-building, shaping your destiny.',
    icon: <Terminal className="text-rose-400 w-6 h-6 animate-pulse" />,
    image: '/bg.jpg',
    modal: 'Become an Oracle, Rebel, or Alchemist, unlocking NFTs, perks, and governance power.'
  },
  {
    title: 'The PET Omertà',
    description: 'Swytch’s code of trust ensures PETs control their vaults and rewards.',
    icon: <ShieldCheck className="text-rose-400 w-6 h-6 animate-pulse" />,
    image: '/bg.jpg',
    modal: 'The PET Omertà offers private arbitration and PMA-backed rights for decentralized freedom.'
  },
  {
    title: 'Crypto Without Saying ‘Crypto’',
    description: 'Gold, chests, keys = wealth. Swytch simplifies crypto with intuitive metaphors.',
    icon: <Coins className="text-rose-400 w-6 h-6 animate-pulse" />,
    image: '/bg.jpg',
    modal: 'Treasure chests let players build wealth effortlessly, with full wallet control.'
  },
  {
    title: 'A New Standard: The Swytch Protocol',
    description: 'Swytch invites you to a new dimension of ownership and evolution.',
    icon: <Flame className="text-rose-400 w-6 h-6 animate-pulse" />,
    image: '/bg.jpg',
    modal: 'The Swytch Protocol blends law, rights, yield, and game theory for a revolutionary ecosystem.'
  },
  {
    title: 'How It All Connects',
    description: 'Navigate the Swytch lifecycle: gameplay, vaults, tokens, and AI orchestration.',
    icon: <Workflow className="text-rose-400 w-6 h-6 animate-pulse" />,
    image: '/bg.jpg',
    modal: 'Earn JEWELS, convert to SWYT, stake for levels, access vaults—powered by DAO.'
  },
  {
    title: 'Vault Access',
    description: '$10 unlocks your Swytch Wallet, granting a PET ID and first mission.',
    icon: <BadgeCheck className="text-rose-400 w-6 h-6 animate-pulse" />,
    image: '/bg.jpg',
    modal: 'Verified PETs access vaults, quests, NFTs, and education with full key custody.'
  },
  {
    title: 'Support Spells',
    description: 'Optional ads reward tokens and PET yield boosts.',
    icon: <Eye className="text-rose-400 w-6 h-6 animate-pulse" />,
    image: '/bg.jpg',
    modal: 'Opt-in spells transform time into tokens to amplify vault earnings.'
  },
  {
    title: 'Ecosystem Metrics & Growth',
    description: 'Track Swytch’s expansion: adoption, APY, DAO votes, and more.',
    icon: <BarChart3 className="text-rose-400 w-6 h-6 animate-pulse" />,
    image: '/bg.jpg',
    modal: 'On-chain data fuels progress, transparent and accessible to PETs.'
  },
  {
    title: 'FAQ & Truth Panel',
    description: 'The Truth Panel answers questions with AI, human wisdom, and DAO knowledge.',
    icon: <HelpCircle className="text-rose-400 w-6 h-6 animate-pulse" />,
    image: '/bg.jpg',
    modal: 'Our AI NPC draws from trust law and PET consensus. Ask anything.'
  },
  {
    title: 'Sentinel Evolution',
    description: 'Choose your path: Oracle, Rebel, Architect, Guardian.',
    icon: <UserCheck className="text-rose-400 w-6 h-6 animate-pulse" />,
    image: '/bg.jpg',
    modal: 'Your class upgrades vaults, yields, and perks as you evolve.'
  }
];

const AnimatedText = ({ text }: { text: string }) => (
  <motion.div
    className="text-gray-100 text-base font-medium text-center p-4 leading-relaxed font-inter"
    variants={{ animate: { y: [0, -10, 0], scale: [1, 1.05, 1], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } } }}
    animate="animate"
  >
    {text}
  </motion.div>
);

const EcosystemSections: React.FC<EcosystemSectionsProps> = ({ setShowMessage }) => {
  const { setActiveModal: setModal } = useModal();

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 50, scale: 0.95 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut', type: 'spring', stiffness: 100 } } }}
      className="space-y-16"
    >
      <h3 className="text-3xl font-bold text-white flex items-center justify-center gap-3 font-poppins">
        <Zap className="w-8 h-8 text-rose-400 animate-pulse" /> The Swytch Ecosystem
      </h3>
      <p className="text-lg text-gray-300 text-center max-w-3xl mx-auto font-inter">
        Explore the interconnected layers of Swytch, orchestrated by AI and driven by PETs.
      </p>
      {ecosystemSections.map((item) => (
        <motion.div
          key={item.title}
          variants={{ hidden: { opacity: 0, y: 50, scale: 0.95 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut', type: 'spring', stiffness: 100 } } }}
          className="grid lg:grid-cols-2 gap-10 items-center"
        >
          <div className="space-y-4 text-left">
            <div className="flex items-center gap-3 text-rose-400">
              {item.icon}
              <span className="text-lg font-semibold text-white font-poppins">{item.title}</span>
            </div>
            <p className="text-gray-300 text-lg font-inter">{item.description}</p>
            <motion.button
              onClick={() => {
                setModal(item.title);
                setShowMessage(`ℹ️ Viewing details for ${item.title}`);
              }}
              className="text-rose-400 hover:text-rose-500 mt-4 underline text-sm font-inter"
              whileHover={{ scale: 1.05 }}
              aria-label={`Learn more about ${item.title}`}
            >
              Learn More
            </motion.button>
            <div className="relative rounded-xl overflow-hidden h-[200px] bg-gray-800/50 p-4">
              <AnimatedText text={item.modal} />
              <noscript>
                <p className="text-gray-300 text-sm p-4">{item.modal}</p>
              </noscript>
            </div>
          </div>
          <motion.img
            src={item.image}
            alt={item.title}
            className="rounded-xl shadow-lg w-full max-h-[300px] object-cover"
            whileHover={{ scale: 1.05 }}
            onError={(e) => { e.currentTarget.src = '/fallback.jpg'; }}
          />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default EcosystemSections;