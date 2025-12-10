export const getErrorMessage = (error: unknown): string => {
  if (typeof error === 'string') return error;

  if (error instanceof Error) {
    if (error.message.includes('User rejected the request')) {
      return 'Transaction cancelled by user';
    }
    if (error.message.includes('0x1')) {
       return 'Insufficient funds for transaction';
    }
    return error.message;
  }

  return 'An unexpected error occurred';
};
