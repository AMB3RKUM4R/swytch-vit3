
import SwytchExperience from '@/components/Account';
import LevelsIntro from '@/components/LevelsIntro';
import TransactionStatus from '@/components/TransactionStatus';

export default function GamesPage() {
  return (
    <div >
      <SwytchExperience/>
      <LevelsIntro />
      <TransactionStatus/>
    </div>
  );
}
