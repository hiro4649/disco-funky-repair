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

interface TransitionState {
  illustration1: Illustration;
  illustration2: Illustration;
  transition_status: boolean | null;
}

const initialIllustration: Illustration = {
  loading: false,
  image_url: null,
  earned_pts: null,
  jumpStatus: null,
  transition_status: null,
  error: null,
  dance: false
};

const initialState: TransitionState = {
  illustration1: { ...initialIllustration },
  illustration2: { ...initialIllustration },
  transition_status: false,
};

export const transitionSlice = createSlice({
  name: 'transitionAnimation',
  initialState,
  reducers: {
    setTransitionStatus: (state, action: PayloadAction<boolean>) => {
      state.transition_status = action.payload;
    },
    // Illustration 1 actions
    setIllustration1Loading: (state, action: PayloadAction<boolean>) => {
      state.illustration1.loading = action.payload;
    },
    setIllustration1Data: (state, action: PayloadAction<{
      image_url: string;
      earned_pts: number;
      jumpStatus: boolean;
      transition_status?: boolean;
      dance?: boolean;
    }>) => {
      state.illustration1.image_url = action.payload.image_url;
      state.illustration1.earned_pts = action.payload.earned_pts;
      state.illustration1.jumpStatus = action.payload.jumpStatus;
      state.illustration1.transition_status = action.payload.transition_status || null;
      state.illustration1.dance = action.payload.dance || false;
      state.illustration1.error = null;
    },
    setIllustration1Error: (state, action: PayloadAction<string>) => {
      state.illustration1.error = action.payload;
    },
    resetIllustration1: (state) => {
      state.illustration1 = { ...initialIllustration };
    },

    // Illustration 2 actions
    setIllustration2Loading: (state, action: PayloadAction<boolean>) => {
      state.illustration2.loading = action.payload;
    },
    setIllustration2Data: (state, action: PayloadAction<{
      image_url: string;
      earned_pts: number;
      jumpStatus: boolean;
      transition_status?: boolean;
    }>) => {
      state.illustration2.image_url = action.payload.image_url;
      state.illustration2.earned_pts = action.payload.earned_pts;
      state.illustration2.jumpStatus = action.payload.jumpStatus;
      state.illustration2.transition_status = action.payload.transition_status || null;
      state.illustration2.error = null;
    },
    setIllustration2Error: (state, action: PayloadAction<string>) => {
      state.illustration2.error = action.payload;
    },
    resetIllustration2: (state) => {
      state.illustration2 = { ...initialIllustration };
    },

    // Reset both illustrations
    resetAllIllustrations: () => initialState,
  },
});

export const { 
  setTransitionStatus,
  setIllustration1Loading, 
  setIllustration1Data, 
  setIllustration1Error,
  resetIllustration1,
  setIllustration2Loading, 
  setIllustration2Data, 
  setIllustration2Error,
  resetIllustration2,
  resetAllIllustrations
} = transitionSlice.actions;

export const transitionReducer = transitionSlice.reducer; 