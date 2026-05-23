'use client';

import { useParams } from 'next/navigation';

const TestReferralPage = () => {
  const params = useParams();

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-white text-2xl mb-4">Test Referral Page</h1>
        <p className="text-gray-400">This is a test page to verify routing works</p>
        <p className="text-gray-500 mt-4">Params: {JSON.stringify(params)}</p>
      </div>
    </div>
  );
};

export default TestReferralPage; 