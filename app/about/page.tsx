"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Menu, Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function AboutPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [decryptKey, setDecryptKey] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDecryptKey((prev) => prev + 1);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

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

        <button
          className={`md:hidden p-2 ${
            theme === "dark" ? "text-white" : "text-black"
          }`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <Menu className="w-6 h-6" />
        </button>
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
          </nav>
        </div>
      )}

      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 sm:px-6 lg:px-12 max-w-6xl sm:-mt-12 lg:-mt-24 sm:items-start sm:pl-12 lg:pl-20">
        <h1
          className={`${
            theme === "dark" ? "text-white" : "text-black"
          } text-base sm:text-lg md:text-2xl lg:text-3xl xl:text-4xl font-bold leading-tight mb-4 sm:mb-6 text-balance font-[family-name:var(--font-share-tech-mono)] uppercase tracking-wider text-center sm:text-left`}
        >
          ABOUT US
        </h1>
        <p
          className={`${
            theme === "dark" ? "text-white/70" : "text-black/70"
          } text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 max-w-2xl text-pretty font-[family-name:var(--font-rajdhani)] font-medium leading-relaxed text-center sm:text-left`}
        >
          Learn more about our mission to revolutionize payment splitting.
        </p>
        <Button className="group relative bg-[#FCFE52] hover:bg-[#0041CC] text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base md:text-base lg:text-lg font-semibold flex items-center gap-2 backdrop-blur-sm border border-[#FCFE52]/30 shadow-lg shadow-[#FCFE52]/25 hover:shadow-xl hover:shadow-[#FCFE52]/40 transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 font-[family-name:var(--font-rajdhani)]">
          Learn More
          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 group-hover:-rotate-12 transition-transform duration-300" />
          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Button>
      </main>
    </div>
  );
}
