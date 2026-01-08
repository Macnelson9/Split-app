"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Wallet, Power, Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import DecryptedText from "@/components/decrypted-text";
import { WalletModal } from "@/components/WalletModal";
import { useAccount } from "wagmi";

export default function HomePage() {
  const [decryptKey, setDecryptKey] = useState(0);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const { isConnected, address } = useAccount();

  useEffect(() => {
    // Load theme from localStorage on mount
    const savedTheme = localStorage.getItem("theme") as "dark" | "light" | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setDecryptKey((prev) => prev + 1);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    // Save to localStorage
    localStorage.setItem("theme", newTheme);
  };

  return (
    <div
      className={`min-h-screen relative overflow-hidden ${
        theme === "dark" ? "bg-black" : "bg-white"
      }`}
    >
      {/* Logo top-left (responsive) */}
      <div className="absolute top-4 left-4 z-50 lg:left-11">
        <Link href="/" className="flex items-center gap-2">
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
        </Link>
      </div>

      {/* Theme switcher in top right corner */}
      <div className="absolute top-8  right-11 z-50">
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
      </div>
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
                <stop offset="0%" stopColor="rgba(255,255,255,1)" />
                <stop offset="30%" stopColor="rgba(252,254,82,1)" />
                <stop offset="70%" stopColor="rgba(252,254,82,0.8)" />
                <stop offset="100%" stopColor="rgba(252,254,82,0)" />
              </radialGradient>
              <radialGradient id="neonPulse2" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
                <stop offset="25%" stopColor="rgba(252,254,82,0.9)" />
                <stop offset="60%" stopColor="rgba(0,65,204,0.7)" />
                <stop offset="100%" stopColor="rgba(0,65,204,0)" />
              </radialGradient>
              <radialGradient id="neonPulse3" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(255,255,255,1)" />
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
                <stop offset="0%" stopColor="rgba(0,0,0,1)" />
                <stop offset="15%" stopColor="rgba(252,254,82,0.8)" />
                <stop offset="85%" stopColor="rgba(252,254,82,0.8)" />
                <stop offset="100%" stopColor="rgba(0,0,0,1)" />
              </linearGradient>
              <linearGradient
                id="threadFade2"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="rgba(0,0,0,1)" />
                <stop offset="12%" stopColor="rgba(252,254,82,0.7)" />
                <stop offset="88%" stopColor="rgba(252,254,82,0.7)" />
                <stop offset="100%" stopColor="rgba(0,0,0,1)" />
              </linearGradient>
              <linearGradient
                id="threadFade3"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="rgba(0,0,0,1)" />
                <stop offset="18%" stopColor="rgba(0,65,204,0.8)" />
                <stop offset="82%" stopColor="rgba(0,65,204,0.8)" />
                <stop offset="100%" stopColor="rgba(0,0,0,1)" />
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
              {/* Adding hero text background shape */}
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

              {/* Thread 1 - Smooth S-curve from bottom-left to right */}
              <path
                id="thread1"
                d="M50 720 Q200 590 350 540 Q500 490 650 520 Q800 550 950 460 Q1100 370 1200 340"
                stroke="url(#threadFade1)"
                strokeWidth="0.8"
                fill="none"
                opacity="0.8"
              />
              {/* ETH Token */}
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

              {/* Thread 2 - Gentle wave flow */}
              <path
                id="thread2"
                d="M80 730 Q250 620 400 570 Q550 520 700 550 Q850 580 1000 490 Q1150 400 1300 370"
                stroke="url(#threadFade2)"
                strokeWidth="1.5"
                fill="none"
                opacity="0.7"
              />
              {/* USDC Token */}
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

              {/* Thread 3 - Organic curve */}
              <path
                id="thread3"
                d="M20 710 Q180 580 320 530 Q460 480 600 510 Q740 540 880 450 Q1020 360 1200 330"
                stroke="url(#threadFade3)"
                strokeWidth="1.2"
                fill="none"
                opacity="0.8"
              />
              {/* Base ETH Token */}
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

              {/* Thread 4 - Flowing curve */}
              <path
                id="thread4"
                d="M120 740 Q280 640 450 590 Q620 540 770 570 Q920 600 1070 510 Q1220 420 1350 390"
                stroke="url(#threadFade1)"
                strokeWidth="0.6"
                fill="none"
                opacity="0.6"
              />
              {/* USDT Token */}
              <g filter="url(#neonGlow)">
                <animateMotion dur="5.5s" repeatCount="indefinite">
                  <mpath href="#thread4" />
                </animateMotion>
                <circle r="8" fill="#26A17B" opacity="0.9" />
                <text
                  x="0"
                  y="4"
                  textAnchor="middle"
                  fill="white"
                  fontSize="7"
                  fontWeight="bold"
                >
                  ₮
                </text>
              </g>

              {/* Thread 5 - Natural wave */}
              <path
                id="thread5"
                d="M60 725 Q220 600 380 550 Q540 500 680 530 Q820 560 960 470 Q1100 380 1280 350"
                stroke="url(#threadFade2)"
                strokeWidth="1.0"
                fill="none"
                opacity="0.7"
              />
              {/* ETH Token 2 */}
              <g filter="url(#neonGlow)">
                <animateMotion dur="4.2s" repeatCount="indefinite">
                  <mpath href="#thread5" />
                </animateMotion>
                <circle r="7" fill="#627EEA" opacity="0.9" />
                <text
                  x="0"
                  y="3.5"
                  textAnchor="middle"
                  fill="white"
                  fontSize="7"
                  fontWeight="bold"
                >
                  Ξ
                </text>
              </g>

              {/* Thread 6 - Smooth flow */}
              <path
                id="thread6"
                d="M150 735 Q300 660 480 610 Q660 560 800 590 Q940 620 1080 530 Q1220 440 1400 410"
                stroke="url(#threadFade3)"
                strokeWidth="1.3"
                fill="none"
                opacity="0.6"
              />
              {/* USDC Token 2 */}
              <g filter="url(#neonGlow)">
                <animateMotion dur="5.2s" repeatCount="indefinite">
                  <mpath href="#thread6" />
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

              {/* Thread 7 - Organic S-curve */}
              <path
                id="thread7"
                d="M40 715 Q190 585 340 535 Q490 485 630 515 Q770 545 910 455 Q1050 365 1250 335"
                stroke="url(#threadFade1)"
                strokeWidth="0.9"
                fill="none"
                opacity="0.8"
              />
              {/* Base ETH Token 2 */}
              <g filter="url(#neonGlow)">
                <animateMotion dur="4.8s" repeatCount="indefinite">
                  <mpath href="#thread7" />
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

              {/* Thread 8 - Gentle wave */}
              <path
                id="thread8"
                d="M100 728 Q260 630 420 580 Q580 530 720 560 Q860 590 1000 500 Q1140 410 1320 380"
                stroke="url(#threadFade2)"
                strokeWidth="1.4"
                fill="none"
                opacity="0.7"
              />
              {/* USDT Token 2 */}
              <g filter="url(#neonGlow)">
                <animateMotion dur="5.8s" repeatCount="indefinite">
                  <mpath href="#thread8" />
                </animateMotion>
                <circle r="9" fill="#26A17B" opacity="0.9" />
                <text
                  x="0"
                  y="4"
                  textAnchor="middle"
                  fill="white"
                  fontSize="7"
                  fontWeight="bold"
                >
                  ₮
                </text>
              </g>

              {/* Thread 9 - Thin flowing curve */}
              <path
                id="thread9"
                d="M30 722 Q170 595 310 545 Q450 495 590 525 Q730 555 870 465 Q1010 375 1180 345"
                stroke="url(#threadFade3)"
                strokeWidth="0.5"
                fill="none"
                opacity="0.6"
              />
              {/* Additional tokens for remaining threads */}
              <g filter="url(#neonGlow)">
                <animateMotion dur="6s" repeatCount="indefinite">
                  <mpath href="#thread9" />
                </animateMotion>
                <circle r="6" fill="#627EEA" opacity="0.8" />
                <text
                  x="0"
                  y="3"
                  textAnchor="middle"
                  fill="white"
                  fontSize="6"
                  fontWeight="bold"
                >
                  Ξ
                </text>
              </g>

              {/* Thread 10 - Medium thick wave */}
              <path
                id="thread10"
                d="M90 732 Q240 625 390 575 Q540 525 680 555 Q820 585 960 495 Q1100 405 1300 375"
                stroke="url(#threadFade1)"
                strokeWidth="1.1"
                fill="none"
                opacity="0.8"
              />
              <g filter="url(#neonGlow)">
                <animateMotion dur="4.3s" repeatCount="indefinite">
                  <mpath href="#thread10" />
                </animateMotion>
                <circle r="8" fill="#2775CA" opacity="0.9" />
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
            </g>
          </svg>
        </div>
      </div>

      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 sm:px-6 lg:px-12 max-w-6xl sm:-mt-12 lg:-mt-24 sm:items-start sm:pl-12 lg:pl-20">
        <h1
          className={`${
            theme === "dark" ? "text-white" : "text-black"
          } text-3xl sm:text-lg md:text-2xl lg:text-3xl xl:text-4xl font-bold leading-tight mb-4 sm:mb-6 text-balance font-[family-name:var(--font-share-tech-mono)] uppercase tracking-wider text-center sm:text-left`}
        >
          <DecryptedText
            key={decryptKey}
            text="ONE PAYMENT. MULTIPLE WALLETS."
            animateOn="view"
            speed={50}
            maxIterations={15}
            characters="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
            className={theme === "dark" ? "text-white" : "text-black"}
            encryptedClassName={
              theme === "dark" ? "text-white/40" : "text-black/40"
            }
          />
        </h1>

        <p
          className={`${
            theme === "dark" ? "text-white/70" : "text-black/70"
          } text-lg sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 max-w-2xl text-pretty font-[family-name:var(--font-rajdhani)] font-medium leading-relaxed text-center sm:text-left`}
        >
          Send once. Split instantly.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <Link href="/split">
            <Button
              className={`group relative px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base md:text-base lg:text-lg font-semibold flex items-center gap-2 backdrop-blur-sm border shadow-lg transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 font-[family-name:var(--font-rajdhani)] bg-transparent ${
                theme === "dark"
                  ? "text-white hover:text-black"
                  : "text-black hover:text-black"
              }`}
            >
              Launch App
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 group-hover:-rotate-12 transition-transform duration-300" />
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Button>
          </Link>

          {isConnected ? (
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setWalletModalOpen(true)}
                variant="outline"
                className={`bg-white/10 hover:bg-white/20 border-white/20 ${
                  theme === "dark" ? "text-white" : "text-black"
                } px-4 py-2 rounded-lg flex items-center gap-2`}
              >
                <Wallet className="w-4 h-4" />
                {formatAddress(address!)}
              </Button>
              <Button
                onClick={() => setWalletModalOpen(true)}
                variant="outline"
                size="sm"
                className="bg-red-500/10 hover:bg-red-500/20 border-red-500/20 text-red-400 p-2"
              >
                <Power className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => setWalletModalOpen(true)}
              variant="outline"
              className="bg-white/10 hover:bg-white/20 border-white/20 text-white px-6 py-2.5 rounded-lg flex items-center gap-2"
            >
              <Wallet className="w-4 h-4" />
              Connect Wallet
            </Button>
          )}
        </div>
      </main>

      <WalletModal
        isOpen={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
      />
    </div>
  );
}
