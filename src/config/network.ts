export type NetworkType = 'devnet' | 'mainnet';

export interface FeeConfig {
  tokenCreation: number;
  revokeMint: number;
  updateMetadata: number;
}

export interface NetworkConfig {
  name: NetworkType;
  rpcUrl: string;
  fees: FeeConfig;
  feeWalletAddress: string;
}

const feeWalletAddress = process.env.NEXT_PUBLIC_FEE_WALLET_ADDRESS || 'AfrTQQTmxYMu3RotbQobTDSenHU61BqpXtGvdBzaCzWf';

export const getNetworkConfig = (network: NetworkType): NetworkConfig => {
  if (network === 'mainnet') {
    return {
      name: 'mainnet',
      rpcUrl: process.env.NEXT_PUBLIC_MAINNET_RPC_URL || 'https://api.mainnet-beta.solana.com',
      feeWalletAddress,
      fees: {
        tokenCreation: parseFloat(process.env.NEXT_PUBLIC_MAINNET_FEE_TOKEN_CREATION || '0.1'),
        revokeMint: parseFloat(process.env.NEXT_PUBLIC_MAINNET_FEE_REVOKE_MINT || '0.01'),
        updateMetadata: parseFloat(process.env.NEXT_PUBLIC_MAINNET_FEE_UPDATE_METADATA || '0.01'),
      },
    };
  } else {
    return {
      name: 'devnet',
      rpcUrl: process.env.NEXT_PUBLIC_DEVNET_RPC_URL || 'https://api.devnet.solana.com',
      feeWalletAddress,
      fees: {
        tokenCreation: parseFloat(process.env.NEXT_PUBLIC_DEVNET_FEE_TOKEN_CREATION || '0.1'),
        revokeMint: parseFloat(process.env.NEXT_PUBLIC_DEVNET_FEE_REVOKE_MINT || '0.01'),
        updateMetadata: parseFloat(process.env.NEXT_PUBLIC_DEVNET_FEE_UPDATE_METADATA || '0.01'),
      },
    };
  }
};
