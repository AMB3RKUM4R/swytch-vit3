// src/components/Inventory/GameDownloadButton.tsx
import { FC } from 'react';
import { Download } from 'lucide-react';

const GameDownloadButton: FC = () => {
  return (
    <a
      href="/swytch-game.apk"
      download
      className="btn-secondary w-full py-6 font-black text-lg flex items-center justify-center gap-4 transition-all"
    >
      <Download className="w-5 h-5" />
      Download APK
    </a>
  );
};

export default GameDownloadButton;