"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Minus, Loader2 } from "lucide-react";
import { useSplitFactory } from "@/src/hooks/useSplitFactory";
import { useToastNotification } from "@/src/hooks/useToastNotification";
import { celo, base, baseSepolia } from "wagmi/chains";
import { celoSepolia } from "@/lib/wagmi";
import { Address } from "viem";

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

interface SplitCreationFormProps {
  theme: "dark" | "light";
  themeColor: string;
  themeForeground: string;
  onSplitCreated?: (splitAddress: string) => void;
}

// Token addresses for different chains
const ALL_TOKENS = [
  {
    address: "0x0000000000000000000000000000000000000000",
    symbol: "ETH",
    name: "Base Ethereum",
    chainId: 8453, // Base mainnet
  },
  {
    address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    symbol: "USDC",
    name: "USD Coin",
    chainId: 8453, // Base mainnet
  },
  {
    address: "0x471EcE3750Da237f93B8E339c536989b8978a438",
    symbol: "Celo",
    name: "CeloToken",
    chainId: 42220, // Celo mainnet
  },
  {
    address: "0xef4229c8c3250C675F21BCefa42f58EfbfF6002a",
    symbol: "USDC",
    name: "USD Coin",
    chainId: 42220, // Celo mainnet
  },
];

export function SplitCreationForm({
  theme,
  themeColor,
  themeForeground,
  onSplitCreated,
}: SplitCreationFormProps) {
  const [recipients, setRecipients] = useState<string[]>([""]);
  const [percentages, setPercentages] = useState<number[]>([100]);
  const [selectedToken, setSelectedToken] = useState<string>("");
  const [createdSplitAddress, setCreatedSplitAddress] = useState<string | null>(
    null
  );
  const [networkType, setNetworkType] = useState<NetworkType>("unknown");
  const [accentColor, setAccentColor] = useState("#FCFE52");
  const [accentHover, setAccentHover] = useState("#E6E84A");
  const [foreground, setForeground] = useState("#000");

  const { chain } = useAccount();
  const { createSplit, isCreating, isConfirming, isConfirmed, hash } =
    useSplitFactory();
  const { showSuccess, showError } = useToastNotification();

  // Get available tokens for current chain
  const getAvailableTokens = () => {
    if (!chain) {
      return ALL_TOKENS.filter((token) => token.chainId === 8453); // Default to Base
    }
    return ALL_TOKENS.filter((token) => token.chainId === chain.id);
  };

  const availableTokens = getAvailableTokens();

  // Initialize selectedToken based on available tokens
  useEffect(() => {
    if (availableTokens.length > 0 && !selectedToken) {
      setSelectedToken(availableTokens[0].address);
    } else if (
      availableTokens.length > 0 &&
      !availableTokens.some((t) => t.address === selectedToken)
    ) {
      // Reset if current selection is not available for this chain
      setSelectedToken(availableTokens[0].address);
    }
  }, [chain, availableTokens, selectedToken]);

  // Get explorer URL based on network
  const getExplorerUrl = (address: string) => {
    if (!chain) return `https://basescan.org/address/${address}`;
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

  const addRecipient = () => {
    setRecipients([...recipients, ""]);
    setPercentages([...percentages, 0]);
  };

  const removeRecipient = (index: number) => {
    if (recipients.length > 1) {
      setRecipients(recipients.filter((_, i) => i !== index));
      setPercentages(percentages.filter((_, i) => i !== index));
    }
  };

  const updateRecipient = (index: number, value: string) => {
    const newRecipients = [...recipients];
    newRecipients[index] = value;
    setRecipients(newRecipients);
  };

  const updatePercentage = (index: number, value: string) => {
    const newPercentages = [...percentages];
    newPercentages[index] = parseInt(value) || 0;
    setPercentages(newPercentages);
  };

  const validateForm = () => {
    // Check if all recipients are valid addresses
    const addressRegex = /^0x[a-fA-F0-9]{40}$/;
    for (const recipient of recipients) {
      if (!addressRegex.test(recipient)) {
        showError(
          "Invalid recipient address",
          "Please enter valid Ethereum addresses"
        );
        return false;
      }
    }

    // Check if percentages sum to 100 (100%)
    const totalPercentage = percentages.reduce((sum, p) => sum + p, 0);
    if (totalPercentage !== 100) {
      showError("Invalid percentages", "Percentages must sum to 100%");
      return false;
    }

    // Check if recipients and percentages arrays match in length
    if (recipients.length !== percentages.length) {
      showError("Form error", "Recipients and percentages arrays don't match");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const scaledPercentages = percentages.map((p) =>
        BigInt(Math.round(p * 100))
      ); // Scale to basis points
      const result = await createSplit(
        selectedToken as Address,
        recipients as Address[],
        scaledPercentages
      );

      showSuccess("Split creation initiated!", `Transaction: ${result}`);
      // Store the created split address in local state for immediate display
      setCreatedSplitAddress(result);

      // Reset form
      setRecipients([""]);
      setPercentages([100]);
      setSelectedToken(availableTokens[0]?.address || "");

      // onSplitCreated will be called when confirmed
    } catch (error) {
      console.error("Create split error:", error);
      showError(
        "Failed to create split",
        error instanceof Error ? error.message : "Please try again"
      );
    }
  };

  // Call onSplitCreated when transaction is confirmed
  useEffect(() => {
    if (isConfirmed && createdSplitAddress && hash) {
      showSuccess(
        "Split created successfully!",
        `Split address: ${createdSplitAddress}`
      );
      onSplitCreated?.(createdSplitAddress);
    }
  }, [isConfirmed, createdSplitAddress, hash, onSplitCreated, showSuccess]);

  const totalPercentage = percentages.reduce((sum, p) => sum + p, 0);
  const isValidPercentage = totalPercentage === 100;

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
    // Update color when chain changes via wagmi
    if (chain?.id) {
      const type = CHAIN_ID_TO_NETWORK[chain.id] || "unknown";
      if (type !== networkType) {
        setNetworkType(type);
        applyFor(type);
      }
    } else if (networkType !== "unknown") {
      // No chain connected, reset to unknown
      setNetworkType("unknown");
      applyFor("unknown");
    }
  }, [chain?.id, networkType]);

  return (
    <Card
      className={`${
        theme === "dark"
          ? "bg-black/50 border-white/10"
          : "bg-white/50 border-black/10"
      } backdrop-blur-sm rounded-lg`}
    >
      <CardHeader>
        <CardTitle
          className={`${
            theme === "dark" ? "text-white" : "text-black"
          } font-[family-name:var(--font-share-tech-mono)]`}
        >
          Create New Split
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Token Selection */}
          <div className="space-y-2">
            <Label className={theme === "dark" ? "text-white" : "text-black"}>
              Token
            </Label>
            <Select value={selectedToken} onValueChange={setSelectedToken}>
              <SelectTrigger
                className={`${
                  theme === "dark"
                    ? "bg-black/50 border-white/20 text-white"
                    : "bg-white/50 border-black/20 text-black"
                }`}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableTokens.map((token) => (
                  <SelectItem key={token.address} value={token.address}>
                    {token.symbol} - {token.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Recipients and Percentages */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className={theme === "dark" ? "text-white" : "text-black"}>
                Recipients & Percentages
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addRecipient}
                className={`${
                  theme === "dark"
                    ? "border-white/20 hover:bg-white/10"
                    : "border-black/20 hover:bg-black/10"
                }`}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="max-h-48 overflow-y-auto">
              {recipients.map((recipient, index) => (
                <div key={index} className="flex gap-2 items-end mb-4">
                  <div className="flex-1 space-y-2">
                    <Label
                      className={`text-sm ${
                        theme === "dark" ? "text-white/70" : "text-black/70"
                      }`}
                    >
                      Recipient {index + 1}
                    </Label>
                    <Input
                      type="text"
                      placeholder="0x..."
                      value={recipient}
                      onChange={(e) => updateRecipient(index, e.target.value)}
                      className={`${
                        theme === "dark"
                          ? "bg-black/50 border-white/20 text-white placeholder:text-white/50"
                          : "bg-white/50 border-black/20 text-black placeholder:text-black/50"
                      }`}
                    />
                  </div>
                  <div className="w-24 space-y-2">
                    <Label
                      className={`text-sm ${
                        theme === "dark" ? "text-white/70" : "text-black/70"
                      }`}
                    >
                      %
                    </Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={percentages[index] || ""}
                      onChange={(e) => updatePercentage(index, e.target.value)}
                      min="0"
                      max="100"
                      className={`${
                        theme === "dark"
                          ? "bg-black/50 border-white/20 text-white"
                          : "bg-white/50 border-black/20 text-black"
                      }`}
                    />
                  </div>
                  {recipients.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeRecipient(index)}
                      className={`${
                        theme === "dark"
                          ? "border-white/20 hover:bg-white/10"
                          : "border-black/20 hover:bg-black/10"
                      }`}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center text-sm">
              <span
                className={theme === "dark" ? "text-white/70" : "text-black/70"}
              >
                Total: {(totalPercentage / 1).toFixed(2)}%
              </span>
              <span
                className={
                  isValidPercentage ? "text-green-500" : "text-red-500"
                }
              >
                {isValidPercentage ? "✓ Valid" : "✗ Must sum to 100%"}
              </span>
            </div>
          </div>

          <Button
            type="submit"
            disabled={
              isCreating ||
              isConfirming ||
              !isValidPercentage ||
              recipients.length <= 1
            }
            className="w-full"
            style={{
              backgroundColor: themeColor,
              color: themeForeground,
            }}
          >
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Split...
              </>
            ) : isConfirming ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Confirming...
              </>
            ) : (
              "Create Split"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
