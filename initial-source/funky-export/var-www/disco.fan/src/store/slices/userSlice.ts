import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface User {
    authState: boolean,
    createLoading: boolean,
    user_id: number | null,
    ticket: number,
    connectBonus: boolean,
    wallet_address: string | null
}

const initialState: User = {
    authState: false,
    user_id: null,
    createLoading: false,
    ticket: 0,
    connectBonus: false,
    wallet_address: null
}

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setAuthstate: (state, action: PayloadAction<boolean>) => {
            state.authState = action.payload;
        },
        setUserId: (state, action: PayloadAction<number | null>) => {
            state.user_id = action.payload;
        },
        setWalletAddress: (state, action: PayloadAction<string | null>) => {
            state.wallet_address = action.payload;
        },
        setLotteryTicket: (state, action:PayloadAction<number>) => {
            state.ticket = action.payload;
        },
        setConnectBonus: (state, action:PayloadAction<boolean>) => {
            state.connectBonus = action.payload;
        },
        resetUser: () => initialState,
    },
})

export const { setAuthstate, setUserId, setWalletAddress, setLotteryTicket, setConnectBonus, resetUser } = userSlice.actions;
export const userReducer = userSlice.reducer;