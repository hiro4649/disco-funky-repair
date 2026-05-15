import React from 'react';
import { TransactionType, TransactionBadgeConfigs } from '@/types/transaction';

interface TransactionBadgeProps {
  type: TransactionType;
  showTooltip?: boolean;
}

const TRANSACTION_BADGES: TransactionBadgeConfigs = {
  PURCHASE: {
    icon: '💰',
    label: 'Purchase',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.1)',
  },
  SALE: {
    icon: '💸',
    label: 'Sale',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.1)',
  },
  SWAP_IN: {
    icon: '🔄',
    label: 'Swap In',
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.1)',
  },
  SWAP_OUT: {
    icon: '🔄',
    label: 'Swap Out',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.1)',
  },
  LP_ADD: {
    icon: '💧',
    label: 'LP Add',
    color: '#8b5cf6',
    bgColor: 'rgba(139, 92, 246, 0.1)',
  },
  LP_REMOVE: {
    icon: '💧',
    label: 'LP Remove',
    color: '#ec4899',
    bgColor: 'rgba(236, 72, 153, 0.1)',
  },
  AIRDROP: {
    icon: '🎁',
    label: 'Airdrop',
    color: '#14b8a6',
    bgColor: 'rgba(20, 184, 166, 0.1)',
  },
  INTERNAL_TRANSFER: {
    icon: '🔁',
    label: 'Internal',
    color: '#6b7280',
    bgColor: 'rgba(107, 114, 128, 0.1)',
  },
  CONTRACT_INTERACTION: {
    icon: '📝',
    label: 'Contract',
    color: '#a855f7',
    bgColor: 'rgba(168, 85, 247, 0.1)',
  },
  UNKNOWN: {
    icon: '❓',
    label: 'Unknown',
    color: '#9ca3af',
    bgColor: 'rgba(156, 163, 175, 0.1)',
  },
};

export const TransactionBadge: React.FC<TransactionBadgeProps> = ({
  type,
  showTooltip = false,
}) => {
  const badge = TRANSACTION_BADGES[type] || TRANSACTION_BADGES.UNKNOWN;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '600',
        color: badge.color,
        backgroundColor: badge.bgColor,
        border: `1px solid ${badge.color}`,
      }}
      title={showTooltip ? badge.label : undefined}
    >
      <span>{badge.icon}</span>
      <span>{badge.label}</span>
    </span>
  );
};