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
        grid: { color: 'rgba(168, 85, 247, 0.2)' },
      },
      x: {
        title: { display: true, text: 'Tier', color: '#FFFFFF', font: { family: 'Inter', size: 14 } },
        ticks: { color: '#FFFFFF', font: { family: 'Inter' } },
        grid: { color: 'rgba(168, 85, 247, 0.2)' },
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

const TrustProgression: React.FC = () => {
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 50, scale: 0.95 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut', type: 'spring', stiffness: 80 } } }}
      className="space-y-8"
    >
      <h3 className="text-3xl font-bold text-white flex items-center justify-center gap-3 font-poppins">
        <BarChart3 className="w-8 h-8 text-rose-400 animate-pulse" /> Reward Progression
      </h3>
      <p className="text-lg text-gray-300 max-w-3xl mx-auto text-center font-inter">
        Visualize how your rewards grow as you climb the tiers.
      </p>
      <motion.div
        className="relative bg-gray-900/50 border border-rose-500/20 p-6 rounded-2xl shadow-xl backdrop-blur-md hover:shadow-rose-400/30 transition-all bg-gradient-to-r from-rose-500/10 to-pink-500/10"
        whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(244, 63, 94, 0.5)' }}
      >
        <div className="h-64">
          <Bar data={chartConfig.data} options={chartConfig.options} />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TrustProgression;