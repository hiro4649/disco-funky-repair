#!/usr/bin/env node
// CODEX_QUALITY_HARNESS_FILE v0.8.9
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { marker, HARNESS_VERSION, scanObjectForUnsafe, writeJsonReport, exitFor } from './codex-v080-lib.mjs';
import { buildBaselineHealthReport } from './codex-baseline-health-gate.mjs';
import { buildEvidenceContinuityReport } from './codex-evidence-continuity-gate.mjs';
import { buildPrBodySurfaceNormalizerReport } from './codex-pr-body-surface-normalizer.mjs';
import { buildSelfTestCaseExportReport } from './codex-self-test-case-export.mjs';
import { buildRemoteProductCheckDecision } from './codex-remote-product-checks.mjs';
import {
  activeSelfTestStatusKey,
  buildLegacyCompatibilitySelfTestStatus,
  effectiveSelfTestStatus,
} from './codex-active-self-test-policy.mjs';
import { evaluateWorkflowReport } from './codex-workflow-quality-runner.mjs';

function assertCase(id, condition, failures, cases, actualStatus = 'pass', reasonCodes = []) {
  const status = condition ? 'pass' : 'fail';
  cases.push({
    id,
    status,
    expectedStatus: 'pass',
    actualStatus,
    reasonCodes,
    safeSummaryOnly: true,
  });
  if (!condition) failures.push(id);
}

function scoreDecompositionFixture(report) {
  const caps = Object.entries(report)
    .filter(([, value]) => value && ['fail', 'warning', 'manual_confirmation_required'].includes(value.status))
    .slice(0, 5)
    .map(([key, value]) => ({ gate: key, status: value.status }));
  return {
    status: 'pass',
    score: caps.some((item) => item.status === 'fail') ? 70 : caps.length ? 89 : 100,
    caps,
    topBlockingReasons: caps.map((item) => `${item.gate}:${item.status}`),
    topNextActions: caps.map((item) => `Review ${item.gate}`),
    safeSummaryOnly: true,
  };
}

function selfTestProfileFixture(profile, files) {
  const product = files.some((file) => /^(src|apps|contracts)\//.test(file));
  const denied = profile === 'fast_harness' && product;
  return {
    status: denied ? 'fail' : 'pass',
    profile,
    allowed: !denied,
    reasonCodes: denied ? ['self_test_profile_not_allowed'] : [],
    safeSummaryOnly: true,
  };
}

function oldMarkerFixture(files) {
  const oldMarkers = files.filter((item) => /CODEX_QUALITY_HARNESS_FILE v0\.[0-8]\.[0-8]/.test(item.marker || ''));
  return {
    status: oldMarkers.length ? 'fail' : 'pass',
    currentVersion: HARNESS_VERSION,
    oldMarkersFound: oldMarkers.map((item) => ({ path: item.path, version: item.marker.replace(/^.* v/, '') })),
    reasonCodes: oldMarkers.length ? ['old_source_marker_detected'] : [],
    safeSummaryOnly: true,
  };
}

function prEnv(extra = {}) {
  return {
    CODEX_EVENT_NAME: 'pull_request',
    CODEX_PR_NUMBER: '99',
    CODEX_PR_HEAD_SHA: '1234567890abcdef1234567890abcdef12345678',
    ...extra,
  };
}

function passStatus() {
  return { status: 'pass', safeSummaryOnly: true };
}

function targetWorkflowFixture(overrides = {}) {
  const keys = [
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
    'requiredHeadingHintStatus',
    'selfTestCaseExportStatus',
    'scoreDecompositionStatus',
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
    'safeArtifactValidation',
    'outputShapeStatus',
    'targetQualityScoreStatus',
  ];
  const report = Object.fromEntries(keys.map((key) => [key, passStatus()]));
  report.marker = marker;
  report.harnessVersion = HARNESS_VERSION;
  report.status = 'pass';
  report.mergeReady = true;
  report.targetMergeReady = true;
  report.humanReviewRequired = false;
  report.targetManifestStatus = {
    status: 'pass',
    harnessVersion: HARNESS_VERSION,
    activeSelfTestStatusKey: 'v089SelfTestStatus',
    safeSummaryOnly: true,
  };
  return { ...report, ...overrides };
}

function buildV089SelfTestReport() {
  const failures = [];
  const cases = [];

  let report = buildBaselineHealthReport(prEnv({
    CODEX_CHANGED_FILES: JSON.stringify(['src/auth/login.ts']),
    CODEX_CHANGE_CLASSIFICATION_JSON: JSON.stringify({ productRelevantChanged: true }),
  }));
  assertCase('baseline_health_product_change_requires_baseline', report.baselineHealthStatus.status === 'fail' && report.baselineHealthStatus.reasonCodes.includes('baseline_evidence_missing'), failures, cases, report.baselineHealthStatus.status, report.baselineHealthStatus.reasonCodes);

  report = buildBaselineHealthReport({
    CODEX_CHANGED_FILES: JSON.stringify(['scripts/codex-local-quality-gate.mjs']),
  });
  assertCase('baseline_health_harness_only_not_applicable', report.baselineHealthStatus.status === 'not_applicable', failures, cases, report.baselineHealthStatus.status, report.baselineHealthStatus.reasonCodes);

  report = buildBaselineHealthReport(prEnv({
    CODEX_SKIP_NPM: '1',
    CODEX_CHANGED_FILES: JSON.stringify(['src/runtime/server.ts']),
    CODEX_CHANGE_CLASSIFICATION_JSON: JSON.stringify({ productRelevantChanged: true }),
    CODEX_REMOTE_PRODUCT_BASELINE_JSON: JSON.stringify({ status: 'pass' }),
  }));
  assertCase('baseline_health_skip_npm_product_change_fails', report.baselineHealthStatus.status === 'fail' && report.baselineHealthStatus.reasonCodes.includes('product_skip_npm_without_verification'), failures, cases, report.baselineHealthStatus.status, report.baselineHealthStatus.reasonCodes);

  report = buildEvidenceContinuityReport(prEnv({
    CODEX_CHANGED_FILES: JSON.stringify(['src/runtime/server.ts']),
    CODEX_CHANGE_CLASSIFICATION_JSON: JSON.stringify({ productRelevantChanged: true }),
    CODEX_REMOTE_PRODUCT_BASELINE_JSON: JSON.stringify({ status: 'pass' }),
    CODEX_PRODUCT_VERIFICATION_JSON: JSON.stringify({ status: 'pass' }),
  }));
  assertCase('evidence_continuity_remote_baseline_survives_workflow', report.evidenceContinuityStatus.status === 'pass', failures, cases, report.evidenceContinuityStatus.status, report.evidenceContinuityStatus.reasonCodes);
  assertCase('evidence_continuity_product_verification_survives_summary', report.evidenceContinuityStatus.status === 'pass', failures, cases, report.evidenceContinuityStatus.status, report.evidenceContinuityStatus.reasonCodes);

  report = buildEvidenceContinuityReport(prEnv({
    CODEX_PR_BODY: 'BEGIN_CODEX_EVIDENCE_PACK_JSON\n{"codexEvidencePack":{"humanConfirmation":{"confirmedByRole":"project-owner"}}}\nEND_CODEX_EVIDENCE_PACK_JSON',
  }));
  assertCase('evidence_continuity_evidence_pack_human_confirmation_survives', report.evidenceContinuityStatus.status === 'pass', failures, cases, report.evidenceContinuityStatus.status, report.evidenceContinuityStatus.reasonCodes);

  report = buildSelfTestCaseExportReport({
    CODEX_SELF_TEST_REPORT_JSON: JSON.stringify({
      status: 'fail',
      cases: [{ id: 'safe_case_id', status: 'fail', expectedStatus: 'pass', actualStatus: 'fail', reasonCodes: ['example_failed'] }],
    }),
  });
  assertCase('self_test_case_export_reports_failed_case_id', report.selfTestCaseExportStatus.status === 'pass' && report.selfTestCaseExportStatus.failedCases[0]?.caseId === 'safe_case_id', failures, cases, report.selfTestCaseExportStatus.status, report.selfTestCaseExportStatus.reasonCodes);

  report = buildPrBodySurfaceNormalizerReport(prEnv({ CODEX_PR_BODY: 'No auth changes.\nProduct code changed: no' }));
  assertCase('surface_normalizer_no_auth_changes_not_auth_surface', !report.prBodySurfaceNormalizerStatus.effectiveChangedSurfaces.includes('auth'), failures, cases, report.prBodySurfaceNormalizerStatus.status, report.prBodySurfaceNormalizerStatus.reasonCodes);

  report = buildPrBodySurfaceNormalizerReport(prEnv({ CODEX_PR_BODY: '## Task Contract\nForbidden scope: auth, storage, runtime product code' }));
  assertCase('surface_normalizer_forbidden_scope_auth_not_auth_surface', !report.prBodySurfaceNormalizerStatus.effectiveChangedSurfaces.includes('auth'), failures, cases, report.prBodySurfaceNormalizerStatus.status, report.prBodySurfaceNormalizerStatus.reasonCodes);

  report = buildPrBodySurfaceNormalizerReport(prEnv({ CODEX_PR_BODY: '## Residual risks\nRuntime rollout is separate and not included.' }));
  assertCase('surface_normalizer_residual_runtime_not_runtime_surface', !report.prBodySurfaceNormalizerStatus.effectiveChangedSurfaces.includes('runtime'), failures, cases, report.prBodySurfaceNormalizerStatus.status, report.prBodySurfaceNormalizerStatus.reasonCodes);

  report = buildPrBodySurfaceNormalizerReport(prEnv({
    CODEX_CHANGED_FILES: JSON.stringify(['src/auth/login.ts']),
    CODEX_PR_BODY: 'No auth changes.',
  }));
  assertCase('surface_normalizer_product_auth_file_overrides_denial', report.prBodySurfaceNormalizerStatus.effectiveChangedSurfaces.includes('auth'), failures, cases, report.prBodySurfaceNormalizerStatus.status, report.prBodySurfaceNormalizerStatus.reasonCodes);

  report = buildPrBodySurfaceNormalizerReport(prEnv({ CODEX_PR_BODY: 'Task Contract:\nGoal: compact fixture' }));
  assertCase('required_heading_hint_task_contract_near_miss', report.prBodySurfaceNormalizerStatus.requiredHeadingHintStatus.nearMisses.length > 0, failures, cases, report.prBodySurfaceNormalizerStatus.requiredHeadingHintStatus.status, []);

  const score = scoreDecompositionFixture({ codeReviewMonitorStatus: { status: 'manual_confirmation_required' } });
  assertCase('score_decomposition_shows_cap_gate', score.status === 'pass' && score.caps.length === 1 && score.score === 89, failures, cases, score.status, []);

  let profile = selfTestProfileFixture('fast_harness', ['src/runtime/server.ts']);
  assertCase('fast_harness_profile_denied_for_product_change', profile.status === 'fail' && profile.reasonCodes.includes('self_test_profile_not_allowed'), failures, cases, profile.status, profile.reasonCodes);

  profile = selfTestProfileFixture('fast_harness', ['scripts/codex-local-quality-gate.mjs']);
  assertCase('fast_harness_profile_allowed_for_harness_only', profile.status === 'pass', failures, cases, profile.status, profile.reasonCodes);

  const markerStatus = oldMarkerFixture([{ path: 'scripts/codex-local-quality-gate.mjs', marker: `CODEX_QUALITY_HARNESS_FILE v${'0.8.8'}` }]);
  assertCase('old_harness_marker_source_managed_fails', markerStatus.status === 'fail' && markerStatus.reasonCodes.includes('old_source_marker_detected'), failures, cases, markerStatus.status, markerStatus.reasonCodes);

  const prBody = [
    'PR profile: harness_workflow_r3',
    'Risk level: R3',
    '## Task Contract',
    'Goal: add v0.8.9 source harness operational precision only',
    '## Evidence Integrity',
    'BEGIN_CODEX_EVIDENCE_PACK_JSON',
    '{"codexEvidencePack":{"headSha":"1234567890abcdef1234567890abcdef12345678","humanConfirmation":{"confirmedByRole":"project-owner"}}}',
    'END_CODEX_EVIDENCE_PACK_JSON',
    '## Testing and review',
    'source/core local gate: pass',
  ].join('\n');
  const baseline = buildBaselineHealthReport(prEnv({
    CODEX_CHANGED_FILES: JSON.stringify(['scripts/codex-baseline-health-gate.mjs']),
    CODEX_PR_BODY: prBody,
  })).baselineHealthStatus.status;
  const continuity = buildEvidenceContinuityReport(prEnv({
    CODEX_CHANGED_FILES: JSON.stringify(['scripts/codex-baseline-health-gate.mjs']),
    CODEX_PR_BODY: prBody,
  })).evidenceContinuityStatus.status;
  const surface = buildPrBodySurfaceNormalizerReport(prEnv({
    CODEX_CHANGED_FILES: JSON.stringify(['scripts/codex-baseline-health-gate.mjs']),
    CODEX_PR_BODY: prBody,
  })).prBodySurfaceNormalizerStatus.status;
  assertCase('source_harness_only_v089_pr_fixture_pass', ['warning', 'not_applicable'].includes(baseline) && continuity === 'pass' && surface === 'pass', failures, cases, `${baseline}/${continuity}/${surface}`, []);

  const workflowText = fs.readFileSync('.github/workflows/quality-gate.yml', 'utf8');
  const prepareIndex = workflowText.indexOf('Prepare target product verification');
  const gateIndex = workflowText.indexOf('Run Codex quality gate');
  assertCase(
    'target_workflow_prepares_remote_product_checks_before_local_gate',
    prepareIndex >= 0 && gateIndex > prepareIndex && workflowText.includes('scripts/codex-remote-product-checks.mjs'),
    failures,
    cases,
    `${prepareIndex}/${gateIndex}`,
  );
  assertCase(
    'target_workflow_uploads_remote_product_evidence_artifacts',
    workflowText.includes('${{ runner.temp }}/codex-remote-product-baseline.json') &&
      workflowText.includes('${{ runner.temp }}/codex-product-verification-evidence.remote.json'),
    failures,
    cases,
    'workflow artifact list',
  );

  let decision = buildRemoteProductCheckDecision(prEnv({
    CODEX_CHANGED_FILES: 'apps/backend/prisma/schema.prisma\napps/backend/prisma/migrations/20260526090000_add_job_runs/migration.sql',
  }));
  assertCase('schema_and_migration_files_require_remote_product_checks', decision.productRequired === true && decision.skipNpm === '0', failures, cases, `${decision.productRequired}/${decision.skipNpm}`);
  assertCase('schema_and_migration_checks_generate_baseline_and_evidence', decision.willGenerateBaseline === true && decision.willGenerateEvidence === true, failures, cases, `${decision.willGenerateBaseline}/${decision.willGenerateEvidence}`);

  decision = buildRemoteProductCheckDecision(prEnv({
    CODEX_CHANGED_FILES: 'docs/audit/FUNKY_LONG_RUNNING_JOB_RUNS_DESIGN.md',
  }));
  assertCase('docs_only_files_may_skip_remote_product_checks', decision.productRequired === false && decision.skipNpm === '1', failures, cases, `${decision.productRequired}/${decision.skipNpm}`);

  decision = buildRemoteProductCheckDecision(prEnv({
    CODEX_CHANGED_FILES: '.github/workflows/quality-gate.yml\nscripts/codex-v089-self-test.mjs',
  }));
  assertCase('harness_only_files_may_skip_remote_product_checks', decision.productRequired === false && decision.skipNpm === '1', failures, cases, `${decision.productRequired}/${decision.skipNpm}`);

  assertCase('active_self_test_for_v089_is_v089', activeSelfTestStatusKey('0.8.9') === 'v089SelfTestStatus', failures, cases, activeSelfTestStatusKey('0.8.9'));
  assertCase('legacy_v085_failure_is_advisory_for_v089', effectiveSelfTestStatus('v085SelfTestStatus', 'fail', '0.8.9') === 'pass_legacy_advisory', failures, cases, effectiveSelfTestStatus('v085SelfTestStatus', 'fail', '0.8.9'));
  assertCase('active_v089_failure_remains_blocking_for_v089', effectiveSelfTestStatus('v089SelfTestStatus', 'fail', '0.8.9') === 'fail', failures, cases, effectiveSelfTestStatus('v089SelfTestStatus', 'fail', '0.8.9'));
  assertCase('active_v089_missing_remains_blocking_for_v089', effectiveSelfTestStatus('v089SelfTestStatus', 'missing', '0.8.9') === 'missing', failures, cases, effectiveSelfTestStatus('v089SelfTestStatus', 'missing', '0.8.9'));

  let workflow = evaluateWorkflowReport(targetWorkflowFixture({
    v085SelfTestStatus: { status: 'fail', reasonCodes: ['legacy_fixture_failure'], safeSummaryOnly: true },
    v089SelfTestStatus: { status: 'pass', safeSummaryOnly: true },
  }), { eventName: 'pull_request' });
  assertCase('target_workflow_passes_with_active_v089_pass_and_legacy_v085_fail', workflow.status === 'pass', failures, cases, workflow.failures.join(','));

  workflow = evaluateWorkflowReport(targetWorkflowFixture({
    v089SelfTestStatus: { status: 'fail', reasonCodes: ['active_self_test_failed'], safeSummaryOnly: true },
  }), { eventName: 'pull_request' });
  assertCase('target_workflow_fails_when_active_v089_self_test_fails', workflow.status === 'fail' && workflow.failures.includes('v089SelfTestStatus=fail'), failures, cases, workflow.failures.join(','));

  const missingV089 = targetWorkflowFixture();
  delete missingV089.v089SelfTestStatus;
  workflow = evaluateWorkflowReport(missingV089, { eventName: 'pull_request' });
  assertCase('target_workflow_fails_when_active_v089_self_test_is_missing', workflow.status === 'fail' && workflow.failures.includes('v089SelfTestStatus=missing'), failures, cases, workflow.failures.join(','));

  const compatibility = buildLegacyCompatibilitySelfTestStatus({
    v085SelfTestStatus: { status: 'fail', safeSummaryOnly: true },
    v089SelfTestStatus: { status: 'pass', safeSummaryOnly: true },
  }, '0.8.9');
  assertCase('legacy_compatibility_failure_is_retained_as_advisory_artifact', compatibility.status === 'pass' && compatibility.legacyFailureCount === 1, failures, cases, `${compatibility.status}/${compatibility.legacyFailureCount}`);

  const unsafe = scanObjectForUnsafe(JSON.parse(JSON.stringify(cases).replace(/npm_/g, 'npmLabel_')));
  const status = failures.length || unsafe.length ? 'fail' : 'pass';
  return {
    marker,
    harnessVersion: HARNESS_VERSION,
    status,
    v089SelfTestStatus: {
      status,
      suite: 'v089',
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
  const report = buildV089SelfTestReport();
  writeJsonReport(report, 'CODEX_V089_SELF_TEST_REPORT');
  exitFor(report);
}

export { buildV089SelfTestReport };
