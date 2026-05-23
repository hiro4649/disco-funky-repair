import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import React from "react";
import InviteFriend from "@/components/InviteFriend";
import ServiceDescription from "@/components/ServiceDescription";

export const metadata: Metadata = {
  metadataBase: new URL('https://disco.fan'),
  title: "Referral Link",
  description: "This is the Referral Link of DISCO",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://disco.fan",
    title: "DISCO RAVE - Daily Airdrop & Cryptocurrency Rewards",
    description:
      "Simply hold DISCO RAVE tokens in your crypto wallet, and enjoy a free daily cryptocurrency airdrop! Experience the ultimate daily crypto reward service!",
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
    title: "DISCO RAVE - Daily Airdrop & Cryptocurrency Rewards",
    description:
      "Simply hold DISCO RAVE tokens in your crypto wallet, and enjoy a free daily cryptocurrency airdrop! Experience the ultimate daily crypto reward service!",
    images: ["/images/meta_disco.png"],
  },
};

export default function LeaderBoardPage() {
  return (
    <>
      <DefaultLayout>
        <InviteFriend />
        {/* <ServiceDescription className="mx-4" content="We guarantee that the probability of airdrop prizes being released is accurate due to the lottery system.Please note that airdrop prizes include tokens issued by parties other than our project." /> */}
      </DefaultLayout>
    </>
  );
}
