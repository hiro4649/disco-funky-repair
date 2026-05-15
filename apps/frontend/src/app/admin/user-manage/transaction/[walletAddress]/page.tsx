import { Metadata } from "next";
import PrizeTransaction from "@/components/admin/prizeTransaction";
import AdminLayout from "@/components/Layouts/AdminLayout";

export const metadata: Metadata = {
  title: `${process.env.NEXT_PUBLIC_APP_NAME} User Transaction`,
  description: `This is the User Transaction of ${process.env.NEXT_PUBLIC_APP_NAME}`,
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
