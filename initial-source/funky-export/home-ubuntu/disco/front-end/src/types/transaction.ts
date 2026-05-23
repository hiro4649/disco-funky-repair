export type TransactionType =
  | 'PURCHASE'
  | 'SALE'
  | 'SWAP_IN'
  | 'SWAP_OUT'
  | 'LP_ADD'
  | 'LP_REMOVE'
  | 'AIRDROP'
  | 'INTERNAL_TRANSFER'
  | 'CONTRACT_INTERACTION'
  | 'UNKNOWN';

export type FIFOImpact = 'INCREASE' | 'DECREASE' | 'NEUTRAL' | 'IGNORE';

export interface Transaction {
  id: number;
  tx_hash: string;
  from_address: string;
  to_address: string;
  amount: number;
  transaction_type: TransactionType;
  fifo_impact: FIFOImpact;
  classification_reason: string;
  metadata?: Record<string, any>;
  block_number: number;
  transaction_date: string;
  processed_at: string;
}

export interface TransactionSummary {
  total: number;
  byType: {
    PURCHASE: number;
    SALE: number;
    SWAP_IN: number;
    SWAP_OUT: number;
    LP_ADD: number;
    LP_REMOVE: number;
    AIRDROP: number;
    INTERNAL_TRANSFER: number;
  };
  byFIFOImpact: {
    INCREASE: number;
    DECREASE: number;
    IGNORE: number;
  };
}

export interface TransactionHistoryResponse {
  success: boolean;
  data: {
    transactions: Transaction[];
    summary: TransactionSummary;
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface FIFOPurchase {
  purchaseDate: string;
  amount: number;
  daysHeld: number;
  txHash: string;
}

export interface HoldingDateExplanation {
  currentHoldingDate: number;
  activePurchases: number;
  totalTransactions: number;
  breakdown: {
    purchases: number;
    sales: number;
    lpOperations: number;
    airdrops: number;
    ignored: number;
  };
  fifoSnapshot: FIFOPurchase[];
}

export interface HoldingDateExplainerResponse {
  success: boolean;
  data: HoldingDateExplanation;
}

export interface FIFOQueueItem {
  txHash: string;
  purchaseDate: string;
  amount: number;
  daysHeld: number;
  contributionToAverage: number;
}

export interface FIFOSnapshotResponse {
  success: boolean;
  data: {
    currentHoldingDate: number;
    calculatedAverage: number;
    totalActiveTokens: number;
    activePurchases: number;
    fifoQueue: FIFOQueueItem[];
  };
}

export interface TransactionDetailResponse {
  success: boolean;
  data: Transaction & {
    user: {
      wallet_address: string;
      holdingDate: number;
    };
  };
}

export interface TransactionTypeBadgeConfig {
  icon: string;
  label: string;
  color: string;
  bgColor: string;
}

export type TransactionBadgeConfigs = Record<TransactionType, TransactionTypeBadgeConfig>;