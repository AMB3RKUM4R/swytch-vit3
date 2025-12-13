import { createContext, useContext, useState, ReactNode, FC } from 'react';

interface WebGLContextType {
  activeGameId: string | null;
  setActiveGameId: (id: string | null) => void;
  visualMode: 'DEFAULT' | 'INTENSE' | 'Glitch'; // For visual effects
  setVisualMode: (mode: 'DEFAULT' | 'INTENSE' | 'Glitch') => void;
}

const WebGLContext = createContext<WebGLContextType | undefined>(undefined);

export const WebGLProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [activeGameId, setActiveGameId] = useState<string | null>(null);
  const [visualMode, setVisualMode] = useState<'DEFAULT' | 'INTENSE' | 'Glitch'>('DEFAULT');

  return (
    <WebGLContext.Provider value={{ activeGameId, setActiveGameId, visualMode, setVisualMode }}>
      {children}
    </WebGLContext.Provider>
  );
};

export const useWebGL = () => {
  const context = useContext(WebGLContext);
  if (!context) {
    throw new Error('useWebGL must be used within a WebGLProvider');
  }
  return context;
};