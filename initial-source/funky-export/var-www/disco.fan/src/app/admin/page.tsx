import { Metadata } from "next";
import React from "react";
import AdminLayout from "@/components/Layouts/AdminLayout";
import Signin from "@/components/Auth/Signin";

export const metadata: Metadata = {
  title: "DISCO Admin Dashboard",
  description: "This is the Admin Dashboard of DISCO",
};

export default function Home() {

  return (
    <>
      <Signin />
    </>
  );
}
