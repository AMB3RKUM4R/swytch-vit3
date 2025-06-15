import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Play, Star, Search, Tv, User, Sparkles, Cake, Video, PartyPopper,
  MessageCircle, Gift, Wand2, Trophy, Camera, Users
} from 'lucide-react';
import { useEffect, useState } from 'react';

// Interfaces (unchanged)
interface Content {
  id: number;
  title: string;
  type: string;
  thumbnail: string;
  description: string;
  rating: number;
  ageRating: string;
  duration?: string;
  isLive?: boolean;
}

interface Category {
  name: string;
  items: Content[];
}

interface Celebrity {
  id: number;
  name: string;
  image: string;
  description: string;
  instagramHandle: string;
}

interface FanClub {
  id: number;
  title: string;
  thumbnail: string;
  description: string;
}

// Placeholder mock data to prevent runtime errors
const featuredContent: Content[] = [
  {
    id: 1,
    title: 'Star Kid Adventure',
    type: 'video',
    thumbnail: '/images/sample1.jpg',
    description: 'Join the magical journey!',
    rating: 4.8,
    ageRating: 'G'
  }
];

const categories: Category[] = [
  {
    name: 'Celebrity NFTs',
    items: featuredContent
  },
  {
    name: 'Personal Videos',
    items: featuredContent
  },
  {
    name: 'Live Fan Meets',
    items: featuredContent
  }
];

const celebrities: Celebrity[] = [
  {
    id: 1,
    name: 'Nona Berry',
    image: '/images/nona.jpg',
    description: 'Child actress & singer',
    instagramHandle: '@nonaberry'
  }
];

const fanClubs: FanClub[] = [
  {
    id: 1,
    title: 'Nona Superfans',
    thumbnail: '/images/club1.jpg',
    description: 'Exclusive access to fan events & content'
  }
];

// Mock Data (unchanged)


// Animation Variants
const sectionVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut', type: 'spring', stiffness: 100 } }
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

const flareVariants = {
  animate: { scale: [1, 1.3, 1], opacity: [0.5, 0.7, 0.5], transition: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' } }
};

const particleVariants = {
  animate: { y: [0, -8, 0], opacity: [0.4, 1, 0.4], transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' } }
};

const buttonVariants = {
  hover: { scale: 1.05, transition: { duration: 0.3 } },
  tap: { scale: 0.95 }
};

const KidsStarFlixUI: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2A1B3D] via-rose-950/20 to-black text-white overflow-hidden relative font-sans">
      {/* Noise Overlay, Lens Flares, and Particles */}
      <motion.div
        className="absolute top-1/3 left-1/3 w-96 h-96 bg-gradient-to-br from-rose-400/50 via-pink-500/40 to-rose-600/30 rounded-full opacity-30 blur-3xl pointer-events-none"
        variants={flareVariants}
        animate="animate"
        style={{ transform: `translate(${mousePosition.x * 30}px, ${mousePosition.y * 30}px)` }}
      />
      <motion.div
        className="absolute top-1/2 right-1/4 w-64 h-64 bg-rose-500/20 rounded-full opacity-20 blur-2xl pointer-events-none"
        variants={flareVariants}
        animate="animate"
        style={{ transform: `translate(${mousePosition.x * -20}px, ${mousePosition.y * -20}px)` }}
      />
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 pointer-events-none" />
      <motion.div className="absolute inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 bg-rose-400 rounded-full opacity-30"
            style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }}
            variants={particleVariants}
            animate="animate"
          />
        ))}
      </motion.div>

      {/* Header */}
      <header className="relative z-20 bg-gray-900/60 backdrop-blur-lg border-b border-rose-500/20 p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Tv className="w-10 h-10 text-rose-400 animate-pulse" />
          <h1 className="text-3xl font-bold text-rose-400 flex items-center gap-2">
            <Sparkles className="w-8 h-8" />
            Swytch
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-rose-400" />
            <input
              type="text"
              placeholder="Find stars, NFTs, videos..."
              className="pl-10 pr-4 py-2 bg-gray-900/80 rounded-full text-white border border-rose-500/20 w-64 sm:w-80 focus:outline-none focus:ring-2 focus:ring-rose-500"
              disabled
            />
          </div>
          <div className="p-2 rounded-full bg-gray-900/80 text-rose-400 border border-rose-500/20">
            <User className="w-5 h-5" />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <motion.section
        className="relative z-10 py-24 px-6 bg-gray-900/50 backdrop-blur-lg rounded-3xl mx-6 mt-20 border border-rose-500/30 shadow-2xl hover:shadow-rose-500/50 transition-all"
        style={{
          backgroundImage: `url(${featuredContent[0].thumbnail})`,
          backgroundSize: 'cover',
          backgroundPosition: `${50 + mousePosition.x * 10}% ${50 + mousePosition.y * 10}%`
        }}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-rose-800/50 to-indigo-900/70 rounded-3xl" />
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{ rotate: 360 }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        >
          <motion.div
            className="absolute top-8 left-8 w-4 h-4 bg-rose-400 rounded-full opacity-50"
            animate={{ scale: [1, 1.5, 1], transition: { duration: 2, repeat: Infinity } }}
          />
          <motion.div
            className="absolute bottom-8 right-8 w-6 h-6 bg-pink-400 rounded-full opacity-50"
            animate={{ scale: [1, 1.3, 1], transition: { duration: 3, repeat: Infinity } }}
          />
        </motion.div>
        <div className="relative max-w-7xl mx-auto text-center space-y-8">
          <motion.h2
            className="text-5xl sm:text-7xl font-extrabold text-rose-400 flex items-center justify-center gap-4"
            animate={{ y: [0, -12, 0], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } }}
          >
            <PartyPopper className="w-12 h-12 animate-pulse" />
            Welcome to Swytch!
          </motion.h2>
          <p className="text-xl sm:text-2xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
            Meet your favorite kid stars, collect their NFTs, and join the fun!
          </p>
          <motion.button
            className="inline-flex items-center px-8 py-4 bg-rose-600 text-white rounded-full font-semibold"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <Play className="w-6 h-6 mr-2" />
            Start the Stardom!
          </motion.button>
        </div>
      </motion.section>

      {/* Category Navigation */}
      <nav className="relative z-10 px-6 py-4 bg-gray-900/60 backdrop-blur-md border-b border-rose-500/20">
        <div className="max-w-7xl mx-auto flex gap-4 overflow-x-auto no-scrollbar">
          {categories.map(category => (
            <motion.button
              key={category.name}
              className="px-4 py-2 rounded-full font-medium text-sm sm:text-base bg-gray-900/80 text-gray-200 hover:bg-rose-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              {category.name}
            </motion.button>
          ))}
        </div>
      </nav>

      {/* Featured Content Carousel */}
      <motion.section
        className="relative z-10 max-w-7xl mx-auto px-6 py-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <h3 className="text-3xl sm:text-4xl font-bold text-white mb-6 flex items-center gap-3">
          <Star className="w-8 h-8 text-rose-400 animate-pulse" />
          Top Star Picks
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {featuredContent.map(item => (
            <motion.div
              key={item.id}
              className="relative bg-gray-900/60 border border-rose-500/20 rounded-2xl p-6 backdrop-blur-md shadow-xl hover:shadow-rose-500/50 transition-all"
              variants={sectionVariants}
              whileHover={{ scale: 1.03, y: -8 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-indigo-500/10 rounded-2xl" />
              <div className="relative">
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-full h-48 object-cover rounded-lg"
                />
                <div className="p-4">
                  <h4 className="text-lg font-semibold text-white">{item.title}</h4>
                  <p className="text-sm text-gray-200 line-clamp-2">{item.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Star className="w-4 h-4 text-rose-400" />
                    <span className="text-sm text-white">{item.rating}</span>
                    <span className="text-sm text-gray-300">| {item.ageRating}</span>
                    {item.isLive && <span className="text-sm text-rose-400 font-semibold">LIVE</span>}
                  </div>
                  <motion.button
                    className="mt-4 inline-flex items-center px-4 py-2 bg-rose-600 text-white rounded-md text-sm font-semibold hover:bg-rose-700"
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    {item.type === 'nft' ? <Trophy className="w-4 h-4 mr-2" /> : item.type === 'message' ? <MessageCircle className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                    {item.isLive ? 'Join Live' : item.type === 'nft' ? 'View NFT' : 'Watch Now'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Content Categories */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12 space-y-16">
        {categories.map(category => (
          <motion.section
            key={category.name}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <h3 className="text-3xl sm:text-4xl font-bold text-white mb-6 flex items-center gap-3">
              {category.name === 'Celebrity NFTs' ? <Trophy className="w-8 h-8 text-rose-400 animate-pulse" /> :
               category.name === 'Personal Videos' ? <Video className="w-8 h-8 text-rose-400 animate-pulse" /> :
               category.name === 'Live Fan Meets' ? <Camera className="w-8 h-8 text-rose-400 animate-pulse" /> :
               <MessageCircle className="w-8 h-8 text-rose-400 animate-pulse" />}
              {category.name}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {category.items.map(item => (
                <motion.div
                  key={item.id}
                  className="relative bg-gray-900/60 border border-rose-500/20 rounded-2xl p-6 backdrop-blur-md shadow-xl hover:shadow-rose-500/50 transition-all"
                  variants={sectionVariants}
                  whileHover={{ scale: 1.03, y: -8 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-indigo-500/10 rounded-2xl" />
                  <div className="relative">
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <div className="p-4">
                      <h4 className="text-lg font-semibold text-white">{item.title}</h4>
                      <p className="text-sm text-gray-200 line-clamp-2">{item.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Star className="w-4 h-4 text-rose-400" />
                        <span className="text-sm text-white">{item.rating}</span>
                        <span className="text-sm text-gray-300">| {item.ageRating}</span>
                        {item.isLive && <span className="text-sm text-rose-400 font-semibold">LIVE</span>}
                      </div>
                      <motion.button
                        className="mt-4 inline-flex items-center px-4 py-2 bg-rose-600 text-white rounded-md text-sm font-semibold hover:bg-rose-700"
                        variants={buttonVariants}
                        whileHover="hover"
                        whileTap="tap"
                      >
                        {item.type === 'nft' ? <Trophy className="w-4 h-4 mr-2" /> : item.type === 'message' ? <MessageCircle className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                        {item.isLive ? 'Join Live' : item.type === 'nft' ? 'View NFT' : item.type === 'message' ? 'View Message' : 'Watch Now'}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        ))}
      </main>

      {/* Celebrity Spotlight */}
      <motion.section
        className="relative z-10 max-w-7xl mx-auto px-6 py-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <h3 className="text-3xl sm:text-4xl font-bold text-white mb-6 flex items-center gap-3">
          <Wand2 className="w-8 h-8 text-rose-400 animate-pulse" />
          Meet Your Stars
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {celebrities.map(celeb => (
            <motion.div
              key={celeb.id}
              className="relative bg-gray-900/60 border border-rose-500/20 rounded-2xl p-6 backdrop-blur-md shadow-xl hover:shadow-rose-500/50 transition-all"
              variants={sectionVariants}
              whileHover={{ scale: 1.03, y: -8 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-indigo-500/10 rounded-2xl" />
              <div className="relative">
                <img
                  src={celeb.image}
                  alt={celeb.name}
                  className="w-full h-48 object-cover rounded-lg"
                />
                <div className="p-4">
                  <h4 className="text-lg font-semibold text-white">{celeb.name}</h4>
                  <p className="text-sm text-gray-200 line-clamp-2">{celeb.description}</p>
                  <motion.button
                    className="mt-4 inline-flex items-center px-4 py-2 bg-rose-600 text-white rounded-md text-sm font-semibold hover:bg-rose-700"
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <Star className="w-4 h-4 mr-2" />
                    Follow {celeb.instagramHandle}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Fan Clubs Section */}
      <motion.section
        className="relative z-10 max-w-7xl mx-auto px-6 py-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <h3 className="text-3xl sm:text-4xl font-bold text-white mb-6 flex items-center gap-3">
          <Users className="w-8 h-8 text-rose-400 animate-pulse" />
          Join Fan Clubs
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {fanClubs.map(club => (
            <motion.div
              key={club.id}
              className="relative bg-gray-900/60 border border-rose-500/20 rounded-2xl p-6 backdrop-blur-md shadow-xl hover:shadow-rose-500/50 transition-all"
              variants={sectionVariants}
              whileHover={{ scale: 1.03, y: -8 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-indigo-500/10 rounded-2xl" />
              <div className="relative">
                <img
                  src={club.thumbnail}
                  alt={club.title}
                  className="w-full h-48 object-cover rounded-lg"
                />
                <div className="p-4">
                  <h4 className="text-lg font-semibold text-white">{club.title}</h4>
                  <p className="text-sm text-gray-200">{club.description}</p>
                  <motion.button
                    className="mt-4 inline-flex items-center px-4 py-2 bg-rose-600 text-white rounded-md text-sm font-semibold hover:bg-rose-700"
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <Gift className="w-4 h-4 mr-2" />
                    Join Club
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Virtual Meet-and-Greet Section */}
      <motion.section
        className="relative z-10 max-w-7xl mx-auto px-6 py-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <h3 className="text-3xl sm:text-4xl font-bold text-white mb-6 flex items-center gap-3">
          <Camera className="w-8 h-8 text-rose-400 animate-pulse" />
          Virtual Meet-and-Greets
        </h3>
        <div className="relative bg-gray-900/60 border border-rose-500/20 rounded-2xl p-6 backdrop-blur-md shadow-xl hover:shadow-rose-500/50 transition-all text-center">
          <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-indigo-500/10 rounded-2xl" />
          <div className="relative space-y-4">
            <p className="text-lg text-gray-200">Say hi to your favorite stars in a virtual meet!</p>
            <motion.button
              className="inline-flex items-center px-6 py-3 bg-rose-600 text-white rounded-md font-semibold hover:bg-rose-700"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Camera className="w-5 h-5 mr-2" />
              Join a Meet
            </motion.button>
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="relative z-10 bg-gray-900/60 border-t border-rose-500/20 p-8 text-center backdrop-blur-md">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl sm:text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Cake className="w-8 h-8 text-rose-400 animate-pulse" />
            Made for Young Fans
          </h3>
          <p className="text-lg text-gray-200 mb-4">Swytch is your place to shine with your favorite kid stars!</p>
          <div className="flex justify-center gap-6">
            <Link to="/about" className="text-gray-200 hover:text-rose-400 focus:outline-none focus:underline">
              About
            </Link>
            <Link to="/terms" className="text-gray-200 hover:text-rose-400 focus:outline-none focus:underline">
              Terms
            </Link>
            <Link to="/privacy" className="text-gray-200 hover:text-rose-400 focus:outline-none focus:underline">
              Privacy
            </Link>
            <Link to="/contact" className="text-gray-200 hover:text-rose-400 focus:outline-none focus:underline">
              Contact
            </Link>
          </div>
        </div>
      </footer>

      <style>
        {`
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .bg-[url('/noise.png')] {
            background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAC3SURBVFhH7ZZBCsAgCER7/6W9WZoKUSO4ro0Q0v+UQKcZJnTf90EQBF3X9UIIh8Ph0Ov1er3RaDSi0WhEkiQpp9OJIAiC3nEcxyHLMgqCILlcLhFFUdTr9WK5XC6VSqVUKpVJutxuNRqMhSRJpmkYkSVKpVCqVSqlUKqVSqZQqlaIoimI4HIZKpVJKpVJutxuNRqNRkiRJMk3TiCRJKpVKqVJKpVIplUqlVColSf4BQUzS2f8eAAAAAElFTkSuQmCC');
            background-repeat: repeat;
            background-size: 64px 64px;
          }
          .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          .blur-3xl {
            filter: blur(64px);
          }
          .blur-2xl {
            filter: blur(32px);
          }
          @media (prefers-reduced-motion) {
            .animate-pulse, .motion-div {
              animation: none !important;
              transition: none !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default KidsStarFlixUI;


