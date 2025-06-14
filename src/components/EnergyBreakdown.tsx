import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ArrowRight, Star, Globe, LockKeyhole, Users, BarChart3, Landmark, Flame, BookOpen, ShieldCheck, Scale, Trophy, Sparkles } from 'lucide-react';

const tiers = [
  { level: 1, title: 'Initiate', reward: '1.0%', deposit: '$100-$499', image: '/bg (29).jpg' },
  { level: 2, title: 'Apprentice', reward: '1.3%', deposit: '$500-$999', image: '/bg (28).jpg' },
  { level: 3, title: 'Seeker', reward: '1.6%', deposit: '$1000-$2499', image: '/bg (22).jpg' },
  { level: 4, title: 'Guardian', reward: '1.9%', deposit: '$2500-$4999', image: '/bg (6).jpg' },
  { level: 5, title: 'Sage', reward: '2.2%', deposit: '$5000-$9999', image: '/bg (8).jpg' },
  { level: 6, title: 'Archon', reward: '2.5%', deposit: '$10000-$24999', image: '/bg (9).jpg' },
  { level: 7, title: 'Alchemist', reward: '2.8%', deposit: '$25000-$49999', image: '/bg (10).jpg' },
  { level: 8, title: 'Elder', reward: '3.1%', deposit: '$50000-$99999', image: '/bg (12).jpg' },
  { level: 9, title: 'Mythic PET', reward: '3.3%', deposit: '$100000+', image: '/bg (11).jpg' },
];

// Animation variants
const sectionVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut', type: 'spring', stiffness: 80 } }
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.3 } }
};

const infiniteScroll = {
  animate: { x: ['0%', '-50%'], transition: { x: { repeat: Infinity, repeatType: 'loop', duration: 20, ease: 'linear' } } }
};

const FeatureCard = ({ icon: Icon, title, description }: { icon: any; title: string; description: string }) => (
  <motion.div
    className="relative bg-gray-900/60 backdrop-blur-lg border border-cyan-500/30 shadow-xl rounded-3xl p-8 transition-all hover:shadow-cyan-500/40"
    variants={sectionVariants}
    whileHover={{ scale: 1.05, y: -10 }}
  >
    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-3xl" />
    <div className="relative flex items-start space-x-6">
      <div className="p-4 bg-cyan-500/20 rounded-full shadow-lg">
        <Icon className="w-8 h-8 text-cyan-400 animate-pulse" aria-hidden="true" />
      </div>
      <div>
        <h3 className="text-2xl font-extrabold text-white mb-3 tracking-tight">{title}</h3>
        <p className="text-gray-300 text-lg leading-relaxed">{description}</p>
      </div>
    </div>
  </motion.div>
);

const EnergyBreakdown = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Parallax effect for hero
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section className="relative py-32 px-6 sm:px-8 lg:px-24 bg-gradient-to-br from-gray-950 via-indigo-950 to-black text-white overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,255,255,0.08)_0%,_transparent_70%)] pointer-events-none" />

      <motion.div
        className="relative z-10 max-w-7xl mx-auto space-y-32"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Hero Section with Parallax */}
        <motion.div
          variants={sectionVariants}
          className="relative text-center bg-gray-900/50 backdrop-blur-lg rounded-3xl p-12 border border-cyan-500/30 shadow-2xl hover:shadow-cyan-500/40 transition-all"
          style={{
            backgroundImage: `url(/bg (59).jpg)`,
            backgroundSize: 'cover',
            backgroundPosition: `${50 + mousePosition.x * 5}% ${50 + mousePosition.y * 5}%`
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-800/50 to-blue-900/50 rounded-3xl" />
          <div className="relative space-y-6">
            <h2 className="text-5xl sm:text-7xl font-extrabold text-cyan-400 tracking-tight flex items-center justify-center gap-4">
              <Sparkles className="w-12 h-12 animate-pulse" /> The Petaverse
            </h2>
            <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              A rebellion powered by Energy, governed by purpose, and built for PETs—People of Energy & Truth. Step into a world where your actions shape your future.
            </p>
            <a
              href="#join"
              className="inline-flex items-center px-8 py-4 bg-cyan-600 text-white hover:bg-cyan-700 rounded-full text-lg font-semibold group"
            >
              Join the Rebellion
              <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform duration-200" />
            </a>
          </div>
        </motion.div>

        {/* Core Feature Cards */}
        <motion.div
          variants={sectionVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
        >
          <FeatureCard
            icon={Star}
            title="Vision: Unmatched"
            description="Swytch fuses psychology, economy, governance, and tech into a single ecosystem. PETs aren’t users—they’re citizens of a new metaverse."
          />
          <FeatureCard
            icon={Flame}
            title="Emotional Driver: Real AF"
            description="Swytch ignites hope, empowers rebels, and gives gamers purpose. It’s not just a game—it’s a movement that feels alive."
          />
          <FeatureCard
            icon={Users}
            title="Scalable & Sustainable"
            description="Swytch rewards effort, education, and community, not hype. Earn Energy through knowledge, not noise, for a lasting ecosphere."
          />
          <FeatureCard
            icon={LockKeyhole}
            title="Ethical Structure"
            description="By framing PETs as beneficiaries, Swytch ensures compliance and empowerment. Freedom is the foundation, not a feature."
          />
          <FeatureCard
            icon={Landmark}
            title="Private Energy Trust"
            description="A smart contract vault that guarantees autonomy, data privacy, and monthly Energy rewards—free from custodians."
          />
          <FeatureCard
            icon={BarChart3}
            title="Decentralized Rewards"
            description="Earn up to 3% monthly returns on deposits, plus an extra 0.3% JEWELS through self-paced education in the Raziel tab."
          />
          <FeatureCard
            icon={Globe}
            title="Raziel: The Executor"
            description="An AI guardian, inspired by the angel of secrets, manages your assets with transparent, incorruptible logic."
          />
          <FeatureCard
            icon={BookOpen}
            title="Know Your Freedom"
            description="Learn your rights through the UDHR, U.S. Constitution, and PMA charter—the legal shield of the Swytch ecosphere."
          />
          <FeatureCard
            icon={ShieldCheck}
            title="Membership & PMA Rights"
            description="Joining Swytch means opting out of interference. A private contract protects you under constitutional law."
          />
          <FeatureCard
            icon={Scale}
            title="Self-Sovereign Control"
            description="You hold your keys, identity, and decisions. Swytch never touches your wallet—you are your own authority."
          />
        </motion.div>

        {/* Energy Gains Section with Infinite Scroll */}
        <motion.div
          variants={sectionVariants}
          className="space-y-8"
        >
          <h2 className="text-4xl font-extrabold text-white text-center flex items-center justify-center gap-4">
            <Trophy className="w-10 h-10 text-cyan-400 animate-pulse" /> Energy Gains ⚡
          </h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto text-center">
            Visualize your growth through tiers. Deposit JEWELS to earn up to 3.3% monthly Energy, plus education bonuses via Raziel.
          </p>
          <div className="relative overflow-hidden">
            <motion.div
              className="flex gap-6"
              variants={infiniteScroll}
              animate="animate"
            >
              {[...tiers, ...tiers].map((tier, i) => (
                <motion.div
                  key={`${tier.level}-${i}`}
                  className="flex-shrink-0 w-[300px] bg-gray-900/60 rounded-xl p-6 border border-cyan-500/20 shadow-xl hover:shadow-cyan-500/30 transition-all backdrop-blur-md"
                  whileHover={{ scale: 1.05, y: -10 }}
                >
                  <img src={tier.image} alt={tier.title} className="w-full h-40 object-cover rounded-lg mb-4" />
                  <h3 className="text-xl font-bold text-cyan-300 flex items-center gap-2">
                    <Star className="w-5 h-5" /> Level {tier.level}: {tier.title}
                  </h3>
                  <p className="text-gray-200 mb-2">Reward: {tier.reward} Monthly</p>
                  <p className="text-gray-300 text-sm mb-4">Deposit: {tier.deposit}</p>
                  <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg w-full font-semibold">Deposit Now</button>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Final Call-to-Action */}
        <motion.div
          variants={sectionVariants}
          className="relative bg-gray-900/50 backdrop-blur-lg rounded-3xl p-12 text-center border border-teal-500/30 shadow-2xl hover:shadow-teal-500/40 transition-all"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-green-500/10 rounded-3xl" />
          <div className="relative space-y-6">
            <h2 className="text-4xl font-extrabold text-white flex items-center justify-center gap-4">
              <Globe className="w-10 h-10 text-teal-400 animate-pulse" /> Shape the Petaverse
            </h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              Become a PET and harness your Energy to build a decentralized future. Your rebellion starts here.
            </p>
            <a
              href="#join"
              className="inline-flex items-center px-8 py-4 bg-teal-600 text-white hover:bg-teal-700 rounded-full text-lg font-semibold group"
            >
              Start Your Journey
              <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform duration-200" />
            </a>
          </div>
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