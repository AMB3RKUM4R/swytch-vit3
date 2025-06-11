
import EnergyBreakdown from '@/components/EnergyBreakdown';
import EnergyExplanation from '@/components/EnergyExplanation';
import EnergyTrustInfo from '@/components/EnergyTrustInfo';

import PrivateEnergyTrust from '@/components/PrivateEnergyTrust';

export default function Home() {
  return (
    <div >
      <PrivateEnergyTrust/>
      <EnergyBreakdown/>
      <EnergyTrustInfo/>
      <EnergyExplanation/>
    </div>
  );
}
