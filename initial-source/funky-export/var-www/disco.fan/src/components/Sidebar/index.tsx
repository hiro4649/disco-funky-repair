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
import { X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from 'next-intl';


const Sidebar = ({ sidebarToggleRef, mainContentRef }: { sidebarToggleRef: React.RefObject<HTMLButtonElement>; mainContentRef: React.RefObject<HTMLDivElement | null> }) => {
  const { authState, ticket, connectBonus } = useAppSelector((state) => state.user);
  const t = useTranslations('Menu');
  let menuGroups = [
    {
      name: "",
      menuItems: [
        {
          icon: <AirdropIcon width={20} height={20} className="fill-white" />,
          label: "airdrop prizes",
          // content: <p className="text-[17px] normal">Aridrop <span className="text-[#00FFCC]">P</span>rizes</p>,
          content: <p className="text-[17px] normal">{t('Airdrop Prizes')}</p>,
          route: "/airdrop-prizes",
        },

        {
          icon: (
            <LotteryTicketIcon width={20} heigth={20} className="fill-white" />
          ),
          label: "lottery ticket",
          // content: <p className="text-[17px] normal">Lottery <span className="text-[#00FFCC]">T</span>icket</p>,
          content: <p className="text-[17px] normal">{t('Lottery Ticket')}</p>,
          route: "/lottery-ticket",
        },
        {
          icon: <PrizeIcon width={20} height={20} className="fill-white" />,
          label: "prize history",
          // content: <p className="text-[17px] normal">Prize <span className="text-[#00FFCC]">H</span>istory</p>,
          content: <p className="text-[17px] normal">{t('Prize History')}</p>,
          route: "/prize-history",
        },
        {
          icon: <LeaderBoardIcon width={20} height={20} className="fill-white" />,
          label: "fan point",
          // content: <><p className="text-[17px] normal">Fan <span className="text-[#00FFCC]">P</span>oints</p></>,
          content: <><p className="text-[17px] normal">{t('Fan Points')}</p></>,
          route: "/fan-point",
        },
        {
          icon: <LeaderBoardIcon width={20} height={20} className="fill-white" />,
          label: "fan games",
          // content: <><p className="text-[17px] normal">Fan <span className="text-[#00FFCC]">P</span>oints</p></>,
          content: <><p className="text-[17px] flex justify-between items-center w-full text-[#999999] normal mr-[-10px]">{t('Fan Games')} 
            <small className="text-[10px] leading-[1.2] bg-[#333333] px-[4px] py-[2px] rounded-[4px] border-[1px] border-[#666666] text-[#CCCCCC]">Cooking P2E</small></p></>,
          route: "",
        },
        {
          icon: <GetTokenIcon className="fill-white" />,
          label: "offical disco nft",
          // content: <p className="text-[17px] normal">Offcial <span className="text-[#00FFCC]">N</span>FT</p>,
          content: <p className="text-[17px] normal">{t('Membership NFT')}</p>,
          route: "/offical-disco-nft",
        },

      ],
    },
    {
      name: "OTHERS",
      menuItems: [
        {
          icon: <DiscoRaveIcon className="fill-white" />,
          label: "learn disco rave",
          content: <p className="text-[17px] normal">{t('Explore DISCO RAVE')}</p>,
          route: "/disco-rave-learn",
        },
        {
          icon: <FAQIcon className="fill-white" />,
          label: "tokenomics",
          content: <p className="text-[17px] normal">{t('Tokenomics')}</p>,
          route: "/tokenomics",
        },
        {
          icon: <FAQIcon className="fill-white" />,
          label: "vgc tokens model",
          content: <p className="text-[17px] normal">{t('VGC Tokens Model')}</p>,
          route: "/vgc-tokens-model",
        },
        {
          icon: <FAQIcon className="fill-white" />,
          label: "faq & support",
          content: <p className="text-[17px] normal">{t('FAQ')}</p>,
          route: "/faq-support",
        },
        {
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

  if (! connectBonus) {
    menuGroups[0].menuItems[3].content = <><p className="text-[17px] normal">{t('Fan Points')}</p><span className="relative top-0 left-4 z-1 bg-red-500 text-white rounded-full text-[13px] mt-[2px] w-4 h-4 flex items-center justify-center">
    1
  </span></>
  }

  return (
    <ClickOutside exceptionRef={sidebarToggleRef} onClick={() => dispatch(setIsOpenSidebar(false))}>
      <aside
        ref={asideBarRef}
        className={`dark:border-stroke-white fixed left-0 top-0 z-9999 flex h-screen w-60 flex-col overflow-y-hidden border-r border-stroke bg-white drop-shadow-3 dark:bg-black transition-all duration-300 ease-in-out ${isOpenSidebar == true
          ? "translate-x-0"
          : "-translate-x-full"
          }`}
      >
        {/* <!-- SIDEBAR HEADER --> */}
        <div ref={asideBarRef} className="flex items-center justify-between gap-[.3rem] px-6 py-3 text-white">
          <button
            onClick={() => dispatch(setIsOpenSidebar(false))}
            className="block "
          >
            <X />
          </button>
          <Link prefetch={false} href="/">
            <Image
              width={77}
              height={18}
              src={"/images/logo/new-logo.png"}
              alt="Logo"
              onClick={() => dispatch(setIsOpenSidebar(false))}
              priority
            />
          </Link>


        </div>
        {/* <!-- SIDEBAR HEADER --> */}

        <div ref={sideBarRef} className="no-scrollbar flex flex-col overflow-y-auto">
          {/* <!-- Sidebar Menu --> */}
          <nav className="mt-1 px-4">
            {menuGroups.map((group, groupIndex) => (
              <div key={groupIndex}>
                <h3 className={`px-[.2rem] text-[10px] text-dark-4 dark:text-[#00FFCC] ${group.name == 'OTHERS' ? 'mt-5' : ''}`}>
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
