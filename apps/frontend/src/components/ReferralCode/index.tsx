'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Dashboard from "@/components/Dashboard/Dashboard";

interface ReferralPageProps {
  params: {
    referralCode: string;
  };
}

export default function ReferralCode({ params }: ReferralPageProps) {
  const router = useRouter();
  const { referralCode } = params;

  useEffect(() => {
    // Set the referral cookie
    if (referralCode) {
      const expiresInDays = 7;
      const maxAge = 60 * 60 * 24 * expiresInDays;
      document.cookie = `ref=${referralCode}; path=/; max-age=${maxAge}`;
      console.log('Referral cookie set:', referralCode);
    }

    // Redirect to home page after setting cookie
    setTimeout(() => {
      router.push('/');
    }, 2000);
  }, [referralCode, router]);

  return (
      <Dashboard />
  );
}