'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { NetworkType, NetworkConfig, getNetworkConfig } from '../config/network';
import { Connection } from '@solana/web3.js';

interface NetworkContextType {
  network: NetworkType;
  config: NetworkConfig;
  connection: Connection;
  setNetwork: (network: NetworkType) => void;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export const NetworkProvider = ({ children }: { children: ReactNode }) => {
  const [network, setNetwork] = useState<NetworkType>('devnet');
  const [config, setConfig] = useState<NetworkConfig>(getNetworkConfig('devnet'));
  const [connection, setConnection] = useState<Connection>(new Connection(config.rpcUrl));

  useEffect(() => {
    const newConfig = getNetworkConfig(network);
    setConfig(newConfig);
    setConnection(new Connection(newConfig.rpcUrl, 'confirmed'));
  }, [network]);

  return (
    <NetworkContext.Provider value={{ network, config, connection, setNetwork }}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
};
