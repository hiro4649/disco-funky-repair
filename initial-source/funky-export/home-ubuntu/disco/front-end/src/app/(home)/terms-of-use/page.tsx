import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import React from "react";
import TermsOfUse from "@/components/TermsOfUse";

export const metadata: Metadata = {
  metadataBase: new URL(String(process.env.NEXT_PUBLIC_APP_URL || "")),
  title: `${process.env.NEXT_PUBLIC_APP_NAME} RAVE - Terms of Use`,
  description: `Terms of Use for ${process.env.NEXT_PUBLIC_APP_NAME} RAVE platform. Please read these terms carefully before using our services.`,
  openGraph: {
    type: "website",
    url: String(process.env.NEXT_PUBLIC_APP_URL || ""),
    title: `${process.env.NEXT_PUBLIC_APP_NAME} RAVE - Terms of Use`,
    locale: "en_US",
    description:
      `Terms of Use for ${process.env.NEXT_PUBLIC_APP_NAME} RAVE platform. Please read these terms carefully before using our services.`,
    siteName: `${process.env.NEXT_PUBLIC_APP_NAME} RAVE`,
    images: [
      {
        url: "/images/logo/meta-image.png",
        width: 1200,
        height: 630,
        type:'image/png',
        alt: `${process.env.NEXT_PUBLIC_APP_NAME} RAVE Logo`,
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
    site: `@${process.env.NEXT_PUBLIC_APP_NAME}RaveX`,
  },
};

export default function TermsOfUsePage() {
  return (
    <>
      <DefaultLayout>
        <TermsOfUse />
      </DefaultLayout>
    </>
  );
} 