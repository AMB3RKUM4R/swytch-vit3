import { FC, memo, useRef } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import NFTCard from './NFTCard';


const nftItems = [
  { id: 1, img: '/nfts/nft.jpg', audio: '/audio/nft1.mp3', film: '/films/nft1.mp4', title: 'PET Artifact #1', price: '20.00 USDT', energyBoost: '+10% Energy Yield', priceValue: 20 },
  { id: 2, img: '/nfts/nft2.jpg', audio: '/audio/nft2.mp3', film: '/films/nft2.mp4', title: 'PET Artifact #2', price: '23.00 USDT', energyBoost: '+15% Energy Yield', priceValue: 23 },
  { id: 3, img: '/nfts/nft3.jpg', audio: '/audio/nft3.mp3', film: '/films/nft3.mp4', title: 'PET Artifact #3', price: '26.00 USDT', energyBoost: '+20% Energy Yield', priceValue: 26 },
  { id: 4, img: '/nfts/nft4.jpg', audio: '/audio/nft4.mp3', film: '/films/nft4.mp4', title: 'PET Artifact #4', price: '29.00 USDT', energyBoost: '+25% Energy Yield', priceValue: 29 },
  { id: 5, img: '/nfts/nft5.jpg', audio: '/audio/nft5.mp3', film: '/films/nft5.mp4', title: 'PET Artifact #5', price: '32.00 USDT', energyBoost: '+30% Energy Yield', priceValue: 32 },
  { id: 6, img: '/nfts/nft6.jpg', audio: '/audio/nft6.mp3', film: '/films/nft6.mp4', title: 'PET Artifact #6', price: '35.00 USDT', energyBoost: '+35% Energy Yield', priceValue: 35 },
  { id: 7, img: '/nfts/nft7.jpg', audio: '/audio/nft7.mp3', film: '/films/nft7.mp4', title: 'PET Artifact #7', price: '38.00 USDT', energyBoost: '+40% Energy Yield', priceValue: 38 },
  { id: 8, img: '/nfts/nft8.jpg', audio: '/audio/nft8.mp3', film: '/films/nft8.mp4', title: 'PET Artifact #8', price: '41.00 USDT', energyBoost: '+45% Energy Yield', priceValue: 41 },
  { id: 9, img: '/nfts/nft9.jpg', audio: '/audio/nft9.mp3', film: '/films/nft9.mp4', title: 'PET Artifact #9', price: '44.00 USDT', energyBoost: '+50% Energy Yield', priceValue: 44 },
  { id: 10, img: '/nfts/nft10.jpg', audio: '/audio/nft10.mp3', film: '/films/nft10.mp4', title: 'PET Artifact #10', price: '47.00 USDT', energyBoost: '+55% Energy Yield', priceValue: 47 },
  { id: 11, img: '/nfts/nft11.jpg', audio: '/audio/nft11.mp3', film: '/films/nft11.mp4', title: 'PET Artifact #11', price: '50.00 USDT', energyBoost: '+60% Energy Yield', priceValue: 50 },
  { id: 12, img: '/nfts/nft12.jpg', audio: '/audio/nft12.mp3', film: '/films/nft12.mp4', title: 'PET Artifact #12', price: '53.00 USDT', energyBoost: '+65% Energy Yield', priceValue: 53 },
];

const sectionVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut', type: 'spring', stiffness: 80 } }
};
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};
const infiniteScroll = {
  animate: { x: ['0%', '-50%'], transition: { x: { repeat: Infinity, repeatType: 'loop', duration: 30, ease: 'linear' } } }
};

const ExploreNFTs: FC<{
  isPETMember: boolean;
  isPending: boolean;
  setActiveModal: React.Dispatch<React.SetStateAction<string | null>>;
}> = memo(({ isPETMember, isPending, setActiveModal }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <motion.div variants={sectionVariants} className="space-y-8">
      <h2 className="text-4xl font-extrabold text-white text-center flex items-center justify-center gap-4 font-poppins">
        <ShoppingCart className="w-10 h-10 text-pink-400 animate-pulse" /> Explore PET Artifacts
      </h2>
      <div
        className="relative overflow-hidden no-scrollbar"
        role="region"
        aria-label="NFT carousel"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') scrollRef.current?.scrollBy({ left: -240, behavior: 'smooth' });
          if (e.key === 'ArrowRight') scrollRef.current?.scrollBy({ left: 240, behavior: 'smooth' });
        }}
      >
        <motion.div
          ref={scrollRef}
          className="flex gap-6 no-scrollbar"
          variants={infiniteScroll}
          animate="animate"
        >
          {[...nftItems, ...nftItems].map((nft, i) => (
            <NFTCard
              key={`scroll-nft-${nft.id}-${i}`}
              nft={nft}
              isPETMember={isPETMember}
              isPending={isPending}
              setActiveModal={setActiveModal}
            />
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
        <p className="text-sm text-gray-400 mt-2 font-inter">Diagram: NFT lifecycle from minting to boosting Energy.</p>
      </motion.div>
    </motion.div>
  );
});

export default ExploreNFTs;