"use client";

import React from "react";
import Illustrations from "@/components/admin/Illustrations";
import AdminLayout from "@/components/Layouts/AdminLayout";

const IllustrationsPage = () => {
  return (
    <AdminLayout>
      <div className="py-7 px-3">
        <div className="flex flex-col gap-10">
          <h2 className="text-title-xl2 font-bold text-black">Illustrations Management</h2>
          <Illustrations />
        </div>
      </div>
    </AdminLayout>
  );
};

export default IllustrationsPage; 