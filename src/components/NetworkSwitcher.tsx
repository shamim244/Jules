'use client';

import React from 'react';
import { useNetwork } from '../context/NetworkContext';
import { NetworkType } from '../config/network';

export const NetworkSwitcher = () => {
  const { network, setNetwork } = useNetwork();

  const handleNetworkChange = (newNetwork: NetworkType) => {
    setNetwork(newNetwork);
  };

  return (
    <div className="flex items-center space-x-2 bg-gray-100 p-1 rounded-lg">
      <button
        onClick={() => handleNetworkChange('devnet')}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          network === 'devnet'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-gray-500 hover:text-gray-900'
        }`}
      >
        Devnet
      </button>
      <button
        onClick={() => handleNetworkChange('mainnet')}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          network === 'mainnet'
            ? 'bg-white text-purple-600 shadow-sm'
            : 'text-gray-500 hover:text-gray-900'
        }`}
      >
        Mainnet
      </button>
    </div>
  );
};
