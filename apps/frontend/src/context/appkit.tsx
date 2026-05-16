"use client";

import { createAppKit } from "@reown/appkit/react";
import { EthersAdapter } from "@reown/appkit-adapter-ethers";
import { bsc } from "@reown/appkit/networks";
import { ReactNode } from "react";

// 1. Get projectId at https://dashboard.reown.com
const projectId = "4a8fd5adcc3761fd65c9b7d8e01b1d48";

// 2. Create a metadata object
const metadata = {
  name: `${process.env.NEXT_PUBLIC_APP_NAME} RAVE`,
  description: `${process.env.NEXT_PUBLIC_APP_NAME} RAVE description`,
  url: "https://funky.fan", // origin must match your domain & subdomain
  icons: ["/images/logo/logo.png"],
};

// 3. Create the AppKit instance
createAppKit({
  adapters: [new EthersAdapter()],
  metadata,
  networks: [bsc],
  projectId,
  features: {
    analytics: true, // Optional - defaults to your Cloud configuration
  },
});

export function AppKit({ children }: { children: ReactNode}) {
  return (
    <div>
      {children}
    </div>
  );
}
