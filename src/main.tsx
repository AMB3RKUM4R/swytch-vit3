import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';

// Contexts
import { ModalProvider } from './components/context/ModalContext';
import { ThemeProvider } from './components/context/ThemeContext';
import { PlayerProvider } from './components/context/PlayerContext';
import { WebGLProvider } from './components/context/WebglContext'; 

// Config & App
import { wagmiConfig } from './lib/wagmi';
import App from './App';

// Styles
import '@rainbow-me/rainbowkit/styles.css';
import './index.css';

// React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
  },
});

// PayPal (Sandbox defaults used if ENV is missing)
const paypalOptions = {
  clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID || "sb",
  currency: "USD",
  intent: "capture",
  "disable-funding": "credit,card",
};

const Root = () => (
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>
          <RainbowKitProvider 
            theme={darkTheme({
              accentColor: '#00D4FF',
              accentColorForeground: '#000',
              borderRadius: 'large',
              overlayBlur: 'small',
            })}
          >
            <PayPalScriptProvider options={paypalOptions}>
              <ThemeProvider>
                <ModalProvider>
                  <PlayerProvider>
                    {/* CRITICAL: WebGLProvider MUST wrap the App component to manage the game launch state */}
                    <WebGLProvider>
                      <App />
                    </WebGLProvider>
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

const container = document.getElementById('root');
if (container) {
  const root = ReactDOM.createRoot(container);
  root.render(<Root />);
} else {
  throw new Error('Root element not found');
}