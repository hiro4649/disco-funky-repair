import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { prizelist } from '@/types/prizelist';

interface PrizeItemState {
  loading: boolean;
  items: prizelist[];
  error: string | null;
}

const initialState: PrizeItemState = {
  loading: false,
  items: [],
  error: null
};

export const prizeItemSlice = createSlice({
  name: 'prizeItem',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setItems: (state, action: PayloadAction<prizelist[]>) => {
      state.items = action.payload;
      state.error = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    resetPrizeItems: () => initialState,
  },
});

export const { 
  setLoading, 
  setItems, 
  setError,
  resetPrizeItems 
} = prizeItemSlice.actions;

export const prizeItemReducer = prizeItemSlice.reducer; 