import { useState, useEffect } from "react";

interface TokenPrice {
  symbol: string;
  name: string;
  icon: string;
  price: string;
  usdPrice: number;
}

interface TokenPrices {
  [key: string]: TokenPrice;
}

// Default token configurations with Celo mainnet addresses
// Only include tokens supported by Paycrest for swap
const TOKEN_CONFIGS = {
  USDC: {
    symbol: "USDC",
    name: "USD Coin",
    icon: "$",
    coingeckoId: "usd-coin",
  },
  USDT: {
    symbol: "USDT",
    name: "Tether USD",
    icon: "₮",
    coingeckoId: "tether",
  },
  CUSD: {
    symbol: "CUSD",
    name: "Celo Dollar",
    icon: "Ξ",
    coingeckoId: "celo-dollar",
  },
};

export function useTokenPrices() {
  const [tokenPrices, setTokenPrices] = useState<TokenPrices>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTokenPrices = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get all CoinGecko IDs
      const ids = Object.values(TOKEN_CONFIGS)
        .map((config) => config.coingeckoId)
        .join(",");

      // Fetch prices from CoinGecko API
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch token prices");
      }

      const data = await response.json();

      // Transform the data into our TokenPrice format
      const newTokenPrices: TokenPrices = {};

      Object.entries(TOKEN_CONFIGS).forEach(([symbol, config]) => {
        const price = data[config.coingeckoId]?.usd || 0;
        newTokenPrices[symbol] = {
          symbol: config.symbol,
          name: config.name,
          icon: config.icon,
          price: `$${price.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
          usdPrice: price,
        };
      });

      setTokenPrices(newTokenPrices);
    } catch (err) {
      console.error("Error fetching token prices:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch prices");

      // Set fallback prices if API fails
      const fallbackPrices: TokenPrices = {};
      Object.entries(TOKEN_CONFIGS).forEach(([symbol, config]) => {
        fallbackPrices[symbol] = {
          symbol: config.symbol,
          name: config.name,
          icon: config.icon,
          price: "$0.00",
          usdPrice: 0,
        };
      });
      setTokenPrices(fallbackPrices);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTokenPrices();

    // Refresh prices every 60 seconds
    const interval = setInterval(fetchTokenPrices, 60000);

    return () => clearInterval(interval);
  }, []);

  const getTokenPrice = (symbol: string): TokenPrice | null => {
    return tokenPrices[symbol] || null;
  };

  const getAvailableTokens = (): TokenPrice[] => {
    return Object.values(tokenPrices);
  };

  return {
    tokenPrices,
    loading,
    error,
    getTokenPrice,
    getAvailableTokens,
    refetch: fetchTokenPrices,
  };
}
