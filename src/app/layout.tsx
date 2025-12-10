'use client';

import { Inter } from "next/font/google";
import "./globals.css";
import { NetworkProvider } from "@/context/NetworkContext";
import { WalletProvider } from "@/components/WalletProvider";
import { NetworkSwitcher } from "@/components/NetworkSwitcher";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NetworkProvider>
          <WalletProvider>
            <div className="min-h-screen bg-gray-50 text-gray-900">
              <nav className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex justify-between h-16 items-center">
                    <div className="flex-shrink-0 flex items-center">
                      <h1 className="text-xl font-bold text-gray-900">Solana Token Creator</h1>
                    </div>
                    <div className="flex items-center space-x-4">
                      <NetworkSwitcher />
                      <WalletMultiButton />
                    </div>
                  </div>
                </div>
              </nav>
              <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
                {children}
              </main>
            </div>
          </WalletProvider>
        </NetworkProvider>
      </body>
    </html>
  );
}
