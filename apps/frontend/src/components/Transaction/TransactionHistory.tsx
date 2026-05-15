"use client";
import React, { useState, useEffect } from 'react';
import { TransactionBadge } from './TransactionBadge';
import TransactionDetailModal from './TransactionDetailModal';
import { getTransactionHistory } from '@/services/transactionService';
import { Transaction, TransactionSummary, TransactionType } from '@/types/transaction';

interface TransactionHistoryProps {
  walletAddress: string;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  walletAddress,
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<TransactionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedTxHash, setSelectedTxHash] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (walletAddress) {
      fetchTransactions();
    }
  }, [walletAddress, filter, page]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const filterType = filter !== 'ALL' ? (filter as TransactionType) : undefined;
      const response = await getTransactionHistory(
        walletAddress,
        page,
        50,
        filterType
      );

      if (response.success) {
        setTransactions(response.data.transactions);
        setSummary(response.data.summary);
        setTotalPages(response.data.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setTransactions([]);
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
    return `${sign}${amount.toLocaleString()} tokens`;
  };

  const handleViewDetails = (txHash: string) => {
    setSelectedTxHash(txHash);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTxHash(null);
  };

  return (
    <div className="mt-5 bg-secondary px-3.5 py-5 rounded-[8px] border-y-[0.5px] border-y-[#666666]">
      {/* Header with Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
        <h2 className="text-white text-[18px] font-semibold">
          📋 Transaction History
        </h2>

        <select
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            setPage(1); // Reset to first page when filter changes
          }}
          className="px-3 py-2 rounded-lg bg-[#000000] text-white text-[13px] border border-[#666666] focus:outline-none focus:border-[#FFB84D]"
        >
          <option value="ALL">All Transactions ({summary?.total || 0})</option>
          <option value="PURCHASE">💰 Purchases ({summary?.byType?.PURCHASE || 0})</option>
          <option value="SALE">💸 Sales ({summary?.byType?.SALE || 0})</option>
          <option value="SWAP_IN">🔄 Swaps In ({summary?.byType?.SWAP_IN || 0})</option>
          <option value="SWAP_OUT">🔄 Swaps Out ({summary?.byType?.SWAP_OUT || 0})</option>
          <option value="LP_ADD">💧 LP Add ({summary?.byType?.LP_ADD || 0})</option>
          <option value="LP_REMOVE">💧 LP Remove ({summary?.byType?.LP_REMOVE || 0})</option>
          <option value="AIRDROP">🎁 Airdrops ({summary?.byType?.AIRDROP || 0})</option>
        </select>
      </div>

      {/* Summary Stats */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <div className="bg-[#000000] rounded-lg px-3 py-2 border border-[#666666]">
            <div className="text-gray-400 text-[11px] mb-1">Total</div>
            <div className="text-white font-semibold text-[15px]">
              {summary.total}
            </div>
          </div>
          <div className="bg-[#000000] rounded-lg px-3 py-2 border border-[#666666]">
            <div className="text-gray-400 text-[11px] mb-1">Purchases</div>
            <div className="text-green-400 font-semibold text-[15px]">
              {summary.byType.PURCHASE}
            </div>
          </div>
          <div className="bg-[#000000] rounded-lg px-3 py-2 border border-[#666666]">
            <div className="text-gray-400 text-[11px] mb-1">Sales</div>
            <div className="text-red-400 font-semibold text-[15px]">
              {summary.byType.SALE}
            </div>
          </div>
          <div className="bg-[#000000] rounded-lg px-3 py-2 border border-[#666666]">
            <div className="text-gray-400 text-[11px] mb-1">DEX Swaps</div>
            <div className="text-blue-400 font-semibold text-[15px]">
              {(summary.byType.SWAP_IN || 0) + (summary.byType.SWAP_OUT || 0)}
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12 text-gray-400">
          Loading transactions...
        </div>
      )}

      {/* Transaction List */}
      {!loading && transactions.length > 0 && (
        <div className="space-y-3">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="bg-[#000000] rounded-lg p-4 border border-[#666666] hover:border-[#FFB84D] transition-colors"
            >
              {/* Header Row */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                <TransactionBadge type={tx.transaction_type} />
                <span className="text-gray-400 text-[12px]">
                  {new Date(tx.transaction_date).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              {/* Amount */}
              <div
                className="text-[18px] font-semibold mb-2"
                style={{
                  color:
                    tx.fifo_impact === 'INCREASE'
                      ? '#10b981'
                      : tx.fifo_impact === 'DECREASE'
                        ? '#ef4444'
                        : '#9ca3af',
                }}
              >
                {formatAmount(tx.amount, tx.fifo_impact)}
              </div>

              {/* Classification Reason */}
              <div className="text-gray-300 text-[13px] mb-3 leading-relaxed">
                {tx.classification_reason}
              </div>

              {/* Footer Row */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-3 border-t border-[#333333]">
                <span className="text-gray-400 text-[12px]">
                  Impact: {getImpactIcon(tx.fifo_impact)} {tx.fifo_impact}
                </span>
                <button
                  onClick={() => handleViewDetails(tx.tx_hash)}
                  className="text-[#3b82f6] hover:text-[#60a5fa] text-[12px] font-medium transition-colors"
                >
                  View Details →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && transactions.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          No transactions found
        </div>
      )}

      {/* Pagination */}
      {!loading && transactions.length > 0 && totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-5 pt-5 border-t border-[#666666]">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg bg-[#000000] text-white text-[13px] border border-[#666666] disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#FFB84D] transition-colors"
          >
            Previous
          </button>
          <span className="text-white text-[13px]">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-lg bg-[#000000] text-white text-[13px] border border-[#666666] disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#FFB84D] transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {/* Transaction Detail Modal */}
      <TransactionDetailModal
        txHash={selectedTxHash}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default TransactionHistory;