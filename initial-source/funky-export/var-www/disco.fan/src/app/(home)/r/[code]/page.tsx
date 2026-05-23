'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';

const ReferralPage = () => {
  const router = useRouter();
  const params = useParams();
  const [status, setStatus] = useState('Loading...');

  useEffect(() => {
    console.log('ReferralPage mounted');
    console.log('Params:', params);
    
    const referralCode = params.code as string;
    console.log('Referral code:', referralCode);
    
    if (referralCode) {
      setStatus('Setting referral cookie...');
      
      // Set referral cookie with 7-day expiration
      const sevenDaysInSeconds = 60 * 60 * 24 * 7;
      document.cookie = `ref=${referralCode}; path=/; max-age=${sevenDaysInSeconds}; SameSite=Lax`;
      
      console.log(`Referral cookie set for code: ${referralCode}`);
      setStatus('Cookie set! Redirecting...');
      
      // Redirect to home page after setting cookie
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } else {
      setStatus('No referral code found');
    }
  }, [params.code, router]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#00FFCC] mx-auto mb-4"></div>
        <p className="text-white text-lg mb-2">Processing your referral...</p>
        <p className="text-gray-400 text-sm">{status}</p>
        <p className="text-gray-500 text-xs mt-4">Referral Code: {params.code}</p>
      </div>
    </div>
  );
};

export default ReferralPage; 