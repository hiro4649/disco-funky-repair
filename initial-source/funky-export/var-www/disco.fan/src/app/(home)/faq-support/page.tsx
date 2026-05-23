import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import React from "react";
import FaqSupport from "@/components/FaqSupport";


export const metadata: Metadata = {
  metadataBase: new URL('https://disco.fan'),
  title: "DISCO RAVE - Daily Airdrop & Cryptocurrency Rewards FAQ Support",
  description: "Simply hold DISCO RAVE tokens in your crypto wallet, and enjoy a free daily cryptocurrency airdrop! Experience the ultimate daily crypto reward service! FAQ Support",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://disco.fan",
    title: "DISCO RAVE - Daily Airdrop & Cryptocurrency Rewards FAQ Support",
    description:
      "Simply hold DISCO RAVE tokens in your crypto wallet, and enjoy a free daily cryptocurrency airdrop! Experience the ultimate daily crypto reward service! FAQ Support",
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
      "zh_CN",
      "es_ES",
      "ru_RU",
      "ar_AE",
      "fr_FR",
      "pt_PT",
      "hi_IN",
      "ko_KR",
      "ja_JP",
      "vi_VN",
      "ms_MY",
      "th_TH",
      "id_ID",
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@DiscoRaveX",
  },
};

export default function FAQ() {
  return (
    <>
      <DefaultLayout>
        <FaqSupport />
      </DefaultLayout>
    </>
  );
}
