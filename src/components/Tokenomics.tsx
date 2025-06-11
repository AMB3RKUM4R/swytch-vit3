import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import React from 'react';

const Tokenomics = () => {
  const variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  const tokenData = [
    {
      icon: '/icon_energy.gif',
      title: 'JEWELS = Energy',
      description:
        'JEWELS are earned through deposits, education, and engagement. They act as proof-of-purpose and can be used across the Swytch ecosystem.'
    },
    {
      icon: '/icon_swap.gif',
      title: 'Stable Conversion Rates',
      description:
        'JSIT, FDMT, and SWYT tokens are each pegged at $1. This removes volatility and makes the platform accessible to all participants regardless of crypto literacy.'
    },
    {
      icon: '/icon_reward.gif',
      title: 'Yield Up to 3.3% Monthly',
      description:
        'Based on your PET level and participation, earn up to 3.3% monthly yield on deposited energy, no staking or lock-ups required.'
    },
    {
      icon: '/icon_learning.gif',
      title: 'Knowledge Unlocks Value',
      description:
        'Complete educational quests in the Raziel Library to increase your yield tier. Proof-of-learning becomes proof-of-stake.'
    },
    {
      icon: '/icon_privacy.gif',
      title: 'Zero Custody. Full Sovereignty.',
      description:
        'Swytch never holds your funds. Smart contracts distribute rewards transparently. Your keys, your vault, your energy.'
    },
    {
      icon: '/icon_nft.gif',
      title: 'Identity as Utility',
      description:
        'Your PET identity is minted on-chain. It reflects your level, contributions, and unlocks narrative perks and game progression.'
    },
    {
      icon: '/icon_vault.gif',
      title: 'Energy Vaults',
      description:
        'Every user has a private PET Vault — a smart contract-based yield hub that tracks, grows, and secures your Energy.'
    },
    {
      icon: '/icon_decentralized.gif',
      title: 'Decentralized Economics',
      description:
        'No central authority. Every transaction, swap, and yield payout is governed by immutable smart contracts.'
    },
    {
      icon: '/icon_equalizer.gif',
      title: 'Crypto for the Rest of Us',
      description:
        'No whales. No paywalls. Energy rewards are based on merit and intent. Swytch redefines wealth by what you give — not what you hold.'
    },
    {
      icon: '/icon_freedom.gif',
      title: 'Energy as Freedom',
      description:
        'Each action you take — play, learn, share — emits Energy. And Energy is exchangeable for mission access, assets, or off-platform value.'
    }
  ];

  const pieData = [
    { name: 'JEWELS Rewards Pool', value: 40 },
    { name: 'Platform Growth & Development', value: 35 },
    { name: 'Educational Incentives', value: 25 },
  ];

  const COLORS = ['#00FFFF', '#38BDF8', '#6366F1'];

  const barData = [
    { name: '2020', value: 159 },
    { name: '2021', value: 180 },
    { name: '2022', value: 198 },
    { name: '2023', value: 229 },
    { name: '2024', value: 265 },
  ];

  const faqs = [
    {
      question: 'How are JEWELS different from normal crypto tokens?',
      answer: 'JEWELS are purpose-bound. They are earned through action and engagement, not speculation, and carry utility inside and outside the ecosystem.'
    },
    {
      question: 'What is the monthly reward rate?',
      answer: 'Rewards range from 1% to 3.3% monthly depending on your PET level and participation.'
    },
    {
      question: 'Do I need to stake tokens to earn?',
      answer: 'No staking or lockups. Your rewards are based on deposits, learning, and game engagement.'
    },
    {
      question: 'Is Swytch tokenomics legally compliant?',
      answer: 'Yes. The economic model is based on a PMA and operates under private trust law, outside of public investment classifications.'
    },
  ];

  const earningsYearly = 100 * (1 + 0.033) ** 12;

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black to-gray-900 text-center overflow-hidden">
      <motion.div className="max-w-6xl mx-auto" variants={variants} initial="hidden" animate="visible">
        <h2 className="text-5xl font-extrabold text-cyan-400 mb-8">Swytch Tokenomics</h2>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-12">
          The Swytch economic model is not speculative — it's sustainable. Powered by purpose and verified by smart contracts, you earn because you contribute.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 text-left mb-20">
          {tokenData.map((token, i) => (
            <motion.div key={i} className="bg-gray-900/50 border border-cyan-500/20 rounded-xl p-6 backdrop-blur-md" variants={variants} initial="hidden" animate="visible" transition={{ delay: i * 0.1 }}>
              <div className="flex items-center mb-4 text-cyan-400">
                <img src={token.icon} alt="icon" className="w-8 h-8 mr-3 rounded-md" />
                <h3 className="text-xl font-bold">{token.title}</h3>
              </div>
              <p className="text-gray-300">{token.description}</p>
            </motion.div>
          ))}
        </div>

        <h3 className="text-3xl text-white font-bold mb-6">Token Allocation Breakdown</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} fill="#8884d8" dataKey="value" label>
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <h3 className="text-3xl text-white font-bold mt-16 mb-6">Global Gaming Industry Growth ($B)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barData}>
            <XAxis dataKey="name" stroke="#ccc" />
            <YAxis stroke="#ccc" />
            <Tooltip wrapperStyle={{ backgroundColor: '#000', color: '#fff' }} />
            <Bar dataKey="value" fill="#00FFFF" barSize={40} />
          </BarChart>
        </ResponsiveContainer>

        <h3 className="text-3xl text-white font-bold mt-20 mb-8">Real Users. Real Impact.</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          <div className="bg-gray-800 p-6 rounded-xl border border-cyan-500/10 text-left">
            <p className="text-gray-200 italic mb-2">"I earned more in 6 months playing Swytch games and completing educational quests than 2 years of holding crypto elsewhere."</p>
            <p className="text-cyan-400 font-bold">— Nina from Austin, TX</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-xl border border-cyan-500/10 text-left">
            <p className="text-gray-200 italic mb-2">"What Swytch taught me about energy and sovereignty changed my financial reality. It’s not just crypto — it’s consciousness as currency."</p>
            <p className="text-cyan-400 font-bold">— Ravi from Mumbai</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-xl border border-cyan-500/10 text-left">
            <p className="text-gray-200 italic mb-2">"This ecosystem helped me move from being a spectator to an earner in Web3. And it felt safe — for once."</p>
            <p className="text-cyan-400 font-bold">— Julia from Berlin</p>
          </div>
        </div>

        <h3 className="text-3xl text-white font-bold mt-20 mb-8">Tokenomics FAQ</h3>
        <div className="text-left max-w-3xl mx-auto space-y-6">
          {faqs.map((faq, i) => (
            <div key={i}>
              <h4 className="text-lg text-cyan-300 font-semibold">Q: {faq.question}</h4>
              <p className="text-gray-300">A: {faq.answer}</p>
            </div>
          ))}
        </div>

        <h3 className="text-3xl text-white font-bold mt-20 mb-6">📢 Become a Swytch Backer</h3>
        <p className="text-gray-400 max-w-2xl mx-auto mb-8">
          Support the future of decentralized energy trust. Scan the QR code with your wallet app and donate any amount of crypto to gain early supporter benefits.
        </p>
        <img src="/qr_donation.png" alt="Donate to Swytch" className="mx-auto w-40 h-40 rounded-lg border border-cyan-500/30 mb-10" />

        <form className="bg-gray-800 p-6 max-w-xl mx-auto rounded-xl border border-cyan-500/10 text-left space-y-4">
          <h4 className="text-cyan-400 font-bold text-xl mb-2">Start Investing with Your Wallet</h4>
          <input type="text" placeholder="Your Wallet Address" className="w-full p-3 bg-gray-900 text-white rounded-md border border-cyan-500/20" />
          <input type="number" placeholder="Amount in USDT" className="w-full p-3 bg-gray-900 text-white rounded-md border border-cyan-500/20" />
          <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg">Submit Investment Intent</button>
        </form>

        <div className="mt-16 text-white text-lg">
          <p>If you deposit <span className="text-cyan-400 font-semibold">$100</span> and earn <span className="text-cyan-400 font-semibold">3.3%</span> monthly...</p>
          <p className="mt-2 text-2xl font-bold text-cyan-300">You will have ≈ ${earningsYearly.toFixed(2)} by the end of the year!</p>
        </div>

        <p className="mt-20 text-cyan-300 italic text-sm max-w-xl mx-auto">
          Note: Token usage and economic design follow PMA principles and decentralized trust enforcement. Always self-custody. Always opt-in.
        </p>
      </motion.div>
    </section>
  );
};

export default Tokenomics;
