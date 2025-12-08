import { FC, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gavel, Info, ChevronDown } from 'lucide-react';

const rules = [
  { title: 'Fair Play Policy', description: 'Zero tolerance for exploitation.', details: 'Cheating results in immediate ban and asset forfeiture.' },
  { title: 'Withdrawal Limits', description: 'Min/Max limits apply.', details: 'Crypto: Min 10 J. Fiat: Min $10 USD equivalent. 24h approval cycle.' },
  { title: 'KYC Requirements', description: 'Mandatory for high volume.', details: 'Fiat withdrawals over $500 require ID verification per regulations.' },
  { title: 'Transaction Fees', description: 'Network costs apply.', details: 'Gas fees are deducted from withdrawal amount for crypto transfers.' },
];

const VaultRules: FC = () => {
  const [expandedRule, setExpandedRule] = useState<string | null>(null);

  const toggleRule = (title: string) => {
    setExpandedRule(expandedRule === title ? null : title);
  };

  return (
    <div className="bg-black border border-white/10 p-0">
      <div className="p-4 border-b border-white/10 flex items-center gap-2 bg-white/5">
        <Gavel className="w-5 h-5 text-primary" />
        <h2 className="font-bold text-white text-sm uppercase tracking-wider">Protocol Rules</h2>
      </div>

      <div className="p-4 space-y-2">
        {rules.map((rule, index) => (
          <div 
            key={index} 
            className="bg-black border border-white/10 hover:border-white/30 transition-colors cursor-pointer"
            onClick={() => toggleRule(rule.title)}
          >
            <div className="p-3 flex justify-between items-center">
              <h3 className="text-xs font-bold text-white uppercase flex items-center gap-2">
                <Info className="w-4 h-4 text-gray-500" /> {rule.title}
              </h3>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${expandedRule === rule.title ? 'rotate-180' : ''}`} />
            </div>
            
            <AnimatePresence>
              {expandedRule === rule.title && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-3 pb-3 text-[10px] text-gray-400 font-mono border-t border-white/5 pt-2">
                      <p className="mb-1 text-primary">{rule.description}</p>
                      <p>{rule.details}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VaultRules;