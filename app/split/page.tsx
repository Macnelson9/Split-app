"use client";

import {
  Moon,
  Sun,
  Plus,
  FileText,
  ArrowRightLeft,
  History,
  Home,
} from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useConnect,
  useDisconnect,
  useAccount,
  useSwitchChain,
  useWriteContract,
} from "wagmi";
import { celo, base, baseSepolia } from "wagmi/chains";
import { celoSepolia } from "@/lib/wagmi";
import { Wallet, ExternalLink, ChevronDown } from "lucide-react";
import { SplitCreationForm } from "@/components/SplitCreationForm";
import { SplitCard } from "@/components/SplitCard";
import TokenSelector from "@/components/TokenSelector";
import { useWallet } from "@/src/hooks/useWallet";
import { useSplitFactory } from "@/src/hooks/useSplitFactory";
import { useToastNotification } from "@/src/hooks/useToastNotification";
import { useTokenPrices } from "@/src/hooks/useTokenPrices";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import BankDetailsDialog from "@/components/BankDetailsDialog";
import ERC20_ABI from "@/lib/ERC20_ABI.json";
interface Token {
  symbol: string;
  name: string;
  icon: string;
  price?: string;
  usdPrice: number; // USD price per token
}

export default function SplitPage() {
  // Component state and hooks
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [selectedBank, setSelectedBank] = useState<any>(null);
  const [banks, setBanks] = useState<any[]>([]);
  const [banksLoading, setBanksLoading] = useState(false);
  const [nairaRate, setNairaRate] = useState<number | null>(null);
  const [rateLoading, setRateLoading] = useState(false);
  const [rateError, setRateError] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [isClient, setIsClient] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [decryptKey, setDecryptKey] = useState(0);
  const [userSplits, setUserSplits] = useState<any[]>([]);
  const [activeView, setActiveView] = useState<
    "createSplit" | "mySplits" | "swap" | "transactions"
  >("createSplit");
  const [showWalletOptions, setShowWalletOptions] = useState(false);
  const [fromToken, setFromToken] = useState<Token>({
    symbol: "USDC",
    name: "USD Coin",
    icon: "$",
    price: "$1.00",
    usdPrice: 1,
  });

  const [swapAmount, setSwapAmount] = useState("");
  const [paymentOrderId, setPaymentOrderId] = useState<string | null>(null);
  const [receiveAddress, setReceiveAddress] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showMobileWalletModal, setShowMobileWalletModal] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);

  const { isConnected, address, isOnSupportedNetwork } = useWallet();
  const { connectors, connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { chain } = useAccount();
  const { switchChain } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();
  const isOnCelo = chain?.id === celo.id;
  const isOnBase = chain?.id === base.id;
  const isOnCeloSepolia = chain?.id === celoSepolia.id;
  const isOnBaseSepolia = chain?.id === baseSepolia.id;

  // Determine theme color based on network
  const isOnBaseNetwork = isOnBase || isOnBaseSepolia;
  const isOnCeloNetwork = isOnCelo || isOnCeloSepolia;
  const themeColor = isOnBaseNetwork ? "#0040CC" : "#FCFE52"; // Blue for Base, Yellow for Celo
  const themeColorHover = isOnBaseNetwork ? "#0033AA" : "#E6E84A"; // Darker blue for Base, lighter yellow for Celo
  // Also expose these as global CSS variables so other parts of the app can use them
  useEffect(() => {
    try {
      document.documentElement.style.setProperty("--network-color", themeColor);
      document.documentElement.style.setProperty(
        "--network-color-hover",
        themeColorHover
      );
      document.documentElement.style.setProperty(
        "--network-foreground",
        isOnBaseNetwork ? "#ffffff" : "#000000"
      );
    } catch (e) {
      // ignore in environments without document
    }
  }, [themeColor, themeColorHover, isOnBaseNetwork]);
  const { fetchSplits } = useSplitFactory();
  const { showError, showSuccess, showInfo } = useToastNotification();
  const {
    getAvailableTokens,
    loading: pricesLoading,
    error: pricesError,
  } = useTokenPrices();

  const availableTokens = getAvailableTokens();

  // Update fromToken when availableTokens changes
  useEffect(() => {
    if (availableTokens.length > 0 && fromToken.usdPrice === 0) {
      setFromToken(availableTokens[0]);
    }
  }, [availableTokens, fromToken.usdPrice]);

  useEffect(() => {
    // Load theme from localStorage on mount
    const savedTheme = localStorage.getItem("theme") as "dark" | "light" | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
    setIsClient(true);
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setDecryptKey((prev) => prev + 1);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  const loadUserSplits = useCallback(async () => {
    if (!address || !isOnSupportedNetwork) {
      setUserSplits([]);
      return;
    }
    try {
      const splits = await fetchSplits();
      // For now, we'll just store the addresses. In a real app, you'd fetch more details
      setUserSplits([]);
      setUserSplits(
        splits.map((splitAddress: string) => ({
          address: splitAddress,
          token: "0x0000000000000000000000000000000000000000", // Default to ETH
          createdAt: Date.now() / 1000, // Placeholder timestamp
        }))
      );
    } catch (error) {
      // console.error("Failed to load user splits:", error);
      // showError("Failed to load user splits", "Please try again later");
    }
  }, [address, isOnSupportedNetwork]);

  // Load splits when component mounts or when network/address changes
  useEffect(() => {
    loadUserSplits();
  }, [loadUserSplits]);

  const fetchNairaRate = async (token: string, amount: string) => {
    if (!amount || parseFloat(amount) <= 0) {
      setNairaRate(null);
      return;
    }
    setRateLoading(true);
    setRateError(null);
    try {
      const response = await fetch(
        `https://api.paycrest.io/v1/rates/${token}/${amount}/NGN`
      );
      const data = await response.json();
      if (data.status === "success") {
        const rate = parseFloat(data.data);
        setNairaRate(rate);
      } else {
        throw new Error(data.message || "Failed to fetch rate");
      }
    } catch (error) {
      setRateError(error instanceof Error ? error.message : "Unknown error");
      showError("Failed to fetch rate");
    } finally {
      setRateLoading(false);
    }
  };

  const fetchBanks = async () => {
    setBanksLoading(true);
    try {
      const response = await fetch(
        "https://spliting-rhq3.onrender.com/payment/institutions/NGN"
      );
      const data = await response.json();
      // console.log("Banks API response:", data); // Debug log
      if (data.status === "success") {
        setBanks(data.data);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      // console.error("Failed to fetch banks:", error);
      showError("Failed to fetch banks");
    } finally {
      setBanksLoading(false);
    }
  };

  useEffect(() => {
    fetchNairaRate(fromToken.symbol, swapAmount);
  }, [fromToken.symbol, swapAmount]);

  useEffect(() => {
    if (showSwapModal) {
      fetchBanks();
    }
  }, [showSwapModal]);

  useEffect(() => {
    if (isConnected && chain && !isOnSupportedNetwork) {
      showInfo("Switching to supported network...");
      handleSwitchNetwork();
    }
  }, [isConnected, chain, isOnSupportedNetwork]);

  const { switchToSupportedNetwork } = useWallet();

  const handleSwitchNetwork = async () => {
    try {
      await switchToSupportedNetwork();
      showSuccess("Successfully switched to supported network");
    } catch (error) {
      showError(
        "Failed to switch network. Please switch manually in your wallet."
      );
      // console.error("Failed to switch to supported network:", error);
    }
  };

  const handleSplitCreated = useCallback(
    (splitAddress: string) => {
      // Refresh user splits after creating a new one
      loadUserSplits();
      // Switch to "mySplits" view to show the newly created split
      setActiveView("mySplits");
    },
    [loadUserSplits]
  );

  // Debug: Log current network and factory address
  // console.log("Current chain:", chain?.name, chain?.id);
  // console.log("Is on supported network:", isOnSupportedNetwork);
  // console.log("Is on Base Sepolia:", isOnBaseSepolia);
  // console.log("User splits count:", userSplits.length);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    // Save to localStorage
    localStorage.setItem("theme", newTheme);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleViewChange = (
    view: "createSplit" | "mySplits" | "swap" | "transactions"
  ) => {
    if (contentRef.current) {
      gsap.to(contentRef.current, {
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
          setActiveView(view);
          gsap.to(contentRef.current, {
            opacity: 1,
            duration: 0.3,
          });
        },
      });
    } else {
      setActiveView(view);
    }
  };

  const getViewLabel = (view: string) => {
    switch (view) {
      case "createSplit":
        return "Create Split";
      case "mySplits":
        return "My Splits";
      case "swap":
        return "Swap";
      case "transactions":
        return "Transactions";
      default:
        return "Create Split";
    }
  };

  const handleSelectChange = (label: string) => {
    switch (label) {
      case "Create Split":
        handleViewChange("createSplit");
        break;
      case "My Splits":
        handleViewChange("mySplits");
        break;
      case "Swap":
        handleViewChange("swap");
        break;
      case "Transactions":
        handleViewChange("transactions");
        break;
    }
  };

  const handleConnect = async (connector: any) => {
    try {
      await connect({ connector });
      setShowWalletOptions(false);
    } catch (error) {
      console.error("Failed to connect:", error);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setShowWalletOptions(false);
    setShowWalletModal(false);
    setShowMobileWalletModal(false);
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const nairaToken = {
    symbol: "NGN",
    name: "Nigerian Naira",
    icon: "₦",
    price: "₦1.00",
  };
  const calculateNairaEquivalent = () => {
    if (!swapAmount || isNaN(parseFloat(swapAmount)) || !nairaRate)
      return "0.00";
    const nairaValue = parseFloat(swapAmount) * nairaRate;
    return nairaValue.toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };
  const handleSwap = () => {
    if (!swapAmount || parseFloat(swapAmount) <= 0 || !nairaRate) {
      showError("Please enter a valid amount and wait for rate");
      return;
    }
    setShowSwapModal(true);
  };

  const resolveAccountName = async (accountNum: string, bankCode: string) => {
    try {
      const response = await fetch(
        "https://spliting-rhq3.onrender.com/payment/verify-account",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            institution: bankCode,
            accountIdentifier: accountNum,
          }),
        }
      );
      const data = await response.json();
      if (data.status === "success") {
        return data.data;
      }
    } catch (error) {
      console.warn("Could not resolve account name:", error);
    }
    return null;
  };

  const handleAccountNumberChange = (value: string) => {
    setAccountNumber(value);
    // Clear account name when account number changes
    if (value.length < 10) {
      setAccountName("");
    }
  };

  const handleBankChange = (bank: any) => {
    setSelectedBank(bank);
    // Clear account name when bank changes
    setAccountName("");
  };

  // Resolve account name when both account number and bank are valid
  useEffect(() => {
    if (accountNumber.length >= 10 && selectedBank && !accountName) {
      resolveAccountName(accountNumber, selectedBank.code)
        .then((resolvedName) => {
          if (resolvedName) {
            setAccountName(resolvedName);
          }
        })
        .catch((error) => {
          console.warn("Could not resolve account name:", error);
        });
    }
  }, [accountNumber, selectedBank, accountName]);

  const monitorPaymentSettlement = async (orderId: string) => {
    const checkSettlement = async () => {
      try {
        const response = await fetch(
          `https://spliting-rhq3.onrender.com/payment/orders/${orderId}`
        );
        const data = await response.json();
        // console.log("🔍 Settlement API Response:", data);
        if (data.status === "success") {
          const settlementStatus = data.data?.status;
          // console.log("🔍 Order data:", data.data);
          // console.log("🔍 Amount paid:", data.data?.amountPaid);
          // console.log("🔍 TX hash:", data.data?.txHash);
          setPaymentStatus(settlementStatus);

          // console.log(`🔄 Payment status update: ${settlementStatus}`);

          if (settlementStatus === "settled") {
            // Payment settled, transaction is complete
            // console.log("🎉 Payment settlement completed successfully!");
            showSuccess("Payment completed successfully!");
            setShowSuccessModal(true);
            setPaymentOrderId(null);
            setReceiveAddress(null);
            setPaymentStatus(null);
            return; // Stop monitoring
          } else if (settlementStatus === "failed") {
            // console.log("❌ Payment settlement failed");
            showError("Payment settlement failed");
            setPaymentOrderId(null);
            setReceiveAddress(null);
            setPaymentStatus(null);
            return; // Stop monitoring
          } else if (settlementStatus === "processing") {
            showInfo("Payment is being processed...");
          } else if (settlementStatus === "pending") {
            showInfo("Payment is pending settlement...");
          } else if (settlementStatus === "initiated") {
            showInfo("Payment order initiated, waiting for processing...");
          }
        }
      } catch (error) {
        console.error("Error checking payment settlement:", error);
      }

      // Continue checking every 5 seconds
      setTimeout(checkSettlement, 5000);
    };

    checkSettlement();
  };

  // Token contract addresses
  const TOKEN_ADDRESSES: Record<string, Record<string, string>> = {
    celo: {
      USDC: "0xcebA9300f2b948710d2653dD7B07f33A8B32118C",
      USDT: "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e",
      CUSD: "0x765DE816845861e75A25fCA122bb6898B8B1282a",
    },
    base: {
      USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      USDT: "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2",
    },
  };

  // console.log("🔄 Starting swap process...");
  // console.log("📊 Swap details:", {
  //   amount: swapAmount,
  //   token: fromToken.symbol,
  //   network: isOnCelo ? "celo" : "base",
  // });

  const transferTokensToReceiveAddress = async (receiveAddr: string) => {
    // console.log("🔄 transferTokensToReceiveAddress called");
    // console.log("🔍 receiveAddress:", receiveAddr);
    // console.log("🔍 address:", address);

    if (!receiveAddr || !address) {
      console.log("❌ Missing receiveAddress or address");
      showError("Missing receive address or wallet address");
      return;
    }

    if (!isConnected) {
      showError("Please connect your wallet first");
      return;
    }

    const network = isOnCelo ? "celo" : "base";
    if (!isOnSupportedNetwork) {
      showError(
        `Please switch to the ${network === "celo" ? "Celo" : "Base"} network.`
      );
      return;
    }

    try {
      // console.log("🔄 Starting token transfer process");
      // Handle ERC20 token transfer only (no native tokens)
      const networkTokens = TOKEN_ADDRESSES[network];
      const tokenAddress = networkTokens[fromToken.symbol];

      // console.log("🔍 Token lookup:", {
      //   network,
      //   symbol: fromToken.symbol,
      //   tokenAddress,
      // });

      if (!tokenAddress) {
        throw new Error(
          `Token ${fromToken.symbol} not supported on ${network}`
        );
      }

      // Get token decimals - assuming 6 for stablecoins, but should be dynamic
      const decimals =
        fromToken.symbol === "USDC" || fromToken.symbol === "USDT" ? 6 : 18;
      const amountInWei = BigInt(
        Math.floor(parseFloat(swapAmount) * 10 ** decimals)
      );

      // console.log(
      //   `💰 Transferring ${amountInWei} ${fromToken.symbol} (${tokenAddress}) to ${receiveAddr}`
      // );

      // console.log("🔄 About to call writeContractAsync...");
      // console.log("🔍 Contract call parameters:", {
      //   address: tokenAddress,
      //   functionName: "transfer",
      //   args: [receiveAddr, amountInWei],
      //   abi: ERC20_ABI,
      // });

      showInfo("Please confirm the token transfer in your wallet...");

      const txHash = await writeContractAsync({
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "transfer",
        args: [receiveAddr as `0x${string}`, amountInWei],
      });

      // console.log("✅ ERC20 Transfer transaction hash:", txHash);
      showSuccess(`Tokens transferred successfully! TX: ${txHash}`);

      // Optional: Wait for transaction confirmation
      // await publicClient.waitForTransactionReceipt({ hash: txHash });

      return txHash;
    } catch (error) {
      // console.error("❌ Error in transferTokensToReceiveAddress:", error);
      showError(
        error instanceof Error ? error.message : "Token transfer failed"
      );
      throw error;
    }
  };

  const handleSend = async () => {
    if (!accountNumber || !selectedBank) {
      showError("Please fill in all required fields");
      return;
    }

    // If account name is not resolved yet, try to resolve it now
    let resolvedAccountName = accountName;
    if (!resolvedAccountName) {
      try {
        resolvedAccountName = await resolveAccountName(
          accountNumber,
          selectedBank.code
        );
        if (resolvedAccountName) {
          setAccountName(resolvedAccountName);
        }
      } catch (error) {
        console.warn("Could not resolve account name:", error);
      }
    }

    if (!resolvedAccountName) {
      showError("Could not verify account name. Please try again.");
      return;
    }
    setIsProcessingPayment(true);
    try {
      // console.log("📝 Step 1: Creating payment order...");
      // Step 1: Create payment order
      showInfo("Creating payment order...");

      // Use the token symbol as-is (only ERC20 tokens supported)
      const tokenSymbol = fromToken.symbol;

      const response = await fetch(
        "https://spliting-rhq3.onrender.com/payment",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: parseFloat(swapAmount), // Convert to number
            token: tokenSymbol,
            network: isOnCelo ? "celo" : "base",
            recipient: {
              institution: selectedBank.code,
              accountIdentifier: accountNumber,
              currency: "NGN",
            },
          }),
        }
      );

      // console.log("🔄 About to parse response.json()...");
      const data = await response.json();
      // console.log("📨 Payment API Response:", data);
      // console.log("🔄 About to check if data.order.status === 'success'...");
      // console.log("🔍 data.order.status:", data.order?.status);
      if (data.order?.status === "success") {
        const order = data.order;
        setPaymentOrderId(order.data.id);
        setReceiveAddress(order.data.receiveAddress);
        setPaymentStatus("pending");
        // console.log("✅ Payment order created:", {
        //   orderId: order.data.id,
        //   receiveAddress: order.data.receiveAddress,
        // });
        showSuccess("Payment order initiated successfully");

        // Step 2: Transfer tokens to receiveAddress
        // console.log("💸 Step 2: Initiating token transfer...");
        showInfo("Please approve the token transfer in your wallet...");
        // console.log("🔄 About to call transferTokensToReceiveAddress...");
        await transferTokensToReceiveAddress(order.data.receiveAddress);
        // console.log("✅ transferTokensToReceiveAddress completed");

        // Step 3: Start monitoring payment settlement
        // console.log("👀 Step 3: Starting payment settlement monitoring...");
        showInfo("Monitoring payment settlement...");
        monitorPaymentSettlement(order.data.id);

        setShowSwapModal(false);
        setAccountNumber("");
        setAccountName("");
        setSelectedBank(null);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      showError(
        error instanceof Error ? error.message : "Failed to create payment"
      );
    } finally {
      setIsProcessingPayment(false);
    }
  };

  if (!isClient) {
    return (
      <div
        className={`min-h-screen relative overflow-hidden ${
          theme === "dark" ? "bg-black" : "bg-white"
        }`}
        // expose CSS variables for network-based accent colors
        style={
          {
            ["--network-color" as any]: themeColor,
            ["--network-color-hover" as any]: themeColorHover,
            ["--network-foreground" as any]: isOnBaseNetwork
              ? "#ffffff"
              : "#000000",
          } as React.CSSProperties
        }
      >
        {/* Scoped styles that use the network color variables */}
        <style jsx>{`
          .network-accent {
            background-color: var(--network-color) !important;
            color: var(--network-foreground) !important;
          }
          .network-accent:hover {
            background-color: var(--network-color-hover) !important;
          }
          .network-accent-border {
            border-color: color-mix(
              in srgb,
              var(--network-color) 16%,
              black
            ) !important;
          }
        `}</style>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#FCFE52]"></div>
            <p className="mt-4 text-lg">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className={`min-h-screen relative overflow-hidden ${
          theme === "dark" ? "bg-black" : "bg-white"
        }`}
      >
        <div className="absolute inset-0">
          <div className="absolute inset-0">
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 1200 800"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="xMidYMid slice"
            >
              <defs>
                <radialGradient id="neonPulse1" cx="50%" cy="50%" r="50%">
                  <stop
                    offset="0%"
                    stopColor={
                      theme === "dark"
                        ? "rgba(255,255,255,1)"
                        : "rgba(252,254,82,1)"
                    }
                  />
                  <stop offset="30%" stopColor="rgba(252,254,82,1)" />
                  <stop offset="70%" stopColor="rgba(252,254,82,0.8)" />
                  <stop offset="100%" stopColor="rgba(252,254,82,0)" />
                </radialGradient>
                <radialGradient id="neonPulse2" cx="50%" cy="50%" r="50%">
                  <stop
                    offset="0%"
                    stopColor={
                      theme === "dark"
                        ? "rgba(255,255,255,0.9)"
                        : "rgba(252,254,82,0.9)"
                    }
                  />
                  <stop offset="25%" stopColor="rgba(252,254,82,0.9)" />
                  <stop offset="60%" stopColor="rgba(0,65,204,0.7)" />
                  <stop offset="100%" stopColor="rgba(0,65,204,0)" />
                </radialGradient>
                <radialGradient id="neonPulse3" cx="50%" cy="50%" r="50%">
                  <stop
                    offset="0%"
                    stopColor={
                      theme === "dark"
                        ? "rgba(255,255,255,1)"
                        : "rgba(252,254,82,1)"
                    }
                  />
                  <stop offset="35%" stopColor="rgba(252,254,82,1)" />
                  <stop offset="75%" stopColor="rgba(0,65,204,0.6)" />
                  <stop offset="100%" stopColor="rgba(0,65,204,0)" />
                </radialGradient>
                <radialGradient id="heroTextBg" cx="30%" cy="50%" r="70%">
                  <stop offset="0%" stopColor="rgba(252,254,82,0.15)" />
                  <stop offset="40%" stopColor="rgba(252,254,82,0.08)" />
                  <stop offset="80%" stopColor="rgba(0,65,204,0.05)" />
                  <stop offset="100%" stopColor="rgba(0,0,0,0)" />
                </radialGradient>
                <filter
                  id="heroTextBlur"
                  x="-50%"
                  y="-50%"
                  width="200%"
                  height="200%"
                >
                  <feGaussianBlur stdDeviation="12" result="blur" />
                  <feTurbulence
                    baseFrequency="0.7"
                    numOctaves="4"
                    result="noise"
                  />
                  <feColorMatrix
                    in="noise"
                    type="saturate"
                    values="0"
                    result="monoNoise"
                  />
                  <feComponentTransfer
                    in="monoNoise"
                    result="alphaAdjustedNoise"
                  >
                    <feFuncA
                      type="discrete"
                      tableValues="0.03 0.06 0.09 0.12"
                    />
                  </feComponentTransfer>
                  <feComposite
                    in="blur"
                    in2="alphaAdjustedNoise"
                    operator="multiply"
                    result="noisyBlur"
                  />
                  <feMerge>
                    <feMergeNode in="noisyBlur" />
                  </feMerge>
                </filter>
                <linearGradient
                  id="threadFade1"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop
                    offset="0%"
                    stopColor={
                      theme === "dark" ? "rgba(0,0,0,1)" : "rgba(255,255,255,1)"
                    }
                  />
                  <stop offset="15%" stopColor="rgba(252,254,82,0.8)" />
                  <stop offset="85%" stopColor="rgba(252,254,82,0.8)" />
                  <stop
                    offset="100%"
                    stopColor={
                      theme === "dark" ? "rgba(0,0,0,1)" : "rgba(255,255,255,1)"
                    }
                  />
                </linearGradient>
                <linearGradient
                  id="threadFade2"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop
                    offset="0%"
                    stopColor={
                      theme === "dark" ? "rgba(0,0,0,1)" : "rgba(255,255,255,1)"
                    }
                  />
                  <stop offset="12%" stopColor="rgba(252,254,82,0.7)" />
                  <stop offset="88%" stopColor="rgba(252,254,82,0.7)" />
                  <stop
                    offset="100%"
                    stopColor={
                      theme === "dark" ? "rgba(0,0,0,1)" : "rgba(255,255,255,1)"
                    }
                  />
                </linearGradient>
                <linearGradient
                  id="threadFade3"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop
                    offset="0%"
                    stopColor={
                      theme === "dark" ? "rgba(0,0,0,1)" : "rgba(255,255,255,1)"
                    }
                  />
                  <stop offset="18%" stopColor="rgba(0,65,204,0.8)" />
                  <stop offset="82%" stopColor="rgba(0,65,204,0.8)" />
                  <stop
                    offset="100%"
                    stopColor={
                      theme === "dark" ? "rgba(0,0,0,1)" : "rgba(255,255,255,1)"
                    }
                  />
                </linearGradient>
                <filter
                  id="backgroundBlur"
                  x="-50%"
                  y="-50%"
                  width="200%"
                  height="200%"
                >
                  <feGaussianBlur stdDeviation="8" result="blur" />
                  <feTurbulence
                    baseFrequency="0.9"
                    numOctaves="3"
                    result="noise"
                  />
                  <feColorMatrix
                    in="noise"
                    type="saturate"
                    values="0"
                    result="monoNoise"
                  />
                  <feComponentTransfer
                    in="monoNoise"
                    result="alphaAdjustedNoise"
                  >
                    <feFuncA type="discrete" tableValues="0.05 0.1 0.15 0.2" />
                  </feComponentTransfer>
                  <feComposite
                    in="blur"
                    in2="alphaAdjustedNoise"
                    operator="multiply"
                    result="noisyBlur"
                  />
                  <feMerge>
                    <feMergeNode in="noisyBlur" />
                  </feMerge>
                </filter>
                <filter
                  id="neonGlow"
                  x="-50%"
                  y="-50%"
                  width="200%"
                  height="200%"
                >
                  <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <g>
                <ellipse
                  cx="300"
                  cy="350"
                  rx="400"
                  ry="200"
                  fill="url(#heroTextBg)"
                  filter="url(#heroTextBlur)"
                  opacity="0.6"
                />
                <ellipse
                  cx="350"
                  cy="320"
                  rx="500"
                  ry="250"
                  fill="url(#heroTextBg)"
                  filter="url(#heroTextBlur)"
                  opacity="0.4"
                />
                <ellipse
                  cx="400"
                  cy="300"
                  rx="600"
                  ry="300"
                  fill="url(#heroTextBg)"
                  filter="url(#heroTextBlur)"
                  opacity="0.2"
                />

                <path
                  id="thread1"
                  d="M50 720 Q200 590 350 540 Q500 490 650 520 Q800 550 950 460 Q1100 370 1200 340"
                  stroke="url(#threadFade1)"
                  strokeWidth="0.8"
                  fill="none"
                  opacity="0.8"
                />
                <g filter="url(#neonGlow)">
                  <animateMotion dur="4s" repeatCount="indefinite">
                    <mpath href="#thread1" />
                  </animateMotion>
                  <circle r="8" fill="#627EEA" opacity="0.9" />
                  <text
                    x="0"
                    y="4"
                    textAnchor="middle"
                    fill="white"
                    fontSize="8"
                    fontWeight="bold"
                  >
                    Ξ
                  </text>
                </g>

                <path
                  id="thread2"
                  d="M80 730 Q250 620 400 570 Q550 520 700 550 Q850 580 1000 490 Q1150 400 1300 370"
                  stroke="url(#threadFade2)"
                  strokeWidth="1.5"
                  fill="none"
                  opacity="0.7"
                />
                <g filter="url(#neonGlow)">
                  <animateMotion dur="5s" repeatCount="indefinite">
                    <mpath href="#thread2" />
                  </animateMotion>
                  <circle r="9" fill="#2775CA" opacity="0.9" />
                  <text
                    x="0"
                    y="4"
                    textAnchor="middle"
                    fill="white"
                    fontSize="7"
                    fontWeight="bold"
                  >
                    $
                  </text>
                </g>

                <path
                  id="thread3"
                  d="M20 710 Q180 580 320 530 Q460 480 600 510 Q740 540 880 450 Q1020 360 1200 330"
                  stroke="url(#threadFade3)"
                  strokeWidth="1.2"
                  fill="none"
                  opacity="0.8"
                />
                <g filter="url(#neonGlow)">
                  <animateMotion dur="4.5s" repeatCount="indefinite">
                    <mpath href="#thread3" />
                  </animateMotion>
                  <circle r="8" fill="#FCFE52" opacity="0.9" />
                  <text
                    x="0"
                    y="4"
                    textAnchor="middle"
                    fill="white"
                    fontSize="8"
                    fontWeight="bold"
                  >
                    B
                  </text>
                </g>
              </g>
            </svg>
          </div>
        </div>

        <style jsx>{`
          @keyframes flow {
            0%,
            100% {
              opacity: 0.3;
              stroke-dasharray: 0 100;
              stroke-dashoffset: 0;
            }
            50% {
              opacity: 0.8;
              stroke-dasharray: 50 50;
              stroke-dashoffset: -25;
            }
          }
          @keyframes pulse1 {
            0%,
            100% {
              opacity: 0.4;
              transform: scale(0.8);
            }
            50% {
              opacity: 1;
              transform: scale(1.2);
            }
          }
          @keyframes pulse2 {
            0%,
            100% {
              opacity: 0.3;
              transform: scale(0.9);
            }
            50% {
              opacity: 1;
              transform: scale(1.1);
            }
          }
          @keyframes pulse3 {
            0%,
            100% {
              opacity: 0.5;
              transform: scale(0.7);
            }
            50% {
              opacity: 1;
              transform: scale(1.3);
            }
          }
        `}</style>

        <header className="relative z-10 flex items-center justify-between px-4 sm:px-6 py-4 lg:px-12">
          <div className="flex items-center space-x-2 pl-3 sm:pl-6 lg:pl-12">
            <Image
              src={
                theme === "dark"
                  ? "/Split Celo light - Edited.png"
                  : "/Split Celo.png"
              }
              alt="Split Logo"
              width={140}
              height={36}
              className="h-20 w-auto"
              priority
            />
          </div>

          {/* Right side: Theme switcher and back to home button */}
          <div className="flex items-center gap-2 pr-3 sm:pr-6 lg:pr-12">
            <button
              onClick={toggleTheme}
              className={`flex items-center gap-2 ${
                theme === "dark"
                  ? "bg-white/10 hover:bg-white/20"
                  : "bg-black/10 hover:bg-black/20"
              } backdrop-blur-sm border ${
                theme === "dark" ? "border-white/20" : "border-black/20"
              } rounded-xl px-4 py-2.5 w-fit transition-all duration-300`}
            >
              {theme === "dark" ? (
                <>
                  <Sun className="w-5 h-5 text-white" />
                  <span className="hidden md:inline text-white text-sm font-medium">
                    Light Mode
                  </span>
                </>
              ) : (
                <>
                  <Moon className="w-5 h-5 text-black" />
                  <span className="hidden md:inline text-black text-sm font-medium">
                    Dark Mode
                  </span>
                </>
              )}
            </button>

            <Link href="/">
              <Button
                variant="outline"
                className={`${
                  theme === "dark"
                    ? "bg-white/10 hover:bg-white/20 border-white/20 text-white"
                    : "bg-black/10 hover:bg-black/20 border-black/20 text-black"
                } flex items-center gap-2 backdrop-blur-sm`}
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Home</span>
              </Button>
            </Link>
          </div>
        </header>

        {mobileMenuOpen && (
          <div
            className={`md:hidden fixed inset-0 top-16 ${
              theme === "dark" ? "bg-black/95" : "bg-white/95"
            } backdrop-blur-sm z-20`}
            onClick={closeMobileMenu}
          >
            <nav className="flex flex-col space-y-2 px-6 py-6 font-[family-name:var(--font-rajdhani)] text-xs">
              <Link
                href="/"
                className={`${
                  theme === "dark"
                    ? "text-white/80 hover:text-white"
                    : "text-black/80 hover:text-black"
                } transition-colors font-medium`}
                onClick={closeMobileMenu}
              >
                Home
              </Link>
              <Link
                href="/split"
                className={`${
                  theme === "dark"
                    ? "text-white/80 hover:text-white"
                    : "text-black/80 hover:text-black"
                } transition-colors font-medium`}
                onClick={closeMobileMenu}
              >
                Split
              </Link>
              <Link
                href="/about"
                className={`${
                  theme === "dark"
                    ? "text-white/80 hover:text-white"
                    : "text-black/80 hover:text-black"
                } transition-colors font-medium`}
                onClick={closeMobileMenu}
              >
                About
              </Link>
              <Link
                href="/contact"
                className={`${
                  theme === "dark"
                    ? "text-white/80 hover:text-white"
                    : "text-black/80 hover:text-black"
                } transition-colors font-medium`}
                onClick={closeMobileMenu}
              >
                Contact
              </Link>
              <Link
                href="/dashboard"
                className={`${
                  theme === "dark"
                    ? "text-white/80 hover:text-white"
                    : "text-black/80 hover:text-black"
                } transition-colors font-medium`}
                onClick={closeMobileMenu}
              >
                Dashboard
              </Link>
              <button
                onClick={toggleTheme}
                className={`flex items-center gap-2 ${
                  theme === "dark"
                    ? "bg-white/10 hover:bg-white/20"
                    : "bg-black/10 hover:bg-black/20"
                } backdrop-blur-sm border ${
                  theme === "dark" ? "border-white/20" : "border-black/20"
                } rounded-xl px-4 py-2.5 w-fit transition-all duration-300`}
              >
                {theme === "dark" ? (
                  <>
                    <Sun className="w-5 h-5 text-white" />
                    {/* <span className="text-white text-sm font-medium">
                      Light Mode
                    </span> */}
                  </>
                ) : (
                  <>
                    <Moon className="w-5 h-5 text-black" />
                    {/* <span className="text-black text-sm font-medium">
                      Dark Mode
                    </span> */}
                  </>
                )}
              </button>
            </nav>
          </div>
        )}

        <main className="relative z-10 px-4 sm:px-6 lg:px-12 max-w-6xl mx-auto py-8">
          <div className="space-y-8">
            <div className="text-center">
              <h1
                className={`${
                  theme === "dark" ? "text-white" : "text-black"
                } text-3xl sm:text-lg md:text-2xl lg:text-3xl xl:text-4xl font-bold leading-tight mb-4 font-[family-name:var(--font-share-tech-mono)] uppercase tracking-wider`}
              >
                SPLIT DASHBOARD
              </h1>
              <p
                className={`${
                  theme === "dark" ? "text-white/70" : "text-black/70"
                } text-lg mb-8`}
              >
                Manage your payment splits and transactions
              </p>
            </div>

            {/* Dashboard Buttons */}
            {isMobile ? (
              <div className="flex items-center gap-4 mb-12">
                <Select
                  value={getViewLabel(activeView)}
                  onValueChange={handleSelectChange}
                >
                  <SelectTrigger
                    className={`flex-1 ${
                      theme === "dark"
                        ? "bg-black/50 border-white/20 text-white"
                        : "bg-white/50 border-black/20 text-black"
                    }`}
                  >
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent
                    className={
                      theme === "dark"
                        ? "bg-black/90 border-white/20 text-white"
                        : "bg-white border-black/20 text-black"
                    }
                  >
                    <SelectItem value="Create Split">Create Split</SelectItem>
                    <SelectItem value="My Splits">My Splits</SelectItem>
                    <SelectItem value="Swap">Swap</SelectItem>
                    <SelectItem value="Transactions">Transactions</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={() =>
                    isConnected
                      ? setShowWalletModal(true)
                      : setShowMobileWalletModal(true)
                  }
                  variant="outline"
                  className={`${
                    theme === "dark"
                      ? "bg-white/10 hover:bg-white/20 border-white/20 text-white"
                      : "bg-black/10 hover:bg-black/20 border-black/20 text-black"
                  } flex items-center gap-2`}
                >
                  <Wallet className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {isConnected ? "Connected" : "Connect"}
                  </span>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:flex sm:flex-row sm:justify-center lg:grid lg:grid-cols-4 gap-6 mb-12">
                <Button
                  onClick={() => handleViewChange("createSplit")}
                  variant={activeView === "createSplit" ? "default" : "outline"}
                  className={`h-32 flex flex-col sm:flex-row items-center justify-center gap-3 ${
                    activeView === "createSplit" ? "text-black" : "text-white"
                  }`}
                  style={{
                    backgroundColor:
                      activeView === "createSplit" ? themeColor : undefined,
                    borderColor:
                      activeView === "createSplit" ? themeColor : undefined,
                  }}
                >
                  <Plus className="w-8 h-8" />
                  <span className="hidden sm:block text-lg font-semibold">
                    Create Split
                  </span>
                </Button>

                <Button
                  onClick={() => handleViewChange("mySplits")}
                  variant={activeView === "mySplits" ? "default" : "outline"}
                  className={`h-32 flex flex-col sm:flex-row items-center justify-center gap-3 ${
                    activeView === "mySplits" ? "text-black" : "text-white"
                  }`}
                  style={{
                    backgroundColor:
                      activeView === "mySplits" ? themeColor : undefined,
                    borderColor:
                      activeView === "mySplits" ? themeColor : undefined,
                  }}
                >
                  <FileText className="w-8 h-8" />
                  <span className="hidden sm:block text-lg font-semibold">
                    My Splits
                  </span>
                </Button>

                <Button
                  onClick={() => handleViewChange("swap")}
                  variant={activeView === "swap" ? "default" : "outline"}
                  className={`h-32 flex flex-col sm:flex-row items-center justify-center gap-3 ${
                    activeView === "swap" ? "text-black" : "text-white"
                  }`}
                  style={{
                    backgroundColor:
                      activeView === "swap" ? themeColor : undefined,
                    borderColor: activeView === "swap" ? themeColor : undefined,
                  }}
                >
                  <ArrowRightLeft className="w-8 h-8" />
                  <span className="hidden sm:block text-lg font-semibold">
                    Swap
                  </span>
                </Button>

                <Button
                  onClick={() => handleViewChange("transactions")}
                  variant={
                    activeView === "transactions" ? "default" : "outline"
                  }
                  className={`h-32 flex flex-col sm:flex-row items-center justify-center gap-3 ${
                    activeView === "transactions" ? "text-black" : "text-white"
                  }`}
                  style={{
                    backgroundColor:
                      activeView === "transactions" ? themeColor : undefined,
                    borderColor:
                      activeView === "transactions" ? themeColor : undefined,
                  }}
                >
                  <History className="w-8 h-8" />
                  <span className="hidden sm:block text-lg font-semibold">
                    Transactions
                  </span>
                </Button>
              </div>
            )}

            {/* Content Area - Show different views based on selected action */}
            <div ref={contentRef} className="space-y-8">
              {activeView === "createSplit" && (
                <>
                  {/* Default view - show wallet connection and recent splits */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Wallet Connection Section - Hidden on mobile */}
                    {!isMobile && (
                      <Card className="border border-white/20 bg-black/50 backdrop-blur-sm">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-white font-[family-name:var(--font-share-tech-mono)]">
                            <Wallet className="w-5 h-5" />
                            {isConnected
                              ? "Wallet Connected"
                              : "Connect Wallet"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {isConnected ? (
                            <div className="space-y-4">
                              <div className="p-4 bg-white/10 rounded-lg">
                                <p className="text-sm text-white/70 mb-2">
                                  Connected Address:
                                </p>
                                <p className="font-mono text-white text-sm">
                                  {formatAddress(address!)}
                                </p>
                                <p className="text-xs text-white/50 mt-1">
                                  Network: {chain?.name || "Unknown"}
                                </p>
                              </div>

                              {!isOnSupportedNetwork && (
                                <Button
                                  onClick={handleSwitchNetwork}
                                  className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                                >
                                  Switch to Supported Network
                                </Button>
                              )}

                              <div className="flex gap-2">
                                <Button
                                  onClick={handleDisconnect}
                                  variant="outline"
                                  className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-500"
                                >
                                  Disconnect
                                </Button>
                                <Button
                                  onClick={() =>
                                    window.open(
                                      `https://celoscan.io/address/${address}`,
                                      "_blank"
                                    )
                                  }
                                  variant="outline"
                                  className="border-white/20 hover:bg-white/10"
                                  disabled={!address}
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

                              <div className="relative">
                                <Button
                                  onClick={() =>
                                    setShowWalletOptions(!showWalletOptions)
                                  }
                                  className="w-full network-accent flex items-center justify-between"
                                >
                                  <div className="flex items-center gap-2">
                                    <Wallet className="w-4 h-4" />
                                    <span>Select Wallet</span>
                                  </div>
                                  <ChevronDown
                                    className={`w-4 h-4 transition-transform ${
                                      showWalletOptions ? "rotate-180" : ""
                                    }`}
                                  />
                                </Button>

                                {showWalletOptions && (
                                  <div className="absolute top-full left-0 right-0 mt-2 bg-black/90 border border-white/20 rounded-lg overflow-hidden z-10">
                                    {connectors.map((connector) => (
                                      <Button
                                        key={connector.id}
                                        onClick={() => handleConnect(connector)}
                                        disabled={isPending}
                                        className="w-full justify-start bg-transparent hover:bg-white/10 border-0 text-white rounded-none h-12"
                                        variant="ghost"
                                      >
                                        <Wallet className="w-4 h-4 mr-3" />
                                        {connector.name}
                                        {isPending && " (Connecting...)"}
                                      </Button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    {/* Split Creation Form - Only show if wallet is connected and on correct network */}
                    {isConnected && isOnSupportedNetwork && (
                      <div className="border rounded-lg">
                        <SplitCreationForm
                          theme={theme}
                          themeColor={themeColor}
                          themeForeground={
                            isOnBaseNetwork ? "#ffffff" : "#000000"
                          }
                          onSplitCreated={handleSplitCreated}
                        />
                      </div>
                    )}
                  </div>
                </>
              )}

              {activeView === "mySplits" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2
                      className={`${
                        theme === "dark" ? "text-white" : "text-black"
                      } text-xl font-bold font-[family-name:var(--font-share-tech-mono)] uppercase tracking-wider`}
                    >
                      My Splits
                    </h2>
                    <Button
                      onClick={() => handleViewChange("createSplit")}
                      variant="outline"
                      className={`${
                        theme === "dark"
                          ? "border-white/20 hover:bg-white/10 text-white"
                          : "border-black/20 hover:bg-black/10 text-black"
                      }`}
                    >
                      Back to Dashboard
                    </Button>
                  </div>

                  {isConnected &&
                    isOnSupportedNetwork &&
                    userSplits.length > 0 && (
                      <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        initial="hidden"
                        animate="visible"
                        variants={{
                          hidden: { opacity: 0 },
                          visible: {
                            opacity: 1,
                            transition: {
                              staggerChildren: 0.1,
                            },
                          },
                        }}
                      >
                        {userSplits.map((split, index) => (
                          <motion.div
                            key={split.address}
                            variants={{
                              hidden: { opacity: 0, y: 20 },
                              visible: { opacity: 1, y: 0 },
                            }}
                            transition={{ duration: 0.5 }}
                          >
                            <SplitCard
                              splitAddress={split.address}
                              token={split.token}
                              createdAt={split.createdAt}
                              theme={theme}
                            />
                          </motion.div>
                        ))}
                      </motion.div>
                    )}

                  {isConnected &&
                    isOnSupportedNetwork &&
                    userSplits.length === 0 && (
                      <div className="text-center py-12">
                        <p
                          className={`${
                            theme === "dark" ? "text-white/50" : "text-black/50"
                          } text-lg`}
                        >
                          No splits created yet. Create your first split above!
                        </p>
                      </div>
                    )}

                  {!isConnected && (
                    <div className="text-center py-12">
                      <p
                        className={`${
                          theme === "dark" ? "text-white/50" : "text-black/50"
                        } text-lg`}
                      >
                        Connect your wallet to view your splits.
                      </p>
                    </div>
                  )}

                  {isConnected && !isOnSupportedNetwork && (
                    <div className="text-center py-12">
                      <p
                        className={`${
                          theme === "dark" ? "text-white/50" : "text-black/50"
                        } text-lg`}
                      >
                        Please switch to a supported network (Celo or Base) to
                        view your splits.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeView === "swap" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2
                      className={`${
                        theme === "dark" ? "text-white" : "text-black"
                      } text-xl font-bold font-[family-name:var(--font-share-tech-mono)] uppercase tracking-wider`}
                    >
                      Token Swap
                    </h2>
                    <Button
                      onClick={() => handleViewChange("createSplit")}
                      variant="outline"
                      className={`${
                        theme === "dark"
                          ? "border-white/20 hover:bg-white/10 text-white"
                          : "border-black/20 hover:bg-black/10 text-black"
                      }`}
                    >
                      Back to Dashboard
                    </Button>
                  </div>

                  <Card
                    className={`${
                      theme === "dark"
                        ? "bg-black/50 border-white/10"
                        : "bg-white/50 border-black/10"
                    } backdrop-blur-sm`}
                  >
                    <CardHeader>
                      <CardTitle
                        className={`${
                          theme === "dark" ? "text-white" : "text-black"
                        } font-[family-name:var(--font-share-tech-mono)]`}
                      >
                        Swap Tokens
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-4">
                        <TokenSelector
                          selectedToken={fromToken}
                          onTokenSelect={(token) => setFromToken(token)}
                          tokens={availableTokens}
                          theme={theme}
                          label="From Token"
                        />

                        {pricesLoading && (
                          <div className="text-center py-2">
                            <p
                              className={`text-sm ${
                                theme === "dark"
                                  ? "text-white/70"
                                  : "text-black/70"
                              }`}
                            >
                              Loading live prices...
                            </p>
                          </div>
                        )}

                        {pricesError && (
                          <div className="text-center py-2">
                            <p className={`text-sm text-red-500`}>
                              Failed to load prices. Using cached values.
                            </p>
                          </div>
                        )}

                        <div className="space-y-2">
                          <label
                            className={`text-sm ${
                              theme === "dark"
                                ? "text-white/70"
                                : "text-black/70"
                            }`}
                          >
                            Amount
                          </label>
                          <input
                            type="number"
                            value={swapAmount}
                            onChange={(e) => setSwapAmount(e.target.value)}
                            placeholder="Enter amount"
                            className={`w-full p-3 border rounded-lg ${
                              theme === "dark"
                                ? "bg-black/50 border-white/20 text-white placeholder-white/50"
                                : "bg-white/50 border-black/20 text-black placeholder-black/50"
                            }`}
                          />
                        </div>

                        <div className="space-y-2">
                          <label
                            className={`text-sm ${
                              theme === "dark"
                                ? "text-white/70"
                                : "text-black/70"
                            }`}
                          >
                            To Token
                          </label>
                          <div className="flex items-center gap-2 p-3 border rounded-lg bg-gray-100 dark:bg-gray-800">
                            <span className="text-lg">{nairaToken.icon}</span>
                            <span
                              className={
                                theme === "dark" ? "text-white" : "text-black"
                              }
                            >
                              {nairaToken.symbol}
                            </span>
                            <span
                              className={`text-sm ${
                                theme === "dark"
                                  ? "text-white/70"
                                  : "text-black/70"
                              }`}
                            >
                              {nairaToken.name}
                            </span>
                            <span
                              className={`text-sm ${
                                theme === "dark"
                                  ? "text-white/50"
                                  : "text-black/50"
                              } ml-auto`}
                            >
                              {nairaToken.price}
                            </span>
                          </div>
                        </div>
                        {rateLoading && (
                          <div className="text-center py-2">
                            <p
                              className={`text-sm ${
                                theme === "dark"
                                  ? "text-white/70"
                                  : "text-black/70"
                              }`}
                            >
                              Loading rate...
                            </p>
                          </div>
                        )}

                        {rateError && (
                          <div className="text-center py-2">
                            <p className="text-sm text-red-500">{rateError}</p>
                          </div>
                        )}

                        {/* Naira Equivalent Display */}
                        {swapAmount && parseFloat(swapAmount) > 0 && (
                          <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                            <span
                              className={`text-sm ${
                                theme === "dark"
                                  ? "text-white/70"
                                  : "text-black/70"
                              }`}
                            >
                              You will receive:
                            </span>
                            <span
                              className={`text-lg font-semibold ${
                                theme === "dark"
                                  ? "text-green-400"
                                  : "text-green-600"
                              }`}
                            >
                              ₦{calculateNairaEquivalent()}
                            </span>
                          </div>
                        )}
                      </div>
                      <Button
                        onClick={handleSwap}
                        className="w-full network-accent"
                        disabled={!swapAmount || parseFloat(swapAmount) <= 0}
                      >
                        Swap to Naira
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeView === "transactions" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2
                      className={`${
                        theme === "dark" ? "text-white" : "text-black"
                      } text-xl font-bold font-[family-name:var(--font-share-tech-mono)] uppercase tracking-wider`}
                    >
                      Transaction History
                    </h2>
                    <Button
                      onClick={() => handleViewChange("createSplit")}
                      variant="outline"
                      className={`${
                        theme === "dark"
                          ? "border-white/20 hover:bg-white/10 text-white"
                          : "border-black/20 hover:bg-black/10 text-black"
                      }`}
                    >
                      Back to Dashboard
                    </Button>
                  </div>

                  <Card
                    className={`${
                      theme === "dark"
                        ? "bg-black/50 border-white/10"
                        : "bg-white/50 border-black/10"
                    } backdrop-blur-sm`}
                  >
                    <CardHeader>
                      <CardTitle
                        className={`${
                          theme === "dark" ? "text-white" : "text-black"
                        } font-[family-name:var(--font-share-tech-mono)]`}
                      >
                        Recent Transactions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="text-center py-8">
                          <p
                            className={`text-lg ${
                              theme === "dark"
                                ? "text-white/50"
                                : "text-black/50"
                            }`}
                          >
                            No transactions yet
                          </p>
                          <p
                            className={`text-sm ${
                              theme === "dark"
                                ? "text-white/30"
                                : "text-black/30"
                            } mt-2`}
                          >
                            Your transaction history will appear here
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>

            {/* Message when wallet not connected */}
            {!isConnected && (
              <div className="text-center py-12">
                <p
                  className={`${
                    theme === "dark" ? "text-white/50" : "text-black/50"
                  } text-lg`}
                >
                  Connect your wallet to start creating payment splits.
                </p>
              </div>
            )}

            {/* Message when on wrong network */}
            {isConnected && !isOnSupportedNetwork && (
              <div className="text-center py-12">
                <p
                  className={`${
                    theme === "dark" ? "text-white/50" : "text-black/50"
                  } text-lg`}
                >
                  Please switch to a supported network (Celo or Base) to create
                  and manage splits.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
      <BankDetailsDialog
        open={showSwapModal}
        onOpenChange={setShowSwapModal}
        theme={theme}
        accountNumber={accountNumber}
        setAccountNumber={setAccountNumber}
        selectedBank={selectedBank}
        setSelectedBank={setSelectedBank}
        banks={banks}
        banksLoading={banksLoading}
        onSend={handleSend}
        accountName={accountName}
      />

      {/* Mobile Wallet Connect Modal */}
      <Dialog
        open={showMobileWalletModal}
        onOpenChange={setShowMobileWalletModal}
      >
        <DialogContent
          className={
            theme === "dark"
              ? "bg-black/95 border-white/20 text-white"
              : "bg-white border-black/20 text-black"
          }
        >
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold">
              Connect Wallet
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className={`text-sm ${theme === "dark" ? "text-white/70" : "text-black/70"}`}>
              Choose a wallet to connect to the application
            </p>
            <div className="space-y-2">
              {connectors.map((connector) => (
                <Button
                  key={connector.id}
                  onClick={() => {
                    handleConnect(connector);
                    setShowMobileWalletModal(false);
                  }}
                  disabled={isPending}
                  className={`w-full justify-start bg-transparent hover:${
                    theme === "dark" ? "bg-white/10" : "bg-black/10"
                  } border-0 ${
                    theme === "dark" ? "text-white" : "text-black"
                  } rounded-none h-12`}
                  variant="ghost"
                >
                  <Wallet className="w-4 h-4 mr-3" />
                  {connector.name}
                  {isPending && " (Connecting...)"}
                </Button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Wallet Modal */}
      <Dialog open={showWalletModal} onOpenChange={setShowWalletModal}>
        <DialogContent
          className={
            theme === "dark"
              ? "bg-black/95 border-white/20 text-white"
              : "bg-white border-black/20 text-black"
          }
        >
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold">
              Wallet Connected
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div
              className={`p-4 ${
                theme === "dark" ? "bg-white/10" : "bg-black/10"
              } rounded-lg`}
            >
              <p
                className={`text-sm ${
                  theme === "dark" ? "text-white/70" : "text-black/70"
                } mb-2`}
              >
                Connected Address:
              </p>
              <p
                className={`font-mono text-sm ${
                  theme === "dark" ? "text-white" : "text-black"
                }`}
              >
                {address ? formatAddress(address) : "N/A"}
              </p>
              <p
                className={`text-xs ${
                  theme === "dark" ? "text-white/50" : "text-black/50"
                } mt-1`}
              >
                Network: {chain?.name || "Unknown"}
              </p>
            </div>

            {!isOnSupportedNetwork && (
              <Button
                onClick={handleSwitchNetwork}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              >
                Switch to Supported Network
              </Button>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleDisconnect}
                variant="outline"
                className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-500"
              >
                Disconnect
              </Button>
              <Button
                onClick={() =>
                  window.open(
                    `https://celoscan.io/address/${address}`,
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
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent
          className={
            theme === "dark"
              ? "bg-black/95 border-white/20 text-white"
              : "bg-white border-black/20 text-black"
          }
        >
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold">
              🎉 Payment Successful!
            </DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-4">
            <div className="text-6xl">✅</div>
            <p className="text-lg">
              Your swap has been completed successfully! The Naira funds have
              been sent to your bank account.
            </p>
            <div className="pt-4">
              <Button
                onClick={() => setShowSuccessModal(false)}
                className="network-accent"
              >
                Continue
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
