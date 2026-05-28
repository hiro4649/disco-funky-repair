#!/usr/bin/env node
// CODEX_QUALITY_HARNESS_FILE v0.9.6

import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { marker, HARNESS_VERSION, scanObjectForUnsafe, writeJsonReport, exitFor } from './codex-v080-lib.mjs';
import {
  activeSelfTestStatusKey,
  effectiveSelfTestStatus,
  buildLegacyCompatibilitySelfTestStatus,
} from './codex-active-self-test-policy.mjs';
import {
  buildRemoteProductCheckDecision,
} from './codex-remote-product-checks.mjs';
import {
  buildProductVerificationEvidenceReport,
} from './codex-product-verification-evidence-normalize.mjs';
import {
  buildRemoteProductBaselineReport,
} from './codex-remote-product-baseline-gate.mjs';
import {
  buildKRuleCoverageReport,
  buildLive2DSpecSyncReport,
  buildRuntimeLatencyBudgetReport,
  buildObsoleteOpenPrReport,
  buildOwnerSummaryCompactReport,
  buildBrowserSmokeArtifactReport,
  buildFailureToRepairPlanReport,
  buildRuntimeStateAdoptionReport,
  buildClaimTransitionReport,
  buildTimeoutAdoptionReport,
  buildTxReconciliationServiceReport,
  buildTxHashBeforeWaitReport,
  buildReceiptResumeBoundaryReport,
  buildMigrationRolloutSafetyReport,
  buildMigrationRuntimeCompatReport,
  buildHumanReviewDigestReport,
  buildDatasetAuditReadinessReport,
  buildGameToolAdapterContractFixtureReport,
  buildBelovedAvatarSafetyAuditReport,
} from './codex-v096-gate-lib.mjs';

function statusOf(report, key) {
  return report[key]?.status || report.status || 'missing';
}

function reasonsOf(report, key) {
  return report[key]?.reasonCodes || [];
}

function assertCase(id, condition, failures, cases, actualStatus = 'pass', reasonCodes = []) {
  cases.push({ id, status: condition ? 'pass' : 'fail', actualStatus, reasonCodes, safeSummaryOnly: true });
  if (!condition) failures.push(id);
}

export function buildV096SelfTestReport() {
  const failures = [];
  const cases = [];
  let report;

  assertCase('active_v096_self_test_selected', activeSelfTestStatusKey('0.9.6') === 'v096SelfTestStatus', failures, cases, activeSelfTestStatusKey('0.9.6'), []);
  assertCase('active_v096_failure_still_blocks', effectiveSelfTestStatus('v096SelfTestStatus', 'fail', '0.9.6') === 'fail', failures, cases, effectiveSelfTestStatus('v096SelfTestStatus', 'fail', '0.9.6'), []);
  assertCase('legacy_v085_failure_advisory_for_v096', effectiveSelfTestStatus('v085SelfTestStatus', 'fail', '0.9.6') === 'pass_legacy_advisory', failures, cases, effectiveSelfTestStatus('v085SelfTestStatus', 'fail', '0.9.6'), []);
  assertCase('legacy_v094_failure_advisory_for_v096', effectiveSelfTestStatus('v094SelfTestStatus', 'fail', '0.9.6') === 'pass_legacy_advisory', failures, cases, effectiveSelfTestStatus('v094SelfTestStatus', 'fail', '0.9.6'), []);
  assertCase('legacy_v095_failure_advisory_for_v096', effectiveSelfTestStatus('v095SelfTestStatus', 'fail', '0.9.6') === 'pass_legacy_advisory', failures, cases, effectiveSelfTestStatus('v095SelfTestStatus', 'fail', '0.9.6'), []);
  report = buildLegacyCompatibilitySelfTestStatus({
    v085SelfTestStatus: { status: 'fail' },
    v094SelfTestStatus: { status: 'fail' },
    v095SelfTestStatus: { status: 'fail' },
    v096SelfTestStatus: { status: 'pass' },
  }, '0.9.6');
  assertCase('legacy_compatibility_records_v096_advisory_failures', report.status === 'pass' && report.legacyFailureCount === 3 && report.reasonCodes.includes('legacy_self_test_failure_advisory'), failures, cases, report.status, report.reasonCodes);

  const workflowText = fs.readFileSync(fileURLToPath(new URL('../.github/workflows/quality-gate.yml', import.meta.url)), 'utf8');
  const backendRuntimeQueryFiles = [
    'apps/backend/src/app/lib/tierScheduler.ts',
    'apps/backend/src/app/lib/__tests__/tierScheduler.statusAwareQuery.test.ts',
  ];
  const productDecision = buildRemoteProductCheckDecision({ CODEX_CHANGED_FILES: backendRuntimeQueryFiles.join('\n') });
  const backendRuntimeDecision = buildRemoteProductCheckDecision({ CODEX_CHANGED_FILES: 'apps/backend/src/app/lib/tierScheduler.ts' });
  const docsDecision = buildRemoteProductCheckDecision({ CODEX_CHANGED_FILES: 'docs/process/FUNKY_TIER_UPDATE_RUNTIME_ADOPTION_PLAN.md' });
  const harnessDecision = buildRemoteProductCheckDecision({ CODEX_CHANGED_FILES: '.github/workflows/quality-gate.yml\nscripts/codex-v096-self-test.mjs' });
  assertCase('prepare_target_product_verification_step_present', /name:\s*Prepare target product verification/.test(workflowText) && /codex-remote-product-checks\.mjs/.test(workflowText), failures, cases);
  assertCase('prepare_target_product_verification_pull_request_only', /if:\s*\$\{\{\s*github\.event_name\s*==\s*'pull_request'\s*\}\}/.test(workflowText), failures, cases);
  assertCase('product_pr_backend_runtime_query_change_requires_remote_product_checks', backendRuntimeDecision.productRequired && backendRuntimeDecision.skipNpm === '0', failures, cases, backendRuntimeDecision.reasonCode, []);
  assertCase('product_pr_generates_remote_baseline', productDecision.willGenerateBaseline === true, failures, cases, String(productDecision.willGenerateBaseline), []);
  assertCase('product_pr_generates_product_verification_evidence', productDecision.willGenerateEvidence === true, failures, cases, String(productDecision.willGenerateEvidence), []);
  assertCase('product_pr_skip_npm_fails', productDecision.productRequired && productDecision.skipNpm === '0', failures, cases, productDecision.skipNpm, []);
  assertCase('product_relevant_pr_context_not_empty', productDecision.plan.files.length === backendRuntimeQueryFiles.length, failures, cases, String(productDecision.plan.files.length), []);
  assertCase('docs_only_pr_remote_product_checks_skip_allowed', !docsDecision.productRequired && docsDecision.skipNpm === '1', failures, cases, docsDecision.reasonCode, []);
  assertCase('harness_only_pr_skip_npm_with_reason_passes', !harnessDecision.productRequired && harnessDecision.skipNpm === '1', failures, cases, harnessDecision.reasonCode, []);
  report = buildRemoteProductBaselineReport({
    CODEX_EVENT_NAME: 'pull_request',
    CODEX_CHANGED_FILES: backendRuntimeQueryFiles.join('\n'),
  });
  assertCase('baseline_missing_fails_for_product_pr', statusOf(report, 'remoteProductBaselineStatus') === 'fail' && reasonsOf(report, 'remoteProductBaselineStatus').includes('remote_product_baseline_missing'), failures, cases, statusOf(report, 'remoteProductBaselineStatus'), reasonsOf(report, 'remoteProductBaselineStatus'));
  const validBaseline = {
    schemaVersion: '0.8.3',
    harnessVersion: HARNESS_VERSION,
    repository: 'hiro4649/disco-funky-repair',
    baseSha: 'aed17fac66618be1c9f470e05236834312351868',
    baselineType: 'remote_product_checks',
    commands: [{ name: 'backend:npm test -- --runInBand', result: 'pass', source: 'remote' }],
    result: 'pass',
    date: new Date().toISOString(),
    source: 'github_actions_base_worktree',
    safeSummary: 'remote product baseline checks completed',
    knownFailures: [],
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    rawValuesStored: false,
    safeSummaryOnly: true,
  };
  report = buildRemoteProductBaselineReport({
    CODEX_EVENT_NAME: 'pull_request',
    CODEX_REPOSITORY: validBaseline.repository,
    CODEX_PR_BASE_SHA: validBaseline.baseSha,
    CODEX_CHANGED_FILES: backendRuntimeQueryFiles.join('\n'),
    CODEX_REMOTE_PRODUCT_BASELINE_JSON: JSON.stringify(validBaseline),
  });
  assertCase('remote_product_baseline_present_passes_for_product_pr', statusOf(report, 'remoteProductBaselineStatus') === 'pass', failures, cases, statusOf(report, 'remoteProductBaselineStatus'), reasonsOf(report, 'remoteProductBaselineStatus'));
  report = buildProductVerificationEvidenceReport({
    CODEX_EVENT_NAME: 'pull_request',
    CODEX_REPOSITORY: validBaseline.repository,
    CODEX_PR_BASE_SHA: validBaseline.baseSha,
    CODEX_CHANGED_FILES: backendRuntimeQueryFiles.join('\n'),
    CODEX_REMOTE_PRODUCT_BASELINE_JSON: JSON.stringify(validBaseline),
    CODEX_SKIP_NPM: '0',
    CODEX_PRODUCT_VERIFICATION_COMMANDS: 'backend:npm test -- --runInBand',
    CODEX_PRODUCT_VERIFICATION_RESULT: 'pass',
    CODEX_PRODUCT_VERIFICATION_SOURCE: 'remote',
  });
  assertCase('valid_product_verification_evidence_passes_for_product_pr', statusOf(report, 'productVerificationEvidenceStatus') === 'pass', failures, cases, statusOf(report, 'productVerificationEvidenceStatus'), reasonsOf(report, 'productVerificationEvidenceStatus'));

  report = buildKRuleCoverageReport({ forceCheck: true, allowlistPresent: true, coverageTestPresent: true });
  assertCase('k_rule_coverage_live2d_allowlist_required_pass', statusOf(report, 'kRuleCoverageStatus') === 'pass', failures, cases, statusOf(report, 'kRuleCoverageStatus'), reasonsOf(report, 'kRuleCoverageStatus'));
  report = buildKRuleCoverageReport({ forceCheck: true, allowlistPresent: true });
  assertCase('k_rule_coverage_missing_test_fails', statusOf(report, 'kRuleCoverageStatus') === 'fail', failures, cases, statusOf(report, 'kRuleCoverageStatus'), reasonsOf(report, 'kRuleCoverageStatus'));
  report = buildKRuleCoverageReport({ forceCheck: true, allowlistPresent: true, coverageTestPresent: true, staleCoverageManifest: true });
  assertCase('k_rule_stale_coverage_manifest_fails', statusOf(report, 'kRuleCoverageStatus') === 'fail', failures, cases, statusOf(report, 'kRuleCoverageStatus'), reasonsOf(report, 'kRuleCoverageStatus'));

  report = buildLive2DSpecSyncReport({ live2dSpecRelevant: true });
  assertCase('live2d_spec_phase_order_pass', statusOf(report, 'live2dSpecSyncStatus') === 'pass', failures, cases, statusOf(report, 'live2dSpecSyncStatus'), reasonsOf(report, 'live2dSpecSyncStatus'));
  report = buildLive2DSpecSyncReport({ live2dSpecRelevant: true, futurePhaseMixed: true });
  assertCase('live2d_spec_future_phase_mixed_fails', statusOf(report, 'live2dSpecSyncStatus') === 'fail', failures, cases, statusOf(report, 'live2dSpecSyncStatus'), reasonsOf(report, 'live2dSpecSyncStatus'));

  report = buildRuntimeLatencyBudgetReport({ runtimeRelevant: true, duplicateDeliveryRisk: true });
  assertCase('runtime_latency_duplicate_delivery_fails', statusOf(report, 'runtimeLatencyBudgetStatus') === 'fail', failures, cases, statusOf(report, 'runtimeLatencyBudgetStatus'), reasonsOf(report, 'runtimeLatencyBudgetStatus'));
  report = buildRuntimeLatencyBudgetReport({ runtimeRelevant: true, queueDrainBeforeReady: true });
  assertCase('runtime_latency_queue_drain_before_ready_fails', statusOf(report, 'runtimeLatencyBudgetStatus') === 'fail', failures, cases, statusOf(report, 'runtimeLatencyBudgetStatus'), reasonsOf(report, 'runtimeLatencyBudgetStatus'));
  report = buildRuntimeLatencyBudgetReport({ runtimeRelevant: true });
  assertCase('runtime_latency_bounded_interval_pass', statusOf(report, 'runtimeLatencyBudgetStatus') === 'pass', failures, cases, statusOf(report, 'runtimeLatencyBudgetStatus'), reasonsOf(report, 'runtimeLatencyBudgetStatus'));

  report = buildObsoleteOpenPrReport({ oldHarnessOpenPr: true });
  assertCase('obsolete_open_pr_old_harness_warns', statusOf(report, 'obsoleteOpenPrStatus') === 'warning', failures, cases, statusOf(report, 'obsoleteOpenPrStatus'), reasonsOf(report, 'obsoleteOpenPrStatus'));
  report = buildObsoleteOpenPrReport({ reuseOldPr: true });
  assertCase('obsolete_open_pr_reuse_fails', statusOf(report, 'obsoleteOpenPrStatus') === 'fail', failures, cases, statusOf(report, 'obsoleteOpenPrStatus'), reasonsOf(report, 'obsoleteOpenPrStatus'));

  report = buildOwnerSummaryCompactReport({ required: true, present: true, lineCount: 7 });
  assertCase('owner_summary_7line_required_pass', ['pass', 'warning'].includes(statusOf(report, 'ownerSummaryCompactStatus')), failures, cases, statusOf(report, 'ownerSummaryCompactStatus'), reasonsOf(report, 'ownerSummaryCompactStatus'));
  report = buildOwnerSummaryCompactReport({ required: true });
  assertCase('owner_summary_missing_fails', statusOf(report, 'ownerSummaryCompactStatus') === 'fail', failures, cases, statusOf(report, 'ownerSummaryCompactStatus'), reasonsOf(report, 'ownerSummaryCompactStatus'));

  report = buildBrowserSmokeArtifactReport({ browserSmokeRequired: true, artifactPresent: true });
  assertCase('browser_smoke_safe_artifact_pass', statusOf(report, 'browserSmokeArtifactStatus') === 'pass', failures, cases, statusOf(report, 'browserSmokeArtifactStatus'), reasonsOf(report, 'browserSmokeArtifactStatus'));
  report = buildBrowserSmokeArtifactReport({ browserSmokeRequired: true, artifactPresent: true, rawConsoleLogIncluded: true });
  assertCase('browser_smoke_raw_console_log_fails', statusOf(report, 'browserSmokeArtifactStatus') === 'fail', failures, cases, statusOf(report, 'browserSmokeArtifactStatus'), reasonsOf(report, 'browserSmokeArtifactStatus'));

  report = buildFailureToRepairPlanReport({ failurePresent: true, planPresent: true, bodyOnlyRepair: true });
  assertCase('failure_to_repair_plan_body_only_pass', statusOf(report, 'failureToRepairPlanStatus') === 'pass', failures, cases, statusOf(report, 'failureToRepairPlanStatus'), reasonsOf(report, 'failureToRepairPlanStatus'));
  report = buildFailureToRepairPlanReport({ failurePresent: true });
  assertCase('failure_to_repair_plan_missing_fails', statusOf(report, 'failureToRepairPlanStatus') === 'fail', failures, cases, statusOf(report, 'failureToRepairPlanStatus'), reasonsOf(report, 'failureToRepairPlanStatus'));

  report = buildRuntimeStateAdoptionReport({ runtimeStateRelevant: true, schemaOnly: true });
  assertCase('runtime_state_adoption_schema_only_not_ready', statusOf(report, 'runtimeStateAdoptionStatus') === 'pass' && report.runtimeStateAdoptionStatus.runtimeReadinessProven === false, failures, cases, statusOf(report, 'runtimeStateAdoptionStatus'), reasonsOf(report, 'runtimeStateAdoptionStatus'));
  report = buildRuntimeStateAdoptionReport({ runtimeStateRelevant: true, helperUsed: true });
  assertCase('runtime_state_adoption_helper_used_pass', statusOf(report, 'runtimeStateAdoptionStatus') === 'pass', failures, cases, statusOf(report, 'runtimeStateAdoptionStatus'), reasonsOf(report, 'runtimeStateAdoptionStatus'));

  report = buildClaimTransitionReport({ claimRelevant: true });
  assertCase('claim_transition_atomic_required', statusOf(report, 'claimTransitionStatus') === 'fail', failures, cases, statusOf(report, 'claimTransitionStatus'), reasonsOf(report, 'claimTransitionStatus'));
  report = buildTimeoutAdoptionReport({ txWaitPath: true });
  assertCase('timeout_adoption_tx_wait_without_timeout_fails', statusOf(report, 'timeoutAdoptionStatus') === 'fail', failures, cases, statusOf(report, 'timeoutAdoptionStatus'), reasonsOf(report, 'timeoutAdoptionStatus'));
  report = buildTxReconciliationServiceReport({ txRelevant: true });
  assertCase('tx_reconciliation_service_missing_fails', statusOf(report, 'txReconciliationServiceStatus') === 'fail', failures, cases, statusOf(report, 'txReconciliationServiceStatus'), reasonsOf(report, 'txReconciliationServiceStatus'));
  report = buildTxHashBeforeWaitReport({ txWaitRelevant: true });
  assertCase('txhash_before_wait_missing_fails', statusOf(report, 'txHashBeforeWaitStatus') === 'fail', failures, cases, statusOf(report, 'txHashBeforeWaitStatus'), reasonsOf(report, 'txHashBeforeWaitStatus'));
  report = buildReceiptResumeBoundaryReport({ receiptRelevant: true });
  assertCase('receipt_resume_boundary_missing_fails', statusOf(report, 'receiptResumeBoundaryStatus') === 'fail', failures, cases, statusOf(report, 'receiptResumeBoundaryStatus'), reasonsOf(report, 'receiptResumeBoundaryStatus'));

  report = buildMigrationRolloutSafetyReport({ migrationRelevant: true, additiveNullable: true });
  assertCase('migration_rollout_additive_nullable_pass', statusOf(report, 'migrationRolloutSafetyStatus') === 'pass', failures, cases, statusOf(report, 'migrationRolloutSafetyStatus'), reasonsOf(report, 'migrationRolloutSafetyStatus'));
  report = buildMigrationRolloutSafetyReport({ migrationRelevant: true, destructiveMigration: true });
  assertCase('migration_rollout_destructive_without_rollback_fails', statusOf(report, 'migrationRolloutSafetyStatus') === 'fail', failures, cases, statusOf(report, 'migrationRolloutSafetyStatus'), reasonsOf(report, 'migrationRolloutSafetyStatus'));
  report = buildMigrationRuntimeCompatReport({ migrationRelevant: true });
  assertCase('migration_runtime_compat_missing_fails', statusOf(report, 'migrationRuntimeCompatStatus') === 'fail', failures, cases, statusOf(report, 'migrationRuntimeCompatStatus'), reasonsOf(report, 'migrationRuntimeCompatStatus'));

  report = buildHumanReviewDigestReport({ r3: true });
  assertCase('human_review_digest_required_for_r3', statusOf(report, 'humanReviewDigestStatus') === 'fail', failures, cases, statusOf(report, 'humanReviewDigestStatus'), reasonsOf(report, 'humanReviewDigestStatus'));
  report = buildDatasetAuditReadinessReport({ datasetAuditRelevant: true, schemaPresent: true });
  assertCase('dataset_audit_readiness_schema_pass', statusOf(report, 'datasetAuditReadinessStatus') === 'pass', failures, cases, statusOf(report, 'datasetAuditReadinessStatus'), reasonsOf(report, 'datasetAuditReadinessStatus'));
  report = buildDatasetAuditReadinessReport({ datasetAuditRelevant: true, schemaPresent: true, autoFixEnabled: true });
  assertCase('dataset_audit_auto_fix_fails', statusOf(report, 'datasetAuditReadinessStatus') === 'fail', failures, cases, statusOf(report, 'datasetAuditReadinessStatus'), reasonsOf(report, 'datasetAuditReadinessStatus'));

  report = buildGameToolAdapterContractFixtureReport({ gameToolRelevant: true, candidateDirectHandoff: true });
  assertCase('game_tool_candidate_direct_handoff_fails', statusOf(report, 'gameToolAdapterContractFixtureStatus') === 'fail', failures, cases, statusOf(report, 'gameToolAdapterContractFixtureStatus'), reasonsOf(report, 'gameToolAdapterContractFixtureStatus'));
  report = buildGameToolAdapterContractFixtureReport({ gameToolRelevant: true, approvedAction: true });
  assertCase('game_tool_approved_action_passes', statusOf(report, 'gameToolAdapterContractFixtureStatus') === 'pass', failures, cases, statusOf(report, 'gameToolAdapterContractFixtureStatus'), reasonsOf(report, 'gameToolAdapterContractFixtureStatus'));

  report = buildBelovedAvatarSafetyAuditReport({ avatarRelevant: true, memoryPrivacyViolation: true });
  assertCase('beloved_avatar_memory_privacy_violation_fails', statusOf(report, 'belovedAvatarSafetyAuditStatus') === 'fail', failures, cases, statusOf(report, 'belovedAvatarSafetyAuditStatus'), reasonsOf(report, 'belovedAvatarSafetyAuditStatus'));
  report = buildBelovedAvatarSafetyAuditReport({});
  assertCase('beloved_avatar_docs_only_not_applicable', statusOf(report, 'belovedAvatarSafetyAuditStatus') === 'not_applicable', failures, cases, statusOf(report, 'belovedAvatarSafetyAuditStatus'), reasonsOf(report, 'belovedAvatarSafetyAuditStatus'));

  report = buildOwnerSummaryCompactReport({ present: true, lineCount: 5 });
  assertCase('source_harness_only_v096_fixture_pass', statusOf(report, 'ownerSummaryCompactStatus') === 'pass', failures, cases, statusOf(report, 'ownerSummaryCompactStatus'), reasonsOf(report, 'ownerSummaryCompactStatus'));
  report = buildFailureToRepairPlanReport({ failurePresent: true, planPresent: true });
  assertCase('target_harness_rollout_v096_fixture_pass', statusOf(report, 'failureToRepairPlanStatus') === 'pass', failures, cases, statusOf(report, 'failureToRepairPlanStatus'), reasonsOf(report, 'failureToRepairPlanStatus'));

  const unsafe = scanObjectForUnsafe(cases);
  const status = failures.length || unsafe.length ? 'fail' : 'pass';
  return {
    marker,
    harnessVersion: HARNESS_VERSION,
    status,
    v096SelfTestStatus: {
      status,
      suite: 'v096',
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
  const report = buildV096SelfTestReport();
  writeJsonReport(report, 'CODEX_V096_SELF_TEST_REPORT');
  exitFor(report);
}
