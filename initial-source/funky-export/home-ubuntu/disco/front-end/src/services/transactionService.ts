import apiClient from '../../utils/apiClient';
import {
  TransactionHistoryResponse,
  HoldingDateExplainerResponse,
  FIFOSnapshotResponse,
  TransactionDetailResponse,
  TransactionType,
  FIFOImpact,
} from '@/types/transaction';

/**
 * Get transaction history for a wallet address
 */
export const getTransactionHistory = async (
  walletAddress: string,
  page: number = 1,
  limit: number = 50,
  type?: TransactionType,
  fifoImpact?: FIFOImpact
): Promise<TransactionHistoryResponse> => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (type) params.append('type', type);
    if (fifoImpact) params.append('fifoImpact', fifoImpact);

    const response = await apiClient.get(
      `/transaction-history/${walletAddress}?${params.toString()}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    throw error;
  }
};

/**
 * Get explanation for holding date calculation
 */
export const getHoldingDateExplanation = async (
  walletAddress: string
): Promise<HoldingDateExplainerResponse> => {
  try {
    const response = await apiClient.get(
      `/holding-date/explain/${walletAddress}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching holding date explanation:', error);
    throw error;
  }
};

/**
 * Get FIFO snapshot for a wallet address
 */
export const getFIFOSnapshot = async (
  walletAddress: string
): Promise<FIFOSnapshotResponse> => {
  try {
    const response = await apiClient.get(`/fifo-snapshot/${walletAddress}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching FIFO snapshot:', error);
    throw error;
  }
};

/**
 * Get transaction details by transaction hash
 */
export const getTransactionDetail = async (
  txHash: string
): Promise<TransactionDetailResponse> => {
  try {
    const response = await apiClient.get(`/transaction/${txHash}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching transaction detail:', error);
    throw error;
  }
};

/**
 * Get transaction types reference
 */
export const getTransactionTypes = async () => {
  try {
    const response = await apiClient.get('/transaction-types');
    return response.data;
  } catch (error) {
    console.error('Error fetching transaction types:', error);
    throw error;
  }
};