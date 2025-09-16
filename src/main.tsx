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
                    <App />
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

ReactDOM.createRoot(document.getElementById('root')!).render(<Root />);