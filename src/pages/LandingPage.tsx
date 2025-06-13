
import Ecosystem from '@/components/Ecosystem';
import SwytchExperience from '@/components/SwytchExp';
import AccountSection from "../components/Account";


import TransactionStatus from '@/components/TransactionStatus';

export default function LandingPage () {
  return (
    <div >
     <SwytchExperience/>
     <AccountSection/>
    <TransactionStatus/>
   
    <Ecosystem/>
   
    
    
    </div>
  );
}
