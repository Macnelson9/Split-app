"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Token {
  symbol: string;
  name: string;
  icon: string;
  price?: string;
  usdPrice: number;
}

interface TokenSelectorProps {
  selectedToken: Token;
  onTokenSelect: (token: Token) => void;
  tokens: Token[];
  theme: "dark" | "light";
  label: string;
}

export default function TokenSelector({
  selectedToken,
  onTokenSelect,
  tokens,
  theme,
  label,
}: TokenSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-2">
      <label
        className={`text-sm ${
          theme === "dark" ? "text-white/70" : "text-black/70"
        }`}
      >
        {label}
      </label>
      <div className="relative">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full p-3 border rounded-lg flex items-center justify-between ${
            theme === "dark"
              ? "bg-black/50 border-white/20 hover:bg-white/10"
              : "bg-white/50 border-black/20 hover:bg-black/10"
          }`}
          variant="outline"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">{selectedToken.icon}</span>
            <span className={theme === "dark" ? "text-white" : "text-black"}>
              {selectedToken.symbol}
            </span>
            <span
              className={`text-sm ${
                theme === "dark" ? "text-white/70" : "text-black/70"
              }`}
            >
              {selectedToken.name}
            </span>
          </div>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              isOpen ? "rotate-180" : ""
            } ${theme === "dark" ? "text-white" : "text-black"}`}
          />
        </Button>

        {isOpen && (
          <div
            className={`absolute top-full left-0 right-0 mt-1 border rounded-lg overflow-hidden z-10 ${
              theme === "dark"
                ? "bg-black/90 border-white/20"
                : "bg-white/90 border-black/20"
            } backdrop-blur-sm`}
          >
            {tokens.map((token) => (
              <Button
                key={token.symbol}
                onClick={() => {
                  onTokenSelect(token);
                  setIsOpen(false);
                }}
                className={`w-full justify-start p-3 hover:bg-white/10 border-0 rounded-none ${
                  theme === "dark" ? "text-white" : "text-black"
                }`}
                variant="ghost"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{token.icon}</span>
                  <span>{token.symbol}</span>
                  <span className="text-sm opacity-70">{token.name}</span>
                  {token.price && (
                    <span className="text-sm opacity-50 ml-auto">
                      {token.price}
                    </span>
                  )}
                </div>
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
