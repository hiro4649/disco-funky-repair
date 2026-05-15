import { ethers } from 'ethers';

export const VALID_TIER_DAYS = [0, 31, 91, 181, 271, 361, 541, 721] as const;

export type TierReasonName =
  | 'REGULAR_SYNC'
  | 'FIFO_DOWNGRADE'
  | 'ZERO_BALANCE_RESET'
  | 'FULL_SELL_RESET'
  | 'WEIGHTED_AVERAGE_DOWNGRADE';

export const TIER_REASON_CODES: Record<TierReasonName, string> = {
  REGULAR_SYNC: ethers.id('REGULAR_SYNC'),
  FIFO_DOWNGRADE: ethers.id('FIFO_DOWNGRADE'),
  ZERO_BALANCE_RESET: ethers.id('ZERO_BALANCE_RESET'),
  FULL_SELL_RESET: ethers.id('FULL_SELL_RESET'),
  WEIGHTED_AVERAGE_DOWNGRADE: ethers.id('WEIGHTED_AVERAGE_DOWNGRADE')
};

export const TIER_UPDATER_ABI = [
  'function syncHoldingDate(address user, uint16 holdingDate, bytes32 batchId)',
  'function syncHoldingDateWithReason(address user, uint16 holdingDate, bytes32 reasonCode, bytes32 batchId)',
  'function holdingDate(address user) view returns (uint16)'
];

export interface TierSyncContext {
  tokenBalance?: number | null;
  holdingDays?: number | null;
  explicitReason?: Exclude<TierReasonName, 'REGULAR_SYNC'>;
}

export interface TierSyncCall {
  method: 'syncHoldingDate' | 'syncHoldingDateWithReason';
  reasonName: TierReasonName;
  reasonCode: string;
}

export const isValidTier = (tier: number): boolean => {
  return VALID_TIER_DAYS.includes(tier as (typeof VALID_TIER_DAYS)[number]);
};

export const getMilestoneTier = (actualDays: number): number => {
  if (actualDays >= 721) return 721;
  if (actualDays >= 541) return 541;
  if (actualDays >= 361) return 361;
  if (actualDays >= 271) return 271;
  if (actualDays >= 181) return 181;
  if (actualDays >= 91) return 91;
  if (actualDays >= 31) return 31;
  return 0;
};

export const getNextTierDays = (currentTier: number): number | null => {
  for (const tier of VALID_TIER_DAYS) {
    if (tier > currentTier) {
      return tier;
    }
  }
  return null;
};

export const createTierBatchId = (source: string, userId: number | string): string => {
  return ethers.id(`${source}:${userId}:${Date.now()}`);
};

export const resolveTierSyncCall = (
  currentContractTier: number,
  targetTier: number,
  context: TierSyncContext = {}
): TierSyncCall => {
  if (!isValidTier(targetTier)) {
    throw new Error(`Invalid tier: ${targetTier}`);
  }

  if (targetTier >= currentContractTier) {
    return {
      method: 'syncHoldingDate',
      reasonName: 'REGULAR_SYNC',
      reasonCode: TIER_REASON_CODES.REGULAR_SYNC
    };
  }

  const reasonName = context.explicitReason
    || (typeof context.tokenBalance === 'number' && context.tokenBalance <= 0
      ? 'ZERO_BALANCE_RESET'
      : targetTier === 0 && typeof context.holdingDays === 'number' && context.holdingDays <= 0
        ? 'FULL_SELL_RESET'
        : 'WEIGHTED_AVERAGE_DOWNGRADE');

  return {
    method: 'syncHoldingDateWithReason',
    reasonName,
    reasonCode: TIER_REASON_CODES[reasonName]
  };
};

export const estimateTierSyncGas = async (
  contract: any,
  userAddress: string,
  targetTier: number,
  batchId: string,
  currentContractTier: number,
  context: TierSyncContext = {}
): Promise<bigint> => {
  const call = resolveTierSyncCall(currentContractTier, targetTier, context);
  if (call.method === 'syncHoldingDateWithReason') {
    return contract.syncHoldingDateWithReason.estimateGas(userAddress, targetTier, call.reasonCode, batchId);
  }
  return contract.syncHoldingDate.estimateGas(userAddress, targetTier, batchId);
};

export const sendTierSyncTransaction = async (
  contract: any,
  userAddress: string,
  targetTier: number,
  batchId: string,
  currentContractTier: number,
  context: TierSyncContext = {},
  txOptions?: any
): Promise<any> => {
  const call = resolveTierSyncCall(currentContractTier, targetTier, context);
  if (call.method === 'syncHoldingDateWithReason') {
    return contract.syncHoldingDateWithReason(userAddress, targetTier, call.reasonCode, batchId, txOptions || {});
  }
  return contract.syncHoldingDate(userAddress, targetTier, batchId, txOptions || {});
};
