// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { ModalProvider } from './components/context/ModalContext';
import { ThemeProvider } from './components/context/ThemeContext';
import { wagmiConfig } from './lib/wagmi';

// Import the main AppContainer which now handles all app logic
import AppContainer from './App';

// Import global styles
import '@rainbow-me/rainbowkit/styles.css';
import './index.css';

// Initialize the react-query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60, // 1 minute
      gcTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

/**
 * The Root component sets up all the necessary global context providers.
 * The application's UI and logic are now entirely encapsulated within AppContainer.
 */
const Root: React.FC = () => {
  return (
    <React.StrictMode>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <WagmiProvider config={wagmiConfig}>
            <RainbowKitProvider>
              <ThemeProvider>
                <ModalProvider>
                  <AppContainer />
                </ModalProvider>
              </ThemeProvider>
            </RainbowKitProvider>
          </WagmiProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
};

// Render the Root component to the DOM.
ReactDOM.createRoot(document.getElementById('root')!).render(<Root />);
