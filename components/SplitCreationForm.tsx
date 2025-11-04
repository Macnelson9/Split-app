"use client";

import { useState } from "react";
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
import { Address } from "viem";

interface SplitCreationFormProps {
  theme: "dark" | "light";
  themeColor: string;
  themeForeground: string;
  onSplitCreated?: (splitAddress: string) => void;
}

// Base chain token addresses (you can expand this list)
const BASE_TOKENS = [
  {
    address: "0x0000000000000000000000000000000000000000",
    symbol: "ETH",
    name: "Ethereum",
  },
  {
    address: "0x471EcE3750Da237f93B8E339c536989b8978a438",
    symbol: "Celo",
    name: "CeloToken",
  },
  {
    address: "0xcebA9300f2b948710d2653dD7B07f33A8B32118C",
    symbol: "USDC",
    name: "USD Coin",
  },
  {
    address: "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e",
    symbol: "USDT",
    name: "Tether USD",
  },
  {
    address: "0x765DE816845861e75A25fCA122bb6898B8B1282a",
    symbol: "CUSD",
    name: "Celo USD",
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
  const [selectedToken, setSelectedToken] = useState<string>(
    BASE_TOKENS[0].address
  );
  const [createdSplitAddress, setCreatedSplitAddress] = useState<string | null>(
    null
  );

  const { createSplit, isCreating, isConfirming, isConfirmed } =
    useSplitFactory();
  const { showSuccess, showError } = useToastNotification();

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
      const scaledPercentages = percentages.map((p) => p * 100); // Scale to basis points
      const result = await createSplit(
        selectedToken as Address,
        recipients as Address[],
        scaledPercentages
      );

      showSuccess("Split created successfully!", `Split address: ${result}`);
      // Store the created split address in local state for immediate display
      setCreatedSplitAddress(result);

      // Reset form
      setRecipients([""]);
      setPercentages([100]);
      setSelectedToken(BASE_TOKENS[0].address);

      onSplitCreated?.(result);
    } catch (error) {
      console.error("Create split error:", error);
      showError(
        "Failed to create split",
        error instanceof Error ? error.message : "Please try again"
      );
    }
  };

  const totalPercentage = percentages.reduce((sum, p) => sum + p, 0);
  const isValidPercentage = totalPercentage === 100;

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
                {BASE_TOKENS.map((token) => (
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

            {recipients.map((recipient, index) => (
              <div key={index} className="flex gap-2 items-end">
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
            disabled={isCreating || isConfirming || !isValidPercentage}
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

        {/* Display created split address */}
        {createdSplitAddress && (
          <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <h3
              className={`text-sm font-medium mb-2 ${
                theme === "dark" ? "text-green-400" : "text-green-600"
              }`}
            >
              Split Created Successfully!
            </h3>
            <p
              className={`text-xs mb-3 ${
                theme === "dark" ? "text-white/70" : "text-black/70"
              }`}
            >
              Your split contract has been deployed. You can now deposit funds
              and distribute them according to your rules.
            </p>
            <div className="flex items-center gap-2">
              <code
                className={`text-xs font-mono px-2 py-1 rounded ${
                  theme === "dark"
                    ? "bg-black/50 text-white"
                    : "bg-white/50 text-black"
                }`}
              >
                {createdSplitAddress}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  window.open(
                    `https://celoscan.io/address/${createdSplitAddress}`,
                    "_blank"
                  )
                }
                className={`${
                  theme === "dark"
                    ? "border-white/20 hover:bg-white/10"
                    : "border-black/20 hover:bg-black/10"
                }`}
              >
                View on CeloScan
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
