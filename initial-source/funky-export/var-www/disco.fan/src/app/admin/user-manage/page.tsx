import { Metadata } from "next";
import React from "react";
import AdminLayout from "@/components/Layouts/AdminLayout";
import UserManage from "@/components/admin/UserManage";

export const metadata: Metadata = {
  title: "DISCO Airdrop Prizes",
  description: "This is the Airdrop Prizes of DISCO",
};

export default function UserManagePage() {
  return (
    <AdminLayout>
      <UserManage />
    </AdminLayout>
  );
}
