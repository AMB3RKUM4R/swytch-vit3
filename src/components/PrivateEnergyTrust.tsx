import { motion } from 'framer-motion';
import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, ShieldCheck, ShoppingCart, Users, X } from 'lucide-react';

const nftItems = Array.from({ length: 16 }).map((_, i) => ({
  id: i + 1,
  img: `/nfts/nft${(i % 5) + 1}.png`,
  title: `NFT #${i + 1}`,
  price: `$${(20 + i * 3).toFixed(2)}`,
}));

const PrivateEnergyTrust = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPaypalModal, setShowPaypalModal] = useState(false);
  const [scrollX, setScrollX] = useState(0);
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

  const sectionVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.8, ease: 'easeOut', type: 'spring', stiffness: 80 }
    },
  };

  const recentPurchases = Array.from({ length: 5 }).map((_, i) => ({
  avatar: `/avatars/avatar${(i % 3) + 1}.png`,
  address: `0x${Math.random().toString(16).slice(2, 8)}...${Math.random().toString(16).slice(2, 8)}`,
  amount: `$${(20 + i * 10).toFixed(2)}`,
}));
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  return (
    <section className="relative py-24 px-6 sm:px-8 lg:px-8 bg-gradient-to-b from-gray-900 to-black overflow-x-hidden">
      <motion.div
          className="mb-12 bg-gray-900/50 backdrop-blur-lg rounded-3xl text-center p-8 sm:p-12 border border-cyan-500/30 hover:border-cyan-400/60 shadow-lg shadow-cyan-500/10 transition-all duration-300 hover:scale-[1.02]"
          variants={sectionVariants}
          whileHover={{ scale: 1.02 }}
        >
          <h3 className="text-4xl sm:text-5xl font-extrabold text-cyan-400 mb-6 tracking-tight">
            Etch Your Legacy
          </h3>
          <p className="text-xl sm:text-2xl text-gray-300 max-w-4xl mx-auto mb-8 leading-relaxed">
            Swytch is the first gamified Private Energy Trust, combining capital appreciation, crypto yield, NFT rewards, and DAO power under one member-owned protocol.
          </p>
          <a
            href="#join"
            className="inline-flex items-center px-8 py-4 bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 hover:text-cyan-300 rounded-full text-lg font-semibold group"
          >
            Become a PET
            <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform duration-200" />
          </a>
        </motion.div>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,255,255,0.08)_0%,_transparent_70%)] pointer-events-none" />
          <motion.div
          className="mb-12 bg-gray-900/50 backdrop-blur-lg rounded-3xl p-8 sm:p-12 border border-cyan-500/30 hover:border-cyan-400/60 shadow-lg shadow-cyan-500/10 transition-all duration-300 hover:scale-[1.02]"
          variants={sectionVariants}
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-start space-x-6">
            <div className="p-4 bg-cyan-500/20 rounded-full glow-cyan">
              <ShieldCheck className="w-8 h-8 text-cyan-400" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-3xl font-extrabold text-white mb-3 tracking-tight">Freedom Redefined</h3>
              <p className="text-gray-300 text-lg sm:text-xl leading-relaxed">
                Swytch is structured under a Private Ministerial Association (PMA), removing all city/state/federal interference. You're not a customer — you're an income beneficiary.
              </p>
              <button
                onClick={() => setShowPaypalModal(true)}
                className="mt-6 inline-flex items-center text-cyan-400 hover:text-cyan-300 text-base font-semibold group focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                Live Free
                <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-2 transition-transform duration-200" />
              </button>
            </div>
          </div>
        </motion.div>
      <motion.div
        className="relative z-10 max-w-7xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* NFT Scrolling Grid */}
         <div ref={scrollRef} className="whitespace-nowrap flex gap-6 mb-16 pb-4 overflow-x-scroll no-scrollbar">
          {nftItems.map(nft => (
            <div key={nft.id} className="flex-shrink-0 w-[240px] bg-gray-800 rounded-xl p-4 text-left shadow-md border border-cyan-500/20">
              <img src={nft.img} alt={nft.title} className="w-full h-40 object-contain rounded-lg mb-4" />
              <h4 className="text-cyan-300 font-semibold text-lg mb-1">{nft.title}</h4>
              <p className="text-white text-sm mb-2">Price: {nft.price}</p>
              <button className="bg-cyan-600 hover:bg-cyan-700 text-white text-sm px-3 py-2 rounded">Buy Now</button>
            </div>
          ))}
        </div>

        {/* Community Section */}
        <motion.div
          className="mb-12 bg-gray-900/50 backdrop-blur-lg rounded-3xl p-8 sm:p-12 border border-cyan-500/30 hover:border-cyan-400/60 shadow-lg shadow-cyan-500/10 transition-all duration-300 hover:scale-[1.02]"
          variants={sectionVariants}
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-start space-x-6">
            <div className="p-4 bg-cyan-500/20 rounded-full glow-cyan">
              <Users className="w-8 h-8 text-cyan-400" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-3xl font-extrabold text-white mb-3 tracking-tight">Build with PETs</h3>
              <p className="text-gray-300 text-lg sm:text-xl leading-relaxed">
                Join the Community Panel, where PETs vote, propose, and earn reputation in a hierarchy-free digital society. Guided by NPCs, we build trust, not contracts.
              </p>
              <button
                onClick={() => setShowAuthModal(true)}
                className="mt-6 inline-flex items-center text-cyan-400 hover:text-cyan-300 text-base font-semibold group focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                Connect with PETs
                <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-2 transition-transform duration-200" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Freedom Section */}
    



        {/* Call-to-Action Section */}
       
      </motion.div>

 <h2 className="text-3xl font-bold text-white mb-4 text-center">Featured NFTs</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-20">
          {nftItems.slice(0, 3).map(nft => (
            <div key={nft.id} className="bg-gray-800 rounded-xl p-4 shadow-md border border-cyan-500/20">
              <img src={nft.img} alt={nft.title} className="w-full h-48 object-cover rounded-lg mb-4" />
              <h4 className="text-cyan-300 font-semibold text-lg mb-1">{nft.title}</h4>
              <p className="text-white text-sm mb-2">Price: {nft.price}</p>
              <button className="bg-cyan-600 hover:bg-cyan-700 text-white text-sm px-3 py-2 rounded">Buy Now</button>
            </div>
          ))}
        </div>

        {/* Scrolling NFT Grid */}
       

        {/* Pseudo Recent Purchases Section */}
        <h3 className="text-2xl font-bold text-white mb-6">Recent Purchases</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {recentPurchases.map((item, i) => (
            <div key={i} className="bg-gray-800 p-4 rounded-lg flex items-center space-x-4 border border-cyan-500/20">
              <img src={item.avatar} alt="avatar" className="w-10 h-10 rounded-full" />
              <div>
                <p className="text-cyan-300 font-semibold">{item.address}</p>
                <p className="text-white text-sm">Paid: {item.amount}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Empty NFT Trade Box */}
        <div className="bg-gray-900 p-6 rounded-xl border border-cyan-500/20 text-center mb-16">
          <ShoppingCart className="mx-auto text-cyan-400 w-10 h-10 mb-3" />
          <h4 className="text-white font-bold text-xl mb-2">No NFTs to Trade</h4>
          <p className="text-gray-300 mb-4">Wanna buy one and get started?</p>
          <button onClick={() => setShowPaypalModal(true)} className="bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-2 rounded-full text-sm">Open NFT Purchase Modal</button>
        </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 p-6 rounded-xl shadow-xl w-full max-w-md relative">
            <button onClick={() => setShowAuthModal(false)} className="absolute top-4 right-4 text-white"><X /></button>
            <h3 className="text-xl text-cyan-400 font-bold mb-4">Connect with PET</h3>
            <div className="grid gap-4">
              <input type="text" placeholder="Email" className="bg-gray-800 p-3 rounded-md text-white" />
              <input type="text" placeholder="Username" className="bg-gray-800 p-3 rounded-md text-white" />
              <button className="bg-cyan-600 p-3 rounded-md text-white">Continue with Google</button>
              <button className="bg-blue-600 p-3 rounded-md text-white">Continue with Facebook</button>
              <button className="bg-green-600 p-3 rounded-md text-white">Continue with Phone</button>
              <button className="bg-gray-700 p-3 rounded-md text-white">Continue Anonymously</button>
            </div>
          </div>
        </div>
      )}

      {/* PayPal Modal */}
      {showPaypalModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 p-6 rounded-xl shadow-xl w-full max-w-md relative">
            <button onClick={() => setShowPaypalModal(false)} className="absolute top-4 right-4 text-white"><X /></button>
            <h3 className="text-xl text-cyan-400 font-bold mb-4">Donate with PayPal</h3>
            <form className="grid gap-4">
              <input type="text" placeholder="Your Name" className="bg-gray-800 p-3 rounded-md text-white" />
              <input type="email" placeholder="Your Email" className="bg-gray-800 p-3 rounded-md text-white" />
              <input type="number" placeholder="Amount in USD" className="bg-gray-800 p-3 rounded-md text-white" />
              <button className="bg-cyan-600 p-3 rounded-md text-white">Proceed to Payment</button>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .glow-cyan {
          box-shadow: 0 0 15px rgba(0, 255, 255, 0.3);
        }
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
