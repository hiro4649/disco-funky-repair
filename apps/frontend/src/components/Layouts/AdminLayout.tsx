"use client";
import React, {
  useState,
  useEffect,
  useLayoutEffect,
} from "react";
import { HeroUIProvider, ToastProvider } from "@heroui/react";
import { useRouter, usePathname } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/store/store";
import { clearAdminAuth } from "@/store/slices/adminSlice";
import Header from "../admin/Header";
import Sidebar from "../admin/Sidebar";
import { Toaster } from "react-hot-toast";
import apiClient from "../../../utils/apiClient";
import { NextIntlClientProvider } from 'next-intl';
import enMessages from '../../../locales/en.json';
import jaMessages from '../../../locales/ja.json';
import { safeClientLogError } from "@/utils/safeClientLogger";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathName = usePathname();
  const { adminAuthState } = useAppSelector((state) => state.admin);
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpenOnMobile, setIsSidebarOpenOnMobile] = useState(false);

  // Track whether we're on the client
  const [isClient, setIsClient] = useState(false);

  // Admin locale state - default to English, stored in localStorage
  const [adminLocale, setAdminLocale] = useState<'en' | 'ja'>('en');
  const messages = adminLocale === 'ja' ? jaMessages : enMessages;

  useEffect(() => {
    setIsClient(true);
    delete apiClient.defaults.headers.common["Authorization"];
    // Load saved admin locale from localStorage
    const savedLocale = localStorage.getItem('adminLocale') as 'en' | 'ja' | null;
    if (savedLocale) {
      setAdminLocale(savedLocale);
    }
    setIsLoading(false);
  }, []);

  // Function to change admin locale
  const changeAdminLocale = (newLocale: 'en' | 'ja') => {
    setAdminLocale(newLocale);
    localStorage.setItem('adminLocale', newLocale);
  };

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
          router.push("/admin");
        }
      })
      .catch((err) => {
        safeClientLogError('admin_logout', err);
      })
      .finally(() => {
        delete apiClient.defaults.headers.common["Authorization"];
        dispatch(clearAdminAuth());
      });
  };

  if (isLoading || !isClient) {
    return <div className="min-h-screen grid place-items-center text-gray-600">Loading...</div>;
  }

  return (
    <NextIntlClientProvider locale={adminLocale} messages={messages}>
      <div className="min-h-screen bg-gray-50">
        <Toaster position="bottom-right" />
        {adminAuthState ? (
          <>
            <Header 
              onLogout={onLogout} 
              onToggleSidebar={() => setIsSidebarOpenOnMobile((v) => !v)} 
              currentLocale={adminLocale}
              onLocaleChange={changeAdminLocale}
            />
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="relative">
                <Sidebar
                  isOpenOnMobile={isSidebarOpenOnMobile}
                  onCloseMobile={() => setIsSidebarOpenOnMobile(false)}
                />
                <HeroUIProvider>
                  <ToastProvider />
                  <div className="lg:pl-72">
                    <main className="pt-6 pb-12 max-w-screen-2xl mx-auto">
                      {children}
                    </main>
                  </div>
                </HeroUIProvider>
              </div>
            </div>
          </>
        ) : (
          <HeroUIProvider>
            <ToastProvider />
            <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
              {children}
            </main>
          </HeroUIProvider>
        )}
      </div>
    </NextIntlClientProvider>
  );
}

