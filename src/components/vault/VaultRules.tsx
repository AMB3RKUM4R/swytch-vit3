// src/components/vault/VaultRules.tsx
import { FC, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gavel, Info, ChevronDown } from 'lucide-react'; // Use ChevronDown
import SwytchCard from '../SwytchCard';

// This component is purely presentational and requires no props

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

const VaultRules: FC = () => {
  const [expandedRule, setExpandedRule] = useState<string | null>(null);

  const toggleRule = (title: string) => {
    setExpandedRule(expandedRule === title ? null : title);
  };

  return (
    <SwytchCard variant="default" className="p-6">
      <h2 className="text-2xl font-bold text-foreground font-poppins mb-4 text-center flex items-center justify-center gap-2">
        <Gavel className="w-7 h-7 text-primary" /> Vault Rules & Guidelines
      </h2>
      <p className="text-lg text-muted-foreground text-center mb-6 font-inter">
        Important information for managing your assets in the PETverse Vault.
      </p>

      <div className="space-y-4">
        {rules.map((rule, index) => (
          <motion.div 
            key={index} 
            className="bg-black/20 p-4 rounded-lg border border-border cursor-pointer"
            onClick={() => toggleRule(rule.title)}
            layout
          >
            <motion.div layout="position" className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-foreground mb-1 font-poppins flex items-center gap-2">
                <Info className="w-5 h-5 text-primary" /> {rule.title}
              </h3>
              <motion.div
                animate={{ rotate: expandedRule === rule.title ? 180 : 0 }}
              >
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              </motion.div>
            </motion.div>
            
            <motion.p layout="position" className="text-sm text-muted-foreground ml-7 font-inter">{rule.description}</motion.p>
            
            <AnimatePresence>
              {expandedRule === rule.title && (
                <motion.p
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: '12px' }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="text-sm text-muted-foreground ml-7 font-inter"
                >
                  {rule.details}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </SwytchCard>
  );
};

export default VaultRules;
