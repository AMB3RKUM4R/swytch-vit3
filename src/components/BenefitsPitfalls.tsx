import { FC, memo } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, ShieldCheck } from 'lucide-react'; // Import ShieldCheck for the icon
import { SwytchCard } from './SwytchCard';
import { auth } from '@/lib/firebaseConfig'; // Keep auth for auth.currentUser check

// IMPORTANT: Import Dont and BenefitsPitfallsProps from lib/types.ts
import { Dont, BenefitsPitfallsProps as ImportedBenefitsPitfallsProps } from '../lib/types';


// Dont interface is now imported from lib/types.ts

const donts: Dont[] = [ // This array remains local, or could be moved to a constants file.
  {
    title: 'Never Share Keys',
    description: 'Risk losing all assets.',
    details: 'Store keys offline with a Ledger. Avoid unverified sites.',
  },
  {
    title: 'Avoid Shady DApps',
    description: 'Malicious DApps can drain wallets.',
    details: 'Verify permissions and revoke approvals via Etherscan.',
  },
  {
    title: 'Beware Phishing Scams',
    description: 'Fake sites steal funds.',
    details: 'Bookmark swytch.io, use HTTPS, avoid unsolicited prompts.',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut' } },
};

// Use ImportedBenefitsPitfallsProps as the type for the FC
const BenefitsPitfalls: FC<ImportedBenefitsPitfallsProps> = memo(({ handlePitfallsView, setActiveModal, setShowMessage }) => {
  const handleCardClick = (title: string) => {
    // Rely on auth.currentUser for authentication check, as userId prop is used for messages.
    if (!auth.currentUser) {
      setActiveModal('auth');
      setShowMessage('⚠️ Sign in to access security features!');
      return;
    }
    handlePitfallsView(); // Call the prop function
    setShowMessage(`ℹ️ Viewed ${title} pitfall. Secure your wallet now!`);
    setActiveModal('payment'); // Suggest deposit for security upgrades
  };

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="py-16 px-6 sm:px-8 lg:px-16 bg-gray-950 text-center font-inter relative"
    >
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop)' }}
      />
      <div className="max-w-6xl mx-auto space-y-8 relative">
        <h3 className="text-3xl font-bold text-cyan-400 flex items-center justify-center gap-3 font-poppins">
          <AlertTriangle className="w-6 h-6 animate-pulse text-rose-400" /> Crypto Pitfalls to Avoid
        </h3>
        <p className="text-gray-300 max-w-xl mx-auto font-inter">Protect your JEWELS by avoiding these traps.</p>
        <motion.div variants={sectionVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {donts.map((item) => (
            <SwytchCard
              key={item.title}
              gradient="from-rose-500/20 to-cyan-500/20"
              onClick={() => handleCardClick(item.title)}
            >
              <div className="space-y-3">
                <div className="flex items-center text-rose-400">
                  {/* Using ShieldCheck as a generic icon for these points */}
                  <ShieldCheck className="w-6 h-6 mr-2 animate-pulse text-cyan-400" />
                  <h4 className="text-lg font-semibold font-poppins">{item.title}</h4>
                </div>
                <p className="text-sm text-gray-300 font-inter">{item.description}</p>
                <p className="text-sm text-gray-400 font-inter">{item.details}</p>
              </div>
            </SwytchCard>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
});

export default BenefitsPitfalls;