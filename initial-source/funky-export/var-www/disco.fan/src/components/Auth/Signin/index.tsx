"use client";
import React, { useState, useCallback, useEffect } from "react";
import SigninWithPassword from "../SigninWithPassword";
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { setAdminLoading, setAdminToken, setAdminAuthState, setAdminId } from '@/store/slices/adminSlice';
import apiClient from "../../../../utils/apiClient";

interface AdminData {
  adminId: number;
  address: string;
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
  const [adminData, setAdminData] = useState<AdminData | null>(null);

  const fetchAdminData = useCallback(async () => {
    try {
      const response = await apiClient.get<AdminResponse>('/admin/verify');
      if (response.status === 200 && response.data.success) {
        const adminData = response.data.admin;
        setAdminData(adminData);
        dispatch(setAdminId(adminData.adminId));
        dispatch(setAdminAuthState(true));
        router.push('/admin/user-manage');
      } else {
        dispatch(setAdminAuthState(false));
        setAdminData(null);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      dispatch(setAdminAuthState(false));
      setAdminData(null);
    }
  }, [dispatch]);

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
      dispatch(setAdminLoading(false));
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Login failed";
      console.error("Login failed:", errorMessage);
      dispatch(setAdminLoading(false));
    }
  };

  const handleChange = async (e: any) => {
    e.preventDefault();
    setData({ ...data, [e.target.name]: e.target.value });
  };


  return (
    <div className="max-w-[480px] px-5 mx-auto mt-20">
      {/* <GoogleSigninButton text="Sign in" />

        <div className="my-6 flex items-center justify-center">
          <span className="block h-px w-full bg-stroke dark:bg-dark-3"></span>
          <div className="block w-full min-w-fit bg-white px-3 text-center font-medium dark:bg-gray-dark">
            Or sign in with email
          </div>
          <span className="block h-px w-full bg-stroke dark:bg-dark-3"></span>
        </div> */}

      <div>
        <SigninWithPassword handleSubmit={handleSubmit} handleChange={handleChange} loading={loading} />
      </div>
    </div>
  );
}
