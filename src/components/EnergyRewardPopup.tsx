import { motion } from 'framer-motion';
import React, { useState } from 'react';

interface EnergyRewardPopupProps {
  energy: number;
  onClose: () => void;
}

const EnergyRewardPopup = ({ energy, onClose }: EnergyRewardPopupProps) => {
  const variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: 'easeOut' } },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.3 } },
  };

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center z-50"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={variants}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 bg-gray-900 rounded-2xl border border-cyan-500 shadow-xl px-10 py-8 max-w-md text-center">
        <motion.div
          initial={{ scale: 0.6, rotate: -15 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 120 }}
          className="mx-auto mb-6"
        >
          <img src="/icon_3.gif" alt="Sparkles" className="w-20 h-20 mx-auto rounded-full shadow-md" />
        </motion.div>
        <h2 className="text-3xl font-bold text-white mb-4">You Just Earned Energy!</h2>
        <p className="text-xl text-cyan-400 font-semibold">+{energy} JEWELS</p>
        <p className="text-gray-300 text-sm mt-4">Your energy has been logged into your PET Vault. Keep playing, learning, and earning.</p>
        <button
          onClick={onClose}
          className="mt-6 inline-block px-6 py-2 bg-cyan-600 text-white rounded-full hover:bg-cyan-500 transition"
        >
          Got it!
        </button>
      </div>
    </motion.div>
  );
};

export default EnergyRewardPopup;