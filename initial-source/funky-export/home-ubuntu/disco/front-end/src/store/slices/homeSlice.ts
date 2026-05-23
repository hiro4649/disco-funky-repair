import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface Home {
  loading: boolean;
  drawLoading: boolean;
  openScreen: boolean;
  drawState: boolean;
  failedDraw: boolean;
  isOpenSidebar: boolean;
  showIllustration: boolean;
  showPrizeImage: boolean;
  drawSuccess: boolean;
  showBullAnimation: boolean;
}

const initialState: Home = {
  loading: false,
  drawLoading: false,//dashboard loading
  openScreen: false,//open door animation
  drawState: false,//draw state
  failedDraw: false,//failed draw
  isOpenSidebar: false,//handle touch sidebar
  showIllustration: false,//show illustration
  showPrizeImage: false,//show prize image
  drawSuccess: false,//draw success
  showBullAnimation: false,
};

export const homeSlice = createSlice({
    name: 'home',
    initialState,
    reducers: {
        setDrawLoading: (state, action: PayloadAction<boolean>) => {
            state.drawLoading = action.payload;
        },
        setOpenScreen: (state, action: PayloadAction<boolean>) => {
            state.openScreen = action.payload;
        },
        setDrawState: (state, action: PayloadAction<boolean>) => {
            state.drawState = action.payload;
        },
        setIsOpenSidebar: (state, action: PayloadAction<boolean>) => {
            state.isOpenSidebar = action.payload;
        },
        setFailedDraw: (state, action: PayloadAction<boolean>) => {
            state.failedDraw = action.payload;
        },
        setShowIllustration: (state, action: PayloadAction<boolean>) => {
            state.showIllustration = action.payload;
        },
        setShowPrizeImage: (state, action: PayloadAction<boolean>) => {
            state.showPrizeImage = action.payload;
        },
        setDrawSuccess: (state, action: PayloadAction<boolean>) => {
            state.drawSuccess = action.payload;
        },
        setShowBullAnimation: (state, action: PayloadAction<boolean>) => {
            state.showBullAnimation = action.payload;
        }
    },
})
export const { setDrawLoading, setOpenScreen, setDrawState, setIsOpenSidebar, setFailedDraw, setShowIllustration, setShowPrizeImage, setDrawSuccess, setShowBullAnimation } = homeSlice.actions;
export const homeReducer = homeSlice.reducer;
