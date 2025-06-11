import { motion } from 'framer-motion';
// Removed: import { GambaUi } from 'gamba-react-ui-v2';
import React from 'react';

const EducationalPanel = () => {
  const variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-900 text-center">
      <motion.h2
        className="text-3xl sm:text-4xl font-bold text-white mb-6"
        variants={variants}
        initial="hidden"
        animate="visible"
      >
        Empowering Education
      </motion.h2>
      <motion.p
        className="text-lg sm:text-xl text-gray-300 max-w-4xl mx-auto mb-12"
        variants={variants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.2 }}
      >
        Swytch features an educational component to assist beneficiaries with a path back to their autonomous, empowered, truly free selves under common/Constitutional law. Explore Swytch Origins to learn more about our mission and vision.
      </motion.p>
      <motion.div
        variants={variants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.4 }}
      >
        <a href="#swytch-origins" // Keep the href for internal section linking
           className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full text-lg transition duration-300 ease-in-out transform hover:scale-105"
           // Applied classes to the <a> tag itself, acting as a button
        >
          Discover Swytch Origins
        </a>
      </motion.div>
    </section>
  );
};

export default EducationalPanel;