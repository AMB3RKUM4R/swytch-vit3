import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { X, Bolt, ShieldCheck, BookOpen, Landmark, Scale, Zap, FileText, Wallet, Sparkles, Trophy, Star, ArrowRight } from 'lucide-react';
import energyCycle from '/bg (57).jpg';
import jewelChart from '/bg (79).jpg';
import freedomIcon from '/bg (123).jpg';

const rewardTiers = [
  { id: 1, title: 'Spark', reward: '1.0% Monthly', requirement: 'Basic Activity', image: '/bg (29).jpg' },
  { id: 2, title: 'Pulse', reward: '1.5% Monthly', requirement: '$500 Deposit', image: '/bg (28).jpg' },
  { id: 3, title: 'Surge', reward: '2.0% Monthly', requirement: '$1000 Deposit', image: '/bg (22).jpg' },
  { id: 4, title: 'Blaze', reward: '2.5% Monthly', requirement: '$2500 Deposit', image: '/bg (6).jpg' },
  { id: 5, title: 'Nova', reward: '3.0% Monthly', requirement: '$5000 Deposit + Raziel Quests', image: '/bg (8).jpg' },
  { id: 6, title: 'Apex', reward: '3.3% Monthly', requirement: '$10000 Deposit + Full Raziel', image: '/bg (9).jpg' },
];

const EnergyExplanation = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const scrollRef = useRef<HTMLDivElement>(null);

  // Animation variants
  const sectionVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut', type: 'spring', stiffness: 100 } }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  const orbitVariants = {
    animate: { rotate: 360, transition: { duration: 15, repeat: Infinity, ease: 'linear' } }
  };

  const infiniteScroll = {
    animate: { x: ['0%', '-50%'], transition: { x: { repeat: Infinity, repeatType: 'loop', duration: 20, ease: 'linear' } } }
  };

  // Parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Infinite scroll effect
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let frameId: number;
    const scroll = () => {
      scrollContainer.scrollLeft += 1;
      if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth - scrollContainer.clientWidth) {
        scrollContainer.scrollLeft = 0;
      }
      frameId = requestAnimationFrame(scroll);
    };
    frameId = requestAnimationFrame(scroll);

    return () => cancelAnimationFrame(frameId);
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
        {/* Hero Section with Parallax and Orbiting Particles */}
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
          <motion.div className="absolute inset-0 pointer-events-none" variants={orbitVariants} animate="animate">
            <motion.div className="absolute top-10 left-10 w-4 h-4 bg-cyan-400 rounded-full opacity-50" animate={{ scale: [1, 1.5, 1], transition: { duration: 2, repeat: Infinity } }} />
            <motion.div className="absolute bottom-10 right-10 w-6 h-6 bg-teal-400 rounded-full opacity-50" animate={{ scale: [1, 1.3, 1], transition: { duration: 3, repeat: Infinity } }} />
          </motion.div>
          <div className="relative space-y-6">
            <motion.h2
              className="text-5xl sm:text-7xl font-extrabold text-cyan-400 tracking-tight flex items-center justify-center gap-4"
              animate={{ y: [0, -10, 0], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } }}
            >
              <Sparkles className="w-12 h-12 animate-pulse" /> What is Energy?
            </motion.h2>
            <motion.p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              In Swytch, Energy is your sovereign signal—a bridge between effort and value. Measured in JEWELS, it powers your digital existence, tracks your contributions, and honors your time.
            </motion.p>
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center px-8 py-4 bg-cyan-600 text-white hover:bg-cyan-700 rounded-full text-lg font-semibold group"
            >
              Explore Your Freedom
              <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform duration-200" />
            </button>
          </div>
        </motion.div>

        {/* Main Content Sections */}
        <motion.div
          variants={sectionVariants}
          className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto"
        >
          {/* How Energy Works */}
          <motion.div
            className="relative bg-gray-900/60 rounded-3xl p-8 backdrop-blur-xl border border-cyan-500/20 shadow-xl hover:shadow-cyan-500/40 transition-all"
            whileHover={{ scale: 1.05, y: -10 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-3xl" />
            <div className="relative space-y-4">
              <div className="flex items-center mb-4 text-cyan-400">
                <Bolt className="mr-3 w-8 h-8 animate-pulse" />
                <h3 className="text-3xl font-bold">How Energy Works</h3>
              </div>
              <p className="text-lg text-gray-300">
                Energy is your proof-of-action in Swytch. Earn it through play, learning, and growth. Stored in your Private Energy Trust, it grows up to 3.3% monthly—no staking, just contribution.
              </p>
              <img src={energyCycle} alt="Swytch Energy Cycle" className="rounded-xl border border-cyan-500/20 shadow-md w-full" />
            </div>
          </motion.div>

          {/* Your Vault, Your Rules */}
          <motion.div
            className="relative bg-gray-900/60 rounded-3xl p-8 backdrop-blur-xl border border-teal-500/20 shadow-xl hover:shadow-teal-500/40 transition-all"
            whileHover={{ scale: 1.05, y: -10 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-green-500/10 rounded-3xl" />
            <div className="relative space-y-4">
              <div className="flex items-center mb-4 text-teal-400">
                <Wallet className="mr-3 w-8 h-8 animate-pulse" />
                <h3 className="text-3xl font-bold">Your Vault, Your Rules</h3>
              </div>
              <p className="text-lg text-gray-300">
                Swytch never touches your wallet. Connect a self-custodial wallet, and you retain full control. Your keys, your JEWELS, your sovereignty.
              </p>
              <img src={jewelChart} alt="JEWELS Growth Chart" className="rounded-xl border border-teal-500/20 shadow-md w-full" />
            </div>
          </motion.div>

          {/* Private Energy Trust */}
          <motion.div
            className="relative bg-gray-900/60 rounded-3xl p-8 backdrop-blur-xl border border-purple-500/20 shadow-xl hover:shadow-purple-500/40 transition-all md:col-span-2"
            whileHover={{ scale: 1.03 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-3xl" />
            <div className="relative space-y-6">
              <div className="flex items-center mb-4 text-purple-400">
                <Landmark className="mr-3 w-8 h-8 animate-pulse" />
                <h3 className="text-3xl font-bold">What is a Private Energy Trust?</h3>
              </div>
              <p className="text-lg text-gray-300">
                The Swytch Private Energy Trust (PMA) operates outside public jurisdiction, protected by U.S. Constitutional law and UDHR. As a member, you’re a Beneficiary, not a user, with sovereign rights.
              </p>
              <div className="grid sm:grid-cols-2 gap-6">
                <motion.div className="flex items-start gap-4" whileHover={{ x: 5 }}>
                  <ShieldCheck className="text-purple-400 w-6 h-6 mt-1 animate-pulse" />
                  <p className="text-gray-300">Protected by contract law and natural rights, free from government oversight.</p>
                </motion.div>
                <motion.div className="flex items-start gap-4" whileHover={{ x: 5 }}>
                  <BookOpen className="text-purple-400 w-6 h-6 mt-1 animate-pulse" />
                  <p className="text-gray-300">Full legal rights to share, learn, earn, and evolve in the Swytch ecosphere.</p>
                </motion.div>
                <motion.div className="flex items-start gap-4" whileHover={{ x: 5 }}>
                  <Scale className="text-purple-400 w-6 h-6 mt-1 animate-pulse" />
                  <p className="text-gray-300">Disputes resolved via private arbitration, not public courts.</p>
                </motion.div>
                <motion.div className="flex items-start gap-4" whileHover={{ x: 5 }}>
                  <FileText className="text-purple-400 w-6 h-6 mt-1 animate-pulse" />
                  <p className="text-gray-300">Rights enshrined in UDHR and Amendments: 1st, 5th, 9th, 10th, 14th.</p>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Energy = Freedom */}
          <motion.div
            className="relative bg-gray-900/60 rounded-3xl p-8 backdrop-blur-xl border border-yellow-500/20 shadow-xl hover:shadow-yellow-500/40 transition-all md:col-span-2"
            whileHover={{ scale: 1.03 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-3xl" />
            <div className="relative space-y-6">
              <div className="flex items-center mb-4 text-yellow-400">
                <Zap className="mr-3 w-8 h-8 animate-pulse" />
                <h3 className="text-3xl font-bold">Energy = Freedom</h3>
              </div>
              <p className="text-lg text-gray-300">
                Energy is your right to earn, hold, and use value on your terms. JEWELS empower you to shape your Petaverse journey.
              </p>
              <ul className="text-yellow-300 list-disc pl-6 space-y-2 text-lg">
                <motion.li whileHover={{ x: 5 }}>Convert Energy to Stablecoin (1:1 with USDT)</motion.li>
                <motion.li whileHover={{ x: 5 }}>Access higher tier bonuses with monthly returns</motion.li>
                <motion.li whileHover={{ x: 5 }}>Grow rewards via Raziel Archive learning</motion.li>
                <motion.li whileHover={{ x: 5 }}>Use JEWELS to unlock realms, missions, and items</motion.li>
              </ul>
              <img src={freedomIcon} alt="Self-Sovereign Energy" className="mt-6 rounded-xl border border-yellow-500/20 shadow-md w-full sm:max-w-lg mx-auto" />
            </div>
          </motion.div>
        </motion.div>

        {/* Reward Tiers Section with Infinite Scroll */}
        <motion.div
          variants={sectionVariants}
          className="space-y-8 max-w-7xl mx-auto"
        >
          <h2 className="text-4xl font-extrabold text-white text-center flex items-center justify-center gap-4">
            <Trophy className="w-10 h-10 text-cyan-400 animate-pulse" /> Energy Reward Tiers
          </h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto text-center">
            Climb the ranks of the Petaverse by earning JEWELS. Each tier unlocks higher monthly rewards and exclusive benefits.
          </p>
          <div className="relative overflow-hidden">
            <motion.div
              ref={scrollRef}
              className="flex gap-6"
              variants={infiniteScroll}
              animate="animate"
            >
              {[...rewardTiers, ...rewardTiers].map((tier, i) => (
                <motion.div
                  key={`${tier.id}-${i}`}
                  className="flex-shrink-0 w-[280px] bg-gray-900/60 rounded-xl p-6 border border-cyan-500/20 shadow-xl hover:shadow-cyan-500/40 transition-all backdrop-blur-md"
                  whileHover={{ scale: 1.05, y: -10 }}
                >
                  <img src={tier.image} alt={tier.title} className="w-full h-36 object-cover rounded-lg mb-4" />
                  <h3 className="text-xl font-bold text-cyan-300 flex items-center gap-2">
                    <Star className="w-5 h-5 animate-pulse" /> {tier.title}
                  </h3>
                  <p className="text-gray-200 mb-2">Reward: {tier.reward}</p>
                  <p className="text-gray-300 text-sm mb-4">Requirement: {tier.requirement}</p>
                  <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg w-full font-semibold">Unlock Tier</button>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Final Call-to-Action */}
        <motion.div
          variants={sectionVariants}
          className="relative bg-gray-900/50 backdrop-blur-lg rounded-3xl p-12 text-center border border-teal-500/20 shadow-2xl hover:shadow-teal-500/40 transition-all"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-green-500/10 rounded-3xl" />
          <div className="relative space-y-6">
            <h2 className="text-4xl font-extrabold text-white flex items-center justify-center gap-4">
              <Sparkles className="w-10 h-10 text-teal-400 animate-pulse" /> Ignite Your Energy
            </h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              Join the Swytch Petaverse and harness your Energy to shape a decentralized future. Your journey to sovereignty starts now.
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center px-8 py-4 bg-teal-600 text-white hover:bg-teal-700 rounded-full text-lg font-semibold group"
            >
              Start Your Journey
              <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform duration-200" />
            </button>
          </div>
        </motion.div>

        {/* Disclosure Modal */}
        <AnimatePresence>
          {modalOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
            >
              <motion.div
                className="bg-gray-900 max-w-4xl w-full rounded-2xl p-8 relative border border-cyan-500/20 shadow-2xl backdrop-blur-lg overflow-y-auto max-h-[90vh] text-left"
                animate={{ y: [0, -10, 0], transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' } }}
              >
                <motion.button
                  onClick={() => setModalOpen(false)}
                  className="absolute top-4 right-4 text-cyan-400 hover:text-red-500"
                  whileHover={{ rotate: 90 }}
                >
                  <X className="w-8 h-8" />
                </motion.button>
                <h3 className="text-4xl font-bold text-cyan-400 mb-6 flex items-center gap-4">
                  <FileText className="w-10 h-10 animate-pulse" /> Swytch Legal & Trust Disclosure
                </h3>
                <p className="text-lg text-gray-300 leading-relaxed">
                  The Swytch Private Energy Trust operates as a Private Ministerial Association (PMA), safeguarded by U.S. Constitutional law and the Universal Declaration of Human Rights. Full details on PMA structure, UDHR articles, arbitration terms, and decentralized trust protocols are available in the "Know Your Freedom" section. Membership signifies consent, with the freedom to exit at any time. You are sovereign by design.
                </p>
                <div className="mt-6 grid sm:grid-cols-2 gap-4">
                  <motion.a
                    href="#freedom"
                    className="bg-cyan-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.05 }}
                  >
                    <BookOpen className="w-5 h-5" /> View Freedom Docs
                  </motion.a>
                  <motion.button
                    className="bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setModalOpen(false)}
                  >
                    <ShieldCheck className="w-5 h-5" /> Close Disclosure
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
};

export default EnergyExplanation;