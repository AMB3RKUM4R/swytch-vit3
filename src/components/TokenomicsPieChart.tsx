import { FC, memo } from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import Tilt from 'react-parallax-tilt';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const pieData = [
  { name: 'Rewards Pool', value: 40 },
  { name: 'Platform Growth', value: 35 },
  { name: 'Education', value: 25 },
];

const COLORS = ['#00FFFF', '#38BDF8', '#6366F1'];

const sectionVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut' } }
};

const TokenomicsPieChart: FC = memo(() => {
  return (
    <motion.div variants={sectionVariants}>
      <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10}>
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-white flex items-center justify-center gap-2 font-poppins">
            <Zap className="w-6 h-6 text-cyan-400 animate-pulse" /> Token Allocation
          </h3>
          <p className="text-gray-300 text-center max-w-xl mx-auto font-inter">Transparent distribution fuels rewards, growth, and education.</p>
          <div role="img" aria-label="Token Allocation Pie Chart" aria-describedby="pie-chart-description">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#ec4899"
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {pieData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #00FFFF', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
            <p id="pie-chart-description" className="sr-only">
              Pie chart: 40% Rewards Pool, 35% Platform Growth, 25% Education.
            </p>
          </div>
        </div>
      </Tilt>
    </motion.div>
  );
});

export default TokenomicsPieChart;