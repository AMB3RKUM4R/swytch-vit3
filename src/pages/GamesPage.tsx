
import LevelsIntro from '@/components/LevelsIntro';
import TransactionStatus from '@/components/TransactionStatus';
import EcosystemIntro from '@/components/EcosystemIntro';

export default function GamesPage() {
  return (
    <div >
      <LevelsIntro />
      <TransactionStatus/>
      <EcosystemIntro/>
    </div>
  );
}
