import { motion } from 'framer-motion';
import { useState } from 'react';
import { X, Bolt, ShieldCheck, BookOpen, Landmark, Scale, Zap, FileText, Wallet } from 'lucide-react';
import energyCycle from '@/assets/swytch/bg (57).jpg';
import jewelChart from '@/assets/swytch/bg (79).jpg';
import freedomIcon from '@/assets/swytch/bg (123).jpg';

const EnergyExplanation = () => {
  const [modalOpen, setModalOpen] = useState(false);

  const variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black to-gray-900 text-center relative overflow-hidden">
      <motion.h2
        className="text-4xl sm:text-5xl font-bold text-cyan-400 mb-6"
        variants={variants}
        initial="hidden"
        animate="visible"
      >
        What is Energy?
      </motion.h2>
      <motion.p
        className="text-lg sm:text-xl text-gray-300 max-w-4xl mx-auto mb-12"
        variants={variants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.2 }}
      >
        In Swytch, Energy is not just science — it’s a sovereign signal. It's the bridge between effort and value. Measured in JEWELS, it fuels your digital existence, records your participation, and respects your time.
      </motion.p>

      <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
        <motion.div
          className="bg-gray-900/60 rounded-3xl p-6 backdrop-blur-xl border border-cyan-500/30 text-left"
          initial="hidden"
          animate="visible"
          variants={variants}
        >
          <div className="flex items-center mb-4 text-cyan-400">
            <Bolt className="mr-3 w-6 h-6" />
            <h3 className="text-2xl font-bold">How Energy Works</h3>
          </div>
          <p className="text-gray-300 mb-4">
            Energy in Swytch is proof-of-action. You earn it by playing, learning, and evolving. It is stored in your Private Energy Trust, and grows monthly — up to 3.3%. No staking. No speculation. Just contribution.
          </p>
          <img src={energyCycle} alt="Swytch Energy Cycle" className="rounded-xl border border-cyan-500/20 shadow-md" />
        </motion.div>

        <motion.div
          className="bg-gray-900/60 rounded-3xl p-6 backdrop-blur-xl border border-cyan-500/30 text-left"
          initial="hidden"
          animate="visible"
          variants={variants}
        >
          <div className="flex items-center mb-4 text-cyan-400">
            <Wallet className="mr-3 w-6 h-6" />
            <h3 className="text-2xl font-bold">Your Vault, Your Rules</h3>
          </div>
          <p className="text-gray-300 mb-4">
            Swytch never holds your wallet. You connect a third-party self-custodial wallet. We don’t control it — and we never can. Your keys. Your JEWELS. Your terms.
          </p>
          <img src={jewelChart} alt="JEWELS Growth Chart" className="rounded-xl border border-cyan-500/20 shadow-md" />
        </motion.div>

        <motion.div
          className="bg-gray-900/60 rounded-3xl p-6 backdrop-blur-xl border border-cyan-500/30 text-left md:col-span-2"
          initial="hidden"
          animate="visible"
          variants={variants}
        >
          <div className="flex items-center mb-4 text-cyan-400">
            <Landmark className="mr-3 w-6 h-6" />
            <h3 className="text-2xl font-bold">What is a Private Energy Trust (PMA)?</h3>
          </div>
          <p className="text-gray-300 mb-4">
            The Swytch Private Energy Trust is not public. It operates as a Private Ministerial Association (PMA), protected by U.S. Constitutional law and the Universal Declaration of Human Rights. Membership is your opt-in sovereignty. Once in, you're a Beneficiary — not a user.
          </p>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
              <ShieldCheck className="text-cyan-400 w-6 h-6 mt-1" />
              <p className="text-gray-300">No government jurisdiction. You are protected by contract law and natural rights.</p>
            </div>
            <div className="flex items-start gap-4">
              <BookOpen className="text-cyan-400 w-6 h-6 mt-1" />
              <p className="text-gray-300">You have full legal right to share, learn, earn, and evolve in the Swytch ecosphere.</p>
            </div>
            <div className="flex items-start gap-4">
              <Scale className="text-cyan-400 w-6 h-6 mt-1" />
              <p className="text-gray-300">Disputes are resolved via private arbitration — not public courts.</p>
            </div>
            <div className="flex items-start gap-4">
              <FileText className="text-cyan-400 w-6 h-6 mt-1" />
              <p className="text-gray-300">Your rights are listed in the UDHR and Amendments: 1st, 5th, 9th, 10th, 14th.</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-gray-900/60 rounded-3xl p-6 backdrop-blur-xl border border-cyan-500/30 text-left md:col-span-2"
          initial="hidden"
          animate="visible"
          variants={variants}
        >
          <div className="flex items-center mb-4 text-cyan-400">
            <Zap className="mr-3 w-6 h-6" />
            <h3 className="text-2xl font-bold">Energy = Freedom</h3>
          </div>
          <p className="text-gray-300 mb-4">
            Energy in Swytch doesn’t just represent effort — it is your right to earn, hold, withdraw, and use value on your terms. You can:
          </p>
          <ul className="text-cyan-300 list-disc text-left pl-6 space-y-2">
            <li>Convert Energy to Stablecoin (1:1 with USDT)</li>
            <li>Access higher tier bonuses with monthly % returns</li>
            <li>Grow rewards by learning from the Raziel Archive</li>
            <li>Use JEWELS to unlock realms, missions & items</li>
          </ul>
          <img src={freedomIcon} alt="Self-Sovereign Energy" className="mt-6 rounded-xl border border-cyan-500/20 shadow-md w-full sm:max-w-lg mx-auto" />
        </motion.div>
      </div>

      {/* Disclosure Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6">
          <div className="bg-gray-900 max-w-4xl w-full rounded-2xl p-6 relative border border-cyan-500/30 backdrop-blur-lg overflow-y-auto max-h-[90vh] text-left">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-cyan-400 hover:text-red-500"
            >
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-3xl font-bold text-cyan-400 mb-4">Swytch Legal & Trust Disclosure</h3>
            <p className="text-gray-300 text-sm">
              Full PMA & Constitution info, UDHR articles, arbitration terms, and decentralized trust disclosures are available inside the "Know Your Freedom" section. Membership implies consent. Exit is always possible. You are sovereign by design.
            </p>
          </div>
        </div>
      )}
    </section>
  );
};

export default EnergyExplanation;
