import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import React from "react";
import OfficalDiscoNft from "@/components/OfficalDiscoNFT";

export const metadata: Metadata = {
  title: "DISCO RAVE - Daily Airdrop & Cryptocurrency Rewards Offical NFT",
  description: "Simply hold DISCO RAVE tokens in your crypto wallet, and enjoy a free daily cryptocurrency airdrop! Experience the ultimate daily crypto reward service! Offical NFT",
  openGraph: {
    type: "website",
    url: "https://disco.fan",
    locale: "en_US",
    title: "DISCO RAVE - Daily Airdrop & Cryptocurrency Rewards Offical NFT",
    description:
      "Simply hold DISCO RAVE tokens in your crypto wallet, and enjoy a free daily cryptocurrency airdrop! Experience the ultimate daily crypto reward service! Offical NFT",
    siteName: "DISCO RAVE",
    images: [
      {
        url: "https://disco.fan/images/meta_disco.png",
        width: 1200,
        height: 630,
        type:'image/png',
        alt: "DISCO RAVE Logo",
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
    site: "@DiscoRaveX",
  },
};

export default function OfficalDiscoNftPage() {
  return (
    <>
      <DefaultLayout>
        <OfficalDiscoNft />
      </DefaultLayout>
    </>
  );
}
