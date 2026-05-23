import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { prizelist } from "@/types/prizelist";

interface AirdropItemState {
  loading: boolean;
  items: prizelist[];
  error: string | null;
}

const initialState: AirdropItemState = {
  loading: false,
  items: [],
  error: null,
};

export const airdropItemSlice = createSlice({
  name: 'airdropItem',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setItems: (state, action: PayloadAction<prizelist[]>) => {
      state.items = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearItems: (state) => {
      state.items = [];
    }
  },
});

export const { setLoading, setItems, setError, clearItems } = airdropItemSlice.actions;
export const airdropItemReducer = airdropItemSlice.reducer; 