"use client";
import React, { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import FriendIcon from "../common/icons/friend";
import ButtonDefault from "../Buttons/ButtonDefault";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { useTranslations } from "next-intl";
import apiClient from "../../../utils/apiClient";
import toast from "react-hot-toast";
import Image from "next/image";

interface ReferralStats {
  totalReferrals: number;
  totalRewards: number;
  pendingRewards: number;
  referrals: Array<{
    walletAddress: string;
    joinedAt: string;
    rewarded: boolean;
    rewardAmount: number;
  }>;
}

const InviteFriend = () => {
  const { authState, ticket } = useAppSelector((state) => state.user);
  const { drawState } = useAppSelector((state) => state.home);
  const t = useTranslations('InviteFriend');
  
  const [referralCode, setReferralCode] = useState<string>("");
  const [referralUrl, setReferralUrl] = useState<string>("");
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  let lotteryTicket: number | null;
  if (authState) {
    lotteryTicket = ticket;
  }

  // Fetch referral code and stats
  useEffect(() => {
    if (authState) {
      fetchReferralData();
    }
  }, [authState]);

  const fetchReferralData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch referral code
      const codeResponse = await apiClient.get('/referral/code');
      if (codeResponse.data.success) {
        setReferralCode(codeResponse.data.referralCode);
        setReferralUrl(codeResponse.data.referralUrl);
      }

      // Fetch referral stats
      const statsResponse = await apiClient.get('/referral/stats');
      if (statsResponse.data.success) {
        setReferralStats(statsResponse.data);
      }
    } catch (error) {
      console.error('Error fetching referral data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyReferralLink = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setIsCopied(true);
      toast.success(t('LinkCopied'), {
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      toast.error(t('CopyFailed'), {
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
    }
  };

  const shortenAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="mx-auto max-w-[480px]">
      <div className="px-3 pt-7">
      
        <div className="flex items-end justify-center">
          <p className="mb-2.5 text-[24px] leading-[28px] text-white normal">
            {t('ReferralLink')} <span className="text-[#00FFCC]">L</span>ink
          </p>
        </div>
        
        <div className="my-4.5 rounded-[8px] bg-[#1D1B20] px-[17px] pb-5 pt-[18px]">
          <p className="text-[15px] font-normal text-white mb-[9px] mt-[6px]">
            {t('ShareYourLink')}
          </p>
          <p className="text-[15px] font-normal text-white mb-[17px]">
            {t('ReferralDescription')}
          </p>
          
          <div className="relative mt-2 flex items-center rounded-lg justify-between bg-[#000000] px-5 py-2 text-sm text-[#00FFCC] h-[46px]">
            <p className="w-[90%] overflow-hidden truncate">
              {isLoading ? t('Loading') : referralUrl || t('GeneratingLink')}
            </p>
            <Image
              width={18}
              height={18}
              src={"/images/icon/copy-b.png"}
              alt="copy"
              className="cursor-pointer"
              onClick={() => {
                if (referralUrl) copyReferralLink();
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InviteFriend;
