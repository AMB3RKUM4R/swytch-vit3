// src/components/Inventory/GameDownloadButton.tsx
import { FC } from 'react';
import { Download } from 'lucide-react';

// This must match your file in the /public folder
const APK_DOWNLOAD_URL = '/swytch-game.apk'; 

const GameDownloadButton: FC = () => {
  return (
    <a
      href={APK_DOWNLOAD_URL}
      download
      className="w-full text-lg py-6 bg-gray-500 text-white hover:bg-gray-600 rounded-md flex items-center justify-center font-semibold transition-colors"
    >
      <Download className="mr-2 h-5 w-5" />
      Download APK
    </a>
  );
};

export default GameDownloadButton;