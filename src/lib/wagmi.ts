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
import linea_logo from "/linea_logo.png";
import lineaTestnet_logo from "/lineaTestnet_logo.png";

const walletConnectProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;

if (!walletConnectProjectId) {
  throw new Error(
    "WalletConnect project ID is not defined. Please check your environment variables.",
  );
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
  { appName: "Vite-Web3-Boilerplate", projectId: walletConnectProjectId },
);

// Fix missing icons
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