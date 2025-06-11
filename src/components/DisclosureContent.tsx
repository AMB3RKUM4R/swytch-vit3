import { motion } from 'framer-motion';

const DisclosureContent = () => {
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
        Disclosure Information
      </motion.h2>
      <motion.p
        className="text-lg sm:text-xl text-gray-300 max-w-4xl mx-auto mb-12"
        variants={variants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.2 }}
      >
        The Swytch Private Energy Trust carries risks, including energy market volatility, regulatory changes, and operational or environmental risks. Beneficiaries should review the trust agreement carefully and seek professional advice.
      </motion.p>
    </section>
  );
};

export default DisclosureContent;