"use client";

import React, { useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAppDispatch, useAppSelector } from "@/store/store";
import { setIsOpenSidebar } from "@/store/slices/homeSlice";

import SidebarItem from "@/components/Sidebar/SidebarItem";
import ClickOutside from "@/components/ClickOutside";
import AirdropIcon from "@/components/common/icons/airdrop";
import PrizeIcon from "@/components/common/icons/prize";
import LotteryTicketIcon from "../common/icons/lottery";
import LeaderBoardIcon from "../common/icons/leader";
import GetTokenIcon from "../common/icons/getToken";
import DiscoRaveIcon from "../common/icons/discoRave";
import FAQIcon from "../common/icons/faq";
import TermsOfUseIcon from "../common/icons/term";
import CrashGameIcon from "../common/icons/crashGame";
import { X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from 'next-intl';


const Sidebar = ({ sidebarToggleRef, mainContentRef }: { sidebarToggleRef: React.RefObject<HTMLButtonElement>; mainContentRef: React.RefObject<HTMLDivElement | null> }) => {
  const { authState, ticket, connectBonus, claimTickets } = useAppSelector((state) => state.user);
  const t = useTranslations('Menu');
  let menuGroups = [
    {
      name: "",
      menuItems: [
        {
          disabled: false,
          icon: <AirdropIcon width={20} height={20} className="fill-white" />,
          label: "airdrop prizes",
          // content: <p className="text-[17px] normal">Aridrop <span className="text-main">P</span>rizes</p>,
          content: <p className="text-[17px] normal">{t('Airdrop Prizes')}</p>,
          route: "/airdrop-prizes",
        },

        {
          disabled: false,
          icon: (
            <LotteryTicketIcon width={20} heigth={20} className="fill-white" />
          ),
          label: "lottery ticket",
          // content: <p className="text-[17px] normal">Lottery <span className="text-main">T</span>icket</p>,
          content: <p className="text-[17px] normal">{t('Lottery Ticket')}</p>,
          route: "/lottery-ticket",
        },
        {
          disabled: false,
          icon: <PrizeIcon width={20} height={20} className="fill-white" />,
          label: "prize history",
          // content: <p className="text-[17px] normal">Prize <span className="text-main">H</span>istory</p>,
          content: <p className="text-[17px] normal">{t('Prize History')}</p>,
          route: "/prize-history",
        },
        {
          disabled: false,
          icon: <LeaderBoardIcon width={20} height={20} className="fill-white" />,
          label: "fan point",
          // content: <><p className="text-[17px] normal">Fan <span className="text-main">P</span>oints</p></>,
          content: <><p className="text-[17px] normal">{t('Fan Points')}</p></>,
          route: "/fan-point",
        },
        {
          disabled: true,
          icon: <CrashGameIcon className="fill-white" />,
          label: "fan games",
          content: <div className="flex items-center justify-between w-full">
            <p className="text-[17px] normal">{t('Fan Games')}</p>
            <span className="bg-secondary text-gray-300 border-[#333] border-[0.3px] text-[10px] px-1 py-1 rounded-[0.25rem] font-medium leading-none">
              Cooking P2E
            </span>
          </div>,
          route: "/fan-games",
        },
        {
          disabled: false,
          icon: <GetTokenIcon className="fill-white" />,
          label: "offical disco nft",
          // content: <p className="text-[17px] normal">Offcial <span className="text-main">N</span>FT</p>,
          content: <p className="text-[17px] normal">{t('Membership NFT')}</p>,
          route: "/official-nft",
        },
      ],
    },
    {
      name: "OTHERS",
      menuItems: [
        {
          disabled: false,
          icon: <DiscoRaveIcon className="fill-white" />,
          label: "learn disco rave",
          content: <p className="text-[17px] normal">{t(`Explore ${process.env.NEXT_PUBLIC_APP_NAME} RAVE`)}</p>,
          route: "/funky-rave-learn",
        },
        {
          disabled: false,
          icon: <FAQIcon className="fill-white" />,
          label: "tokenomics",
          content: <p className="text-[17px] normal">{t('Tokenomics')}</p>,
          route: "/tokenomics",
        },
        {
          disabled: false,
          icon: <FAQIcon className="fill-white" />,
          label: "vgc tokens model",
          content: <p className="text-[17px] normal">{t('VGC Tokens Model')}</p>,
          route: "/vgc-tokens-model",
        },
        {
          disabled: false,
          icon: <FAQIcon className="fill-white" />,
          label: "faq & support",
          content: <p className="text-[17px] normal">{t('FAQ')}</p>,
          route: "/faq-support",
        },
        {
          disabled: false,
          icon: <TermsOfUseIcon className="fill-white" />,
          label: "terms of use",
          content: <p className="text-[17px] normal">{t('Terms of Use')}</p>,
          route: "/terms-of-use",
        },
      ],
    },
  ];

  const pathname = usePathname();
  const router = useRouter();
  const [activeRoute, setActiveRoute] = useState<string>(pathname || "");
  const dispatch = useAppDispatch();
  const { isOpenSidebar } = useAppSelector((state) => state.home);
  const sideBarRef = useRef<HTMLDivElement | null>(null);
  const asideBarRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!sideBarRef.current) return;

    // Ensure Hammer.js only runs on the client side
    if (typeof window !== "undefined") {
      const hammer = new Hammer(sideBarRef.current);

      // Add swipe gesture handlers
      hammer.on("swiperight", () => dispatch(setIsOpenSidebar(true)));
      hammer.on("swipeleft", () => dispatch(setIsOpenSidebar(false)));

      // Cleanup Hammer.js instance on unmount
      return () => {
        hammer.destroy();
      };
    }
  }, [dispatch, sideBarRef]);

  useEffect(() => {
    if (!asideBarRef.current) return;

    // Ensure Hammer.js only runs on the client side
    if (typeof window !== "undefined") {
      const hammer = new Hammer(asideBarRef.current);

      // Add swipe gesture handlers
      hammer.on("swiperight", () => dispatch(setIsOpenSidebar(true)));
      hammer.on("swipeleft", () => dispatch(setIsOpenSidebar(false)));

      // Cleanup Hammer.js instance on unmount
      return () => {
        hammer.destroy();
      };
    }
  }, [dispatch, asideBarRef]);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpenSidebar) {
      // Prevent body scroll when sidebar is open
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll when sidebar is closed
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpenSidebar]);

  if (connectBonus) {
    menuGroups[0].menuItems[3].content = <><p className="text-[17px] normal">{t('Fan Points')}</p><span className="absolute right-3 z-1 bg-red-500 text-white rounded-full text-xs min-w-5 h-5 px-1.5 flex items-center justify-center font-semibold">
      1
    </span></>
  }
  if (claimTickets) {
    menuGroups[0].menuItems[1].content = <><p className="text-[17px] normal">{t('Lottery Ticket')}</p><span className="absolute right-3 z-1 bg-red-500 text-white rounded-full text-xs min-w-5 h-5 px-1.5 flex items-center justify-center font-semibold">
                {claimTickets >= 1000000000
                  ? `${(claimTickets / 1000000000).toFixed(1)}B`
                  : claimTickets >= 1000000
                  ? `${(claimTickets / 1000000).toFixed(1)}M`
                  : claimTickets >= 1000
                  ? `${(claimTickets / 1000).toFixed(1)}K`
                  : claimTickets}
              </span></>
  }

  return (
    <ClickOutside exceptionRef={sidebarToggleRef} onClick={() => dispatch(setIsOpenSidebar(false))}>
      <aside
        ref={asideBarRef}
        className={`dark:border-stroke-white fixed left-0 top-0 z-9999 flex h-[100dvh] w-60 flex-col overflow-y-hidden border-r border-stroke bg-white drop-shadow-3 dark:bg-mainbg transition-all duration-300 ease-in-out ${isOpenSidebar == true
          ? "translate-x-0"
          : "-translate-x-full"
          }`}
        onWheel={(e) => {
          // Prevent scroll event from bubbling to main content
          e.stopPropagation();
        }}
        onTouchMove={(e) => {
          // Prevent touch scroll from bubbling to main content
          e.stopPropagation();
        }}
      >
        {/* <!-- SIDEBAR HEADER --> */}
        <div ref={asideBarRef} className="flex items-center justify-between gap-[.3rem] px-6 py-3 text-white">
          <button
            onClick={() => dispatch(setIsOpenSidebar(false))}
            className="block "
          >
            <X />
          </button>
          <Link prefetch={false} href="/" className="inline-flex items-center justify-center gap-x-[10px]">
            <Image
              className="rounded-full"
              src={`/images/logo/funky_trans_150_s.png`}
              alt="icon"
              height={20}
              width={20}
            />
            <Image
              width={88}
              height={18}
              src={"/images/logo/header_logo.png"}
              alt="Logo"
              onClick={() => dispatch(setIsOpenSidebar(false))}
              priority
            />
          </Link>
        </div>
        {/* <!-- SIDEBAR HEADER --> */}

        <div 
          ref={sideBarRef} 
          className="flex flex-col overflow-y-auto"
          onWheel={(e) => {
            // Prevent scroll event from bubbling to main content
            e.stopPropagation();
          }}
          onTouchMove={(e) => {
            // Prevent touch scroll from bubbling to main content
            e.stopPropagation();
          }}
        >
          {/* <!-- Sidebar Menu --> */}
          <nav className="mt-1 px-4 pb-8">
            {menuGroups.map((group, groupIndex) => (
              <div key={groupIndex}>
                <h3 className={`px-[.2rem] text-[10px] text-dark-4 dark:text-main ${group.name == 'OTHERS' ? 'mt-5' : ''}`}>
                </h3>
                <div className={`border-t-[0.5px] border-t-[#666666] mb-5 w-full ${group.name == 'OTHERS' ? '' : 'hidden'}`}></div>
                <ul className="flex flex-col gap-[0.5rem]">
                  {group.menuItems.map((menuItem, menuIndex) => (
                    <SidebarItem
                      key={menuIndex}
                      item={menuItem}
                      pageName={activeRoute}
                      setPageName={setActiveRoute}
                    />
                  ))}
                </ul>
              </div>
            ))}
          </nav>
          {/* <!-- Sidebar Menu --> */}
        </div>
      </aside>
    </ClickOutside>
  );
};

export default Sidebar;
