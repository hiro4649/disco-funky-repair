import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface User {
    authState: boolean,
    createLoading: boolean,
    user_id: number | null,
    ticket: number,
    claimTickets: number,
    fan_points: number,
    sixHourTokenBalance: number,
    tallyTokenBalance: number,
    connectBonus: boolean,
    wallet_address: string | null,
    hasPendingTicketCode: boolean
}

const initialState: User = {
    authState: false,
    user_id: null,
    createLoading: false,
    ticket: 0,
    claimTickets: 0,
    fan_points: 0,
    sixHourTokenBalance: 0,
    tallyTokenBalance: 0,
    connectBonus: false,
    wallet_address: null,
    hasPendingTicketCode: false
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
        setHasPendingTicketCode: (state, action: PayloadAction<boolean>) => {
            state.hasPendingTicketCode = action.payload;
        },
        setClaimTickets: (state, action: PayloadAction<number>) => {
            state.claimTickets = action.payload;
        },
        setFanPoints: (state, action: PayloadAction<number>) => {
            state.fan_points = action.payload;
        },
        setSixHourTokenBalance: (state, action: PayloadAction<number>) => {
            state.sixHourTokenBalance = action.payload;
        },
        setTallyTokenBalance: (state, action: PayloadAction<number>) => {
            state.tallyTokenBalance = action.payload;
        },
        resetUser: () => initialState,
    },
})

export const { setAuthstate, setUserId, setWalletAddress, setLotteryTicket, setConnectBonus, setHasPendingTicketCode, setClaimTickets, setFanPoints, setSixHourTokenBalance, setTallyTokenBalance, resetUser } = userSlice.actions;
export const userReducer = userSlice.reducer;