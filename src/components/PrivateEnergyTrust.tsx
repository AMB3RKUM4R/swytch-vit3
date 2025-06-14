import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { ArrowRight, ShieldCheck, ShoppingCart, Users, X, Sparkles, Trophy, Wallet, Globe } from 'lucide-react';

const nftImages = [
  "/nfts/nft.jpg",
  "/nfts/nft2.jpg",
  "/nfts/nft3.jpg",
  "/nfts/nft4.jpg",
  "/nfts/nft5.jpg",
  "/nfts/nft6.jpg",
  "/nfts/nft7.jpg",
  "/nfts/nft8.jpg",
  "/nfts/nft9.jpg",
  "/nfts/nft10.jpg",
  "/nfts/nft11.jpg",
  "/nfts/nft12.jpg",
];

const nftItems = nftImages.map((img, i) => ({
  id: i + 1,
  img,
  title: `NFT #${i + 1}`,
  price: `$${(20 + i * 3).toFixed(2)}`,
}));

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
  animate: { x: ['0%', '-50%'], transition: { x: { repeat: Infinity, repeatType: 'loop', duration: 30, ease: 'linear' } } }
};

const PrivateEnergyTrust = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPaypalModal, setShowPaypalModal] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const scrollRef = useRef<HTMLDivElement>(null);

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

  // Parallax effect for background
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const recentPurchases = Array.from({ length: 5 }).map((_, i) => ({
    avatar: `/avatars/avatar${(i % 3) + 1}.png`,
    address: `0x${Math.random().toString(16).slice(2, 8)}...${Math.random().toString(16).slice(2, 8)}`,
    amount: `$${(20 + i * 10).toFixed(2)}`
  }));

  return (
    <section className="relative py-32 px-6 sm:px-8 lg:px-24 bg-gradient-to-br from-gray-950 via-indigo-950 to-black text-white overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,255,255,0.08)_0%,_transparent_70%)] pointer-events-none" />

      <motion.div
        className="max-w-7xl mx-auto space-y-32"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Hero Section with Parallax */}
        <motion.div
          variants={sectionVariants}
          className="relative bg-gray-900/50 backdrop-blur-lg rounded-3xl p-12 text-center border border-cyan-500/30 shadow-2xl hover:shadow-cyan-500/40 transition-all"
          style={{
            backgroundImage: `url(/bg (59).jpg)`,
            backgroundSize: 'cover',
            backgroundPosition: `${50 + mousePosition.x * 5}% ${50 + mousePosition.y * 5}%`
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-800/50 to-blue-900/50 rounded-3xl" />
          <div className="relative">
            <h2 className="text-4xl sm:text-6xl font-extrabold text-cyan-400 mb-6 tracking-tight flex items-center justify-center gap-4">
              <Sparkles className="w-12 h-12 animate-pulse" /> Etch Your Legacy
            </h2>
            <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed">
              Swytch is the world’s first gamified Private Energy Trust, blending capital appreciation, crypto yield, NFT rewards, and DAO governance in a member-owned ecosystem.
            </p>
            <a
              href="#join"
              className="inline-flex items-center px-8 py-4 bg-cyan-600 text-white hover:bg-cyan-700 rounded-full text-lg font-semibold group"
            >
              Become a PET
              <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform duration-200" />
            </a>
          </div>
        </motion.div>

        {/* Freedom Section */}
        <motion.div
          variants={sectionVariants}
          className="relative bg-gray-900/50 backdrop-blur-lg rounded-3xl p-12 border border-teal-500/30 shadow-2xl hover:shadow-teal-500/40 transition-all"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-green-500/10 rounded-3xl" />
          <div className="relative flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2 space-y-6">
              <h3 className="text-4xl font-extrabold text-white flex items-center gap-4">
                <ShieldCheck className="w-10 h-10 text-teal-400 animate-pulse" /> Freedom Redefined
              </h3>
              <p className="text-lg text-gray-300 leading-relaxed">
                Swytch operates as a Private Ministerial Association (PMA), shielding members from city, state, or federal interference. As an income beneficiary, you’re not a customer—you’re empowered.
              </p>
              <button
                onClick={() => setShowPaypalModal(true)}
                className="inline-flex items-center px-6 py-3 bg-teal-600 text-white hover:bg-teal-700 rounded-lg font-semibold group"
              >
                Live Free
                <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-2 transition-transform duration-200" />
              </button>
            </div>
            <div className="lg:w-1/2 bg-gray-800/50 p-8 rounded-2xl shadow-xl border border-teal-500/20 hover:scale-105 transition-transform duration-300">
              <p className="text-lg text-gray-200 italic">Your freedom, your legacy—Swytch protects both.</p>
            </div>
          </div>
        </motion.div>

        {/* Featured NFTs Section */}
        <motion.div
          variants={sectionVariants}
          className="space-y-8"
        >
          <h2 className="text-4xl font-extrabold text-white text-center flex items-center justify-center gap-4">
            <Trophy className="w-10 h-10 text-cyan-400 animate-pulse" /> Featured NFTs
          </h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto text-center">
            Unlock exclusive digital assets that amplify your presence in the Petaverse. Each NFT is a badge of your Energy and influence.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {nftItems.slice(0, 3).map((nft) => (
              <motion.div
                key={nft.id}
                className="bg-gray-900/60 rounded-xl p-6 border border-cyan-500/20 shadow-xl hover:shadow-cyan-500/30 transition-all"
                whileHover={{ scale: 1.05, y: -10 }}
              >
                <img src={nft.img} alt={nft.title} className="w-full h-48 object-cover rounded-lg mb-4" />
                <h4 className="text-xl font-semibold text-cyan-300 mb-2">{nft.title}</h4>
                <p className="text-gray-200 mb-4">Price: {nft.price}</p>
                <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg w-full font-semibold">Buy Now</button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Infinite Scrolling NFT Grid */}
        <motion.div
          variants={sectionVariants}
          className="space-y-8"
        >
          <h2 className="text-4xl font-extrabold text-white text-center flex items-center justify-center gap-4">
            <ShoppingCart className="w-10 h-10 text-teal-400 animate-pulse" /> Explore More NFTs
          </h2>
          <div className="relative overflow-hidden">
            <motion.div
              ref={scrollRef}
              className="flex gap-6"
              variants={infiniteScroll}
              animate="animate"
            >
              {[...nftItems, ...nftItems].map((nft, i) => (
                <motion.div
                  key={`${nft.id}-${i}`}
                  className="flex-shrink-0 w-[240px] bg-gray-900/60 rounded-xl p-4 border border-teal-500/20 shadow-xl hover:shadow-teal-500/30 transition-all"
                  whileHover={{ scale: 1.05, y: -10 }}
                >
                  <img src={nft.img} alt={nft.title} className="w-full h-40 object-cover rounded-lg mb-4" />
                  <h4 className="text-lg font-semibold text-teal-300 mb-2">{nft.title}</h4>
                  <p className="text-gray-200 mb-3">Price: {nft.price}</p>
                  <button className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-2 rounded-lg w-full font-semibold">Buy Now</button>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Community Section */}
        <motion.div
          variants={sectionVariants}
          className="relative bg-gray-900/50 backdrop-blur-lg rounded-3xl p-12 border border-purple-500/30 shadow-2xl hover:shadow-purple-500/40 transition-all"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-3xl" />
          <div className="relative flex flex-col lg:flex-row-reverse items-center gap-12">
            <div className="lg:w-1/2 space-y-6">
              <h3 className="text-4xl font-extrabold text-white flex items-center gap-4">
                <Users className="w-10 h-10 text-purple-400 animate-pulse" /> Build with PETs
              </h3>
              <p className="text-lg text-gray-300 leading-relaxed">
                Join the Community Panel, a hierarchy-free digital society where PETs vote, propose, and earn reputation. Guided by NPCs, we foster trust and collaboration.
              </p>
              <button
                onClick={() => setShowAuthModal(true)}
                className="inline-flex items-center px-6 py-3 bg-purple-600 text-white hover:bg-purple-700 rounded-lg font-semibold group"
              >
                Connect with PETs
                <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-2 transition-transform duration-200" />
              </button>
            </div>
            <div className="lg:w-1/2 bg-gray-800/50 p-8 rounded-2xl shadow-xl border border-purple-500/20 hover:scale-105 transition-transform duration-300">
              <p className="text-lg text-gray-200 italic">Together, we shape the Petaverse with trust, not contracts.</p>
            </div>
          </div>
        </motion.div>

        {/* Recent Purchases Section */}
        <motion.div
          variants={sectionVariants}
          className="space-y-8"
        >
          <h2 className="text-4xl font-extrabold text-white text-center flex items-center justify-center gap-4">
            <Wallet className="w-10 h-10 text-yellow-400 animate-pulse" /> Recent Purchases
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentPurchases.map((item, i) => (
              <motion.div
                key={i}
                className="bg-gray-900/60 p-4 rounded-lg flex items-center space-x-4 border border-yellow-500/20 shadow-xl hover:shadow-yellow-500/30 transition-all"
                whileHover={{ scale: 1.03 }}
              >
                <img src={item.avatar} alt="avatar" className="w-12 h-12 rounded-full border border-yellow-500/20" />
                <div>
                  <p className="text-yellow-300 font-semibold">{item.address}</p>
                  <p className="text-gray-200 text-sm">Paid: {item.amount}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Empty NFT Trade Box */}
        <motion.div
          variants={sectionVariants}
          className="relative bg-gray-900/50 backdrop-blur-lg rounded-3xl p-12 text-center border border-cyan-500/30 shadow-2xl hover:shadow-cyan-500/40 transition-all"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-3xl" />
          <div className="relative space-y-6">
            <ShoppingCart className="mx-auto text-cyan-400 w-12 h-12 mb-4 animate-bounce" />
            <h3 className="text-2xl font-bold text-white">No NFTs to Trade</h3>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Ready to dive into the Petaverse? Purchase your first NFT and start building your legacy.
            </p>
            <button
              onClick={() => setShowPaypalModal(true)}
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Start Trading
            </button>
          </div>
        </motion.div>

        {/* Call-to-Action Section */}
        <motion.div
          variants={sectionVariants}
          className="text-center space-y-6"
        >
          <h2 className="text-4xl font-extrabold text-white flex items-center justify-center gap-4">
            <Globe className="w-10 h-10 text-pink-400 animate-pulse" /> Join the Petaverse
          </h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Become an income beneficiary of the Swytch Private Energy Trust. Stake your claim in a decentralized, gamified future where your Energy shapes the world.
          </p>
          <a
            href="#join"
            className="inline-flex items-center px-8 py-4 bg-pink-600 text-white hover:bg-pink-700 rounded-full text-lg font-semibold group"
          >
            Start Your Journey
            <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform duration-200" />
          </a>
        </motion.div>
      </motion.div>

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-gray-900 p-8 rounded-2xl shadow-2xl w-full max-w-md relative border border-cyan-500/20"
            >
              <button onClick={() => setShowAuthModal(false)} className="absolute top-4 right-4 text-white">
                <X className="w-6 h-6 hover:text-cyan-400" />
              </button>
              <h3 className="text-2xl font-bold text-cyan-400 mb-6 flex items-center gap-3">
                <Users className="w-6 h-6" /> Connect with PET
              </h3>
              <div className="grid gap-4">
                <input type="text" placeholder="Email" className="bg-gray-800 p-3 rounded-md text-white border border-gray-700 focus:border-cyan-500" />
                <input type="text" placeholder="Username" className="bg-gray-800 p-3 rounded-md text-white border border-gray-700 focus:border-cyan-500" />
                <button className="bg-cyan-600 hover:bg-cyan-700 p-3 rounded-md text-white font-semibold">Continue with Google</button>
                <button className="bg-blue-600 hover:bg-blue-700 p-3 rounded-md text-white font-semibold">Continue with Facebook</button>
                <button className="bg-green-600 hover:bg-green-700 p-3 rounded-md text-white font-semibold">Continue with Phone</button>
                <button className="bg-gray-700 hover:bg-gray-600 p-3 rounded-md text-white font-semibold">Continue Anonymously</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PayPal Modal */}
      <AnimatePresence>
        {showPaypalModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-gray-900 p-8 rounded-2xl shadow-2xl w-full max-w-md relative border border-teal-500/20"
            >
              <button onClick={() => setShowPaypalModal(false)} className="absolute top-4 right-4 text-white">
                <X className="w-6 h-6 hover:text-teal-400" />
              </button>
              <h3 className="text-2xl font-bold text-teal-400 mb-6 flex items-center gap-3">
                <ShoppingCart className="w-6 h-6" /> Donate with PayPal
              </h3>
              <form className="grid gap-4">
                <input type="text" placeholder="Your Name" className="bg-gray-800 p-3 rounded-md text-white border border-gray-700 focus:border-teal-500" />
                <input type="email" placeholder="Your Email" className="bg-gray-800 p-3 rounded-md text-white border border-gray-700 focus:border-teal-500" />
                <input type="number" placeholder="Amount in USD" className="bg-gray-800 p-3 rounded-md text-white border border-gray-700 focus:border-teal-500" />
                <button className="bg-teal-600 hover:bg-teal-700 p-3 rounded-md text-white font-semibold">Proceed to Payment</button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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

export default PrivateEnergyTrust;