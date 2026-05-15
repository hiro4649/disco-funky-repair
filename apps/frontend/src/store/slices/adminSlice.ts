import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface Admin {
    loading: boolean,
    createLoading: boolean,
    adminAuthState: boolean,
    adminToken: string | null,
    adminId: number | null
}

const initialState: Admin = {
    loading: false,
    createLoading: false,
    adminAuthState: false,
    adminToken: null,
    adminId: null
}

export const adminSlice = createSlice({
    name:'admin',
    initialState,
    reducers: {
        setAdminLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setAdminAuthState: (state, action: PayloadAction<boolean>) => {
            state.adminAuthState = action.payload;
        },
        setCreateLoading: (state, action: PayloadAction<boolean>) => {
            state.createLoading = action.payload;
        },
        setAdminToken: (state, action: PayloadAction<string | null>) => {
            state.adminToken = action.payload;
            state.adminAuthState = !!action.payload;
        },
        clearAdminAuth: (state) => {
            state.adminToken = null;
            state.adminAuthState = false;
            state.adminId = null;
        },
        setAdminId: (state, action: PayloadAction<number | null>) => {
            state.adminId = action.payload;
        }
    },
})

export const { 
    setAdminLoading, 
    setCreateLoading, 
    setAdminAuthState, 
    setAdminToken,
    clearAdminAuth,
    setAdminId
} = adminSlice.actions;

export const adminReducer = adminSlice.reducer;