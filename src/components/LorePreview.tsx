import { motion } from 'framer-motion';
import { BookOpenCheck, ArrowRight, Star } from 'lucide-react';
import { useModal } from '@/context/ModalContext';

interface LoreSnippet {
  title: string;
  excerpt: string;
  icon: React.ElementType;
}

const loreSnippets: LoreSnippet[] = [
  {
    title: 'The Genesis Spark',
    excerpt: 'In the void of the PETverse, a spark ignited—a fusion of Energy and Truth. PETs rose to forge a new cosmos, unbound by chains.',
    icon: Star
  },
  {
    title: 'Raziel’s Archive',
    excerpt: 'Guarded by Raziel, the AI sentinel, ancient knowledge fuels quests. Seek wisdom, earn JEWELS, and shape the PETverse’s fate.',
    icon: BookOpenCheck
  }
];

const LorePreview: React.FC = () => {
  const { setActiveModal } = useModal();

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 50, scale: 0.95 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut', type: 'spring', stiffness: 100 } } }}
      className="space-y-8"
    >
      <h3 className="text-3xl sm:text-4xl font-bold text-white flex items-center justify-center gap-3 font-poppins">
        <BookOpenCheck className="w-8 h-8 sm:w-10 sm:h-10 text-rose-400 animate-pulse" /> Explore the Lore
      </h3>
      <p className="text-lg sm:text-xl text-gray-200 text-center max-w-4xl mx-auto font-inter">
        Dive into the PETverse’s interstellar narrative. Craft your own stories and shape the cosmos.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-10">
        {loreSnippets.map(({ title, excerpt, icon: Icon }, index) => (
          <motion.div
            key={index}
            className="relative bg-gray-900/50 border border-rose-500/20 p-6 rounded-2xl shadow-xl backdrop-blur-md hover:shadow-rose-400/30 transition-all bg-gradient-to-r from-rose-500/10 to-pink-500/10"
            whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(244, 63, 94, 0.5)' }}
            role="button"
            tabIndex={0}
            aria-label={`Lore: ${title}`}
            onClick={() => setActiveModal('loreDetails')}
            onKeyDown={(e) => e.key === 'Enter' && setActiveModal('loreDetails')}
          >
            <div className="relative">
              <div className="flex items-center mb-4 text-rose-400">
                <Icon className="mr-3 w-6 h-6 sm:w-7 sm:h-7 animate-pulse" />
                <h4 className="text-xl sm:text-2xl font-bold font-poppins">{title}</h4>
              </div>
              <p className="text-gray-200 text-sm sm:text-base font-inter">{excerpt}</p>
              <motion.button
                className="mt-4 inline-flex items-center px-4 py-2 bg-rose-600 text-white hover:bg-rose-700 rounded-md text-sm font-semibold group font-poppins"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label={`Read more about ${title}`}
                onClick={() => setActiveModal('loreDetails')}
              >
                Read More
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default LorePreview;