import { Metadata } from "next";
import React from "react";
import AdminLayout from "@/components/Layouts/AdminLayout";
import TicketDistribution from "@/components/admin/ticketDistribution";

export const metadata: Metadata = {
  title: "Ticket Distribution",
  description: "This is the Ticket Distribution of DISCO",
};

export default function TicketDistributionPage() {
  return (
    <AdminLayout>
      <TicketDistribution />
    </AdminLayout>
  );
}
