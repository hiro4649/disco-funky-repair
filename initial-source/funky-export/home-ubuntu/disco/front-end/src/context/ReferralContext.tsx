'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAppKitAccount } from '@reown/appkit/react';

interface ReferralContextType {
  referralCode: string | null;
  referralStats: {
    totalReferrals: number;
    verifiedReferrals: number;
    totalRewards: number;
    pendingRewards: number;
  } | null;
  isLoading: boolean;
  generateReferralCode: () => Promise<void>;
  getReferralStats: () => Promise<void>;
  trackReferral: (referralCode: string) => Promise<void>;
}

const ReferralContext = createContext<ReferralContextType | undefined>(undefined);

export const useReferral = () => {
  const context = useContext(ReferralContext);
  if (!context) {
    throw new Error('useReferral must be used within a ReferralProvider');
  }
  return context;
};

interface ReferralProviderProps {
  children: ReactNode;
}

export const ReferralProvider: React.FC<ReferralProviderProps> = ({ children }) => {
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referralStats, setReferralStats] = useState<ReferralContextType['referralStats']>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { address } = useAppKitAccount();

  const generateReferralCode = async () => {
    if (!address) {
      console.error('No wallet address found');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/referral/referral-code/${address}`);
      if (response.ok) {
        const data = await response.json();
        console.log(data, 'referral response')
        setReferralCode(data.referralCode);
      } else {
        console.error('Failed to generate referral code');
      }
    } catch (error) {
      console.error('Error generating referral code:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getReferralStats = async () => {
    if (!address) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/referral/referral-stats/${address}`);
      if (response.ok) {
        const data = await response.json();
        setReferralStats(data);
      } else {
        console.error('Failed to get referral stats');
      }
    } catch (error) {
      console.error('Error getting referral stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const trackReferral = async (referralCode: string) => {
    if (!address) {
      console.log('No wallet address available for referral tracking');
      return;
    }

    console.log('Tracking referral:', { referralCode, address });

    try {
      const response = await fetch('/api/referral/track-referral', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: address,
          referralCode,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        console.log('Referral tracked successfully:', data);
        // Show success message to user
        alert(`Referral tracked successfully! You and your referrer will earn rewards when you hold 10,000+ ${process.env.NEXT_PUBLIC_APP_NAME} tokens for 24+ hours.`);
      } else {
        console.error('Failed to track referral:', data);
        // Show error message to user
        alert(`Failed to track referral: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error tracking referral:', error);
      alert('Error tracking referral. Please try again.');
    }
  };

  // Note: Referral tracking is now handled automatically during user signup
  // No need to manually track referrals when wallet connects

  const value: ReferralContextType = {
    referralCode,
    referralStats,
    isLoading,
    generateReferralCode,
    getReferralStats,
    trackReferral,
  };

  return (
    <ReferralContext.Provider value={value}>
      {children}
    </ReferralContext.Provider>
  );
};