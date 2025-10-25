import { http, createConfig } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";
import SPLIT_CONTRACT_ABI from "./SPLIT_CONTRACT_ABI.json";

export const config = createConfig({
  chains: [baseSepolia],
  connectors: [
    injected(),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "",
    }),
  ],
  transports: {
    [baseSepolia.id]: http(),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}

export { SPLIT_CONTRACT_ABI };
