
import SwytchMembership from '@/components/Membership';
import TransactionStatus from '@/components/TransactionStatus';



export default function Dashboard() {
  return (
    <div>
      <TransactionStatus/>
      <SwytchMembership/>
    </div>
  );
}
