import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface Prize {
    prize_id: number | null,
    prize_name: string | null,
    prize_symbol: string | null,
    prize_image: string | null,
    prize_amount: number | null,
    prize_exp_amount: number | null,
    earnedPts: number | null,
}

const initialState: Prize = {
    prize_id: null,
    prize_name: null,
    prize_symbol: null,
    prize_image: null,
    prize_amount: null,
    prize_exp_amount: null,
    earnedPts: null
}

export const prizeSlice = createSlice({
    name: 'prize',
    initialState,
    reducers: {
        setPrizeId: (state, action: PayloadAction<number | null>) => {
            state.prize_id = action.payload;
        },
        setPrizeName: (state, action: PayloadAction<string | null>) => {
            state.prize_name = action.payload;
        },
        setPrizeSymbol: (state, action: PayloadAction<string | null>) => {
            state.prize_symbol = action.payload;
        },
        setPrizeImage: (state, action: PayloadAction<string | null>) => {
            state.prize_image = action.payload;
        },
        setPrizeAmount: (state, action: PayloadAction<number | null>) => {
            state.prize_amount = action.payload;
        },
        setPrizeExpAmount: (state, action: PayloadAction<number | null>) => {
            state.prize_exp_amount = action.payload;
        },
        setEarnedPts: (state, action: PayloadAction<number | null>) => {
            state.earnedPts = action.payload;
        },
        resetPrize: () => initialState,
    },
})

export const { setPrizeId, setPrizeName, setPrizeSymbol, setPrizeImage, setPrizeAmount, setPrizeExpAmount,setEarnedPts, resetPrize } = prizeSlice.actions;
export const prizeReducer = prizeSlice.reducer;