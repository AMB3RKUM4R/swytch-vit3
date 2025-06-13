
import LevelsIntro from '@/components/LevelsIntro';
import EnergyTrustInfo from '@/components/EnergyTrustInfo';
import TransactionStatus from '@/components/TransactionStatus';
import EnergyBreakdown from '@/components/EnergyBreakdown';
import EcosystemIntro from '@/components/EcosystemIntro';

export default function GamesPage() {
  return (
    <div >
      <LevelsIntro />
      <EnergyTrustInfo/>
      <TransactionStatus/>
      <EnergyBreakdown/>
      <EcosystemIntro/>
    </div>
  );
}
