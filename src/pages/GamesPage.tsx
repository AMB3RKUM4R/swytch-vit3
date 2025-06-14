
import Ecosystem from '@/components/Ecosystem';
import LevelsIntro from '@/components/LevelsIntro';
import TransactionStatus from '@/components/TransactionStatus';

export default function GamesPage() {
  return (
    <div >
      <Ecosystem/>
      <LevelsIntro />
      <TransactionStatus/>
    </div>
  );
}
