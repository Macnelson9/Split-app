import { http, createConfig } from "wagmi";
import { celo, base } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";
import SPLIT_CONTRACT_ABI from "./SPLIT_BASE_MAINNET_CONTRACT_ABI.json";

export const config = createConfig({
  chains: [celo, base],
  connectors: [
    injected(),
    ...(process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
      ? [
          walletConnect({
            projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
          }),
        ]
      : []),
  ],
  transports: {
    [celo.id]: http(),
    [base.id]: http(),
  },
  ssr: false,
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}

export { SPLIT_CONTRACT_ABI };
