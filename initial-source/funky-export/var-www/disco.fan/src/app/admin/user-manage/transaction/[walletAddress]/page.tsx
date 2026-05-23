import { Metadata } from "next";
import PrizeTransaction from "@/components/admin/prizeTransaction";
import AdminLayout from "@/components/Layouts/AdminLayout";

export const metadata: Metadata = {
  title: "DISCO User Transaction",
  description: "This is the User Transaction of DISCO",
};

export default function UserTransaction({
  params,
}: {
  params: { walletAddress: string };
}) {
  return (
    <AdminLayout>
      <PrizeTransaction wallet_address={params.walletAddress} />
    </AdminLayout>
  );
}
