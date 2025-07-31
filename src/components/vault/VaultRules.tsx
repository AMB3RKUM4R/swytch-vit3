// src/components/vault/VaultRules.tsx
import { FC, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gavel, Info, ArrowRight } from 'lucide-react';
import SwytchCard from '../SwytchCard';

interface VaultRulesProps {
  // This component is purely presentational, no props needed for now
}

const rules = [
  {
    title: 'Fair Play Policy',
    description: 'Adherence to ethical gaming practices is strictly enforced.',
    details: 'All users must abide by our fair play policy, prohibiting any form of cheating, exploitation, or unfair advantage. Violations will result in account suspension and forfeiture of assets.',
  },
  {
    title: 'Withdrawal Limits',
    description: 'Minimum and maximum withdrawal amounts apply.',
    details: 'To ensure smooth operations and compliance, minimum and maximum limits are set for both crypto and fiat withdrawals. Please refer to the withdrawal section for current limits.',
  },
  {
    title: 'KYC Requirements',
    description: 'Identity verification may be required for fiat withdrawals.',
    details: 'For fiat (UPI/PayPal) withdrawals, Know Your Customer (KYC) procedures are mandatory to comply with financial regulations. This ensures a secure and compliant environment for all users.',
  },
  {
    title: 'Transaction Fees',
    description: 'Small fees may apply to certain transactions.',
    details: 'To cover network costs and operational expenses, a small fee may be applied to crypto swaps, withdrawals, and certain marketplace transactions. Details are transparently displayed before confirmation.',
  },
];

const VaultRules: FC<VaultRulesProps> = () => {
  const [expandedRule, setExpandedRule] = useState<string | null>(null);

  const toggleRule = (title: string) => {
    setExpandedRule(expandedRule === title ? null : title);
  };

  return (
    <SwytchCard gradient="from-gray-700/20 to-gray-900/20" className="p-6">
      <h2 className="text-2xl font-bold text-white font-poppins mb-4 text-center flex items-center justify-center gap-2">
        <Gavel className="w-7 h-7 text-primary" /> Vault Rules & Guidelines
      </h2>
      <p className="text-lg text-gray-300 text-center mb-6">
        Important information for managing your assets in the PETverse Vault.
      </p>

      <div className="space-y-4">
        {rules.map((rule, index) => (
          <motion.div key={index} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.99 }}>
            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 cursor-pointer" onClick={() => toggleRule(rule.title)}>
              <h3 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
                <Info className="w-5 h-5 text-cyan-400" /> {rule.title}
              </h3>
              <p className="text-sm text-gray-300">{rule.description}</p>
              <AnimatePresence>
                {expandedRule === rule.title && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-xs text-gray-400 mt-3"
                  >
                    {rule.details}
                  </motion.p>
                )}
              </AnimatePresence>
              <motion.button
                className="mt-3 text-primary text-sm font-semibold flex items-center gap-1"
                onClick={(e) => { e.stopPropagation(); toggleRule(rule.title); }} // Prevent parent click
                whileHover={{ x: 5 }}
              >
                {expandedRule === rule.title ? 'Show Less' : 'Read More'} <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </SwytchCard>
  );
};

export default VaultRules;