// src/pages/Home.tsx
import { FC } from 'react';
import { motion } from 'framer-motion';
import SwytchErrorBoundary from '../components/ErrorBoundaryComponent';
import UserOverviewCard from '../components/home/UserOverviewCard';
import MembershipStatusOverview from '../components/home/MembershipStatusOverview';
import { PageProps } from '../lib/types';

const Home: FC<PageProps> = ({
  userId,
  playerData,
  setActiveModal,
  setShowMessage,
}) => {


  return (
    <SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}>
      <motion.div className="min-h-screen text-foreground max-w-7xl mx-auto py-16 px-4">
        <h1 className="text-5xl font-extrabold text-center mb-4">Galactic Command Center</h1>
        <p className="text-xl text-muted-foreground text-center mb-12">
          Welcome back, {playerData?.username || 'Hunter'}. Your cosmic odyssey continues here.
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <UserOverviewCard
            username={playerData?.username || 'Guest'}
            jewelsBalance={playerData?.joules || 0}
            goldBalance={playerData?.gold || 0}
            isPETMember={playerData?.isPETMember || false}
            userId={userId}
            walletAddress={playerData?.walletAddress || null}
          />
          <MembershipStatusOverview
            membership={playerData?.membership || 'none'}
            isPETMember={playerData?.isPETMember || false}
            setActiveModal={setActiveModal}
            setShowMessage={setShowMessage}
          />
        </div>
      </motion.div>
    </SwytchErrorBoundary>
  );
};
export default Home;