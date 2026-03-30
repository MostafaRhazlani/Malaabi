export interface Wallet {
  id: string;
  balance: number;
  userId: string;
  transactions?: WalletTransaction[];
  createdAt: string;
  updatedAt: string;
}

export interface WalletTransaction {
  id: string;
  amount: number;
  type: 'TOP_UP' | 'DEDUCT' | 'PAYMENT' | 'REFUND';
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  description?: string;
  walletId: string;
  createdAt: string;
}

export interface TopUpRequest {
  amount: number;
  description?: string;
}

export interface DeductRequest {
  amount: number;
  description?: string;
}
