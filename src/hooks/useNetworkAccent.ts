import { useEffect, useState } from "react";

type NetworkType = "base" | "celo" | "unknown";

// Map common chain IDs to our network types
const CHAIN_ID_TO_NETWORK: Record<number, NetworkType> = {
  // Celo mainnet
  42220: "celo",
  // Celo Sepolia (custom-defined in repo)
  11142220: "celo",
  // Base mainnet
  8453: "base",
  // Base Sepolia (commonly 84531)
  84531: "base",
};

export function useNetworkAccent(pollIntervalMs = 5000) {
  const [networkType, setNetworkType] = useState<NetworkType>("unknown");
  const [accentColor, setAccentColor] = useState("#FCFE52");
  const [accentHover, setAccentHover] = useState("#E6E84A");
  const [foreground, setForeground] = useState("#000");

  const applyFor = (type: NetworkType) => {
    if (type === "base") {
      setAccentColor("#0040CC");
      setAccentHover("#0033AA");
      setForeground("#ffffff");
      document.documentElement.style.setProperty("--network-color", "#0040CC");
      document.documentElement.style.setProperty(
        "--network-color-hover",
        "#0033AA"
      );
      document.documentElement.style.setProperty(
        "--network-foreground",
        "#ffffff"
      );
    } else if (type === "celo") {
      setAccentColor("#FCFE52");
      setAccentHover("#E6E84A");
      setForeground("#000000");
      document.documentElement.style.setProperty("--network-color", "#FCFE52");
      document.documentElement.style.setProperty(
        "--network-color-hover",
        "#E6E84A"
      );
      document.documentElement.style.setProperty(
        "--network-foreground",
        "#000000"
      );
    } else {
      // default fallback
      setAccentColor("#FCFE52");
      setAccentHover("#E6E84A");
      setForeground("#000000");
      document.documentElement.style.setProperty("--network-color", "#FCFE52");
      document.documentElement.style.setProperty(
        "--network-color-hover",
        "#E6E84A"
      );
      document.documentElement.style.setProperty(
        "--network-foreground",
        "#000000"
      );
    }
  };

  useEffect(() => {
    let mounted = true;

    const getChainId = async (): Promise<number | null> => {
      try {
        const anyWin = window as any;
        // Try provider request
        if (anyWin?.ethereum?.request) {
          const hex = await anyWin.ethereum.request({ method: "eth_chainId" });
          // hex might be like '0xA45' - parseInt handles it
          return typeof hex === "string" ? parseInt(hex, 16) : Number(hex);
        }

        // Fallback to chainId prop
        if (anyWin?.ethereum?.chainId) {
          const val = anyWin.ethereum.chainId;
          return typeof val === "string" ? parseInt(val, 16) : Number(val);
        }

        return null;
      } catch (e) {
        return null;
      }
    };

    const evaluate = async () => {
      const id = await getChainId();
      const type =
        id && CHAIN_ID_TO_NETWORK[id] ? CHAIN_ID_TO_NETWORK[id] : "unknown";
      if (!mounted) return;
      if (type !== networkType) {
        setNetworkType(type);
        applyFor(type);
      }
    };

    // Immediate evaluate
    evaluate();

    // Listen for provider chain changes when available (more immediate than polling)
    const anyWin = window as any;
    const onChainChanged = (chainIdHex: string) => {
      const id = parseInt(chainIdHex, 16);
      const t = CHAIN_ID_TO_NETWORK[id] || "unknown";
      setNetworkType(t);
      applyFor(t);
    };

    if (anyWin?.ethereum?.on) {
      anyWin.ethereum.on("chainChanged", onChainChanged);
    }

    const interval = setInterval(evaluate, pollIntervalMs);

    return () => {
      mounted = false;
      if (anyWin?.ethereum?.removeListener) {
        try {
          anyWin.ethereum.removeListener("chainChanged", onChainChanged);
        } catch (e) {
          // ignore
        }
      }
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pollIntervalMs]);

  return { networkType, accentColor, accentHover, foreground };
}
