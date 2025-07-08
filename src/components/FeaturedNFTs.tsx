import { FC, memo } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import NFTCard from './NFTCard';


const nftItems = [
  { id: 1, img: '/nfts/nft.jpg', audio: '/audio/nft1.mp3', film: '/films/nft1.mp4', title: 'PET Artifact #1', price: '20.00 USDT', energyBoost: '+10% Energy Yield', priceValue: 20 },
  { id: 2, img: '/nfts/nft2.jpg', audio: '/audio/nft2.mp3', film: '/films/nft2.mp4', title: 'PET Artifact #2', price: '23.00 USDT', energyBoost: '+15% Energy Yield', priceValue: 23 },
  { id: 3, img: '/nfts/nft3.jpg', audio: '/audio/nft3.mp3', film: '/films/nft3.mp4', title: 'PET Artifact #3', price: '26.00 USDT', energyBoost: '+20% Energy Yield', priceValue: 26 },
];

const sectionVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut', type: 'spring', stiffness: 80 } }
};

const FeaturedNFTs: FC<{
  isPETMember: boolean;
  isPending: boolean;
  setActiveModal: React.Dispatch<React.SetStateAction<string | null>>;
}> = memo(({ isPETMember, isPending, setActiveModal }) => {
  return (
    <motion.div variants={sectionVariants} className="space-y-8">
      <h2 className="text-4xl font-extrabold text-white text-center flex items-center justify-center gap-4 font-poppins">
        <ShoppingCart className="w-10 h-10 text-pink-400 animate-pulse" /> Featured PET Artifacts
      </h2>
      <p className="text-lg text-gray-300 max-w-3xl mx-auto text-center font-inter">
        Collect PET Artifacts to boost your Energy yield and influence in the PETverse. Requires PET membership.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {nftItems.map((nft) => (
          <NFTCard key={`featured-nft-${nft.id}`} nft={nft} isPETMember={isPETMember} isPending={isPending} setActiveModal={setActiveModal} />
        ))}
      </div>
    </motion.div>
  );
});

export default FeaturedNFTs;