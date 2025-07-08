import { FC, memo } from 'react';
import { motion } from 'framer-motion';
import { MessageCircleHeart, Star } from 'lucide-react';
import { SwytchCard } from './SwytchCard';

interface CommunityPost {
  id: string;
  username: string;
  content: string;
  likes: number;
  timestamp: string;
}

const communityPosts: CommunityPost[] = [
  {
    id: '1',
    username: '@CryptoPET',
    content: 'Joined Swytch PETverse! Earning JEWELS while learning crypto is 🔥 #SwytchPET',
    likes: 128,
    timestamp: '2025-06-27T10:30:00Z',
  },
  {
    id: '2',
    username: '@DeFiDreamer',
    content: 'Swytch PET makes crypto fun and meaningful. No jargon, just value! 🧠 #Petaverse',
    likes: 204,
    timestamp: '2025-06-25T09:20:00Z',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};

const VisionCommunity: FC = memo(() => {
  return (
    <motion.div
      variants={fadeUp}
      className="relative bg-gray-900/50 p-8 rounded-xl text-center"
    >
      <SwytchCard gradient="from-rose-500/10 to-pink-500/10">
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-white flex items-center justify-center gap-3 font-poppins">
            <MessageCircleHeart className="text-rose-400 w-6 h-6 animate-pulse" /> Community Voices
          </h2>
          <p className="text-gray-300 max-w-xl mx-auto font-inter">What the PETverse community says on X:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {communityPosts.map((post) => (
              <SwytchCard key={post.id} gradient="from-rose-500/10 to-pink-500/10">
                <div className="flex items-center gap-2 mb-2">
                  <MessageCircleHeart className="text-cyan-400 w-5 h-5" />
                  <p className="text-sm font-semibold text-white font-poppins">{post.username}</p>
                </div>
                <p className="text-sm text-gray-300 font-inter">{post.content}</p>
                <div className="flex items-center gap-2 mt-2 text-gray-400 text-sm font-inter">
                  <Star className="w-4 h-4" /> {post.likes} likes • {new Date(post.timestamp).toLocaleDateString()}
                </div>
              </SwytchCard>
            ))}
          </div>
        </div>
      </SwytchCard>
    </motion.div>
  );
});

export default VisionCommunity;