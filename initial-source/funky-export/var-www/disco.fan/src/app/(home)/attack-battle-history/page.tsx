import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import React from "react";
import AttackHistory from "@/components/User/AttackBattleHistory/AttackBattleHistory";

export const metadata: Metadata = {
    title: "Attack Battle history of User in DISCO",
    description: "Discover the Attack Battle history in your DISCO collection",
    openGraph: {
      type: "website",
      url: "https://disco.fan",
      title: "DISCO RAVE - Daily Airdrop & Cryptocurrency Rewards",
      description:
        "Simply hold DISCO RAVE tokens in your crypto wallet, and enjoy a free daily cryptocurrency airdrop! Experience the ultimate daily crypto reward service!",
      siteName: "DISCO RAVE",
      images: [
        {
          url: "/images/meta_disco.png",
          width: 1200,
          height: 630,
          alt: "DISCO RAVE Logo",
        },
      ],
      locale: "en_US",
      alternateLocale: [
        "zh_CN", "es_ES", "ru_RU", "ar_AE", "fr_FR",
        "pt_PT", "hi_IN", "ko_KR", "ja_JP", "vi_VN",
        "ms_MY", "th_TH", "id_ID", 
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: "@DiscoRaveX",
      title: "DISCO RAVE - Daily Airdrop & Cryptocurrency Rewards",
      description:
        "Simply hold DISCO RAVE tokens in your crypto wallet, and enjoy a free daily cryptocurrency airdrop! Experience the ultimate daily crypto reward service!",
      images: ["/images/meta_disco.png"],
    },
  };

export default function AttackBattleHistory () {
    return (
        <>
            <DefaultLayout>
                <AttackHistory />
            </DefaultLayout>
        </>
    )
}