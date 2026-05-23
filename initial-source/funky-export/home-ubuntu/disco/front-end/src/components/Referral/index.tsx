'use client';
import React, { useState, useEffect } from 'react';
import { useReferral } from '../../context/ReferralContext';
import { useAppKitAccount } from '@reown/appkit/react';
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

const ReferralPage: React.FC = () => {
  const { referralCode, generateReferralCode, isLoading } = useReferral();
  const { isConnected, address } = useAppKitAccount();
  const [copied, setCopied] = useState(false);
  const t = useTranslations('ModalToken')

  const referralUrl = referralCode ? `${window.location.origin}/r/${referralCode}` : '';

  useEffect(() => {
    if (isConnected && address && !referralCode) {
      generateReferralCode();
    }
  }, [isConnected, address, referralCode]);

  const copyToClipboard = async () => {
    if (!referralUrl) return;

    try {
      await navigator.clipboard.writeText(referralUrl);
      toast(t('text copy'),
          {
            style: {
              borderRadius: '10px',
              background: 'var(--color-secondary)',
              color: '#fff',
            },
          }
        );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = referralUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast(t('text copy'),
          {
            style: {
              borderRadius: '10px',
              background: 'var(--color-secondary)',
              color: '#fff',
            },
          }
        );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareOnTwitter = () => {
    const text = `Join me on ${process.env.NEXT_PUBLIC_APP_NAME}.FAN and earn rewards! Use my referral link: ${referralUrl}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(twitterUrl, '_blank');
  };

  const shareOnTelegram = () => {
    const text = `Join me on ${process.env.NEXT_PUBLIC_APP_NAME}.FAN and earn rewards! Use my referral link: ${referralUrl}`;
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(referralUrl)}&text=${encodeURIComponent(text)}`;
    window.open(telegramUrl, '_blank');
  };

  if (!isConnected) {
    return (
      <div className="h-[calc(100dvh-214px)] bg-black flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <h1 className="text-white text-center text-2xl mb-5">Referral Link</h1>
          <div className="bg-secondary border-[0.5px] border-[#666666] rounded-lg p-6 shadow-lg">
            <p className="text-white text-sm text-center">
              Connect your wallet to generate your referral link and start earning rewards!
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-[calc(100dvh-214px)] bg-black flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <h1 className="text-white text-center text-2xl mb-5">Referral Link</h1>
          <div className="bg-secondary border-[0.5px] border-[#666666] rounded-lg p-6 shadow-lg">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-600 rounded w-3/4"></div>
              <div className="h-4 bg-gray-600 rounded w-1/2"></div>
              <div className="h-10 bg-gray-600 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 pt-8  bg-black flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* Title */}
        <h1 className="text-white text-center text-2xl mb-5 font-saira">Referral Link</h1>

        {/* Main Card */}
        <div className="bg-secondary border-y-[0.5px] border-y-[#666666] rounded-lg px-[.875rem] py-[1.25rem] shadow-lg">
          <div className="space-y-4">
            <p className="text-white text-sm">
              Share your unique referral link.
            </p>
            <p className="text-white text-sm">
              When a friend holds 10,000 {process.env.NEXT_PUBLIC_APP_NAME} tokens for 24 hours, you'll both earn 100 Fan Points!
            </p>

            {/* Referral Link Display */}
            <div className="bg-black rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-main text-[1rem] font-mono font-medium">
                  {referralUrl || 'Generating...'}
                </span>
                <button
                  onClick={copyToClipboard}
                  className="text-white hover:text-gray-300 transition-colors"
                  disabled={!referralUrl}
                >
                  {copied ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 6L9 17l-5-5"></path>
                    </svg>
                  ) : (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralPage;