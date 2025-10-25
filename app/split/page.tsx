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
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useConnect, useDisconnect, useAccount, useSwitchChain } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { Wallet, ExternalLink, ChevronDown } from "lucide-react";
import { SplitCreationForm } from "@/components/SplitCreationForm";
import { SplitCard } from "@/components/SplitCard";
import { useWallet } from "@/src/hooks/useWallet";
import { useSplitFactory } from "@/src/hooks/useSplitFactory";
import { useToastNotification } from "@/src/hooks/useToastNotification";

export default function SplitPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [isClient, setIsClient] = useState(false);
  const [decryptKey, setDecryptKey] = useState(0);
  const [userSplits, setUserSplits] = useState<any[]>([]);
  const [activeView, setActiveView] = useState<
    "default" | "mySplits" | "swap" | "transactions" | "createSplit"
  >("default");
  const [showWalletOptions, setShowWalletOptions] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);

  const { isConnected, address, isOnBaseSepolia } = useWallet();
  const { connectors, connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { chain } = useAccount();
  const { switchChain } = useSwitchChain();
  const { fetchUserSplits, fetchUserSplitsWithAddress } = useSplitFactory();
  const { showError } = useToastNotification();

  useEffect(() => {
    // Load theme from localStorage on mount
    const savedTheme = localStorage.getItem("theme") as "dark" | "light" | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
    setIsClient(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setDecryptKey((prev) => prev + 1);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  const loadUserSplits = useCallback(async () => {
    if (!address || !isOnBaseSepolia) {
      setUserSplits([]);
      return;
    }
    try {
      const splits = await fetchUserSplitsWithAddress(address);
      // For now, we'll just store the addresses. In a real app, you'd fetch more details
      setUserSplits(
        splits.map((splitAddress: string) => ({
          address: splitAddress,
          token: "0x0000000000000000000000000000000000000000", // Default to ETH
          createdAt: Date.now() / 1000, // Placeholder timestamp
        }))
      );
    } catch (error) {
      console.error("Failed to load user splits:", error);
      showError("Failed to load user splits", "Please try again later");
    }
  }, [address, isOnBaseSepolia, fetchUserSplitsWithAddress, showError]);

  useEffect(() => {
    loadUserSplits();
  }, [loadUserSplits]);

  const handleSplitCreated = useCallback(
    (splitAddress: string) => {
      // Refresh user splits after creating a new one
      loadUserSplits();
      // Switch to "mySplits" view to show the newly created split
      setActiveView("mySplits");
    },
    [loadUserSplits]
  );

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
    view: "default" | "mySplits" | "swap" | "transactions" | "createSplit"
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
  };

  const handleSwitchNetwork = async () => {
    if (chain?.id !== baseSepolia.id) {
      try {
        await switchChain({ chainId: baseSepolia.id });
      } catch (error) {
        console.error("Failed to switch to Base Sepolia:", error);
      }
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (!isClient) {
    return (
      <div
        className={`min-h-screen relative overflow-hidden ${
          theme === "dark" ? "bg-black" : "bg-white"
        }`}
      >
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
                <feComponentTransfer in="monoNoise" result="alphaAdjustedNoise">
                  <feFuncA type="discrete" tableValues="0.03 0.06 0.09 0.12" />
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
                <feComponentTransfer in="monoNoise" result="alphaAdjustedNoise">
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
          <h1
            className={`${
              theme === "dark" ? "text-white" : "text-black"
            } text-2xl sm:text-3xl font-bold font-[family-name:var(--font-share-tech-mono)] tracking-wider`}
          >
            SPLIT
          </h1>
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
                <span className="text-white text-sm font-medium">
                  Light Mode
                </span>
              </>
            ) : (
              <>
                <Moon className="w-5 h-5 text-black" />
                <span className="text-black text-sm font-medium">
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
                  ? "border-white/20 hover:bg-white/10 text-white"
                  : "border-black/20 hover:bg-black/10 text-black"
              } flex items-center gap-2`}
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
                  <span className="text-white text-sm font-medium">
                    Light Mode
                  </span>
                </>
              ) : (
                <>
                  <Moon className="w-5 h-5 text-black" />
                  <span className="text-black text-sm font-medium">
                    Dark Mode
                  </span>
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
              } text-base sm:text-lg md:text-2xl lg:text-3xl xl:text-4xl font-bold leading-tight mb-4 font-[family-name:var(--font-share-tech-mono)] uppercase tracking-wider`}
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
          <div className="grid grid-cols-1 sm:flex sm:flex-row sm:justify-center lg:grid lg:grid-cols-4 gap-6 mb-12">
            <Button
              onClick={() => handleViewChange("createSplit")}
              variant={activeView === "createSplit" ? "default" : "outline"}
              className={`h-32 flex flex-col sm:flex-row items-center justify-center gap-3 ${
                activeView === "createSplit"
                  ? "bg-[#FCFE52] text-black border-[#FCFE52]"
                  : "bg-[#FCFE52] hover:bg-[#E6E84A] text-white border-[#FCFE52]"
              }`}
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
                activeView === "mySplits"
                  ? "bg-[#FCFE52] text-black border-[#FCFE52]"
                  : "bg-[#FCFE52] hover:bg-[#E6E84A] text-white border-[#FCFE52]"
              }`}
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
                activeView === "swap"
                  ? "bg-[#FCFE52] text-black border-[#FCFE52]"
                  : "bg-[#FCFE52] hover:bg-[#E6E84A] text-white border-[#FCFE52]"
              }`}
            >
              <ArrowRightLeft className="w-8 h-8" />
              <span className="hidden sm:block text-lg font-semibold">
                Swap
              </span>
            </Button>

            <Button
              onClick={() => handleViewChange("transactions")}
              variant={activeView === "transactions" ? "default" : "outline"}
              className={`h-32 flex flex-col sm:flex-row items-center justify-center gap-3 ${
                activeView === "transactions"
                  ? "bg-[#FCFE52] text-black border-[#FCFE52]"
                  : "bg-[#FCFE52] hover:bg-[#E6E84A] text-white border-[#FCFE52]"
              }`}
            >
              <History className="w-8 h-8" />
              <span className="hidden sm:block text-lg font-semibold">
                Transactions
              </span>
            </Button>
          </div>

          {/* Content Area - Show different views based on selected action */}
          <div ref={contentRef} className="space-y-8">
            {activeView === "default" && (
              <>
                {/* Default view - show wallet connection and recent splits */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Wallet Connection Section */}
                  <Card className="border border-white/20 bg-black/50 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white font-[family-name:var(--font-share-tech-mono)]">
                        <Wallet className="w-5 h-5" />
                        {isConnected ? "Wallet Connected" : "Connect Wallet"}
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

                          {!isOnBaseSepolia && (
                            <Button
                              onClick={handleSwitchNetwork}
                              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                            >
                              Switch to Base Sepolia
                            </Button>
                          )}

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

                          <div className="relative">
                            <Button
                              onClick={() =>
                                setShowWalletOptions(!showWalletOptions)
                              }
                              className="w-full bg-[#FCFE52] hover:bg-[#E6E84A] text-black flex items-center justify-between"
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

                  {/* Split Creation Form - Only show if wallet is connected and on correct network */}
                  {isConnected && isOnBaseSepolia && (
                    <div className="border border-white">
                      <SplitCreationForm
                        theme={theme}
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
                    onClick={() => handleViewChange("default")}
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

                {isConnected && isOnBaseSepolia && userSplits.length > 0 && (
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

                {isConnected && isOnBaseSepolia && userSplits.length === 0 && (
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

                {isConnected && !isOnBaseSepolia && (
                  <div className="text-center py-12">
                    <p
                      className={`${
                        theme === "dark" ? "text-white/50" : "text-black/50"
                      } text-lg`}
                    >
                      Please switch to Base Sepolia network to view your splits.
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
                    onClick={() => handleViewChange("default")}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label
                          className={`text-sm ${
                            theme === "dark" ? "text-white/70" : "text-black/70"
                          }`}
                        >
                          From Token
                        </label>
                        <div className="flex items-center gap-2 p-3 border rounded-lg">
                          <span className="text-lg">Ξ</span>
                          <span
                            className={
                              theme === "dark" ? "text-white" : "text-black"
                            }
                          >
                            ETH
                          </span>
                          <span
                            className={`text-sm ${
                              theme === "dark"
                                ? "text-white/50"
                                : "text-black/50"
                            } ml-auto`}
                          >
                            $2,450.67
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label
                          className={`text-sm ${
                            theme === "dark" ? "text-white/70" : "text-black/70"
                          }`}
                        >
                          To Token
                        </label>
                        <div className="flex items-center gap-2 p-3 border rounded-lg">
                          <span className="text-lg">$</span>
                          <span
                            className={
                              theme === "dark" ? "text-white" : "text-black"
                            }
                          >
                            USDC
                          </span>
                          <span
                            className={`text-sm ${
                              theme === "dark"
                                ? "text-white/50"
                                : "text-black/50"
                            } ml-auto`}
                          >
                            $1.00
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button className="w-full bg-[#FCFE52] hover:bg-[#E6E84A] text-black">
                      Swap Tokens
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeView === "createSplit" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2
                    className={`${
                      theme === "dark" ? "text-white" : "text-black"
                    } text-xl font-bold font-[family-name:var(--font-share-tech-mono)] uppercase tracking-wider`}
                  >
                    Create New Split
                  </h2>
                  <Button
                    onClick={() => handleViewChange("default")}
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Wallet Connection Section */}
                  <Card className="border border-white/20 bg-black/50 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white font-[family-name:var(--font-share-tech-mono)]">
                        <Wallet className="w-5 h-5" />
                        {isConnected ? "Wallet Connected" : "Connect Wallet"}
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

                          {!isOnBaseSepolia && (
                            <Button
                              onClick={handleSwitchNetwork}
                              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                            >
                              Switch to Base Sepolia
                            </Button>
                          )}

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

                          <div className="relative">
                            <Button
                              onClick={() =>
                                setShowWalletOptions(!showWalletOptions)
                              }
                              className="w-full bg-[#FCFE52] hover:bg-[#0041CC] text-white flex items-center justify-between"
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

                  {/* Split Creation Form - Only show if wallet is connected and on correct network */}
                  {isConnected && isOnBaseSepolia && (
                    <div className="border border-white">
                      <SplitCreationForm
                        theme={theme}
                        onSplitCreated={handleSplitCreated}
                      />
                    </div>
                  )}
                </div>
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
                    onClick={() => handleViewChange("default")}
                    variant="outline"
                    className={`${
                      theme === "dark"
                        ? "border-white/20 hover:bg-white/10 text-black"
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
                            theme === "dark" ? "text-white/50" : "text-black/50"
                          }`}
                        >
                          No transactions yet
                        </p>
                        <p
                          className={`text-sm ${
                            theme === "dark" ? "text-white/30" : "text-black/30"
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

          {/* Message when no splits */}
          {isConnected && isOnBaseSepolia && userSplits.length === 0 && (
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
          {isConnected && !isOnBaseSepolia && (
            <div className="text-center py-12">
              <p
                className={`${
                  theme === "dark" ? "text-white/50" : "text-black/50"
                } text-lg`}
              >
                Please switch to Base Sepolia network to create and manage
                splits.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
