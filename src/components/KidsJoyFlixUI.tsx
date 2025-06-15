import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Play, Film, Book, Star, Search, Sparkles, Gamepad2, Music,
  Heart, Brush, Cake, Rocket, Puzzle, Laugh, Dog, Wand2, Gift, X
} from 'lucide-react';
import { auth, db, storage } from '../lib/firebaseConfig';
import { collection, doc, setDoc, getDocs, deleteDoc } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import HeaderComponent from './header.tsx';
import RazorTransaction from '../RazorWithdraw.tsx';

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
  isPremium?: boolean;
}

interface Category {
  name: string;
  items: Content[];
}

interface Character {
  id: number;
  name: string;
  image: string;
  description: string;
}

interface FunFact {
  id: number;
  fact: string;
  icon: JSX.Element;
}

interface VirtualPet {
  id: number;
  name: string;
  image: string;
  action: string;
}


const isContent = (item: Content | VirtualPet): item is Content => {
  return (item as Content).type !== undefined;
};

// Mock Data (unchanged)
const featuredContent: Content[] = [/* ...same as original... */];
const categories: Category[] = [/* ...same as original... */];
const characters: Character[] = [/* ...same as original... */];
const funFacts: FunFact[] = [/* ...same as original... */];
const virtualPets: VirtualPet[] = [/* ...same as original... */];

// Animation Variants (unchanged)
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

const KidsJoyFlixUI: React.FC = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<number[]>([]);
  const [modalContent, setModalContent] = useState<Content | VirtualPet | null>(null);
  const [thumbnailUrls, setThumbnailUrls] = useState<Record<string, string>>({});
  const [purchasedItems, setPurchasedItems] = useState<number[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Parallax effect (unchanged)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Monitor auth state (unchanged)
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUserId(user ? user.uid : null);
    });
    return unsubscribe;
  }, []);

  // Fetch favorites from Firestore
  useEffect(() => {
    if (userId) {
      const fetchFavorites = async () => {
        try { // Add try-catch for error handling
          const favoritesRef = collection(doc(db, 'users', userId), 'favorites');
          const snapshot = await getDocs(favoritesRef);
          const favoriteIds = snapshot.docs.map((doc) => Number(doc.id));
          setFavorites(favoriteIds);
        } catch (err) {
          console.error('Failed to fetch favorites:', err);
        }
      };
      fetchFavorites();
    }
  }, [userId, db]); // Explicitly include db in dependencies

  // Fetch purchased items from Firestore
  useEffect(() => {
    if (userId) {
      const fetchPurchasedItems = async () => {
        try { // Add try-catch for error handling
          const purchasesRef = collection(doc(db, 'users', userId), 'purchases');
          const snapshot = await getDocs(purchasesRef);
          const purchasedIds = snapshot.docs.map((doc) => Number(doc.id));
          setPurchasedItems(purchasedIds);
        } catch (err) {
          console.error('Failed to fetch purchased items:', err);
        }
      };
      fetchPurchasedItems();
    }
  }, [userId, db]); // Explicitly include db in dependencies

  // Fetch thumbnail URLs from Firebase Storage
  useEffect(() => {
    const fetchThumbnails = async () => {
      const urls: Record<string, string> = {};
      const allContent = [
        ...featuredContent,
        ...categories.flatMap((cat) => cat.items),
        ...characters,
        ...virtualPets,
      ];
      for (const item of allContent) {
        const path = 'image' in item ? item.image : item.thumbnail;
        try {
          const url = await getDownloadURL(ref(storage, path));
          urls[path] = url;
        } catch (err) {
          console.error(`Failed to fetch ${path}:`, err);
          urls[path] = '/placeholder.jpg';
        }
      }
      setThumbnailUrls(urls);
    };
    fetchThumbnails();
  }, [storage]); // Explicitly include storage in dependencies

  // Toggle favorite (unchanged)
  const toggleFavorite = async (contentId: number) => {
    if (!userId) {
      alert('Please log in to favorite content.');
      return;
    }
    const favoritesRef = doc(db, 'users', userId, 'favorites', contentId.toString());
    if (favorites.includes(contentId)) {
      setFavorites(favorites.filter((id) => id !== contentId));
      await deleteDoc(favoritesRef);
    } else {
      setFavorites([...favorites, contentId]);
      await setDoc(favoritesRef, { contentId, addedAt: new Date() });
    }
  };

  // Handle content click (unchanged)
  const handleContentClick = (item: Content | VirtualPet) => {
    if (!userId) {
      alert('Please log in to access content.');
      return;
    }
    if ('isPremium' in item && item.isPremium && !purchasedItems.includes(item.id)) {
      setModalContent(item);
    } else {
      const contentName = isContent(item) ? item.title : item.name;
      alert(`Playing ${contentName}!`);
    }
  };

  // Handle payment success (unchanged)
  const handlePaymentSuccess = async (itemId: string) => {
    if (!userId) return;
    const purchaseRef = doc(db, 'users', userId, 'purchases', itemId);
    await setDoc(purchaseRef, { itemId: Number(itemId), purchasedAt: new Date() });
    setPurchasedItems([...purchasedItems, Number(itemId)]);
    setModalContent(null);
    alert('Purchase successful! Enjoy your content!');
  };

  // Filter content (unchanged)
  const filteredCategories = categories.map((category) => ({
    ...category,
    items: category.items.filter((item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((category) => category.items.length > 0);

  const filteredFeatured = featuredContent.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCharacters = characters.filter((character) =>
    character.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    character.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredVirtualPets = virtualPets.filter((pet) =>
    pet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pet.action.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2A1B3D] via-rose-950/20 to-black text-white overflow-hidden relative font-sans">
      {/* Noise Overlay and Lens Flares */}
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
        {[...Array(10)].map((_, i) => (
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
      <HeaderComponent />

      {/* Hero Section */}
      <motion.section
        className="relative z-10 py-24 px-6 bg-gray-900/50 backdrop-blur-lg rounded-3xl mx-6 mt-20 border border-rose-500/30 shadow-2xl hover:shadow-rose-500/50 transition-all"
        style={{
          backgroundImage: featuredContent[0] ? `url(${thumbnailUrls[featuredContent[0].thumbnail] || '/placeholder.jpg'})` : 'none', // Check if featuredContent[0] exists
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
            <Sparkles className="w-12 h-12 animate-pulse" />
            Welcome to JoyFlix!
          </motion.h2>
          <p className="text-xl sm:text-2xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
            A super fun place for cartoons, games, songs, and magical adventures!
          </p>
          <motion.button
            className="inline-flex items-center px-8 py-4 bg-rose-600 text-white rounded-full font-semibold hover:bg-rose-700"
            onClick={() => alert('Starting the adventure!')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Play className="w-6 h-6 mr-2" />
            Start the Adventure!
          </motion.button>
        </div>
      </motion.section>

      {/* Search Bar */}
      <section className="relative z-10 px-6 py-4 bg-gray-900/60 backdrop-blur-md border-b border-rose-500/20">
        <div className="max-w-7xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-rose-400" />
            <input
              type="text"
              placeholder="Find cartoons, games, songs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-900/80 rounded-full text-white border border-rose-500/20 w-full sm:w-80 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>
      </section>

      {/* Category Navigation */}
      <nav className="relative z-10 px-6 py-4 bg-gray-900/60 backdrop-blur-md border-b border-rose-500/20">
        <div className="max-w-7xl mx-auto flex gap-4 overflow-x-auto no-scrollbar">
          {categories.map((category) => (
            <motion.button
              key={category.name}
              className="px-4 py-2 rounded-full font-medium text-sm sm:text-base bg-gray-900/80 text-gray-200 hover:bg-rose-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              onClick={() => {
                const element = document.getElementById(category.name.replace(/\s/g, '-'));
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {category.name}
            </motion.button>
          ))}
        </div>
      </nav>

      {/* Featured Content Carousel */}
      {filteredFeatured.length > 0 && (
        <motion.section
          className="relative z-10 max-w-7xl mx-auto px-6 py-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <h3 className="text-3xl sm:text-4xl font-bold text-white mb-6 flex items-center gap-3">
            <Star className="w-8 h-8 text-rose-400 animate-pulse" />
            Super Star Picks
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {filteredFeatured.map((item) => (
              <motion.div
                key={item.id}
                className="relative bg-gray-900/60 border border-rose-500/20 rounded-2xl p-6 backdrop-blur-md shadow-xl hover:shadow-rose-500/50 transition-all"
                variants={sectionVariants}
                whileHover={{ scale: 1.03, y: -8 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-indigo-500/10 rounded-2xl" />
                <div className="relative">
                  <img
                    src={thumbnailUrls[item.thumbnail] || '/placeholder.jpg'}
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
                      {item.isPremium && !purchasedItems.includes(item.id) && <span className="text-sm text-rose-400 font-semibold">PREMIUM</span>}
                    </div>
                    <div className="flex justify-between mt-3">
                      <motion.button
                        onClick={() => handleContentClick(item)}
                        className="inline-flex items-center px-4 py-2 bg-rose-600 text-white rounded-md text-sm font-semibold hover:bg-rose-700"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {item.type === 'quiz' ? <Puzzle className="w-4 h-4 mr-2" /> : item.type === 'game' ? <Gamepad2 className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                        {item.isLive ? 'Join Live' : item.type === 'quiz' ? 'Play Quiz' : item.type === 'game' ? 'Play Game' : 'Watch Now'}
                      </motion.button>
                      <motion.button
                        onClick={() => toggleFavorite(item.id)}
                        className="p-2 rounded-full text-white hover:bg-gray-700/50"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        aria-label={favorites.includes(item.id) ? `Remove ${item.title} from favorites` : `Add ${item.title} to favorites`}
                      >
                        <Heart
                          className={`w-5 h-5 ${favorites.includes(item.id) ? 'fill-rose-400 text-rose-400' : ''}`}
                        />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Content Categories */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12 space-y-16">
        {filteredCategories.map((category) => (
          <motion.section
            key={category.name}
            id={category.name.replace(/\s/g, '-')}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <h3 className="text-3xl sm:text-4xl font-bold text-white mb-6 flex items-center gap-3">
              {category.name === 'Featured Films & Documentaries' ? <Film className="w-8 h-8 text-rose-400 animate-pulse" /> :
               category.name === 'Sing-Along Songs' ? <Music className="w-8 h-8 text-rose-400 animate-pulse" /> :
               category.name === 'Live Fun' ? <Rocket className="w-8 h-8 text-rose-400 animate-pulse" /> :
               category.name === 'Quiz Time' ? <Puzzle className="w-8 h-8 text-rose-400 animate-pulse" /> :
               category.name === 'Game Galaxy' ? <Gamepad2 className="w-8 h-8 text-white" /> :
               <Book className="w-8 h-8 text-rose-400 animate-pulse" />}
              {category.name}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {category.items.map((item) => (
                <motion.div
                  key={item.id}
                  className="relative bg-gray-900/60 border border-rose-500/20 rounded-2xl p-6 backdrop-blur-md shadow-xl hover:shadow-rose-500/50 transition-all"
                  variants={sectionVariants}
                  whileHover={{ scale: 1.03, y: -8 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-indigo-500/10 rounded-2xl" />
                  <div className="relative">
                    <img
                      src={thumbnailUrls[item.thumbnail] || '/placeholder.jpg'}
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
                        {item.isPremium && !purchasedItems.includes(item.id) && <span className="text-sm text-rose-400 font-semibold">PREMIUM</span>}
                      </div>
                      <div className="flex justify-between mt-3">
                        <motion.button
                          onClick={() => handleContentClick(item)}
                          className="inline-flex items-center px-4 py-2 bg-rose-600 text-white rounded-md text-sm font-semibold hover:bg-rose-700"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {item.type === 'quiz' ? <Puzzle className="w-4 h-4 mr-2" /> : item.type === 'game' ? <Gamepad2 className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                          {item.isLive ? 'Join Live' : item.type === 'quiz' ? 'Play Quiz' : item.type === 'game' ? 'Play Game' : 'Watch Now'}
                        </motion.button>
                        <motion.button
                          onClick={() => toggleFavorite(item.id)}
                          className="p-2 rounded-full text-white hover:bg-gray-700/50"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          aria-label={favorites.includes(item.id) ? `Remove ${item.title} from favorites` : `Add ${item.title} to favorites`}
                        >
                          <Heart
                            className={`w-5 h-5 ${favorites.includes(item.id) ? 'fill-rose-400 text-rose-400' : ''}`}
                          />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        ))}
      </main>

      {/* Character Spotlight */}
      {filteredCharacters.length > 0 && (
        <motion.section
          className="relative z-10 max-w-7xl mx-auto px-6 py-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <h3 className="text-3xl sm:text-4xl font-bold text-white mb-6 flex items-center gap-3">
            <Wand2 className="w-8 h-8 text-rose-400 animate-pulse" />
            Meet Your Pals
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {filteredCharacters.map((character) => (
              <motion.div
                key={character.id}
                className="relative bg-gray-900/60 border border-rose-500/20 rounded-2xl p-6 backdrop-blur-md shadow-xl hover:shadow-rose-500/50 transition-all"
                variants={sectionVariants}
                whileHover={{ scale: 1.03, y: -8 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-indigo-500/10 rounded-2xl" />
                <div className="relative">
                  <img
                    src={thumbnailUrls[character.image] || '/placeholder.jpg'}
                    alt={character.name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <div className="p-4">
                    <h4 className="text-lg font-semibold text-white">{character.name}</h4>
                    <p className="text-sm text-gray-200 line-clamp-2">{character.description}</p>
                    <div className="flex justify-between mt-3">
                      <motion.button
                        onClick={() => alert(`Meeting ${character.name}!`)}
                        className="inline-flex items-center px-4 py-2 bg-rose-600 text-white rounded-md text-sm font-semibold hover:bg-rose-700"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Heart className="w-4 h-4 mr-2" />
                        Meet {character.name}
                      </motion.button>
                      <motion.button
                        onClick={() => toggleFavorite(character.id)}
                        className="p-2 rounded-full text-white hover:bg-gray-700/50"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        aria-label={favorites.includes(character.id) ? `Remove ${character.name} from favorites` : `Add ${character.name} to favorites`}
                      >
                        <Heart
                          className={`w-5 h-5 ${favorites.includes(character.id) ? 'fill-rose-400 text-rose-400' : ''}`}
                        />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Fun Facts Section */}
      <motion.section
        className="relative z-10 max-w-7xl mx-auto px-6 py-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <h3 className="text-3xl sm:text-4xl font-bold text-white mb-6 flex items-center gap-3">
          <Laugh className="w-8 h-8 text-rose-400 animate-pulse" />
          Wacky Facts
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {funFacts.map((fact) => (
            <motion.div
              key={fact.id}
              className="relative bg-gray-900/60 border border-rose-500/20 rounded-2xl p-6 backdrop-blur-md shadow-xl hover:shadow-rose-500/50 transition-all flex items-center gap-4"
              variants={sectionVariants}
              whileHover={{ scale: 1.03, y: -8 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-indigo-500/10 rounded-2xl" />
              <div className="relative flex items-center gap-4">
                {fact.icon}
                <p className="text-sm text-gray-200">{fact.fact}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Virtual Pet Section */}
      {filteredVirtualPets.length > 0 && (
        <motion.section
          className="relative z-10 max-w-7xl mx-auto px-6 py-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <h3 className="text-3xl sm:text-4xl font-bold text-white mb-6 flex items-center gap-3">
            <Dog className="w-8 h-8 text-rose-400 animate-pulse" />
            Your Virtual Pets
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVirtualPets.map((pet) => (
              <motion.div
                key={pet.id}
                className="relative bg-gray-900/60 border border-rose-500/20 rounded-2xl p-6 backdrop-blur-md shadow-xl hover:shadow-rose-500/50 transition-all"
                variants={sectionVariants}
                whileHover={{ scale: 1.03, y: -8 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-indigo-500/10 rounded-2xl" />
                <div className="relative">
                  <img
                    src={thumbnailUrls[pet.image] || '/placeholder.jpg'}
                    alt={pet.name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <div className="p-4">
                    <h4 className="text-lg font-semibold text-white">{pet.name}</h4>
                    <p className="text-sm text-gray-200">{pet.action}</p>
                    <div className="flex justify-between mt-3">
                      <motion.button
                        onClick={() => handleContentClick(pet)}
                        className="inline-flex items-center px-4 py-2 bg-rose-600 text-white rounded-md text-sm font-semibold hover:bg-rose-700"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Gift className="w-4 h-4 mr-2" />
                        Play with {pet.name}
                      </motion.button>
                      <motion.button
                        onClick={() => toggleFavorite(pet.id)}
                        className="p-2 rounded-full text-white hover:bg-gray-700/50"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        aria-label={favorites.includes(pet.id) ? `Remove ${pet.name} from favorites` : `Add ${pet.name} to favorites`}
                      >
                        <Heart
                          className={`w-5 h-5 ${favorites.includes(pet.id) ? 'fill-rose-400 text-rose-400' : ''}`}
                        />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Coloring Pages Section */}
      <motion.section
        className="relative z-10 max-w-7xl mx-auto px-6 py-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <h3 className="text-3xl sm:text-4xl font-bold text-white mb-6 flex items-center gap-3">
          <Brush className="w-8 h-8 text-rose-400 animate-pulse" />
          Color & Create
        </h3>
        <div className="relative bg-gray-900/60 border border-rose-500/20 rounded-2xl p-6 backdrop-blur-md shadow-xl hover:shadow-rose-500/50 transition-all text-center">
          <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-indigo-500/10 rounded-2xl" />
          <div className="relative space-y-4">
            <p className="text-lg text-gray-200">Draw and color your favorite JoyFlix characters!</p>
            <motion.button
              className="inline-flex items-center px-6 py-3 bg-rose-600 text-white rounded-md font-semibold hover:bg-rose-700"
              onClick={() => alert('Starting coloring!')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Brush className="w-5 h-5 mr-2" />
              Start Coloring
            </motion.button>
          </div>
        </div>
      </motion.section>

      {/* Payment Modal */}
      <AnimatePresence>
        {modalContent && userId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
            role="dialog"
            aria-modal="true"
            aria-label="Payment Modal"
          >
            <motion.div
              className="bg-gray-900 rounded-2xl max-w-md w-full p-8 relative border border-rose-500/20 shadow-2xl backdrop-blur-lg"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              transition={{ duration: 0.4 }}
              tabIndex={-1}
            >
              <motion.button
                onClick={() => setModalContent(null)}
                className="absolute top-4 right-4 text-rose-400 hover:text-red-500"
                whileHover={{ rotate: 90 }}
                aria-label="Close payment modal"
              >
                <X className="w-6 h-6" />
              </motion.button>
              <h3 className="text-xl font-bold text-rose-400 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 animate-pulse" />
                Unlock {isContent(modalContent) ? modalContent.title : modalContent.name}
              </h3>
              <div className="grid gap-4 text-white">
                <p className="text-gray-200">Pay $5 to access this premium content.</p>
                <RazorTransaction
                  uid={userId}
                  amount={5}
                  mode="buy"
                  to="inventory"
                  itemId={modalContent.id.toString()}
                  onSuccess={() => handlePaymentSuccess(modalContent.id.toString())}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="relative z-10 bg-gray-900/60 border-t border-rose-500/20 p-8 text-center backdrop-blur-md">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl sm:text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Cake className="w-8 h-8 text-rose-400 animate-pulse" />
            Made for Kids
          </h3>
          <p className="text-lg text-gray-200 mb-4">JoyFlix is your magical place for cartoons, games, and giggles!</p>
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

export default KidsJoyFlixUI;