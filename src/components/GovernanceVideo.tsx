import { motion } from 'framer-motion';
import { Rocket, X } from 'lucide-react';

interface GovernanceVideoProps {
  showVideo: boolean;
  setShowVideo: React.Dispatch<React.SetStateAction<boolean>>;
}

const GovernanceVideo: React.FC<GovernanceVideoProps> = ({ showVideo, setShowVideo }) => {
  return (
    <motion.div variants={{ hidden: { opacity: 0, y: 50, scale: 0.95 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut', type: 'spring', stiffness: 100 } }}} className="relative space-y-6 text-center">
      <h3 className="text-3xl font-bold text-white flex items-center justify-center gap-3 font-poppins">
        <Rocket className="w-8 h-8 text-rose-400 animate-pulse" /> How Swytch Governance Works
      </h3>
      <p className="text-lg text-gray-300 max-w-3xl mx-auto font-inter">
        Discover how PETs drive the Petaverse through decentralized decision-making.
      </p>
      <motion.button
        className="inline-flex items-center px-6 py-3 bg-rose-600 text-white hover:bg-rose-700 rounded-full text-lg font-semibold font-poppins"
        onClick={() => setShowVideo(true)}
        whileHover={{ scale: 1.05 }}
        aria-label="Watch Explainer"
      >
        Watch Explainer
      </motion.button>
      {showVideo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            className="bg-gray-900 border border-rose-500/20 rounded-xl p-8 w-full max-w-md shadow-2xl backdrop-blur-lg font-inter"
            tabIndex={-1}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 id="modal-title" className="text-2xl font-bold text-rose-400 flex items-center gap-2 font-poppins">
                <Rocket className="w-6 h-6 animate-pulse" /> Governance Explainer
              </h2>
              <button onClick={() => setShowVideo(false)} aria-label="Close modal">
                <X className="w-6 h-6 text-rose-400 hover:text-red-500" />
              </button>
            </div>
            <iframe
              src="https://www.youtube.com/embed/8cm1x4bC610"
              title="Swytch Governance Explainer"
              className="w-full h-[300px] rounded-lg"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default GovernanceVideo;