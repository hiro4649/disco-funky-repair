import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, TypedUseSelectorHook, useSelector } from "react-redux";
import { userReducer } from "@/store/slices/userSlice";
import { homeReducer } from "./slices/homeSlice";
import { adminReducer } from "@/store/slices/adminSlice";
import { prizeReducer } from "@/store/slices/prizeSlice";
import { illustrationReducer } from "@/store/slices/illustrationSlice";
import { airdropItemReducer } from "@/store/slices/airdropItemSlice";

export const store = configureStore({
  reducer: { 
    user: userReducer, 
    home: homeReducer, 
    admin: adminReducer, 
    prize: prizeReducer,
    illustration: illustrationReducer,
    airdropItem: airdropItemReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
  devTools: true,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;