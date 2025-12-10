import { Connection, PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js';
import { createFeeInstruction } from './fee';

interface TransactionOptions {
  connection: Connection;
  userWallet: PublicKey;
  feeAmountInSol: number;
  feeWalletAddress: string;
  instructions: TransactionInstruction[];
  signTransaction: (transaction: Transaction) => Promise<Transaction>;
}

export const buildAndSendTransaction = async ({
  connection,
  userWallet,
  feeAmountInSol,
  feeWalletAddress,
  instructions,
  signTransaction,
}: TransactionOptions): Promise<string> => {
  // 1. Create Transaction
  const transaction = new Transaction();

  // 2. Add Fee Instruction (ALWAYS FIRST)
  if (feeAmountInSol > 0) {
    transaction.add(createFeeInstruction(userWallet, feeAmountInSol, feeWalletAddress));
  }

  // 3. Add Operation Instructions
  instructions.forEach((ix) => transaction.add(ix));

  // 4. Set Fee Payer and Blockhash
  transaction.feePayer = userWallet;
  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;

  // 5. Sign Transaction
  const signedTransaction = await signTransaction(transaction);

  // 6. Send Transaction
  const rawTransaction = signedTransaction.serialize();
  const signature = await connection.sendRawTransaction(rawTransaction, {
    skipPreflight: false,
    preflightCommitment: 'confirmed',
  });

  // 7. Wait for Confirmation
  await connection.confirmTransaction(signature, 'confirmed');

  return signature;
};
