
import Ecosystem from '@/components/Ecosystem';
import EcosystemIntro from '@/components/EcosystemIntro';
import EnergyBreakdown from '@/components/EnergyBreakdown';
import EnergyExplanation from '@/components/EnergyExplanation';
import EnergyTrustInfo from '@/components/EnergyTrustInfo';


import TransactionStatus from '@/components/TransactionStatus';

export default function LandingPage () {
  return (
    <div >
  
    <EnergyBreakdown />
    <TransactionStatus/>
    <EnergyTrustInfo/>
    <EnergyExplanation/>
    <Ecosystem/>
    <EcosystemIntro/>
    
    
    </div>
  );
}
