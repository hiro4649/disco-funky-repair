import { Metadata } from "next";
import React from "react";
import AdminLayout from "@/components/Layouts/AdminLayout";
import AirDropManage from "@/components/admin/Airdrop";

export const metadata: Metadata = {
  title: "DISCO Airdrop Prizes",
  description: "This is the Airdrop Prizes of DISCO",
};

export default function AirdropPrizePage() {
  return (
    <AdminLayout>
      <AirDropManage />
    </AdminLayout>
  );
}
