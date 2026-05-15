import { Metadata } from "next";
import React from "react";
import AdminLayout from "@/components/Layouts/AdminLayout";
import DailyBatchFallback from "@/components/admin/DailyBatchFallback";

export const metadata: Metadata = {
  title: `${process.env.NEXT_PUBLIC_APP_NAME} Daily Batch Fallback`,
  description: `Real-time status and manual daily batch fallback for holding date updates`,
};

export default function DailyBatchFallbackPage() {
  return (
    <AdminLayout>
      <DailyBatchFallback />
    </AdminLayout>
  );
}
