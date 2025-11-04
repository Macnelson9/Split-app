"use client";

import type React from "react";
import StaggeredMenu from "@/components/StaggeredMenu";
import { useState, useEffect } from "react";

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    // Load theme from localStorage on mount
    const savedTheme = localStorage.getItem("theme") as "dark" | "light" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
      document.documentElement.classList.toggle(
        "light",
        savedTheme === "light"
      );
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    // Save to localStorage
    localStorage.setItem("theme", newTheme);
    // Apply theme to document
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    document.documentElement.classList.toggle("light", newTheme === "light");
  };

  const menuItems = [
    { label: "Home", ariaLabel: "Go to home page", link: "/" },
    { label: "Split", ariaLabel: "Go to split page", link: "/split" },
    { label: "About", ariaLabel: "Learn about us", link: "/about" },
    { label: "Contact", ariaLabel: "Get in touch", link: "/contact" },
    { label: "Dashboard", ariaLabel: "View dashboard", link: "/dashboard" },
  ];

  const socialItems = [
    { label: "Twitter", link: "https://twitter.com" },
    { label: "GitHub", link: "https://github.com" },
    { label: "LinkedIn", link: "https://linkedin.com" },
  ];

  return (
    <div
      className={`font-sans antialiased ${
        theme === "dark" ? "bg-black" : "bg-white"
      }`}
    >
      <StaggeredMenu
        position="right"
        items={menuItems}
        socialItems={socialItems}
        displaySocials={true}
        displayItemNumbering={true}
        menuButtonColor="#fff"
        openMenuButtonColor="#fff"
        changeMenuColorOnOpen={true}
        colors={["#B19EEF", "#5227FF"]}
        logoUrl="/Split Celo light.png"
        accentColor="#FCFE52"
        isFixed={true}
        theme={theme}
        onThemeToggle={toggleTheme}
      />
      {children}
    </div>
  );
}
