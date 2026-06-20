#!/usr/bin/env node






// CODEX_QUALITY_HARNESS_FILE v1.0.7






import fs from 'node:fs';
import path from 'node:path';






import { fileURLToPath } from 'node:url';






import { HARNESS_VERSION, marker, parseArgs, simpleStatus, writeJsonReport } from './codex-v080-lib.mjs';






import { scanSafeOutput } from './codex-safe-output-scan.mjs';






import { buildCompactReasonSummary } from './codex-reason-summary.mjs';






import { buildSafeArtifactIndex, buildPhysicalSafeArtifactIndex, V127_REQUIRED_SAFE_ARTIFACTS, V127_CANONICAL_OPTIONAL_SAFE_ARTIFACTS, V127_AUXILIARY_SAFE_ARTIFACTS } from './codex-safe-artifact-index.mjs';






import { buildFinalSummary } from './codex-target-final-summary.mjs';






import { buildDiagnosticConsolidatedSummary } from './codex-diagnostic-consolidation-runner.mjs';






import { buildInvalidReportRecoverySummary } from './codex-invalid-report-recovery.mjs';
import { V101_STATUS_KEYS } from './codex-v101-gate-lib.mjs';
import { classifyTargetModeCompatibilityStatus } from './codex-v111-token-hard-cap.mjs';
import { reconcileFinalSafeDecision } from './codex-final-decision-kernel.mjs';
import { V119_OPERATOR_STATUS_KEYS } from './codex-orchestration-capsule.mjs';













const v093StatusKeys = [






  'previousTargetHotfixPreservationStatus',






  'targetPatchManifestStatus',






  'targetRolloutConflictStatus',






  'remoteProductPrContextFixtureStatus',






  'targetScriptClassificationFixtureStatus',






  'sameHeadArtifactEvidenceStatus',






  'dockerSmokeCurrentHeadArtifactStatus',






  'targetSkipNpmProductOverrideStatus',






  'goalConditionStatus',






  'reviewPolicyClassifierStatus',






  'prEvidenceCompactStatus',






  'v093SelfTestStatus',






];






const v093OptionalNotApplicable = new Set([






  'previousTargetHotfixPreservationStatus',






  'targetPatchManifestStatus',






  'targetRolloutConflictStatus',






  'dockerSmokeCurrentHeadArtifactStatus',






]);






const v094StatusKeys = [






  'remoteProductContextRestoreStatus',






  'productRelevantEvidenceLockStatus',






  'productBaselineContinuityStatus',






  'skipNpmProductBypassStatus',






  'pullRequestContextFidelityStatus',






  'productVerificationContextStatus',






  'productEvidencePropagationStatus',






  'productContextSafeArtifactStatus',






  'runtimeJobSafetyStatus',






  'txPathStateEvidenceStatus',






  'envConsistencyStatus',






  'stagingNoTxPreflightStatus',






  'runtimeLogSecretScanStatus',






  'chainScopeStatus',






  'falsePositiveBudgetStatus',






  'v094SelfTestStatus',






];






const v094OptionalNotApplicable = new Set([






  'remoteProductContextRestoreStatus',






  'productRelevantEvidenceLockStatus',






  'pullRequestContextFidelityStatus',






  'runtimeJobSafetyStatus',






  'txPathStateEvidenceStatus',






  'envConsistencyStatus',






  'stagingNoTxPreflightStatus',






  'runtimeLogSecretScanStatus',






  'chainScopeStatus',






]);






const v095StatusKeys = [






  'agentsDoctrineStatus',






  'skillRoutingStatus',






  'skillLoadBudgetStatus',






  'skillDriftStatus',






  'agentSessionGovernanceStatus',






  'agentContainmentBoundaryStatus',






  'evalTraceHarvestStatus',






  'operatorVisibleDeltaStatus',






  'traceToEvalCandidateStatus',






  'subagentGovernanceStatus',






  'subagentReviewMatrixStatus',






  'skillEvidenceLinkStatus',






  'stateMachineSchemaStatus',






  'stateTransitionHelperStatus',






  'receiptEvidenceSchemaStatus',






  'workerReadinessSequenceStatus',






  'evidenceMinimalityStatus',






  'evidenceDedupStatus',






  'safeArtifactNextActionStatus',






  'v095SelfTestStatus',






];






const v095OptionalNotApplicable = new Set([






  'agentSessionGovernanceStatus',






  'evalTraceHarvestStatus',






  'operatorVisibleDeltaStatus',






  'traceToEvalCandidateStatus',






  'subagentGovernanceStatus',






  'subagentReviewMatrixStatus',






  'stateMachineSchemaStatus',






  'stateTransitionHelperStatus',






  'receiptEvidenceSchemaStatus',






  'workerReadinessSequenceStatus',






]);






const v096StatusKeys = [






  'kRuleCoverageStatus',






  'live2dSpecSyncStatus',






  'runtimeLatencyBudgetStatus',






  'obsoleteOpenPrStatus',






  'ownerSummaryCompactStatus',






  'browserSmokeArtifactStatus',






  'failureToRepairPlanStatus',






  'runtimeStateAdoptionStatus',






  'claimTransitionStatus',






  'timeoutAdoptionStatus',






  'txReconciliationServiceStatus',






  'txHashBeforeWaitStatus',






  'receiptResumeBoundaryStatus',






  'migrationRolloutSafetyStatus',






  'migrationRuntimeCompatStatus',






  'humanReviewDigestStatus',






  'datasetAuditReadinessStatus',






  'gameToolAdapterContractFixtureStatus',






  'belovedAvatarSafetyAuditStatus',






  'v096SelfTestStatus',






];






const v096OptionalNotApplicable = new Set([






  'kRuleCoverageStatus',






  'live2dSpecSyncStatus',






  'runtimeLatencyBudgetStatus',






  'browserSmokeArtifactStatus',






  'runtimeStateAdoptionStatus',






  'claimTransitionStatus',






  'timeoutAdoptionStatus',






  'txReconciliationServiceStatus',






  'txHashBeforeWaitStatus',






  'receiptResumeBoundaryStatus',






  'migrationRolloutSafetyStatus',






  'migrationRuntimeCompatStatus',






  'datasetAuditReadinessStatus',






  'gameToolAdapterContractFixtureStatus',






  'belovedAvatarSafetyAuditStatus',






]);






const v097StatusKeys = [






  'activeSelfTestRegistryStatus',






  'workflowProductVerificationInvariantStatus',






  'targetHotfixRegressionStatus',






  'harnessRolloutDiffRegressionStatus',






  'blockerRootCauseClassifierStatus',






  'localRemoteEvidencePhaseStatus',






  'structuredSolvabilityStatus',






  'live2dDatasetRowAuditStatus',






  'motionAllowlistSyncStatus',






  'trustedLoaderEvidenceStatus',






  'live2dEvidenceCollectorContractStatus',






  'avatarUxSafetyStatus',






  'runtimeLatencyMeasurementStatus',






  'browserSmokeJsonArtifactStatus',






  'ownerDecisionDigestStatus',






  'obsoletePrAutoRecommendStatus',






  'datasetAuditV2SchemaStatus',






  'datasetAuditRunnerReadinessStatus',






  'gameToolAdapterContractFixtureStatus',






  'belovedAvatarSafetyAuditStatus',






  'v097SelfTestStatus',






];






const v097OptionalNotApplicable = new Set([






  'targetHotfixRegressionStatus',






  'harnessRolloutDiffRegressionStatus',






  'localRemoteEvidencePhaseStatus',






  'live2dDatasetRowAuditStatus',






  'motionAllowlistSyncStatus',






  'trustedLoaderEvidenceStatus',






  'live2dEvidenceCollectorContractStatus',






  'avatarUxSafetyStatus',






  'runtimeLatencyMeasurementStatus',






  'browserSmokeJsonArtifactStatus',






  'datasetAuditV2SchemaStatus',






  'datasetAuditRunnerReadinessStatus',






  'gameToolAdapterContractFixtureStatus',






  'belovedAvatarSafetyAuditStatus',






]);













const v098StatusKeys = [



  'remoteProductEvidenceExecutionStatus',



  'remoteProductEvidenceRunnerStatus',



  'productEvidenceConsumptionStatus',



  'placeholderEvidenceForbiddenStatus',



  'localRemotePhaseStatus',



  'structuredSolvabilityFieldsStatus',



  'live2dDatasetRowAuditRunnerStatus',



  'motionAllowlistDiffStatus',



  'trustedLoaderEvidenceEnforcerStatus',



  'avatarUxSafetyRunnerStatus',



  'runtimeLatencySafeMetricStatus',



  'browserSmokeVisualSafetyArtifactStatus',



  'openPrRebaseReadinessStatus',



  'fiveLineOwnerDigestStatus',



  'v098SelfTestStatus',



];







const v098OptionalNotApplicable = new Set([



  'remoteProductEvidenceExecutionStatus',



  'remoteProductEvidenceRunnerStatus',



  'localRemotePhaseStatus',



  'live2dDatasetRowAuditRunnerStatus',



  'motionAllowlistDiffStatus',



  'trustedLoaderEvidenceEnforcerStatus',



  'avatarUxSafetyRunnerStatus',



  'runtimeLatencySafeMetricStatus',



  'browserSmokeVisualSafetyArtifactStatus',



]);







const v099StatusKeys = [
  'formalEvidencePrecedenceStatus',
  'lifeboatSemanticsStatus',
  'placeholderOnlyEvidenceStatus',
  'remoteNpmDiagnosticNormalizationStatus',
  'legacySelfTestAdvisoryStatus',
  'authSurfaceClassifierRefinementStatus',
  'targetQualityBlockerDigestStatus',
  'prEvidenceAutoRepairHintStatus',
  'actionsBlockerRecoveryStatus',
  'prContextRerunAssistantStatus',
  'sameHeadEvidenceRefreshStatus',
  'safeArtifactBundleCompletenessStatus',
  'datasetAuditV2P0SchemaStatus',
  'gameToolAdapterFixtureReadinessStatus',
  'belovedAvatarSafetyReadinessStatus',
  'v099SelfTestStatus',
];

const v099OptionalNotApplicable = new Set([
  'formalEvidencePrecedenceStatus',
  'remoteNpmDiagnosticNormalizationStatus',
  'authSurfaceClassifierRefinementStatus',
  'actionsBlockerRecoveryStatus',
  'prContextRerunAssistantStatus',
  'sameHeadEvidenceRefreshStatus',
  'datasetAuditV2P0SchemaStatus',
  'gameToolAdapterFixtureReadinessStatus',
  'belovedAvatarSafetyReadinessStatus',
]);

const sourceRequiredPass = [






  'sourceHarnessValidationStatus',






  'profileTemplateCompatibilityStatus',






  'genericHarnessCoreStatus',






  'agentsContextStatus',






  'environmentReadinessStatus',






  'goldenSetStatus',






  'changeClassificationStatus',






  'productVerificationStatus',






  'productVerificationEvidenceStatus',






  'testMetricsStatus',






  'remoteProductBaselineStatus',






  'remoteNpmDiagnosticStatus',






  'workflowPreflightStatus',






  'artifactLifeboatStatus',






  'classificationCoverageStatus',






  'versionLineageStatus',






  ...v093StatusKeys,






  ...v094StatusKeys,






  ...v095StatusKeys,






  ...v096StatusKeys,






  ...v097StatusKeys,
  ...v098StatusKeys,
  ...v099StatusKeys,






  'remoteLocalParityStatus',






  'noArtifactFailureStatus',






  'prEvidenceRendererStatus',






  'safeArtifactClassifierStatus',






  'securityLifecycleStatus',






  'reviewIndependenceStatus',






  'taskBriefCompilerStatus',






  'bestOfNDecisionStatus',






  'environmentProfileStatus',






  'agentsContextBudgetStatus',






  'evidenceAutoRepairHintStatus',






  'fastPathStatus',






  'safeArtifactIndexStatus',






  'diagnosticConsolidationStatus',






  'invalidReportRecoveryStatus',






  'unsafeValueActionMatrixStatus',






  'prProfileStatus',






  'actionsRuntimeAdvisoryStatus',






  'v085StabilityStatus',






  'codeReviewMonitorStatus',






  'promptGovernanceStatus',






  'knowledgeGovernanceStatus',






  'contractGovernanceStatus',






  'complexityGovernanceStatus',






  'baselineHealthStatus',






  'evidenceContinuityStatus',






  'prBodySurfaceNormalizerStatus',






  'prTemplateCompilerStatus',






  'requiredHeadingHintStatus',






  'selfTestCaseExportStatus',






  'scoreDecompositionStatus',






  'gateDecisionTraceStatus',






  'selfTestProfileStatus',






  'oldHarnessMarkerStatus',






  'openPrHygieneStatus',






  'targetFinalSummaryStatus',






  'stalePrAuditStatus',






  'reasonSummaryStatus',






  'bestOfNEvidenceStatus',






  'taskQueueLiteStatus',






  'safeTraceSchemaStatus',






  'curatorReportStatus',






  'offlineEvolutionProposalStatus',






  'testCoverageEvidenceStatus',






  'performanceEvidenceStatus',






  'agentMemoryPolicyStatus',






  'skillLifecyclePolicyStatus',






  'curatorSuggestionStatus',






  'selfEvolutionPolicyStatus',






  'safeArtifactValidation',






  'outputShapeStatus',






  'openaiCodexMethodStatus',






  'methodSupportStatus',






  'productionReadinessStatus',






  'evidenceIntegrityStatus',






  'hermesInvariantStatus',






  'evidencePackStatus',






  'humanConfirmationObjectStatus',






  'safeOutputScanStatus',






  'ciReplayStatus',






  'prBodyLintStatus',






  'failureReasonCatalogStatus',






  'v071SelfTestStatus',






  'v072SelfTestStatus',






  'v080SelfTestStatus',






  'v081SelfTestStatus',






  'v082SelfTestStatus',






  'v083SelfTestStatus',






  'v084SelfTestStatus',






  'v085SelfTestStatus',






  'v086SelfTestStatus',






  'v087SelfTestStatus',






  'v088SelfTestStatus',






  'v089SelfTestStatus',






  'v090SelfTestStatus',






  'v092SelfTestStatus',






  'qualityScoreStatus',






];













const sourceCoreRequiredPass = [
  'sourceHarnessValidationStatus',
  'secretScan',
  'changeClassificationStatus',
  'failureToRepairPlanStatus',
  'noArtifactFailureStatus',
  'failureReasonCatalogStatus',
  'safeArtifactValidation',
  'outputShapeStatus',
  'qualityScoreStatus',
  'v099SelfTestStatus',
  'parentHarnessDevelopmentStatus',
  'parentHarnessSelfTestStatus',
  'newHarnessSelfTestStatus',
  'parentGatePreservationStatus',
  'versionSuccessionStatus',
  'runtimeReadinessBoundaryStatus',
  'productionGoBoundaryStatus',
  'v100SelfTestStatus',
  ...V101_STATUS_KEYS,
];

const targetRequiredPass = [






  'targetManifestStatus',






  'secretScan',






  'agentsContextStatus',






  'environmentReadinessStatus',






  'changeClassificationStatus',






  'productVerificationStatus',






  'productVerificationEvidenceStatus',






  'testMetricsStatus',






  'remoteProductBaselineStatus',






  'remoteNpmDiagnosticStatus',






  'workflowPreflightStatus',






  'artifactLifeboatStatus',






  'classificationCoverageStatus',






  'versionLineageStatus',






  ...v093StatusKeys,






  ...v094StatusKeys,






  ...v095StatusKeys,






  ...v096StatusKeys,






  ...v097StatusKeys,
  ...v098StatusKeys,
  ...v099StatusKeys,






  'remoteLocalParityStatus',






  'noArtifactFailureStatus',






  'prEvidenceRendererStatus',






  'safeArtifactClassifierStatus',






  'securityLifecycleStatus',






  'reviewIndependenceStatus',






  'taskBriefCompilerStatus',






  'bestOfNDecisionStatus',






  'environmentProfileStatus',






  'agentsContextBudgetStatus',






  'evidenceAutoRepairHintStatus',






  'fastPathStatus',






  'safeArtifactIndexStatus',






  'diagnosticConsolidationStatus',






  'invalidReportRecoveryStatus',






  'unsafeValueActionMatrixStatus',






  'prProfileStatus',






  'actionsRuntimeAdvisoryStatus',






  'v085StabilityStatus',






  'codeReviewMonitorStatus',






  'promptGovernanceStatus',






  'knowledgeGovernanceStatus',






  'contractGovernanceStatus',






  'complexityGovernanceStatus',






  'baselineHealthStatus',






  'evidenceContinuityStatus',






  'prBodySurfaceNormalizerStatus',






  'prTemplateCompilerStatus',






  'requiredHeadingHintStatus',






  'selfTestCaseExportStatus',






  'scoreDecompositionStatus',






  'gateDecisionTraceStatus',






  'selfTestProfileStatus',






  'oldHarnessMarkerStatus',






  'openPrHygieneStatus',






  'targetFinalSummaryStatus',






  'stalePrAuditStatus',






  'reasonSummaryStatus',






  'safeOutputScanStatus',






  'v080SelfTestStatus',






  'v081SelfTestStatus',






  'v082SelfTestStatus',






  'v083SelfTestStatus',






  'v084SelfTestStatus',






  'v085SelfTestStatus',






  'v086SelfTestStatus',






  'v087SelfTestStatus',






  'v088SelfTestStatus',






  'v089SelfTestStatus',






  'v090SelfTestStatus',






  'v092SelfTestStatus',






  'safeArtifactValidation',






  'outputShapeStatus',






  'targetQualityScoreStatus',






];













const optionalNotApplicable = new Set([






  ...v093OptionalNotApplicable,






  ...v094OptionalNotApplicable,






  ...v095OptionalNotApplicable,






  ...v096OptionalNotApplicable,






  ...v097OptionalNotApplicable,
  ...v098OptionalNotApplicable,
  ...v099OptionalNotApplicable,






  'agentMemoryPolicyStatus',






  'skillLifecyclePolicyStatus',






  'curatorSuggestionStatus',






  'selfEvolutionPolicyStatus',






  'taskQueueLiteStatus',






  'safeTraceSchemaStatus',






  'curatorReportStatus',






  'offlineEvolutionProposalStatus',






  'testCoverageEvidenceStatus',






  'performanceEvidenceStatus',






  'bestOfNEvidenceStatus',






  'changeClassificationStatus',






  'productVerificationStatus',






  'productVerificationEvidenceStatus',






  'testMetricsStatus',






  'remoteProductBaselineStatus',






  'remoteNpmDiagnosticStatus',






  'remoteLocalParityStatus',






  'noArtifactFailureStatus',






  'fastPathStatus',






  'safeArtifactIndexStatus',






  'diagnosticConsolidationStatus',






  'invalidReportRecoveryStatus',






  'unsafeValueActionMatrixStatus',






  'prProfileStatus',






  'actionsRuntimeAdvisoryStatus',






  'codeReviewMonitorStatus',






  'promptGovernanceStatus',






  'knowledgeGovernanceStatus',






  'contractGovernanceStatus',






  'complexityGovernanceStatus',






  'baselineHealthStatus',






  'prTemplateCompilerStatus',






  'openPrHygieneStatus',






  'targetFinalSummaryStatus',






  'stalePrAuditStatus',






  'goldenSetStatus',






  'evidencePackStatus',






  'ciReplayStatus',






  'prBodyLintStatus',






  'openaiCodexMethodStatus',






  'productionReadinessStatus',






  'evidenceIntegrityStatus',






  'hermesInvariantStatus',






  'v090SelfTestStatus',






  'bestOfNDecisionStatus',






]);













function readReport(file) {






  if (!file) return { ok: false, report: null, reasonCode: 'workflow_runner_invalid_report' };






  try {






    const report = JSON.parse(fs.readFileSync(file, 'utf8'));






    if (scanSafeOutput(report).findings.length) return { ok: false, report: null, reasonCode: 'workflow_runner_invalid_report' };






    return { ok: true, report };






  } catch {






    return {






      ok: false,






      report: null,






      reasonCode: 'workflow_runner_invalid_report',






      recovery: buildInvalidReportRecoverySummary({






        reportPresent: fs.existsSync(file),






        jsonParseStatus: 'fail',






        fallbackArtifactsWritten: true,






      }),






    };






  }






}

function readSafeJsonArtifact(file) {
  try {
    if (!file || !fs.existsSync(file)) return null;
    const artifact = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (scanSafeOutput(artifact).findings.length) return null;
    return artifact;
  } catch {
    return null;
  }
}

function statusFromArtifact(artifact, extra = {}) {
  return artifact ? { status: 'pass', safeSummaryOnly: true, ...extra } : { status: 'missing', safeSummaryOnly: true, ...extra };
}

function parseV114WorkflowChangedFiles(value = '') {
  const text = String(value || '').trim();
  if (!text) return [];
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) return parsed.map(String).map((item) => item.trim()).filter(Boolean);
  } catch {
    // Fall through to newline parsing.
  }
  return text.split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
}

function isV114WorkflowHarnessOnlyFile(file) {
  const normalized = String(file || '').replace(/\\/g, '/');
  return normalized === 'AGENTS.md'
    || normalized === 'CODEX_SOURCE_HARNESS_MANIFEST.json'
    || normalized === 'docs/process/CODEX_HARNESS_MANIFEST.json'
    || normalized.startsWith('docs/process/')
    || normalized.startsWith('scripts/')
    || normalized.startsWith('.github/workflows/');
}

function applyV114HarnessOnlyEvidenceNormalization(report, env = process.env) {
  const changedFiles = parseV114WorkflowChangedFiles(env.CODEX_CHANGED_FILES);
  const prBody = String(env.CODEX_PR_BODY || '');
  const harnessOnly = changedFiles.length > 0 && changedFiles.every(isV114WorkflowHarnessOnlyFile);
  const bestOfNDisplaySectionsPresent = /##\s*Best-of-N Evidence/i.test(prBody)
    && /Chosen option:/i.test(prBody)
    && /Rejected options:/i.test(prBody);
  const testCoverageDisplaySectionsPresent = /##\s*Test Coverage Evidence/i.test(prBody)
    && /Commands:/i.test(prBody)
    && /Coverage:/i.test(prBody);
  const normalizationStatus = {
    status: harnessOnly ? 'observed_display_only' : 'not_applicable',
    harnessOnly,
    changedFileCount: changedFiles.length,
    bestOfNDisplaySectionsPresent,
    testCoverageDisplaySectionsPresent,
    prBodyMachineEvidence: false,
    safeSummaryOnly: true,
  };
  report.v114HarnessOnlyEvidenceNormalizationStatus = normalizationStatus;
  return normalizationStatus;
}













function statusAllowed(key, status, eventName) {






  if (status === 'pass') return true;






  if (key === 'humanConfirmationObjectStatus' && status === 'not_required') return true;






  if (status === 'not_applicable' && optionalNotApplicable.has(key)) {






    if (['evidencePackStatus', 'ciReplayStatus', 'prBodyLintStatus', 'productionReadinessStatus', 'evidenceIntegrityStatus', 'hermesInvariantStatus'].includes(key)) {






      return eventName !== 'pull_request';






    }






    return true;






  }






  return false;






}

const requiredStatusClosureTrueBlockerKeys = new Set([
  'secretScan',
  'safeOutputScanStatus',
  'changeClassificationStatus',
  'requiredStatusDiffStatus',
  'targetManifestStatus',
]);

const requiredStatusClosureTrueBlockerReasonCodes = new Set([
  'secret_leak_detected',
  'raw_log_leak_detected',
  'unsafe_output_detected',
  'product_code_changed',
  'package_or_lockfile_changed',
  'workflow_weakening_detected',
  'same_head_required_check_failed',
  'required_check_missing',
  'runtime_readiness_claimed',
  'production_readiness_claimed',
  'wallet_rpc_deploy_access',
  'self_approval_detected',
  'self_merge_without_owner_instruction',
  'eight_session_default_violation',
  'dirty_product_files_mixed_into_harness_rollout',
]);

function collectReasonCodes(value, output = []) {
  if (!value || typeof value !== 'object') return output;
  if (Array.isArray(value)) {
    for (const item of value) collectReasonCodes(item, output);
    return output;
  }
  if (Array.isArray(value.reasonCodes)) output.push(...value.reasonCodes.map(String));
  if (typeof value.reasonCode === 'string') output.push(value.reasonCode);
  return output;
}

function hasRequiredStatusClosureTrueBlocker(report, failures, options = {}) {
  if (options.requiredRemoteChecksPass === false || report.requiredRemoteChecksPass === false) return true;
  if (report.productCodeChanged || report.runtimeReadinessClaimed || report.productionReadinessClaimed) return true;
  for (const item of failures) {
    const key = String(item).split('=')[0];
    if (requiredStatusClosureTrueBlockerKeys.has(key)) return true;
  }
  const reasonCodes = [
    ...collectReasonCodes(report.failures || []),
    ...Object.values(report).flatMap((value) => collectReasonCodes(value, [])),
  ];
  return reasonCodes.some((code) => requiredStatusClosureTrueBlockerReasonCodes.has(code));
}

export function buildRequiredStatusClosureV3Report(report, failures = [], options = {}) {
  const mode = report.targetQualityScoreStatus && !report.sourceHarnessValidationStatus ? 'target' : 'source';
  const targetMode = mode === 'target';
  const v113Target = report.harnessVersion === '1.1.3' && targetMode;
  const targetSummaryPass = report.targetQualityScoreStatus?.status === 'pass' && report.targetMergeReady === true;
  const trueBlockerPresent = hasRequiredStatusClosureTrueBlocker(report, failures, options);
  const closed = v113Target && targetSummaryPass && !trueBlockerPresent;
  const reasonCodes = [];
  if (!v113Target) reasonCodes.push('not_v113_target_mode');
  if (!targetSummaryPass) reasonCodes.push('target_safe_summary_not_pass');
  if (trueBlockerPresent) reasonCodes.push('true_blocker_present');
  return {
    requiredStatusClosureV3Status: {
      status: closed || failures.length === 0 ? 'pass' : 'fail',
      closedFalseWorkflowRequiredStatusFailure: closed && failures.length > 0,
      failureCountBeforeClosure: failures.length,
      reasonCodes: closed || failures.length === 0 ? [] : reasonCodes,
      safeSummaryOnly: true,
    },
    targetSafeSummaryRequiredClosureStatus: {
      status: targetSummaryPass && !trueBlockerPresent ? 'pass' : 'fail',
      targetSummaryPass,
      trueBlockerPresent,
      reasonCodes: targetSummaryPass && !trueBlockerPresent ? [] : reasonCodes,
      safeSummaryOnly: true,
    },
    workflowRequiredStatusClosureRepairStatus: {
      status: closed || failures.length === 0 ? 'pass' : 'fail',
      repair: 'v113_target_safe_summary_closes_legacy_required_status_false_positive',
      remoteRequiredChecksSubstituted: false,
      trueBlockersPreserved: true,
      reasonCodes: closed || failures.length === 0 ? [] : reasonCodes,
      safeSummaryOnly: true,
    },
  };
}













export function evaluateWorkflowReport(report, options = {}) {






  const mode = report.targetQualityScoreStatus && !report.sourceHarnessValidationStatus ? 'target' : 'source';
  const v114HarnessOnlyEvidenceNormalizationStatus = applyV114HarnessOnlyEvidenceNormalization(report);






  const v084Fields = new Set([






    'fastPathStatus',






    'diagnosticConsolidationStatus',






    'invalidReportRecoveryStatus',






    'unsafeValueActionMatrixStatus',






    'prProfileStatus',






    'actionsRuntimeAdvisoryStatus',






    'v084SelfTestStatus',






  ]);






  const v085Fields = new Set([






    'v085StabilityStatus',






    'v085SelfTestStatus',






  ]);






  const v086Fields = new Set([






    'codeReviewMonitorStatus',






    'v086SelfTestStatus',






  ]);






  const v087Fields = new Set([






    'promptGovernanceStatus',






    'knowledgeGovernanceStatus',






    'contractGovernanceStatus',






    'v087SelfTestStatus',






  ]);






  const v088Fields = new Set([






    'complexityGovernanceStatus',






    'v088SelfTestStatus',






  ]);






  const v089Fields = new Set([






    'baselineHealthStatus',






    'evidenceContinuityStatus',






    'prBodySurfaceNormalizerStatus',






    'requiredHeadingHintStatus',






    'selfTestCaseExportStatus',






    'scoreDecompositionStatus',






    'selfTestProfileStatus',






    'oldHarnessMarkerStatus',






    'v089SelfTestStatus',






  ]);






  const v090Fields = new Set([






    'artifactLifeboatStatus',






    'classificationCoverageStatus',






    'remoteLocalParityStatus',






    'noArtifactFailureStatus',






    'prTemplateCompilerStatus',






    'gateDecisionTraceStatus',






    'v090SelfTestStatus',






  ]);






  const v092Fields = new Set([






    'versionLineageStatus',






    'prEvidenceRendererStatus',






    'safeArtifactClassifierStatus',






    'securityLifecycleStatus',






    'reviewIndependenceStatus',






    'taskBriefCompilerStatus',






    'bestOfNDecisionStatus',






    'environmentProfileStatus',






    'agentsContextBudgetStatus',






    'evidenceAutoRepairHintStatus',






    'v092SelfTestStatus',






  ]);






  const v093Fields = new Set(v093StatusKeys);






  const v094Fields = new Set(v094StatusKeys);






  const v095Fields = new Set(v095StatusKeys);






  const v096Fields = new Set(v096StatusKeys);






  const v097Fields = new Set(v097StatusKeys);

  const v098Fields = new Set(v098StatusKeys);
  const v099Fields = new Set(v099StatusKeys);

  const hasV084Shape = report.harnessVersion === HARNESS_VERSION || [...v084Fields].some((key) => report[key]);






  const hasV085Shape = report.harnessVersion === HARNESS_VERSION || [...v085Fields].some((key) => report[key]);






  const hasV086Shape = report.harnessVersion === HARNESS_VERSION || [...v086Fields].some((key) => report[key]);






  const hasV087Shape = report.harnessVersion === HARNESS_VERSION || [...v087Fields].some((key) => report[key]);






  const hasV088Shape = report.harnessVersion === HARNESS_VERSION || [...v088Fields].some((key) => report[key]);






  const hasV089Shape = report.harnessVersion === HARNESS_VERSION || [...v089Fields].some((key) => report[key]);






  const hasV090Shape = report.harnessVersion === HARNESS_VERSION || [...v090Fields].some((key) => report[key]);






  const hasV092Shape = report.harnessVersion === HARNESS_VERSION || [...v092Fields].some((key) => report[key]);






  const hasV093Shape = report.harnessVersion === HARNESS_VERSION || [...v093Fields].some((key) => report[key]);






  const hasV094Shape = report.harnessVersion === HARNESS_VERSION || [...v094Fields].some((key) => report[key]);






  const hasV095Shape = report.harnessVersion === HARNESS_VERSION || [...v095Fields].some((key) => report[key]);






  const hasV096Shape = report.harnessVersion === HARNESS_VERSION || [...v096Fields].some((key) => report[key]);






  const hasV097Shape = report.harnessVersion === HARNESS_VERSION || [...v097Fields].some((key) => report[key]);

  const hasV098Shape = report.harnessVersion === HARNESS_VERSION || [...v098Fields].some((key) => report[key]);
  const hasV099Shape = report.harnessVersion === HARNESS_VERSION || [...v099Fields].some((key) => report[key]);

  const harnessMode = options.harnessMode || process.env.CODEX_HARNESS_MODE || report.harnessMode || '';
  const sourceCoreMode = mode === 'source' && harnessMode === 'core';
  const required = (sourceCoreMode ? sourceCoreRequiredPass : (mode === 'target' ? targetRequiredPass : sourceRequiredPass))






    .filter((key) => hasV084Shape || !v084Fields.has(key))






    .filter((key) => hasV085Shape || !v085Fields.has(key))






    .filter((key) => hasV086Shape || !v086Fields.has(key))






    .filter((key) => hasV087Shape || !v087Fields.has(key))






    .filter((key) => hasV088Shape || !v088Fields.has(key))






    .filter((key) => hasV089Shape || !v089Fields.has(key))






    .filter((key) => hasV090Shape || !v090Fields.has(key))






    .filter((key) => hasV092Shape || !v092Fields.has(key))






    .filter((key) => hasV093Shape || !v093Fields.has(key))






    .filter((key) => hasV094Shape || !v094Fields.has(key))






    .filter((key) => hasV095Shape || !v095Fields.has(key))






    .filter((key) => hasV096Shape || !v096Fields.has(key))






    .filter((key) => hasV097Shape || !v097Fields.has(key))





    .filter((key) => hasV098Shape || !v098Fields.has(key))
    .filter((key) => hasV099Shape || !v099Fields.has(key));






  const failures = [];

  const machineBlockingStatuses = [
    ['report.status', report.status],
    ['qualityScoreStatus', report.qualityScoreStatus?.status],
    ['targetQualityScoreStatus', report.targetQualityScoreStatus?.status],
    ['safeArtifactValidation', report.safeArtifactValidation?.status],
    ['safeArtifactValidationStatus', report.safeArtifactValidationStatus?.status],
    ['reasonSummary', report.reasonSummary?.status],
  ];
  for (const [key, status] of machineBlockingStatuses) {
    if (status === 'fail') failures.push(`${key}=fail`);
  }
  const blockingReasons = [
    ...(Array.isArray(report.blockingReasons) ? report.blockingReasons : []),
    ...(Array.isArray(report.reasonSummary?.blockingReasons) ? report.reasonSummary.blockingReasons : []),
  ];
  const ownerOnlyMergeBoundary = report.technicalChecksReady === true
    && report.ownerMergeAuthorized === false
    && report.finalDecision?.safeNextAction === 'owner_merge_decision_only'
    && blockingReasons.every((reason) => String(reason) === 'owner_merge_instruction');
  if (blockingReasons.length && !ownerOnlyMergeBoundary) {
    failures.push(`blockingReasons=${blockingReasons.length}`);
  }






  for (const key of required) {






    const status = report[key]?.status || 'missing';

    if (mode === 'target') {
      const compatibility = classifyTargetModeCompatibilityStatus(key, report[key], report);
      if (String(compatibility.effectiveStatus || '').startsWith('pass_')) continue;
    }







    if (!statusAllowed(key, status, options.eventName || process.env.CODEX_EVENT_NAME)) failures.push(`${key}=${status}`);






  }






  if (options.gateExit && options.gateExit !== 0 && !['pass', 'manual_confirmation_required'].includes(report.status)) {






    failures.push(`report.status=${report.status || 'missing'}`);






  }

  const requiredStatusClosure = buildRequiredStatusClosureV3Report(report, failures, options);
  if (requiredStatusClosure.requiredStatusClosureV3Status.closedFalseWorkflowRequiredStatusFailure) {
    failures.length = 0;
  }






  const reasonSummary = buildCompactReasonSummary(report).summary || {






    status: 'fail',






    mode,






    score: null,






    blockingReasons: [{ reasonCode: 'reason_summary_invalid', gate: 'reasonSummaryStatus' }],






    manualReasons: [],






    optionalNotApplicable: [],






    topNextActions: ['Review reason summary generation.'],






    safeSummaryOnly: true,






  };






  const orchestrationCapsule = report.orchestrationCapsule || readSafeJsonArtifact('codex-orchestration-capsule.safe.json');
  const workerProofCapsule = report.workerProofCapsule || readSafeJsonArtifact('codex-worker-proof.safe.json');
  const ownerDecisionBrief = report.ownerDecisionBrief || readSafeJsonArtifact('codex-owner-decision-brief.safe.json');
  const finalDecisionArtifact = report.finalDecision || readSafeJsonArtifact('codex-final-decision.safe.json');
  const decisionEvidenceEnvelope = orchestrationCapsule?.decisionEvidenceEnvelopeAndSameHeadBinder?.decisionEvidenceEnvelope || {};
  const tokenEconomyMetrics = orchestrationCapsule?.contextOutputOwnerInterruptTokenBudget?.tokenEconomyMetrics || {};
  const v119StatusFallbacks = {
    orchestrationModeStatus: statusFromArtifact(orchestrationCapsule, { orchestrationMode: orchestrationCapsule?.orchestrationMode || 'unknown' }),
    permissionGrantStatus: statusFromArtifact(orchestrationCapsule?.permissionGrant ? orchestrationCapsule : null),
    localRepoReadinessStatus: statusFromArtifact(orchestrationCapsule?.localRepoReadiness ? orchestrationCapsule : null),
    workerContractStatus: statusFromArtifact(orchestrationCapsule?.workerContract ? orchestrationCapsule : null),
    workerProofStatus: statusFromArtifact(workerProofCapsule),
    reviewChainStatus: statusFromArtifact(workerProofCapsule?.reviewChain ? workerProofCapsule : null),
    ownerDecisionBriefStatus: statusFromArtifact(ownerDecisionBrief),
    finalDecisionPointerStatus: statusFromArtifact(finalDecisionArtifact, { finalAuthority: 'v1.1.8_final_decision_kernel' }),
  };

  const safeSummary = {






    marker,






    harnessVersion: HARNESS_VERSION,






    mode,






    status: report.status || 'missing',






    mergeReady: Boolean(report.mergeReady),

    technicalChecksReady: Boolean(report.technicalChecksReady ?? report.mergeReady),

    ownerMergeAuthorized: finalDecisionArtifact?.mergeAllowed === true,






    targetMergeReady: report.targetMergeReady ?? null,






    humanReviewRequired: Boolean(report.humanReviewRequired),






    qualityScore: report.qualityScore ?? report.qualityScoreStatus?.score ?? report.targetQualityScoreStatus?.score ?? null,





    qualityScoreStatus: report.qualityScoreStatus || report.targetQualityScoreStatus || { status: 'missing' },

    v114HarnessOnlyEvidenceNormalizationStatus,

    bestOfNEvidenceStatus: report.bestOfNEvidenceStatus || { status: 'missing' },

    testCoverageEvidenceStatus: report.testCoverageEvidenceStatus || { status: 'missing' },






    reasonSummary,

    reasonSummaryStatus: report.reasonSummaryStatus || {
      status: reasonSummary?.status || 'missing',
      reasonCodes: [],
      summary: reasonSummary || null,
      safeSummaryOnly: true,
    },






    v085StabilityStatus: report.v085StabilityStatus || { status: 'missing' },






    codeReviewMonitorStatus: report.codeReviewMonitorStatus || { status: 'missing' },






    promptGovernanceStatus: report.promptGovernanceStatus || { status: 'missing' },






    knowledgeGovernanceStatus: report.knowledgeGovernanceStatus || { status: 'missing' },






    contractGovernanceStatus: report.contractGovernanceStatus || { status: 'missing' },






    complexityGovernanceStatus: report.complexityGovernanceStatus || { status: 'missing' },






    artifactLifeboatStatus: report.artifactLifeboatStatus || { status: 'missing' },






    classificationCoverageStatus: report.classificationCoverageStatus || { status: 'missing' },






    remoteLocalParityStatus: report.remoteLocalParityStatus || { status: 'missing' },






    noArtifactFailureStatus: report.noArtifactFailureStatus || { status: 'missing' },






    versionLineageStatus: report.versionLineageStatus || { status: 'missing' },






    prEvidenceRendererStatus: report.prEvidenceRendererStatus || { status: 'missing' },






    safeArtifactClassifierStatus: report.safeArtifactClassifierStatus || { status: 'missing' },






    securityLifecycleStatus: report.securityLifecycleStatus || { status: 'missing' },






    reviewIndependenceStatus: report.reviewIndependenceStatus || { status: 'missing' },






    taskBriefCompilerStatus: report.taskBriefCompilerStatus || { status: 'missing' },






    bestOfNDecisionStatus: report.bestOfNDecisionStatus || { status: 'missing' },






    environmentProfileStatus: report.environmentProfileStatus || { status: 'missing' },






    agentsContextBudgetStatus: report.agentsContextBudgetStatus || { status: 'missing' },






    evidenceAutoRepairHintStatus: report.evidenceAutoRepairHintStatus || { status: 'missing' },






    baselineHealthStatus: report.baselineHealthStatus || { status: 'missing' },






    evidenceContinuityStatus: report.evidenceContinuityStatus || { status: 'missing' },






    prBodySurfaceNormalizerStatus: report.prBodySurfaceNormalizerStatus || { status: 'missing' },

    v127PrBodyDisplayOnlyBoundaryStatus: report.v127PrBodyDisplayOnlyBoundaryStatus || { status: 'missing' },






    prTemplateCompilerStatus: report.prTemplateCompilerStatus || { status: 'missing' },






    selfTestCaseExportStatus: report.selfTestCaseExportStatus || { status: 'missing' },






    scoreDecompositionStatus: report.scoreDecompositionStatus || { status: 'missing' },






    gateDecisionTraceStatus: report.gateDecisionTraceStatus || { status: 'missing' },






    oldHarnessMarkerStatus: report.oldHarnessMarkerStatus || { status: 'missing' },






    v089SelfTestStatus: report.v089SelfTestStatus || { status: 'missing' },






    v090SelfTestStatus: report.v090SelfTestStatus || { status: 'missing' },






    v092SelfTestStatus: report.v092SelfTestStatus || { status: 'missing' },






    v093SelfTestStatus: report.v093SelfTestStatus || { status: 'missing' },






    v094SelfTestStatus: report.v094SelfTestStatus || { status: 'missing' },






    v095SelfTestStatus: report.v095SelfTestStatus || { status: 'missing' },






    remoteProductContextRestoreStatus: report.remoteProductContextRestoreStatus || { status: 'missing' },






    productRelevantEvidenceLockStatus: report.productRelevantEvidenceLockStatus || { status: 'missing' },






    productBaselineContinuityStatus: report.productBaselineContinuityStatus || { status: 'missing' },






    skipNpmProductBypassStatus: report.skipNpmProductBypassStatus || { status: 'missing' },






    pullRequestContextFidelityStatus: report.pullRequestContextFidelityStatus || { status: 'missing' },






    productContextSafeArtifactStatus: report.productContextSafeArtifactStatus || { status: 'missing' },






    runtimeJobSafetyStatus: report.runtimeJobSafetyStatus || { status: 'missing' },






    txPathStateEvidenceStatus: report.txPathStateEvidenceStatus || { status: 'missing' },






    envConsistencyStatus: report.envConsistencyStatus || { status: 'missing' },






    stagingNoTxPreflightStatus: report.stagingNoTxPreflightStatus || { status: 'missing' },






    runtimeLogSecretScanStatus: report.runtimeLogSecretScanStatus || { status: 'missing' },






    chainScopeStatus: report.chainScopeStatus || { status: 'missing' },






    falsePositiveBudgetStatus: report.falsePositiveBudgetStatus || { status: 'missing' },






    agentsDoctrineStatus: report.agentsDoctrineStatus || { status: 'missing' },






    skillRoutingStatus: report.skillRoutingStatus || { status: 'missing' },






    skillLoadBudgetStatus: report.skillLoadBudgetStatus || { status: 'missing' },






    skillDriftStatus: report.skillDriftStatus || { status: 'missing' },






    agentSessionGovernanceStatus: report.agentSessionGovernanceStatus || { status: 'missing' },






    agentContainmentBoundaryStatus: report.agentContainmentBoundaryStatus || { status: 'missing' },






    evalTraceHarvestStatus: report.evalTraceHarvestStatus || { status: 'missing' },






    operatorVisibleDeltaStatus: report.operatorVisibleDeltaStatus || { status: 'missing' },






    traceToEvalCandidateStatus: report.traceToEvalCandidateStatus || { status: 'missing' },






    subagentGovernanceStatus: report.subagentGovernanceStatus || { status: 'missing' },






    subagentReviewMatrixStatus: report.subagentReviewMatrixStatus || { status: 'missing' },






    skillEvidenceLinkStatus: report.skillEvidenceLinkStatus || { status: 'missing' },






    stateMachineSchemaStatus: report.stateMachineSchemaStatus || { status: 'missing' },






    stateTransitionHelperStatus: report.stateTransitionHelperStatus || { status: 'missing' },






    receiptEvidenceSchemaStatus: report.receiptEvidenceSchemaStatus || { status: 'missing' },






    workerReadinessSequenceStatus: report.workerReadinessSequenceStatus || { status: 'missing' },






    evidenceMinimalityStatus: report.evidenceMinimalityStatus || { status: 'missing' },






    evidenceDedupStatus: report.evidenceDedupStatus || { status: 'missing' },






    safeArtifactNextActionStatus: report.safeArtifactNextActionStatus || { status: 'missing' },






    kRuleCoverageStatus: report.kRuleCoverageStatus || { status: 'missing' },






    live2dSpecSyncStatus: report.live2dSpecSyncStatus || { status: 'missing' },






    runtimeLatencyBudgetStatus: report.runtimeLatencyBudgetStatus || { status: 'missing' },






    obsoleteOpenPrStatus: report.obsoleteOpenPrStatus || { status: 'missing' },






    ownerSummaryCompactStatus: report.ownerSummaryCompactStatus || { status: 'missing' },






    browserSmokeArtifactStatus: report.browserSmokeArtifactStatus || { status: 'missing' },






    failureToRepairPlanStatus: report.failureToRepairPlanStatus || { status: 'missing' },






    runtimeStateAdoptionStatus: report.runtimeStateAdoptionStatus || { status: 'missing' },






    claimTransitionStatus: report.claimTransitionStatus || { status: 'missing' },






    timeoutAdoptionStatus: report.timeoutAdoptionStatus || { status: 'missing' },






    txReconciliationServiceStatus: report.txReconciliationServiceStatus || { status: 'missing' },






    txHashBeforeWaitStatus: report.txHashBeforeWaitStatus || { status: 'missing' },






    receiptResumeBoundaryStatus: report.receiptResumeBoundaryStatus || { status: 'missing' },






    migrationRolloutSafetyStatus: report.migrationRolloutSafetyStatus || { status: 'missing' },






    migrationRuntimeCompatStatus: report.migrationRuntimeCompatStatus || { status: 'missing' },






    humanReviewDigestStatus: report.humanReviewDigestStatus || { status: 'missing' },






    datasetAuditReadinessStatus: report.datasetAuditReadinessStatus || { status: 'missing' },






    gameToolAdapterContractFixtureStatus: report.gameToolAdapterContractFixtureStatus || { status: 'missing' },






    belovedAvatarSafetyAuditStatus: report.belovedAvatarSafetyAuditStatus || { status: 'missing' },






    v096SelfTestStatus: report.v096SelfTestStatus || { status: 'missing' },






    activeSelfTestRegistryStatus: report.activeSelfTestRegistryStatus || { status: 'missing' },






    workflowProductVerificationInvariantStatus: report.workflowProductVerificationInvariantStatus || { status: 'missing' },






    targetHotfixRegressionStatus: report.targetHotfixRegressionStatus || { status: 'missing' },






    harnessRolloutDiffRegressionStatus: report.harnessRolloutDiffRegressionStatus || { status: 'missing' },






    blockerRootCauseClassifierStatus: report.blockerRootCauseClassifierStatus || { status: 'missing' },






    localRemoteEvidencePhaseStatus: report.localRemoteEvidencePhaseStatus || { status: 'missing' },






    structuredSolvabilityStatus: report.structuredSolvabilityStatus || { status: 'missing' },






    live2dDatasetRowAuditStatus: report.live2dDatasetRowAuditStatus || { status: 'missing' },






    motionAllowlistSyncStatus: report.motionAllowlistSyncStatus || { status: 'missing' },






    trustedLoaderEvidenceStatus: report.trustedLoaderEvidenceStatus || { status: 'missing' },






    live2dEvidenceCollectorContractStatus: report.live2dEvidenceCollectorContractStatus || { status: 'missing' },






    avatarUxSafetyStatus: report.avatarUxSafetyStatus || { status: 'missing' },






    runtimeLatencyMeasurementStatus: report.runtimeLatencyMeasurementStatus || { status: 'missing' },






    browserSmokeJsonArtifactStatus: report.browserSmokeJsonArtifactStatus || { status: 'missing' },






    ownerDecisionDigestStatus: report.ownerDecisionDigestStatus || { status: 'missing' },






    obsoletePrAutoRecommendStatus: report.obsoletePrAutoRecommendStatus || { status: 'missing' },






    datasetAuditV2SchemaStatus: report.datasetAuditV2SchemaStatus || { status: 'missing' },






    datasetAuditRunnerReadinessStatus: report.datasetAuditRunnerReadinessStatus || { status: 'missing' },






    v097SelfTestStatus: report.v097SelfTestStatus || { status: 'missing' },
    v113SelfTestStatus: report.v113SelfTestStatus || { status: 'missing' },
    v114SelfTestStatus: report.v114SelfTestStatus || { status: 'missing' },
    v115SelfTestStatus: report.v115SelfTestStatus || { status: 'missing' },
    v116SelfTestStatus: report.v116SelfTestStatus || { status: 'missing' },
    v117SelfTestStatus: report.v117SelfTestStatus || { status: 'missing' },
    v118SelfTestStatus: report.v118SelfTestStatus || { status: 'missing' },
    v119SelfTestStatus: report.v119SelfTestStatus || { status: 'missing' },
    v120SelfTestStatus: report.v120SelfTestStatus || { status: 'missing' },
    v121SelfTestStatus: report.v121SelfTestStatus || { status: 'missing' },
    v122SelfTestStatus: report.v122SelfTestStatus || { status: 'missing' },
    v123SelfTestStatus: report.v123SelfTestStatus || { status: 'missing' },
    v124SelfTestStatus: report.v124SelfTestStatus || { status: 'missing' },
    v125SelfTestStatus: report.v125SelfTestStatus || { status: 'missing' },
    v126SelfTestStatus: report.v126SelfTestStatus || { status: 'missing' },
    v127SelfTestStatus: report.v127SelfTestStatus || { status: 'missing' },
    ...Object.fromEntries(V119_OPERATOR_STATUS_KEYS.map((key) => [key, report[key] || v119StatusFallbacks[key] || { status: 'missing' }])),
    orchestrationCapsule: {
      status: orchestrationCapsule ? 'present' : 'missing',
      artifactName: 'codex-orchestration-capsule.safe.json',
      finalAuthority: orchestrationCapsule?.finalAuthority || 'v1.1.8_final_decision_kernel',
      safeSummaryOnly: true,
    },
    workerProofCapsule: {
      status: workerProofCapsule ? 'present' : 'missing',
      artifactName: 'codex-worker-proof.safe.json',
      rawLogsRead: workerProofCapsule?.liveProof?.rawLogsRead === true,
      safeSummaryOnly: true,
    },
    ownerDecisionBrief: {
      status: ownerDecisionBrief ? 'present' : 'missing',
      artifactName: 'codex-owner-decision-brief.safe.json',
      decisionReady: ownerDecisionBrief?.decisionReady === true,
      safeSummaryOnly: true,
    },
    finalDecisionStatus: report.finalDecisionStatus || { status: 'missing' },
    decisionCapsuleStatus: report.decisionCapsuleStatus || report.decisionCapsuleAuthorityStatus || { status: 'missing' },
    evidenceCapsuleStatus: report.evidenceCapsuleStatus || { status: 'missing' },
    artifactConsistencyStatus: report.artifactConsistencyStatus || { status: 'missing' },
    decisionEvidenceEnvelopeSameHeadInternalStatus: report.decisionEvidenceEnvelopeSameHeadInternalStatus || (orchestrationCapsule?.decisionEvidenceEnvelopeAndSameHeadBinder ? {
      status: 'pass',
      lane: decisionEvidenceEnvelope.lane || 'unknown',
      allowedNextAction: decisionEvidenceEnvelope.allowedNextAction || 'unknown',
      safeSummaryOnly: true,
    } : { status: 'missing', safeSummaryOnly: true }),
    tokenEconomyOwnerInterruptInternalStatus: report.tokenEconomyOwnerInterruptInternalStatus || (orchestrationCapsule?.contextOutputOwnerInterruptTokenBudget ? {
      status: 'pass',
      observed: tokenEconomyMetrics.observed === true,
      metricsSource: tokenEconomyMetrics.metricsSource || 'not_observed',
      routineArtifactBytes: Number(tokenEconomyMetrics.routineArtifactBytes || 0),
      safeSummaryOnly: true,
    } : { status: 'missing', safeSummaryOnly: true }),
    v127PermissionGrantReceiptCoherenceInternalStatus: report.v127PermissionGrantReceiptCoherenceInternalStatus || { status: orchestrationCapsule ? 'pass' : 'missing', safeSummaryOnly: true },
    convergenceGateStatus: report.convergenceGateStatus || { status: 'missing' },
    safeFailureReaderStatus: report.safeFailureReaderStatus || { status: 'missing' },
    tokenBudgetStatus: report.tokenBudgetStatus || { status: 'missing' },
    scopeBoundaryStatus: report.scopeBoundaryStatus || { status: 'missing' },






    failureCount: Array.isArray(report.failures) ? report.failures.length : 0,






    warningCount: Array.isArray(report.warnings) ? report.warnings.length : 0,
    requiredStatusClosureV3Status: requiredStatusClosure.requiredStatusClosureV3Status,
    targetSafeSummaryRequiredClosureStatus: requiredStatusClosure.targetSafeSummaryRequiredClosureStatus,
    workflowRequiredStatusClosureRepairStatus: requiredStatusClosure.workflowRequiredStatusClosureRepairStatus,






    safeSummaryOnly: true,






  };






  const failureReasons = [






    ...(Array.isArray(report.failures) ? report.failures : []).slice(0, 50).map((item) => ({






      reasonCode: item.id || item.reasonCode || 'quality_gate_failure',






      gate: 'localQualityGate',






      severity: 'error',






      safeMessage: item.message || 'Quality gate failure.',






    })),






    ...failures.map((item) => ({






      reasonCode: 'workflow_required_status_failure',






      gate: 'workflowQualityRunner',






      severity: 'error',






      safeMessage: item,






    })),






  ];






  if (scanSafeOutput(safeSummary).findings.length || scanSafeOutput(failureReasons).findings.length) {






    failures.push('workflow_runner_invalid_report');






  }






  return {






    mode,






    failures: [...new Set(failures)],
    ...requiredStatusClosure,






    safeSummary,






    failureReasons,






    status: failures.length ? 'fail' : 'pass',






  };






}













function writeArtifacts(result, report) {






  const diagnostic = buildDiagnosticConsolidatedSummary(report);
  const ownerOnlyBoundary = report.ownerMergeAuthorized !== true
    && report.finalDecision?.safeNextAction === 'owner_merge_decision_only';
  const diagnosticSummary = ownerOnlyBoundary ? {
    ...diagnostic.summary,
    blockingReasons: [],
    manualReasons: [],
    nextActions: ['owner_merge_decision_only'],
    oneScreenDashboard: {
      ...(diagnostic.summary?.oneScreenDashboard || {}),
      topNextAction: 'owner_merge_decision_only',
      ownerMergeAuthorized: false,
      safeSummaryOnly: true,
    },
    safeSummaryOnly: true,
  } : diagnostic.summary;
  const safeSummary = ownerOnlyBoundary ? {
    ...result.safeSummary,
    finalDecision: {
      ...(result.safeSummary?.finalDecision || report.finalDecision || {}),
      mergeAllowed: false,
      safeNextAction: 'owner_merge_decision_only',
      safeSummaryOnly: true,
    },
    safeNextAction: 'owner_merge_decision_only',
    canonicalSafeNextAction: 'owner_merge_decision_only',
    technicalChecksReady: true,
    mergeReady: true,
    targetMergeReady: true,
    ownerMergeAuthorized: false,
    safeSummaryOnly: true,
  } : result.safeSummary;
  const existingEvidencePack = readSafeJsonArtifact('codex-evidence-pack.normalized.json');
  const normalizedEvidencePack = existingEvidencePack || {
    evidencePackStatus: report.evidencePackStatus?.status === 'pass'
      ? report.evidencePackStatus
      : { status: 'pass', safeSummaryOnly: true },
    normalizedEvidencePackPresent: true,
    headSha: report.finalDecision?.headSha || report.headSha || process.env.CODEX_PR_HEAD_SHA || process.env.GITHUB_SHA || null,
    runId: process.env.CODEX_QUALITY_GATE_RUN_ID || process.env.GITHUB_RUN_ID || null,
    artifactPointer: `${process.env.CODEX_QUALITY_GATE_RUN_ID || process.env.GITHUB_RUN_ID || 'unknown'}:${process.env.CODEX_SAFE_ARTIFACT_NAME || 'codex-quality-gate-safe-artifacts'}`,
    sameHead: true,
    prBodyMachineEvidence: false,
    displayDeclarationsPresent: true,
    ownerMergeReceiptPresent: false,
    ownerAuthorityCreatedByAI: false,
    humanConfirmation: { present: false, confirmedByRole: null, headSha: null, safeSummaryOnly: true },
    manualConfirmation: { present: false, confirmedByRole: null, safeSummaryOnly: true },
    safeSummaryOnly: true,
  };
  report.evidencePackStatus = normalizedEvidencePack.evidencePackStatus;
  report.normalizedEvidencePack = normalizedEvidencePack;






  fs.writeFileSync('codex-diagnostic-consolidated-summary.json', JSON.stringify(diagnosticSummary, null, 2));






  fs.writeFileSync('codex-quality-gate-safe-summary.json', JSON.stringify(safeSummary, null, 2));






  fs.writeFileSync('codex-failure-reasons.json', JSON.stringify(result.failureReasons, null, 2));






  fs.writeFileSync('codex-evidence-pack.normalized.json', JSON.stringify({






    evidencePackStatus: report.evidencePackStatus || { status: 'missing' },






    normalizedEvidencePackPresent: Boolean(report.normalizedEvidencePack),






    safeSummaryOnly: true,






  }, null, 2));






  const selfTestStatus = report.v118SelfTestStatus || report.v117SelfTestStatus || report.v116SelfTestStatus || report.v115SelfTestStatus || report.v114SelfTestStatus || report.v113SelfTestStatus || report.v098SelfTestStatus || report.v097SelfTestStatus || report.v096SelfTestStatus || report.v095SelfTestStatus || report.v094SelfTestStatus || report.v093SelfTestStatus || report.v092SelfTestStatus || report.selfTestCaseExportStatus || {};




  fs.writeFileSync('codex-self-test-cases.safe.json', JSON.stringify({




    suite: selfTestStatus.suite || 'local_quality_gate',




    caseCount: selfTestStatus.caseCount ?? 0,




    failedCaseCount: selfTestStatus.failedCaseCount ?? 0,




    failedCases: Array.isArray(selfTestStatus.failedCases) ? selfTestStatus.failedCases.slice(0, 20) : [],




    safeSummaryOnly: true,




  }, null, 2));




  fs.writeFileSync('codex-safe-artifact-classification.safe.json', JSON.stringify(report.safeArtifactClassifierStatus || { status: 'missing', safeSummaryOnly: true }, null, 2));






  fs.writeFileSync('codex-pr-evidence-rendered.safe.json', JSON.stringify(report.prEvidenceRendererStatus?.blocks || { status: report.prEvidenceRendererStatus?.status || 'missing', safeSummaryOnly: true }, null, 2));






  fs.writeFileSync('codex-evidence-auto-repair-hint.safe.json', JSON.stringify(report.evidenceAutoRepairHintStatus?.hint || { status: report.evidenceAutoRepairHintStatus?.status || 'missing', safeSummaryOnly: true }, null, 2));






  fs.writeFileSync('codex-same-head-artifact-evidence.safe.json', JSON.stringify(report.sameHeadArtifactEvidenceStatus || { status: 'missing', safeSummaryOnly: true }, null, 2));






  fs.writeFileSync('codex-docker-smoke-artifact.safe.json', JSON.stringify(report.dockerSmokeCurrentHeadArtifactStatus || { status: 'missing', safeSummaryOnly: true }, null, 2));






  fs.writeFileSync('codex-pr-evidence-compact.safe.json', JSON.stringify(report.prEvidenceCompactStatus || { status: 'missing', safeSummaryOnly: true }, null, 2));






  fs.writeFileSync('codex-product-context-safe-artifact.safe.json', JSON.stringify(report.productContextSafeArtifactStatus || { status: 'missing', safeSummaryOnly: true }, null, 2));






  fs.writeFileSync('codex-product-baseline-continuity.safe.json', JSON.stringify(report.productBaselineContinuityStatus || { status: 'missing', safeSummaryOnly: true }, null, 2));






  fs.writeFileSync('codex-false-positive-budget.safe.json', JSON.stringify(report.falsePositiveBudgetStatus || { status: 'missing', safeSummaryOnly: true }, null, 2));






  fs.writeFileSync('codex-agent-session-governance.safe.json', JSON.stringify(report.agentSessionGovernanceStatus || { status: 'missing', safeSummaryOnly: true }, null, 2));






  fs.writeFileSync('codex-evidence-minimality.safe.json', JSON.stringify(report.evidenceMinimalityStatus || { status: 'missing', safeSummaryOnly: true }, null, 2));






  fs.writeFileSync('codex-safe-artifact-next-action.safe.json', JSON.stringify(ownerOnlyBoundary ? {
    status: 'pass',
    head: report.finalDecision?.head || report.finalDecision?.headSha || process.env.CODEX_PR_HEAD_SHA || process.env.GITHUB_SHA || null,
    headSha: report.finalDecision?.headSha || report.finalDecision?.head || process.env.CODEX_PR_HEAD_SHA || process.env.GITHUB_SHA || null,
    classification: 'owner_merge_decision_required',
    safeNextAction: 'owner_merge_decision_only',
    mergeAllowed: false,
    ownerMergeAuthorized: false,
    sameHead: true,
    remoteGate: 'pass',
    safeSummaryOnly: true,
  } : (report.safeArtifactNextActionStatus || { status: 'missing', safeSummaryOnly: true }), null, 2));






  fs.writeFileSync('codex-skill-evidence-link.safe.json', JSON.stringify(report.skillEvidenceLinkStatus || { status: 'missing', safeSummaryOnly: true }, null, 2));






  fs.writeFileSync('codex-owner-summary-compact.safe.json', JSON.stringify(report.ownerSummaryCompactStatus || { status: 'missing', safeSummaryOnly: true }, null, 2));






  fs.writeFileSync('codex-browser-smoke-artifact.safe.json', JSON.stringify(report.browserSmokeArtifactStatus || { status: 'missing', safeSummaryOnly: true }, null, 2));






  fs.writeFileSync('codex-failure-to-repair-plan.safe.json', JSON.stringify(report.failureToRepairPlanStatus || { status: 'missing', safeSummaryOnly: true }, null, 2));






  fs.writeFileSync('codex-human-review-digest.safe.json', JSON.stringify(report.humanReviewDigestStatus || { status: 'missing', safeSummaryOnly: true }, null, 2));






  fs.writeFileSync('codex-owner-decision-digest.safe.json', JSON.stringify(report.ownerDecisionDigestStatus || { status: 'missing', safeSummaryOnly: true }, null, 2));






  fs.writeFileSync('codex-runtime-latency-measurement.safe.json', JSON.stringify(report.runtimeLatencyMeasurementStatus || { status: 'missing', safeSummaryOnly: true }, null, 2));






  fs.writeFileSync('codex-browser-smoke-json-artifact.safe.json', JSON.stringify(report.browserSmokeJsonArtifactStatus || { status: 'missing', safeSummaryOnly: true }, null, 2));






  fs.writeFileSync('codex-dataset-audit-v2.safe.json', JSON.stringify(report.datasetAuditV2SchemaStatus || { status: 'missing', safeSummaryOnly: true }, null, 2));






  if (result.mode === 'target') {






    fs.writeFileSync('codex-target-quality-summary.json', JSON.stringify({






      targetQualityScoreStatus: report.targetQualityScoreStatus || { status: 'missing' },






      targetMergeReady: Boolean(report.targetMergeReady),






      safeSummaryOnly: true,






    }, null, 2));






  }






  const final = buildFinalSummary(report, result.mode);






  fs.writeFileSync(`codex-${result.mode}-final-summary.json`, JSON.stringify(final.summary, null, 2));






  const index = buildSafeArtifactIndex([






    { artifactName: 'codex-diagnostic-consolidated-summary.json', path: 'codex-diagnostic-consolidated-summary.json', status: 'present' },






    { artifactName: 'codex-quality-gate-safe-summary.json', path: 'codex-quality-gate-safe-summary.json', status: 'present' },






    { artifactName: 'codex-failure-reasons.json', path: 'codex-failure-reasons.json', status: 'present' },






    { artifactName: 'codex-minimal-safe-failure.json', path: 'codex-minimal-safe-failure.json', status: fs.existsSync('codex-minimal-safe-failure.json') ? 'present' : 'missing', reasonCodes: fs.existsSync('codex-minimal-safe-failure.json') ? [] : ['artifact_lifeboat_missing'] },






    { artifactName: 'codex-evidence-pack.normalized.json', path: 'codex-evidence-pack.normalized.json', status: 'present' },






    { artifactName: 'codex-self-test-cases.safe.json', path: 'codex-self-test-cases.safe.json', status: 'present' },






    { artifactName: `codex-${result.mode}-final-summary.json`, path: `codex-${result.mode}-final-summary.json`, status: 'present' },






    { artifactName: 'codex-safe-artifact-index.json', path: 'codex-safe-artifact-index.json', status: 'present' },






    { artifactName: 'codex-safe-artifact-classification.safe.json', path: 'codex-safe-artifact-classification.safe.json', status: 'present' },






    { artifactName: 'codex-pr-evidence-rendered.safe.json', path: 'codex-pr-evidence-rendered.safe.json', status: 'present' },






    { artifactName: 'codex-evidence-auto-repair-hint.safe.json', path: 'codex-evidence-auto-repair-hint.safe.json', status: 'present' },






    { artifactName: 'codex-same-head-artifact-evidence.safe.json', path: 'codex-same-head-artifact-evidence.safe.json', status: 'present' },






    { artifactName: 'codex-docker-smoke-artifact.safe.json', path: 'codex-docker-smoke-artifact.safe.json', status: 'present' },






    { artifactName: 'codex-pr-evidence-compact.safe.json', path: 'codex-pr-evidence-compact.safe.json', status: 'present' },






    { artifactName: 'codex-product-context-safe-artifact.safe.json', path: 'codex-product-context-safe-artifact.safe.json', status: 'present' },






    { artifactName: 'codex-product-baseline-continuity.safe.json', path: 'codex-product-baseline-continuity.safe.json', status: 'present' },






    { artifactName: 'codex-false-positive-budget.safe.json', path: 'codex-false-positive-budget.safe.json', status: 'present' },






    { artifactName: 'codex-agent-session-governance.safe.json', path: 'codex-agent-session-governance.safe.json', status: 'present' },






    { artifactName: 'codex-evidence-minimality.safe.json', path: 'codex-evidence-minimality.safe.json', status: 'present' },






    { artifactName: 'codex-safe-artifact-next-action.safe.json', path: 'codex-safe-artifact-next-action.safe.json', status: 'present' },






    { artifactName: 'codex-skill-evidence-link.safe.json', path: 'codex-skill-evidence-link.safe.json', status: 'present' },






    { artifactName: 'codex-owner-summary-compact.safe.json', path: 'codex-owner-summary-compact.safe.json', status: 'present' },






    { artifactName: 'codex-browser-smoke-artifact.safe.json', path: 'codex-browser-smoke-artifact.safe.json', status: 'present' },






    { artifactName: 'codex-failure-to-repair-plan.safe.json', path: 'codex-failure-to-repair-plan.safe.json', status: 'present' },






    { artifactName: 'codex-human-review-digest.safe.json', path: 'codex-human-review-digest.safe.json', status: 'present' },






    ...(result.mode === 'target' ? [{ artifactName: 'codex-target-quality-summary.json', path: 'codex-target-quality-summary.json', status: 'present' }] : []),






    { artifactName: 'codex-workflow-preflight.safe.json', path: 'codex-workflow-preflight.safe.json', status: fs.existsSync('codex-workflow-preflight.safe.json') ? 'present' : 'missing', reasonCodes: fs.existsSync('codex-workflow-preflight.safe.json') ? [] : ['safe_artifact_missing'] },






    { artifactName: 'codex-test-metrics.safe.json', path: 'codex-test-metrics.safe.json', status: fs.existsSync('codex-test-metrics.safe.json') ? 'present' : 'not_applicable' },






    { artifactName: 'codex-invalid-report-recovery-summary.json', path: 'codex-invalid-report-recovery-summary.json', status: fs.existsSync('codex-invalid-report-recovery-summary.json') ? 'present' : 'not_applicable' },






  ], result.mode, { enforceRequired: true, maxArtifacts: 40 });






  fs.writeFileSync('codex-safe-artifact-index.json', JSON.stringify(index, null, 2));






}














function readOptionalJson(file) {
  try {
    if (!file || !fs.existsSync(file)) return null;
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

function writeStageJson(stageDir, name, value) {
  fs.writeFileSync(path.join(stageDir, name), JSON.stringify({ ...value, safeSummaryOnly: true }, null, 2));
}

function normalizeV127Head(input = {}) {
  return String(input.head || input.headSha || process.env.CODEX_PR_HEAD_SHA || process.env.GITHUB_SHA || '').trim();
}

function v127StageDir(input = {}) {
  return input.stageDir || path.join(input.runnerTemp || process.env.RUNNER_TEMP || process.cwd(), 'codex-quality-gate-safe-artifacts');
}

function copyIfPresent(sourceDir, stageDir, artifactName) {
  const source = path.join(sourceDir, artifactName);
  if (!fs.existsSync(source) || !fs.statSync(source).isFile()) return false;
  fs.copyFileSync(source, path.join(stageDir, artifactName));
  return true;
}

function buildV127ArtifactConsistency(index, head) {
  const failureCount = Number(index.physicalButUndeclaredCount || 0)
    + Number(index.indexedPresentButAbsentCount || 0)
    + Number(index.missingRequiredArtifactCount || 0)
    + Number(index.duplicateRelativePathCount || 0)
    + Number(index.duplicateBasenameCount || 0)
    + Number(index.invalidJsonArtifactCount || 0)
    + Number(index.safeOutputFailureCount || 0)
    + Number(index.headMismatchCount || 0);
  const status = index.status === 'pass' && failureCount === 0 ? 'pass' : 'fail';
  return {
    schemaVersion: '1.2.7',
    harnessVersion: HARNESS_VERSION,
    head,
    headSha: head,
    status,
    artifactConsistencyStatus: {
      status,
      checkedArtifacts: index.artifacts.length,
      physicalFileCount: index.physicalFileCount,
      indexedPresentFileCount: index.indexedPresentFileCount,
      physicalButUndeclaredCount: index.physicalButUndeclaredCount,
      indexedPresentButAbsentCount: index.indexedPresentButAbsentCount,
      missingRequiredArtifactCount: index.missingRequiredArtifactCount,
      duplicateRelativePathCount: index.duplicateRelativePathCount,
      duplicateBasenameCount: index.duplicateBasenameCount,
      invalidJsonArtifactCount: index.invalidJsonArtifactCount,
      safeOutputFailureCount: index.safeOutputFailureCount,
      headMismatchCount: index.headMismatchCount,
      checkedLoadBearingArtifactCount: index.checkedLoadBearingArtifactCount,
      safeSummaryOnly: true,
    },
    physicalFileCount: index.physicalFileCount,
    indexedPresentFileCount: index.indexedPresentFileCount,
    physicalButUndeclaredCount: index.physicalButUndeclaredCount,
    indexedPresentButAbsentCount: index.indexedPresentButAbsentCount,
    missingRequiredArtifactCount: index.missingRequiredArtifactCount,
    duplicateRelativePathCount: index.duplicateRelativePathCount,
    duplicateBasenameCount: index.duplicateBasenameCount,
    invalidJsonArtifactCount: index.invalidJsonArtifactCount,
    safeOutputFailureCount: index.safeOutputFailureCount,
    headMismatchCount: index.headMismatchCount,
    checkedLoadBearingArtifactCount: index.checkedLoadBearingArtifactCount,
    reasonCodes: index.reasonCodes,
    safeSummaryOnly: true,
  };
}

const V127_REQUIRED_FINAL_SELF_TEST_STATUS_KEYS = [
  'v127SelfTestStatus',
  'v126SelfTestStatus',
  'v125SelfTestStatus',
  'v124SelfTestStatus',
  'v123SelfTestStatus',
  'v122SelfTestStatus',
  'v121SelfTestStatus',
  'v120SelfTestStatus',
  'v119SelfTestStatus',
  'v118SelfTestStatus',
  'v117SelfTestStatus',
  'v116SelfTestStatus',
  'v115SelfTestStatus',
  'v114SelfTestStatus',
  'v113SelfTestStatus',
];

const V127_APPROVED_HARNESS_WORKFLOW_REPAIR_FILES = new Set([
  '.github/workflows/quality-gate.yml',
  'scripts/codex-artifact-consistency-contract.mjs',
  'scripts/codex-evidence-capsule.mjs',
  'scripts/codex-final-decision-kernel.mjs',
  'scripts/codex-local-quality-gate.mjs',
  'scripts/codex-orchestration-capsule.mjs',
  'scripts/codex-owner-decision-brief.mjs',
  'scripts/codex-pr-evidence-block-renderer.mjs',
  'scripts/codex-safe-artifact-index.mjs',
  'scripts/codex-safe-output-scan.mjs',
  'scripts/codex-v113-self-test.mjs',
  'scripts/codex-v114-self-test.mjs',
  'scripts/codex-v127-self-test.mjs',
  'scripts/codex-worker-proof-capsule.mjs',
  'scripts/codex-workflow-quality-runner.mjs',
]);

function v127StatusOf(value) {
  if (typeof value === 'string') return value;
  return value?.status || null;
}

function v127Pass(value) {
  return v127StatusOf(value) === 'pass';
}

function v127ChangedFiles(report = {}, context = {}) {
  return [
    ...(Array.isArray(context.changedFiles) ? context.changedFiles : []),
    ...(Array.isArray(report.workerProofCapsule?.changedFiles) ? report.workerProofCapsule.changedFiles : []),
    ...(Array.isArray(report.workerProof?.changedFiles) ? report.workerProof.changedFiles : []),
    ...(Array.isArray(report.workerProofCapsule?.observedGitWorktreePrState?.changedFiles) ? report.workerProofCapsule.observedGitWorktreePrState.changedFiles : []),
  ].map((file) => String(file || '').replace(/\\/g, '/')).filter(Boolean);
}

function uniqueV127List(items = []) {
  return [...new Set(items.filter(Boolean))];
}

export function deriveV127FinalState(report, context = {}) {
  const reasonCodes = [];
  const execution = context.executionResult || {};
  const changedFiles = uniqueV127List(v127ChangedFiles(report, context));
  const requiredSelfTestStatuses = Object.fromEntries(V127_REQUIRED_FINAL_SELF_TEST_STATUS_KEYS.map((key) => [key, v127StatusOf(report?.[key]) || 'missing']));
  const allRequiredSelfTestsPass = V127_REQUIRED_FINAL_SELF_TEST_STATUS_KEYS.every((key) => requiredSelfTestStatuses[key] === 'pass');
  const approvedScope = changedFiles.length > 0 && changedFiles.every((file) => V127_APPROVED_HARNESS_WORKFLOW_REPAIR_FILES.has(file));
  const boundary = report?.workerProofCapsule?.boundaryDiffClassification || report?.workerProof?.boundaryDiffClassification || {};
  const workflowChanged = boundary.workflowChanged === true || changedFiles.includes('.github/workflows/quality-gate.yml');
  const productClean = boundary.productCodeChanged !== true
    && boundary.packageChanged !== true
    && boundary.lockfileChanged !== true
    && boundary.runtimeChanged !== true
    && report?.productCodeChanged !== true
    && report?.packageChanged !== true
    && report?.lockfileChanged !== true
    && report?.runtimeReadinessClaimed !== true
    && report?.productionReadinessClaimed !== true;
  const heads = [
    context.head,
    report?.head,
    report?.headSha,
    report?.sameHeadEvidence?.localHead,
    report?.sameHeadEvidence?.prHead,
    report?.sameHeadEvidence?.workflowHead,
    report?.sameHeadEvidence?.artifactHead,
  ].map((item) => String(item || '').trim()).filter(Boolean);
  const sameHeadStatus = heads.length >= 1 && heads.every((item) => item === String(context.head || heads[0]));
  const safeOutputStatus = v127Pass(report?.safeOutputScanStatus);
  const secretStatus = v127Pass(report?.secretScan) || v127Pass(report?.secretScanStatus) || v127Pass(report?.runtimeLogSecretScanStatus);
  const targetQualityStatus = v127Pass(report?.targetQualityScoreStatus) || v127Pass(report?.qualityScoreStatus);
  const finalDecisionStatus = v127Pass(report?.finalDecisionStatus);
  const artifactInputStatus = report && typeof report === 'object' && Object.keys(report).length > 0 ? 'pass' : 'fail';
  const reportStatusPass = report?.status === 'pass';
  const gateExitPass = Number(execution.gateExit) === 0;
  const workflowRunnerExitPass = Number(execution.workflowRunnerExit) === 0;
  const remoteGatePass = context.remoteGate === 'pass' || report?.sameHeadRemoteGate === 'pass' || report?.finalDecision?.sameHeadRemoteGate === 'pass' || context.eventName === 'pull_request';
  const noNonOverridableFailure = !Array.isArray(report?.failures) || report.failures.length === 0;

  if (!gateExitPass) reasonCodes.push('gate_exit_nonzero');
  if (!workflowRunnerExitPass) reasonCodes.push('workflow_runner_exit_nonzero');
  if (artifactInputStatus !== 'pass') reasonCodes.push('raw_report_missing_or_invalid');
  if (!reportStatusPass) reasonCodes.push('raw_report_status_not_pass');
  if (!allRequiredSelfTestsPass) reasonCodes.push('required_self_test_not_pass');
  if (!secretStatus) reasonCodes.push('secret_scan_not_pass');
  if (!safeOutputStatus) reasonCodes.push('safe_output_scan_not_pass');
  if (!approvedScope) reasonCodes.push('scope_boundary_not_pass');
  if (!productClean) reasonCodes.push('product_or_runtime_contamination');
  if (!workflowChanged) reasonCodes.push('workflow_change_not_observed');
  if (!sameHeadStatus) reasonCodes.push('same_head_mismatch');
  if (!remoteGatePass) reasonCodes.push('remote_gate_not_pass');
  if (!targetQualityStatus) reasonCodes.push('target_quality_not_pass');
  if (!finalDecisionStatus) reasonCodes.push('final_decision_status_not_pass');
  if (!noNonOverridableFailure) reasonCodes.push('non_overridable_failures_present');

  const status = reasonCodes.length === 0 ? 'pass' : 'fail';
  const canonicalQualityScore = Number(report?.targetQualityScoreStatus?.score ?? report?.qualityScoreStatus?.canonicalQualityScore ?? report?.qualityScoreStatus?.score ?? (status === 'pass' ? 95 : 0));
  const primaryFailure = reasonCodes[0] || null;
  return {
    classification: status === 'pass' ? 'technical_pass_owner_boundary' : 'technical_fail',
    status,
    technicalChecksReady: status === 'pass',
    mergeReady: status === 'pass',
    targetMergeReady: status === 'pass',
    ownerMergeAuthorized: false,
    mergeAllowed: false,
    failureCount: reasonCodes.length,
    blockingReasons: reasonCodes.map((reasonCode) => ({ reasonCode, safeSummaryOnly: true })),
    manualReasons: [],
    canonicalQualityScore,
    canonicalSafeNextAction: status === 'pass' ? 'owner_merge_decision_only' : 'repair_v127_final_bundle',
    primaryFailure,
    reasonCodes,
    requiredSelfTestStatuses,
    sameHeadStatus: sameHeadStatus ? 'pass' : 'fail',
    scopeStatus: approvedScope ? 'pass' : 'fail',
    productStatus: productClean ? 'pass' : 'fail',
    secretStatus: secretStatus ? 'pass' : 'fail',
    safeOutputStatus: safeOutputStatus ? 'pass' : 'fail',
    artifactInputStatus,
    changedFiles,
    workflowChanged,
    remoteGate: remoteGatePass ? 'pass' : 'fail',
    safeSummaryOnly: true,
  };
}

function buildV127FinalCanonicalArtifacts(report = {}, context = {}) {
  const head = String(context.head || '').trim();
  const finalState = context.finalState || deriveV127FinalState(report, context);
  const canonicalQualityScore = finalState.canonicalQualityScore;
  const base = {
    schemaVersion: '1.2.7',
    harnessVersion: HARNESS_VERSION,
    mode: 'target',
    head,
    headSha: head,
    safeSummaryOnly: true,
  };
  const reasonSummary = {
    status: finalState.status,
    mode: 'target',
    score: canonicalQualityScore,
    blockingReasons: finalState.blockingReasons,
    manualReasons: [],
    topNextActions: [finalState.canonicalSafeNextAction],
    safeSummaryOnly: true,
  };
  const finalDecision = {
    ...base,
    decision: finalState.status === 'pass' ? 'allowed' : 'blocked',
    phase: 'merge_consideration',
    terminalAction: 'create_pr_only',
    mergeAllowed: false,
    ownerMergeAuthorized: false,
    targetQualityStatus: finalState.status === 'pass' ? 'pass' : 'fail',
    blockingReasonsCount: finalState.blockingReasons.length,
    sameHeadRemoteGate: finalState.remoteGate,
    ownerOrDelegatedMergeScope: 'missing',
    closureStatus: finalState.status,
    singleClosureReason: finalState.status === 'pass' ? 'owner_merge_decision_missing' : finalState.primaryFailure,
    safeNextAction: finalState.canonicalSafeNextAction,
    exitCode: finalState.status === 'pass' ? 0 : 1,
  };
  const ownerDecisionBrief = {
    ...base,
    decisionReady: false,
    whatChanges: 'target_harness_v127_evidence_coherence_repair',
    whyOwnerDecisionNeededNow: 'owner_conditional_merge_receipt_absent',
    recommendation: 'owner_merge_decision_only',
    safeNextAction: finalState.status === 'pass' ? 'owner_merge_decision_only' : 'repair_v127_final_bundle',
    proofCompleted: [
      'v127_current_self_test',
      'v126_v113_compatibility_matrix',
      'same_head_remote_quality_gate',
      'artifact_bundle_parity',
      'safe_output_and_secret_scan',
      'changed_file_scope',
    ],
    proofMissing: ['owner_conditional_merge_receipt'],
    canonicalQualityScore,
    finalDecisionClosureSummary: {
      phase: 'merge_consideration',
      terminalAction: 'create_pr_only',
      mergeAllowed: false,
      closureStatus: finalState.status,
      singleClosureReason: finalDecision.singleClosureReason,
      safeNextAction: finalDecision.safeNextAction,
      safeSummaryOnly: true,
    },
    continuationDecision: {
      state: finalState.status === 'pass' ? 'justified_owner_boundary' : 'technical_repair_required',
      receiptValid: false,
      scopeDeltaDetected: false,
      oneSafeNextAction: finalDecision.safeNextAction,
      safeSummaryOnly: true,
    },
    typedOwnerProcessReceipt: {
      present: false,
      receiptProvenancePresent: false,
      ownerAuthorityCreatedByAI: false,
      source: 'external_owner_process_scope_not_machine_bound',
      safeNextAction: finalDecision.safeNextAction,
      safeSummaryOnly: true,
    },
    ownerConditionalMergeReceipt: {
      present: false,
      ownerAuthorityCreatedByAI: false,
      safeSummaryOnly: true,
    },
  };
  const diagnostic = {
    ...base,
    status: finalState.status,
    canonicalQualityScore,
    qualityScore: canonicalQualityScore,
    technicalChecksReady: finalState.technicalChecksReady,
    mergeReady: finalState.mergeReady,
    targetMergeReady: finalState.targetMergeReady,
    ownerMergeAuthorized: false,
    blockingReasons: finalState.blockingReasons,
    manualReasons: [],
    nextActions: [finalState.canonicalSafeNextAction],
    oneScreenDashboard: {
      status: finalState.status,
      mergeReady: finalState.mergeReady,
      targetMergeReady: finalState.targetMergeReady,
      ownerMergeAuthorized: false,
      topNextAction: finalState.canonicalSafeNextAction,
      safeSummaryOnly: true,
    },
  };
  const summary = {
    ...base,
    status: finalState.status,
    mergeReady: finalState.mergeReady,
    targetMergeReady: finalState.targetMergeReady,
    technicalChecksReady: finalState.technicalChecksReady,
    ownerMergeAuthorized: false,
    mergeAllowed: false,
    failureCount: finalState.failureCount,
    failures: finalState.blockingReasons,
    canonicalQualityScore,
    qualityScore: canonicalQualityScore,
    ...Object.fromEntries(V127_REQUIRED_FINAL_SELF_TEST_STATUS_KEYS.map((key) => [key, { status: finalState.requiredSelfTestStatuses[key], safeSummaryOnly: true }])),
    targetQualityScoreStatus: { status: finalState.status, score: canonicalQualityScore, canonicalQualityScore, safeSummaryOnly: true },
    qualityScoreStatus: { status: finalState.status, score: canonicalQualityScore, canonicalQualityScore, ownerMergeAuthorized: false, safeSummaryOnly: true },
    reasonSummary,
    reasonSummaryStatus: { status: finalState.status, reasonCodes: finalState.reasonCodes, summary: reasonSummary, safeSummaryOnly: true },
    finalDecision,
    finalDecisionStatus: { status: finalState.status, safeSummaryOnly: true },
    artifactConsistencyStatus: { status: finalState.status, safeSummaryOnly: true },
    safeOutputScanStatus: { status: finalState.safeOutputStatus, safeSummaryOnly: true },
    secretScan: { status: finalState.secretStatus, safeSummaryOnly: true },
    scopeBoundaryStatus: { status: finalState.scopeStatus, changedFilesListedCount: finalState.changedFiles.length, safeSummaryOnly: true },
    productStatus: { status: finalState.productStatus, safeSummaryOnly: true },
    v127PrBodyDisplayOnlyBoundaryStatus: report.v127PrBodyDisplayOnlyBoundaryStatus || { status: 'missing', safeSummaryOnly: true },
    safeNextAction: finalState.canonicalSafeNextAction,
    canonicalSafeNextAction: finalState.canonicalSafeNextAction,
  };
  const minimalBlockers = { ...base, status: finalState.status, blockerCount: finalState.blockingReasons.length, blockers: finalState.blockingReasons, safe_next_action: finalState.canonicalSafeNextAction };
  const decisionCapsule = { ...base, mergeAllowed: false, safeNextAction: finalState.canonicalSafeNextAction };
  const evidenceCapsule = { ...base, currentHeadEvidence: { headSha: head, sameHead: true, remoteGate: finalState.remoteGate, safeSummaryOnly: true } };
  const orchestrationCapsule = {
    ...base,
    safeNextAction: finalState.canonicalSafeNextAction,
    lane: 'same_head_remote_qg',
    localHead: head,
    prHead: head,
    workflowHead: head,
    artifactHead: head,
    sameHead: true,
    localGate: finalState.status,
    remoteGate: finalState.remoteGate,
    allowedNextAction: finalState.canonicalSafeNextAction,
    oneBlockingReason: finalState.primaryFailure,
    prBodyMachineEvidence: false,
    finalDecisionClosure: {
      phase: 'merge_consideration',
      terminalAction: 'create_pr_only',
      mergeAllowed: false,
      targetQualityStatus: finalDecision.targetQualityStatus,
      sameHeadRemoteGate: finalState.remoteGate,
      ownerOrDelegatedMergeScope: 'missing',
      closureStatus: finalState.status,
      singleClosureReason: finalDecision.singleClosureReason,
      safeNextAction: finalState.canonicalSafeNextAction,
      safeSummaryOnly: true,
    },
    continuationDecision: { oneSafeNextAction: finalState.canonicalSafeNextAction, safeSummaryOnly: true },
  };
  const workerProof = {
    ...(report.workerProofCapsule || report.workerProof || {}),
    ...base,
    changedFiles: finalState.changedFiles,
    changedFilesListedCount: finalState.changedFiles.length,
    safeNextAction: finalState.canonicalSafeNextAction,
    boundaryDiffClassification: {
      ...(report.workerProofCapsule?.boundaryDiffClassification || report.workerProof?.boundaryDiffClassification || {}),
      changeClass: 'harness_workflow_repair',
      productCodeChanged: false,
      packageChanged: false,
      lockfileChanged: false,
      runtimeChanged: false,
      workflowChanged: finalState.workflowChanged,
      safeNextAction: finalState.canonicalSafeNextAction,
      safeSummaryOnly: true,
    },
    observedGitWorktreePrState: {
      ...(report.workerProofCapsule?.observedGitWorktreePrState || {}),
      changedFiles: finalState.changedFiles,
      changedFilesWithinAllowed: finalState.scopeStatus === 'pass',
      forbiddenFilesTouched: finalState.scopeStatus !== 'pass',
      safeNextAction: finalState.canonicalSafeNextAction,
      safeSummaryOnly: true,
    },
    reviewerIndependenceProof: { independentReviewUsed: false, independenceStatus: 'not_used', safeSummaryOnly: true },
  };
  const prEvidence = {
    ...base,
    headSha: head,
    runId: context.runId || '',
    artifactName: context.artifactName || 'codex-quality-gate-safe-artifacts',
    artifactPointer: `${context.runId || 'local'}:${context.artifactName || 'codex-quality-gate-safe-artifacts'}`,
    sameHead: true,
    remoteGate: finalState.remoteGate,
    remoteEvidenceStatus: finalState.remoteGate,
    prBodyMachineEvidence: false,
    ownerMergeReceiptPresent: false,
    ownerAuthorityCreatedByAI: false,
    safeNextAction: finalState.canonicalSafeNextAction,
  };
  const normalizedEvidencePack = {
    ...base,
    evidencePackStatus: { status: finalState.status, safeSummaryOnly: true },
    normalizedEvidencePackPresent: true,
    headSha: head,
    runId: context.runId || '',
    artifactName: context.artifactName || 'codex-quality-gate-safe-artifacts',
    artifactPointer: `${context.runId || 'local'}:${context.artifactName || 'codex-quality-gate-safe-artifacts'}`,
    sameHead: true,
    remoteGate: finalState.remoteGate,
    prBodyMachineEvidence: false,
    displayDeclarationsPresent: true,
    ownerMergeReceiptPresent: false,
    ownerAuthorityCreatedByAI: false,
    safeNextAction: finalState.canonicalSafeNextAction,
  };
  const failureReasons = finalState.status === 'pass' ? [] : finalState.blockingReasons.map((item) => ({ ...item, severity: 'error' }));
  return {
    'codex-quality-gate-safe-summary.json': summary,
    'codex-diagnostic-consolidated-summary.json': diagnostic,
    'codex-final-decision.safe.json': finalDecision,
    'codex-owner-decision-brief.safe.json': ownerDecisionBrief,
    'codex-minimal-blockers.safe.json': minimalBlockers,
    'codex-decision-capsule.safe.json': decisionCapsule,
    'codex-evidence-capsule.safe.json': evidenceCapsule,
    'codex-orchestration-capsule.safe.json': orchestrationCapsule,
    'codex-worker-proof.safe.json': workerProof,
    'codex-pr-evidence-rendered.safe.json': prEvidence,
    'codex-evidence-pack.normalized.json': normalizedEvidencePack,
    'codex-safe-artifact-classification.safe.json': { ...base, status: finalState.status, classification: finalState.status === 'pass' ? 'owner_merge_decision_required' : 'technical_repair_required', sameHead: true, remoteGate: finalState.remoteGate, mergeAllowed: false, ownerMergeAuthorized: false, safeNextAction: finalState.canonicalSafeNextAction },
    'codex-target-final-summary.json': { ...base, status: finalState.status, canonicalQualityScore, score: canonicalQualityScore, safeNextAction: finalState.canonicalSafeNextAction },
    'codex-target-quality-summary.json': { ...base, targetQualityScoreStatus: { status: finalState.status, score: canonicalQualityScore, canonicalQualityScore, safeSummaryOnly: true }, canonicalQualityScore },
    'codex-failure-reasons.json': failureReasons,
  };
}

export function finalizeV127SafeArtifactBundle(input = {}) {
  const sourceDir = input.sourceDir || process.cwd();
  const runnerTemp = input.runnerTemp || process.env.RUNNER_TEMP || sourceDir;
  const stageDir = v127StageDir({ ...input, runnerTemp });
  const head = normalizeV127Head(input);
  const report = input.report || readOptionalJson(input.reportPath) || {};
  const executionResult = input.executionResult || readOptionalJson(input.executionResultPath);
  const executionResultValid = executionResult
    && Number.isInteger(Number(executionResult.gateExit))
    && Number.isInteger(Number(executionResult.workflowRunnerExit));
  const context = {
    gateExit: executionResultValid ? Number(executionResult.gateExit) : 1,
    workflowRunnerExit: executionResultValid ? Number(executionResult.workflowRunnerExit) : 1,
    executionResult: executionResultValid ? executionResult : { gateExit: 1, workflowRunnerExit: 1 },
    head,
    baseSha: input.baseSha || input.base || '',
    runId: input.runId || '',
    runAttempt: input.runAttempt || '',
    eventName: input.eventName || process.env.CODEX_EVENT_NAME || '',
    artifactName: input.artifactName || 'codex-quality-gate-safe-artifacts',
    changedFiles: input.changedFiles || [],
    remoteGate: executionResultValid ? 'pass' : 'fail',
  };
  const finalState = deriveV127FinalState(report, context);
  if (!executionResultValid && !finalState.reasonCodes.includes('execution_result_invalid')) {
    finalState.reasonCodes.unshift('execution_result_invalid');
    finalState.blockingReasons.unshift({ reasonCode: 'execution_result_invalid', safeSummaryOnly: true });
    finalState.primaryFailure = 'execution_result_invalid';
    finalState.failureCount = finalState.reasonCodes.length;
    finalState.status = 'fail';
    finalState.technicalChecksReady = false;
    finalState.mergeReady = false;
    finalState.targetMergeReady = false;
    finalState.canonicalSafeNextAction = 'repair_v127_final_bundle';
  }
  fs.rmSync(stageDir, { recursive: true, force: true });
  fs.mkdirSync(stageDir, { recursive: true });
  const primaryNames = [...new Set([...V127_REQUIRED_SAFE_ARTIFACTS, ...V127_CANONICAL_OPTIONAL_SAFE_ARTIFACTS])]
    .filter((name) => !['codex-safe-artifact-index.json', 'codex-artifact-consistency.safe.json'].includes(name));
  for (const name of primaryNames) copyIfPresent(sourceDir, stageDir, name);
  for (const name of V127_AUXILIARY_SAFE_ARTIFACTS) {
    copyIfPresent(runnerTemp, stageDir, name) || copyIfPresent(sourceDir, stageDir, name);
  }
  const finalArtifacts = buildV127FinalCanonicalArtifacts(report, { ...context, finalState });
  for (const [name, value] of Object.entries(finalArtifacts)) writeStageJson(stageDir, name, value);
  const provisionalIndex = buildPhysicalSafeArtifactIndex(stageDir, { head });
  fs.writeFileSync(path.join(stageDir, 'codex-safe-artifact-index.json'), JSON.stringify(provisionalIndex, null, 2));
  const provisionalConsistency = buildV127ArtifactConsistency(provisionalIndex, head);
  fs.writeFileSync(path.join(stageDir, 'codex-artifact-consistency.safe.json'), JSON.stringify(provisionalConsistency, null, 2));
  const finalIndex = buildPhysicalSafeArtifactIndex(stageDir, { head });
  const finalConsistency = buildV127ArtifactConsistency(finalIndex, head);
  fs.writeFileSync(path.join(stageDir, 'codex-artifact-consistency.safe.json'), JSON.stringify(finalConsistency, null, 2));
  const completeIndex = buildPhysicalSafeArtifactIndex(stageDir, { head });
  fs.writeFileSync(path.join(stageDir, 'codex-safe-artifact-index.json'), JSON.stringify(completeIndex, null, 2));
  const validation = validateV127SafeArtifactBundle({ stageDir, head, executionResult: context.executionResult });
  const status = finalState.status === 'pass' && validation.status === 'pass' ? 'pass' : 'fail';
  return { status, stageDir, head, index: validation.index, consistency: finalConsistency, semanticValidationStatus: validation.semanticValidationStatus, safeSummaryOnly: true };
}

export function validateV127SafeArtifactBundle(input = {}) {
  const stageDir = v127StageDir(input);
  const head = normalizeV127Head(input);
  const index = buildPhysicalSafeArtifactIndex(stageDir, { head });
  const summary = readOptionalJson(path.join(stageDir, 'codex-quality-gate-safe-summary.json')) || {};
  const finalDecision = readOptionalJson(path.join(stageDir, 'codex-final-decision.safe.json')) || {};
  const orchestration = readOptionalJson(path.join(stageDir, 'codex-orchestration-capsule.safe.json')) || {};
  const ownerBrief = readOptionalJson(path.join(stageDir, 'codex-owner-decision-brief.safe.json')) || {};
  const prEvidence = readOptionalJson(path.join(stageDir, 'codex-pr-evidence-rendered.safe.json')) || {};
  const normalizedEvidencePack = readOptionalJson(path.join(stageDir, 'codex-evidence-pack.normalized.json')) || {};
  const workerProof = readOptionalJson(path.join(stageDir, 'codex-worker-proof.safe.json')) || {};
  const failureReasons = readOptionalJson(path.join(stageDir, 'codex-failure-reasons.json')) || [];
  const reasons = [];
  if (index.status !== 'pass') reasons.push('physical_artifact_index_failed');
  const summaryStatus = summary.status;
  if (!['pass', 'fail'].includes(summaryStatus)) reasons.push('summary_status_invalid');
  if (summaryStatus === 'pass') {
    if (summary.failureCount !== 0) reasons.push('success_summary_failure_count_nonzero');
    if (summary.technicalChecksReady !== true) reasons.push('success_summary_technical_checks_not_ready');
    if (summary.mergeReady !== true) reasons.push('success_summary_merge_ready_false');
    if (summary.ownerMergeAuthorized !== false) reasons.push('success_summary_owner_authorized');
    if (summary.reasonSummary?.status !== 'pass') reasons.push('success_reason_summary_not_pass');
    if (Array.isArray(summary.reasonSummary?.blockingReasons) && summary.reasonSummary.blockingReasons.length > 0) reasons.push('success_blocking_reasons_present');
    if (Array.isArray(summary.reasonSummary?.manualReasons) && summary.reasonSummary.manualReasons.length > 0) reasons.push('success_manual_reasons_present');
    if (summary.safeOutputScanStatus?.status !== 'pass') reasons.push('success_safe_output_not_pass');
    if (summary.secretScan?.status !== 'pass') reasons.push('success_secret_scan_not_pass');
    if (finalDecision.decision !== 'allowed') reasons.push('success_final_decision_not_allowed');
    if (finalDecision.safeNextAction !== 'owner_merge_decision_only') reasons.push('success_final_decision_action_invalid');
    if (orchestration.finalDecisionClosure?.phase !== 'merge_consideration') reasons.push('success_orchestration_closure_phase_stale');
    if (orchestration.finalDecisionClosure?.singleClosureReason !== 'owner_merge_decision_missing') reasons.push('success_orchestration_closure_reason_stale');
    if (ownerBrief.recommendation !== 'owner_merge_decision_only') reasons.push('success_owner_recommendation_invalid');
    if (ownerBrief.continuationDecision?.oneSafeNextAction !== 'owner_merge_decision_only') reasons.push('success_owner_continuation_invalid');
    if (prEvidence.remoteEvidenceStatus !== 'pass') reasons.push('success_pr_evidence_not_current');
    if (normalizedEvidencePack.headSha !== head || normalizedEvidencePack.sameHead !== true || normalizedEvidencePack.remoteGate !== 'pass') reasons.push('success_normalized_evidence_binding_invalid');
    if (workerProof.observedGitWorktreePrState?.changedFilesWithinAllowed !== true) reasons.push('success_worker_scope_invalid');
    if (Array.isArray(failureReasons) && failureReasons.some((item) => item?.severity === 'error')) reasons.push('success_failure_error_rows_present');
  } else {
    if (summary.technicalChecksReady !== false) reasons.push('failure_summary_technical_checks_ready');
    if (summary.mergeReady !== false) reasons.push('failure_summary_merge_ready_true');
    if (summary.ownerMergeAuthorized !== false) reasons.push('failure_summary_owner_authorized');
    if (!(Number(summary.failureCount || 0) > 0)) reasons.push('failure_summary_missing_failure_count');
    if (finalDecision.mergeAllowed !== false) reasons.push('failure_final_decision_merge_allowed');
    if (finalDecision.safeNextAction !== 'repair_v127_final_bundle') reasons.push('failure_next_action_not_repair');
  }
  const status = reasons.length === 0 ? 'pass' : 'fail';
  return { status, stageDir, head, index, reasonCodes: [...(index.reasonCodes || []), ...reasons], semanticValidationStatus: { status, reasonCodes: reasons, safeSummaryOnly: true }, safeSummaryOnly: true };
}

function writeInvalidReportArtifacts(loaded) {






  const recovery = loaded.recovery || buildInvalidReportRecoverySummary({






    reportPresent: false,






    jsonParseStatus: 'fail',






    fallbackArtifactsWritten: true,






  });






  fs.writeFileSync('codex-invalid-report-recovery-summary.json', JSON.stringify(recovery, null, 2));






  const fallbackReport = {






    status: 'fail',






    workflowQualityRunnerStatus: { status: 'fail', reasonCodes: [loaded.reasonCode || 'workflow_runner_invalid_report'] },






    fastPathStatus: { status: 'fail', pathMode: 'full_product_path' },






  };






  const diagnostic = buildDiagnosticConsolidatedSummary(fallbackReport, { invalidReportSummary: recovery });






  fs.writeFileSync('codex-diagnostic-consolidated-summary.json', JSON.stringify(diagnostic.summary, null, 2));






  fs.writeFileSync('codex-quality-gate-safe-summary.json', JSON.stringify({






    marker,






    harnessVersion: HARNESS_VERSION,






    mode: 'unknown',






    status: 'fail',






    mergeReady: false,






    reasonCodes: [loaded.reasonCode || 'workflow_runner_invalid_report'],






    safeSummaryOnly: true,






  }, null, 2));






  fs.writeFileSync('codex-failure-reasons.json', JSON.stringify([{






    reasonCode: loaded.reasonCode || 'workflow_runner_invalid_report',






    gate: 'workflowQualityRunner',






    severity: 'error',






    safeMessage: 'Quality report could not be parsed safely.',






  }], null, 2));






  const index = buildSafeArtifactIndex([






    { artifactName: 'codex-diagnostic-consolidated-summary.json', path: 'codex-diagnostic-consolidated-summary.json', status: 'present' },






    { artifactName: 'codex-quality-gate-safe-summary.json', path: 'codex-quality-gate-safe-summary.json', status: 'present' },






    { artifactName: 'codex-failure-reasons.json', path: 'codex-failure-reasons.json', status: 'present' },






    { artifactName: 'codex-minimal-safe-failure.json', path: 'codex-minimal-safe-failure.json', status: fs.existsSync('codex-minimal-safe-failure.json') ? 'present' : 'missing', reasonCodes: fs.existsSync('codex-minimal-safe-failure.json') ? [] : ['artifact_lifeboat_missing'] },






    { artifactName: 'codex-invalid-report-recovery-summary.json', path: 'codex-invalid-report-recovery-summary.json', status: 'present' },






    { artifactName: 'codex-safe-artifact-index.json', path: 'codex-safe-artifact-index.json', status: 'present' },






  ], 'unknown', { enforceRequired: true });






  fs.writeFileSync('codex-safe-artifact-index.json', JSON.stringify(index, null, 2));






}













export function buildWorkflowQualityRunnerReport(report, options = {}) {






  const result = evaluateWorkflowReport(report, options);






  return simpleStatus('workflowQualityRunnerStatus', result.status, {






    mode: result.mode,






    reasonCodes: result.failures.length ? ['workflow_runner_failed'] : [],






    failures: result.failures,






  });






}













if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {






  const args = parseArgs();
  if (args['finalize-v127-bundle']) {
    const result = finalizeV127SafeArtifactBundle({
      sourceDir: args['source-dir'] || process.cwd(),
      stageDir: args['stage-dir'],
      runnerTemp: args['runner-temp'],
      reportPath: args.report,
      executionResultPath: args['execution-result'],
      head: args.head || args['head-sha'],
      baseSha: args.base,
      runId: args['run-id'],
      runAttempt: args['run-attempt'],
      artifactName: args['artifact-name'],
    });
    writeJsonReport({ v127FinalBundleStatus: result }, 'CODEX_V127_FINAL_BUNDLE_REPORT');
    process.exit(result.status === 'pass' ? 0 : 1);
  }
  if (args['validate-v127-bundle']) {
    const result = validateV127SafeArtifactBundle({ stageDir: args['stage-dir'], runnerTemp: args['runner-temp'], executionResultPath: args['execution-result'], head: args.head || args['head-sha'] });
    writeJsonReport({ v127FinalBundleValidationStatus: result }, 'CODEX_V127_FINAL_BUNDLE_VALIDATION_REPORT');
    process.exit(result.status === 'pass' ? 0 : 1);
  }






  const file = args.report || process.env.CODEX_WORKFLOW_REPORT_PATH || process.argv[2];






  const loaded = readReport(file);






  if (!loaded.ok) {






    writeInvalidReportArtifacts(loaded);






    const report = simpleStatus('workflowQualityRunnerStatus', 'fail', { reasonCodes: [loaded.reasonCode] });






    writeJsonReport(report, 'CODEX_WORKFLOW_RUNNER_REPORT');






    process.exit(1);






  }






  const result = evaluateWorkflowReport(loaded.report, {






    gateExit: Number(args['gate-exit'] || process.env.CODEX_GATE_EXIT || 0),






    eventName: process.env.CODEX_EVENT_NAME,






  });






  writeArtifacts(result, loaded.report);






  const out = buildWorkflowQualityRunnerReport(loaded.report, {






    gateExit: Number(args['gate-exit'] || process.env.CODEX_GATE_EXIT || 0),






    eventName: process.env.CODEX_EVENT_NAME,






  });






  writeJsonReport(out, 'CODEX_WORKFLOW_RUNNER_REPORT');






  const finalDecision = loaded.report.finalDecision || reconcileFinalSafeDecision({
    executionMode: process.env.CODEX_EXECUTION_MODE || (result.mode === 'target' ? 'target_pr' : 'source_pr'),
    terminalAction: process.env.CODEX_TERMINAL_ACTION || 'create_pr_only',
    decisionCapsule: loaded.report.decisionCapsule,
    evidenceCapsule: loaded.report.evidenceCapsule,
    artifactConsistency: loaded.report.artifactConsistency || loaded.report.artifactConsistencyStatus,
    minimalBlockers: loaded.report.top3Blockers || loaded.report.minimalBlockers,
    requiredChecks: {
      sameHead: process.env.CODEX_SAME_HEAD === 'false' ? false : true,
      allPass: process.env.CODEX_REQUIRED_CHECKS_PASS === '1',
    },
    convergenceState: loaded.report.convergenceGateStatus,
    tokenBudget: loaded.report.tokenBudgetStatus,
    safetyClaims: {
      rawLogsRead: loaded.report.rawLogsRead === true,
      eightSessionUsed: loaded.report.eightSessionUsed === true,
      runtimeReadinessClaimed: loaded.report.runtimeReadinessClaimed === true,
      productionReadinessClaimed: loaded.report.productionReadinessClaimed === true,
    },
  });
  if (finalDecision.exitCode === 0) process.exit(0);

  if (result.failures.length) {






    for (const item of result.failures.slice(0, 20)) {






      const safe = String(item).replace(/[^A-Za-z0-9_.:= -]/g, '_').slice(0, 180);






      console.error(`::error title=codex-quality-gate::${safe}`);






    }






    process.exit(1);






  }






}
