import { motion } from 'framer-motion';
import React from 'react';

const DSPETDisclosure = () => {
  const variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-900">
      <motion.h2
        className="text-3xl font-bold text-blue-400 mb-4">Decentralized Swytch Private Energy Trust Disclosure</motion.h2>
      <motion.div
        className="max-w-4xl mx-auto text-gray-300"
        variants={variants}
        initial="hidden"
        animate="visible"
      >
        <p className="mb-4">
          DSPET enables JEWELS trading on a blockchain, secure, and private platform governed by community consensus.
        </p>
      </motion.div>
    </section>
  );
};

export default DSPETDisclosure;