"use client";
import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useLayoutEffect,
} from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { useAppDispatch, useAppSelector } from "@/store/store";
import "@/css/loading.css";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { setIsOpenSidebar } from "@/store/slices/homeSlice";
import { Toaster } from "react-hot-toast";
import { useTranslations } from 'next-intl';
import LoadingAnimation from "@/components/LoadingAnimation/LoadingAnimation";
import StarAnimation from "@/components/StarAnimation/StarAnimation";
import StarField from "@/components/StarField/StarField";

if (typeof window !== "undefined") {
  const Hammer = require("hammerjs");
}

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isVisibleHeader, setIsVisibleHeader] = useState<boolean>(true);
  const [lastScrollY, setLastScrollY] = useState<number>(300);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { drawLoading, openScreen, drawState } = useAppSelector((state) => state.home);
  let sidebarToggleRef = useRef<HTMLButtonElement | null>(null);
  let mainContentRef = useRef<HTMLDivElement | null>(null);
  const t_drawing = useTranslations('Drawing');

  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    if (currentScrollY > 250) {
      if (currentScrollY > lastScrollY) {
        setIsVisibleHeader(false); // Scrolling down
      } else if (currentScrollY < lastScrollY) {
        setIsVisibleHeader(true); // Scrolling up
      }
    }
    setLastScrollY(currentScrollY); // Update previous scroll position
  }, [lastScrollY]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  // Disable scroll when drawLoading is true
  useEffect(() => {
    if (drawLoading) {
      document.body.style.overflowX = 'hidden';
      document.body.style.overflowY = 'hidden';
    } else {
      document.body.style.overflowX = 'hidden';
      document.body.style.overflowY = 'auto';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflowX = 'hidden';
      document.body.style.overflowY = 'auto';
    };
  }, [drawLoading]);

  const setSideBarToggleRef = (
    current: React.RefObject<HTMLButtonElement | null>,
  ) => {
    if (sidebarToggleRef && current.current) {
      sidebarToggleRef.current = current.current;
    }
  };

  useEffect(() => {
    if (!mainContentRef.current) return;

    // Ensure Hammer.js only runs on the client side
    if (typeof window !== "undefined") {
      const hammer = new Hammer(mainContentRef.current);

      // Add swipe gesture handlers
      hammer.on("swiperight", () => dispatch(setIsOpenSidebar(true)));
      hammer.on("swipeleft", () => dispatch(setIsOpenSidebar(false)));

      // Cleanup Hammer.js instance on unmount
      return () => {
        hammer.destroy();
      };
    }
  }, [dispatch, mainContentRef]);

  return (
    <div className={`${openScreen == true ? "loaded" : ""}`}>
      <StarAnimation />
      <Toaster position="bottom-right" />
      <>
        {/* <!-- ===== Page Wrapper Star ===== --> */}
        <div ref={mainContentRef} className={`${drawState ? "overflow-hidden" : "flex h-screen"}`}>
          {/* <!-- ===== Sidebar Star ===== --> */}
          <Sidebar
            sidebarToggleRef={sidebarToggleRef}
            mainContentRef={mainContentRef}
          />
          {/* <!-- ===== Sidebar End ===== --> */}

          {/* <!-- ===== Content Area Star ===== --> */}
          <div className="relative w-full">
            {/* <!-- ===== Header Star ===== --> */}
            <Header
              isVisibleHeader={isVisibleHeader}
              setSideBarToggleRef={setSideBarToggleRef}
            />
            {/* <!-- ===== Header End ===== --> */}

            {/* <!-- ===== Main Content Star ===== --> */}

            <main
              ref={mainContentRef}
              className={`dark:bg-black ${drawLoading ? "overflow-hidden" : ""}`}
            >
              <div className="mt-[88px]">{children}</div>
            </main>
            {/* <!-- ===== Main Content End ===== --> */}
            <footer className="flex items-center justify-center py-9">
              <div>
                <div className="mb-[10px] flex cursor-pointer items-center justify-center">
                  <Image
                    width={160}
                    height={27.83}
                    alt="logo"
                    src="images/cover/dicco-rave-logo.svg"
                    onClick={() => {
                      router.push("/");
                    }}
                  />
                </div>
                <p className="text-center text-xs text-white">
                  © 2025 DISCO RAVE All rights reserved.
                </p>
              </div>
            </footer>
          </div>
          {/* <!-- ===== Content Area End ===== --> */}
        </div>
        {/* <!-- ===== Page Wrapper End ===== --> */}
      </>
      {drawLoading && <LoadingAnimation />}
      {/* Gacha modals are now handled by separate pages */}
    </div>
  );
}
