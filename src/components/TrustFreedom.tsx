import { FC } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';

const sectionVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut', type: 'spring', stiffness: 80 } }
};
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};

const TrustFreedom: FC = () => {
  return (
    <motion.div
      variants={sectionVariants}
      className="relative bg-gray-900/50 backdrop-blur-lg rounded-3xl p-12 border border-pink-500/30 shadow-2xl hover:shadow-pink-500/40 transition-all"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-cyan-500/10 rounded-3xl" />
      <div className="relative flex flex-col lg:flex-row items-center gap-12">
        <div className="lg:w-1/2 space-y-6">
          <h3 className="text-4xl font-extrabold text-white flex items-center gap-4 font-poppins">
            <ShieldCheck className="w-10 h-10 text-rose-400 animate-pulse" /> Freedom as a PET
          </h3>
          <p className="text-lg text-gray-300 leading-relaxed font-inter">
            As a Private Ministerial Association (PMA), Swytch shields PETs from external interference, empowering you as an income beneficiary with JEWELS and SWYT rewards.
          </p>
          <motion.div variants={fadeUp}>
            <svg viewBox="0 0 600 400" className="w-full h-auto">
              <defs>
                <linearGradient id="trustGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#ec4899', stopOpacity: 0.8 }} />
                  <stop offset="100%" style={{ stopColor: '#22d3ee', stopOpacity: 0.8 }} />
                </linearGradient>
              </defs>
              <rect x="0" y="0" width="600" height="400" fill="url(#trustGradient)" opacity="0.1" rx="20" />
              <circle cx="300" cy="200" r="100" fill="none" stroke="#ec4899" strokeWidth="4" />
              <text x="300" y="200" textAnchor="middle" fill="#fff" fontSize="20" fontWeight="bold">Trust Rewards</text>
              <g transform="translate(100 50)">
                <rect width="100" height="60" fill="#22d3ee" opacity="0.4" rx="10" />
                <text x="50" y="35" textAnchor="middle" fill="#fff" fontSize="14">NFTs</text>
              </g>
              <g transform="translate(400 50)">
                <rect width="100" height="60" fill="#ec4899" opacity="0.4" rx="10" />
                <text x="50" y="35" textAnchor="middle" fill="#fff" fontSize="14">Yield</text>
              </g>
              <g transform="translate(100 290)">
                <rect width="100" height="60" fill="#ec4899" opacity="0.4" rx="10" />
                <text x="50" y="35" textAnchor="middle" fill="#fff" fontSize="14">Voting</text>
              </g>
              <g transform="translate(400 290)">
                <rect width="100" height="60" fill="#22d3ee" opacity="0.4" rx="10" />
                <text x="50" y="35" textAnchor="middle" fill="#fff" fontSize="14">Assets</text>
              </g>
            </svg>
            <p className="text-sm text-gray-400 mt-2 font-inter">Diagram: Trust rewards via NFTs, yield, voting, and assets.</p>
          </motion.div>
        </div>
        <div className="lg:w-1/2 bg-gray-800/50 p-8 rounded-2xl shadow-xl border border-rose-500/20 hover:scale-105 transition-transform duration-300">
          <p className="text-lg text-gray-200 italic font-inter">“As a PET, you shape your financial destiny with Energy and Trust.”</p>
        </div>
      </div>
    </motion.div>
  );
};

export default TrustFreedom;