import EnergyTrustInfo from '@/components/EnergyTrustInfo';
import LevelsIntro from '@/components/LevelsIntro';
import Tokenomics from '@/components/Tokenomics';
import TransactionStatus from '@/components/TransactionStatus';
import TrustBenefits from '@/components/TrustBenefits';


export default function Privacy() {
  return (
    <div >
      <TrustBenefits/>
      <LevelsIntro/>
      <Tokenomics/>
      <TransactionStatus/>
      <EnergyTrustInfo/>
      
    </div>
  );
}
