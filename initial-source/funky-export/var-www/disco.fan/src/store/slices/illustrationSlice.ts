import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface Illustration {
  loading: boolean;
  name: string | null;
  description: string | null;
  image_url: string | null;
  earned_pts: number | null;
  jumpStatus: boolean | null;
  rarity_style: string | null;
  transition_status: boolean | null;
  error: string | null;
}

const initialState: Illustration = {
  loading: false,
  name: null,
  description: null,
  image_url: null,
  earned_pts: null,
  jumpStatus: null,
  rarity_style: null,
  transition_status: null,
  error: null
};

export const illustrationSlice = createSlice({
  name: 'illustration',
  initialState,
  reducers: {
    setIllustrationLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setIllustrationData: (state, action: PayloadAction<{
      name: string;
      description: string;
      image_url: string;
      earned_pts: number;
      jumpStatus: boolean;
      rarity_style?: string;
      transition_status?: boolean;
    }>) => {
      state.name = action.payload.name;
      state.description = action.payload.description;
      state.image_url = action.payload.image_url;
      state.earned_pts = action.payload.earned_pts;
      state.jumpStatus = action.payload.jumpStatus;
      state.rarity_style = action.payload.rarity_style || null;
      state.transition_status = action.payload.transition_status || null;
      state.error = null;
    },
    setIllustrationError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    resetIllustration: () => initialState,
  },
});

export const { 
  setIllustrationLoading, 
  setIllustrationData, 
  setIllustrationError,
  resetIllustration 
} = illustrationSlice.actions;

export const illustrationReducer = illustrationSlice.reducer; 