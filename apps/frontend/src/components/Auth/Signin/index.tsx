"use client";
import React, { useState, useCallback, useEffect } from "react";
import SigninWithPassword from "../SigninWithPassword";
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { setAdminLoading, setAdminAuthState, setAdminId } from '@/store/slices/adminSlice';
import apiClient from "../../../../utils/apiClient";
import { safeClientLogError } from "@/utils/safeClientLogger";

const ADMIN_HOME_PATH = "/admin/airdrop-prizes";

interface AdminData {
  admin_id: number;
  email: string;
}

interface AdminResponse {
  success: boolean;
  admin: AdminData;
}

export default function Signin() {
  const [data, setData] = useState({
    email: '',
    password: '',
  });
  const router = useRouter();
  const { loading } = useAppSelector((state) => state.admin);
  const dispatch = useAppDispatch();

  const fetchAdminData = useCallback(async () => {
    try {
      const response = await apiClient.get<AdminResponse>('/admin/verify');
      if (response.status === 200 && response.data.success) {
        const adminData = response.data.admin;
        dispatch(setAdminId(adminData.admin_id));
        dispatch(setAdminAuthState(true));
        router.push(ADMIN_HOME_PATH);
      } else {
        dispatch(setAdminAuthState(false));
      }
    } catch (error) {
      safeClientLogError('admin_verify', error);
      dispatch(setAdminAuthState(false));
    }
  }, [dispatch, router]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    dispatch(setAdminLoading(true));
    
    try {
      const res = await apiClient.post("/admin/signin", data);
      if (res.status === 200) {
        const { success } = res.data;
        if (success) {
          await fetchAdminData();
        } else {
          console.error("Login failed: Invalid response format");
        }
      } else {
        console.error("Login failed: Invalid response format");
      }
    } catch (error: any) {
      safeClientLogError('admin_signin', error);
    } finally {
      dispatch(setAdminLoading(false));
    }
  };

  const handleChange = async (e: any) => {
    e.preventDefault();
    setData({ ...data, [e.target.name]: e.target.value });
  };


  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center px-4">
      {/* <GoogleSigninButton text="Sign in" />

        <div className="my-6 flex items-center justify-center">
          <span className="block h-px w-full bg-stroke dark:bg-dark-3"></span>
          <div className="block w-full min-w-fit bg-white px-3 text-center font-medium dark:bg-gray-dark">
            Or sign in with email
          </div>
          <span className="block h-px w-full bg-stroke dark:bg-dark-3"></span>
        </div> */}

      <div className="w-full max-w-md">
        <SigninWithPassword handleSubmit={handleSubmit} handleChange={handleChange} loading={loading} />
      </div>
    </div>
  );
}
