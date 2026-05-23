import { Metadata } from "next";
import React from "react";
import AdminLayout from "@/components/Layouts/AdminLayout";
import Nfts from "@/components/admin/Nfts";

export const metadata: Metadata = {
  title: "DISCO Airdrop Prizes",
  description: "This is the Airdrop Prizes of DISCO",
};

export default function NftsPage() {
  return (
    <AdminLayout>
      <Nfts />
    </AdminLayout>
  );
}
