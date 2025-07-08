import { FC } from 'react';
import { motion } from 'framer-motion';
import { useModal } from '@/context/ModalContext';

interface VaultMembershipPackagesProps {
  isMember: boolean;
  isPending: boolean;
  handleMembershipPayment: (packageName: string, amount: number) => Promise<void>;
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};

const VaultMembershipPackages: FC<VaultMembershipPackagesProps> = ({ isMember, isPending, handleMembershipPayment }) => {
  const { setShowMessage } = useModal();

  const packages: [string, number][] = [
    ['Standard', 100],
    ['Classic', 250],
    ['Premium', 500],
    ['Royal', 1000],
    ['Elite', 5000],
  ];

  const onPay = async (packageName: string, amount: number) => {
    try {
      await handleMembershipPayment(packageName, amount);
    } catch (err) {
      setShowMessage(`⚠️ Payment failed: ${(err as Error).message || 'Unknown error'}`);
    }
  };

  return (
    <motion.div variants={fadeUp} className="flex flex-wrap gap-4 justify-center">
      {packages.map(([label, value]) => (
        <motion.button
          key={label}
          onClick={() => onPay(label, value)}
          className="rounded-xl px-5 py-3 font-medium text-sm shadow-md backdrop-blur-md bg-gradient-to-br from-purple-500 via-neon-green/50 to-purple-600 hover:from-purple-600 hover:to-neon-green/70 transition text-white font-poppins"
          whileHover={{ scale: 1.05, boxShadow: '0 0 10px rgba(57, 255, 20, 0.5)' }}
          whileTap={{ scale: 0.95 }}
          disabled={isMember || isPending}
          aria-label={`Join ${label} membership for ${value} USDT`}
        >
          {isPending ? 'Processing...' : `${label} ($${value})`}
        </motion.button>
      ))}
    </motion.div>
  );
};

export default VaultMembershipPackages;