import { Metadata } from "next";
import React from "react";
import AdminLayout from "@/components/Layouts/AdminLayout";
import TicketDistribution from "@/components/admin/ticketDistribution";

export const metadata: Metadata = {
  title: "Ticket Distribution",
  description: `This is the Ticket Distribution of ${process.env.NEXT_PUBLIC_APP_NAME}`,
};

export default function TicketDistributionPage() {
  return (
    <AdminLayout>
      <TicketDistribution />
    </AdminLayout>
  );
}
