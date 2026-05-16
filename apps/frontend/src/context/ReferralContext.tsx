'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAppKitAccount } from '@reown/appkit/react';
import { useAppSelector } from '@/store/store';
import apiClient from '../../utils/apiClient';

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
  const { authState, user_id, wallet_address } = useAppSelector((state) => state.user);

  const connectedWalletAddress = address?.toLowerCase() || null;
  const authenticatedWalletAddress = wallet_address?.toLowerCase() || null;
  const canUsePrivateReferralApi = Boolean(
    authState &&
    user_id &&
    connectedWalletAddress &&
    authenticatedWalletAddress &&
    connectedWalletAddress === authenticatedWalletAddress,
  );

  const getPrivateReferralWalletAddress = () => {
    if (!canUsePrivateReferralApi || !authenticatedWalletAddress) {
      setReferralCode(null);
      setReferralStats(null);
      return null;
    }

    return authenticatedWalletAddress;
  };

  useEffect(() => {
    if (!canUsePrivateReferralApi) {
      setReferralCode(null);
      setReferralStats(null);
    }
  }, [canUsePrivateReferralApi]);

  const generateReferralCode = async () => {
    const walletAddress = getPrivateReferralWalletAddress();
    if (!walletAddress) {
      console.warn('Referral code read skipped until wallet sign-in is complete');
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.get(`/referral/referral-code/${walletAddress}`);
      setReferralCode(response.data.referralCode || null);
    } catch (error: any) {
      const status = error?.response?.status;
      if (status === 401 || status === 403) {
        setReferralCode(null);
      }
      console.warn('Referral code read failed', { status: status || 'unknown' });
    } finally {
      setIsLoading(false);
    }
  };

  const getReferralStats = async () => {
    const walletAddress = getPrivateReferralWalletAddress();
    if (!walletAddress) return;

    setIsLoading(true);
    try {
      const response = await apiClient.get(`/referral/referral-stats/${walletAddress}`);
      setReferralStats(response.data);
    } catch (error: any) {
      const status = error?.response?.status;
      if (status === 401 || status === 403) {
        setReferralStats(null);
      }
      console.warn('Referral stats read failed', { status: status || 'unknown' });
    } finally {
      setIsLoading(false);
    }
  };

  const trackReferral = async (referralCode: string) => {
    const walletAddress = getPrivateReferralWalletAddress();
    if (!walletAddress) {
      alert('Please connect your wallet and sign in before tracking a referral.');
      return;
    }

    try {
      const response = await apiClient.post('/referral/track-referral', {
        walletAddress,
        referralCode,
      });
      
      if (response.status >= 200 && response.status < 300) {
        alert(`Referral tracked successfully! You and your referrer will earn rewards when you hold 10,000+ ${process.env.NEXT_PUBLIC_APP_NAME} tokens for 24+ hours.`);
      }
    } catch (error: any) {
      const status = error?.response?.status;
      if (status === 401 || status === 403) {
        alert('Please sign in again before tracking a referral.');
      } else {
        alert(`Failed to track referral: ${error?.response?.data?.error || 'Please try again.'}`);
      }
      console.warn('Referral tracking failed', { status: status || 'unknown' });
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
