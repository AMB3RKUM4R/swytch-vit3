import { motion } from 'framer-motion';
import React, { useState } from 'react';

interface InfoCard {
  icon: string;
  title: string;
  text: string;
  details: string;
}

const EnergyTrustInfo = () => {
  const variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  const [selectedCard, setSelectedCard] = useState<InfoCard | null>(null);
  const [showStepsModal, setShowStepsModal] = useState(false);

  const infoCards: InfoCard[] = [
    {
      icon: '/icon_1.gif',
      title: 'PMA-Backed Structure',
      text: 'Swytch exists under a Private Ministerial Association (PMA), freeing it from corporate or state interference.',
      details: 'Members contractually opt-in and retain constitutional & spiritual sovereignty. Protected by amendments and the UDHR, Swytch ensures your existence remains private and lawful, without dependency on the public system.'
    },
    {
      icon: '/icon_2.gif',
      title: 'Immutable by Design',
      text: 'Every action and reward is recorded on an open blockchain using smart contracts.',
      details: 'With no admin override or backend dependency, the protocol runs entirely on deterministic, public logic. This is anti-corruption technology built to defend energy with integrity.'
    },
    {
      icon: '/icon_3.gif',
      title: 'Education is Yield',
      text: 'Monthly Energy (JEWELS) yield grows by completing quests in the Raziel Library.',
      details: 'Raziel tracks knowledge participation in decentralized modules. As you unlock quests and articles, you gain additional percentage yield rewards monthly — like interest for consciousness.'
    },
    {
      icon: '/icon_1.gif',
      title: 'JEWELS as Proof',
      text: 'These tokens represent effort, not speculation — earned through service and time.',
      details: 'JEWELS are your proof-of-work and proof-of-intent inside the PET system. They carry timestamped value and are used for vault upgrades, access, or liquidity exits into stablecoin.'
    },
    {
      icon: '/icon_2.gif',
      title: 'Zero Data Collection',
      text: 'No emails, no biometrics, no KYC — just contract-based autonomy.',
      details: 'Swytch doesn’t collect user data. Your PET vault and identity are represented by encrypted contracts and local logic. Your data, your sovereignty, by default.'
    },
    {
      icon: '/icon_3.gif',
      title: 'Cross-Chain Ready',
      text: 'Swytch works across EVM-compatible chains like Avalanche, Polygon, and BSC.',
      details: 'No blockchain tribalism. The system uses smart adapters to operate with multiple networks and vault structures. Wherever you are, Swytch adapts to you.'
    }
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black to-gray-900 text-center overflow-hidden">
      <motion.div className="max-w-6xl mx-auto" variants={variants} initial="hidden" animate="visible">
        <h2 className="text-5xl font-extrabold text-cyan-400 mb-8">Private Energy Trust</h2>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-12">
          The Swytch Trust is more than a vault. It’s a legal and spiritual declaration of sovereignty, encoded in smart contracts, backed by constitutional rights, and rewarded with Energy.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 text-left mb-20">
          {infoCards.map((card, i) => (
            <motion.div
              key={i}
              className="cursor-pointer bg-gray-900/50 border border-cyan-500/20 rounded-xl p-6 backdrop-blur-md hover:border-cyan-400"
              variants={variants}
              initial="hidden"
              animate="visible"
              transition={{ delay: i * 0.1 }}
              onClick={() => setSelectedCard(card)}
            >
              <div className="flex items-center mb-4 text-cyan-400">
                <img src={card.icon} alt="icon" className="w-8 h-8 mr-3 rounded-md" />
                <h3 className="text-xl font-bold">{card.title}</h3>
              </div>
              <p className="text-gray-300">{card.text}</p>
            </motion.div>
          ))}
        </div>

        {selectedCard && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center px-4">
            <div className="bg-gray-800 rounded-xl max-w-2xl w-full p-8 relative border border-cyan-500">
              <button
                onClick={() => setSelectedCard(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl"
              >&times;</button>
              <div className="flex items-center mb-6">
                <img src={selectedCard.icon} alt="icon" className="w-10 h-10 mr-4 rounded-md" />
                <h3 className="text-2xl font-bold text-white">{selectedCard.title}</h3>
              </div>
              <p className="text-gray-300 text-lg leading-relaxed">{selectedCard.details}</p>
            </div>
          </div>
        )}

        {/* Wallet & Swap Forms */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto text-left mt-32">
          <div className="bg-gray-800 p-6 rounded-xl border border-cyan-500/20">
            <h4 className="text-white text-xl font-semibold mb-4">Connect Avalanche Wallet</h4>
            <input type="text" placeholder="0x..." className="w-full p-3 rounded bg-gray-900 text-white border border-gray-700" />
            <p className="text-gray-400 text-sm mt-2">Paste your Avalanche-compatible address here.</p>
            <button className="mt-4 w-full py-2 px-4 bg-cyan-600 text-white rounded hover:bg-cyan-500">Connect</button>
          </div>

          <div className="bg-gray-800 p-6 rounded-xl border border-cyan-500/20">
            <h4 className="text-white text-xl font-semibold mb-4">Deposit JEWELS</h4>
            <input type="number" placeholder="Amount in USDT" className="w-full p-3 rounded bg-gray-900 text-white border border-gray-700" />
            <select className="w-full mt-3 p-3 rounded bg-gray-900 text-white border border-gray-700">
              <option>Choose Network</option>
              <option>Avalanche</option>
              <option>Polygon</option>
            </select>
            <button className="mt-4 w-full py-2 px-4 bg-green-600 text-white rounded hover:bg-green-500">Deposit</button>
          </div>

          <div className="bg-gray-800 p-6 rounded-xl border border-cyan-500/20">
            <h4 className="text-white text-xl font-semibold mb-4">Withdraw & Swap</h4>
            <input type="number" placeholder="Amount to Withdraw" className="w-full p-3 rounded bg-gray-900 text-white border border-gray-700" />
            <select className="w-full mt-3 p-3 rounded bg-gray-900 text-white border border-gray-700">
              <option>Select Target Token</option>
              <option>USDT</option>
              <option>FDMT</option>
              <option>JSIT</option>
            </select>
            <button className="mt-4 w-full py-2 px-4 bg-yellow-600 text-white rounded hover:bg-yellow-500">Swap & Withdraw</button>
          </div>
        </div>

        {/* Section: Crypto Usage */}
        <div className="mt-32 max-w-4xl mx-auto text-left">
          <h3 className="text-3xl font-bold text-white mb-4">How Swytch Uses Crypto</h3>
          <p className="text-gray-300 mb-4">
            In Swytch, cryptocurrency isn’t hype — it’s your tool of transformation. Your JEWELS are time-earned, energy-bound tokens. They can be deposited for yield, swapped for value, and used for unlocking ecosystem features, quests, or even converted to stablecoin.
          </p>
          <ul className="list-disc list-inside text-gray-400">
            <li>No gas fees inside the app</li>
            <li>Withdraw directly to stablecoin via smart contracts</li>
            <li>Track your vault via the Trust HUD</li>
            <li>Every action is ledger-traced — visible, but private</li>
          </ul>
        </div>

        {/* Section: Email → Wallet → Energy Modal */}
        <div className="mt-32 max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold text-white mb-6">Begin Your Journey</h3>
          <p className="text-gray-300 mb-4">Click below to understand how to enter the Swytch ecosystem in three easy steps.</p>
          <button onClick={() => setShowStepsModal(true)} className="bg-cyan-600 px-6 py-3 text-white rounded hover:bg-cyan-500">Learn the Steps</button>
        </div>

        {showStepsModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center px-4">
            <div className="bg-gray-800 rounded-xl max-w-lg w-full p-8 relative border border-cyan-500">
              <button
                onClick={() => setShowStepsModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl"
              >&times;</button>
              <h3 className="text-2xl font-bold text-white mb-4">Your Swytch Initiation</h3>
              <ol className="list-decimal list-inside text-gray-300 space-y-3">
                <li><strong>Connect Email:</strong> Register with a verified email address to start your onboarding.</li>
                <li><strong>Mint Wallet:</strong> Automatically generate your self-sovereign wallet — no keys, no downloads, just encrypted access.</li>
                <li><strong>Earn Energy:</strong> Use that wallet to earn, deposit, and unlock real-world utility from the ecosystem.</li>
              </ol>
            </div>
          </div>
        )}
      </motion.div>
    </section>
  );
};

export default EnergyTrustInfo;
