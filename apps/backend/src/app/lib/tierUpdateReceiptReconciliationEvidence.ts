import {
  runOperatorControlledTierUpdateReceiptReconciliation,
  type RunOperatorControlledTierUpdateReceiptReconciliationInput
} from './tierUpdateReceiptReconciliationOperator';

type SafePresenceSummary = {
  provided: boolean;
  safeSummaryOnly: true;
};

type SafeContractAddressSummary = SafePresenceSummary & {
  format: 'evm_address' | 'missing_or_invalid';
};

type OperatorReceiptReconciliationEvidenceCounts = {
  scannedCount: number;
  confirmedCount: number;
  failedCount: number;
  pendingCount: number;
  manualReviewCount: number;
  safeErrorCount: number;
};

export type BuildOperatorControlledReceiptReconciliationEvidenceInput =
  RunOperatorControlledTierUpdateReceiptReconciliationInput & {
    dryRun?: boolean;
  };

export type OperatorControlledReceiptReconciliationEvidence = {
  evidenceKind: 'operator_controlled_receipt_reconciliation_dry_run';
  mode: 'operator_controlled';
  dryRun: true;
  noTxExecution: true;
  noRpcUrlEnvReading: true;
  noProviderConstruction: true;
  noWalletConstruction: true;
  noContractConstruction: true;
  noAutoStart: true;
  noCronWiring: true;
  noMainAutoStart: true;
  noTrackingServiceAutoStart: true;
  runKeySummary: SafePresenceSummary;
  workerSummary: SafePresenceSummary;
  operatorSummary: SafePresenceSummary;
  chainId: number | null;
  contractAddressSummary: SafeContractAddressSummary;
  limit: number | null;
  resultStatus: 'pass' | 'fail' | 'skipped';
  jobName: string;
  claimed: boolean;
  skipped: boolean;
  jobRunStatus?: string;
  counts: OperatorReceiptReconciliationEvidenceCounts;
  safeErrorKind: string | null;
  safeSummaryOnly: true;
  readinessClaim: 'none';
  stagingNoTxPreflightStatus: 'BLOCKED';
};

const safePresenceSummary = (value: string | undefined): SafePresenceSummary => ({
  provided: typeof value === 'string' && value.trim().length > 0,
  safeSummaryOnly: true
});

const safeContractAddressSummary = (
  value: string | undefined
): SafeContractAddressSummary => ({
  provided: typeof value === 'string' && value.trim().length > 0,
  format: /^0x[a-fA-F0-9]{40}$/.test(value ?? '') ? 'evm_address' : 'missing_or_invalid',
  safeSummaryOnly: true
});

const mapResultStatus = (
  status: string,
  skipped: boolean,
  safeErrorCount: number
): 'pass' | 'fail' | 'skipped' => {
  if (skipped && safeErrorCount === 0) {
    return 'skipped';
  }

  if (status === 'succeeded' || status === 'SUCCEEDED') {
    return 'pass';
  }

  return 'fail';
};

export const buildOperatorControlledReceiptReconciliationEvidence = async (
  input: BuildOperatorControlledReceiptReconciliationEvidenceInput
): Promise<OperatorControlledReceiptReconciliationEvidence> => {
  const result = await runOperatorControlledTierUpdateReceiptReconciliation({
    ...input,
    dryRun: true
  });

  return {
    evidenceKind: 'operator_controlled_receipt_reconciliation_dry_run',
    mode: 'operator_controlled',
    dryRun: true,
    noTxExecution: true,
    noRpcUrlEnvReading: true,
    noProviderConstruction: true,
    noWalletConstruction: true,
    noContractConstruction: true,
    noAutoStart: true,
    noCronWiring: true,
    noMainAutoStart: true,
    noTrackingServiceAutoStart: true,
    runKeySummary: safePresenceSummary(input.runKey),
    workerSummary: safePresenceSummary(input.workerId),
    operatorSummary: safePresenceSummary(input.operatorId),
    chainId: Number.isInteger(input.chainId) ? input.chainId ?? null : null,
    contractAddressSummary: safeContractAddressSummary(input.contractAddress),
    limit: Number.isInteger(input.limit) ? input.limit ?? null : null,
    resultStatus: mapResultStatus(result.status, result.skipped, result.safeErrorCount),
    jobName: result.jobName,
    claimed: result.claimed,
    skipped: result.skipped,
    jobRunStatus: result.jobRunStatus,
    counts: {
      scannedCount: result.scannedCount,
      confirmedCount: result.confirmedCount,
      failedCount: result.failedCount,
      pendingCount: result.pendingCount,
      manualReviewCount: result.manualReviewCount,
      safeErrorCount: result.safeErrorCount
    },
    safeErrorKind: result.safeErrorReason ?? null,
    safeSummaryOnly: true,
    readinessClaim: 'none',
    stagingNoTxPreflightStatus: 'BLOCKED'
  };
};
