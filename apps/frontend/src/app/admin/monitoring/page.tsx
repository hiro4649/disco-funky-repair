import { Metadata } from "next";
import React from "react";
import AdminLayout from "@/components/Layouts/AdminLayout";
import MonitoringDashboard from "@/components/admin/Monitoring";

export const metadata: Metadata = {
  title: `${process.env.NEXT_PUBLIC_APP_NAME} System Monitoring`,
  description: `QuickNode RPC & System Health Monitoring Dashboard`,
};

export default function MonitoringPage() {
  return (
    <AdminLayout>
      <MonitoringDashboard />
    </AdminLayout>
  );
}
