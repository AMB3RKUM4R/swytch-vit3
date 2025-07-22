import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  argentWallet,
  coinbaseWallet,
  ledgerWallet,
  metaMaskWallet,
  rabbyWallet,
  rainbowWallet,
  safeWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import type { Transport } from "viem";
import { createConfig, http } from "wagmi";
import {
  mainnet,
  sepolia,
  polygon,
  polygonMumbai,
  avalanche,
  avalancheFuji,
  optimism,
  optimismGoerli,
  arbitrum,
  arbitrumGoerli,
  linea,
  lineaTestnet,
  base,
  baseGoerli,
  bsc,
  bscTestnet,
} from "wagmi/chains";

// Import images (Vite resolves these as URLs)
// Ensure these image paths are correct in your public folder
import linea_logo from "/linea_logo.png";
import lineaTestnet_logo from "/lineaTestnet_logo.png";

const walletConnectProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;

if (!walletConnectProjectId) {
  // In a production environment, you might want a more graceful fallback or
  // a clear error message in the UI rather than throwing,
  // but for development, this ensures the project ID is set.
  console.warn(
    "WalletConnect project ID is not defined. Please check your environment variables.",
  );
  // Provide a dummy project ID for local development if not set,
  // or handle this error more gracefully in production.
  // For now, we'll proceed, but keep this warning in mind.
}

const connectors = connectorsForWallets(
  [
    {
      groupName: "Recommended",
      wallets: [
        metaMaskWallet,
        rainbowWallet,
        walletConnectWallet,
        ledgerWallet,
        rabbyWallet,
        coinbaseWallet,
        argentWallet,
        safeWallet,
      ],
    },
  ],
  { appName: "Swytch PETverse", projectId: walletConnectProjectId || "YOUR_WALLETCONNECT_PROJECT_ID" }, // Use a default if not set for dev
);

// Fix missing icons - ensure these logos exist in your public folder
const customLinea = { ...linea, iconUrl: linea_logo };
const customLineaTestnet = { ...lineaTestnet, iconUrl: lineaTestnet_logo };

const transports: Record<number, Transport> = {
  [mainnet.id]: http(),
  [sepolia.id]: http(),
  [arbitrum.id]: http(),
  [arbitrumGoerli.id]: http(),
  [optimism.id]: http(),
  [optimismGoerli.id]: http(),
  [base.id]: http(),
  [baseGoerli.id]: http(),
  [polygon.id]: http(),
  [polygonMumbai.id]: http(),
  [avalanche.id]: http(),
  [avalancheFuji.id]: http(),
  [linea.id]: http(),
  [lineaTestnet.id]: http(),
  [bsc.id]: http(),
  [bscTestnet.id]: http(),
};

export const wagmiConfig = createConfig({
  chains: [
    mainnet,
    sepolia,
    arbitrum,
    arbitrumGoerli,
    optimism,
    optimismGoerli,
    base,
    baseGoerli,
    polygon,
    polygonMumbai,
    avalanche,
    avalancheFuji,
    customLinea,
    customLineaTestnet,
    bsc,
    bscTestnet,
  ],
  connectors,
  transports,
});
