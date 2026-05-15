"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
// Removed Suiet wallet-kit in favor of Reown AppKit
import getTokenBalance from "../../../../utils/getTokens";
import Image from "next/image";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";
import { useAppKitAccount } from "@reown/appkit/react";
import gsap from "gsap";
import { TOKEN_ABI } from "../../../utils/constant";
import { ethers } from "ethers";
const HOLDING_DATE_OPTIONS = [0, 30, 180, 360, 720];
import apiClient from "../../../../utils/apiClient";
import { useAppSelector } from "@/store/store";
import { HoldingDateExplainer, TransactionHistory, FIFOTable } from "@/components/Transaction";
import { useWalletDataUpdates } from "@/hooks/useWalletDataUpdates";

const Wallet = () => {
  const { address } = useAppKitAccount();
  const t = useTranslations('MyWallet')
  const t1 = useTranslations('ModalToken')
  const [balance, setBalance] = useState<string>("0");
  const tokenAddress = process.env.NEXT_PUBLIC_TOKEN_ADDRESS as string;
  const [isCopied, setIsCopied] = useState(false);
  const SaveTriggerRef = useRef<HTMLDivElement>(null);
  const SaveTargetRef = useRef<HTMLSpanElement>(null);
  const [currentSellFee, setCurrentSellFee] = useState<string>("0");
  const [averageTokenHoldingPeriod, setAverageTokenHoldingPeriod] = useState({
    days: 0,
    hours: 0,
  });
  const [holdDateHistory, setHoldDateHistory] = useState<any[]>([]);
  const { user_id } = useAppSelector((state: any) => state.user);
  const [showExplainer, setShowExplainer] = useState(false);
  const [activeTab, setActiveTab] = useState<'wallet' | 'transactions' | 'fifo'>('wallet');
  const [isRealtimeUpdating, setIsRealtimeUpdating] = useState(false);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>('');
  const copyText = (text: string) => {
    try {
      navigator.clipboard.writeText(text);
      toast(t1('text copy'),
        {
          style: {
            borderRadius: '10px',
            background: 'var(--color-secondary)',
            color: '#fff',
          },
        }
      );
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast(t1('text copy'),
        {
          style: {
            borderRadius: '10px',
            background: 'var(--color-secondary)',
            color: '#fff',
          },
        }
      );
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  useEffect(() => {
    const countUpTrigger = SaveTriggerRef.current;
    const countUpTarget = SaveTargetRef.current;

    if (countUpTrigger && countUpTarget) {
      const fromValue = parseInt(countUpTarget.dataset.from || "0", 10);
      const toValue = parseInt(countUpTarget.dataset.to || "0", 10);

      // GSAP animation
      const elementNum = { count: fromValue };
      gsap.to(elementNum, {
        count: toValue,
        duration: 1,
        ease: "none",
        onUpdate: () => {
          countUpTarget.textContent = Math.floor(elementNum.count).toLocaleString();
        },
      });
    }
  }, [balance]); // Trigger only once on page load

  const getTokenHoldingPeriod = async () => {
    try {
      const res = await apiClient.get(`/user/holding/average/${user_id}`);
      if (res.status === 200 && res.data.success) {
        setAverageTokenHoldingPeriod({
          days: res.data.data.averageDays,
          hours: res.data.data.averageHours
        });

        // Get last updated time from user.updatedAt (UTC timezone)
        if (res.data.data.lastUpdated) {
          const updatedDate = new Date(res.data.data.lastUpdated);
          const formattedDate = updatedDate.toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            timeZone: 'UTC'  // Ensure UTC display (consistent with backend)
          }).replace(/(\d+)\/(\d+)\/(\d+),/, '$3.$1.$2');
          setLastUpdatedTime(formattedDate);
        }
      }
    } catch (e) {
      setAverageTokenHoldingPeriod({ days: 0, hours: 0 });
    }
  };

  const getHoldDateHistory = async () => {
    try {
      const res = await apiClient.get(`/user/holding/history/${user_id}`);
      if (res.status === 200 && res.data.success) {
        setHoldDateHistory(res.data.data);
      }
    } catch (e) {
      console.error('Error fetching hold date history:', e);
      setHoldDateHistory([]);
    }
  };

  const getCurrentSellFee = async () => {
    try {
      const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;
      if (!rpcUrl || !tokenAddress) {
        setCurrentSellFee("0");
        return;
      }
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const contract = new ethers.Contract(tokenAddress, TOKEN_ABI, provider);
      const tokenHoldingPeriod = await contract.holdingDate(address);

      // Find the highest tier the user qualifies for
      let holdedDate = 0;
      for (const holdingDate of HOLDING_DATE_OPTIONS) {
        if (Number(tokenHoldingPeriod) >= holdingDate) {
          holdedDate = holdingDate;
        }
      }

      // Get fee percent from contract (stored as basis points: 250 = 25%, 200 = 20%, etc.)
      const currentSellFeeBigInt = await contract.feePercent(holdedDate);

      // Convert from basis points to percentage (divide by 10: 250 / 10 = 25%)
      setCurrentSellFee((Number(currentSellFeeBigInt) / 10).toString() || "0");
    } catch (error) {
      console.error('Error fetching current sell fee:', error);
      setCurrentSellFee("0");
    }
  };

  const tokenBalance = useCallback(async () => {
    const discoToken = await getTokenBalance(address, tokenAddress);
    setBalance(discoToken || "0");
  }, [setBalance, address, tokenAddress]);

  useEffect(() => {
    if (address) {
      tokenBalance();
      getTokenHoldingPeriod();
      getCurrentSellFee();
      getHoldDateHistory();
    }
  }, [address, tokenBalance]);

  // ============================================================
  // WebSocket Auto-Refresh: Automatically updates wallet data
  // when backend detects Transfer events and recalculates holding dates
  // Updates: Average hold duration, transaction history, FIFO queue
  // ============================================================
  const { isConnected: wsConnected, isUpdating: wsUpdating, lastUpdate } = useWalletDataUpdates({
    onUpdateStart: () => {
      // Show loading indicator when backend starts processing
      setIsRealtimeUpdating(true);
      console.log('⏳ Real-time update started - showing loading indicator...');
    },
    onUpdate: (event) => {
      // Refresh wallet data after holding date update
      getTokenHoldingPeriod();
      getHoldDateHistory();
      getCurrentSellFee();
      tokenBalance();

      // Hide loading indicator
      setIsRealtimeUpdating(false);

      console.log(`✅ Wallet data updated: ${event.averageDays.toFixed(2)} days${event.tierChanged ? ` (tier changed to ${event.newTier})` : ''}`);
    }
  });

  // Show toast notification when holding date is updated via WebSocket
  useEffect(() => {
    if (lastUpdate) {
      console.log('✅ Holding date updated at:', lastUpdate);
      // Toast notification is commented out by default
      // Uncomment to enable user notifications:
      // toast.success('Your holding data has been updated!', {
      //   duration: 4000,
      //   icon: '📊',
      // });
    }
  }, [lastUpdate]);

  const shortenAddress = (address: string) => {
    const start = address.substring(0, 14); // Get the first characters
    const end = address.substring(address.length - 14); // Get the last characters
    return `${start}...${end}`;
  };

  const shortenAddressForMobile = (address: string) => {
    const start = address.substring(0, 19); // Get first 6 characters
    const end = address.substring(address.length - 19); // Get last 6 characters
    return `${start}...${end}`;
  };

  return (
    <div className="mx-auto max-w-[480px]">
      <div className="px-3 pt-8">
        <div className="flex justify-center items-center text-center text-[24px] leading-[28px] mb-5 text-white font-saira">
          {/* My &nbsp;<span className="text-main">W</span>allet */}
          {t('My Wallet')}
        </div>
        <div className="bg-secondary px-3.5 py-5 mt-5 rounded-[8px] border-y-[0.5px] border-y-[#666666]">
          <div className="">
            <p className="text-[15px] font-normal text-white">{t('My Address')}</p>
            <div className="relative mt-2 flex items-center rounded-lg justify-between bg-[#000000] px-5 py-2 text-[15px] text-main h-[46px]">
              <p className="w-[90%] overflow-hidden">
                {address ? (
                  <>
                    <span className="hidden sm:inline">{shortenAddressForMobile(address)}</span>
                    <span className="inline sm:hidden">{shortenAddress(address)}</span>
                  </>
                ) : (
                  "Loading..."
                )}
              </p>
              <button
                onClick={() => {
                  if (address)
                    copyText(address);
                }}
                className="text-white hover:text-gray-300 transition-colors"
                disabled={!address}
              >
                {isCopied ? (
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
          <div className="mt-6">
            <p className="text-[15px] font-normal text-white">{t(`My ${process.env.NEXT_PUBLIC_APP_NAME} Tokens`)}</p>
            <div className="mt-2 flex justify-between rounded-lg bg-[#000000] px-5 py-3 text-[13px] text-white h-[46px]" ref={SaveTriggerRef}>
              {t('Balance')}
              <span className="text-[#FFFF33] font-light text-[15px] font-normal" ref={SaveTargetRef} data-from="0" data-to={balance}>0</span>
            </div>
            {/* Average Holding Period with History Table */}
            <div className="mt-2 rounded-lg bg-[#000000] px-5 py-3 text-[13px] text-white relative">
              {/* Loading Overlay */}
              {(isRealtimeUpdating || wsUpdating) && (
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
                  <div className="flex flex-col items-center gap-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FFB84D]"></div>
                    <span className="text-[#FFB84D] text-[13px] font-medium">Updating holding data...</span>
                  </div>
                </div>
              )}

              <div className="flex justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span>Average Hold Duration</span>
                  <button
                    onClick={() => setShowExplainer(true)}
                    className="text-[#3b82f6] hover:text-[#60a5fa] transition-colors text-[16px]"
                    title="Learn how holding duration is calculated"
                  >
                    ℹ️
                  </button>
                </div>

                {parseFloat(balance || '0') > 0 ?
                  <div>
                    <span className="text-[#FFFF33] font-light text-[15px] font-normal">
                      {averageTokenHoldingPeriod.days} <span className="text-white font-light">days &nbsp;</span>
                    </span>
                    <span className="text-[#FFFF33] font-light text-[15px] font-normal">
                      {averageTokenHoldingPeriod.hours} <span className="text-white font-light">hrs &nbsp;</span>
                    </span>
                  </div>
                  : <div>
                    <span className="text-[#FFFF33] font-light text-[15px] font-normal">
                      {'--'} <span className="text-white font-light">days &nbsp;</span>
                    </span>
                    <span className="text-[#FFFF33] font-light text-[15px] font-normal">
                      {'--'} <span className="text-white font-light">hrs &nbsp;</span>
                    </span>
                  </div>}
              </div>

              {/* History Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-t border-[#666666]">
                      <th className="text-left py-3 px-1 text-[13px] font-light text-[#FFB84D]">Hold Start (UTC)</th>
                      <th className="text-left py-3 px-1 text-[13px] font-light text-[#FFB84D]">Amount</th>
                      <th className="text-right py-3 px-1 text-[13px] font-light text-[#FFB84D]">Hold Duration</th>
                    </tr>
                  </thead>
                  {holdDateHistory.length > 0 && (
                    <tbody>
                      {holdDateHistory.map((record) => (
                        <tr key={record.id} className="border-[#666666]">
                          <td className="py-3 px-1 text-[13px] text-[#FFFF33]">{record.holdStart}</td>
                          <td className="py-3 px-1 text-[13px] text-[#FFFF33]">{record.amount}</td>
                          <td className="py-3 px-1 text-[13px] text-[#FFFF33] text-right">{record.holdDuration}</td>
                        </tr>
                      ))}
                    </tbody>
                  )}
                  {holdDateHistory.length === 0 && (
                    <tbody>
                      <tr>
                        <td colSpan={3} className="py-5 px-1 text-[13px] text-[#666666] text-center font-normal">No holding data</td>
                      </tr>
                    </tbody>
                  )}
                </table>
              </div>
            </div>
            {/* Current Sell Fee */}
            <div className="mt-2 flex justify-between rounded-lg bg-[#000000] px-5 py-3 text-[13px] text-white h-[46px]">
              <span>Current Sell Fee</span>
              <span className="text-[#FFFF33] font-light text-[15px] font-normal">
                {parseFloat(balance || '0') > 0 ? `${currentSellFee}` : '--'}<span className="text-white font-light text-[13px]">%</span>
              </span>
            </div>
            <p className="text-[13px] mt-2 font-normal text-right p-1">
              Last updated: {lastUpdatedTime || '--'}
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        {address && (
          <div className="mt-5 flex gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('wallet')}
              className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-colors whitespace-nowrap ${
                activeTab === 'wallet'
                  ? 'bg-[#FFB84D] text-black'
                  : 'bg-secondary text-white border border-[#666666] hover:border-[#FFB84D]'
              }`}
            >
              💼 Wallet Info
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-colors whitespace-nowrap ${
                activeTab === 'transactions'
                  ? 'bg-[#FFB84D] text-black'
                  : 'bg-secondary text-white border border-[#666666] hover:border-[#FFB84D]'
              }`}
            >
              📋 Transactions
            </button>
            <button
              onClick={() => setActiveTab('fifo')}
              className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-colors whitespace-nowrap ${
                activeTab === 'fifo'
                  ? 'bg-[#FFB84D] text-black'
                  : 'bg-secondary text-white border border-[#666666] hover:border-[#FFB84D]'
              }`}
            >
              📊 FIFO Queue
            </button>
          </div>
        )}

        {/* Tab Content */}
        {address && activeTab === 'transactions' && (
          <TransactionHistory walletAddress={address} />
        )}

        {address && activeTab === 'fifo' && (
          <div className="mt-5">
            <FIFOTable walletAddress={address} />
          </div>
        )}

        {/* Holding Date Explainer Modal */}
        {address && (
          <HoldingDateExplainer
            walletAddress={address}
            isOpen={showExplainer}
            onClose={() => setShowExplainer(false)}
          />
        )}

        {/* WebSocket Connection Status Indicator (Development Only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed bottom-4 right-4 z-50 rounded-lg bg-gray-900/90 px-3 py-2 text-xs text-white shadow-lg">
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span>{wsConnected ? 'WS Connected' : 'WS Disconnected'}</span>
              {lastUpdate && (
                <span className="ml-2 text-gray-400">
                  | {lastUpdate.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>

  );
};
export default Wallet;
