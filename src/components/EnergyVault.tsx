import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { useRef } from 'react';
import { serverTimestamp } from 'firebase/firestore';
import { EnergyVaultProps } from '@/lib/types';

const vaultClickVariants = {
  click: { scale: [1, 1.2, 1], transition: { duration: 0.3 } },
};

const EnergyVault: React.FC<EnergyVaultProps> = ({ userId, jewelsBalance, setJewelsBalance, dailyClicks, setDailyClicks, loginStreak, updatePlayerFirestore, setActiveModal, setShowMessage }) => {
  const vaultRef = useRef<HTMLCanvasElement>(null);

  const handleVaultClick = () => {
    if (!userId) {
      setActiveModal('auth');
      setShowMessage("⚠️ Please sign in to collect JEWELS!");
      return;
    }
    if (dailyClicks >= 10) {
      setActiveModal('error');
      setShowMessage("⚠️ Daily click limit reached! Come back tomorrow.");
      return;
    }

    const jewelsGain = Math.floor(Math.random() * 3) + 1;
    const newJewelsBalance = jewelsBalance + jewelsGain;
    const newDailyClicks = dailyClicks + 1;

    setJewelsBalance(newJewelsBalance);
    setDailyClicks(newDailyClicks);

    updatePlayerFirestore({
      jewels: newJewelsBalance,
      clicks: newDailyClicks,
      updatedAt: serverTimestamp(),
    }).catch((error) => {
      console.error("Failed to update Firestore:", error);
      setShowMessage("⚠️ Failed to save JEWELS. Please try again.");
      setActiveModal('error');
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
          ctx.clearRect(0, 0, canvas.width, canvas.height);
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
        <p className="text-2xl text-gray-300 font-inter">JEWELS: {jewelsBalance} 💎</p>
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