import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WalletState {
  balance: number;
  transactions: any[];
  loading: boolean;
}

const initialState: WalletState = {
  balance: 0,
  transactions: [],
  loading: false,
};

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setWallet: (state, action: PayloadAction<{ balance: number, transactions: any[] }>) => {
      state.balance = action.payload.balance;
      state.transactions = action.payload.transactions;
    },
    updateBalance: (state, action: PayloadAction<number>) => {
      state.balance = action.payload;
    },
    addTransaction: (state, action: PayloadAction<any>) => {
      state.transactions = [action.payload, ...state.transactions];
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setWallet, updateBalance, addTransaction, setLoading } = walletSlice.actions;
export default walletSlice.reducer;
