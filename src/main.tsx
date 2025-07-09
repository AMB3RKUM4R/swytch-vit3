import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { ModalProvider } from './context/ModalContext';
import { ThemeProvider } from './context/ThemeContext';
import { initializeFirebaseAuthAndListen } from './lib/firebaseConfig';
import SwytchErrorBoundary from './components/ErrorBoundaryComponent';
import App from './App';
import '@rainbow-me/rainbowkit/styles.css';
import './index.css';

// Import wagmi configuration
import { wagmiConfig } from './lib/wagmi';

// Initialize Firebase
initializeFirebaseAuthAndListen();

// Create a QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60,
      gcTime: 1000 * 60 * 5,
    },
  },
});

const Root: React.FC = () => {
  // These states are managed in App.tsx and passed down.
  // They are declared here only to satisfy SwytchErrorBoundary's direct prop requirements.
  // In a real application, you might lift these states higher or use Context API
  // to avoid prop drilling if many components need them.
  const [showMessage, setShowMessage] = useState<string>('');
  const [activeModal, setActiveModal] = useState<string | null>(null);

  return (
    <React.StrictMode>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <WagmiProvider config={wagmiConfig}>
            <RainbowKitProvider>
              <ThemeProvider>
                <ModalProvider>
                  {/* SwytchErrorBoundary needs setShowMessage and setActiveModal */}
                  <SwytchErrorBoundary setShowMessage={setShowMessage} setActiveModal={setActiveModal}>
                    {/* App also needs setShowMessage and setActiveModal */}
                    <App setShowMessage={setShowMessage} setActiveModal={setActiveModal} />
                  </SwytchErrorBoundary>
                </ModalProvider>
              </ThemeProvider>
            </RainbowKitProvider>
          </WagmiProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(<Root />);
