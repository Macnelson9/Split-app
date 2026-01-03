import type React from "react";
import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import "./globals.css";
import ClientLayout from "./client-layout";
import { Providers } from "@/components/providers";
import "@fontsource/poppins";
import "@fontsource/inter";

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Split - Automate Your Payments",
  description: "Automate your payments, instantly and transparently.",
  generator: "v0.app",
  icons: {
    icon: "/Split Celo light.png",
  },
    other: {
    'base:app_id': '69590d824d3a403912ed8b78',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} ${inter.variable}`}>
      <body className="font-sans antialiased">
        <Providers>
          <ClientLayout>{children}</ClientLayout>
        </Providers>
      </body>
    </html>
  );
}
