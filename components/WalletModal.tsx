"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useConnect, useDisconnect, useAccount } from "wagmi";
import { injected, walletConnect } from "wagmi/connectors";
import { Wallet, X, ExternalLink } from "lucide-react";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const { connectors, connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { isConnected, address } = useAccount();

  const handleConnect = async (connector: any) => {
    try {
      await connect({ connector });
      onClose();
    } catch (error) {
      console.error("Failed to connect:", error);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    onClose();
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-black/95 border-white/20 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Wallet className="w-5 h-5" />
            {isConnected ? "Wallet Connected" : "Connect Wallet"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {isConnected ? (
            <div className="space-y-4">
              <div className="p-4 bg-white/10 rounded-lg">
                <p className="text-sm text-white/70 mb-2">Connected Address:</p>
                <p className="font-mono text-white">
                  {formatAddress(address!)}
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleDisconnect}
                  variant="outline"
                  className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10"
                >
                  Disconnect
                </Button>
                <Button
                  onClick={() =>
                    window.open(
                      `https://sepolia.basescan.org/address/${address}`,
                      "_blank"
                    )
                  }
                  variant="outline"
                  className="border-white/20 hover:bg-white/10"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-white/70">
                Choose a wallet to connect to the application
              </p>

              {connectors.map((connector) => (
                <Button
                  key={connector.id}
                  onClick={() => handleConnect(connector)}
                  disabled={isPending}
                  className="w-full justify-start bg-white/10 hover:bg-white/20 border border-white/20 text-white"
                  variant="outline"
                >
                  <Wallet className="w-4 h-4 mr-3" />
                  {connector.name}
                  {isPending && " (Connecting...)"}
                </Button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
