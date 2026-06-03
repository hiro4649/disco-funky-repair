import {
  createTierUpdateReceiptFetcher,
  type TierUpdateReadOnlyReceiptClient
} from './tierUpdateReceiptFetcher';
import {
  runManualTierUpdateReceiptReconciliation,
  type RunManualTierUpdateReceiptReconciliationResult
} from './tierUpdateReceiptReconciliationManual';
import type { TierUpdateReceiptReconciliationLogger } from './tierUpdateReceiptReconciliationService';
import {
  TIER_UPDATE_RECEIPT_RECONCILIATION_JOB_NAME
} from './tierUpdateReceiptReconciliationJob';
import type { TierUpdateTxStatePrismaClient } from './tierUpdateTxStateService';

type SafeActorSummary = {
  provided: boolean;
  safeSummaryOnly: true;
};

export type RunOperatorControlledTierUpdateReceiptReconciliationInput = {
  prisma: TierUpdateTxStatePrismaClient;
  readOnlyReceiptClient?: TierUpdateReadOnlyReceiptClient;
  now?: Date;
  runKey?: string;
  workerId?: string;
  operatorId?: string;
  limit?: number;
  chainId?: number;
  contractAddress?: string;
  dryRun?: boolean;
  logger?: TierUpdateReceiptReconciliationLogger;
};

export type RunOperatorControlledTierUpdateReceiptReconciliationResult =
  Omit<RunManualTierUpdateReceiptReconciliationResult, 'mode'> & {
    mode: 'operator_controlled';
    operatorSummary: SafeActorSummary;
    workerIdSummary: SafeActorSummary;
  };

const safeActorSummary = (value: string | undefined): SafeActorSummary => ({
  provided: typeof value === 'string' && value.trim().length > 0,
  safeSummaryOnly: true
});

const isMissingText = (value: string | undefined): value is undefined => (
  typeof value !== 'string' || value.trim().length === 0
);

const isMissingChainId = (value: number | undefined): value is undefined => (
  value === undefined || !Number.isInteger(value) || value <= 0
);

const makeSafeFailure = (
  input: RunOperatorControlledTierUpdateReceiptReconciliationInput,
  safeErrorReason: string
): RunOperatorControlledTierUpdateReceiptReconciliationResult => {
  const dryRun = input.dryRun ?? true;
  const checkpointSummary = {
    reason: 'operator_controlled_receipt_reconciliation_failed',
    dryRun,
    scannedCount: 0,
    confirmedCount: 0,
    failedCount: 0,
    pendingCount: 0,
    manualReviewCount: 0,
    skippedCount: 0,
    safeErrorCount: 1,
    stateMutationAttempted: false,
    safeSummaryOnly: true as const,
    safeErrorReason
  };

  return {
    mode: 'operator_controlled',
    jobName: TIER_UPDATE_RECEIPT_RECONCILIATION_JOB_NAME,
    runKey: input.runKey ?? 'missing',
    status: 'failed',
    claimed: false,
    skipped: true,
    reason: checkpointSummary.reason,
    dryRun,
    scannedCount: 0,
    confirmedCount: 0,
    failedCount: 0,
    pendingCount: 0,
    manualReviewCount: 0,
    skippedCount: 0,
    safeErrorCount: 1,
    stateMutationAttempted: false,
    safeSummaryOnly: true,
    safeErrorReason,
    checkpointSummary,
    operatorSummary: safeActorSummary(input.operatorId),
    workerIdSummary: safeActorSummary(input.workerId)
  };
};

export const runOperatorControlledTierUpdateReceiptReconciliation = async (
  input: RunOperatorControlledTierUpdateReceiptReconciliationInput
): Promise<RunOperatorControlledTierUpdateReceiptReconciliationResult> => {
  if (input.readOnlyReceiptClient === undefined) {
    return makeSafeFailure(input, 'read_only_receipt_client_required');
  }

  if (isMissingChainId(input.chainId)) {
    return makeSafeFailure(input, 'chain_id_required');
  }

  if (isMissingText(input.contractAddress)) {
    return makeSafeFailure(input, 'contract_address_required');
  }

  if (isMissingText(input.runKey)) {
    return makeSafeFailure(input, 'run_key_required');
  }

  if (isMissingText(input.workerId)) {
    return makeSafeFailure(input, 'worker_id_required');
  }

  if (isMissingText(input.operatorId)) {
    return makeSafeFailure(input, 'operator_id_required');
  }

  const runKey = input.runKey;
  const workerId = input.workerId;
  const operatorId = input.operatorId;
  const chainId = input.chainId;
  const contractAddress = input.contractAddress;

  const receiptFetcher = createTierUpdateReceiptFetcher({
    readOnlyReceiptClient: input.readOnlyReceiptClient,
    expectedChainId: chainId,
    expectedContractAddress: contractAddress,
    logger: input.logger
  });

  const result = await runManualTierUpdateReceiptReconciliation({
    prisma: input.prisma,
    receiptFetcher,
    now: input.now,
    runKey,
    workerId,
    limit: input.limit,
    chainId,
    contractAddress,
    dryRun: input.dryRun ?? true,
    logger: input.logger
  });

  return {
    ...result,
    mode: 'operator_controlled',
    operatorSummary: safeActorSummary(operatorId),
    workerIdSummary: safeActorSummary(workerId)
  };
};
