import { Metadata } from "next";
import React from "react";
import AdminLayout from "@/components/Layouts/AdminLayout";
import NFTManagement from "@/components/admin/NFTManagement";

export const metadata: Metadata = {
  title: `${process.env.NEXT_PUBLIC_APP_NAME} NFT Management`,
  description: `NFT Management for ${process.env.NEXT_PUBLIC_APP_NAME}`,
};

export default function NFTManagementPage() {
  return (
    <AdminLayout>
      <NFTManagement />
    </AdminLayout>
  );
}

