import { FC, memo } from 'react';
import { motion } from 'framer-motion';
import { Target, ArrowRight } from 'lucide-react';
import Tilt from 'react-parallax-tilt';

interface TokenomicsGovernProps {
  setActiveModal: React.Dispatch<React.SetStateAction<string | null>>;
  isPending: boolean;
}

const sectionVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut' } }
};

const TokenomicsGovern: FC<TokenomicsGovernProps> = memo(({ setActiveModal, isPending }) => {
  return (
    <motion.div variants={sectionVariants}>
      <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10}>
        <div className="relative bg-gray-900/50 backdrop-blur-lg rounded-2xl p-8 text-center border border-cyan-500/30 shadow-xl">
          <div className="relative space-y-4">
            <h3 className="text-2xl font-bold text-white flex items-center justify-center gap-2 font-poppins">
              <Target className="w-6 h-6 text-cyan-400 animate-pulse" /> Govern the PETverse
            </h3>
            <p className="text-gray-300 max-w-xl mx-auto font-inter">
              Invest to join our DAO, vote on proposals, and shape the future of our decentralized economy.
            </p>
            <motion.button
              className="inline-flex items-center px-6 py-3 bg-cyan-600 text-white hover:bg-cyan-700 rounded-full font-semibold font-poppins"
              onClick={() => setActiveModal('Join DAO')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Join the DAO"
              disabled={isPending}
            >
              Join the DAO
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1" />
            </motion.button>
          </div>
        </div>
      </Tilt>
    </motion.div>
  );
});

export default TokenomicsGovern;