"use client";
import React, { useEffect, useState } from 'react';
import { getFIFOSnapshot } from '@/services/transactionService';
import { FIFOQueueItem } from '@/types/transaction';

interface FIFOTableProps {
  walletAddress: string;
}

const FIFOTable: React.FC<FIFOTableProps> = ({ walletAddress }) => {
  const [fifoData, setFifoData] = useState<{
    currentHoldingDate: number;
    totalActiveTokens: number;
    fifoQueue: FIFOQueueItem[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (walletAddress) {
      fetchFIFOData();
    }
  }, [walletAddress]);

  const fetchFIFOData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getFIFOSnapshot(walletAddress);
      if (response.success) {
        setFifoData({
          currentHoldingDate: response.data.currentHoldingDate,
          totalActiveTokens: response.data.totalActiveTokens,
          fifoQueue: response.data.fifoQueue,
        });
      }
    } catch (err) {
      console.error('Error fetching FIFO data:', err);
      setError('Failed to load FIFO data');
    } finally {
      setLoading(false);
    }
  };

  const calculateWeightPercentage = (amount: number, totalTokens: number) => {
    if (totalTokens === 0) return 0;
    return (amount / totalTokens) * 100;
  };

  const getWeightBar = (percentage: number) => {
    const blocks = Math.round(percentage / 20); // 5 blocks for 100%
    return '█'.repeat(blocks) + '░'.repeat(5 - blocks);
  };

  const shortenTxHash = (hash: string) => {
    return `${hash.substring(0, 6)}...${hash.substring(hash.length - 4)}`;
  };

  if (loading) {
    return (
      <div className="bg-[#000000] rounded-lg px-5 py-8 text-center text-gray-400">
        Loading FIFO data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#000000] rounded-lg px-5 py-8 text-center text-red-400">
        {error}
      </div>
    );
  }

  if (!fifoData || fifoData.fifoQueue.length === 0) {
    return (
      <div className="bg-[#000000] rounded-lg px-5 py-8 text-center text-gray-400">
        No active holdings in FIFO queue
      </div>
    );
  }

  return (
    <div className="bg-[#000000] rounded-lg px-5 py-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white font-semibold text-[15px]">
          📊 Active Holdings (FIFO Queue)
        </h3>
        <span className="text-[#FFFF33] text-[13px]">
          Total: {fifoData.totalActiveTokens.toLocaleString()} tokens
        </span>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-t border-b border-[#666666]">
              <th className="text-left py-3 px-2 text-[13px] font-light text-[#FFB84D]">
                Date
              </th>
              <th className="text-right py-3 px-2 text-[13px] font-light text-[#FFB84D]">
                Amount
              </th>
              <th className="text-right py-3 px-2 text-[13px] font-light text-[#FFB84D]">
                Days
              </th>
              <th className="text-left py-3 px-2 text-[13px] font-light text-[#FFB84D]">
                Weight
              </th>
              <th className="text-right py-3 px-2 text-[13px] font-light text-[#FFB84D]">
                Contribution
              </th>
              <th className="text-center py-3 px-2 text-[13px] font-light text-[#FFB84D]">
                Tx
              </th>
            </tr>
          </thead>
          <tbody>
            {fifoData.fifoQueue.map((item, index) => {
              const weightPercentage = calculateWeightPercentage(
                item.amount,
                fifoData.totalActiveTokens
              );
              return (
                <tr
                  key={index}
                  className="border-b border-[#333333] hover:bg-[#1a1a1a] transition-colors"
                >
                  <td className="py-3 px-2 text-[13px] text-[#FFFF33]">
                    {new Date(item.purchaseDate).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="py-3 px-2 text-[13px] text-[#FFFF33] text-right">
                    {item.amount.toLocaleString()}
                  </td>
                  <td className="py-3 px-2 text-[13px] text-[#FFFF33] text-right">
                    {item.daysHeld}d
                  </td>
                  <td className="py-3 px-2 text-[13px] text-[#FFFF33]">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs">
                        {getWeightBar(weightPercentage)}
                      </span>
                      <span className="text-xs opacity-75">
                        {weightPercentage.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-2 text-[13px] text-[#FFFF33] text-right">
                    {item.contributionToAverage.toLocaleString()}
                  </td>
                  <td className="py-3 px-2 text-center">
                    <a
                      href={`https://bscscan.com/tx/${item.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#3b82f6] hover:underline text-xs"
                      title={item.txHash}
                    >
                      🔗
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {fifoData.fifoQueue.map((item, index) => {
          const weightPercentage = calculateWeightPercentage(
            item.amount,
            fifoData.totalActiveTokens
          );
          return (
            <div
              key={index}
              className="bg-[#1a1a1a] rounded-lg p-3 border border-[#333333]"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="text-[#FFFF33] text-[13px]">
                  {new Date(item.purchaseDate).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
                <a
                  href={`https://bscscan.com/tx/${item.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#3b82f6] hover:underline text-xs"
                >
                  View Tx 🔗
                </a>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[12px]">
                <div>
                  <span className="text-gray-400">Amount:</span>
                  <span className="text-[#FFFF33] ml-2">
                    {item.amount.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Days:</span>
                  <span className="text-[#FFFF33] ml-2">{item.daysHeld}d</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-400">Weight:</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono text-xs text-[#FFFF33]">
                      {getWeightBar(weightPercentage)}
                    </span>
                    <span className="text-xs text-[#FFFF33]">
                      {weightPercentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-400">Contribution:</span>
                  <span className="text-[#FFFF33] ml-2">
                    {item.contributionToAverage.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Weighted Average */}
      <div className="mt-4 pt-4 border-t border-[#666666] text-center">
        <span className="text-white font-semibold text-[14px]">
          Weighted Average Hold Duration:{' '}
          <span className="text-[#FFFF33]">{fifoData.currentHoldingDate} days</span>
        </span>
      </div>
    </div>
  );
};

export default FIFOTable;