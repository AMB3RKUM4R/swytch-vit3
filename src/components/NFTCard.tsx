import { FC, memo } from 'react';
import { motion } from 'framer-motion';
import { NFTCardProps } from '@/lib/types';

const NFTCard: FC<NFTCardProps> = memo(({ nft, isPETMember, isPending, setActiveModal, userId, setShowMessage }) => {
  const handleBuyNow = () => {
    if (!userId) {
      setActiveModal('auth');
      setShowMessage('⚠️ Sign in to buy NFTs!');
      return;
    }
    if (!isPETMember) {
      setShowMessage('⚠️ You must be a PET Member to purchase NFTs!');
      setActiveModal('payment');
      return;
    }
    if (!isPending) {
      setActiveModal(`Purchase ${nft.title}`);
      setShowMessage(`ℹ️ Initiating purchase for ${nft.title}.`);
    }
  };

  return (
    <motion.div
      className="bg-gray-900/60 rounded-xl p-6 border border-rose-500/20 shadow-xl hover:shadow-rose-500/30 transition-all"
      whileHover={{ scale: 1.05, y: -10 }}
    >
      <img src={nft.img} alt={nft.title} className="w-full h-48 object-cover rounded-lg mb-4" onError={(e) => { e.currentTarget.src = '/nfts/fallback.jpg'; }} />
      <h4 className="text-xl font-semibold text-rose-300 mb-2 font-poppins">{nft.title}</h4>
      <p className="text-gray-200 mb-2 font-inter">Price: {nft.price}</p>
      <p className="text-gray-200 mb-4 font-inter">Boost: {nft.energyBoost}</p>
      <motion.button
        className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg w-full font-semibold font-poppins"
        onClick={handleBuyNow}
        whileHover={{ scale: isPending || !isPETMember ? 1 : 1.05 }}
        whileTap={{ scale: isPending || !isPETMember ? 1 : 0.95 }}
        disabled={!isPETMember || isPending}
        aria-label={isPending ? 'Processing...' : isPETMember ? `Buy ${nft.title}` : 'Join PET to Buy'}
      >
        {isPending ? 'Processing...' : isPETMember ? 'Buy Now' : 'Join PET to Buy'}
      </motion.button>
    </motion.div>
  );
});

export default NFTCard;