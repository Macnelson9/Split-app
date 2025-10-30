import { http, createConfig } from "wagmi";
import { defineChain } from "viem";
import { celo, base, baseSepolia } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";
import SPLIT_CONTRACT_ABI from "./SPLIT_BASE_MAINNET_CONTRACT_ABI.json";

// Define Celo Sepolia chain (replacing deprecated Alfajores)
export const celoSepolia = defineChain({
  id: 11142220,
  name: "Celo Sepolia",
  nativeCurrency: {
    name: "Celo",
    symbol: "CELO",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://forno.celo-sepolia.celo-testnet.org"],
    },
  },
  blockExplorers: {
    default: {
      name: "Celo Sepolia Explorer",
      url: "https://celo-sepolia.blockscout.com",
    },
  },
  testnet: true,
});

export const config = createConfig({
  chains: [celo, base, baseSepolia, celoSepolia],
  connectors: [
    injected(),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "",
    }),
  ],
  transports: {
    [celo.id]: http(),
    [base.id]: http(),
    [baseSepolia.id]: http(),
    [celoSepolia.id]: http(),
  },
  ssr: true,
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}

export { SPLIT_CONTRACT_ABI };
