"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ExternalLink, Clock, Coins, Send, Loader2 } from "lucide-react";
import { Address, formatEther } from "viem";
import { useSplitContract } from "@/src/hooks/useSplitContract";
import { useToastNotification } from "@/src/hooks/useToastNotification";
import { useAccount } from "wagmi";
import { baseSepolia, base, celo, celoSepolia } from "wagmi/chains";

interface SplitCardProps {
  splitAddress: Address;
  token: Address;
  createdAt?: number;
  theme: "dark" | "light";
}

export function SplitCard({
  splitAddress,
  token,
  createdAt,
  theme,
}: SplitCardProps) {
  const [depositAmount, setDepositAmount] = useState("");
  const [showDeposit, setShowDeposit] = useState(false);
  const [ethPrice, setEthPrice] = useState<number | null>(null);

  const { chain } = useAccount();

  const {
    balances,
    isFinalized,
    depositNative,
    depositToken,
    distributeNative,
    distributeToken,
    finalize,
    refreshData,
    isWriting,
    isConfirming,
  } = useSplitContract(splitAddress);

  const { showSuccess, showError } = useToastNotification();

  const isEthSplit = token === "0x0000000000000000000000000000000000000000";

  // Determine native token symbol based on network
  const getNativeTokenSymbol = () => {
    if (!chain) return "ETH"; // Default
    if (chain.id === base.id || chain.id === baseSepolia.id) return "ETH";
    if (chain.id === celo.id || chain.id === celoSepolia.id) return "CELO";
    return "ETH";
  };

  // Get explorer URL based on network
  const getExplorerUrl = (address: string) => {
    if (!chain) return `https://basescan.org/address/${address}`; // Default
    if (chain.id === base.id) return `https://basescan.org/address/${address}`;
    if (chain.id === baseSepolia.id)
      return `https://sepolia.basescan.org/address/${address}`;
    if (chain.id === celo.id) return `https://celoscan.io/address/${address}`;
    if (chain.id === celoSepolia.id)
      return `https://celo-sepolia.blockscout.com/address/${address}`;
    return `https://basescan.org/address/${address}`;
  };

  // Get explorer name for button text
  const getExplorerName = () => {
    if (!chain) return "BaseScan";
    if (chain.id === base.id) return "BaseScan";
    if (chain.id === baseSepolia.id) return "BaseScan (Sepolia)";
    if (chain.id === celo.id) return "CeloScan";
    if (chain.id === celoSepolia.id) return "Celo Explorer";
    return "BaseScan";
  };

  // Fetch native token price on component mount
  useEffect(() => {
    const fetchTokenPrice = async () => {
      try {
        const coinId =
          chain?.id === celo.id || chain?.id === celoSepolia.id
            ? "celo"
            : "ethereum";
        const response = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`
        );
        const data = await response.json();
        setEthPrice(data[coinId].usd);
      } catch (error) {
        console.error("Failed to fetch token price:", error);
      }
    };

    if (isEthSplit) {
      fetchTokenPrice();
    }
  }, [isEthSplit, chain?.id]);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatToken = (tokenAddress: string) => {
    if (tokenAddress === "0x0000000000000000000000000000000000000000") {
      return getNativeTokenSymbol();
    }
    return formatAddress(tokenAddress);
  };

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return "Unknown";
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      showError("Invalid amount", "Please enter a valid amount to deposit");
      return;
    }

    try {
      if (token === "0x0000000000000000000000000000000000000000") {
        await depositNative(depositAmount);
        showSuccess(
          `${getNativeTokenSymbol()} deposited successfully!`,
          `Deposited ${depositAmount} ${getNativeTokenSymbol()}`
        );
      } else {
        await depositToken(depositAmount);
        showSuccess(
          "Token deposited successfully!",
          `Deposited ${depositAmount} tokens`
        );
      }
      setDepositAmount("");
      setShowDeposit(false);
      await refreshData();
    } catch (error) {
      console.error("Deposit error:", error);
      showError(
        "Deposit failed",
        error instanceof Error ? error.message : "Please try again"
      );
    }
  };

  const handleDistribute = async () => {
    try {
      if (token === "0x0000000000000000000000000000000000000000") {
        await distributeNative();
        showSuccess(`${getNativeTokenSymbol()} distributed successfully!`);
      } else {
        await distributeToken();
        showSuccess("Tokens distributed successfully!");
      }
      await refreshData();
    } catch (error) {
      console.error("Distribution error:", error);
      showError(
        "Distribution failed",
        error instanceof Error ? error.message : "Please try again"
      );
    }
  };

  const handleFinalize = async () => {
    try {
      await finalize();
      showSuccess("Split finalized successfully!");
      await refreshData();
    } catch (error) {
      console.error("Finalize error:", error);
      showError(
        "Finalization failed",
        error instanceof Error ? error.message : "Please try again"
      );
    }
  };

  const hasBalance =
    balances &&
    Array.isArray(balances) &&
    balances.length >= 2 &&
    ((isEthSplit && balances[0] > BigInt(0)) ||
      (!isEthSplit && balances[1] > BigInt(0)));

  return (
    <Card
      className={`${
        theme === "dark"
          ? "bg-black/50 border-white/10 hover:border-white/20"
          : "bg-white/50 border-black/10 hover:border-black/20"
      } backdrop-blur-sm transition-all duration-300 hover:scale-105`}
    >
      <CardHeader className="pb-3">
        <CardTitle
          className={`text-lg font-bold ${
            theme === "dark" ? "text-white" : "text-black"
          } font-[family-name:var(--font-share-tech-mono)]`}
        >
          Split Contract
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span
              className={`text-sm font-medium ${
                theme === "dark" ? "text-white/70" : "text-black"
              }`}
            >
              Address:
            </span>
            <Badge
              variant="outline"
              className={`font-mono text-xs ${
                theme === "dark" ? "text-white/70" : "text-black"
              }`}
            >
              {formatAddress(splitAddress)}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span
              className={`text-sm font-medium ${
                theme === "dark" ? "text-white/70" : "text-black/70"
              }`}
            >
              Token:
            </span>
            <Badge variant="secondary" className="font-mono text-xs">
              {formatToken(token)}
            </Badge>
          </div>

          {balances && Array.isArray(balances) && balances.length >= 2 && (
            <div className="flex items-center justify-between">
              <span
                className={`text-sm font-medium ${
                  theme === "dark" ? "text-white/70" : "text-black"
                }`}
              >
                Balance:
              </span>
              <span
                className={`font-mono text-small ${
                  theme === "dark" ? "text-white/70" : "text-black"
                }`}
              >
                {isEthSplit
                  ? `${formatEther(balances[0])} ${getNativeTokenSymbol()}`
                  : `${formatEther(balances[1])} tokens`}
              </span>
            </div>
          )}

          {createdAt && (
            <div className="flex items-center justify-between">
              <span
                className={`text-sm font-medium ${
                  theme === "dark" ? "text-white/70" : "text-black"
                }`}
              >
                Created:
              </span>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span
                  className={`font-medium text-xs ${
                    theme === "dark" ? "text-white/70" : "text-black"
                  }`}
                >
                  {formatDate(createdAt)}
                </span>
              </div>
            </div>
          )}

          {isFinalized && (
            <div className="flex items-center justify-between">
              <span
                className={`text-sm font-medium ${
                  theme === "dark" ? "text-white/70" : "text-black/70"
                }`}
              >
                Status:
              </span>
              <Badge variant="destructive" className="text-xs">
                Finalized
              </Badge>
            </div>
          )}
        </div>

        {!isFinalized && (
          <div className="space-y-3">
            {!showDeposit ? (
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeposit(true)}
                  className={`${
                    theme === "dark"
                      ? "border-white/20 hover:bg-white/10"
                      : "border-black/20 hover:bg-black/10"
                  }`}
                >
                  <Coins className="w-4 h-4 mr-1" />
                  Deposit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDistribute}
                  disabled={!hasBalance || isWriting || isConfirming}
                  className={`${
                    theme === "dark"
                      ? "border-white/20 hover:bg-white/10"
                      : "border-black/20 hover:bg-black/10"
                  }`}
                >
                  {isWriting || isConfirming ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-1" />
                  )}
                  Distribute
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label
                    className={`text-sm ${
                      theme === "dark" ? "text-white/70" : "text-black"
                    }`}
                  >
                    Deposit Amount (
                    {isEthSplit ? getNativeTokenSymbol() : formatToken(token)})
                  </Label>
                  <div className="space-y-1">
                    <Input
                      type="number"
                      placeholder="0.0"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      step="0.01"
                      min="0"
                      className={`${
                        theme === "dark"
                          ? "bg-black/50 border-white/20 text-white placeholder:text-white/50"
                          : "bg-white/50 border-black/20 text-black placeholder:text-black/50"
                      }`}
                    />
                    {isEthSplit &&
                      ethPrice &&
                      depositAmount &&
                      parseFloat(depositAmount) > 0 && (
                        <p
                          className={`text-xs ${
                            theme === "dark" ? "text-white/60" : "text-black/60"
                          }`}
                        >
                          ≈ ${(parseFloat(depositAmount) * ethPrice).toFixed(2)}{" "}
                          USD
                        </p>
                      )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleDeposit}
                    disabled={!depositAmount || isWriting || isConfirming}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-black"
                  >
                    {isWriting || isConfirming ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Depositing...
                      </>
                    ) : (
                      "Deposit"
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDeposit(false)}
                    className={`${
                      theme === "dark"
                        ? "border-white/20 hover:bg-white/10"
                        : "border-black/20 hover:bg-black/10"
                    }`}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleFinalize}
              disabled={isWriting || isConfirming}
              className={`w-full ${
                theme === "dark"
                  ? "border-red-500/50 text-red-400 hover:bg-red-500/10"
                  : "border-red-500/50 text-red-600 hover:bg-red-500/10"
              }`}
            >
              {isWriting || isConfirming ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Finalizing...
                </>
              ) : (
                "Finalize Split"
              )}
            </Button>
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          className={`w-full ${
            theme === "dark"
              ? "border-white/20 hover:bg-white/10"
              : "border-black/20 hover:bg-black/10"
          }`}
          onClick={() => window.open(getExplorerUrl(splitAddress), "_blank")}
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          View on {getExplorerName()}
        </Button>
      </CardContent>
    </Card>
  );
}
