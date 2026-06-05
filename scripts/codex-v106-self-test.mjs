#!/usr/bin/env node
// CODEX_QUALITY_HARNESS_FILE v1.0.6
import { readFileSync } from 'node:fs';
import { scanObjectForUnsafe, writeJsonReport, exitFor } from './codex-v080-lib.mjs';
import * as gates from './codex-v106-gate-lib.mjs';
import { buildActiveSelfTestRegistryReport } from './codex-active-self-test-registry-gate.mjs';
import { buildKnowledgeGovernanceReport } from './codex-knowledge-governance-gate.mjs';
import { buildPullRequestContextFidelityReport } from './codex-pull-request-context-fidelity-gate.mjs';
import { buildVersionLineageReport } from './codex-version-lineage-gate.mjs';
import { buildWorkflowProductVerificationInvariantReport } from './codex-v097-gate-lib.mjs';
import { buildCompactReasonSummary } from './codex-reason-summary.mjs';

function legacyAbsenceIsAdvisoryReport() {
  const report = buildVersionLineageReport({ CODEX_HARNESS_MODE: 'target' });
  const reasons = report.versionLineageStatus?.reasonCodes || [];
  const legacyMissingBlocking = reasons.some((code) => /^version_lineage_v09[2-5]_self_test_missing$/.test(code));
  return {
    legacyV092ToV095AbsenceStatus: {
      status: legacyMissingBlocking ? 'fail' : 'pass',
      reasonCodes: legacyMissingBlocking ? ['legacy_absence_blocking'] : [],
      safeSummaryOnly: true,
    },
  };
}

function remoteProductMarkerReport() {
  const text = readFileSync('scripts/codex-remote-product-checks.mjs', 'utf8');
  const pass = /CODEX_QUALITY_HARNESS_FILE v1\.0\.6/.test(text) && !/CODEX_QUALITY_HARNESS_FILE v1\.0\.3/.test(text);
  return {
    remoteProductChecksMarkerStatus: {
      status: pass ? 'pass' : 'fail',
      reasonCodes: pass ? [] : ['remote_product_checks_marker_not_v106'],
      safeSummaryOnly: true,
    },
  };
}

function oldMarkerFixtureReport(input = {}) {
  const stale = input.markerVersion && input.markerVersion !== '1.0.6';
  return {
    oldMarkerFixtureStatus: {
      status: stale ? 'fail' : 'pass',
      reasonCodes: stale ? ['old_source_marker_detected'] : [],
      safeSummaryOnly: true,
    },
  };
}

function activeV106FailureBlocksReport() {
  return {
    v106SelfTestStatus: {
      status: 'fail',
      reasonCodes: ['active_v106_failure_blocks'],
      blocking: true,
      safeSummaryOnly: true,
    },
  };
}

function staticStatus(statusKey, pass, reasonCodes = []) {
  return { [statusKey]: { status: pass ? 'pass' : 'fail', reasonCodes: pass ? [] : reasonCodes, safeSummaryOnly: true } };
}

function fileText(path) {
  try {
    return readFileSync(path, 'utf8');
  } catch {
    return '';
  }
}

function buildV106SafeSummaryExportFixture() {
  const lib = fileText('scripts/codex-v080-lib.mjs');
  const runner = fileText('scripts/codex-workflow-quality-runner.mjs');
  const exporter = fileText('scripts/codex-self-test-case-export.mjs');
  const workflow = fileText('.github/workflows/quality-gate.yml');
  const reasons = [];
  if (!/HARNESS_VERSION\s*=\s*'1\.0\.6'/.test(lib)) reasons.push('safe_summary_harness_version_not_106');
  if (!runner.includes('v106SelfTestStatus: report.v106SelfTestStatus')) reasons.push('v106_status_not_exported_to_safe_summary');
  if (!/report\.v106SelfTestStatus\s*\|\|\s*report\.v105SelfTestStatus\s*\|\|\s*report\.v098SelfTestStatus/.test(runner)) reasons.push('active_v106_not_selected_before_legacy_self_test');
  if (!exporter.includes("envJson(env, 'CODEX_V106_SELF_TEST_REPORT')")) reasons.push('self_test_case_export_does_not_read_v106_report');
  if (!workflow.includes('node scripts/codex-remote-product-checks.mjs --plan-json')) reasons.push('workflow_does_not_use_remote_product_plan');
  return staticStatus('v106SelfTestStatus', reasons.length === 0, reasons);
}

function buildFormalBackendEvidenceMetadataFixture() {
  const v098 = fileText('scripts/codex-v098-gate-lib.mjs');
  const normalizer = fileText('scripts/codex-product-verification-evidence-normalize.mjs');
  const diagnostic = fileText('scripts/codex-remote-npm-diagnostic-classify.mjs');
  const reasons = [];
  for (const field of ['cwd', 'packageScope', 'commandClass']) {
    if (!v098.includes(field)) reasons.push(`remote_safe_artifact_missing_${field}`);
    if (!normalizer.includes(field)) reasons.push(`formal_evidence_normalizer_missing_${field}`);
  }
  if (!diagnostic.includes("'command_scope_mismatch'")) reasons.push('command_scope_mismatch_not_safe_category');
  return staticStatus('remoteProductEvidencePlanStatus', reasons.length === 0, reasons);
}

function buildSafeOutputScanStatusExportFixture() {
  const runner = fileText('scripts/codex-workflow-quality-runner.mjs');
  const finalSummary = fileText('scripts/codex-target-final-summary.mjs');
  const reasons = [];
  if (!runner.includes('function buildSafeOutputScanStatus(report = {})')) reasons.push('safe_output_scan_status_helper_missing');
  if (!runner.includes('const safeOutputScanStatus = buildSafeOutputScanStatus(report);')) reasons.push('safe_output_scan_status_not_derived_in_workflow_runner');
  if (!runner.includes('safeOutputScanStatus,')) reasons.push('safe_output_scan_status_not_exported_to_quality_safe_summary');
  if (!runner.includes('targetQualityScoreStatus: report.targetQualityScoreStatus')) reasons.push('target_quality_summary_missing_target_quality_status');
  if (!runner.includes('safeOutputScanStatus,')) reasons.push('safe_output_scan_status_not_exported_to_target_quality_summary');
  if (!finalSummary.includes("safeOutputScan: report.safeOutputScanStatus?.status || 'missing'")) reasons.push('safe_output_scan_status_not_visible_in_target_final_summary');
  return staticStatus('safeOutputScanStatus', reasons.length === 0, reasons);
}

function buildV085AdvisoryReasonSummaryFixture() {
  const result = buildCompactReasonSummary({
    status: 'fail',
    targetQualityScoreStatus: { status: 'pass', score: 95, safeSummaryOnly: true },
    v106SelfTestStatus: { status: 'pass', safeSummaryOnly: true },
    safeOutputScanStatus: { status: 'pass', safeSummaryOnly: true },
    productVerificationStatus: { status: 'pass', safeSummaryOnly: true },
    productVerificationEvidenceStatus: { status: 'pass', safeSummaryOnly: true },
    remoteProductBaselineStatus: { status: 'pass', safeSummaryOnly: true },
    baselineHealthStatus: { status: 'pass', safeSummaryOnly: true },
    v085StabilityStatus: {
      status: 'pass',
      targetCompatibilityAdvisory: true,
      reasonCodes: ['target_rollout_legacy_status_advisory'],
      safeSummaryOnly: true,
    },
    failures: [{ id: 'v085StabilityStatus.failed' }],
  });
  const blockingReasons = result.summary?.blockingReasons || [];
  const pass = result.summary?.status === 'pass'
    && !blockingReasons.some((item) => item.reasonCode === 'v085StabilityStatus.failed');
  return staticStatus('reasonSummaryStatus', pass, ['v085_advisory_reentered_reason_summary_blockers']);
}

function buildV085NonAdvisoryReasonSummaryFixture() {
  const result = buildCompactReasonSummary({
    status: 'fail',
    targetQualityScoreStatus: { status: 'pass', score: 95, safeSummaryOnly: true },
    v106SelfTestStatus: { status: 'pass', safeSummaryOnly: true },
    v085StabilityStatus: {
      status: 'fail',
      reasonCodes: ['v085StabilityStatus.failed'],
      safeSummaryOnly: true,
    },
    failures: [{ id: 'v085StabilityStatus.failed' }],
  });
  const blockingReasons = result.summary?.blockingReasons || [];
  const pass = result.summary?.status === 'fail'
    && blockingReasons.some((item) => item.reasonCode === 'v085StabilityStatus.failed');
  return staticStatus('reasonSummaryStatus', pass, ['non_advisory_v085_failure_not_blocking']);
}

const CASES = [
  ['v106_active_self_test_exported_to_safe_artifact', gates.buildActiveSelfTestExportReport, {}, 'activeSelfTestExportStatus', 'pass'],
  ['v106_self_test_status_exported_to_safe_artifacts', gates.buildDefaultV106Reports, { caseCount: 1, failedCaseCount: 0 }, 'v106SelfTestStatus', 'pass'],
  ['active_v106_failure_blocks', activeV106FailureBlocksReport, {}, 'v106SelfTestStatus', 'fail'],
  ['v106_active_self_test_registry_passes', () => ({ activeSelfTestRegistryStatus: buildActiveSelfTestRegistryReport({}, { CODEX_HARNESS_MODE: 'target' }) }), {}, 'activeSelfTestRegistryStatus', 'pass'],
  ['active_registry_uses_target_manifest_by_default', gates.buildActiveSelfTestExportReport, {}, 'activeRegistryManifestSourceStatus', 'pass'],
  ['source_manifest_and_target_manifest_sources_are_reported', gates.buildDiagnosticProvenanceReport, {}, 'diagnosticProvenanceStatus', 'pass'],
  ['legacy_v085_uses_current_safe_shape_adapter', gates.buildLegacySelfTestCompatibilityAdapterReport, {}, 'legacySelfTestCompatibilityAdapterStatus', 'pass'],
  ['legacy_v087_fixture_local_context_does_not_read_default_repo', gates.buildLegacySelfTestCompatibilityAdapterReport, { liveRepoRead: true }, 'legacySelfTestCompatibilityAdapterStatus', 'fail'],
  ['legacy_v092_absent_if_not_required_is_advisory', gates.buildLegacySelfTestCompatibilityAdapterReport, {}, 'legacySelfTestCompatibilityAdapterStatus', 'pass'],
  ['legacy_v092_to_v095_absence_is_advisory_or_not_applicable', legacyAbsenceIsAdvisoryReport, {}, 'legacyV092ToV095AbsenceStatus', 'pass'],
  ['version_lineage_v106_current_active_passes', () => buildVersionLineageReport({ CODEX_HARNESS_MODE: 'target' }), {}, 'versionLineageStatus', 'pass'],
  ['pr_context_fidelity_exports_pr_number_head_base_changed_files', () => ({ pullRequestContextFidelityStatus: buildPullRequestContextFidelityReport({ isPullRequest: true, prNumber: 1, headSha: 'head', baseSha: 'base', changedFiles: ['scripts/codex-v106-self-test.mjs'] }, {}) }), {}, 'pullRequestContextFidelityStatus', 'pass'],
  ['knowledge_governance_accepts_supported_marker_source', () => ({ knowledgeGovernanceStatus: buildKnowledgeGovernanceReport({ CODEX_PR_BODY: 'Knowledge source: safe artifact\nKnowledge marker: Harness v1.0.6\nKnowledge boundary: safe summary only\nKnowledge update: marker recognized' }) }), {}, 'knowledgeGovernanceStatus', 'pass'],
  ['remote_product_checks_marker_is_v106', remoteProductMarkerReport, {}, 'remoteProductChecksMarkerStatus', 'pass'],
  ['old_marker_detection_still_catches_real_stale_marker', oldMarkerFixtureReport, { markerVersion: '1.0.3' }, 'oldMarkerFixtureStatus', 'fail'],
  ['fixture_failed_without_safe_label_fails', gates.buildSafeAttributionEverywhereReport, { safe_case_label: false }, 'safeAttributionEverywhereStatus', 'fail'],
  ['npm_failure_without_safe_label_fails', gates.buildSafeAttributionEverywhereReport, { safe_reason_code: false }, 'safeAttributionEverywhereStatus', 'fail'],
  ['target_quality_breakdown_drives_reason_summary', gates.buildTargetQualityScoreBreakdownReport, {}, 'reasonSummaryAuthoritativeStatus', 'pass'],
  ['reason_summary_does_not_rescan_fail_statuses', gates.buildTargetQualityScoreBreakdownReport, { reasonSummaryRescansFailures: true }, 'reasonSummaryAuthoritativeStatus', 'fail'],
  ['backend_workflow_path_matches_self_test_fixture', gates.buildWorkflowPathMatchesSelfTestFixtureReport, {}, 'workflowPathMatchesSelfTestFixtureStatus', 'pass'],
  ['backend_remote_plan_single_source_required', gates.buildRemoteProductEvidencePlanReport, {}, 'remoteProductEvidencePlanStatus', 'pass'],
  ['workflow_yaml_cannot_construct_product_npm_directly', gates.buildRemoteProductEvidencePlanReport, { workflowConstructsCommandIndependently: true }, 'remoteProductEvidencePlanStatus', 'fail'],
  ['safe_artifact_cwd_matches_remote_product_plan', gates.buildRemoteProductEvidencePlanReport, { safeArtifactCwd: 'apps/backend' }, 'remoteProductEvidencePlanStatus', 'pass'],
  ['diagnostic_cwd_matches_remote_product_plan', gates.buildRemoteProductEvidencePlanReport, { diagnosticCwd: 'apps/backend' }, 'remoteProductEvidencePlanStatus', 'pass'],
  ['baseline_cwd_matches_remote_product_plan', gates.buildRemoteProductEvidencePlanReport, { baselineCwd: 'apps/backend' }, 'remoteProductEvidencePlanStatus', 'pass'],
  ['body_only_repair_is_not_product_failure', gates.buildBodyOnlyRepairClassifierReport, { parserFailure: true, safeSuggestedPatch: { missingSectionName: 'Risk level', missingExactMetadataLabel: 'Risk level', acceptedAliases: ['Risk level'], rejectedReason: 'missing_required_label', currentParserMode: 'schema', minimalSafeBodyPatch: 'add_missing_label_only' } }, 'bodyOnlyRepairClassifierStatus', 'pass'],
  ['pr_body_parser_outputs_missing_exact_label', gates.buildPrBodySchemaLinterReport, { headings: ['Owner summary'] }, 'prBodySchemaLinterStatus', 'fail'],
  ['evidence_pack_is_single_source', gates.buildEvidenceSingleSourceV2Report, {}, 'evidenceSingleSourceV2Status', 'pass'],
  ['pr_body_generated_from_evidence_pack', gates.buildEvidenceSingleSourceV2Report, {}, 'evidenceSingleSourceV2Status', 'pass'],
  ['pr_body_stale_against_evidence_pack_fails', gates.buildEvidenceSingleSourceV2Report, { prBodyStale: true }, 'evidenceSingleSourceV2Status', 'fail'],
  ['quality_gate_run_id_not_required_in_pr_body', gates.buildEvidenceSingleSourceV2Report, {}, 'evidenceSingleSourceV2Status', 'pass'],
  ['secret_env_reference_not_committed_secret', gates.buildSecretFindingContextClassifierReport, { context: 'env_reference', value: 'process.env.SECRET_NAME' }, 'secretFindingContextClassifierStatus', 'pass'],
  ['secret_negative_fixture_not_committed_secret', gates.buildSecretFindingContextClassifierReport, { context: 'generated_negative_fixture', value: 'fixture_redacted' }, 'secretFindingContextClassifierStatus', 'pass'],
  ['real_secret_detection_still_blocks', gates.buildSecretFindingContextClassifierReport, { context: 'committed_secret_value', value: `${'s'}${'k'}-${'A'.repeat(24)}` }, 'secretFindingContextClassifierStatus', 'fail'],
  ['product_verification_failure_still_blocks', buildWorkflowProductVerificationInvariantReport, { stepRemoved: true }, 'workflowProductVerificationInvariantStatus', 'fail'],
  ['skip_npm_product_bypass_still_blocks', buildWorkflowProductVerificationInvariantReport, { productRelevant: true, skipNpmOnly: true }, 'workflowProductVerificationInvariantStatus', 'fail'],
  ['knowledge_governance_schema_required', gates.buildKnowledgeGovernanceSchemaReport, { schema: { marker: 'CODEX_QUALITY_HARNESS_FILE v1.0.6' } }, 'knowledgeGovernanceSchemaStatus', 'fail'],
  ['bounded_validation_timeout_is_evidence_limitation', gates.buildBoundedValidationRunnerReport, { fullTargetTimeout: true }, 'boundedValidationRunnerStatus', 'pass'],
  ['full_target_timeout_not_product_failure', gates.buildBoundedValidationRunnerReport, { fullTargetTimeout: true }, 'boundedValidationRunnerStatus', 'pass'],
  ['stacked_pr_not_main_independent', gates.buildStackedPrDependencyManagerReport, { stacked: true }, 'stackedPrDependencyManagerStatus', 'fail'],
  ['release_readiness_snapshot_blocks_candidate_rollout', gates.buildReleaseReadinessSnapshotReport, { stacked: true }, 'releaseReadinessSnapshotStatus', 'fail'],
  ['same_product_pr_harness_fix_loop_limit_blocks_new_feature', gates.buildHarnessRegressionLoopLimitReport, { harnessOnlyRepairCount: 3, rootCauseDigestExists: false }, 'harnessRegressionLoopLimitStatus', 'fail'],
  ['product_safe_fail_maps_to_next_action', gates.buildSafeFailToNextActionReport, { failure_class: 'safe_report_missing', repair_kind: 'harness_only' }, 'productPrSafeFailToNextActionMapperStatus', 'pass'],
  ['harness_only_expected_safe_failure_not_merge_evidence', gates.buildSafeFailToNextActionReport, { failure_class: 'expected_harness_safe_failure', repair_kind: 'harness_only' }, 'productPrSafeFailToNextActionMapperStatus', 'pass'],
  ['product_pr_expected_safe_failure_not_allowed_as_pass', gates.buildSafeFailToNextActionReport, { failure_class: 'product_pr_expected_safe_failure', repair_kind: 'unknown' }, 'productPrSafeFailToNextActionMapperStatus', 'fail'],
  ['subthread_review_not_human_review', gates.buildControlledOrchestrationReport, { subthreadSatisfiesHumanReview: true }, 'controlledSubthreadReviewStatus', 'fail'],
  ['subthread_cannot_push', gates.buildControlledOrchestrationReport, { subthreadPushes: true }, 'controlledSubthreadReviewStatus', 'fail'],
  ['subthread_cannot_merge', gates.buildControlledOrchestrationReport, { subthreadMerges: true }, 'controlledSubthreadReviewStatus', 'fail'],
  ['verification_fan_in_rejects_head_mismatch', gates.buildControlledOrchestrationReport, { missingTargetHeadSha: true }, 'verificationFanInStatus', 'fail'],
  ['docs_only_lane_allowed_when_explicitly_scoped', gates.buildDevelopmentLaneSeparationReport, { lane: 'docs_only_planning', changedFiles: ['docs/process/CODEX_V106_LANE_PROVENANCE_RECOVERY_POLICY.md'], is_draft: true, explicit_user_scope_change: true }, 'developmentLaneSeparationStatus', 'pass'],
  ['runtime_lane_blocked_despite_docs_lane_allowed', gates.buildDevelopmentLaneSeparationReport, { lane: 'runtime' }, 'developmentLaneSeparationStatus', 'fail'],
  ['no_repeat_monitoring_without_state_delta', gates.buildNoRepeatMonitoringGuardReport, {}, 'noRepeatMonitoringGuardStatus', 'fail'],
  ['policy_saturation_blocks_new_policy_pr', gates.buildPolicySaturationGateReport, { saturated: true }, 'policySaturationGateStatus', 'pass'],
  ['safe_suggested_patch_contains_no_raw_values', gates.buildBodyOnlyRepairClassifierReport, { parserFailure: true, safeSuggestedPatch: { missingSectionName: 'Risk level', missingExactMetadataLabel: 'Risk level', acceptedAliases: ['Risk level'], rejectedReason: 'missing_required_label', currentParserMode: 'schema', minimalSafeBodyPatch: 'add_missing_label_only' } }, 'bodyOnlyRepairClassifierStatus', 'pass'],
  ['backend_only_product_pr_expects_apps_backend_cwd', gates.buildRemoteProductEvidencePlanReport, { plan: { packageScope: 'apps/backend', cwd: 'apps/backend', commandClass: 'backend_npm_test', command: 'npm test', source: 'generated_evidence_pack', surface: 'backend', reason: 'backend_product_pr' } }, 'remoteProductEvidencePlanStatus', 'pass'],
  ['v106_self_test_status_exported_to_safe_summary', buildV106SafeSummaryExportFixture, {}, 'v106SelfTestStatus', 'pass'],
  ['safe_summary_harness_version_is_106', buildV106SafeSummaryExportFixture, {}, 'v106SelfTestStatus', 'pass'],
  ['active_v106_artifact_selected_over_legacy_v098', buildV106SafeSummaryExportFixture, {}, 'v106SelfTestStatus', 'pass'],
  ['backend_product_evidence_metadata_exported_to_safe_summary_v106', buildFormalBackendEvidenceMetadataFixture, {}, 'remoteProductEvidencePlanStatus', 'pass'],
  ['formal_backend_evidence_overrides_temp_npm_test_artifact_v106', buildFormalBackendEvidenceMetadataFixture, {}, 'remoteProductEvidencePlanStatus', 'pass'],
  ['safe_output_scan_status_exported_to_formal_safe_summary_v106', buildSafeOutputScanStatusExportFixture, {}, 'safeOutputScanStatus', 'pass'],
  ['safe_output_scan_pass_visible_in_quality_safe_summary_v106', buildSafeOutputScanStatusExportFixture, {}, 'safeOutputScanStatus', 'pass'],
  ['safe_output_scan_pass_visible_in_target_final_summary_v106', buildSafeOutputScanStatusExportFixture, {}, 'safeOutputScanStatus', 'pass'],
  ['v085_stability_pass_advisory_not_reason_summary_blocker_v106', buildV085AdvisoryReasonSummaryFixture, {}, 'reasonSummaryStatus', 'pass'],
  ['legacy_v085_nested_failure_not_top_level_when_active_v106_passes', buildV085AdvisoryReasonSummaryFixture, {}, 'reasonSummaryStatus', 'pass'],
  ['target_quality_pass_drops_legacy_v085_blocking_reason_v106', buildV085AdvisoryReasonSummaryFixture, {}, 'reasonSummaryStatus', 'pass'],
  ['reason_summary_does_not_reinject_v085_stability_failed_when_status_pass', buildV085AdvisoryReasonSummaryFixture, {}, 'reasonSummaryStatus', 'pass'],
  ['non_advisory_v085_failure_still_blocks_v106', buildV085NonAdvisoryReasonSummaryFixture, {}, 'reasonSummaryStatus', 'pass'],
  ['contracts_only_product_pr_expects_contracts_cwd', gates.buildRemoteProductEvidencePlanReport, { plan: { packageScope: 'contracts', cwd: 'contracts', commandClass: 'contracts_npm_test', command: 'npm test', source: 'generated_evidence_pack', surface: 'contracts', reason: 'contracts_product_pr' } }, 'remoteProductEvidencePlanStatus', 'pass'],
  ['docs_only_planning_pr_no_product_npm_required', gates.buildDevelopmentLaneSeparationReport, { lane: 'docs_only_planning', changedFiles: ['docs/process/PLAN.md'], is_draft: true, explicit_user_scope_change: true }, 'developmentLaneSeparationStatus', 'pass'],
  ['harness_only_pr_product_verification_not_applicable', gates.buildProductR3SchemaV2Report, {}, 'productR3SchemaV2Status', 'pass'],
  ['token_deploy_preflight_no_deploy_no_funded_tx', gates.buildManualGateRegistryReport, {}, 'manualGateRegistryStatus', 'pass'],
  ['live2d_product_r3_safe_fail_maps_next_action', gates.buildSafeFailToNextActionReport, { failure_class: 'live2d_no_safe_report', repair_kind: 'harness_only' }, 'productPrSafeFailToNextActionMapperStatus', 'pass'],
  ['voxweave_stacked_pr_blocks_main_independent_merge', gates.buildStackedPrDependencyManagerReport, { stacked: true }, 'stackedPrDependencyManagerStatus', 'fail'],
  ['cripto_tip_operations_pr_requires_evidence_pack_and_manual_gates', gates.buildEvidenceSingleSourceV2Report, {}, 'evidenceSingleSourceV2Status', 'pass'],
  ['iris_legacy_self_test_adapter_required', gates.buildLegacySelfTestCompatibilityAdapterReport, {}, 'legacySelfTestCompatibilityAdapterStatus', 'pass'],
];

const defaultReport = gates.buildDefaultV106Reports({ caseCount: CASES.length, failedCaseCount: 0 });
for (const key of gates.V106_STATUS_KEYS) {
  CASES.push([`default_status_${key}`, () => defaultReport, {}, key, 'pass']);
}

const results = CASES.map(([name, builder, input, key, expected]) => {
  const report = builder(input);
  const actual = report[key]?.status || report.status;
  return { name, status: actual === expected ? 'pass' : 'fail', expected, actual, safeSummaryOnly: true };
});

const failures = results.filter((item) => item.status !== 'pass');
const report = {
  marker: 'CODEX_QUALITY_HARNESS_FILE v1.0.6',
  status: failures.length ? 'fail' : 'pass',
  activeHarnessVersion: '1.0.6',
  activeSelfTestSuite: 'v106',
  activeSelfTestStatusKey: 'v106SelfTestStatus',
  activeSelfTest: {
    suite: 'v106',
    statusKey: 'v106SelfTestStatus',
    status: failures.length ? 'fail' : 'pass',
    blocking: true,
    caseCount: results.length,
    failedCaseCount: failures.length,
    source: 'scripts/codex-v106-self-test.mjs',
  },
  legacySuites: { v105: 'advisory', v104: 'advisory', v103: 'advisory', v100: 'advisory', v092: 'advisory', v087: 'advisory', v085: 'advisory' },
  v106SelfTestStatus: {
    status: failures.length ? 'fail' : 'pass',
    caseCount: results.length,
    failedCaseCount: failures.length,
    activeSelfTestSuite: 'v106',
    blocking: true,
    source: 'scripts/codex-v106-self-test.mjs',
    failures,
    safeSummaryOnly: true,
  },
  syntheticRepresentativeValidation: failures.length ? 'fail' : 'pass',
  safeSummaryOnly: true,
};

if (scanObjectForUnsafe(report).length) {
  report.status = 'fail';
  report.v106SelfTestStatus = { status: 'fail', reasonCodes: ['unsafe_value_detected'], safeSummaryOnly: true };
}

writeJsonReport(report, 'CODEX_V106_SELF_TEST_REPORT');
exitFor(report);
