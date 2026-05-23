"use client";
import React, { useState, useEffect } from 'react';
import { getHoldingDateExplanation } from '@/services/transactionService';
import { HoldingDateExplanation } from '@/types/transaction';

interface HoldingDateExplainerProps {
  walletAddress: string;
  isOpen: boolean;
  onClose: () => void;
}

const HoldingDateExplainer: React.FC<HoldingDateExplainerProps> = ({
  walletAddress,
  isOpen,
  onClose,
}) => {
  const [data, setData] = useState<HoldingDateExplanation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && walletAddress) {
      fetchExplanation();
    }
  }, [isOpen, walletAddress]);

  const fetchExplanation = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getHoldingDateExplanation(walletAddress);
      if (response.success) {
        setData(response.data);
      }
    } catch (err) {
      console.error('Error fetching explanation:', err);
      setError('Failed to load holding date explanation');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-auto bg-[#1f2937] rounded-xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl transition-colors"
        >
          ✕
        </button>

        {/* Header */}
        <h2 className="text-2xl font-bold text-white mb-4">
          📖 How is my holding duration calculated?
        </h2>

        {loading && (
          <div className="text-center py-8 text-gray-400">Loading...</div>
        )}

        {error && (
          <div className="text-center py-8 text-red-400">{error}</div>
        )}

        {!loading && !error && data && (
          <>
            <p className="text-gray-300 mb-6 text-sm leading-relaxed">
              Your holding duration is calculated using the{' '}
              <strong className="text-white">FIFO (First In, First Out)</strong> method.
              This means that when you sell tokens, the oldest purchases are sold first.
            </p>

            {/* Transaction Summary */}
            <div className="bg-[#374151] rounded-lg p-4 mb-6">
              <h3 className="text-white font-semibold mb-3 text-lg">
                Transaction Summary
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2 text-gray-300">
                  <span className="text-green-400">✓</span>
                  <span>
                    Total Transactions:{' '}
                    <strong className="text-white">
                      {data.totalTransactions}
                    </strong>
                  </span>
                </li>
                <li className="flex items-start gap-2 text-gray-300">
                  <span className="text-green-400">✓</span>
                  <span>
                    Purchases:{' '}
                    <strong className="text-white">
                      {data.breakdown.purchases}
                    </strong>{' '}
                    transactions
                  </span>
                </li>
                <li className="flex items-start gap-2 text-gray-300">
                  <span className="text-green-400">✓</span>
                  <span>
                    Sales:{' '}
                    <strong className="text-white">{data.breakdown.sales}</strong>{' '}
                    transactions
                  </span>
                </li>
                <li className="flex items-start gap-2 text-gray-300">
                  <span className="text-green-400">✓</span>
                  <span>
                    Active Holdings:{' '}
                    <strong className="text-white">{data.activePurchases}</strong>{' '}
                    purchases
                  </span>
                </li>
                <li className="flex items-start gap-2 text-gray-300">
                  <span className="text-green-400">✓</span>
                  <span>
                    LP Operations:{' '}
                    <strong className="text-white">
                      {data.breakdown.lpOperations}
                    </strong>
                  </span>
                </li>
                <li className="flex items-start gap-2 text-gray-300">
                  <span className="text-green-400">✓</span>
                  <span>
                    Ignored:{' '}
                    <strong className="text-white">{data.breakdown.ignored}</strong>{' '}
                    (internal transfers)
                  </span>
                </li>
              </ul>
            </div>

            {/* Active Purchases (FIFO Queue) */}
            <h3 className="text-white font-semibold mb-3 text-lg">
              Active Purchases (FIFO Queue)
            </h3>

            {data.fifoSnapshot.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No active purchases found
              </div>
            ) : (
              <div className="space-y-3 mb-6">
                {data.fifoSnapshot.map((purchase, index) => {
                  const contribution = purchase.amount * purchase.daysHeld;
                  return (
                    <div
                      key={index}
                      className="bg-[#374151] rounded-lg p-4 hover:bg-[#4b5563] transition-colors"
                    >
                      <div className="text-white mb-2 font-semibold">
                        {index + 1}. {purchase.amount.toLocaleString()} tokens ×{' '}
                        {purchase.daysHeld} days ={' '}
                        <span className="text-[#FFFF33]">
                          {contribution.toLocaleString()}
                        </span>
                      </div>
                      <div className="text-gray-400 text-xs">
                        Purchased:{' '}
                        {new Date(purchase.purchaseDate).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                      <div className="text-gray-500 text-xs font-mono mt-1">
                        TX: {purchase.txHash.substring(0, 10)}...
                        {purchase.txHash.substring(purchase.txHash.length - 8)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Calculation Explanation */}
            {data.fifoSnapshot.length > 0 && (
              <div className="bg-[#374151] rounded-lg p-4 mb-6">
                <h3 className="text-white font-semibold mb-3 text-lg">
                  Calculation:
                </h3>
                <div className="space-y-2 text-sm text-gray-300">
                  <div className="flex justify-between">
                    <span>Total Weight:</span>
                    <span className="text-white font-semibold">
                      {data.fifoSnapshot
                        .reduce(
                          (sum, p) => sum + p.amount * p.daysHeld,
                          0
                        )
                        .toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Tokens:</span>
                    <span className="text-white font-semibold">
                      {data.fifoSnapshot
                        .reduce((sum, p) => sum + p.amount, 0)
                        .toLocaleString()}
                    </span>
                  </div>
                  <div className="border-t border-gray-600 pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span>Average:</span>
                      <span className="text-white font-semibold">
                        {data.fifoSnapshot.reduce((sum, p) => sum + p.amount * p.daysHeld, 0)} ÷{' '}
                        {data.fifoSnapshot.reduce((sum, p) => sum + p.amount, 0)} ={' '}
                        {(
                          data.fifoSnapshot.reduce(
                            (sum, p) => sum + p.amount * p.daysHeld,
                            0
                          ) / data.fifoSnapshot.reduce((sum, p) => sum + p.amount, 0)
                        ).toFixed(2)}{' '}
                        days
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Current Holding Date */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-5 text-center">
              <div className="text-sm mb-1 opacity-90">Current Holding Date</div>
              <div className="text-3xl font-bold">
                {data.currentHoldingDate} days
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HoldingDateExplainer;