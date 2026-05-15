"use client";

import React from "react";
import IllustrationHistory from "@/components/admin/IllustrationHistory";
import AdminLayout from "@/components/Layouts/AdminLayout";

const IllustrationHistoryPage = () => {
  return (
    <AdminLayout>
      <div className="py-7 px-3">
        <div className="flex flex-col gap-10">
          <h2 className="text-title-xl2 font-bold text-black">Illustration History</h2>
          <IllustrationHistory />
        </div>
      </div>
    </AdminLayout>
  );
};

export default IllustrationHistoryPage; 