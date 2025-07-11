import { motion } from 'framer-motion';
import { Code, Cpu, Gavel, Link as LinkIcon, Users, UserX } from 'lucide-react'; // Renamed Link to LinkIcon to avoid conflict with react-router-dom Link

// No local interface for ProhibitedContentProps as it's self-contained and takes no props.

interface ProhibitedItem { // Local interface for clarity, as it's only used here
  icon: React.ElementType; // Lucide icon components are React.ElementType
  title: string; // Added for clarity, though not rendered directly
  description: string;
}

const prohibitedContentItems: ProhibitedItem[] = [ // Renamed from 'donts' for clarity
  { icon: UserX, title: 'Illegal Activities', description: 'Illegal activities.' },
  { icon: Code, title: 'Malicious Code', description: 'Malicious code.' },
  { icon: LinkIcon, title: 'Unauthorized Commercial Use', description: 'Unauthorized commercial use.' },
  { icon: Cpu, title: 'Security Interference', description: 'Security interference.' },
  { icon: Users, title: 'Anticompetitive Behavior', description: 'Anticompetitive behavior.' },
];


const ProhibitedContent: React.FC = () => { // No props destructured from FC
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } } }}
      className="text-center"
    >
      <motion.div
        className="relative bg-gray-900/50 border border-rose-500/20 p-6 rounded-2xl shadow-xl backdrop-blur-md hover:shadow-rose-400/30 transition-all bg-gradient-to-r from-red-500/10 to-rose-500/10"
        whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(244, 63, 94, 0.5)' }}
      >
        <div className="space-y-10">
          <h2 className="text-4xl lg:text-5xl font-extrabold text-white flex items-center justify-center gap-4 font-poppins">
            <Gavel className="text-red-400 w-12 h-12 animate-pulse" /> Prohibited Content
          </h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed font-inter">
            Comply with Swytch’s Agreement and laws. Prohibited conduct includes:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {prohibitedContentItems.map((item) => ( // Using the renamed array
              <motion.div
                key={item.title} // FIX: Use item.title as key assuming it's unique
                variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } } }}
                className="bg-gray-800/50 p-6 rounded-lg hover:bg-gray-800/70 transition"
              >
                {/* Dynamically render icon component */}
                {item.icon && <item.icon className="text-rose-400 w-8 h-8 mx-auto mb-4" />}
                <p className="text-sm text-gray-200 font-inter">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
        <p className="text-xl text-cyan-300 italic font-inter mt-8">Avoid blockchain if uncomfortable with risks.</p>
      </motion.div>
    </motion.div>
  );
};

export default ProhibitedContent;