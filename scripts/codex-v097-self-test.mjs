#!/usr/bin/env node
// CODEX_QUALITY_HARNESS_FILE v0.9.7

import { fileURLToPath } from 'node:url';
import { marker, HARNESS_VERSION, scanObjectForUnsafe, writeJsonReport, exitFor } from './codex-v080-lib.mjs';
import {
  activeSelfTestStatusKey,
  effectiveSelfTestStatus,
} from './codex-active-self-test-policy.mjs';
import { buildRemoteProductCheckDecision } from './codex-remote-product-checks.mjs';
import { buildProductVerificationEvidenceReport } from './codex-product-verification-evidence-normalize.mjs';
import { buildRemoteProductBaselineReport } from './codex-remote-product-baseline-gate.mjs';
import {
  buildActiveSelfTestRegistryReport,
  buildWorkflowProductVerificationInvariantReport,
  buildTargetHotfixRegressionReport,
  buildHarnessRolloutDiffRegressionReport,
  buildBlockerRootCauseClassifierReport,
  buildLocalRemoteEvidencePhaseReport,
  buildStructuredSolvabilityReport,
  buildLive2DDatasetRowAuditReport,
  buildMotionAllowlistSyncReport,
  buildTrustedLoaderEvidenceReport,
  buildLive2DEvidenceCollectorContractReport,
  buildAvatarUxSafetyReport,
  buildRuntimeLatencyMeasurementReport,
  buildBrowserSmokeJsonArtifactReport,
  buildOwnerDecisionDigestReport,
  buildObsoletePrAutoRecommendReport,
  buildDatasetAuditV2SchemaReport,
  buildGameToolAdapterContractFixtureV097Report,
  buildBelovedAvatarSafetyAuditV097Report,
} from './codex-v097-gate-lib.mjs';

function statusOf(report, key) { return report[key]?.status || report.status || 'missing'; }
function reasonsOf(report, key) { return report[key]?.reasonCodes || []; }
function assertCase(id, condition, failures, cases, actualStatus = 'pass', reasonCodes = []) {
  cases.push({ id, status: condition ? 'pass' : 'fail', actualStatus, reasonCodes, safeSummaryOnly: true });
  if (!condition) failures.push(id);
}

function safeBaselineJson() {
  return JSON.stringify({
    schemaVersion: '0.8.3',
    harnessVersion: HARNESS_VERSION,
    repository: 'hiro4649/disco-funky-repair',
    baseSha: 'a'.repeat(40),
    baselineType: 'remote_product_checks',
    commands: [{ name: 'backend:npm test', result: 'pass', source: 'remote' }],
    result: 'pass',
    date: new Date().toISOString(),
    source: 'github_actions_base_worktree',
    safeSummary: 'remote product baseline checks completed',
    knownFailures: [],
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    rawValuesStored: false,
    safeSummaryOnly: true,
  });
}

export function buildV097SelfTestReport() {
  const failures = [];
  const cases = [];
  let report;

  report = buildActiveSelfTestRegistryReport({ harnessVersion: '0.9.7', activeStatusKey: 'v097SelfTestStatus', selfTestFilePresent: true, manifestHasSelfTest: true, localGateHasStatus: true });
  assertCase('active_self_test_registry_v097_pass', statusOf(report, 'activeSelfTestRegistryStatus') === 'pass', failures, cases, statusOf(report, 'activeSelfTestRegistryStatus'), reasonsOf(report, 'activeSelfTestRegistryStatus'));
  assertCase('active_v097_self_test_selected', activeSelfTestStatusKey('0.9.7') === 'v097SelfTestStatus', failures, cases, activeSelfTestStatusKey('0.9.7') || 'missing', []);
  assertCase('active_v097_failure_still_blocks', effectiveSelfTestStatus('v097SelfTestStatus', 'fail', '0.9.7') === 'fail', failures, cases, effectiveSelfTestStatus('v097SelfTestStatus', 'fail', '0.9.7'), []);
  assertCase('legacy_v085_failure_advisory_for_v097', effectiveSelfTestStatus('v085SelfTestStatus', 'fail', '0.9.7') === 'pass_legacy_advisory', failures, cases, effectiveSelfTestStatus('v085SelfTestStatus', 'fail', '0.9.7'), []);
  assertCase('legacy_v094_failure_advisory_for_v097', effectiveSelfTestStatus('v094SelfTestStatus', 'fail', '0.9.7') === 'pass_legacy_advisory', failures, cases, effectiveSelfTestStatus('v094SelfTestStatus', 'fail', '0.9.7'), []);
  assertCase('legacy_v095_failure_advisory_for_v097', effectiveSelfTestStatus('v095SelfTestStatus', 'fail', '0.9.7') === 'pass_legacy_advisory', failures, cases, effectiveSelfTestStatus('v095SelfTestStatus', 'fail', '0.9.7'), []);
  assertCase('legacy_v096_failure_advisory_for_v097', effectiveSelfTestStatus('v096SelfTestStatus', 'fail', '0.9.7') === 'pass_legacy_advisory', failures, cases, effectiveSelfTestStatus('v096SelfTestStatus', 'fail', '0.9.7'), []);
  report = buildActiveSelfTestRegistryReport({ harnessVersion: '0.9.7', activeStatusKey: 'v096SelfTestStatus', selfTestFilePresent: false, manifestHasSelfTest: false, localGateHasStatus: false });
  assertCase('active_self_test_registry_missing_fails', statusOf(report, 'activeSelfTestRegistryStatus') === 'fail', failures, cases, statusOf(report, 'activeSelfTestRegistryStatus'), reasonsOf(report, 'activeSelfTestRegistryStatus'));

  report = buildWorkflowProductVerificationInvariantReport({ forceWorkflowTextCheck: true });
  assertCase('workflow_product_verification_step_present_pass', statusOf(report, 'workflowProductVerificationInvariantStatus') === 'pass', failures, cases, statusOf(report, 'workflowProductVerificationInvariantStatus'), reasonsOf(report, 'workflowProductVerificationInvariantStatus'));
  assertCase('prepare_target_product_verification_step_present', statusOf(report, 'workflowProductVerificationInvariantStatus') === 'pass', failures, cases, statusOf(report, 'workflowProductVerificationInvariantStatus'), reasonsOf(report, 'workflowProductVerificationInvariantStatus'));
  assertCase('prepare_target_product_verification_executes_remote_product_checks', statusOf(report, 'workflowProductVerificationInvariantStatus') === 'pass', failures, cases, statusOf(report, 'workflowProductVerificationInvariantStatus'), reasonsOf(report, 'workflowProductVerificationInvariantStatus'));
  report = buildWorkflowProductVerificationInvariantReport({ stepRemoved: true });
  assertCase('workflow_product_verification_step_removed_fails', statusOf(report, 'workflowProductVerificationInvariantStatus') === 'fail', failures, cases, statusOf(report, 'workflowProductVerificationInvariantStatus'), reasonsOf(report, 'workflowProductVerificationInvariantStatus'));
  report = buildWorkflowProductVerificationInvariantReport({ forceWorkflowTextCheck: true, workflowText: 'Prepare target product verification\nstatus pending\n' });
  assertCase('product_pr_pending_placeholder_not_enough', statusOf(report, 'workflowProductVerificationInvariantStatus') === 'fail', failures, cases, statusOf(report, 'workflowProductVerificationInvariantStatus'), reasonsOf(report, 'workflowProductVerificationInvariantStatus'));
  report = buildWorkflowProductVerificationInvariantReport({ workflowDispatchSubstitute: true });
  assertCase('workflow_dispatch_not_pr_substitute', statusOf(report, 'workflowProductVerificationInvariantStatus') === 'fail', failures, cases, statusOf(report, 'workflowProductVerificationInvariantStatus'), reasonsOf(report, 'workflowProductVerificationInvariantStatus'));
  report = buildWorkflowProductVerificationInvariantReport({ remoteProductArtifactUploadRemoved: true });
  assertCase('remote_product_artifact_upload_removed_fails', statusOf(report, 'workflowProductVerificationInvariantStatus') === 'fail', failures, cases, statusOf(report, 'workflowProductVerificationInvariantStatus'), reasonsOf(report, 'workflowProductVerificationInvariantStatus'));

  const productEnv = {
    CODEX_EVENT_NAME: 'pull_request',
    CODEX_REPOSITORY: 'hiro4649/disco-funky-repair',
    CODEX_PR_NUMBER: '195',
    CODEX_PR_BASE_SHA: 'a'.repeat(40),
    CODEX_PR_HEAD_SHA: 'b'.repeat(40),
    CODEX_CHANGED_FILES: 'apps/backend/src/app/lib/tierScheduler.ts\napps/backend/src/app/lib/__tests__/tierScheduler.statusAwareQuery.test.ts',
    CODEX_SKIP_NPM: '0',
    CODEX_PRODUCT_VERIFICATION_COMMANDS: 'backend:npm test',
    CODEX_PRODUCT_VERIFICATION_RESULT: 'pass',
    CODEX_PRODUCT_VERIFICATION_SOURCE: 'remote',
    CODEX_REMOTE_PRODUCT_BASELINE_JSON: safeBaselineJson(),
  };
  const productDecision = buildRemoteProductCheckDecision(productEnv);
  assertCase('product_pr_generates_remote_baseline', productDecision.willGenerateBaseline === true, failures, cases, productDecision.reasonCode, []);
  assertCase('product_pr_generates_product_verification_evidence', productDecision.willGenerateEvidence === true, failures, cases, productDecision.reasonCode, []);
  assertCase('valid_product_verification_evidence_passes_for_product_pr', statusOf(buildProductVerificationEvidenceReport(productEnv), 'productVerificationEvidenceStatus') === 'pass', failures, cases, statusOf(buildProductVerificationEvidenceReport(productEnv), 'productVerificationEvidenceStatus'), reasonsOf(buildProductVerificationEvidenceReport(productEnv), 'productVerificationEvidenceStatus'));
  const skippedProductEnv = { ...productEnv, CODEX_SKIP_NPM: '1' };
  assertCase('product_pr_skip_npm_fails', statusOf(buildProductVerificationEvidenceReport(skippedProductEnv), 'productVerificationEvidenceStatus') === 'fail', failures, cases, statusOf(buildProductVerificationEvidenceReport(skippedProductEnv), 'productVerificationEvidenceStatus'), []);
  assertCase('remote_product_baseline_present_passes_for_product_pr', statusOf(buildRemoteProductBaselineReport(productEnv), 'remoteProductBaselineStatus') === 'pass', failures, cases, statusOf(buildRemoteProductBaselineReport(productEnv), 'remoteProductBaselineStatus'), reasonsOf(buildRemoteProductBaselineReport(productEnv), 'remoteProductBaselineStatus'));
  const missingBaselineEnv = { ...productEnv, CODEX_REMOTE_PRODUCT_BASELINE_JSON: '' };
  assertCase('baseline_missing_fails_for_product_pr', statusOf(buildRemoteProductBaselineReport(missingBaselineEnv), 'remoteProductBaselineStatus') === 'fail', failures, cases, statusOf(buildRemoteProductBaselineReport(missingBaselineEnv), 'remoteProductBaselineStatus'), reasonsOf(buildRemoteProductBaselineReport(missingBaselineEnv), 'remoteProductBaselineStatus'));
  const harnessOnlyDecision = buildRemoteProductCheckDecision({ CODEX_CHANGED_FILES: 'scripts/codex-v097-self-test.mjs' });
  assertCase('harness_only_pr_skip_npm_with_reason_passes', harnessOnlyDecision.skipNpm === '1' && harnessOnlyDecision.reasonCode === 'remote_product_checks_not_required', failures, cases, harnessOnlyDecision.reasonCode, []);
  const docsOnlyDecision = buildRemoteProductCheckDecision({ CODEX_CHANGED_FILES: 'docs/process/CODEX_V097_EVAL_CASES.json' });
  assertCase('docs_only_pr_remote_product_checks_skip_allowed', docsOnlyDecision.productRequired === false, failures, cases, docsOnlyDecision.reasonCode, []);

  report = buildTargetHotfixRegressionReport({ forceCheck: true });
  assertCase('target_hotfix_regression_preserved_pass', statusOf(report, 'targetHotfixRegressionStatus') === 'pass', failures, cases, statusOf(report, 'targetHotfixRegressionStatus'), reasonsOf(report, 'targetHotfixRegressionStatus'));
  report = buildTargetHotfixRegressionReport({ forceCheck: true, prepareProductVerificationRemoved: true });
  assertCase('target_hotfix_regression_prepare_product_verification_removed_fails', statusOf(report, 'targetHotfixRegressionStatus') === 'fail', failures, cases, statusOf(report, 'targetHotfixRegressionStatus'), reasonsOf(report, 'targetHotfixRegressionStatus'));
  report = buildHarnessRolloutDiffRegressionReport({ forceCheck: true, workflowStepDeletedWithoutReason: true });
  assertCase('harness_rollout_diff_step_deletion_requires_reason', statusOf(report, 'harnessRolloutDiffRegressionStatus') === 'fail', failures, cases, statusOf(report, 'harnessRolloutDiffRegressionStatus'), reasonsOf(report, 'harnessRolloutDiffRegressionStatus'));

  report = buildBlockerRootCauseClassifierReport({ failurePresent: true, workflowStepMissing: true, rootCause: 'workflow_step_missing' });
  assertCase('blocker_root_cause_workflow_step_missing', statusOf(report, 'blockerRootCauseClassifierStatus') === 'pass', failures, cases, statusOf(report, 'blockerRootCauseClassifierStatus'), reasonsOf(report, 'blockerRootCauseClassifierStatus'));
  report = buildBlockerRootCauseClassifierReport({ failurePresent: true, activeSelfTestRegistryMissing: true, rootCause: 'warning' });
  assertCase('blocker_root_cause_active_self_test_missing', statusOf(report, 'blockerRootCauseClassifierStatus') === 'fail', failures, cases, statusOf(report, 'blockerRootCauseClassifierStatus'), reasonsOf(report, 'blockerRootCauseClassifierStatus'));

  report = buildLocalRemoteEvidencePhaseReport({ remoteEvidencePhase: 'remote_evidence_pending_before_push' });
  assertCase('local_pre_push_remote_pending_allowed', statusOf(report, 'localRemoteEvidencePhaseStatus') === 'pass', failures, cases, statusOf(report, 'localRemoteEvidencePhaseStatus'), reasonsOf(report, 'localRemoteEvidencePhaseStatus'));
  report = buildLocalRemoteEvidencePhaseReport({ remoteEvidencePhase: 'remote_evidence_required_after_push', afterPushRemoteMissingPass: true });
  assertCase('remote_evidence_required_after_push', statusOf(report, 'localRemoteEvidencePhaseStatus') === 'fail', failures, cases, statusOf(report, 'localRemoteEvidencePhaseStatus'), reasonsOf(report, 'localRemoteEvidencePhaseStatus'));
  report = buildStructuredSolvabilityReport({ remoteEvidencePhase: 'remote_evidence_required_after_push', mergeReady: false });
  assertCase('structured_solvability_local_remote_split_pass', statusOf(report, 'structuredSolvabilityStatus') === 'pass', failures, cases, statusOf(report, 'structuredSolvabilityStatus'), reasonsOf(report, 'structuredSolvabilityStatus'));
  report = buildStructuredSolvabilityReport({ localRemoteMixed: true });
  assertCase('structured_solvability_conflict_fails', statusOf(report, 'structuredSolvabilityStatus') === 'fail', failures, cases, statusOf(report, 'structuredSolvabilityStatus'), reasonsOf(report, 'structuredSolvabilityStatus'));

  report = buildLive2DDatasetRowAuditReport({ forceCheck: true, requireFields: true });
  assertCase('live2d_dataset_row_audit_valid_row_pass', statusOf(report, 'live2dDatasetRowAuditStatus') === 'pass', failures, cases, statusOf(report, 'live2dDatasetRowAuditStatus'), reasonsOf(report, 'live2dDatasetRowAuditStatus'));
  report = buildLive2DDatasetRowAuditReport({ forceCheck: true, futureLabelRuntimeExecutable: true });
  assertCase('live2d_dataset_row_audit_future_label_fails', statusOf(report, 'live2dDatasetRowAuditStatus') === 'fail', failures, cases, statusOf(report, 'live2dDatasetRowAuditStatus'), reasonsOf(report, 'live2dDatasetRowAuditStatus'));
  report = buildMotionAllowlistSyncReport({ forceCheck: true, futureLabelRuntimeExecutable: true });
  assertCase('motion_allowlist_sync_future_label_runtime_executable_fails', statusOf(report, 'motionAllowlistSyncStatus') === 'fail', failures, cases, statusOf(report, 'motionAllowlistSyncStatus'), reasonsOf(report, 'motionAllowlistSyncStatus'));

  report = buildTrustedLoaderEvidenceReport({ forceCheck: true, browserSelfAssertedReady: true });
  assertCase('trusted_loader_browser_self_asserted_ready_fails', statusOf(report, 'trustedLoaderEvidenceStatus') === 'fail', failures, cases, statusOf(report, 'trustedLoaderEvidenceStatus'), reasonsOf(report, 'trustedLoaderEvidenceStatus'));
  report = buildTrustedLoaderEvidenceReport({ forceCheck: true, allowlistedEvidence: true });
  assertCase('trusted_loader_allowlisted_evidence_pass', statusOf(report, 'trustedLoaderEvidenceStatus') === 'pass', failures, cases, statusOf(report, 'trustedLoaderEvidenceStatus'), reasonsOf(report, 'trustedLoaderEvidenceStatus'));
  report = buildLive2DEvidenceCollectorContractReport({ forceCheck: true, rawCueIncluded: true });
  assertCase('live2d_evidence_collector_raw_cue_fails', statusOf(report, 'live2dEvidenceCollectorContractStatus') === 'fail', failures, cases, statusOf(report, 'live2dEvidenceCollectorContractStatus'), reasonsOf(report, 'live2dEvidenceCollectorContractStatus'));

  report = buildAvatarUxSafetyReport({ forceCheck: true, subtitleObstruction: true });
  assertCase('avatar_ux_safety_subtitle_obstruction_needs_review', statusOf(report, 'avatarUxSafetyStatus') === 'warning', failures, cases, statusOf(report, 'avatarUxSafetyStatus'), reasonsOf(report, 'avatarUxSafetyStatus'));
  report = buildAvatarUxSafetyReport({ forceCheck: true, donationScaledCloseup: true });
  assertCase('avatar_ux_safety_monetization_closeup_fails', statusOf(report, 'avatarUxSafetyStatus') === 'fail', failures, cases, statusOf(report, 'avatarUxSafetyStatus'), reasonsOf(report, 'avatarUxSafetyStatus'));

  report = buildRuntimeLatencyMeasurementReport({ forceCheck: true, duplicateDeliveryUnsafe: true });
  assertCase('runtime_latency_duplicate_delivery_fails', statusOf(report, 'runtimeLatencyMeasurementStatus') === 'fail', failures, cases, statusOf(report, 'runtimeLatencyMeasurementStatus'), reasonsOf(report, 'runtimeLatencyMeasurementStatus'));
  report = buildRuntimeLatencyMeasurementReport({ forceCheck: true, metricCount: 8 });
  assertCase('runtime_latency_safe_metric_pass', statusOf(report, 'runtimeLatencyMeasurementStatus') === 'pass', failures, cases, statusOf(report, 'runtimeLatencyMeasurementStatus'), reasonsOf(report, 'runtimeLatencyMeasurementStatus'));
  report = buildBrowserSmokeJsonArtifactReport({ forceCheck: true, requiredFieldsPresent: true });
  assertCase('browser_smoke_json_required_fields_pass', statusOf(report, 'browserSmokeJsonArtifactStatus') === 'pass', failures, cases, statusOf(report, 'browserSmokeJsonArtifactStatus'), reasonsOf(report, 'browserSmokeJsonArtifactStatus'));
  report = buildBrowserSmokeJsonArtifactReport({ forceCheck: true, requiredFieldsPresent: true, rawConsoleLogsIncluded: true });
  assertCase('browser_smoke_json_raw_console_log_fails', statusOf(report, 'browserSmokeJsonArtifactStatus') === 'fail', failures, cases, statusOf(report, 'browserSmokeJsonArtifactStatus'), reasonsOf(report, 'browserSmokeJsonArtifactStatus'));

  report = buildOwnerDecisionDigestReport({ required: true, digestPresent: true });
  assertCase('owner_decision_digest_required_pass', statusOf(report, 'ownerDecisionDigestStatus') === 'pass', failures, cases, statusOf(report, 'ownerDecisionDigestStatus'), reasonsOf(report, 'ownerDecisionDigestStatus'));
  report = buildObsoletePrAutoRecommendReport({ reuseObsoletePr: true });
  assertCase('obsolete_pr_reuse_fails', statusOf(report, 'obsoletePrAutoRecommendStatus') === 'fail', failures, cases, statusOf(report, 'obsoletePrAutoRecommendStatus'), reasonsOf(report, 'obsoletePrAutoRecommendStatus'));
  report = buildDatasetAuditV2SchemaReport({ forceCheck: true });
  assertCase('dataset_audit_v2_schema_pass', statusOf(report, 'datasetAuditV2SchemaStatus') === 'pass', failures, cases, statusOf(report, 'datasetAuditV2SchemaStatus'), reasonsOf(report, 'datasetAuditV2SchemaStatus'));
  report = buildDatasetAuditV2SchemaReport({ forceCheck: true, autoFixAllowed: true });
  assertCase('dataset_audit_auto_fix_fails', statusOf(report, 'datasetAuditV2SchemaStatus') === 'fail', failures, cases, statusOf(report, 'datasetAuditV2SchemaStatus'), reasonsOf(report, 'datasetAuditV2SchemaStatus'));

  report = buildGameToolAdapterContractFixtureV097Report({ forceCheck: true, candidateDirectHandoff: true });
  assertCase('game_tool_candidate_direct_handoff_fails', statusOf(report, 'gameToolAdapterContractFixtureStatus') === 'fail', failures, cases, statusOf(report, 'gameToolAdapterContractFixtureStatus'), reasonsOf(report, 'gameToolAdapterContractFixtureStatus'));
  report = buildGameToolAdapterContractFixtureV097Report({ forceCheck: true, approvedAction: true });
  assertCase('game_tool_approved_action_pass', statusOf(report, 'gameToolAdapterContractFixtureStatus') === 'pass', failures, cases, statusOf(report, 'gameToolAdapterContractFixtureStatus'), reasonsOf(report, 'gameToolAdapterContractFixtureStatus'));
  report = buildBelovedAvatarSafetyAuditV097Report({ forceCheck: true, memoryPrivacyViolation: true });
  assertCase('beloved_avatar_memory_privacy_fails', statusOf(report, 'belovedAvatarSafetyAuditStatus') === 'fail', failures, cases, statusOf(report, 'belovedAvatarSafetyAuditStatus'), reasonsOf(report, 'belovedAvatarSafetyAuditStatus'));

  report = buildOwnerDecisionDigestReport({ digestPresent: true });
  assertCase('source_harness_only_v097_fixture_pass', statusOf(report, 'ownerDecisionDigestStatus') === 'pass', failures, cases, statusOf(report, 'ownerDecisionDigestStatus'), reasonsOf(report, 'ownerDecisionDigestStatus'));
  report = buildWorkflowProductVerificationInvariantReport({});
  assertCase('target_harness_rollout_v097_fixture_pass', statusOf(report, 'workflowProductVerificationInvariantStatus') === 'pass', failures, cases, statusOf(report, 'workflowProductVerificationInvariantStatus'), reasonsOf(report, 'workflowProductVerificationInvariantStatus'));

  const unsafe = scanObjectForUnsafe(cases);
  const status = failures.length || unsafe.length ? 'fail' : 'pass';
  return {
    marker,
    harnessVersion: HARNESS_VERSION,
    status,
    v097SelfTestStatus: {
      status,
      suite: 'v097',
      caseCount: cases.length,
      failedCaseCount: failures.length,
      failedCases: failures,
      cases,
      reasonCodes: unsafe.length ? ['unsafe_output_detected'] : [],
      safeSummaryOnly: true,
    },
    cases,
    safeSummaryOnly: true,
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const report = buildV097SelfTestReport();
  writeJsonReport(report, 'CODEX_V097_SELF_TEST_REPORT');
  exitFor(report);
}
