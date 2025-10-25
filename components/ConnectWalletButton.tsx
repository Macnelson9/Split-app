"use client";

import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import { useWallet } from "@/src/hooks/useWallet";
import { useToastNotification } from "@/src/hooks/useToastNotification";

interface ConnectWalletButtonProps {
  theme: "dark" | "light";
}

export function ConnectWalletButton({ theme }: ConnectWalletButtonProps) {
  const { isConnected, isConnecting, connectWallet } = useWallet();
  const { showError, showSuccess } = useToastNotification();

  const handleConnect = async () => {
    try {
      await connectWallet();
      showSuccess("Wallet connected successfully!");
    } catch (error) {
      showError("Failed to connect wallet", "Please try again");
    }
  };

  if (isConnected) {
    return null; // Don't show button if already connected
  }

  return (
    <Button
      onClick={handleConnect}
      disabled={isConnecting}
      className={`flex items-center gap-2 ${
        theme === "dark"
          ? "bg-white/10 hover:bg-white/20 border-white/20"
          : "bg-black/10 hover:bg-black/20 border-black/20"
      } backdrop-blur-sm border rounded-xl px-4 py-2.5 transition-all duration-300`}
    >
      <Wallet className="w-4 h-4" />
      <span className="text-sm font-medium">
        {isConnecting ? "Connecting..." : "Connect Wallet"}
      </span>
    </Button>
  );
}
