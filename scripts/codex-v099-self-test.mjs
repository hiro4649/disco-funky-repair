#!/usr/bin/env node
// CODEX_QUALITY_HARNESS_FILE v0.9.9

import { fileURLToPath } from 'node:url';
import { marker, HARNESS_VERSION, scanObjectForUnsafe, writeJsonReport, exitFor } from './codex-v080-lib.mjs';
import {
  buildFormalEvidencePrecedenceReport,
  buildLifeboatSemanticsReport,
  buildPlaceholderOnlyEvidenceReport,
  buildRemoteNpmDiagnosticNormalizationReport,
  buildLegacySelfTestAdvisoryReport,
  buildAuthSurfaceClassifierRefinementReport,
  buildTargetQualityBlockerDigestReport,
  buildPrEvidenceAutoRepairHintReport,
  buildActionsBlockerRecoveryReport,
  buildPrContextRerunAssistantReport,
  buildSameHeadEvidenceRefreshReport,
  buildSafeArtifactBundleCompletenessReport,
  buildDatasetAuditV2P0SchemaReport,
  buildGameToolAdapterFixtureReadinessReport,
  buildBelovedAvatarSafetyReadinessReport,
} from './codex-v099-gate-lib.mjs';
import { buildRemoteProductSafeArtifacts } from './codex-v098-gate-lib.mjs';

function statusOf(report, key) { return report[key]?.status || report.status || 'missing'; }
function reasonsOf(report, key) { return report[key]?.reasonCodes || []; }
function assertCase(id, condition, failures, cases, actualStatus = 'pass', reasonCodes = []) {
  cases.push({ id, status: condition ? 'pass' : 'fail', actualStatus, reasonCodes, safeSummaryOnly: true });
  if (!condition) failures.push(id);
}
function withEnv(overrides, fn) {
  const previous = new Map();
  for (const [key, value] of Object.entries(overrides)) {
    previous.set(key, process.env[key]);
    if (value === undefined) delete process.env[key];
    else process.env[key] = String(value);
  }
  try {
    return fn();
  } finally {
    for (const [key, value] of previous.entries()) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}
const passEvidence = { status: 'pass', safeSummaryOnly: true };
const failEvidence = { status: 'fail', safeSummaryOnly: true };

export function buildV099SelfTestReport() {
  const failures = [];
  const cases = [];
  let report;

  report = buildFormalEvidencePrecedenceReport({ forceCheck: true, productRelevant: true, formalEvidence: passEvidence, remoteBaseline: passEvidence, remoteNpmDiagnostic: passEvidence, sameHeadMatch: true, normalSafeSummaryPresent: true, standbyLifeboatPresent: true, placeholderSupersededByFormalEvidence: true });
  assertCase('formal_evidence_precedence_pass_with_standby_lifeboat', statusOf(report, 'formalEvidencePrecedenceStatus') === 'pass', failures, cases, statusOf(report, 'formalEvidencePrecedenceStatus'), reasonsOf(report, 'formalEvidencePrecedenceStatus'));
  report = buildFormalEvidencePrecedenceReport({ forceCheck: true, productRelevant: true, formalEvidence: failEvidence, remoteBaseline: passEvidence, remoteNpmDiagnostic: passEvidence, sameHeadMatch: true, normalSafeSummaryPresent: true });
  assertCase('formal_evidence_fail_remains_fail', statusOf(report, 'formalEvidencePrecedenceStatus') === 'fail', failures, cases, statusOf(report, 'formalEvidencePrecedenceStatus'), reasonsOf(report, 'formalEvidencePrecedenceStatus'));
  report = buildPlaceholderOnlyEvidenceReport({ productRelevant: true, onlyPlaceholderEvidence: true });
  assertCase('placeholder_only_product_evidence_fails', statusOf(report, 'placeholderOnlyEvidenceStatus') === 'fail', failures, cases, statusOf(report, 'placeholderOnlyEvidenceStatus'), reasonsOf(report, 'placeholderOnlyEvidenceStatus'));
  report = buildFormalEvidencePrecedenceReport({ forceCheck: true, productRelevant: true, formalEvidence: passEvidence, remoteBaseline: passEvidence, remoteNpmDiagnostic: passEvidence, sameHeadMatch: true, normalSafeSummaryPresent: true, placeholderSupersededByFormalEvidence: true, productEvidence: { status: 'pending', evidenceType: 'placeholder' } });
  assertCase('placeholder_superseded_by_formal_evidence_pass', statusOf(report, 'formalEvidencePrecedenceStatus') === 'pass', failures, cases, statusOf(report, 'formalEvidencePrecedenceStatus'), reasonsOf(report, 'formalEvidencePrecedenceStatus'));
  report = buildLifeboatSemanticsReport({ lifeboatOnly: true });
  assertCase('lifeboat_only_without_normal_summary_fails', statusOf(report, 'lifeboatSemanticsStatus') === 'fail', failures, cases, statusOf(report, 'lifeboatSemanticsStatus'), reasonsOf(report, 'lifeboatSemanticsStatus'));
  report = buildLifeboatSemanticsReport({ standbyLifeboatPresent: true });
  assertCase('normal_safe_bundle_with_standby_lifeboat_pass', statusOf(report, 'lifeboatSemanticsStatus') === 'pass', failures, cases, statusOf(report, 'lifeboatSemanticsStatus'), reasonsOf(report, 'lifeboatSemanticsStatus'));
  report = buildSafeArtifactBundleCompletenessReport({ targetFinalSummaryMissing: true });
  assertCase('missing_target_summary_fails', statusOf(report, 'safeArtifactBundleCompletenessStatus') === 'fail', failures, cases, statusOf(report, 'safeArtifactBundleCompletenessStatus'), reasonsOf(report, 'safeArtifactBundleCompletenessStatus'));
  report = buildFormalEvidencePrecedenceReport({ forceCheck: true, productRelevant: true, productEvidenceMissing: true, remoteBaseline: passEvidence, remoteNpmDiagnostic: passEvidence, sameHeadMatch: true });
  assertCase('missing_product_evidence_fails', statusOf(report, 'formalEvidencePrecedenceStatus') === 'fail', failures, cases, statusOf(report, 'formalEvidencePrecedenceStatus'), reasonsOf(report, 'formalEvidencePrecedenceStatus'));
  report = buildFormalEvidencePrecedenceReport({ forceCheck: true, productRelevant: true, formalEvidence: passEvidence, remoteBaselineMissing: true, remoteNpmDiagnostic: passEvidence, sameHeadMatch: true });
  assertCase('missing_remote_baseline_fails', statusOf(report, 'formalEvidencePrecedenceStatus') === 'fail', failures, cases, statusOf(report, 'formalEvidencePrecedenceStatus'), reasonsOf(report, 'formalEvidencePrecedenceStatus'));
  report = buildSafeArtifactBundleCompletenessReport({ reasonSummaryMissing: true });
  assertCase('missing_reason_summary_fails', statusOf(report, 'safeArtifactBundleCompletenessStatus') === 'fail', failures, cases, statusOf(report, 'safeArtifactBundleCompletenessStatus'), reasonsOf(report, 'safeArtifactBundleCompletenessStatus'));
  report = buildFormalEvidencePrecedenceReport({ forceCheck: true, productRelevant: true, formalEvidence: passEvidence, remoteBaseline: passEvidence, remoteNpmDiagnostic: passEvidence, sameHeadMatch: true, npmFailure: true });
  assertCase('npm_failure_remains_fail', statusOf(report, 'formalEvidencePrecedenceStatus') === 'fail', failures, cases, statusOf(report, 'formalEvidencePrecedenceStatus'), reasonsOf(report, 'formalEvidencePrecedenceStatus'));
  report = buildRemoteNpmDiagnosticNormalizationReport({ forceCheck: true, productRelevant: true, npmExecuted: true, npmExitCode: 254, safeFailureCategory: 'unknown_npm_failure', remoteBaseline: { status: 'manual_confirmation_required', remoteProductBaselineStatus: { knownFailures: ['unknown_npm_failure'] } }, candidateRegression: false });
  assertCase('npm_exit_254_unknown_does_not_auto_product_failure', statusOf(report, 'remoteNpmDiagnosticNormalizationStatus') === 'pass' && !reasonsOf(report, 'remoteNpmDiagnosticNormalizationStatus').includes('remote_npm_not_executed_for_product_pr'), failures, cases, statusOf(report, 'remoteNpmDiagnosticNormalizationStatus'), reasonsOf(report, 'remoteNpmDiagnosticNormalizationStatus'));
  report = buildRemoteNpmDiagnosticNormalizationReport({ forceCheck: true, productRelevant: true, npmExecuted: true, npmExitCode: 254, safeFailureCategory: 'unknown_npm_failure', remoteBaseline: { status: 'manual_confirmation_required', remoteProductBaselineStatus: { knownFailures: ['unknown_npm_failure'] } }, candidateRegression: false });
  assertCase('baseline_same_unknown_npm_failure_not_candidate_regression', statusOf(report, 'remoteNpmDiagnosticNormalizationStatus') === 'pass', failures, cases, statusOf(report, 'remoteNpmDiagnosticNormalizationStatus'), reasonsOf(report, 'remoteNpmDiagnosticNormalizationStatus'));
  report = buildRemoteNpmDiagnosticNormalizationReport({ forceCheck: true, productRelevant: true, npmExecuted: true, npmExitCode: 254, safeFailureCategory: 'unknown_npm_failure', remoteBaseline: { status: 'manual_confirmation_required', remoteProductBaselineStatus: { knownFailures: ['unknown_npm_failure'] } } });
  assertCase('formal_evidence_npmExecuted_true_not_remote_npm_not_executed', !reasonsOf(report, 'remoteNpmDiagnosticNormalizationStatus').includes('remote_npm_not_executed_for_product_pr'), failures, cases, statusOf(report, 'remoteNpmDiagnosticNormalizationStatus'), reasonsOf(report, 'remoteNpmDiagnosticNormalizationStatus'));
  report = buildRemoteNpmDiagnosticNormalizationReport({ forceCheck: true, productRelevant: true, npmExecuted: true, npmExitCode: 0, formalEvidence: passEvidence, remoteBaseline: passEvidence, diagnosticStatus: 'superseded_by_formal_evidence' });
  assertCase('remote_npm_diagnostic_normalized_when_formal_evidence_pass', statusOf(report, 'remoteNpmDiagnosticNormalizationStatus') === 'pass', failures, cases, statusOf(report, 'remoteNpmDiagnosticNormalizationStatus'), reasonsOf(report, 'remoteNpmDiagnosticNormalizationStatus'));
  report = buildRemoteNpmDiagnosticNormalizationReport({ forceCheck: true, productRelevant: true, npmExecuted: false });
  assertCase('remote_npm_not_executed_emitted_when_npm_not_run', statusOf(report, 'remoteNpmDiagnosticNormalizationStatus') === 'fail', failures, cases, statusOf(report, 'remoteNpmDiagnosticNormalizationStatus'), reasonsOf(report, 'remoteNpmDiagnosticNormalizationStatus'));
  report = withEnv({
    CODEX_REMOTE_NPM_EXECUTED: 'true',
    CODEX_NPM_EXIT_CODE: '0',
    CODEX_PRODUCT_VERIFICATION_EVIDENCE_JSON: JSON.stringify({ ...passEvidence, npmExecuted: true }),
  }, () => buildRemoteNpmDiagnosticNormalizationReport({ forceCheck: true, productRelevant: true, npmExecuted: false }));
  assertCase('remote_npm_not_executed_fixture_remains_fail_when_env_has_formal_evidence', statusOf(report, 'remoteNpmDiagnosticNormalizationStatus') === 'fail' && reasonsOf(report, 'remoteNpmDiagnosticNormalizationStatus').includes('remote_npm_not_executed_for_product_pr'), failures, cases, statusOf(report, 'remoteNpmDiagnosticNormalizationStatus'), reasonsOf(report, 'remoteNpmDiagnosticNormalizationStatus'));
  report = withEnv({
    CODEX_REMOTE_NPM_EXECUTED: 'true',
    CODEX_NPM_EXIT_CODE: '0',
  }, () => buildRemoteNpmDiagnosticNormalizationReport({ forceCheck: true, productRelevant: true, npmExecuted: false }));
  assertCase('npmExecuted_false_fixture_does_not_use_process_env', statusOf(report, 'remoteNpmDiagnosticNormalizationStatus') === 'fail' && reasonsOf(report, 'remoteNpmDiagnosticNormalizationStatus').includes('remote_npm_not_executed_for_product_pr'), failures, cases, statusOf(report, 'remoteNpmDiagnosticNormalizationStatus'), reasonsOf(report, 'remoteNpmDiagnosticNormalizationStatus'));
  report = withEnv({
    CODEX_REMOTE_NPM_EXECUTED: 'true',
    CODEX_NPM_EXIT_CODE: '254',
    CODEX_REMOTE_NPM_DIAGNOSTIC_JSON: JSON.stringify({ status: 'fail', safeFailureCategory: 'unknown_npm_failure', npmExitCode: 254 }),
  }, () => buildRemoteNpmDiagnosticNormalizationReport({ forceCheck: true, productRelevant: true, npmExecuted: false, npmExitCode: 0, safeFailureCategory: '' }));
  assertCase('forceCheck_fixture_input_overrides_env_fallback', statusOf(report, 'remoteNpmDiagnosticNormalizationStatus') === 'fail' && reasonsOf(report, 'remoteNpmDiagnosticNormalizationStatus').includes('remote_npm_not_executed_for_product_pr') && !reasonsOf(report, 'remoteNpmDiagnosticNormalizationStatus').includes('remote_npm_diagnostic_normalization_failed'), failures, cases, statusOf(report, 'remoteNpmDiagnosticNormalizationStatus'), reasonsOf(report, 'remoteNpmDiagnosticNormalizationStatus'));
  report = withEnv({
    CODEX_REMOTE_NPM_EXECUTED: undefined,
    CODEX_NPM_EXIT_CODE: undefined,
    CODEX_PRODUCT_VERIFICATION_EVIDENCE_JSON: undefined,
    CODEX_REMOTE_NPM_DIAGNOSTIC_JSON: undefined,
  }, () => buildRemoteNpmDiagnosticNormalizationReport({ forceCheck: true, productRelevant: true, npmExecuted: true, npmExitCode: 0, formalEvidence: passEvidence, remoteBaseline: passEvidence, formalDiagnostic: passEvidence }));
  assertCase('formal_evidence_pass_fixture_remains_pass_without_env', statusOf(report, 'remoteNpmDiagnosticNormalizationStatus') === 'pass', failures, cases, statusOf(report, 'remoteNpmDiagnosticNormalizationStatus'), reasonsOf(report, 'remoteNpmDiagnosticNormalizationStatus'));
  report = withEnv({
    CODEX_REMOTE_NPM_EXECUTED: 'true',
    CODEX_NPM_EXIT_CODE: '0',
    CODEX_PRODUCT_VERIFICATION_EVIDENCE_JSON: JSON.stringify({ ...passEvidence, npmExecuted: true }),
    CODEX_REMOTE_PRODUCT_BASELINE_JSON: JSON.stringify(passEvidence),
    CODEX_REMOTE_NPM_DIAGNOSTIC_JSON: JSON.stringify(passEvidence),
  }, () => buildRemoteNpmDiagnosticNormalizationReport({ forceCheck: true, productRelevant: true, npmExecuted: false }));
  assertCase('v099_self_test_fixtures_ignore_ambient_formal_evidence_env', statusOf(report, 'remoteNpmDiagnosticNormalizationStatus') === 'fail' && reasonsOf(report, 'remoteNpmDiagnosticNormalizationStatus').includes('remote_npm_not_executed_for_product_pr'), failures, cases, statusOf(report, 'remoteNpmDiagnosticNormalizationStatus'), reasonsOf(report, 'remoteNpmDiagnosticNormalizationStatus'));
  report = buildLegacySelfTestAdvisoryReport({ harnessVersion: '0.9.9', selfTestFilePresent: true, localGateHasStatus: true, legacyFailureAdvisory: true });
  assertCase('legacy_self_test_advisory_for_non_active_version', statusOf(report, 'legacySelfTestAdvisoryStatus') === 'pass', failures, cases, statusOf(report, 'legacySelfTestAdvisoryStatus'), reasonsOf(report, 'legacySelfTestAdvisoryStatus'));
  report = buildLegacySelfTestAdvisoryReport({ harnessVersion: '0.9.9', selfTestFilePresent: true, localGateHasStatus: true, legacyStatusKey: 'v098SelfTestStatus', legacyFailureAdvisory: true });
  assertCase('legacy_v098_failure_advisory_for_v099', statusOf(report, 'legacySelfTestAdvisoryStatus') === 'pass', failures, cases, statusOf(report, 'legacySelfTestAdvisoryStatus'), reasonsOf(report, 'legacySelfTestAdvisoryStatus'));
  report = buildLegacySelfTestAdvisoryReport({ harnessVersion: '0.9.9', selfTestFilePresent: true, localGateHasStatus: true, legacyStatusKey: 'v085SelfTestStatus', legacyFailureAdvisory: true });
  assertCase('legacy_v085_failure_advisory_for_v099', statusOf(report, 'legacySelfTestAdvisoryStatus') === 'pass', failures, cases, statusOf(report, 'legacySelfTestAdvisoryStatus'), reasonsOf(report, 'legacySelfTestAdvisoryStatus'));
  report = buildLegacySelfTestAdvisoryReport({ harnessVersion: '0.9.9', selfTestFilePresent: true, localGateHasStatus: true, activeV099Failure: true });
  assertCase('active_v099_self_test_failure_blocks', statusOf(report, 'legacySelfTestAdvisoryStatus') === 'fail', failures, cases, statusOf(report, 'legacySelfTestAdvisoryStatus'), reasonsOf(report, 'legacySelfTestAdvisoryStatus'));
  report = buildAuthSurfaceClassifierRefinementReport({ forceCheck: true, queryOnly: true, classification: 'query_filter_only' });
  assertCase('auth_surface_query_only_not_auth_surface', statusOf(report, 'authSurfaceClassifierRefinementStatus') === 'pass', failures, cases, statusOf(report, 'authSurfaceClassifierRefinementStatus'), reasonsOf(report, 'authSurfaceClassifierRefinementStatus'));
  report = buildAuthSurfaceClassifierRefinementReport({ forceCheck: true, queryOnly: true, classification: 'query_filter_only' });
  assertCase('tier_scheduler_query_only_not_auth_surface', statusOf(report, 'authSurfaceClassifierRefinementStatus') === 'pass', failures, cases, statusOf(report, 'authSurfaceClassifierRefinementStatus'), reasonsOf(report, 'authSurfaceClassifierRefinementStatus'));
  report = buildAuthSurfaceClassifierRefinementReport({ forceCheck: true, actualAuthChange: true, classification: 'auth_surface' });
  assertCase('actual_auth_change_still_auth_surface', statusOf(report, 'authSurfaceClassifierRefinementStatus') === 'pass', failures, cases, statusOf(report, 'authSurfaceClassifierRefinementStatus'), reasonsOf(report, 'authSurfaceClassifierRefinementStatus'));
  report = buildTargetQualityBlockerDigestReport({ targetQualityFail: true, topBlocker: 'product evidence missing', blockerClass: 'product', safeReasonCodes: ['formal_evidence_precedence_failed'] });
  assertCase('target_quality_blocker_digest_product', statusOf(report, 'targetQualityBlockerDigestStatus') === 'pass', failures, cases, statusOf(report, 'targetQualityBlockerDigestStatus'), reasonsOf(report, 'targetQualityBlockerDigestStatus'));
  report = buildTargetQualityBlockerDigestReport({ targetQualityFail: true, topBlocker: 'body repair needed', blockerClass: 'body', safeReasonCodes: ['manual_confirmation_required'] });
  assertCase('target_quality_blocker_digest_body', statusOf(report, 'targetQualityBlockerDigestStatus') === 'pass', failures, cases, statusOf(report, 'targetQualityBlockerDigestStatus'), reasonsOf(report, 'targetQualityBlockerDigestStatus'));
  report = buildTargetQualityBlockerDigestReport({ targetQualityFail: true, topBlocker: 'actions billing blocked', blockerClass: 'remote_infra', safeReasonCodes: ['remote_infra_failure_misclassified_as_product'] });
  assertCase('target_quality_blocker_digest_remote_infra', statusOf(report, 'targetQualityBlockerDigestStatus') === 'pass', failures, cases, statusOf(report, 'targetQualityBlockerDigestStatus'), reasonsOf(report, 'targetQualityBlockerDigestStatus'));
  report = buildPrEvidenceAutoRepairHintReport({ bodyOnlyIssue: true, repairClass: 'body_only' });
  assertCase('pr_evidence_auto_repair_body_only_hint', statusOf(report, 'prEvidenceAutoRepairHintStatus') === 'pass', failures, cases, statusOf(report, 'prEvidenceAutoRepairHintStatus'), reasonsOf(report, 'prEvidenceAutoRepairHintStatus'));
  report = buildPrEvidenceAutoRepairHintReport({ productFailureBodyOnly: true });
  assertCase('body_evidence_missing_still_fails_relevant_gate', statusOf(report, 'prEvidenceAutoRepairHintStatus') === 'fail', failures, cases, statusOf(report, 'prEvidenceAutoRepairHintStatus'), reasonsOf(report, 'prEvidenceAutoRepairHintStatus'));
  report = buildActionsBlockerRecoveryReport({ forceCheck: true, failureClass: 'remote_quality_gate_blocked_account_billing', blockerClass: 'remote_infra', safeAction: 'wait_for_same_head_remote_pass' });
  assertCase('actions_blocker_billing_classified_remote_infra', statusOf(report, 'actionsBlockerRecoveryStatus') === 'pass', failures, cases, statusOf(report, 'actionsBlockerRecoveryStatus'), reasonsOf(report, 'actionsBlockerRecoveryStatus'));
  report = buildActionsBlockerRecoveryReport({ forceCheck: true, failureClass: 'remote_quality_gate_rerun_404', safeAction: 'push_empty_commit_to_refresh_pr_context' });
  assertCase('actions_blocker_rerun_404_empty_commit_hint', statusOf(report, 'actionsBlockerRecoveryStatus') === 'pass', failures, cases, statusOf(report, 'actionsBlockerRecoveryStatus'), reasonsOf(report, 'actionsBlockerRecoveryStatus'));
  report = buildPrContextRerunAssistantReport({ forceCheck: true, rerunContext: 'stale_head', blindRerunForStaleHead: true });
  assertCase('pr_context_rerun_stale_head_blocks', statusOf(report, 'prContextRerunAssistantStatus') === 'fail', failures, cases, statusOf(report, 'prContextRerunAssistantStatus'), reasonsOf(report, 'prContextRerunAssistantStatus'));
  report = buildSameHeadEvidenceRefreshReport({ forceCheck: true, evidenceRefreshRelevant: true, refreshRequired: true });
  assertCase('same_head_evidence_refresh_after_empty_commit', statusOf(report, 'sameHeadEvidenceRefreshStatus') === 'pass', failures, cases, statusOf(report, 'sameHeadEvidenceRefreshStatus'), reasonsOf(report, 'sameHeadEvidenceRefreshStatus'));
  report = buildSafeArtifactBundleCompletenessReport({});
  assertCase('safe_artifact_bundle_completeness_normal_pass', statusOf(report, 'safeArtifactBundleCompletenessStatus') === 'pass', failures, cases, statusOf(report, 'safeArtifactBundleCompletenessStatus'), reasonsOf(report, 'safeArtifactBundleCompletenessStatus'));
  report = buildSafeArtifactBundleCompletenessReport({ lifeboatOnlyPass: true });
  assertCase('safe_artifact_bundle_lifeboat_only_fail', statusOf(report, 'safeArtifactBundleCompletenessStatus') === 'fail', failures, cases, statusOf(report, 'safeArtifactBundleCompletenessStatus'), reasonsOf(report, 'safeArtifactBundleCompletenessStatus'));
  report = buildDatasetAuditV2P0SchemaReport({ forceCheck: true, classificationOnly: true });
  assertCase('dataset_audit_v2_p0_schema_pass', statusOf(report, 'datasetAuditV2P0SchemaStatus') === 'pass', failures, cases, statusOf(report, 'datasetAuditV2P0SchemaStatus'), reasonsOf(report, 'datasetAuditV2P0SchemaStatus'));
  report = buildDatasetAuditV2P0SchemaReport({ forceCheck: true, autoFixAllowed: true });
  assertCase('dataset_audit_v2_auto_fix_fails', statusOf(report, 'datasetAuditV2P0SchemaStatus') === 'fail', failures, cases, statusOf(report, 'datasetAuditV2P0SchemaStatus'), reasonsOf(report, 'datasetAuditV2P0SchemaStatus'));
  report = buildGameToolAdapterFixtureReadinessReport({ forceCheck: true, candidateDirectHandoff: true });
  assertCase('game_tool_candidate_direct_handoff_fails', statusOf(report, 'gameToolAdapterFixtureReadinessStatus') === 'fail', failures, cases, statusOf(report, 'gameToolAdapterFixtureReadinessStatus'), reasonsOf(report, 'gameToolAdapterFixtureReadinessStatus'));
  report = buildGameToolAdapterFixtureReadinessReport({ forceCheck: true });
  assertCase('game_tool_approved_action_pass', statusOf(report, 'gameToolAdapterFixtureReadinessStatus') === 'pass', failures, cases, statusOf(report, 'gameToolAdapterFixtureReadinessStatus'), reasonsOf(report, 'gameToolAdapterFixtureReadinessStatus'));
  report = buildBelovedAvatarSafetyReadinessReport({ forceCheck: true, memoryPrivacyViolation: true });
  assertCase('beloved_avatar_memory_privacy_fails', statusOf(report, 'belovedAvatarSafetyReadinessStatus') === 'fail', failures, cases, statusOf(report, 'belovedAvatarSafetyReadinessStatus'), reasonsOf(report, 'belovedAvatarSafetyReadinessStatus'));
  report = buildPlaceholderOnlyEvidenceReport({ productRelevant: false });
  assertCase('source_harness_only_v099_fixture_pass', statusOf(report, 'placeholderOnlyEvidenceStatus') === 'pass', failures, cases, statusOf(report, 'placeholderOnlyEvidenceStatus'), reasonsOf(report, 'placeholderOnlyEvidenceStatus'));
  report = buildFormalEvidencePrecedenceReport({ forceCheck: true, productRelevant: true, formalEvidence: passEvidence, remoteBaseline: passEvidence, remoteNpmDiagnostic: passEvidence, productEvidence: { status: 'pending', evidenceType: 'placeholder' }, placeholderSupersededByFormalEvidence: true, sameHeadMatch: true });
  assertCase('pending_remote_product_checks_superseded_by_formal_evidence_pass', statusOf(report, 'formalEvidencePrecedenceStatus') === 'pass', failures, cases, statusOf(report, 'formalEvidencePrecedenceStatus'), reasonsOf(report, 'formalEvidencePrecedenceStatus'));
  report = buildFormalEvidencePrecedenceReport({ forceCheck: true, productRelevant: true, productEvidence: { status: 'pending', evidenceType: 'placeholder' }, remoteBaseline: passEvidence, remoteNpmDiagnostic: passEvidence, sameHeadMatch: true });
  assertCase('remote_product_checks_pending_only_still_fails', statusOf(report, 'formalEvidencePrecedenceStatus') === 'fail', failures, cases, statusOf(report, 'formalEvidencePrecedenceStatus'), reasonsOf(report, 'formalEvidencePrecedenceStatus'));
  const safeArtifacts = buildRemoteProductSafeArtifacts({ productRelevant: true, npmExecuted: true, npmExitCode: 254, commandScope: 'root', packageJsonPresent: false, scriptPresent: false, rootPackageJsonPresent: false, headSha: 'a'.repeat(40), baseSha: 'b'.repeat(40), repository: 'owner/repo' }, { CODEX_EVENT_NAME: 'pull_request', CODEX_PR_HEAD_SHA: 'a'.repeat(40), CODEX_PR_BASE_SHA: 'b'.repeat(40), CODEX_REPOSITORY: 'owner/repo', CODEX_NODE_MAJOR: '20' });
  assertCase('remote_command_scope_mismatch_classified_safely', safeArtifacts.diagnostic.safeFailureCategory === 'script_missing' && safeArtifacts.remoteChecks.status === 'fail' && safeArtifacts.remoteChecks.commandScope === 'root', failures, cases, safeArtifacts.diagnostic.safeFailureCategory, safeArtifacts.remoteChecks.safeReasonCodes);
  report = buildSafeArtifactBundleCompletenessReport({ productRelevant: false });
  assertCase('target_harness_rollout_v099_fixture_pass', statusOf(report, 'safeArtifactBundleCompletenessStatus') === 'pass', failures, cases, statusOf(report, 'safeArtifactBundleCompletenessStatus'), reasonsOf(report, 'safeArtifactBundleCompletenessStatus'));

  const safeCases = cases.map(({ id, ...rest }, index) => ({ caseIndex: index + 1, ...rest }));
  const failedCaseIndexes = failures.map((id) => cases.findIndex((item) => item.id === id) + 1).filter((index) => index > 0);
  const unsafe = scanObjectForUnsafe(safeCases);
  const status = failures.length || unsafe.length ? 'fail' : 'pass';
  return {
    marker,
    harnessVersion: HARNESS_VERSION,
    status,
    v099SelfTestStatus: {
      status,
      suite: 'v099',
      caseCount: safeCases.length,
      failedCaseCount: failures.length,
      failedCases: failedCaseIndexes,
      cases: safeCases,
      reasonCodes: unsafe.length ? ['unsafe_output_detected'] : [],
      safeSummaryOnly: true,
    },
    cases: safeCases,
    safeSummaryOnly: true,
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const report = buildV099SelfTestReport();
  writeJsonReport(report, 'CODEX_V099_SELF_TEST_REPORT');
  exitFor(report);
}
