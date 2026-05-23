"use client";
import React, {
  useState,
  useEffect,
  useLayoutEffect,
} from "react";
import { HeroUIProvider } from "@heroui/react";
import { useRouter, usePathname } from "next/navigation";
import axios from "axios";
import { useAppSelector, useAppDispatch } from "@/store/store";
import { clearAdminAuth } from "@/store/slices/adminSlice";
import Header from "../admin/Header";
import { ToastProvider } from "@heroui/toast";
import apiClient from "../../../utils/apiClient";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathName = usePathname();
  const { adminAuthState, adminToken } = useAppSelector((state) => state.admin);
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(true);

  // Track whether we're on the client
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (adminToken) {
      // Set auth header for future requests
      axios.defaults.headers.common["Authorization"] = `Bearer ${adminToken}`;
    }
    setIsLoading(false);
  }, [adminToken]);

  useLayoutEffect(() => {
    if (!isLoading && isClient) {
      if (!adminAuthState) {
        router.push("/admin");
      } else if (adminAuthState && pathName === "/admin") {
        router.push("/admin/user-manage");
      }
    }
  }, [adminAuthState, isClient, router, pathName, isLoading]);

  const onLogout = () => {
    apiClient
      .get(`/admin/logout`)
      .then((res) => {
        if (res.status === 200) {
          dispatch(clearAdminAuth());
          router.push("/admin");
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  if (isLoading || !isClient) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="container mx-auto">
        {adminAuthState ? <Header onLogout={onLogout} /> : <></>}
        <HeroUIProvider>
          <ToastProvider />
          <main>{children}</main>
        </HeroUIProvider>
      </div>
    </>
  );
}

