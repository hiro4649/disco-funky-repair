"use client";
import "flatpickr/dist/flatpickr.min.css";
import "@/css/satoshi.css";
import "@/css/style.css";
import {
  WalletProvider,
  SuietWallet,
  SuiWallet,
  EthosWallet,
  SuiMainnetChain,
  GlassWallet,
  MartianWallet,
  MorphisWallet,
  OneKeyWallet,
  FrontierWallet,
  SuiDevnetChain,
  SuiTestnetChain,
  SurfWallet,
} from "@suiet/wallet-kit";
import "@suiet/wallet-kit/style.css";
import "@/css/suiet-wallet-kit-custom.css";
import { store } from "@/store/store";
import { Provider } from "react-redux";
import { useAppSelector } from "@/store/store";
import { useLayoutEffect } from "react";
import { useRouter } from "next/navigation";

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { adminAuthState } = useAppSelector((state) => state.admin);

  useLayoutEffect(() => {
    if (adminAuthState) {
      router.push("/admin/user-manage");
    }else{
      router.push("/admin");
    }
  }, [adminAuthState, router]);

  return <>{children}</>;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <WalletProvider
          defaultWallets={[
            SuietWallet,
            SuiWallet,
            EthosWallet,
            GlassWallet,
            MartianWallet,
            MorphisWallet,
            OneKeyWallet,
            FrontierWallet,
            SurfWallet,
          ]}
          chains={[SuiDevnetChain, SuiTestnetChain, SuiMainnetChain]}
        >
          <Provider store={store}>
            <AdminLayoutContent>{children}</AdminLayoutContent>
          </Provider>
        </WalletProvider>
      </body>
    </html>
  );
}
