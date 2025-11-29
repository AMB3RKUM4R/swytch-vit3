// src/components/context/WebGLContext.tsx
import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

// Define the interface for the WebGL Context
interface WebGLContextType {
  activeGameId: string | null;
  setActiveGameId: (id: string | null) => void;
}

// Create the Context
const WebGLContext = createContext<WebGLContextType | undefined>(undefined);

// Define the Provider Component
export const WebGLProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeGameId, setActiveGameId] = useState<string | null>(null);

  const setGameId = useCallback((id: string | null) => {
    setActiveGameId(id);
  }, []);

  return (
    <WebGLContext.Provider
      value={{
        activeGameId,
        setActiveGameId: setGameId,
      }}
    >
      {children}
    </WebGLContext.Provider>
  );
};

// Custom Hook to consume the context
export const useWebGL = () => {
  const context = useContext(WebGLContext);
  if (context === undefined) {
    throw new Error('useWebGL must be used within a WebGLProvider');
  }
  return context;
};