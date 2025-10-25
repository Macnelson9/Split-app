import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { injected } from "wagmi/connectors";

export function useWallet() {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain();

  const connectWallet = async () => {
    try {
      await connect({ connector: injected() });
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      throw error;
    }
  };

  const disconnectWallet = () => {
    disconnect();
  };

  const switchToBaseSepolia = async () => {
    if (chain?.id !== baseSepolia.id) {
      try {
        await switchChain({ chainId: baseSepolia.id });
      } catch (error) {
        console.error("Failed to switch to Base Sepolia:", error);
        throw error;
      }
    }
  };

  const isOnBaseSepolia = chain?.id === baseSepolia.id;

  return {
    address,
    isConnected,
    chain,
    isConnecting,
    isSwitchingChain,
    connectWallet,
    disconnectWallet,
    switchToBaseSepolia,
    isOnBaseSepolia,
  };
}
