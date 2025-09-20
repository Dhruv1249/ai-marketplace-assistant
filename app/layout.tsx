import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientNavigation from "@/components/layout/ClientNavigation";
import StyledComponentsRegistry from "@/lib/styled-components";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Marketplace Assistant",
  description: "AI-powered marketplace assistant for creating product pages",
  icons: {
    icon: "/images/Screenshot 2025-09-20 165808.png",
    shortcut: "/images/Screenshot 2025-09-20 165808.png",
    apple: "/images/Screenshot 2025-09-20 165808.png",
  },
  manifest: "/manifest.json"
};

export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <StyledComponentsRegistry>
          <ClientNavigation />
          <main>
            {children}
          </main>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
