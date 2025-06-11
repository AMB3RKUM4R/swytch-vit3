import Ecosystem from '@/components/Ecosystem';
import EcosystemIntro from '@/components/EcosystemIntro';
import EnergyTrustInfo from '@/components/EnergyTrustInfo';
import LevelsIntro from '@/components/LevelsIntro';
import TrustBenefits from '@/components/TrustBenefits';


export default function Withdraw() {
  return (
    <div>
      <Ecosystem/>
      <EnergyTrustInfo/>
      <LevelsIntro/>
      <TrustBenefits/>
      <EcosystemIntro/>
    </div>
  );
}
