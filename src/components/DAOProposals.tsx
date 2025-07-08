import { motion } from 'framer-motion';
import { Vote } from 'lucide-react';
import { useState } from 'react';
import { useModal } from '@/context/ModalContext';
import Confetti from 'react-confetti';
import { auth } from '@/lib/firebaseConfig';

interface DAOProposal {
  id: number;
  title: string;
  description: string;
  votesFor: number;
  votesAgainst: number;
  status: 'Active' | 'Ended';
}

const daoProposals: DAOProposal[] = [
  {
    id: 1,
    title: 'Expand Raziel Library Quests',
    description: 'Add 10 new educational quests to the Raziel Library, rewarding JEWELS for completion.',
    votesFor: 1200,
    votesAgainst: 300,
    status: 'Active',
  },
  {
    id: 2,
    title: 'Launch New PETverse Planet',
    description: 'Introduce a new planet with unique NFTs and multiplayer missions.',
    votesFor: 800,
    votesAgainst: 150,
    status: 'Active',
  },
  {
    id: 3,
    title: 'Increase Yield Boost for Level 9 PETs',
    description: 'Propose a 0.2% yield increase for Mythic PETs to reward long-term loyalty.',
    votesFor: 500,
    votesAgainst: 400,
    status: 'Ended',
  },
];

interface DAOProposalsProps {
  userId: string | null;
}

const DAOProposals: React.FC<DAOProposalsProps> = ({ userId }) => {
  const [selectedProposal, setSelectedProposal] = useState<number | null>(null);
  const [voteChoice, setVoteChoice] = useState<'for' | 'against' | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const { setActiveModal, setShowMessage } = useModal();

  const handleVote = async (proposalId: number, choice: 'for' | 'against') => {
    if (!userId || !auth.currentUser) {
      setActiveModal('auth');
      setShowMessage('⚠️ Please sign in to vote!');
      return;
    }
    setSelectedProposal(proposalId);
    setVoteChoice(choice);
    try {
      setShowMessage(`✅ Voted "${choice}" on "${daoProposals.find((p) => p.id === proposalId)?.title}"!`);
      setActiveModal('payment'); // Prompt deposit for voting power
      setShowConfetti(true);
      setTimeout(() => {
        setSelectedProposal(null);
        setVoteChoice(null);
        setShowConfetti(false);
      }, 1000);
    } catch (err) {
      console.error('Vote submission error:', err);
      setShowMessage('⚠️ Failed to submit vote. Try again.');
      setActiveModal('error');
    }
  };

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 50, scale: 0.95 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut', type: 'spring', stiffness: 100 } } }}
      className="relative space-y-6"
    >
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1620121692029-d088224ddc74?q=80&w=2070&auto=format&fit=crop)' }}
      />
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} />}
      <h3 className="text-3xl font-bold text-white flex items-center justify-center gap-3 font-poppins">
        <Vote className="w-8 h-8 text-cyan-400 animate-pulse" /> Live DAO Proposals
      </h3>
      <p className="text-lg text-gray-300 text-center max-w-3xl mx-auto font-inter">
        Vote on proposals to shape Swytch’s future.
      </p>
      <motion.div
        className="relative bg-gray-900/70 border border-rose-500/30 p-6 rounded-2xl shadow-xl backdrop-blur-md hover:shadow-cyan-500/50 transition-all bg-gradient-to-r from-rose-500/20 to-cyan-500/20"
        whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(34, 211, 238, 0.7)' }}
      >
        <div className="space-y-6">
          {daoProposals.map((proposal) => (
            <motion.div
              key={proposal.id}
              className="bg-gray-900/80 p-6 rounded-lg border border-cyan-500/20"
              whileHover={{ scale: 1.02 }}
            >
              <h4 className="text-xl font-bold text-white mb-2 font-poppins">{proposal.title}</h4>
              <p className="text-gray-300 text-sm mb-4 font-inter">{proposal.description}</p>
              <div className="flex justify-between text-sm text-gray-400 mb-4">
                <span>Votes For: {proposal.votesFor}</span>
                <span>Votes Against: {proposal.votesAgainst}</span>
                <span>Status: {proposal.status}</span>
              </div>
              {proposal.status === 'Active' && (
                <div className="flex gap-4">
                  <motion.button
                    className={`flex-1 py-2 rounded-md font-semibold font-poppins ${
                      selectedProposal === proposal.id && voteChoice === 'for' ? 'bg-green-600' : 'bg-rose-600 hover:bg-cyan-500'
                    }`}
                    onClick={() => handleVote(proposal.id, 'for')}
                    whileHover={{ scale: 1.05 }}
                    disabled={selectedProposal === proposal.id || !userId}
                    aria-label={`Vote for ${proposal.title}`}
                  >
                    Vote For
                  </motion.button>
                  <motion.button
                    className={`flex-1 py-2 rounded-md font-semibold font-poppins ${
                      selectedProposal === proposal.id && voteChoice === 'against' ? 'bg-red-600' : 'bg-rose-600 hover:bg-cyan-500'
                    }`}
                    onClick={() => handleVote(proposal.id, 'against')}
                    whileHover={{ scale: 1.05 }}
                    disabled={selectedProposal === proposal.id || !userId}
                    aria-label={`Vote against ${proposal.title}`}
                  >
                    Vote Against
                  </motion.button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DAOProposals;