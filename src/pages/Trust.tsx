import TrustBenefits from '@/components/TrustBenefits';
import EnergyTrustInfo from '@/components/EnergyTrustInfo';
import PrivateEnergyTrust from '@/components/PrivateEnergyTrust';
import CommunityOwnership from '@/components/CommunityOwnership';

export default function TrustPage() {
  return (
    <div>
      <PrivateEnergyTrust />
      <TrustBenefits />
      <EnergyTrustInfo />
      
      <CommunityOwnership />
      
    </div>
  );
}