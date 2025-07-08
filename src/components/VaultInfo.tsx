import { FC } from 'react';

interface VaultInfoProps {
  icon: React.ReactNode | string;
  label: string;
  value: string;
}

const VaultInfo: FC<VaultInfoProps> = ({ icon, label, value }) => (
  <div className="flex items-center gap-2 bg-gray-800/50 border border-neon-green/20 px-4 py-3 rounded-xl shadow-sm backdrop-blur-md">
    <div className="text-neon-green">{icon}</div>
    <div className="text-sm">
      <div className="font-medium text-white font-poppins">{label}</div>
      <div className="text-gray-300 font-inter">{value}</div>
    </div>
  </div>
);

export default VaultInfo;