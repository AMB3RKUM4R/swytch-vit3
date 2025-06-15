import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Play, Music, Star, Search, Sparkles, Mic, Heart, Cake, Music2,
  Video, PartyPopper, Wand2, X
} from 'lucide-react';
import { collection, doc, setDoc, getDocs, deleteDoc } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebaseConfig';
import HeaderComponent from './header';
import RazorTransaction from '../RazorWithdraw';
import { useAuthUser } from '@/hooks/useAuthUser';
import { useModal } from '../context/ModalContext';
import { MembershipTier } from '@/lib/types';

// Interfaces
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
  membershipRequired?: MembershipTier;
  price?: number;
}

interface Category {
  name: string;
  items: Content[];
}

interface KidStar {
  id: number;
  name: string;
  image: string;
  description: string;
}

interface MusicChallenge {
  id: number;
  title: string;
  thumbnail: string;
  description: string;
  isPremium?: boolean;
  membershipRequired?: MembershipTier;
  price?: number;
}

// Mock Data
const featuredContent: Content[] = [
  {
    id: 1,
    title: 'Star Kid Adventure',
    type: 'video',
    thumbnail: '/images/sample1.jpg',
    description: 'Join the magical journey!',
    rating: 4.8,
    ageRating: 'G',
    isLive: true,
    isPremium: false,
  },
  {
    id: 2,
    title: 'Rainbow Sing-Along',
    type: 'song',
    thumbnail: '/images/rainbow.jpg',
    description: 'Sing the colors of the rainbow!',
    rating: 4.9,
    ageRating: '2+',
    duration: '3m',
    isPremium: true,
    membershipRequired: 'membership_basic',
    price: 5,
  },
  {
    id: 3,
    title: 'Groovy Dance Party',
    type: 'dance',
    thumbnail: '/images/dance-party.jpg',
    description: 'Dance with your friends in this live party!',
    rating: 4.7,
    ageRating: '4+',
    isLive: true,
    isPremium: true,
    membershipRequired: 'membership_pro',
    price: 7,
  },
];

const categories: Category[] = [
  {
    name: 'Sing-Along Songs',
    items: [
      {
        id: 4,
        title: 'Twinkle Star Song',
        type: 'song',
        thumbnail: '/images/twinkle.jpg',
        description: 'Sing Twinkle, Twinkle, Little Star!',
        rating: 4.8,
        ageRating: '2+',
        duration: '2m',
        isPremium: false,
      },
      {
        id: 2,
        title: 'Rainbow Sing-Along',
        type: 'song',
        thumbnail: '/images/rainbow.jpg',
        description: 'Sing the colors of the rainbow!',
        rating: 4.9,
        ageRating: '2+',
        duration: '3m',
        isPremium: true,
        membershipRequired: 'membership_basic',
        price: 5,
      },
    ],
  },
  {
    name: 'Music Videos',
    items: [
      {
        id: 5,
        title: 'Magic Music Video',
        type: 'music_video',
        thumbnail: '/images/magic-video.jpg',
        description: 'A magical music video for kids!',
        rating: 4.6,
        ageRating: '3+',
        duration: '4m',
        isPremium: true,
        membershipRequired: 'membership_premium',
        price: 10,
      },
    ],
  },
  {
    name: 'Kids Dancing & Singing',
    items: [
      {
        id: 3,
        title: 'Groovy Dance Party',
        type: 'dance',
        thumbnail: '/images/dance-party.jpg',
        description: 'Dance with your friends in this live party!',
        rating: 4.7,
        ageRating: '4+',
        isLive: true,
        isPremium: true,
        membershipRequired: 'membership_pro',
        price: 7,
      },
    ],
  },
];

const kidStars: KidStar[] = [
  {
    id: 1,
    name: 'Nona Berry',
    image: '/images/nona.jpg',
    description: 'Child actress & singer',
  },
  {
    id: 2,
    name: 'Toby Tune',
    image: '/images/toby.jpg',
    description: 'A dancing sensation!',
  },
];

const musicChallenges: MusicChallenge[] = [
  {
    id: 1,
    title: 'Dance Battle #1',
    thumbnail: '/images/challenge1.jpg',
    description: 'Can you match the moves?',
    isPremium: true,
    membershipRequired: 'membership_basic',
    price: 5,
  },
  {
    id: 2,
    title: 'Sing-Off Challenge',
    thumbnail: '/images/challenge2.jpg',
    description: 'Show off your singing skills!',
    isPremium: true,
    membershipRequired: 'membership_pro',
    price: 7,
  },
];

// Animation Variants
const sectionVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut', type: 'spring', stiffness: 100 } },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const flareVariants = {
  animate: { scale: [1, 1.3, 1], opacity: [0.5, 0.7, 0.5], transition: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' } },
};

const particleVariants = {
  animate: { y: [0, -8, 0], opacity: [0.4, 1, 0.4], transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' } },
};

// Membership Access Logic
const canAccessContent = (membership: string | null, membershipRequired: MembershipTier | undefined): boolean => {
  if (!membershipRequired) return true;
  if (!membership) return false;

  const tiers: Record<MembershipTier, number> = {
    membership_basic: 1,
    membership_pro: 2,
    membership_premium: 3,
  };

  const userTier = tiers[membership as MembershipTier] || 0;
  const requiredTier = tiers[membershipRequired] || 0;

  return userTier >= requiredTier;
};

const KidsMusicFlixUI: React.FC = () => {
  const { user, membership, loading, error } = useAuthUser();
  const { openLoginModal, openMembershipModal } = useModal();
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<number[]>([]);
  const [modalContent, setModalContent] = useState<Content | MusicChallenge | null>(null);
  const [modalType, setModalType] = useState<'purchase' | 'upgrade' | null>(null);
  const [thumbnailUrls, setThumbnailUrls] = useState<Record<string, string>>({});
  const [purchasedItems, setPurchasedItems] = useState<number[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const modalRef = useRef<HTMLDivElement>(null);

  // Parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Focus trapping for modal
  useEffect(() => {
    if (modalContent && modalRef.current) {
      modalRef.current.focus();
      const focusableElements = modalRef.current.querySelectorAll('button, [href], input, [tabindex]');
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
        if (e.key === 'Escape') {
          setModalContent(null);
          setModalType(null);
        }
      };

      modalRef.current.addEventListener('keydown', handleKeyDown);
      return () => modalRef.current?.removeEventListener('keydown', handleKeyDown);
    }
  }, [modalContent]);

  // Fetch favorites from Firestore
  useEffect(() => {
    if (user) {
      const fetchFavorites = async () => {
        try {
          const favoritesRef = collection(doc(db, 'users', user.uid), 'favorites');
          const snapshot = await getDocs(favoritesRef);
          const favoriteIds = snapshot.docs.map((doc) => Number(doc.id));
          setFavorites(favoriteIds);
        } catch (err) {
          console.error('Failed to fetch favorites:', err);
        }
      };
      fetchFavorites();
    }
  }, [user]);

  // Fetch purchased items from Firestore
  useEffect(() => {
    if (user) {
      const fetchPurchasedItems = async () => {
        try {
          const purchasesRef = collection(doc(db, 'users', user.uid), 'purchases');
          const snapshot = await getDocs(purchasesRef);
          const purchasedIds = snapshot.docs.map((doc) => Number(doc.id));
          setPurchasedItems(purchasedIds);
        } catch (err) {
          console.error('Failed to fetch purchased items:', err);
        }
      };
      fetchPurchasedItems();
    }
  }, [user]);

  // Fetch thumbnail URLs with retry logic
  useEffect(() => {
    const fetchThumbnail = async (path: string, retries = 2): Promise<string> => {
      try {
        return await getDownloadURL(ref(storage, path));
      } catch (err) {
        if (retries > 0) {
          return fetchThumbnail(path, retries - 1);
        }
        console.error(`Failed to fetch ${path}:`, err);
        return '/placeholder.jpg';
      }
    };

    const fetchThumbnails = async () => {
      const urls: Record<string, string> = {};
      const allContent = [
        ...featuredContent,
        ...categories.flatMap((cat) => cat.items),
        ...kidStars,
        ...musicChallenges,
      ];
      for (const item of allContent) {
        const path = 'image' in item ? item.image : item.thumbnail;
        urls[path] = await fetchThumbnail(path);
      }
      setThumbnailUrls(urls);
    };
    fetchThumbnails();
  }, []);

  // Toggle favorite
  const toggleFavorite = async (contentId: number) => {
    if (!user) {
      openLoginModal();
      return;
    }
    const favoritesRef = doc(db, 'users', user.uid, 'favorites', contentId.toString());
    if (favorites.includes(contentId)) {
      setFavorites(favorites.filter((id) => id !== contentId));
      await deleteDoc(favoritesRef);
    } else {
      setFavorites([...favorites, contentId]);
      await setDoc(favoritesRef, { contentId, addedAt: new Date() });
    }
  };

  // Handle content click
  const handleContentClick = (item: Content | MusicChallenge) => {
    if (!user) {
      setModalContent(item);
      setModalType('upgrade');
      return;
    }

    const membershipRequired = 'membershipRequired' in item ? item.membershipRequired : undefined;
    if (item.isPremium && membershipRequired && !canAccessContent(membership, membershipRequired)) {
      setModalContent(item);
      setModalType('upgrade');
      return;
    }

    if (item.isPremium && !purchasedItems.includes(item.id)) {
      setModalContent(item);
      setModalType('purchase');
    } else {
      alert(`Playing ${item.title}!`);
    }
  };

  // Handle payment success
  const handlePaymentSuccess = async (itemId?: string) => {
    if (!user || !itemId) return;
    const purchaseRef = doc(db, 'users', user.uid, 'purchases', itemId);
    await setDoc(purchaseRef, { itemId: Number(itemId), purchasedAt: new Date() });
    setPurchasedItems([...purchasedItems, Number(itemId)]);
    setModalContent(null);
    setModalType(null);
    alert('Purchase successful! Enjoy your content!');
  };

  // Filter content
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

  const filteredKidStars = kidStars.filter((star) =>
    star.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    star.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredChallenges = musicChallenges.filter((challenge) =>
    challenge.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    challenge.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle loading state
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;
  }

  // Handle error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="text-center">
          <p>Error: {error}</p>
          <motion.button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-rose-600 text-white rounded-md"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            role="button"
            aria-label="Retry"
          >
            Try Again
          </motion.button>
        </div>
      </div>
    );
  }

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
          backgroundImage: `url(${thumbnailUrls[featuredContent[0].thumbnail] || '/placeholder.jpg'})`,
          backgroundSize: 'cover',
          backgroundPosition: `${50 + mousePosition.x * 10}% ${50 + mousePosition.y * 10}%`,
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
            Welcome to MusicFlix!
          </motion.h2>
          <p className="text-xl sm:text-2xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
            Sing, dance, and groove with fun songs and videos!
          </p>
          <motion.button
            className="inline-flex items-center px-8 py-4 bg-rose-600 text-white rounded-full font-semibold hover:bg-rose-700 opacity-50 cursor-not-allowed"
            onClick={() => alert('Starting the party!')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            role="button"
            aria-label="Start the Party"
            disabled
          >
            <Play className="w-6 h-6 mr-2" />
            Start the Party! (Coming Soon)
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
              placeholder="Find songs, dances, videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-900/80 rounded-full text-white border border-rose-500/20 w-full sm:w-80 focus:outline-none focus:ring-2 focus:ring-rose-500"
              aria-label="Search content"
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
              role="button"
              aria-label={`Go to ${category.name}`}
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
            Top Music Picks
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
                      {item.isPremium && !purchasedItems.includes(item.id) && (
                        <span className="text-sm text-rose-400 font-semibold">
                          {item.membershipRequired ? item.membershipRequired.replace('membership_', '').toUpperCase() : 'PREMIUM'}
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between mt-3">
                      <motion.button
                        onClick={() => handleContentClick(item)}
                        className="inline-flex items-center px-4 py-2 bg-rose-600 text-white rounded-md text-sm font-semibold hover:bg-rose-700"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        role="button"
                        aria-label={`Play ${item.title}`}
                      >
                        {item.type === 'dance' ? <PartyPopper className="w-4 h-4 mr-2" /> : item.type === 'music_video' ? <Video className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                        {item.isLive ? 'Join Live' : item.type === 'dance' ? 'Dance Now' : 'Play Now'}
                      </motion.button>
                      <motion.button
                        onClick={() => toggleFavorite(item.id)}
                        className="p-2 rounded-full text-white hover:bg-gray-700/50"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        aria-label={favorites.includes(item.id) ? `Remove ${item.title} from favorites` : `Add ${item.title} to favorites`}
                        role="button"
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
              {category.name === 'Sing-Along Songs' ? <Music className="w-8 h-8 text-rose-400 animate-pulse" /> :
               category.name === 'Music Videos' ? <Video className="w-8 h-8 text-rose-400 animate-pulse" /> :
               category.name === 'Kids Dancing & Singing' ? <Music2 className="w-8 h-8 text-rose-400 animate-pulse" /> :
               <Mic className="w-8 h-8 text-rose-400 animate-pulse" />}
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
                        {item.isPremium && !purchasedItems.includes(item.id) && (
                          <span className="text-sm text-rose-400 font-semibold">
                            {item.membershipRequired ? item.membershipRequired.replace('membership_', '').toUpperCase() : 'PREMIUM'}
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between mt-3">
                        <motion.button
                          onClick={() => handleContentClick(item)}
                          className="inline-flex items-center px-4 py-2 bg-rose-600 text-white rounded-md text-sm font-semibold hover:bg-rose-700"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          role="button"
                          aria-label={`Play ${item.title}`}
                        >
                          {item.type === 'dance' ? <PartyPopper className="w-4 h-4 mr-2" /> : item.type === 'music_video' ? <Video className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                          {item.isLive ? 'Join Live' : item.type === 'dance' ? 'Dance Now' : 'Play Now'}
                        </motion.button>
                        <motion.button
                          onClick={() => toggleFavorite(item.id)}
                          className="p-2 rounded-full text-white hover:bg-gray-700/50"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          aria-label={favorites.includes(item.id) ? `Remove ${item.title} from favorites` : `Add ${item.title} to favorites`}
                          role="button"
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

      {/* Kid Stars Spotlight */}
      {filteredKidStars.length > 0 && (
        <motion.section
          className="relative z-10 max-w-7xl mx-auto px-6 py-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <h3 className="text-3xl sm:text-4xl font-bold text-white mb-6 flex items-center gap-3">
            <Wand2 className="w-8 h-8 text-rose-400 animate-pulse" />
            Meet Our Kid Stars
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {filteredKidStars.map((star) => (
              <motion.div
                key={star.id}
                className="relative bg-gray-900/60 border border-rose-500/20 rounded-2xl p-6 backdrop-blur-md shadow-xl hover:shadow-rose-500/50 transition-all"
                variants={sectionVariants}
                whileHover={{ scale: 1.03, y: -8 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-indigo-500/10 rounded-2xl" />
                <div className="relative">
                  <img
                    src={thumbnailUrls[star.image] || '/placeholder.jpg'}
                    alt={star.name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <div className="p-4">
                    <h4 className="text-lg font-semibold text-white">{star.name}</h4>
                    <p className="text-sm text-gray-200 line-clamp-2">{star.description}</p>
                    <div className="flex justify-between mt-3">
                      <motion.button
                        onClick={() => alert(`Watching ${star.name}!`)}
                        className="inline-flex items-center px-4 py-2 bg-rose-600 text-white rounded-md text-sm font-semibold hover:bg-rose-700 opacity-50 cursor-not-allowed"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        role="button"
                        aria-label={`Watch ${star.name}`}
                        disabled
                      >
                        <Heart className="w-4 h-4 mr-2" />
                        Watch {star.name} (Coming Soon)
                      </motion.button>
                      <motion.button
                        onClick={() => toggleFavorite(star.id)}
                        className="p-2 rounded-full text-white hover:bg-gray-700/50"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        aria-label={favorites.includes(star.id) ? `Remove ${star.name} from favorites` : `Add ${star.name} to favorites`}
                        role="button"
                      >
                        <Heart
                          className={`w-5 h-5 ${favorites.includes(star.id) ? 'fill-rose-400 text-rose-400' : ''}`}
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

      {/* Music Challenges Section */}
      {filteredChallenges.length > 0 && (
        <motion.section
          className="relative z-10 max-w-7xl mx-auto px-6 py-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <h3 className="text-3xl sm:text-4xl font-bold text-white mb-6 flex items-center gap-3">
            <Music className="w-8 h-8 text-rose-400 animate-pulse" />
            Dance Challenges
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChallenges.map((challenge) => (
              <motion.div
                key={challenge.id}
                className="relative bg-gray-900/60 border border-rose-500/20 rounded-2xl p-6 backdrop-blur-md shadow-xl hover:shadow-rose-500/50 transition-all"
                variants={sectionVariants}
                whileHover={{ scale: 1.03, y: -8 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-indigo-500/10 rounded-2xl" />
                <div className="relative">
                  <img
                    src={thumbnailUrls[challenge.thumbnail] || '/placeholder.jpg'}
                    alt={challenge.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <div className="p-4">
                    <h4 className="text-lg font-semibold text-white">{challenge.title}</h4>
                    <p className="text-sm text-gray-200">{challenge.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      {challenge.isPremium && !purchasedItems.includes(challenge.id) && (
                        <span className="text-sm text-rose-400 font-semibold">
                          {challenge.membershipRequired ? challenge.membershipRequired.replace('membership_', '').toUpperCase() : 'PREMIUM'}
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between mt-3">
                      <motion.button
                        onClick={() => handleContentClick(challenge)}
                        className="inline-flex items-center px-4 py-2 bg-rose-600 text-white rounded-md text-sm font-semibold hover:bg-rose-700"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        role="button"
                        aria-label={`Try ${challenge.title}`}
                      >
                        <Music className="w-4 h-4 mr-2" />
                        Try Challenge
                      </motion.button>
                      <motion.button
                        onClick={() => toggleFavorite(challenge.id)}
                        className="p-2 rounded-full text-white hover:bg-gray-700/50"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        aria-label={favorites.includes(challenge.id) ? `Remove ${challenge.title} from favorites` : `Add ${challenge.title} to favorites`}
                        role="button"
                      >
                        <Heart
                          className={`w-5 h-5 ${favorites.includes(challenge.id) ? 'fill-rose-400 text-rose-400' : ''}`}
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

      {/* Sing-Along Lyrics Section */}
      <motion.section
        className="relative z-10 max-w-7xl mx-auto px-6 py-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <h3 className="text-3xl sm:text-4xl font-bold text-white mb-6 flex items-center gap-3">
          <Music2 className="w-8 h-8 text-rose-400 animate-pulse" />
          Sing-Along Lyrics
        </h3>
        <div className="relative bg-gray-900/60 border border-rose-500/20 rounded-2xl p-6 backdrop-blur-md shadow-xl hover:shadow-rose-500/50 transition-all text-center">
          <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-indigo-500/10 rounded-2xl" />
          <div className="relative space-y-4">
            <p className="text-lg text-gray-200">Follow along with your favorite songs!</p>
            <motion.button
              className="inline-flex items-center px-6 py-3 bg-rose-600 text-white rounded-md font-semibold hover:bg-rose-700 opacity-50 cursor-not-allowed"
              onClick={() => alert('Viewing lyrics!')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              role="button"
              aria-label="View Lyrics"
              disabled
            >
              <Music2 className="w-5 h-5 mr-2" />
              View Lyrics (Coming Soon)
            </motion.button>
          </div>
        </div>
      </motion.section>

      {/* Access Modal */}
      <AnimatePresence>
        {modalContent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
            role="dialog"
            aria-modal="true"
            aria-label={modalType === 'purchase' ? 'Purchase Modal' : 'Upgrade Membership Modal'}
          >
            <motion.div
              className="bg-gray-900 rounded-2xl max-w-md w-full p-8 relative border border-rose-500/20 shadow-2xl backdrop-blur-lg"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              transition={{ duration: 0.4 }}
              ref={modalRef}
            >
              <motion.button
                onClick={() => {
                  setModalContent(null);
                  setModalType(null);
                }}
                className="absolute top-4 right-4 text-rose-400 hover:text-red-500"
                whileHover={{ rotate: 90 }}
                aria-label="Close modal"
                role="button"
              >
                <X className="w-6 h-6" />
              </motion.button>
              {modalType === 'purchase' ? (
                <>
                  <h3 className="text-xl font-bold text-rose-400 mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 animate-pulse" />
                    Unlock {modalContent.title}
                  </h3>
                  <div className="grid gap-4 text-white">
                    <p className="text-gray-200">
                      Pay ₹{'price' in modalContent ? modalContent.price || 5 : 5} to access this premium content.
                    </p>
                    {user ? (
                      <RazorTransaction
                        amount={'price' in modalContent ? modalContent.price || 5 : 5}
                        itemId={modalContent.id.toString()}
                        transactionType="content_purchase"
                        onSuccess={() => handlePaymentSuccess(modalContent.id.toString())}
                      />
                    ) : (
                      <motion.button
                        onClick={openLoginModal}
                        className="px-4 py-2 bg-rose-600 text-white rounded-md font-semibold hover:bg-rose-700"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        role="button"
                        aria-label="Log in to purchase"
                      >
                        Log in to Purchase
                      </motion.button>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-bold text-rose-400 mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 animate-pulse" />
                    Upgrade to Access {modalContent.title}
                  </h3>
                  <div className="grid gap-4 text-white">
                    <p className="text-gray-200">
                      {user
                        ? `You need a ${'membershipRequired' in modalContent && modalContent.membershipRequired ? modalContent.membershipRequired.replace('membership_', '') : 'premium'} membership to access this content.`
                        : `Please log in to access ${modalContent.title}.`}
                    </p>
                    <motion.button
                      onClick={user ? openMembershipModal : openLoginModal}
                      className="px-4 py-2 bg-rose-600 text-white rounded-md font-semibold hover:bg-rose-700"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      role="button"
                      aria-label={user ? 'Upgrade Membership' : 'Log in'}
                    >
                      {user ? 'Upgrade Membership' : 'Log in'}
                    </motion.button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="relative z-10 bg-gray-900/60 border-t border-rose-500/20 p-8 text-center backdrop-blur-md">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl sm:text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Cake className="w-8 h-8 text-rose-400 animate-pulse" />
            Made for Little Rockstars
          </h3>
          <p className="text-lg text-gray-200 mb-4">MusicFlix is your place to sing, dance, and shine!</p>
          <div className="flex justify-center gap-6">
            <Link to="/about" className="text-gray-200 hover:text-rose-400 focus:outline-none focus:underline" aria-label="About">
              About
            </Link>
            <Link to="/terms" className="text-gray-200 hover:text-rose-400 focus:outline-none focus:underline" aria-label="Terms">
              Terms
            </Link>
            <Link to="/privacy" className="text-gray-200 hover:text-rose-400 focus:outline-none focus:underline" aria-label="Privacy">
              Privacy
            </Link>
            <Link to="/contact" className="text-gray-200 hover:text-rose-400 focus:outline-none focus:underline" aria-label="Contact">
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

export default KidsMusicFlixUI;