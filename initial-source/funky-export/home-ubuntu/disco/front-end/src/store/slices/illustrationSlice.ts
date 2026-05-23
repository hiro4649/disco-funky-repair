import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface Illustration {
  loading: boolean;
  image_url: string | null;
  earned_pts: number | null;
  jumpStatus: boolean | null;
  transition_status: boolean | null;
  error: string | null;
  dance: boolean | null;
}

const initialState: Illustration = {
  loading: false,
  image_url: null,
  earned_pts: null,
  jumpStatus: null,
  transition_status: null,
  error: null,
  dance: false
};

export const illustrationSlice = createSlice({
  name: 'illustration',
  initialState,
  reducers: {
    setIllustrationLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setIllustrationData: (state, action: PayloadAction<{
      image_url: string;
      earned_pts: number;
      jumpStatus: boolean;
      transition_status?: boolean;
      dance?: boolean;
    }>) => {
      state.image_url = action.payload.image_url;
      state.earned_pts = action.payload.earned_pts;
      state.jumpStatus = action.payload.jumpStatus;
      state.transition_status = action.payload.transition_status || null;
      state.dance = action.payload.dance || false;
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