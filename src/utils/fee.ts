import { Connection, PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL, TransactionInstruction } from '@solana/web3.js';
import { NetworkConfig } from '../config/network';

export const createFeeInstruction = (
  userWallet: PublicKey,
  feeAmountInSol: number,
  feeWalletAddress: string
): TransactionInstruction => {
  return SystemProgram.transfer({
    fromPubkey: userWallet,
    toPubkey: new PublicKey(feeWalletAddress),
    lamports: Math.round(feeAmountInSol * LAMPORTS_PER_SOL),
  });
};

export const collectFee = async (
  connection: Connection,
  userWallet: PublicKey,
  feeAmountInSol: number,
  feeWalletAddress: string,
  sendTransaction: (transaction: Transaction, connection: Connection) => Promise<string>
): Promise<string> => {
  const transaction = new Transaction().add(
    createFeeInstruction(userWallet, feeAmountInSol, feeWalletAddress)
  );

  const signature = await sendTransaction(transaction, connection);
  await connection.confirmTransaction(signature, 'confirmed');
  return signature;
};
