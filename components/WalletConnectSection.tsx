"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, AlertCircle, CheckCircle } from "lucide-react";
import { useWallet } from "@/src/hooks/useWallet";
import { useToastNotification } from "@/src/hooks/useToastNotification";

interface WalletConnectSectionProps {
  theme: "dark" | "light";
  onWalletClick?: () => void;
}

export function WalletConnectSection({
  theme,
  onWalletClick,
}: WalletConnectSectionProps) {
  const {
    address,
    isConnected,
    chain,
    isConnecting,
    isSwitchingChain,
    connectWallet,
    disconnectWallet,
    switchToSupportedNetwork,
    isOnSupportedNetwork,
  } = useWallet();

  const { showError, showSuccess } = useToastNotification();

  const handleConnect = async () => {
    try {
      await connectWallet();
      showSuccess("Wallet connected successfully!");
    } catch (error) {
      showError("Failed to connect wallet", "Please try again");
    }
  };

  const handleSwitchNetwork = async () => {
    try {
      await switchToSupportedNetwork();
      showSuccess("Switched to supported network!");
    } catch (error) {
      showError(
        "Failed to switch network",
        "Please switch manually in your wallet"
      );
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <Card
      className={`${
        theme === "dark"
          ? "bg-black/50 border-white/10"
          : "bg-white/50 border-black/10"
      } backdrop-blur-sm`}
    >
      <CardHeader>
        <CardTitle
          className={`flex items-center gap-2 ${
            theme === "dark" ? "text-white" : "text-black"
          } font-[family-name:var(--font-share-tech-mono)]`}
        >
          <Wallet className="w-5 h-5" />
          Wallet Connection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isConnected ? (
          <div className="text-center space-y-4">
            <p
              className={`${
                theme === "dark" ? "text-white/70" : "text-black/70"
              }`}
            >
              Connect your wallet to create and manage payment splits
            </p>
            <Button
              onClick={() => {
                if (onWalletClick) {
                  onWalletClick();
                } else {
                  handleConnect();
                }
              }}
              disabled={isConnecting}
              className="bg-[#FCFE52] hover:bg-[#0041CC] text-white"
            >
              {isConnecting ? "Connecting..." : "Connect Wallet"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span
                className={`${
                  theme === "dark" ? "text-white/70" : "text-black/70"
                }`}
              >
                Status:
              </span>
              <Badge
                variant="outline"
                className="flex items-center gap-1 text-white"
              >
                <CheckCircle className="w-3 h-3 text-green-500" />
                Connected
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span
                className={`${
                  theme === "dark" ? "text-white/70" : "text-black/70"
                }`}
              >
                Address:
              </span>
              <Badge variant="secondary" className="font-mono text-black">
                {formatAddress(address!)}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span
                className={`${
                  theme === "dark" ? "text-white/70" : "text-black/70"
                }`}
              >
                Network:
              </span>
              <div className="flex items-center gap-2">
                {isOnSupportedNetwork ? (
                  <Badge
                    variant="outline"
                    className="flex items-center gap-1 text-white"
                  >
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    {chain?.name || "Supported Network"}
                  </Badge>
                ) : (
                  <Badge
                    variant="destructive"
                    className="flex items-center gap-1 text-white"
                  >
                    <AlertCircle className="w-3 h-3" />
                    Wrong Network
                  </Badge>
                )}
              </div>
            </div>

            {!isOnSupportedNetwork && (
              <Button
                onClick={handleSwitchNetwork}
                disabled={isSwitchingChain}
                variant="outline"
                className={`w-full ${
                  theme === "dark"
                    ? "border-white/20 hover:bg-white/10"
                    : "border-black/20 hover:bg-black/10"
                }`}
              >
                {isSwitchingChain
                  ? "Switching..."
                  : "Switch to Base or Celo"}
              </Button>
            )}

            <Button
              onClick={disconnectWallet}
              variant="outline"
              className={`w-full ${
                theme === "dark"
                  ? "border-white/20 hover:bg-white/10"
                  : "border-black/20 hover:bg-black/10"
              }`}
            >
              Disconnect Wallet
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
