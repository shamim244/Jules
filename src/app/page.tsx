'use client';

import { TokenCreationForm } from "@/components/TokenCreationForm";
import { TokenManagement } from "@/components/TokenManagement";

export default function Home() {
  return (
    <div className="space-y-12">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          Launch your token in seconds
        </h2>
        <p className="mt-4 text-lg text-gray-500">
          Easily create, mint, and manage your SPL tokens on Solana.
        </p>
      </div>

      <TokenCreationForm />
      <TokenManagement />
    </div>
  );
}
