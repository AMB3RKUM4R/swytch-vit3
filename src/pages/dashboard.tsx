import Ecosystem from '@/components/Ecosystem';
import SwytchMembership from '@/components/Membership';
import TransactionStatus from '@/components/TransactionStatus';

export default function Dashboard() {
  return (
    <div>
      <Ecosystem/>
      <SwytchMembership />
      <TransactionStatus />
      
    </div>
  );
}