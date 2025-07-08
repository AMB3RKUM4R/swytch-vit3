// src/components/MessagePopup.tsx
import { useEffect } from 'react';
import { toast } from 'sonner';

interface MessagePopupProps {
  message: string;
  type: 'success' | 'error' | 'info';
}

const MessagePopup: React.FC<MessagePopupProps> = ({ message, type }) => {
  useEffect(() => {
    toast[type](message, {
      style: {
        background: '#1f2937',
        color: '#f43f5e',
        border: '1px solid #f43f5e',
        borderRadius: '12px',
        padding: '12px 16px',
        backdropFilter: 'blur(8px)',
      },
      className: 'backdrop-blur-sm',
      duration: 3000,
    });
  }, [message, type]);

  return null;
};

export default MessagePopup;