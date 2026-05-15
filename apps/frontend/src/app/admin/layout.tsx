"use client";
import "flatpickr/dist/flatpickr.min.css";
import "@/css/satoshi.css";
import "@/css/style.css";
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
    } else {
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
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body suppressHydrationWarning={true}>
        <Provider store={store}>
          <AdminLayoutContent>{children}</AdminLayoutContent>
        </Provider>
      </body>
    </html>
  );
}
