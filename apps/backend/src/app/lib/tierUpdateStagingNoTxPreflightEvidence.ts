import type {
  OperatorControlledReceiptReconciliationEvidence
} from './tierUpdateReceiptReconciliationEvidence';

type StagingNoTxPreflightEvidenceStatus =
  | 'BLOCKED'
  | 'EVIDENCE_READY'
  | 'NEEDS_REVIEW';

type SafePresenceSummary = {
  provided: boolean;
  safeSummaryOnly: true;
};

type StagingNoTxOperationEvidence = {
  fundedTx?: boolean;
  mint?: boolean;
  sendToWallet?: boolean;
  governanceTx?: boolean;
  tierUpdaterTx?: boolean;
  deploy?: boolean;
  stagingRollout?: boolean;
};

type StagingNoTxChecks = {
  noTxExecution: boolean;
  noFundedTx: boolean;
  noMint: boolean;
  noSendToWallet: boolean;
  noGovernanceTx: boolean;
  noTierUpdaterTx: boolean;
  noDeploy: boolean;
  noStagingRollout: boolean;
  noRpcUrlEnvReading: boolean;
  noProviderConstruction: boolean;
  noWalletConstruction: boolean;
  noContractConstruction: boolean;
  noAutoStart: boolean;
  noCronWiring: boolean;
  noMainAutoStart: boolean;
  noTrackingServiceAutoStart: boolean;
  safeOutputOnly: boolean;
};

export type BuildTierUpdateStagingNoTxPreflightEvidenceInput = {
  operatorEvidence?: OperatorControlledReceiptReconciliationEvidence;
  now?: Date;
  sourceHeadSha?: string;
  runId?: string | number;
  executedOperations?: StagingNoTxOperationEvidence;
  logger?: {
    warn?: (message: string, metadata?: Record<string, unknown>) => void;
  };
};

export type TierUpdateStagingNoTxPreflightEvidence = {
  evidenceKind: 'tier_update_staging_no_tx_preflight_evidence';
  status: StagingNoTxPreflightEvidenceStatus;
  readinessClaim: 'none';
  stagingNoTxPreflightStatus: 'BLOCKED';
  sourceHeadSha: string | null;
  runIdSummary: SafePresenceSummary;
  evaluatedAt: string | null;
  checks: StagingNoTxChecks;
  missingEvidence: string[];
  blockers: string[];
  safeSummaryOnly: true;
};

const SHA_PATTERN = /^[a-f0-9]{40}$/i;

const safePresenceSummary = (value: unknown): SafePresenceSummary => ({
  provided: typeof value === 'string'
    ? value.trim().length > 0
    : value !== undefined && value !== null,
  safeSummaryOnly: true
});

const safeHeadSha = (value: string | undefined): string | null => (
  typeof value === 'string' && SHA_PATTERN.test(value) ? value : null
);

const isOperationAbsent = (
  evidence: StagingNoTxOperationEvidence | undefined,
  key: keyof StagingNoTxOperationEvidence
): boolean => evidence?.[key] !== true;

const buildChecks = (
  operatorEvidence: OperatorControlledReceiptReconciliationEvidence | undefined,
  executedOperations: StagingNoTxOperationEvidence | undefined
): StagingNoTxChecks => ({
  noTxExecution: operatorEvidence?.noTxExecution === true,
  noFundedTx: isOperationAbsent(executedOperations, 'fundedTx'),
  noMint: isOperationAbsent(executedOperations, 'mint'),
  noSendToWallet: isOperationAbsent(executedOperations, 'sendToWallet'),
  noGovernanceTx: isOperationAbsent(executedOperations, 'governanceTx'),
  noTierUpdaterTx: isOperationAbsent(executedOperations, 'tierUpdaterTx'),
  noDeploy: isOperationAbsent(executedOperations, 'deploy'),
  noStagingRollout: isOperationAbsent(executedOperations, 'stagingRollout'),
  noRpcUrlEnvReading: operatorEvidence?.noRpcUrlEnvReading === true,
  noProviderConstruction: operatorEvidence?.noProviderConstruction === true,
  noWalletConstruction: operatorEvidence?.noWalletConstruction === true,
  noContractConstruction: operatorEvidence?.noContractConstruction === true,
  noAutoStart: operatorEvidence?.noAutoStart === true,
  noCronWiring: operatorEvidence?.noCronWiring === true,
  noMainAutoStart: operatorEvidence?.noMainAutoStart === true,
  noTrackingServiceAutoStart: operatorEvidence?.noTrackingServiceAutoStart === true,
  safeOutputOnly: operatorEvidence?.safeSummaryOnly === true
});

const collectFalseChecks = (checks: StagingNoTxChecks): string[] => (
  Object.entries(checks)
    .filter(([, value]) => value !== true)
    .map(([key]) => key)
);

const collectEvidenceBlockers = (
  operatorEvidence: OperatorControlledReceiptReconciliationEvidence | undefined
): string[] => {
  const blockers: string[] = [];

  if (operatorEvidence === undefined) {
    blockers.push('operator_evidence_missing');
    return blockers;
  }

  if (operatorEvidence.evidenceKind !== 'operator_controlled_receipt_reconciliation_dry_run') {
    blockers.push('operator_evidence_kind_unexpected');
  }

  if (operatorEvidence.dryRun !== true) {
    blockers.push('operator_evidence_not_dry_run');
  }

  if (operatorEvidence.readinessClaim !== 'none') {
    blockers.push('readiness_claim_present');
  }

  if (operatorEvidence.stagingNoTxPreflightStatus !== 'BLOCKED') {
    blockers.push('staging_no_tx_status_not_blocked');
  }

  if (operatorEvidence.resultStatus === 'fail') {
    blockers.push('operator_evidence_failed');
  }

  return blockers;
};

const collectMissingEvidence = (
  input: BuildTierUpdateStagingNoTxPreflightEvidenceInput,
  sourceHeadSha: string | null
): string[] => {
  const missing: string[] = [];

  if (sourceHeadSha === null) {
    missing.push('source_head_sha');
  }

  if (input.runId === undefined || input.runId === null || String(input.runId).trim().length === 0) {
    missing.push('run_id');
  }

  if (input.operatorEvidence === undefined) {
    missing.push('operator_evidence');
  }

  return missing;
};

const classifyStatus = (
  blockers: string[],
  missingEvidence: string[],
  operatorEvidence: OperatorControlledReceiptReconciliationEvidence | undefined
): StagingNoTxPreflightEvidenceStatus => {
  if (blockers.length > 0) {
    return 'BLOCKED';
  }

  if (missingEvidence.length > 0 || operatorEvidence?.resultStatus === 'skipped') {
    return 'NEEDS_REVIEW';
  }

  return 'EVIDENCE_READY';
};

export const buildTierUpdateStagingNoTxPreflightEvidence = (
  input: BuildTierUpdateStagingNoTxPreflightEvidenceInput
): TierUpdateStagingNoTxPreflightEvidence => {
  const sourceHeadSha = safeHeadSha(input.sourceHeadSha);
  const checks = buildChecks(input.operatorEvidence, input.executedOperations);
  const blockers = [
    ...collectFalseChecks(checks),
    ...collectEvidenceBlockers(input.operatorEvidence)
  ];
  const missingEvidence = collectMissingEvidence(input, sourceHeadSha);
  const status = classifyStatus(blockers, missingEvidence, input.operatorEvidence);

  if (status !== 'EVIDENCE_READY') {
    input.logger?.warn?.('tier_update_staging_no_tx_evidence_not_ready', {
      status,
      blockerCount: blockers.length,
      missingEvidenceCount: missingEvidence.length,
      safeSummaryOnly: true
    });
  }

  return {
    evidenceKind: 'tier_update_staging_no_tx_preflight_evidence',
    status,
    readinessClaim: 'none',
    stagingNoTxPreflightStatus: 'BLOCKED',
    sourceHeadSha,
    runIdSummary: safePresenceSummary(input.runId),
    evaluatedAt: input.now instanceof Date ? input.now.toISOString() : null,
    checks,
    missingEvidence,
    blockers,
    safeSummaryOnly: true
  };
};
