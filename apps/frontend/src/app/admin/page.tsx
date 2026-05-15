import { Metadata } from "next";
import React from "react";
import AdminLayout from "@/components/Layouts/AdminLayout";
import Signin from "@/components/Auth/Signin";

export const metadata: Metadata = {
  title: `${process.env.NEXT_PUBLIC_APP_NAME} Admin Dashboard`,
  description: `This is the Admin Dashboard of ${process.env.NEXT_PUBLIC_APP_NAME}`,
};

export default function Home() {

  return (
    <>
      <Signin />
    </>
  );
}
