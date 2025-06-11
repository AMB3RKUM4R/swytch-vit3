import { motion } from 'framer-motion';


const CommunityOwnership = () => {
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
        Community Ownership
      </motion.h2>
      <motion.p
        className="text-lg sm:text-xl text-gray-300 max-w-4xl mx-auto mb-12"
        variants={variants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.2 }}
      >
        Swytch is a community-driven platform where users have a say in development and direction, fostering a sense of ownership and belonging, leading to a more engaged and loyal user base.
      </motion.p>
    </section>
  );
};

export default CommunityOwnership;