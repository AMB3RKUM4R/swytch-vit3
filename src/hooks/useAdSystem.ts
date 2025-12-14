// src/hooks/useAdSystem.ts
import { useCallback } from 'react';
import { AD_CONFIG } from '@/lib/adConfig';

export const useAdSystem = () => {
  
  const triggerSmartLink = useCallback(() => {
    // Opens the Smartlink in a new tab (Standard Adsterra behavior)
    // This allows the game to reset in the current tab without reloading the page
    if (AD_CONFIG.SMARTLINK_URL) {
        window.open(AD_CONFIG.SMARTLINK_URL, '_blank');
    }
  }, []);

  return { triggerSmartLink };
};