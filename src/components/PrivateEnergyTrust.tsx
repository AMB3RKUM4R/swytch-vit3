import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { ArrowRight, ShieldCheck, ShoppingCart, Users, X, Sparkles, Trophy, Wallet, Globe } from 'lucide-react';

const nftImages = [
  "/nfts/nft.jpg", "/nfts/nft2.jpg", "/nfts/nft3.jpg", "/nfts/nft4.jpg",
  "/nfts/nft5.jpg", "/nfts/nft6.jpg", "/nfts/nft7.jpg", "/nfts/nft8.jpg",
  "/nfts/nft9.jpg", "/nfts/nft10.jpg", "/nfts/nft11.jpg", "/nfts/nft12.jpg"
];

const nftItems = nftImages.map((img, i) => ({
  id: i + 1,
  img,
  title: `PET Artifact #${i + 1}`,
  price: `${(20 + i * 3).toFixed(2)} USDT`,
  energyBoost: `+${10 + i * 5}% Energy Yield`
}));

// Animation variants
const sectionVariants = { hidden: { opacity: 0, y: 50, scale: 0.95 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut', type: 'spring', stiffness: 80 } } };
const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.3 } } };
const infiniteScroll = { animate: { x: ['0%', '-50%'], transition: { x: { repeat: Infinity, repeatType: 'loop', duration: 30, ease: 'linear' } } } };
const dustVariants = { animate: { scale: [1, 1.2, 1], opacity: [0.6, 0.8, 0.6], transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' } } };
const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } } };

interface ModalProps { title: string; content: string; onClose: () => void; }

const Modal = ({ title, content, onClose }: ModalProps) => {
  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (modalRef.current) {
      modalRef.current.focus();
      const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <motion.div
        ref={modalRef}
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
        className="bg-gray-900 p-8 rounded-2xl max-w-md w-full border border-rose-500/20 shadow-2xl backdrop-blur-md"
        tabIndex={-1}
      >
        <motion.button
          className="absolute top-4 right-4 text-rose-400 hover:text-red-500"
          onClick={onClose}
          whileHover={{ rotate: 90 }}
          aria-label="Close modal"
        >
          <X className="w-6 h-6" />
        </motion.button>
        <h3 className="text-2xl font-bold text-rose-400 mb-4 flex items-center gap-2">
          <Sparkles className="w-6 h-6 animate-pulse" /> {title}
        </h3>
        <p className="text-gray-300 mb-6">{content}</p>
        <button
          onClick={onClose}
          className="px-6 py-3 rounded-full bg-rose-600 text-white hover:bg-rose-700 transition-all"
        >
          Close
        </button>
      </motion.div>
    </motion.div>
  );
};

const PrivateEnergyTrust: React.FC = () => {
  const [showModal, setShowModal] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const scrollRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const recentPurchases = Array.from({ length: 5 }).map((_, i) => ({
    avatar: `/avatars/avatar${(i % 3) + 1}.png`,
    address: `0x${Math.random().toString(16).slice(2, 8)}...${Math.random().toString(16).slice(2, 8)}`,
    amount: `${(20 + i * 10).toFixed(2)} USDT`
  }));

  return (
    <section className="relative py-32 px-6 sm:px-8 lg:px-24 bg-gradient-to-br from-purple-950 via-black-950/20 to-black text-gray-100 overflow-hidden">
      <motion.div className="fixed inset-0 pointer-events-none z-10">
        <motion.div
          className="absolute w-96 h-96 bg-gradient-to-br from-rose-400/50 via-pink-500/40 to-cyan-500/30 rounded-full opacity-30 blur-3xl"
          variants={dustVariants}
          animate="animate"
          style={{ top: `${mousePosition.y - 192}px`, left: `${mousePosition.x - 192}px` }}
        />
        <motion.div
          className="absolute w-64 h-64 bg-gradient-to-br from-cyan-400/40 via-rose-500/30 to-pink-400/20 rounded-full opacity-20 blur-2xl"
          variants={dustVariants}
          animate="animate"
          style={{ top: `${mousePosition.y - 128}px`, left: `${mousePosition.x - 128}px` }}
        />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-15" />
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full"
            style={{
              top: `${mousePosition.y - 50 + Math.random() * 100}px`,
              left: `${mousePosition.x - 50 + Math.random() * 100}px`,
              backgroundColor: i % 2 === 0 ? 'rgba(236, 72, 153, 0.5)' : 'rgba(34, 211, 238, 0.5)'
            }}
            variants={dustVariants}
            animate="animate"
          />
        ))}
      </motion.div>

      <motion.div className="relative z-20 max-w-7xl mx-auto space-y-32" variants={containerVariants} initial="hidden" animate="visible">
        <motion.div variants={sectionVariants} className="relative bg-gray-900/50 backdrop-blur-lg rounded-3xl p-12 text-center border border-rose-500/30 shadow-2xl hover:shadow-rose-500/40 transition-all">
          <div className="absolute inset-0 bg-gradient-to-r from-rose-800/50 to-pink-900/50 rounded-3xl" />
          <div className="relative">
            <h2 className="text-4xl sm:text-6xl font-extrabold text-rose-400 mb-6 tracking-tight flex items-center justify-center gap-4">
              <Sparkles className="w-12 h-12 animate-pulse" /> Swytch Private Energy Trust
            </h2>
            <p className="text-xl sm:text-2xl text-gray-200 max-w-3xl mx-auto mb-8 leading-relaxed">
              A gamified ecosystem blending NFT rewards, crypto yield, and DAO governance, owned by PETs for a decentralized future.
            </p>
            <motion.button
              className="inline-flex items-center px-8 py-4 bg-rose-600 text-white hover:bg-rose-700 rounded-full text-lg font-semibold group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowModal('Join PETverse')}
              aria-label="Become a PET"
            >
              Become a PET
              <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform duration-200" />
            </motion.button>
          </div>
        </motion.div>

        <motion.div variants={sectionVariants} className="relative bg-gray-900/50 backdrop-blur-lg rounded-3xl p-12 border border-pink-500/30 shadow-2xl hover:shadow-pink-500/40 transition-all">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-cyan-500/10 rounded-3xl" />
          <div className="relative flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2 space-y-6">
              <h3 className="text-4xl font-extrabold text-white flex items-center gap-4">
                <ShieldCheck className="w-10 h-10 text-rose-400 animate-pulse" /> Freedom as a PET
              </h3>
              <p className="text-lg text-gray-300 leading-relaxed">
                As a Private Ministerial Association (PMA), Swytch shields PETs from external interference, empowering you as an income beneficiary.
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
                <p className="text-sm text-gray-400 mt-2">Diagram: Trust rewards via NFTs, yield, voting, and assets.</p>
              </motion.div>
            </div>
            <div className="lg:w-1/2 bg-gray-800/50 p-8 rounded-2xl shadow-xl border border-rose-500/20 hover:scale-105 transition-transform duration-300">
              <p className="text-lg text-gray-200 italic">“As a PET, you shape your financial destiny.”</p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={sectionVariants} className="space-y-8">
          <h2 className="text-4xl font-extrabold text-white text-center flex items-center justify-center gap-4">
            <Trophy className="w-10 h-10 text-rose-400 animate-pulse" /> Featured PET Artifacts
          </h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto text-center">
            Collect PET Artifacts to boost your Energy yield and influence in the PETverse.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {nftItems.slice(0, 3).map((nft) => (
              <motion.div
                key={nft.id}
                className="bg-gray-900/60 rounded-xl p-6 border border-rose-500/20 shadow-xl hover:shadow-rose-500/30 transition-all"
                whileHover={{ scale: 1.05, y: -10 }}
              >
                <img src={nft.img} alt={nft.title} className="w-full h-48 object-cover rounded-lg mb-4" />
                <h4 className="text-xl font-semibold text-rose-300 mb-2">{nft.title}</h4>
                <p className="text-gray-200 mb-2">Price: {nft.price}</p>
                <p className="text-gray-200 mb-4">Boost: {nft.energyBoost}</p>
                <button
                  className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg w-full font-semibold"
                  onClick={() => setShowModal(`Purchase ${nft.title}`)}
                >
                  Buy Now
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={sectionVariants} className="space-y-8">
          <h2 className="text-4xl font-extrabold text-white text-center flex items-center justify-center gap-4">
            <ShoppingCart className="w-10 h-10 text-pink-400 animate-pulse" /> Explore PET Artifacts
          </h2>
          <div className="relative overflow-hidden">
            <motion.div
              ref={scrollRef}
              className="flex gap-6 no-scrollbar"
              variants={infiniteScroll}
              animate="animate"
            >
              {[...nftItems, ...nftItems].map((nft, i) => (
                <motion.div
                  key={`${nft.id}-${i}`}
                  className="flex-shrink-0 w-[240px] bg-gray-900/60 rounded-xl p-4 border border-pink-500/20 shadow-xl hover:shadow-pink-500/30 transition-all"
                  whileHover={{ scale: 1.05, y: -10 }}
                >
                  <img src={nft.img} alt={nft.title} className="w-full h-40 object-cover rounded-lg mb-4" />
                  <h4 className="text-lg font-semibold text-pink-300 mb-2">{nft.title}</h4>
                  <p className="text-gray-200 mb-2">Price: {nft.price}</p>
                  <p className="text-gray-200 mb-3">Boost: {nft.energyBoost}</p>
                  <button
                    className="bg-pink-600 hover:bg-pink-700 text-white px-3 py-2 rounded-lg w-full font-semibold"
                    onClick={() => setShowModal(`Purchase ${nft.title}`)}
                  >
                    Buy Now
                  </button>
                </motion.div>
              ))}
            </motion.div>
          </div>
          <motion.div variants={fadeUp} className="max-w-3xl mx-auto">
            <svg viewBox="0 0 600 400" className="w-full h-auto">
              <defs>
                <linearGradient id="nftGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#ec4899', stopOpacity: 0.8 }} />
                  <stop offset="100%" style={{ stopColor: '#22d3ee', stopOpacity: 0.8 }} />
                </linearGradient>
              </defs>
              <rect x="0" y="0" width="600" height="400" fill="url(#nftGradient)" opacity="0.1" rx="20" />
              <g>
                <rect x="50" y="50" width="100" height="60" fill="#ec4899" opacity="0.4" rx="10" />
                <text x="100" y="80" textAnchor="middle" fill="#fff" fontSize="14">Mint NFT</text>
                <path d="M150 80 L200 80" fill="none" stroke="#22d3ee" strokeWidth="2" markerEnd="url(#arrow)" />
                <rect x="200" y="50" width="100" height="60" fill="#22d3ee" opacity="0.4" rx="10" />
                <text x="250" y="80" textAnchor="middle" fill="#fff" fontSize="14">Trade</text>
                <path d="M300 80 L350 80" fill="none" stroke="#ec4899" strokeWidth="2" markerEnd="url(#arrow)" />
                <rect x="350" y="50" width="100" height="60" fill="#ec4899" opacity="0.4" rx="10" />
                <text x="400" y="80" textAnchor="middle" fill="#fff" fontSize="14">Hold</text>
                <path d="M450 80 L500 80" fill="none" stroke="#22d3ee" strokeWidth="2" markerEnd="url(#arrow)" />
                <rect x="500" y="50" width="100" height="60" fill="#22d3ee" opacity="0.4" rx="10" />
                <text x="550" y="80" textAnchor="middle" fill="#fff" fontSize="14">Boost</text>
              </g>
              <defs>
                <marker id="arrow" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
                  <path d="M0,0 L10,5 L0,10 Z" fill="#fff" />
                </marker>
              </defs>
            </svg>
            <p className="text-sm text-gray-400 mt-2">Diagram: NFT lifecycle from minting to boosting Energy.</p>
          </motion.div>
        </motion.div>

        <motion.div variants={sectionVariants} className="relative bg-gray-900/50 backdrop-blur-lg rounded-3xl p-12 border border-cyan-500/30 shadow-2xl hover:shadow-cyan-500/40 transition-all">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-rose-500/10 rounded-3xl" />
          <div className="relative flex flex-col lg:flex-row-reverse items-center gap-12">
            <div className="lg:w-1/2 space-y-6">
              <h3 className="text-4xl font-extrabold text-white flex items-center gap-4">
                <Users className="w-10 h-10 text-rose-400 animate-pulse" /> PET Community Panel
              </h3>
              <p className="text-lg text-gray-300 leading-relaxed">
                Join a hierarchy-free digital society to vote, propose, and earn reputation, guided by NPCs in the Community Panel.
              </p>
              <motion.div variants={fadeUp} className="max-w-3xl mx-auto">
                <svg viewBox="0 0 600 400" className="w-full h-auto">
                  <defs>
                    <linearGradient id="communityGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: '#ec4899', stopOpacity: 0.8 }} />
                      <stop offset="100%" style={{ stopColor: '#22d3ee', stopOpacity: 0.8 }} />
                    </linearGradient>
                  </defs>
                  <rect x="0" y="0" width="600" height="400" fill="url(#communityGradient)" opacity="0.1" rx="20" />
                  <circle cx="300" cy="200" r="100" fill="none" stroke="#ec4899" strokeWidth="4" />
                  <text x="300" y="200" textAnchor="middle" fill="#fff" fontSize="20" fontWeight="bold">Community Panel</text>
                  {['Voting', 'Proposals', 'Reputation', 'Quests'].map((item, i) => (
                    <g key={i} transform={`rotate(${i * 90} 300 200) translate(300 100)`}>
                      <circle r="40" fill="#22d3ee" opacity="0.3" />
                      <text textAnchor="middle" y="5" fill="#fff" fontSize="14">{item}</text>
                    </g>
                  ))}
                </svg>
                <p className="text-sm text-gray-400 mt-2">Diagram: Decentralized Community Panel for voting and reputation.</p>
              </motion.div>
              <button
                className="inline-flex items-center px-6 py-3 bg-rose-600 text-white hover:bg-rose-700 rounded-lg font-semibold group"
                onClick={() => setShowModal('Connect with PETs')}
              >
                Connect with PETs
                <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-2 transition-transform duration-200" />
              </button>
            </div>
            <div className="lg:w-1/2 bg-gray-800/50 p-8 rounded-2xl shadow-xl border border-rose-500/20 hover:scale-105 transition-transform duration-300">
              <p className="text-lg text-gray-200 italic">“Build the PETverse with trust, not contracts.”</p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={sectionVariants} className="space-y-8">
          <h2 className="text-4xl font-extrabold text-white text-center flex items-center justify-center gap-4">
            <Wallet className="w-10 h-10 text-pink-400 animate-pulse" /> Recent PET Purchases
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentPurchases.map((item, i) => (
              <motion.div
                key={i}
                className="bg-gray-900/60 p-4 rounded-lg flex items-center space-x-4 border border-pink-500/20 shadow-xl hover:shadow-pink-500/30 transition-all"
                whileHover={{ scale: 1.03 }}
              >
                <img src={item.avatar} alt="Avatar" className="w-12 h-12 rounded-full border border-pink-500/20" />
                <div>
                  <p className="text-pink-300 font-semibold">{item.address}</p>
                  <p className="text-gray-200 text-sm">Paid: {item.amount}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={sectionVariants} className="relative bg-gray-900/50 backdrop-blur-lg rounded-3xl p-12 text-center border border-rose-500/30 shadow-2xl hover:shadow-rose-500/40 transition-all">
          <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-pink-500/10 rounded-3xl" />
          <div className="relative space-y-6">
            <ShoppingCart className="mx-auto text-rose-400 w-12 h-12 mb-4 animate-bounce" />
            <h3 className="text-2xl font-bold text-white">No Artifacts to Trade?</h3>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Purchase your first PET Artifact to amplify your Energy in the PETverse.
            </p>
            <button
              className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 rounded-lg font-semibold"
              onClick={() => setShowModal('Start Trading')}
            >
              Start Trading
            </button>
          </div>
        </motion.div>

        <motion.div variants={sectionVariants} className="text-center space-y-6">
          <h2 className="text-4xl font-extrabold text-white flex items-center justify-center gap-4">
            <Globe className="w-10 h-10 text-rose-400 animate-pulse" /> Join the PETverse
          </h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Become a PET, stake your claim in a decentralized future, and let your Energy shape the PETverse.
          </p>
          <motion.button
            className="inline-flex items-center px-8 py-4 bg-rose-600 text-white hover:bg-rose-700 rounded-full text-lg font-semibold group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowModal('Join PETverse')}
            aria-label="Start Your Journey"
          >
            Start Your Journey
            <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform duration-200" />
          </motion.button>
        </motion.div>

        <AnimatePresence>
          {showModal === 'Join PETverse' && (
            <Modal
              title="Join the PETverse"
              content="Pay $10 USDT to become a PET, unlocking Swytch’s ecosystem with the Omertà: 'We honor Energy. We protect Truth. We uphold the Freedom to Earn.'"
              onClose={() => setShowModal(null)}
            />
          )}
          {showModal === 'Connect with PETs' && (
            <Modal
              title="Connect with PETs"
              content="Join the Community Panel to vote, propose, and earn reputation in a hierarchy-free digital society."
              onClose={() => setShowModal(null)}
            />
          )}
          {showModal === 'Start Trading' && (
            <Modal
              title="Start Trading"
              content="Purchase your first PET Artifact to boost your Energy yield and influence in the PETverse."
              onClose={() => setShowModal(null)}
            />
          )}
          {nftItems.map((nft) => (
            showModal === `Purchase ${nft.title}` && (
              <Modal
                key={nft.id}
                title={`Purchase ${nft.title}`}
                content={`Acquire ${nft.title} for ${nft.price} to gain ${nft.energyBoost}. Connect your wallet to proceed.`}
                onClose={() => setShowModal(null)}
              />
            )
          ))}
        </AnimatePresence>

        <style>{`
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          .blur-3xl { filter: blur(64px); }
          .blur-2xl { filter: blur(32px); }
          .bg-[url('/noise.png')] {
            background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAC3SURBVFhH7ZZBCsAgCER7/6W9WZoKUSO4ro0Q0v+UQKcZJnTf90EQBF3X9UIIh8Ph0Ov1er3RaDSi0WhEkiQpp9OJIAiC3nEcxyHLMgqCILlcLhFFUdTr9WK5XC6VSqVUKpVKqVRKpVJutxuNRqMhSRJpmkYkSVKpVCqVSqlUKqVSqZQqlaIoimI4HIZKpVJKpVJutxuNRqNRkiRJMk3TiCRJKpVKqVJKpVIplUqlVColSf4BQUzS2f8eAAAAAElFTkSuQmCC');
            background-repeat: repeat;
            background-size: 64px 64px;
          }
        `}</style>
      </motion.div>
    </section>
  );
};

export default PrivateEnergyTrust;