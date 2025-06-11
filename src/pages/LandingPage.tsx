
import Ecosystem from '@/components/Ecosystem';
import EcosystemIntro from '@/components/EcosystemIntro';
import EnergyBreakdown from '@/components/EnergyBreakdown';
import PrivateEnergyTrust from '@/components/PrivateEnergyTrust';



import TransactionStatus from '@/components/TransactionStatus';

export default function LandingPage () {
  return (
    <div >
  
    <EnergyBreakdown />
    <TransactionStatus/>
   <PrivateEnergyTrust/>
    <Ecosystem/>
    <EcosystemIntro/>
    
    
    </div>
  );
}
