import { Metadata } from "next";
import React from "react";
import AdminLayout from "@/components/Layouts/AdminLayout";
import UserManage from "@/components/admin/UserManage";

export const metadata: Metadata = {
  title: `${process.env.NEXT_PUBLIC_APP_NAME} Airdrop Prizes`,
  description: `This is the Airdrop Prizes of ${process.env.NEXT_PUBLIC_APP_NAME}`,
};

export default function UserManagePage() {
  return (
    <AdminLayout>
      <UserManage />
    </AdminLayout>
  );
}
