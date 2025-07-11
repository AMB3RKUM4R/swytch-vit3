import { FC, memo } from 'react'; // Added memo for performance optimization
import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartConfiguration
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Chart configuration remains local as it's specific to this chart component.
const chartConfig: ChartConfiguration<'bar'> = {
  type: 'bar',
  data: {
    labels: ['Initiate', 'Apprentice', 'Seeker', 'Guardian', 'Sage', 'Archon', 'Alchemist', 'Elder', 'Mythic PET'],
    datasets: [
      {
        label: 'Monthly Reward (%)',
        data: [1.0, 1.3, 1.6, 1.9, 2.2, 2.5, 2.8, 3.1, 3.3],
        backgroundColor: [
          'rgba(244, 63, 94, 0.6)', // Rose
          'rgba(244, 63, 94, 0.65)',
          'rgba(244, 63, 94, 0.7)',
          'rgba(34, 211, 238, 0.6)', // Cyan
          'rgba(34, 211, 238, 0.65)',
          'rgba(34, 211, 238, 0.7)',
          'rgba(244, 63, 94, 0.6)',
          'rgba(244, 63, 94, 0.65)',
          'rgba(244, 63, 94, 0.7)',
        ],
        borderColor: [
          '#F43F5E', // Rose
          '#F43F5E',
          '#F43F5E',
          '#22D3EE', // Cyan
          '#22D3EE',
          '#22D3EE',
          '#F43F5E',
          '#F43F5E',
          '#F43F5E',
        ],
        borderWidth: 1,
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Reward (%)', color: '#FFFFFF', font: { family: 'Inter', size: 14 } },
        ticks: { color: '#FFFFFF', font: { family: 'Inter' } },
        grid: { color: 'rgba(168, 85, 247, 0.2)' }, // Purple-ish grid color
      },
      x: {
        title: { display: true, text: 'Tier', color: '#FFFFFF', font: { family: 'Inter', size: 14 } },
        ticks: { color: '#FFFFFF', font: { family: 'Inter' } },
        grid: { color: 'rgba(168, 85, 247, 0.2)' }, // Purple-ish grid color
      },
    },
    plugins: {
      legend: { labels: { color: '#FFFFFF', font: { family: 'Inter' } } },
      title: {
        display: true,
        text: 'Reward Progression by Tier',
        color: '#FFFFFF',
        font: { family: 'Poppins', size: 18 },
      },
    },
  },
};

const TierProgression: FC = memo(() => { // No props destructured from FC
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 50, scale: 0.95 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut', type: 'spring', stiffness: 80 } } }}
      className="space-y-6"
    >
      <h2 className="text-4xl font-extrabold text-white text-center flex items-center justify-center gap-4 font-poppins">
        <BarChart3 className="w-10 h-10 text-rose-400 animate-pulse" /> Tier Progression
      </h2>
      <p className="text-lg text-gray-300 max-w-3xl mx-auto text-center font-inter">
        Track your journey from Initiate to Mythic PET with increasing rewards.
      </p>
      <motion.div
        className="relative bg-gray-900/50 border border-rose-500/20 p-6 rounded-2xl shadow-xl backdrop-blur-md hover:shadow-rose-400/30 transition-all bg-gradient-to-r from-pink-500/10 to-rose-500/10"
        whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(244, 63, 94, 0.5)' }}
      >
        <div className="p-4 h-96">
          <Bar data={chartConfig.data} options={chartConfig.options} />
        </div>
      </motion.div>
    </motion.div>
  );
});

export default TierProgression;