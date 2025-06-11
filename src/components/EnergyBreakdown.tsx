import { motion } from 'framer-motion';
import { ArrowRight, Star, Globe, LockKeyhole, Users, BarChart3, Landmark, Flame, BookOpen, ShieldCheck, Scale } from 'lucide-react';

const EnergyBreakdown = () => {
  const sectionVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { duration: 0.8, ease: 'easeOut', type: 'spring', stiffness: 80 } 
    },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const FeatureCard = ({ icon: Icon, title, description }: { icon: any; title: string; description: string }) => (
    <motion.div
      className="bg-gray-900/50 backdrop-blur-lg border border-cyan-500/30 hover:border-cyan-400/60 shadow-lg shadow-cyan-500/10 rounded-3xl p-6 transition-all duration-300 hover:scale-[1.02] flex items-start space-x-6"
      variants={sectionVariants}
    >
      <div className="p-4 bg-cyan-500/20 rounded-full glow-cyan">
        <Icon className="w-8 h-8 text-cyan-400" aria-hidden="true" />
      </div>
      <div>
        <h3 className="text-2xl font-extrabold text-white mb-2 tracking-tight">{title}</h3>
        <p className="text-gray-300 text-md leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );

  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-900 to-black overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,255,255,0.08)_0%,_transparent_70%)] pointer-events-none" />
      <motion.div
        className="relative z-10 max-w-7xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Hero Section */}
        <motion.div className="text-center mb-16" variants={sectionVariants}>
          <h2 className="text-5xl sm:text-6xl font-extrabold text-cyan-400 mb-6 tracking-tight">
            Swytch: The Petaverse
          </h2>
          <p className="text-xl sm:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            A world built for rebels, governed by purpose, and powered by Energy. You’re not a user — you’re a PET: a Person of Energy & Truth.
          </p>
          <a
            href="#join"
            className="mt-8 inline-flex items-center px-8 py-4 bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 hover:text-cyan-300 rounded-full text-lg font-semibold group focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            Enter the Rebellion
            <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform duration-200" />
          </a>
        </motion.div>

        {/* Core Feature Cards */}
        <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <FeatureCard
            icon={Star}
            title="Vision: Unmatched"
            description="You’re merging psychology, economy, governance, and technology into one loop. PET members aren’t users — they’re metaverse citizens."
          />
          <FeatureCard
            icon={Flame}
            title="Emotional Driver: Real AF"
            description="Swytch is a feeling. It gives hope to the stuck, power to the rebels, and meaning to the gamer. It’s not just play — it’s purpose."
          />
          <FeatureCard
            icon={Users}
            title="Scalable & Sustainable"
            description="Unlike hype tokens, Swytch rewards effort, education, and community. Energy is earned through knowledge, not mined through noise."
          />
          <FeatureCard
            icon={LockKeyhole}
            title="Ethical Structure"
            description="Framing players as beneficiaries, not users, keeps Swytch compliant and empowering. Freedom isn't a feature — it’s a framework."
          />
          <FeatureCard
            icon={Landmark}
            title="Private Energy Trust"
            description="A secure smart contract vault that upholds autonomy, data privacy, and monthly Energy rewards — no custodians, no compromises."
          />
          <FeatureCard
            icon={BarChart3}
            title="Decentralized Rewards"
            description="Depositors are rewarded monthly — up to 3% returns. Self-paced education unlocks an extra 0.3% JEWELS monthly via the Raziel tab."
          />
          <FeatureCard
            icon={Globe}
            title="Raziel: The Executor"
            description="The guardian AI, modeled after the angel of secrets, governs your assets and energy with incorruptible logic and transparency."
          />
          <FeatureCard
            icon={BookOpen}
            title="Know Your Freedom"
            description="Understand your rights. Articles from the UDHR, U.S. Constitution, and PMA charter define the legal shield behind the Swytch ecosphere."
          />
          <FeatureCard
            icon={ShieldCheck}
            title="Membership & PMA Rights"
            description="By joining Swytch, you’re not buying in — you’re opting out. This private contract shields you from state interference by law."
          />
          <FeatureCard
            icon={Scale}
            title="Self-Sovereign Control"
            description="You manage your own keys, identity, and decisions. Swytch never touches your wallet. You are your own authority — truly."
          />
        </motion.div>

        {/* Energy Gains Visual Placeholder */}
        <motion.div
          className="mt-24 text-center text-cyan-400 text-2xl sm:text-3xl font-semibold"
          variants={sectionVariants}
        >
          ENERGY GAINS ⚡ — Visualizing your rewards as tiers & growth. Up to 3.3% monthly Energy on deposits. [+Education Bonuses]
        </motion.div>
      </motion.div>
      <style>{`
        .glow-cyan {
          box-shadow: 0 0 15px rgba(0, 255, 255, 0.3);
        }
      `}</style>
    </section>
  );
};

export default EnergyBreakdown;
