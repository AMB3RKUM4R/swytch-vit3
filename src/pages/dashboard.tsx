
import EnergyTrustInfo from '@/components/EnergyTrustInfo';
import SwytchMembership from '@/components/Membership';
import TransactionStatus from '@/components/TransactionStatus';



export default function Dashboard() {
  return (
    <div>
      <SwytchMembership/>
      <TransactionStatus/>
      <EnergyTrustInfo/>
      <SwytchMembership/>
    </div>
  );
}
