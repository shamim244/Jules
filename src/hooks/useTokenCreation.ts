import {
  Keypair,
  SystemProgram,
  TransactionInstruction,
  PublicKey,
  Transaction
} from '@solana/web3.js';
import {
  createInitializeMintInstruction,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID
} from '@solana/spl-token';
import {
  createCreateMetadataAccountV3Instruction,
  PROGRAM_ID as TOKEN_METADATA_PROGRAM_ID
} from '@metaplex-foundation/mpl-token-metadata';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useState } from 'react';
import { useNetwork } from '../context/NetworkContext';
import { createFeeInstruction } from '../utils/fee';

interface TokenCreationData {
  name: string;
  symbol: string;
  decimals: number;
  supply: number;
  description: string;
  image: File;
  website?: string;
}

export const useTokenCreation = () => {
  const { connection } = useConnection();
  const { publicKey, signTransaction } = useWallet();
  const { network, config } = useNetwork();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ signature: string; mint: string } | null>(null);
  const [status, setStatus] = useState<string>('');

  const createToken = async (data: TokenCreationData) => {
    if (!publicKey || !signTransaction) {
      setError('Wallet not connected');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // 1. Upload Image
      setStatus('Uploading image to Irys...');
      const formData = new FormData();
      formData.append('file', data.image);
      formData.append('network', network);

      const imageRes = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });
      const imageData = await imageRes.json();
      if (imageData.error) throw new Error(imageData.error);
      const imageUri = imageData.uri;

      // 2. Upload Metadata
      setStatus('Uploading metadata to Irys...');
      const metadata = {
        name: data.name,
        symbol: data.symbol,
        description: data.description,
        image: imageUri,
        external_url: data.website,
        properties: {
          files: [{ uri: imageUri, type: data.image.type }],
        },
      };

      const metadataRes = await fetch('/api/upload/metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metadata, network }),
      });
      const metadataData = await metadataRes.json();
      if (metadataData.error) throw new Error(metadataData.error);
      const metadataUri = metadataData.uri;

      // 3. Prepare Instructions
      setStatus('Building transaction...');
      const mintKeypair = Keypair.generate();
      const mint = mintKeypair.publicKey;
      const instructions: TransactionInstruction[] = [];

      // A. Create Mint Account
      const lamports = await connection.getMinimumBalanceForRentExemption(MINT_SIZE);
      instructions.push(
        SystemProgram.createAccount({
          fromPubkey: publicKey,
          newAccountPubkey: mint,
          space: MINT_SIZE,
          lamports,
          programId: TOKEN_PROGRAM_ID,
        }),
        createInitializeMintInstruction(
          mint,
          data.decimals,
          publicKey, // mint authority
          publicKey, // freeze authority
          TOKEN_PROGRAM_ID
        )
      );

      // B. Create Metadata Account
      const [metadataAddress] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('metadata'),
          TOKEN_METADATA_PROGRAM_ID.toBuffer(),
          mint.toBuffer(),
        ],
        TOKEN_METADATA_PROGRAM_ID
      );

      instructions.push(
        createCreateMetadataAccountV3Instruction(
          {
            metadata: metadataAddress,
            mint: mint,
            mintAuthority: publicKey,
            payer: publicKey,
            updateAuthority: publicKey,
          },
          {
            createMetadataAccountArgsV3: {
              data: {
                name: data.name,
                symbol: data.symbol,
                uri: metadataUri,
                sellerFeeBasisPoints: 0,
                creators: [{ address: publicKey, verified: true, share: 100 }],
                collection: null,
                uses: null,
              },
              isMutable: true,
              collectionDetails: null,
            },
          }
        )
      );

      // C. Create Associated Token Account for User
      const userAta = await getAssociatedTokenAddress(
        mint,
        publicKey,
        false,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );

      instructions.push(
        createAssociatedTokenAccountInstruction(
          publicKey,
          userAta,
          publicKey,
          mint,
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID
        )
      );

      // D. Mint Initial Supply
      if (data.supply > 0) {
        // Handle potential floating point supply (e.g. 1.5 tokens)
        // We multiply supply by 10^decimals
        // Using Math.round to ensure we get an integer before BigInt conversion
        // Note: For very high precision requirements, a BigNumber library is preferred,
        // but for standard MVP use cases, this handles common floating point inputs.
        const multiplier = Math.pow(10, data.decimals);
        const amountRaw = Math.round(data.supply * multiplier);
        const amount = BigInt(amountRaw);

        instructions.push(
          createMintToInstruction(
            mint,
            userAta,
            publicKey,
            amount,
            [],
            TOKEN_PROGRAM_ID
          )
        );
      }

      // 4. Send Transaction (Fee + Operations)
      // Note: We need to partial sign with mintKeypair

      const transaction = new Transaction();

      // Fee
      const feeAmount = config.fees.tokenCreation;
      if (feeAmount > 0) {
        transaction.add(createFeeInstruction(publicKey, feeAmount, config.feeWalletAddress));
      }

      // Operations
      instructions.forEach(ix => transaction.add(ix));

      transaction.feePayer = publicKey;
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;

      // Partial sign with mintKeypair
      transaction.partialSign(mintKeypair);

      // Wallet sign
      const signedTransaction = await signTransaction(transaction);

      setStatus('Sending transaction...');
      const signature = await connection.sendRawTransaction(signedTransaction.serialize());

      setStatus('Confirming...');
      await connection.confirmTransaction(signature, 'confirmed');

      setSuccess({ signature, mint: mint.toBase58() });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to create token');
    } finally {
      setLoading(false);
      setStatus('');
    }
  };

  return { createToken, loading, error, success, status };
};
