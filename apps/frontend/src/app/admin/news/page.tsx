import { Metadata } from "next";
import React from "react";
import AdminLayout from "@/components/Layouts/AdminLayout";
import News from "@/components/admin/news/index";

export const metadata: Metadata = {
  title: "News Management",
  description: `This is the News Management of ${process.env.NEXT_PUBLIC_APP_NAME}`,
};

export default function NewsPage() {
  return (
    <AdminLayout>
      <News />
    </AdminLayout>
  );
} 