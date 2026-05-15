import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import React from "react";
import ServiceDescription from "@/components/ServiceDescription";
import Wallet from "@/components/User/UserWallet/Wallet"

export const metadata: Metadata = {
  metadataBase: new URL(String(process.env.NEXT_PUBLIC_APP_URL || "")),
  title: `User Wallet - ${process.env.NEXT_PUBLIC_APP_NAME} RAVE - Daily Airdrop & Cryptocurrency Rewards`,
  description: `User Wallet - Simply hold ${process.env.NEXT_PUBLIC_APP_NAME} RAVE tokens in your crypto wallet, and enjoy a free daily cryptocurrency airdrop! Experience the ultimate daily crypto reward service!.`,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: String(process.env.NEXT_PUBLIC_APP_URL || ""),
    title: `User Wallet - ${process.env.NEXT_PUBLIC_APP_NAME} RAVE - Daily Airdrop & Cryptocurrency Rewards.`,
    description:
      `User Wallet - Simply hold ${process.env.NEXT_PUBLIC_APP_NAME} RAVE tokens in your crypto wallet, and enjoy a free daily cryptocurrency airdrop! Experience the ultimate daily crypto reward service!.`,
    siteName: `${process.env.NEXT_PUBLIC_APP_NAME} RAVE`,
    images: [
      {
        url: "/images/logo/meta-image.png",
        width: 1200,
        height: 630,
        type: 'image/png',
        alt: `${process.env.NEXT_PUBLIC_APP_NAME} RAVE Logo`,
      },
    ],
    alternateLocale: [
      "zh_CN", "es_ES", "ru_RU", "ar_AE", "fr_FR",
      "pt_PT", "hi_IN", "ko_KR", "ja_JP", "vi_VN",
      "ms_MY", "th_TH", "id_ID",
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: `@${process.env.NEXT_PUBLIC_APP_NAME}RaveX`,
  },
};

export default function MyWalletPage() {
  return (
    <>
      <DefaultLayout>
        <Wallet />
        {/* <ServiceDescription className="mx-4" content="We guarantee that the probability of airdrop prizes being released is accurate due to the lottery system.Please note that airdrop prizes include tokens issued by parties other than our project." /> */}
      </DefaultLayout>
    </>
  )
}