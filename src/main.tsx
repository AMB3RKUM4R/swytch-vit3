// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';

// Context Providers
import { ModalProvider } from './components/context/ModalContext';
import { ThemeProvider } from './components/context/ThemeContext';
import { PlayerProvider } from './components/context/PlayerContext';

// Configs and App Component
import { wagmiConfig } from './lib/wagmi';
import App from './App';

// Global styles
import '@rainbow-me/rainbowkit/styles.css';
import './index.css';

// Initialize React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60, // 1 minute
    },
  },
});

// Initial options for the PayPal SDK
const initialPayPalOptions = {
    clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID || "sb",
    currency: "USD",
    intent: "capture",
};

const Root: React.FC = () => {
  return (
    <React.StrictMode>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <WagmiProvider config={wagmiConfig}>
            <RainbowKitProvider theme={darkTheme({})}>
              <PayPalScriptProvider options={initialPayPalOptions}>
                <ThemeProvider>
                  <ModalProvider>
                    <PlayerProvider>
                      <App />
                    </PlayerProvider>
                  </ModalProvider>
                </ThemeProvider>
              </PayPalScriptProvider>
            </RainbowKitProvider>
          </WagmiProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
};

// --- THIS IS THE FIX ---

const container = document.getElementById('root');

if (container) {
  // Check if a root has already been created.
  // We check an internal property to avoid this warning in HMR.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let root = (container as any)._reactRootContainer; 
  
  if (!root) {
    // If no root exists, create one and store it.
    root = ReactDOM.createRoot(container);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (container as any)._reactRootContainer = root;
  }

  // Call render on the existing or new root.
  root.render(<Root />);
  
} else {
  console.error('Failed to find the root element to mount React.');
}