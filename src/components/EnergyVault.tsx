import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { useRef } from 'react';
import { useModal } from '@/context/ModalContext';

const vaultClickVariants = {
  click: { scale: [1, 1.2, 1], transition: { duration: 0.3 } },
};

interface EnergyVaultProps {
  userId: string | null;
  goldBalance: number;
  setGoldBalance: React.Dispatch<React.SetStateAction<number>>;
  energyBalance: number;
  dailyClicks: number;
  setDailyClicks: React.Dispatch<React.SetStateAction<number>>;
  loginStreak: number;
  updatePlayerFirestore: (updates: Partial<any>) => Promise<void>;
}

const EnergyVault: React.FC<EnergyVaultProps> = ({ userId, goldBalance, setGoldBalance, dailyClicks, setDailyClicks, loginStreak, updatePlayerFirestore }) => {
  const { setActiveModal, setShowMessage } = useModal();
  const vaultRef = useRef<HTMLCanvasElement>(null);

  const handleVaultClick = () => {
    if (dailyClicks >= 10) {
      setActiveModal('error');
      setShowMessage("⚠️ Daily click limit reached! Come back tomorrow.");
      return;
    }
    if (!userId) {
      setActiveModal('auth');
      setShowMessage("⚠️ Please sign in to collect JEWELS!");
      return;
    }
    const jewelsGain = Math.floor(Math.random() * 3) + 1;
    setGoldBalance((prev) => {
      const newGold = prev + jewelsGain;
      updatePlayerFirestore({ jewels: newGold });
      return newGold;
    });
    setDailyClicks((prev) => {
      const newClicks = prev + 1;
      updatePlayerFirestore({ clicks: newClicks });
      return newClicks;
    });
    setShowMessage(`✅ Collected ${jewelsGain} JEWELS!`);
    const canvas = vaultRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        for (let i = 0; i < 5; i++) {
          setTimeout(() => {
            ctx.beginPath();
            ctx.arc(50 + (Math.random() - 0.5) * 20, 50 + (Math.random() - 0.5) * 20, 2, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(244, 63, 94, 0.8)';
            ctx.fill();
            ctx.closePath();
          }, i * 50);
        }
        setTimeout(() => {
          const gradient = ctx.createRadialGradient(50, 50, 10, 50, 50, 50);
          gradient.addColorStop(0, 'rgba(244, 63, 94, 0.8)');
          gradient.addColorStop(1, 'rgba(107, 70, 193, 0.2)');
          ctx.beginPath();
          ctx.arc(50, 50, 45, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();
          ctx.closePath();
        }, 250);
      }
    }
  };

  return (
    <motion.div
      className="relative bg-gray-900/50 border border-rose-500/20 p-6 rounded-2xl shadow-xl backdrop-blur-md hover:shadow-rose-400/30 transition-all bg-gradient-to-r from-rose-500/10 to-rose-400/10"
      whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(244, 63, 94, 0.5)' }}
    >
      <div className="space-y-6 text-center">
        <h3 className="text-3xl font-bold text-white flex items-center justify-center gap-3 font-poppins">
          <Zap className="w-8 h-8 text-rose-400 animate-pulse" /> Energy Vault
        </h3>
        <p className="text-2xl text-gray-300 font-inter">JEWELS: {goldBalance} 💎</p>
        <p className="text-lg text-gray-400 font-inter">Check-In Streak: {loginStreak} Day{loginStreak !== 1 ? 's' : ''}</p>
        <motion.canvas
          ref={vaultRef}
          className="mx-auto cursor-pointer"
          width={100}
          height={100}
          onClick={handleVaultClick}
          variants={vaultClickVariants}
          animate={dailyClicks < 10 ? 'click' : undefined}
          role="button"
          aria-label="Collect JEWELS from Energy Vault"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleVaultClick()}
        />
        <p className="text-sm text-gray-400 font-inter">{dailyClicks < 10 ? `${10 - dailyClicks} clicks left today` : 'Come back tomorrow!'}</p>
        <p className="text-lg text-rose-400 font-inter">Click the Energy Vault to collect JEWELS!</p>
      </div>
    </motion.div>
  );
};

export default EnergyVault;