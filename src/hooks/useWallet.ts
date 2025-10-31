import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { baseSepolia, celo, base } from "wagmi/chains";
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

  const switchToSupportedNetwork = async () => {
    if (!chain) return;

    // Define supported networks in order of preference
    const supportedChains = [celo, base, baseSepolia];
    const currentChainId = chain.id;

    // If already on a supported network, do nothing
    if (supportedChains.some(c => c.id === currentChainId)) {
      return;
    }

    // Try to switch to the first supported network that works
    for (const targetChain of supportedChains) {
      try {
        await switchChain({ chainId: targetChain.id });
        return; // Success, exit
      } catch (error) {
        console.warn(`Failed to switch to ${targetChain.name}:`, error);
        // Continue to next chain
      }
    }

    // If all attempts failed, throw the last error
    throw new Error("Failed to switch to any supported network");
  };

  const isOnSupportedNetwork = chain ? [celo.id, base.id, baseSepolia.id, 11142220].includes(chain.id) : false;

  return {
    address,
    isConnected,
    chain,
    isConnecting,
    isSwitchingChain,
    connectWallet,
    disconnectWallet,
    switchToSupportedNetwork,
    isOnSupportedNetwork,
  };
}
