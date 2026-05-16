import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import ClickOutside from "@/components/ClickOutside";
// Removed legacy wallet-kit in favor of Reown AppKit
import { useAppDispatch, useAppSelector } from "@/store/store";
import { useRouter } from "next/navigation";
import {resetUser, setHasPendingTicketCode } from "@/store/slices/userSlice";
import WalletIcon from "../common/icons/wallet";
import LevelIcon from "../common/icons/level";
import ItemIcon from "../common/icons/item";
import NFTIcon from "../common/icons/nft";
import AttackIcon from "../common/icons/attack";
import DefenseIcon from "../common/icons/defense";
import axios from "axios";
import UserIcon from '../common/icons/user';
import { useTranslations } from 'next-intl';
import apiClient from "../../../utils/apiClient";
import { useAppKitAccount, useDisconnect } from "@reown/appkit/react";
import { usePathname } from "next/navigation";

const DropdownUser = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  // const { connected, disconnect, account } = useWallet();
  const { disconnect } = useDisconnect();
  const { isConnected, address } = useAppKitAccount();

  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('MyWallet');
  // const hasPendingTicketCode = useAppSelector((state) => state.user.hasPendingTicketCode);

  const onDisconnect = () => {
    if (isConnected) {
      apiClient.get(`/user/logout`).then((res) => {
        const { success } = res.data;
        if (success === true) {
          dispatch(resetUser());
          disconnect();
          router.push("/");
        }
      }).catch(err => {
        console.log(err);
        dispatch(resetUser());
        disconnect();
        router.push("/");
      })
    }
  }

  return (
    <ClickOutside onClick={() => setDropdownOpen(false)} className="relative">
      <Link
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-1 gradient-bg-main rounded-full px-2 py-1"
        href="#"
      >
        <span>
          <UserIcon />
        </span>

        <span className="flex items-center gap-2 font-medium text-dark dark:text-dark-6">
          <svg
            className={`fill-black duration-200 ease-in ${dropdownOpen && "rotate-180"}`}
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M3.6921 7.09327C3.91674 6.83119 4.3113 6.80084 4.57338 7.02548L9.99997 11.6768L15.4266 7.02548C15.6886 6.80084 16.0832 6.83119 16.3078 7.09327C16.5325 7.35535 16.5021 7.74991 16.24 7.97455L10.4067 12.9745C10.1727 13.1752 9.82728 13.1752 9.59322 12.9745L3.75989 7.97455C3.49781 7.74991 3.46746 7.35535 3.6921 7.09327Z"
              fill=""
            />
          </svg>
        </span>
      </Link>

      {/* <!-- Dropdown Star --> */}
      {dropdownOpen && (
        <div
          className={`absolute right-0 mt-3 flex w-[240px] flex-col p-[1.2rem] rounded-lg border-[0.5px] border-stroke-[0.5px] bg-white shadow-default dark:border-white dark:bg-mainbg z-1`}
        >
          {/* <div className="flex items-center gap-2 text-main text-[10px]">
            <p>My Menu</p>
          </div> */}
          <ul className="flex flex-col gap-x-2 pb-[1.4rem] pt-0 border-stroke ">
            <li>
              <Link
                href="/my-wallet"
                className={`flex w-full items-center rounded-[7px] text-[17px] font-light duration-300 ease-in-out ${pathname === "/my-wallet" ? "text-main" : "text-white"}`}
              >
                {/* <Image width={20} height={19} src={'/images/icon/wallet-coin.svg'} alt="coin" /> */}
                {t('My Wallet')}
              </Link>
            </li>
            <li className="text-[#666] mt-[0.9rem]">
              <Link
                href="/ticket-code"
                className={`flex w-full items-center rounded-[7px] text-[17px] font-light duration-300 ease-in-out relative ${pathname === "/ticket-code" ? "text-main" : "text-white"}`}
                // onClick={(e) => {
                //   if (!hasPendingTicketCode) {
                //     e.preventDefault();
                //   }
                // }}
              >
                Ticket Code
                {/* {hasPendingTicketCode && (
                  <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                    1
                  </span>
                )} */}
              </Link>
            </li>
            <li className="mt-[0.9rem]">
              <Link
                href="/referral-link"
                className={`flex w-full items-center rounded-[7px] text-[17px] font-light duration-300 ease-in-out ${pathname === "/referral-link" ? "text-main" : "text-white"} gap-x-2 justify-between`}
              >
                {/* <Image width={20} height={19} src={'/images/icon/wallet-coin.svg'} alt="coin" /> */}
                <span>Referral Link</span>
                {/* <span className="bg-gray-800 text-gray-300 border border-gray-500 text-[10px] px-1 py-1 rounded-md font-medium leading-none">
                  Comming Soon
                </span> */}
              </Link>
            </li>
            {/* <li>
              <Link
                href="/user-level"
                className="flex w-full items-center gap-2.5 rounded-[7px] p-2.5 text-sm font-medium text-dark-4 duration-300 ease-in-out hover:bg-gray-2 hover:text-dark dark:text-dark-6 dark:hover:bg-dark-3 dark:hover:text-white lg:text-base"
              >
                <LevelIcon />
                User Level
              </Link>
            </li>
            <li>
              <Link
                href="/owned-nfts"
                className="flex w-full items-center gap-2.5 rounded-[7px] p-2.5 text-sm font-medium text-dark-4 duration-300 ease-in-out hover:bg-gray-2 hover:text-dark dark:text-dark-6 dark:hover:bg-dark-3 dark:hover:text-white lg:text-base"
              >
                <NFTIcon />
                Owned NFTs
              </Link>
            </li>
            <li>
              <Link
                href="/owned-items"
                className="flex w-full items-center gap-2.5 rounded-[7px] p-2.5 text-sm font-medium text-dark-4 duration-300 ease-in-out hover:bg-gray-2 hover:text-dark dark:text-dark-6 dark:hover:bg-dark-3 dark:hover:text-white lg:text-base"
              >
                <ItemIcon />
                Owned items
              </Link>
            </li>
            <li>
              <Link
                href="/attack-battle-history"
                className="flex w-full items-center gap-2.5 rounded-[7px] p-2.5 text-sm font-medium text-dark-4 duration-300 ease-in-out hover:bg-gray-2 hover:text-dark dark:text-dark-6 dark:hover:bg-dark-3 dark:hover:text-white lg:text-base"
              >
                <AttackIcon />
                Attack battle history
              </Link>
            </li>
            <li>
              <Link
                href="/defense-battle-history"
                className="flex w-full items-center gap-2.5 rounded-[7px] p-2.5 text-sm font-medium text-dark-4 duration-300 ease-in-out hover:bg-gray-2 hover:text-dark dark:text-dark-6 dark:hover:bg-dark-3 dark:hover:text-white lg:text-base"
              >
                <DefenseIcon />
                Defense battle history
              </Link>
            </li> */}
          </ul>
          <div className="border-t-[#666666] border-t-[0.5px] -mx-1"></div>
          <div className="">
            <button onClick={() => onDisconnect()} className="flex w-full items-center gap-x-[6px] rounded-[7px] pt-[0.9rem] text-[18px] font-light duration-300 ease-in-out text-white lg:text-base">
              {t('Disconnect')}
            </button>
          </div>
        </div>
      )}
      {/* <!-- Dropdown End --> */}
    </ClickOutside>
  );
};

export default DropdownUser;
