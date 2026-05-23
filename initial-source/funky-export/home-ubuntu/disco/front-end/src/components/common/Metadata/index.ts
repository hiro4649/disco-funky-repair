export const metadataConfig = {
    title: `${process.env.NEXT_PUBLIC_APP_NAME} RAVE - Daily Airdrop & Cryptocurrency Rewards`,
    description:
      `Simply hold ${process.env.NEXT_PUBLIC_APP_NAME} RAVE tokens in your crypto wallet, and enjoy a free daily cryptocurrency airdrop! Experience the ultimate daily crypto reward service!`,
    openGraph: {
      metadataBase: new URL(String(process.env.NEXT_PUBLIC_APP_URL || "")),
      type: "website",
      locale: "en_US",
      url: String(process.env.NEXT_PUBLIC_APP_URL || ""),
        title: `${process.env.NEXT_PUBLIC_APP_NAME} RAVE - Daily Airdrop & Cryptocurrency Rewards`,
      description:
        `Simply hold ${process.env.NEXT_PUBLIC_APP_NAME} RAVE tokens in your crypto wallet, and enjoy a free daily cryptocurrency airdrop! Experience the ultimate daily crypto reward service!`,
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
        "zh_CN", "es_ES", "ru_RU", "ar_AE", "fr_FR",
        "pt_PT", "hi_IN", "ko_KR", "ja_JP", "vi_VN", "ms_MY", "th_TH",
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: `@${process.env.NEXT_PUBLIC_APP_NAME}RaveX`,
    },
  };
  