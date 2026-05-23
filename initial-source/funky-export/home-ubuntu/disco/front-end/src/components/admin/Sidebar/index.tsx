"use client";
import React, { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from 'next-intl';

type SidebarProps = {
  isOpenOnMobile: boolean;
  onCloseMobile: () => void;
};

export default function Sidebar({ isOpenOnMobile, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const t = useTranslations('Admin');

  const navItems = useMemo(
    () => [
      { href: "/admin/user-manage", labelKey: "User Management" },
      { href: "/admin/airdrop-prizes", labelKey: "Airdrop" },
      { href: "/admin/nfts", labelKey: "NFT Management" },
      { href: "/admin/trial-nfts", labelKey: "Trial NFTs" },
      { href: "/admin/nft-management", labelKey: "NFT List" },
      { href: "/admin/ticket-distribution", labelKey: "Ticket Distribution" },
      { href: "/admin/ticket-codes", labelKey: "Ticket Codes" },
      { href: "/admin/token-management", labelKey: "Token Management" },
      { type: "divider" },
      { href: "/admin/news", labelKey: "News" },
      { href: "/admin/illustrations", labelKey: "Illustrations" },
      { href: "/admin/illustration-history", labelKey: "Illustration History" },
      { type: "divider" },
      { href: "/admin/monitoring", labelKey: "Monitoring" },
      { href: "/admin/daily-batch-fallback", labelKey: "Daily Batch Fallback" },
    ],
    []
  );

  return (
    <>
      {/* Backdrop for mobile */}
      <div
        className={`fixed top-14 bottom-0 inset-x-0 z-[40] bg-black/40 backdrop-blur-sm transition-opacity lg:hidden ${
          isOpenOnMobile ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onCloseMobile}
      />

      <aside
        className={`fixed z-[41] top-14 bottom-0 left-0 w-72 border-r border-gray-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 transition-transform duration-300 will-change-transform lg:translate-x-0 ${
          isOpenOnMobile ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <nav className="p-3">
          <ul className="space-y-1">
            {navItems.map((item, index) => {
              if (item.type === "divider") {
                return (
                  <li key={`divider-${index}`} className="my-3">
                    <div className="h-px bg-gray-200" />
                  </li>
                );
              }
              
              const isActive = pathname?.startsWith(item.href || '');
              return (
                <li key={item.href}>
                  <Link
                    prefetch={false}
                    href={item.href || '#'}
                    className={`flex items-center gap-x-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-gray-900 text-white shadow-sm"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={onCloseMobile}
                  >
                    {item.labelKey ? t(item.labelKey as any) : item.labelKey}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}


