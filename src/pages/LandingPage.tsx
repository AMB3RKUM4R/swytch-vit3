// src/pages/LandingPage.tsx
import { FC } from 'react';
import { motion } from 'framer-motion';
import { Users, Brain, DollarSign, Lock, ArrowRight, FileText, Gamepad2 } from 'lucide-react';
import SwytchErrorBoundary from '../components/ErrorBoundaryComponent';
import { usePlayer } from '@/components/context/PlayerContext';
import { useModal } from '@/components/context/ModalContext';
import SwytchCard from '@/components/SwytchCard';
import FeaturedCards from '@/components/FeaturedCards'; // Re-using this component

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } },
};

const buttonVariants = {
  hover: { scale: 1.05, boxShadow: '0 0 20px hsl(var(--primary), 0.5)' },
  tap: { scale: 0.95 },
};

const LandingPage: FC = () => {
  usePlayer();
  const { setActiveModal } = useModal();

  return (
    <SwytchErrorBoundary setShowMessage={() => {}} setActiveModal={setActiveModal}>
      <motion.div
        className="min-h-screen text-foreground font-inter bg-noise overflow-x-hidden"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="relative z-10 max-w-7xl mx-auto pt-24 pb-32 px-4 sm:px-6 lg:px-8">
          
          {/* --- 1. HERO SECTION --- */}
          <motion.section 
            variants={sectionVariants} 
            className="text-center p-8 mb-20"
          >
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 260, damping: 20 }}>
              {/* You can replace this with your actual logo component or image */}
              <Gamepad2 className="mx-auto w-24 h-24 text-primary text-glow-primary mb-6" />
            </motion.div>
            <h1 className="text-5xl lg:text-7xl font-extrabold text-foreground font-russo mb-6 text-glow-primary tracking-tight">
              THE Petaverse OF PURPOSE, POWER & PROOF.
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto font-inter mb-10 leading-relaxed">
              You're not here by accident. You're here because the old world isn't enough.
              Swytch isn't a game. It's a psychological awakening, a socio-economic rebellion, and a self-sustaining ecosystem.
            </p>
            <motion.button
              className="btn-primary text-xl font-russo mx-auto block w-fit px-10 py-4"
              onClick={() => setActiveModal('auth')}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              aria-label="Enter the PETverse"
            >
              Enter the PETverse <ArrowRight className="ml-3 w-6 h-6" />
            </motion.button>
          </motion.section>

          {/* --- 2. THE PSYCHOLOGICAL SHIFT (CALLOUT) --- */}
          <motion.section variants={sectionVariants} className="mb-20">
            <SwytchCard variant="holographic" className="p-8 lg:p-12">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                <div className="lg:col-span-1 text-center lg:text-left">
                  <Brain className="w-16 h-16 text-primary text-glow-primary mx-auto lg:mx-0" />
                </div>
                <div className="lg:col-span-2 text-center lg:text-left">
                  <h2 className="text-3xl font-bold font-poppins text-foreground mb-4">
                    The Psychological Shift
                  </h2>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    In Swytch, you're not just playing. You're participating in the rebirth of identity.
                    The second you log in, you are no longer a passive player. You are a **Beneficiary**.
                  </p>
                  <p className="text-lg text-muted-foreground leading-relaxed mt-4">
                    Not a customer. Not an investor. **You’re entitled to earn** — because you participate in value creation.
                  </p>
                </div>
              </div>
            </SwytchCard>
          </motion.section>

          {/* --- 3. CORE FEATURES SECTION (Using existing component) --- */}
          <motion.section variants={sectionVariants} className="mb-20">
            <h2 className="text-4xl font-bold text-foreground font-russo text-center mb-10 text-glow-secondary tracking-tight">
              A New Order
            </h2>
            <FeaturedCards />
          </motion.section>

          {/* --- 4. THE ECONOMIC FLOW (CALLOUT) --- */}
          <motion.section variants={sectionVariants} className="mb-20">
            <h2 className="text-4xl font-bold text-foreground font-russo text-center mb-10 text-glow-secondary tracking-tight">
              The Economic Flow
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <SwytchCard variant="default" className="p-6">
                <Gamepad2 className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-2xl font-semibold font-poppins text-foreground mb-2">1. Play & Earn</h3>
                <p className="text-muted-foreground">You play Swytch games, earn Energy. Energy is your proof-of-participation.</p>
              </SwytchCard>
              <SwytchCard variant="default" className="p-6">
                <DollarSign className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold font-poppins text-foreground mb-2">2. Convert to Value</h3>
                <p className="text-muted-foreground">Your Energy converts to Swytch Stablecoin, tied to USDT, liquid, and tradable.</p>
              </SwytchCard>
              <SwytchCard variant="default" className="p-6">
                <Lock className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold font-poppins text-foreground mb-2">3. Join & Withdraw</h3>
                <p className="text-muted-foreground">A $10 SPM unlocks the ecosystem. You own your data, control your wallet, and live on your terms.</p>
              </SwytchCard>
            </div>
          </motion.section>

          {/* --- 5. SOCIAL ARCHITECTURE & VISION (CALLOUT) --- */}
          <motion.section variants={sectionVariants} className="mb-20">
            <SwytchCard variant="default" className="p-8 lg:p-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div>
                  <h3 className="text-3xl font-bold font-poppins text-primary mb-4 flex items-center">
                    <Users className="w-8 h-8 mr-3" />
                    The Social Architecture
                  </h3>
                  <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                    Every PET member is linked through the Community Panel. Here, members vote, propose, share, and evolve.
                    No hierarchy — only earned trust.
                  </p>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    You don’t need to fight for a seat at the table — **you build the table.**
                  </p>
                </div>
                <div>
                  <h3 className="text-3xl font-bold font-poppins text-primary mb-4 flex items-center">
                    <FileText className="w-8 h-8 mr-3" />
                    Our Vision
                  </h3>
                  <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                    We are merging psychology, economy, governance, and technology into one loop. This is a generational-level movement.
                  </p>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    We are setting **the new norm** for how digital ecosystems should operate.
                  </p>
                </div>
              </div>
            </SwytchCard>
          </motion.section>

          {/* --- 6. FINAL CTA --- */}
          <motion.section variants={sectionVariants} className="text-center">
            <h2 className="text-4xl font-bold text-foreground font-russo mb-6 text-glow-primary">
              Your New Identity Awaits.
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Once you’re in, you’re not alone, and you’re not public. You’re PET.
              And in Swytch, PETs run the future.
            </p>
            <motion.button
              className="btn-primary text-xl font-russo mx-auto block w-fit px-10 py-4"
              onClick={() => setActiveModal('auth')}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              aria-label="Begin the Swytch"
            >
              Begin the Swytch
            </motion.button>
          </motion.section>

        </div>
      </motion.div>
    </SwytchErrorBoundary>
  );
};

export default LandingPage;