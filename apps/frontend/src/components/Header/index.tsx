import React, { useRef, useMemo } from "react";
import { setIsOpenSidebar } from "@/store/slices/homeSlice";
import { setLotteryTicket } from "@/store/slices/userSlice";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { setAuthstate, setUserId, setConnectBonus } from "@/store/slices/userSlice";
import apiClient from "../../../utils/apiClient";
import { useEffect, useCallback, useState } from "react";
import moment from "moment";
// Removed legacy wallet-kit in favor of Reown AppKit
import { useLocale, useTranslations } from 'next-intl';
import Link from "next/link";
import Image from "next/image";
import DropdownUser from "./DropdownUser";
import HeartCount from "./HeartCount";
import LanguageSelector from "./LanguageSelector";
import WalletConnectButton from "../Buttons/WalletConnectButton";
import PrizeMarquee from "./PrizeMarquee";
import { useAppKitAccount } from "@reown/appkit/react";
import { useDisconnect } from "@reown/appkit/react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

interface UserData {
  user_id: number;
  address: string;
}

interface UserResponse {
  success: boolean;
  user: UserData;
}

const Header = (props: {
  isVisibleHeader: boolean | undefined;
  setSideBarToggleRef: (
    current: React.RefObject<HTMLButtonElement | null>,
  ) => void;
}) => {
  const { address, isConnected } = useAppKitAccount();
  const { disconnect } = useDisconnect();
  const { login } = useAuth();
  const dispatch = useAppDispatch();
  const { authState, ticket, connectBonus, claimTickets } = useAppSelector((state) => state.user);
  const { isOpenSidebar } = useAppSelector((state) => state.home);
  const sidebarToggleRef = useRef<HTMLButtonElement | null>(null);
  const t = useTranslations('Menu');
  // const [currentTimeWindow, setCurrentTimeWindow] = useState<string>("");
  const [userData, setUserData] = useState<UserData | null>(null);
  const [amountOfInfo, setamountOfInfo] = useState<number>(0);

  // Check time window (morning: 00:00-12:00 UTC, afternoon: 12:01-23:59 UTC)
  // const checkTimeWindow = useCallback(() => {
  //   const now = moment.utc();
  //   const utcHours = now.hours();
  //   const utcMinutes = now.minutes();

  //   if (utcHours < 12 || (utcHours === 12 && utcMinutes === 0)) {
  //     return "morning";
  //   } else {
  //     return "afternoon";
  //   }
  // }, []);

  // // Reset connectBonus at the start of each time window
  // useEffect(() => {
  //   const checkAndResetBonus = () => {
  //     const newTimeWindow = checkTimeWindow();

  //     if (newTimeWindow !== currentTimeWindow) {
  //       setCurrentTimeWindow(newTimeWindow);
  //       dispatch(setConnectBonus(false));
  //     }
  //   };

  //   checkAndResetBonus();
  //   const intervalId = setInterval(checkAndResetBonus, 60000);
  //   return () => clearInterval(intervalId);
  // }, [dispatch, checkTimeWindow, currentTimeWindow]);

  // Fetch user data from /user/verify endpoint
  const fetchUserData = useCallback(async () => {
    try {
      const response = await apiClient.get<UserResponse>('/user/verify');
      if (response.status === 200 && response.data.success) {
        const userData = response.data.user;
        setUserData(userData);
        console.log
        dispatch(setUserId(userData.user_id));
        dispatch(setAuthstate(true));
      } else {
        dispatch(setAuthstate(false));
        setUserData(null);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      dispatch(setAuthstate(false));
      setUserData(null);
    }
  }, [dispatch]);

  const onSignUp = useCallback(
    async (wallet_address?: string) => {
      try {
        if (!wallet_address) {
          return;
        }

        // Get referral code from cookie
        const getReferralCode = () => {
          if (typeof document === 'undefined') return null;
          const cookies = document.cookie.split(';');
          const refCookie = cookies.find(cookie => cookie.trim().startsWith('ref='));
          return refCookie ? refCookie.split('=')[1] : null;
        };

        const referralCode = getReferralCode();
        console.log('Signup with referral code:', referralCode);

        const success = await login(wallet_address, referralCode);

        if (success) {
          if (referralCode) {
            document.cookie = 'ref=; path=/; max-age=0';
            console.log('Referral cookie cleared after successful signup');
          }

          // After successful signup, fetch user data
          await fetchUserData();
        }
      } catch (err: any) {
        console.error('Signup error:', err);

        if (err.response) {
          console.error('Error response:', err.response.status, err.response.data);
        }

        if (err.response && (err.response.status === 500 || err.response.status === 404)) {
          if (address) {
            disconnect();
          }
        }
      }
    },
    [address, disconnect, fetchUserData, login],
  );

  // Handle user signup
  useEffect(() => {
    if (isConnected && address && !userData?.user_id) {
      onSignUp(address);
    }
  }, [isConnected, address, userData, onSignUp]);

  // Update notification count whenever claimTickets or connectBonus changes
  useEffect(() => {
    const countNotification = connectBonus ? 1 + claimTickets : claimTickets;
    setamountOfInfo(countNotification);
  }, [connectBonus, claimTickets]);

  const toggleSidebar = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!isOpenSidebar) {
      dispatch(setIsOpenSidebar(true));
      props.setSideBarToggleRef(sidebarToggleRef);
    } else {
      dispatch(setIsOpenSidebar(false));
      props.setSideBarToggleRef(sidebarToggleRef);
    }
  };

  const getLotteryTickets = useCallback(async () => {
    if (!userData?.user_id) return;

    try {
      const response = await apiClient.get(`/lottery/ticket/count/${userData.user_id}`);
      if (response.status === 200) {
        const data = response.data;
        dispatch(setLotteryTicket(data.ticket));
      }
    } catch (e) {
      console.log("Error fetching lottery tickets:", e);
    }
  }, [userData, dispatch]);

  const dailyLoginStatus = useCallback(async () => {
    if (!userData?.user_id || !isConnected) return;

    try {
      const response = await apiClient.get(`/user/daily/point/${userData.user_id}`);
      if (response.status === 200) {
        const data = response.data;
        dispatch(setConnectBonus(data.dailyLogined));
      }
    } catch (e) {
      console.log("Error fetching daily login status:", e);
    }
  }, [userData, dispatch]);

  useEffect(() => {
    if (!userData) return;
    getLotteryTickets();
    dailyLoginStatus();
  }, [userData, getLotteryTickets, dailyLoginStatus]);

  return (
    <header
      className={`ease-out-linear fixed top-0 z-999 flex flex-col w-full duration-300 dark:border-stroke-dark dark:bg-mainbg-600 ${props.isVisibleHeader == true ? "translate-y-0" : "-translate-y-full"}`}
    >
      <div className="flex flex-grow items-center justify-between px-3 py-2 md:px-5 2xl:px-10">
        <div className="flex items-center gap-x-3 sm:gap-4 relative">
          {/* <!-- Hamburger Toggle BTN --> */}
          <button
            type="button"
            aria-controls="sidebar"
            ref={sidebarToggleRef}
            onClick={(e) => {
              toggleSidebar(e);
            }}
            className={`z-99999 block rounded-sm bg-white p-1 dark:border-dark-3 dark:bg-inherit`}
          >
            {(amountOfInfo > 0) && (
              <span className="absolute top-0 left-4 z-1 bg-red-500 text-white rounded-full text-xs min-w-5 h-5 px-1.5 flex items-center justify-center font-semibold">
                {amountOfInfo >= 1000000000
                  ? `${(amountOfInfo / 1000000000).toFixed(1)}B`
                  : amountOfInfo >= 1000000
                  ? `${(amountOfInfo / 1000000).toFixed(1)}M`
                  : amountOfInfo >= 1000
                  ? `${(amountOfInfo / 1000).toFixed(1)}K`
                  : amountOfInfo}
              </span>
            )}
            <span className="relative block h-5.5 w-5.5 cursor-pointer">
              <span className="du-block absolute right-0 h-full w-full">
                <span
                  className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-dark delay-[0] duration-200 ease-in-out dark:bg-white ${!isOpenSidebar && "!w-full delay-300"
                    }`}
                ></span>
                <span
                  className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-dark delay-150 duration-200 ease-in-out dark:bg-white ${!isOpenSidebar && "delay-400 !w-full"
                    }`}
                ></span>
                <span
                  className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-dark delay-200 duration-200 ease-in-out dark:bg-white ${!isOpenSidebar && "!w-full delay-500"
                    }`}
                ></span>
              </span>
              <span className="absolute right-0 h-full w-full rotate-45">
                <span
                  className={`absolute left-2.5 top-0 block h-full w-0.5 rounded-sm bg-dark delay-300 duration-200 ease-in-out dark:bg-white ${!isOpenSidebar && "!h-0 !delay-[0]"
                    }`}
                ></span>
                <span
                  className={`delay-400 absolute left-0 top-2.5 block h-0.5 w-full rounded-sm bg-dark duration-200 ease-in-out dark:bg-white ${!isOpenSidebar && "!h-0 !delay-200"
                    }`}
                ></span>
              </span>
            </span>
          </button>
          {/* <!-- Hamburger Toggle BTN --> */}

          <Link prefetch={false} className="block flex-shrink-0" href="/">
            <Image
              loading={"eager"}
              width={88}
              height={20}
              src={"/images/logo/header_logo.png"}
              alt="Logo"
            />
          </Link>
        </div>

        <div className="flex items-center justify-end gap-x-4 xsm:gap-4 lg:w-full xl:w-auto xl:justify-normal">
          <ul className="flex items-center 2xsm:gap-4">
            {/* <!-- Dark Mode Toggle --> */}
            {/* <DarkModeSwitcher /> */}

            {/* Language Selector */}
            <LanguageSelector />

            {/* <!-- Notification Menu Area --> */}
          </ul>
          {isConnected ? (
            <>
              <HeartCount ticket={ticket} />
              {/* <!-- User Area --> */}
              <DropdownUser />
              {/* <!-- User Area --> */}{" "}
            </>
          ) : (
            // <appkit-button />
            <WalletConnectButton name={t('Connect Wallet')} />
          )}
        </div>
      </div>
      <PrizeMarquee />
    </header>
  );
};

export default Header;
