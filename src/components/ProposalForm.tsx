import { motion } from 'framer-motion';
import { Vote } from 'lucide-react';
import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import Confetti from 'react-confetti';
import { Dispatch, SetStateAction } from 'react';

interface ProposalFormProps {
  userId: string | null;
  setShowMessage: Dispatch<SetStateAction<string>>;
  setActiveModal: Dispatch<SetStateAction<string | null>>;
  setShowWalletModal: Dispatch<SetStateAction<boolean>>;
}

const ProposalForm: React.FC<ProposalFormProps> = ({ userId, setShowMessage, setActiveModal, setShowWalletModal }) => {
  const [proposalForm, setProposalForm] = useState({ title: '', description: '', category: 'Quests' });
  const [showConfetti, setShowConfetti] = useState(false);

  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      setShowMessage('⚠️ Please sign in to submit a proposal!');
      setActiveModal('auth');
      return;
    }
    if (proposalForm.title.trim() && proposalForm.description.trim()) {
      try {
        await addDoc(collection(db, 'Proposals'), {
          userId,
          title: proposalForm.title,
          description: proposalForm.description,
          category: proposalForm.category,
          votesFor: 0,
          votesAgainst: 0,
          status: 'Active',
          createdAt: serverTimestamp(),
        });
        setShowMessage(`ℹ️ Opening payment for proposal "${proposalForm.title}". Admin will process your request.`);
        setActiveModal('payment');
        setShowWalletModal(true);
        setProposalForm({ title: '', description: '', category: 'Quests' });
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      } catch (err) {
        console.error('Proposal submission error:', err);
        setShowMessage('⚠️ Failed to initiate proposal submission. Try again.');
        setActiveModal('error');
      }
    } else {
      setShowMessage('⚠️ Please fill in all fields!');
      setActiveModal('error');
    }
  };

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } } }}
      className="space-y-6"
    >
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} />}
      <h2 className="text-4xl lg:text-5xl font-extrabold text-white flex items-center justify-center gap-4 font-poppins">
        <Vote className="text-rose-400 w-12 h-12 animate-pulse" /> Submit a Proposal
      </h2>
      <p className="text-lg text-gray-300 text-center max-w-3xl mx-auto leading-relaxed font-inter">
        Propose changes to DSPET governance or services.
      </p>
      <motion.div
        className="relative bg-gray-900/50 border border-rose-500/20 p-6 rounded-2xl shadow-xl backdrop-blur-md hover:shadow-rose-400/30 transition-all bg-gradient-to-r from-cyan-500/10 to-blue-500/10"
        whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(244, 63, 94, 0.5)' }}
      >
        <form onSubmit={handleSubmitProposal} className="space-y-4">
          <div>
            <label htmlFor="proposal-title" className="block text-sm font-medium text-gray-300 mb-1">
              Proposal Title
            </label>
            <input
              id="proposal-title"
              type="text"
              value={proposalForm.title}
              onChange={(e) => setProposalForm({ ...proposalForm, title: e.target.value })}
              placeholder="Enter proposal title"
              className="w-full p-3 bg-gray-800 text-white rounded-md border border-gray-700 focus:border-cyan-500"
              required
              aria-label="Proposal title"
              disabled={!userId}
            />
          </div>
          <div>
            <label htmlFor="proposal-description" className="block text-sm font-medium text-gray-300 mb-1">
              Description
            </label>
            <textarea
              id="proposal-description"
              value={proposalForm.description}
              onChange={(e) => setProposalForm({ ...proposalForm, description: e.target.value })}
              placeholder="Describe your proposal"
              className="w-full p-3 bg-gray-800 text-white rounded-md border border-gray-700 focus:border-cyan-500 h-32 resize-y"
              required
              aria-label="Proposal description"
              disabled={!userId}
            />
          </div>
          <div>
            <label htmlFor="proposal-category" className="block text-sm font-medium text-gray-300 mb-1">
              Category
            </label>
            <select
              id="proposal-category"
              value={proposalForm.category}
              onChange={(e) => setProposalForm({ ...proposalForm, category: e.target.value })}
              className="w-full p-3 bg-gray-800 text-white rounded-md border border-gray-700 focus:border-cyan-500"
              aria-label="Proposal category"
              disabled={!userId}
            >
              <option value="Quests">Quests</option>
              <option value="Planets">Planets</option>
              <option value="Rewards">Rewards</option>
              <option value="Governance">Governance</option>
            </select>
          </div>
          <motion.button
            type="submit"
            className="w-full px-6 py-3 bg-cyan-600 text-white hover:bg-cyan-700 rounded-md font-semibold flex items-center justify-center gap-2 font-poppins"
            whileHover={{ scale: 1.05 }}
            disabled={!userId || !proposalForm.title.trim() || !proposalForm.description.trim()}
            aria-label="Submit Proposal"
          >
            <Vote className="w-5 h-5" /> Submit Proposal
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default ProposalForm;