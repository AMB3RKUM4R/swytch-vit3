// src/hooks/useAuthUserWagmi.tsx
import { useAccount, useDisconnect } from 'wagmi';
import { useEffect, useState } from 'react';

interface WagmiAuthHook {
  address: `0x${string}` | undefined;
  isConnected: boolean;
  isDisconnected: boolean;
  disconnect: () => void;
}

export const useAuthUserWagmi = (): WagmiAuthHook => {
  const { address, isConnected, isDisconnected } = useAccount();
  const { disconnect } = useDisconnect();
  
  return {
    address,
    isConnected,
    isDisconnected,
    disconnect,
  };
};