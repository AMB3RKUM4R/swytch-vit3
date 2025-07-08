import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';
import { useState } from 'react';
import { useModal } from '@/context/ModalContext';

interface TruthPanelProps {
  userId: string | null;
  goldBalance: number;
  setGoldBalance: React.Dispatch<React.SetStateAction<number>>;
  updatePlayerFirestore: (updates: Partial<any>) => Promise<void>;
}

const TruthPanel: React.FC<TruthPanelProps> = ({ userId, goldBalance, setGoldBalance, updatePlayerFirestore }) => {
  const [truthQuery, setTruthQuery] = useState('');
  const [truthResponse, setTruthResponse] = useState('');
  const { setShowMessage } = useModal();

  const handleTruthQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      setShowMessage('⚠️ Please sign in to use the Truth Panel!');
      return;
    }
    const queryCost = 5;
    if (goldBalance < queryCost) {
      setShowMessage(`⚠️ You need at least ${queryCost} JEWELS to use the Truth Panel!`);
      return;
    }
    if (truthQuery.trim()) {
      try {
        const newGoldBalance = goldBalance - queryCost;
        setGoldBalance(newGoldBalance);
        await updatePlayerFirestore({ jewels: newGoldBalance });
        setTruthResponse(`AI Response: Your query "${truthQuery}" is processed by the Truth Panel. Explore the Petaverse for more insights!`);
        setShowMessage('✅ Query processed by Truth Panel!');
        setTruthQuery('');
      } catch (err) {
        console.error('Truth Panel query error:', err);
        setShowMessage('⚠️ Failed to process query. Please try again.');
      }
    }
  };

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 50, scale: 0.95 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut', type: 'spring', stiffness: 100 } } }}
    >
      <motion.div
        className="relative bg-gray-900/50 border border-rose-500/20 p-6 rounded-2xl shadow-xl backdrop-blur-md hover:shadow-rose-400/30 transition-all bg-gradient-to-r from-pink-500/10 to-rose-500/10"
        whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(244, 63, 94, 0.5)' }}
      >
        <div className="space-y-6">
          <h3 className="text-3xl font-bold text-white flex items-center justify-center gap-3 font-poppins">
            <Bot className="w-8 h-8 text-rose-400 animate-pulse" /> Truth Panel
          </h3>
          <p className="text-lg text-gray-300 text-center max-w-3xl mx-auto font-inter">
            Ask the AI-driven Truth Panel about Swytch, powered by protocol rules and DAO consensus.
          </p>
          <form onSubmit={handleTruthQuery} className="max-w-xl mx-auto space-y-4">
            <input
              type="text"
              value={truthQuery}
              onChange={(e) => setTruthQuery(e.target.value)}
              placeholder="Ask about Swytch, PETs, or the Protocol..."
              className="w-full p-3 bg-gray-800 text-white rounded-md border border-gray-700 focus:border-rose-500"
              aria-label="Truth Panel query"
              disabled={!userId || goldBalance < 5}
            />
            <motion.button
              type="submit"
              className="w-full py-3 bg-rose-600 text-white hover:bg-rose-700 rounded-lg font-semibold font-poppins"
              whileHover={{ scale: 1.05 }}
              disabled={!userId || goldBalance < 5 || !truthQuery.trim()}
              aria-label="Submit Truth Panel Query"
            >
              Submit Query
            </motion.button>
          </form>
          {truthResponse && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-gray-300 text-sm mt-4 p-4 bg-gray-800 rounded-lg border border-rose-500/20"
            >
              {truthResponse}
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TruthPanel;