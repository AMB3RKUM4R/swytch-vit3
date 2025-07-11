import { motion } from 'framer-motion';
import { BarChart3, Coins, Sparkles, UserCheck } from 'lucide-react';

// IMPORTANT: Import Metric and MetricsDashboardProps from lib/types.ts
import { Metric, MetricsDashboardProps as ImportedMetricsDashboardProps } from '../lib/types';


// Metric interface is now imported from lib/types.ts
const metricsData: Metric[] = [ // Use Metric type
  { label: 'Active PETs', value: '1,234', icon: <UserCheck className="w-6 h-6 text-rose-400" /> },
  { label: 'Vault Yields', value: '3.3% APY', icon: <Coins className="w-6 h-6 text-rose-400" /> },
  { label: 'DAO Votes', value: '567', icon: <BarChart3 className="w-6 h-6 text-rose-400" /> },
  { label: 'JEWELS Earned', value: '89,012', icon: <Sparkles className="w-6 h-6 text-rose-400" /> },
];

// Use ImportedMetricsDashboardProps as the type for the FC
const MetricsDashboard: React.FC<ImportedMetricsDashboardProps> = () => { // No props destructured from FC
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 50, scale: 0.95 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut', type: 'spring', stiffness: 100 } } }}
    >
      <motion.div
        className="relative bg-gray-900/50 border border-rose-500/20 p-6 rounded-2xl shadow-xl backdrop-blur-md hover:shadow-rose-400/30 transition-all bg-gradient-to-r from-rose-500/10 to-pink-500/10"
        whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(244, 63, 94, 0.5)' }}
      >
        <div className="space-y-6">
          <h3 className="text-3xl font-bold text-white flex items-center justify-center gap-3 font-poppins">
            <BarChart3 className="w-8 h-8 text-rose-400 animate-pulse" /> Ecosystem Metrics
          </h3>
          <p className="text-lg text-gray-300 text-center max-w-3xl mx-auto font-inter">
            Real-time insights into Swytch’s growth, powered by on-chain data.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {metricsData.map((metric) => ( // Using metric.label as key
              <motion.div
                key={metric.label} // Changed key to metric.label
                className="bg-gray-800/50 p-4 rounded-lg border border-rose-500/20 flex items-center gap-3"
                whileHover={{ scale: 1.05 }}
              >
                <div className="p-2 bg-rose-400/10 rounded-full">{metric.icon}</div> {/* Render icon JSX */}
                <div>
                  <p className="text-sm text-gray-300 font-inter">{metric.label}</p>
                  <p className="text-lg font-bold text-white font-poppins">{metric.value}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MetricsDashboard;