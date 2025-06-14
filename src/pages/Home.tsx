
import Ecosystem from '@/components/Ecosystem';
import EnergyBreakdown from '@/components/EnergyBreakdown';

import PrivateEnergyTrust from '@/components/PrivateEnergyTrust';
import SwytchExp from '@/components/SwytchExp';

export default function Home() {
  return (
    <div >
      <Ecosystem/>
      <PrivateEnergyTrust/>
      <EnergyBreakdown/>
      <SwytchExp/>
    </div>
  );
}
