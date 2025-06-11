import { motion } from 'framer-motion';
import { useState } from 'react';

const FAQTrust = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: 'How does the Private Energy Trust ensure security?',
      answer:
        'The Smart Contract Private Energy Trust distributes data across multiple nodes, making it resistant to single-point failures or attacks. It operates on a tamper-proof public ledger, ensuring transparency and accountability.',
    },
    {
      question: 'What are the benefits of a decentralized trust?',
      answer:
        'Decentralized platforms offer increased security, privacy, transparency, lower costs, and community ownership. Users retain control over their data, and transactions are recorded transparently.',
    },
    {
      question: 'What risks are associated with the trust?',
      answer:
        'Risks include energy market volatility, potential regulatory changes, and operational or environmental risks. Beneficiaries should review the trust agreement and seek professional advice.',
    },
  ];

  const variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-900">
      <motion.h2
        className="text-3xl sm:text-4xl font-bold text-white text-center mb-12"
        variants={variants}
        initial="hidden"
        animate="visible"
      >
        Energy Trust FAQs
      </motion.h2>
      <div className="max-w-4xl mx-auto">
        {faqs.map((faq, index) => (
          <motion.div
            key={index}
            className="mb-4 bg-gray-800 rounded-lg shadow-lg"
            variants={variants}
            initial="hidden"
            animate="visible"
            transition={{ delay: index * 0.2 }}
          >
            <button
              className="w-full text-left p-6 text-lg font-semibold text-blue-400 flex justify-between items-center"
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            >
              {faq.question}
              <span>{openIndex === index ? '-' : '+'}</span>
            </button>
            {openIndex === index && (
              <div className="p-6 text-gray-300">{faq.answer}</div>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default FAQTrust;