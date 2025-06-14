
import JoinPETverse from '@/components/Account';
import EnergyBreakdown from '@/components/EnergyBreakdown';

import PrivateEnergyTrust from '@/components/PrivateEnergyTrust';
import SwytchExp from '@/components/SwytchExp';

export default function Home() {
  return (
    <div >
      <JoinPETverse/>
      <PrivateEnergyTrust/>
      <EnergyBreakdown/>
      <SwytchExp/>
    </div>
  );
}
