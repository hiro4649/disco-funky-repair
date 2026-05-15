"use client";
import React, { useEffect, useState } from 'react';
import { Transaction } from '@/types/transaction';
import { TransactionBadge } from './TransactionBadge';
import { getTransactionDetail } from '@/services/transactionService';

interface TransactionDetailModalProps {
  txHash: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  txHash,
  isOpen,
  onClose,
}) => {
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && txHash) {
      fetchTransactionDetail();
    }
  }, [isOpen, txHash]);

  const fetchTransactionDetail = async () => {
    if (!txHash) return;

    setLoading(true);
    setError(null);
    try {
      const response = await getTransactionDetail(txHash);
      if (response.success) {
        setTransaction(response.data);
      }
    } catch (err) {
      console.error('Error fetching transaction detail:', err);
      setError('Failed to load transaction details');
    } finally {
      setLoading(false);
    }
  };

  const getImpactIcon = (impact: string) => {
    if (impact === 'INCREASE') return '⬆️';
    if (impact === 'DECREASE') return '⬇️';
    if (impact === 'IGNORE') return '⊝';
    return '○';
  };

  const formatAmount = (amount: number, impact: string) => {
    const sign = impact === 'INCREASE' ? '+' : impact === 'DECREASE' ? '-' : '';
    return `${sign}${amount.toLocaleString()}`;
  };

  const shortenAddress = (address: string) => {
    if (!address) return '';
    return `${address.substring(0, 8)}...${address.substring(address.length - 8)}`;
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
        <h2 className="text-2xl font-bold text-white mb-6">
          🔍 Transaction Details
        </h2>

        {loading && (
          <div className="text-center py-8 text-gray-400">
            Loading transaction details...
          </div>
        )}

        {error && (
          <div className="text-center py-8 text-red-400">{error}</div>
        )}

        {!loading && !error && transaction && (
          <div className="space-y-4">
            {/* Transaction Type Badge */}
            <div className="mb-4">
              <TransactionBadge type={transaction.transaction_type} />
            </div>

            {/* Transaction Hash */}
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Transaction Hash:</label>
              <div className="flex items-center justify-between bg-[#000000] rounded-lg px-4 py-3">
                <span className="text-[#FFFF33] text-sm font-mono">
                  {shortenAddress(transaction.tx_hash)}
                </span>
                <a
                  href={`https://bscscan.com/tx/${transaction.tx_hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#3b82f6] text-sm hover:underline"
                >
                  View on BSCScan →
                </a>
              </div>
            </div>

            {/* Date & Time */}
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Date & Time:</label>
              <div className="bg-[#000000] rounded-lg px-4 py-3 text-white text-sm">
                {new Date(transaction.transaction_date).toLocaleString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  timeZoneName: 'short',
                })}
              </div>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Amount:</label>
              <div
                className="bg-[#000000] rounded-lg px-4 py-3 text-lg font-semibold"
                style={{
                  color:
                    transaction.fifo_impact === 'INCREASE'
                      ? '#10b981'
                      : transaction.fifo_impact === 'DECREASE'
                        ? '#ef4444'
                        : '#9ca3af',
                }}
              >
                {formatAmount(transaction.amount, transaction.fifo_impact)} tokens
              </div>
            </div>

            {/* From Address */}
            <div className="space-y-2">
              <label className="text-sm text-gray-400">From:</label>
              <div className="bg-[#000000] rounded-lg px-4 py-3 text-[#FFFF33] text-sm font-mono">
                {transaction.from_address}
              </div>
            </div>

            {/* To Address */}
            <div className="space-y-2">
              <label className="text-sm text-gray-400">To:</label>
              <div className="bg-[#000000] rounded-lg px-4 py-3 text-[#FFFF33] text-sm font-mono">
                {transaction.to_address}
              </div>
            </div>

            {/* Classification */}
            <div className="border-t border-gray-700 pt-4 mt-4">
              <h3 className="text-white font-semibold mb-3">Classification:</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">Type:</span>
                  <span className="text-white">{transaction.transaction_type}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">FIFO Impact:</span>
                  <span className="text-white">
                    {transaction.fifo_impact} {getImpactIcon(transaction.fifo_impact)}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-gray-400">Reason:</span>
                  <span className="text-white flex-1">
                    {transaction.classification_reason}
                  </span>
                </div>
              </div>
            </div>

            {/* FIFO Effect */}
            {transaction.fifo_impact !== 'IGNORE' && (
              <div className="bg-[#374151] rounded-lg p-4">
                <h3 className="text-white font-semibold mb-2">FIFO Effect:</h3>
                <p className="text-sm text-gray-300">
                  {transaction.fifo_impact === 'INCREASE' && (
                    <>
                      ✅ This transaction added {transaction.amount.toLocaleString()}{' '}
                      tokens to your holdings using FIFO method.
                    </>
                  )}
                  {transaction.fifo_impact === 'DECREASE' && (
                    <>
                      ⚠️ This transaction removed{' '}
                      {transaction.amount.toLocaleString()} tokens using FIFO. Oldest
                      purchases were removed first.
                    </>
                  )}
                </p>
              </div>
            )}

            {/* Block Number */}
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Block Number:</label>
              <div className="bg-[#000000] rounded-lg px-4 py-3 text-white text-sm">
                {transaction.block_number.toLocaleString()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionDetailModal;