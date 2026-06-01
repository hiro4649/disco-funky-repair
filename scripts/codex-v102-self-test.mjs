#!/usr/bin/env node
// CODEX_QUALITY_HARNESS_FILE v1.0.2
import { scanObjectForUnsafe, writeJsonReport, exitFor } from './codex-v080-lib.mjs';
import * as gates from './codex-v102-gate-lib.mjs';
import { buildRemoteProductCheckPlan } from './codex-remote-product-checks.mjs';
import { buildRemoteProductEvidenceRunnerReport, buildRemoteProductSafeArtifacts } from './codex-v098-gate-lib.mjs';
import { buildRemoteNpmDiagnosticReport } from './codex-remote-npm-diagnostic-classify.mjs';
import { buildRemoteNpmDiagnosticNormalizationReport } from './codex-v099-gate-lib.mjs';
import { computeTargetQualityScoreStatus } from './codex-local-quality-gate.mjs';
import { buildWorkflowQualityRunnerReport } from './codex-workflow-quality-runner.mjs';
import { buildCompactReasonSummary } from './codex-reason-summary.mjs';
import { buildDiagnosticConsolidatedSummary } from './codex-diagnostic-consolidation-runner.mjs';

function caseStatus(statusKey, pass, payload = {}) {
  return { [statusKey]: { status: pass ? 'pass' : 'fail', ...payload, safeSummaryOnly: true } };
}

function backendProductPlan() {
  return buildRemoteProductCheckPlan({
    productRelevant: true,
    changedFiles: ['apps/backend/src/app/lib/example.ts'],
    rootPackagePresent: false,
    backendPackagePresent: true,
    contractsPackagePresent: false,
  });
}

function backendProductArtifacts() {
  return buildRemoteProductSafeArtifacts({
    productRelevant: true,
    isPullRequest: true,
    npmExecuted: true,
    npmExitCode: 0,
    command: 'npm test -- --runInBand',
    cwd: 'apps/backend',
    packageScope: 'apps/backend',
    commandClass: 'backend_npm_test',
  }, {
    CODEX_REMOTE_NPM_EXECUTED: '1',
    CODEX_NPM_EXIT_CODE: '0',
    CODEX_NPM_CWD: 'apps/backend',
    CODEX_NPM_PACKAGE_SCOPE: 'apps/backend',
    CODEX_NPM_COMMAND_CLASS: 'backend_npm_test',
  });
}

function rootPackageMissingPlan() {
  return buildRemoteProductCheckPlan({
    productRelevant: true,
    changedFiles: ['src/product-entry.ts'],
    rootPackagePresent: false,
    backendPackagePresent: true,
    contractsPackagePresent: false,
  });
}

function targetQualityFixtureReport(overrides = {}) {
  return {
    targetManifestStatus: { status: 'pass', safeSummaryOnly: true },
    secretScan: { status: 'pass', safeSummaryOnly: true },
    agentsContextStatus: { status: 'pass', safeSummaryOnly: true },
    environmentReadinessStatus: { status: 'pass', safeSummaryOnly: true },
    changeClassificationStatus: { status: 'pass', safeSummaryOnly: true },
    productVerificationStatus: { status: 'pass', safeSummaryOnly: true },
    productVerificationEvidenceStatus: { status: 'pass', safeSummaryOnly: true },
    testMetricsStatus: { status: 'pass', safeSummaryOnly: true },
    remoteProductBaselineStatus: { status: 'pass', safeSummaryOnly: true },
    remoteNpmDiagnosticStatus: { status: 'pass', safeSummaryOnly: true },
    workflowPreflightStatus: { status: 'pass', safeSummaryOnly: true },
    artifactLifeboatStatus: { status: 'pass', safeSummaryOnly: true },
    classificationCoverageStatus: { status: 'pass', safeSummaryOnly: true },
    versionLineageStatus: { status: 'pass', safeSummaryOnly: true },
    remoteLocalParityStatus: { status: 'pass', safeSummaryOnly: true },
    noArtifactFailureStatus: { status: 'pass', safeSummaryOnly: true },
    prEvidenceRendererStatus: { status: 'pass', safeSummaryOnly: true },
    safeArtifactClassifierStatus: { status: 'pass', safeSummaryOnly: true },
    securityLifecycleStatus: { status: 'pass', safeSummaryOnly: true },
    reviewIndependenceStatus: { status: 'pass', safeSummaryOnly: true },
    taskBriefCompilerStatus: { status: 'pass', safeSummaryOnly: true },
    activeSelfTestRegistryStatus: {
      status: 'pass',
      activeStatusKey: 'v102SelfTestStatus',
      registeredVersion: '1.0.2',
      safeSummaryOnly: true,
    },
    v085SelfTestStatus: { status: 'pass', safeSummaryOnly: true },
    v098SelfTestStatus: { status: 'pass', safeSummaryOnly: true },
    v099SelfTestStatus: { status: 'pass', safeSummaryOnly: true },
    v100SelfTestStatus: { status: 'pass', safeSummaryOnly: true },
    v101SelfTestStatus: { status: 'pass', safeSummaryOnly: true },
    v102SelfTestStatus: { status: 'pass', safeSummaryOnly: true },
    ...overrides,
  };
}

function targetQualityStatus(overrides = {}) {
  const seed = targetQualityFixtureReport();
  const seedStatus = computeTargetQualityScoreStatus(seed);
  const requiredKeys = [
    ...(seedStatus.blockingStatuses || []),
    ...(seedStatus.manualStatuses || []),
    ...(seedStatus.notApplicableStatuses || []),
  ].map((item) => item.key);
  const complete = Object.fromEntries(requiredKeys.map((key) => [key, { status: 'pass', safeSummaryOnly: true }]));
  return computeTargetQualityScoreStatus({
    ...complete,
    ...seed,
    ...overrides,
  });
}

const baseResume = {
  lastCompletedPhase: 'phase_a',
  currentPhase: 'phase_b',
  nextPhase: 'phase_c',
  blockedPhase: 'none',
  blockerReason: 'none',
  safeToResume: true,
  mustNotResume: ['target_rollout'],
  requiredOwnerDecision: 'none',
};

const baseSplitScore = {
  productEvidenceScore: 'pass',
  harnessEvidenceScore: 'pass',
  governanceScore: 'pass',
  externalBlockedStatus: 'not_applicable',
  mergeReadiness: 'no_until_remote_pass',
  safeNextAction: 'request_independent_review',
};

const CASES = [
  ['parent_v101_required_for_v102_pass', gates.buildLegacySelfTestMatrixReport, { v101SelfTestStatus: 'pass', v102SelfTestStatus: 'pass' }, 'legacySelfTestMatrixStatus', 'pass'],
  ['v101_self_test_preserved_pass', gates.buildLegacySelfTestMatrixReport, { activeVersion: 'v102', v101SelfTestStatus: 'pass' }, 'legacySelfTestMatrixStatus', 'pass'],
  ['v102_self_test_registered_pass', gates.buildV102SelfTestRegistrationReport, {}, 'v102SelfTestStatus', 'pass'],

  ['clean_main_baseline_pass', gates.buildCleanMainBaselineStabilityReport, { classification: 'clean_main_pass' }, 'cleanMainBaselineStabilityStatus', 'pass'],
  ['clean_main_legacy_self_test_drift_fails', gates.buildCleanMainBaselineStabilityReport, { classification: 'legacy_self_test_drift' }, 'cleanMainBaselineStabilityStatus', 'fail'],
  ['clean_main_support_file_boundary_mismatch_fails', gates.buildCleanMainBaselineStabilityReport, { classification: 'support_file_materialization_mismatch' }, 'cleanMainBaselineStabilityStatus', 'fail'],
  ['clean_main_actual_product_bug_classified', gates.buildCleanMainBaselineStabilityReport, { classification: 'actual_product_bug' }, 'cleanMainBaselineStabilityStatus', 'fail'],
  ['clean_main_unknown_fails', gates.buildCleanMainBaselineStabilityReport, { classification: 'unknown' }, 'cleanMainBaselineStabilityStatus', 'fail'],

  ['legacy_self_test_matrix_all_pass', gates.buildLegacySelfTestMatrixReport, {}, 'legacySelfTestMatrixStatus', 'pass'],
  ['legacy_self_test_matrix_v085_fail_classified', gates.buildLegacySelfTestMatrixReport, { v085SelfTestStatus: 'fail', failureClass: 'legacy_self_test_drift', legacyAdvisoryVersions: ['v085'] }, 'legacySelfTestMatrixStatus', 'pass'],
  ['legacy_self_test_matrix_v092_fail_classified', gates.buildLegacySelfTestMatrixReport, { v092SelfTestStatus: 'fail', failureClass: 'legacy_self_test_drift', legacyAdvisoryVersions: ['v092'] }, 'legacySelfTestMatrixStatus', 'pass'],
  ['legacy_self_test_matrix_active_failure_blocks', gates.buildLegacySelfTestMatrixReport, { activeVersion: 'v102', v102SelfTestStatus: 'fail', failureClass: 'active_failure' }, 'legacySelfTestMatrixStatus', 'fail'],
  ['legacy_self_test_matrix_legacy_advisory_not_blocking', gates.buildLegacySelfTestMatrixReport, { v085SelfTestStatus: 'fail', failureClass: 'legacy_advisory' }, 'legacySelfTestMatrixStatus', 'pass'],

  ['fixture_orchestration_stable_pass', gates.buildFixtureOrchestrationFlakeReport, { classification: 'stable_pass' }, 'fixtureOrchestrationFlakeStatus', 'pass'],
  ['fixture_orchestration_transient_flake_classified', gates.buildFixtureOrchestrationFlakeReport, { classification: 'transient_flake' }, 'fixtureOrchestrationFlakeStatus', 'fail'],
  ['fixture_orchestration_actual_product_bug_classified', gates.buildFixtureOrchestrationFlakeReport, { classification: 'actual_product_concurrency_bug' }, 'fixtureOrchestrationFlakeStatus', 'fail'],
  ['fixture_orchestration_unknown_fails', gates.buildFixtureOrchestrationFlakeReport, { classification: 'unknown' }, 'fixtureOrchestrationFlakeStatus', 'fail'],

  ['support_file_source_only_manifest_not_required_in_target_pass', gates.buildSupportFileBoundaryReport, {}, 'supportFileBoundaryStatus', 'pass'],
  ['support_file_target_requires_source_manifest_fails', gates.buildSupportFileBoundaryReport, { targetRequiresSourceManifest: true }, 'supportFileBoundaryStatus', 'fail'],
  ['support_file_materialization_mismatch_fails', gates.buildSupportFileMaterializationReport, { materializationMismatch: true }, 'supportFileMaterializationStatus', 'fail'],
  ['source_target_manifest_boundary_pass', gates.buildSourceTargetManifestBoundaryReport, {}, 'sourceTargetManifestBoundaryStatus', 'pass'],

  ['v085_fixture_isolated_diff_pass', gates.buildV085CheckoutDiffIsolationReport, {}, 'v085CheckoutDiffIsolationStatus', 'pass'],
  ['v085_fixture_active_product_diff_leak_fails', gates.buildV085CheckoutDiffIsolationReport, { activeCheckoutDiffLeak: true }, 'v085CheckoutDiffIsolationStatus', 'fail'],
  ['v085_fixture_forbidden_harness_path_still_fails', gates.buildV085CheckoutDiffIsolationReport, { harnessOnlyForbiddenPathWeakened: true }, 'v085CheckoutDiffIsolationStatus', 'fail'],
  ['top_level_product_gate_still_sees_product_diff', gates.buildProductPrDiffContainmentReport, {}, 'productPrDiffContainmentStatus', 'pass'],
  ['pr42_shaped_product_diff_not_fixture_pass', gates.buildV085CheckoutDiffIsolationReport, {}, 'v085CheckoutDiffIsolationStatus', 'pass'],
  ['pending_after_push_not_remote_pass', gates.buildV085CheckoutDiffIsolationReport, { pendingAfterPushAsRemotePass: true }, 'v085CheckoutDiffIsolationStatus', 'fail'],
  ['target_merge_ready_without_same_head_remote_fails', gates.buildV085CheckoutDiffIsolationReport, { targetMergeReadyWithoutSameHeadRemotePass: true }, 'v085CheckoutDiffIsolationStatus', 'fail'],

  ['product_pr_evidence_generate_pass', gates.buildProductPrEvidenceGeneratorReport, {}, 'productPrEvidenceGeneratorStatus', 'pass'],
  ['product_pr_evidence_missing_formal_fails', gates.buildProductPrEvidenceValidatorReport, { formalMissing: true }, 'productPrEvidenceValidatorStatus', 'fail'],
  ['product_pr_evidence_safe_summary_required', gates.buildProductPrEvidenceSafeSummaryReport, { safeSummaryMissing: true }, 'productPrEvidenceSafeSummaryStatus', 'fail'],
  ['product_pr_evidence_stale_remote_fails', gates.buildProductPrEvidenceValidatorReport, { remoteEvidenceStale: true }, 'productPrEvidenceValidatorStatus', 'fail'],
  ['product_pr_evidence_placeholder_only_fails', gates.buildProductPrEvidenceValidatorReport, { placeholderOnly: true }, 'productPrEvidenceValidatorStatus', 'fail'],
  ['product_pr_evidence_lifeboat_only_fails', gates.buildProductPrEvidenceValidatorReport, { lifeboatOnly: true }, 'productPrEvidenceValidatorStatus', 'fail'],
  ['backend_product_pr_uses_apps_backend_cwd_v102', () => {
    const plan = backendProductPlan();
    return caseStatus('backendProductCwdFixtureStatus', plan.status === 'pass' && plan.cwd === 'apps/backend');
  }, {}, 'backendProductCwdFixtureStatus', 'pass'],
  ['backend_product_pr_records_apps_backend_package_scope_v102', () => {
    const artifacts = backendProductArtifacts();
    const command = artifacts.evidence.commands[0] || {};
    return caseStatus('backendProductPackageScopeFixtureStatus',
      command.packageScope === 'apps/backend' && artifacts.diagnostic.packageScope === 'apps/backend');
  }, {}, 'backendProductPackageScopeFixtureStatus', 'pass'],
  ['backend_product_pr_records_backend_npm_test_command_class_v102', () => {
    const artifacts = backendProductArtifacts();
    const command = artifacts.evidence.commands[0] || {};
    return caseStatus('backendProductCommandClassFixtureStatus',
      command.commandClass === 'backend_npm_test' && artifacts.diagnostic.commandClass === 'backend_npm_test');
  }, {}, 'backendProductCommandClassFixtureStatus', 'pass'],
  ['root_package_missing_does_not_run_root_npm_test_v102', () => {
    const plan = rootPackageMissingPlan();
    return caseStatus('rootPackageMissingNoRootNpmFixtureStatus',
      plan.status === 'fail' && plan.command === 'not_run' && plan.commandClass === 'command_scope_mismatch');
  }, {}, 'rootPackageMissingNoRootNpmFixtureStatus', 'pass'],
  ['root_package_missing_classified_as_command_scope_mismatch_v102', () => {
    const plan = rootPackageMissingPlan();
    const artifacts = buildRemoteProductSafeArtifacts({
      productRelevant: true,
      isPullRequest: true,
      npmExecuted: false,
      npmExitCode: 254,
      command: plan.command,
      cwd: plan.cwd,
      packageScope: plan.packageScope,
      commandClass: plan.commandClass,
      failureClass: plan.failureClass,
    }, {});
    return caseStatus('rootPackageMissingCommandScopeFixtureStatus',
      plan.reasonCodes.includes('root_package_missing') &&
      plan.failureClass === 'command_scope_mismatch' &&
      artifacts.diagnostic.safeFailureCategory === 'command_scope_mismatch' &&
      artifacts.evidence.safeReasonCodes.includes('command_scope_mismatch'));
  }, {}, 'rootPackageMissingCommandScopeFixtureStatus', 'pass'],
  ['formal_backend_evidence_required_for_backend_product_pr_v102', () => {
    const report = buildRemoteProductEvidenceRunnerReport({
      forceCheck: true,
      productRelevant: true,
      npmExecuted: false,
      npmExitCode: 0,
    });
    return caseStatus('formalBackendEvidenceRequiredFixtureStatus',
      report.remoteProductEvidenceRunnerStatus.status === 'fail' &&
      report.remoteProductEvidenceRunnerStatus.reasonCodes.includes('remote_npm_not_executed_for_product_pr'));
  }, {}, 'formalBackendEvidenceRequiredFixtureStatus', 'pass'],
  ['placeholder_only_product_evidence_still_fails_v102', gates.buildProductPrEvidenceValidatorReport, { placeholderOnly: true }, 'productPrEvidenceValidatorStatus', 'fail'],
  ['active_v102_failure_still_blocks', gates.buildLegacySelfTestMatrixReport, { activeVersion: 'v102', v102SelfTestStatus: 'fail', failureClass: 'active_failure' }, 'legacySelfTestMatrixStatus', 'fail'],
  ['parent_v101_preservation_still_passes', gates.buildLegacySelfTestMatrixReport, { activeVersion: 'v102', v101SelfTestStatus: 'pass', v102SelfTestStatus: 'pass' }, 'legacySelfTestMatrixStatus', 'pass'],
  ['legacy_v085_failure_advisory_for_v102', () => caseStatus('legacyV085AdvisoryFixtureStatus',
    targetQualityStatus({ v085SelfTestStatus: { status: 'fail', safeSummaryOnly: true } }).status === 'pass'), {}, 'legacyV085AdvisoryFixtureStatus', 'pass'],
  ['legacy_v098_failure_advisory_for_v102', () => caseStatus('legacyV098AdvisoryFixtureStatus',
    targetQualityStatus({ v098SelfTestStatus: { status: 'fail', safeSummaryOnly: true } }).status === 'pass'), {}, 'legacyV098AdvisoryFixtureStatus', 'pass'],
  ['legacy_v099_failure_advisory_for_v102', () => caseStatus('legacyV099AdvisoryFixtureStatus',
    targetQualityStatus({ v099SelfTestStatus: { status: 'fail', safeSummaryOnly: true } }).status === 'pass'), {}, 'legacyV099AdvisoryFixtureStatus', 'pass'],
  ['legacy_v100_failure_advisory_for_v102', () => caseStatus('legacyV100AdvisoryFixtureStatus',
    targetQualityStatus({ v100SelfTestStatus: { status: 'fail', safeSummaryOnly: true } }).status === 'pass'), {}, 'legacyV100AdvisoryFixtureStatus', 'pass'],
  ['legacy_v101_failure_advisory_for_v102', () => caseStatus('legacyV101AdvisoryFixtureStatus',
    targetQualityStatus({ v101SelfTestStatus: { status: 'fail', safeSummaryOnly: true } }).status === 'pass'), {}, 'legacyV101AdvisoryFixtureStatus', 'pass'],
  ['target_quality_score_pass_with_v102_pass_and_v085_fail', () => {
    const status = targetQualityStatus({ v085SelfTestStatus: { status: 'fail', safeSummaryOnly: true } });
    return caseStatus('targetQualityLegacyAdvisoryFixtureStatus',
      status.status === 'pass' && !status.blockingStatuses.some((item) => item.key === 'v085SelfTestStatus'));
  }, {}, 'targetQualityLegacyAdvisoryFixtureStatus', 'pass'],
  ['target_quality_score_fail_with_v102_fail', () => {
    const status = targetQualityStatus({ v102SelfTestStatus: { status: 'fail', safeSummaryOnly: true } });
    return caseStatus('targetQualityActiveV102FixtureStatus',
      status.status === 'fail' && status.blockingStatuses.some((item) => item.key === 'v102SelfTestStatus'));
  }, {}, 'targetQualityActiveV102FixtureStatus', 'fail'],
  ['workflow_runner_legacy_self_test_advisory_in_target_v102', () => {
    const report = targetQualityFixtureReport({
      targetQualityScoreStatus: targetQualityStatus({ v085SelfTestStatus: { status: 'fail', safeSummaryOnly: true } }),
      status: 'pass',
      v085SelfTestStatus: { status: 'fail', safeSummaryOnly: true },
    });
    const result = buildWorkflowQualityRunnerReport(report, { gateExit: 0, eventName: 'pull_request' });
    return caseStatus('workflowLegacySelfTestAdvisoryFixtureStatus',
      !result.workflowQualityRunnerStatus.failures.some((item) => item === 'v085SelfTestStatus=fail'));
  }, {}, 'workflowLegacySelfTestAdvisoryFixtureStatus', 'pass'],
  ['reason_summary_legacy_self_test_advisory_in_target_v102', () => {
    const result = buildCompactReasonSummary(targetQualityFixtureReport({
      status: 'pass',
      targetQualityScoreStatus: targetQualityStatus({ v085SelfTestStatus: { status: 'fail', safeSummaryOnly: true } }),
      v085SelfTestStatus: { status: 'fail', safeSummaryOnly: true },
    }));
    return caseStatus('reasonSummaryLegacySelfTestAdvisoryFixtureStatus',
      result.status === 'pass' && !result.summary.blockingReasons.some((item) => item.gate === 'v085SelfTestStatus'));
  }, {}, 'reasonSummaryLegacySelfTestAdvisoryFixtureStatus', 'pass'],
  ['diagnostic_legacy_self_test_advisory_in_target_v102', () => {
    const result = buildDiagnosticConsolidatedSummary(targetQualityFixtureReport({
      targetQualityScoreStatus: targetQualityStatus({ v085SelfTestStatus: { status: 'fail', safeSummaryOnly: true } }),
      v085SelfTestStatus: { status: 'fail', safeSummaryOnly: true },
    }));
    return caseStatus('diagnosticLegacySelfTestAdvisoryFixtureStatus',
      !result.summary.blockingReasons.some((item) => item.gate === 'v085SelfTestStatus') &&
      result.summary.optionalReasons.some((item) => item.gate === 'v085SelfTestStatus'));
  }, {}, 'diagnosticLegacySelfTestAdvisoryFixtureStatus', 'pass'],
  ['remote_npm_diagnostic_uses_current_safe_artifact_scope_v102', () => {
    const artifacts = backendProductArtifacts();
    const report = buildRemoteNpmDiagnosticNormalizationReport({
      forceCheck: true,
      productRelevant: true,
      remoteNpmDiagnosticStatus: { status: 'pass', diagnostic: artifacts.diagnostic },
    });
    return caseStatus('remoteNpmDiagnosticScopeFixtureStatus',
      report.remoteNpmDiagnosticNormalizationStatus.status === 'pass' &&
      report.remoteNpmDiagnosticNormalizationStatus.commandClass === 'backend_npm_test' &&
      report.remoteNpmDiagnosticNormalizationStatus.cwd === 'apps/backend');
  }, {}, 'remoteNpmDiagnosticScopeFixtureStatus', 'pass'],
  ['harness_only_remote_npm_diagnostic_not_applicable_v102', () => {
    const artifacts = buildRemoteProductSafeArtifacts({
      productRelevant: false,
      isPullRequest: true,
      npmExecuted: false,
      npmExitCode: 0,
    }, {});
    const report = buildRemoteNpmDiagnosticReport({
      CODEX_NPM_TEST_SAFE_SUMMARY_JSON: JSON.stringify(artifacts.diagnostic),
    });
    return caseStatus('harnessOnlyRemoteNpmDiagnosticFixtureStatus',
      report.remoteNpmDiagnosticStatus.status === 'not_applicable' &&
      report.remoteNpmDiagnosticStatus.reasonCodes.includes('remote_npm_diagnostic_not_required'));
  }, {}, 'harnessOnlyRemoteNpmDiagnosticFixtureStatus', 'pass'],

  ['backup_artifact_repo_external_pass', gates.buildRepoExternalBackupReport, {}, 'repoExternalBackupStatus', 'pass'],
  ['backup_artifact_tracked_file_fails', gates.buildBackupArtifactManagerReport, { tracked: true }, 'backupArtifactManagerStatus', 'fail'],
  ['backup_artifact_stage_attempt_fails', gates.buildBackupArtifactManagerReport, { staged: true }, 'backupArtifactManagerStatus', 'fail'],
  ['backup_artifact_git_clean_forbidden_fails', gates.buildBackupArtifactManagerReport, { gitCleanAttempt: true }, 'backupArtifactManagerStatus', 'fail'],
  ['backup_artifact_git_reset_forbidden_fails', gates.buildBackupArtifactManagerReport, { gitResetAttempt: true }, 'backupArtifactManagerStatus', 'fail'],

  ['pr_recovery_rebase_required_pass', gates.buildPrRecoveryAutopilotReport, { action: 'rebase_required' }, 'prRecoveryAutopilotStatus', 'pass'],
  ['pr_recovery_body_only_repair_pass', gates.buildPrRecoveryAutopilotReport, { action: 'body_only_repair_required' }, 'prRecoveryAutopilotStatus', 'pass'],
  ['pr_recovery_close_superseded_pass', gates.buildPrRecoveryAutopilotReport, { action: 'close_as_superseded_required' }, 'prRecoveryAutopilotStatus', 'pass'],
  ['pr_recovery_product_fix_required_pass', gates.buildPrRecoveryAutopilotReport, { action: 'product_fix_required' }, 'prRecoveryAutopilotStatus', 'pass'],
  ['pr_recovery_harness_fix_required_pass', gates.buildPrRecoveryAutopilotReport, { action: 'harness_fix_required' }, 'prRecoveryAutopilotStatus', 'pass'],
  ['pr_recovery_external_blocked_required_pass', gates.buildPrRecoveryAutopilotReport, { action: 'external_blocked_required' }, 'prRecoveryAutopilotStatus', 'pass'],
  ['pr_recovery_ambiguous_next_action_fails', gates.buildPrRecoveryAutopilotReport, { action: ['rebase_required', 'rerun_required'] }, 'prRecoveryAutopilotStatus', 'fail'],

  ['external_blocked_reviewer_unavailable_pass', gates.buildReviewerAvailabilityReport, { reviewerUnavailable: true }, 'reviewerAvailabilityStatus', 'blocked_external'],
  ['writer_only_review_fails', gates.buildReviewerAvailabilityReport, { writerOnlyReview: true }, 'reviewerAvailabilityStatus', 'fail'],
  ['independent_review_pass', gates.buildReviewerAvailabilityReport, {}, 'reviewerAvailabilityStatus', 'pass'],
  ['external_blocked_merge_ready_fails', gates.buildExternalBlockedReport, { mergeReadyWhileExternalBlocked: true }, 'externalBlockedStatus', 'fail'],
  ['split_score_model_required_fields_pass', gates.buildSplitScoreModelReport, baseSplitScore, 'splitScoreModelStatus', 'pass'],

  ['pr_dependency_graph_blocked_by_pass', gates.buildPrDependencyGraphReport, { dependentPr: true, blocked_by: ['upstream'] }, 'prDependencyGraphStatus', 'pass'],
  ['pr_dependency_graph_missing_for_dependent_pr_fails', gates.buildPrDependencyGraphReport, { dependentPr: true }, 'prDependencyGraphStatus', 'fail'],
  ['pr_dependency_graph_superseded_pr_merge_fails', gates.buildPrDependencyGraphReport, { supersededPrMergeCandidate: true }, 'prDependencyGraphStatus', 'fail'],
  ['safe_next_action_one_line_pass', gates.buildSafeNextActionReport, { safeNextAction: 'request_independent_review' }, 'safeNextActionStatus', 'pass'],
  ['safe_next_action_vague_fails', gates.buildSafeNextActionReport, { safeNextAction: 'if needed confirm later' }, 'safeNextActionStatus', 'fail'],

  ['handover_snapshot_required_fields_pass', gates.buildHandoverSnapshotReport, { snapshot: gates.buildDefaultHandoverSnapshot() }, 'handoverSnapshotStatus', 'pass'],
  ['handover_snapshot_missing_main_head_fails', gates.buildHandoverSnapshotReport, { snapshot: { ...gates.buildDefaultHandoverSnapshot(), sourceMainHead: undefined } }, 'handoverSnapshotStatus', 'fail'],
  ['handover_snapshot_missing_protected_state_fails', gates.buildHandoverSnapshotReport, { snapshot: { ...gates.buildDefaultHandoverSnapshot(), protectedPatches: undefined } }, 'handoverSnapshotStatus', 'fail'],
  ['operator_seven_line_summary_pass', gates.buildOperatorSevenLineSummaryReport, {}, 'operatorSevenLineSummaryStatus', 'pass'],
  ['machine_replay_digest_json_pass', gates.buildMachineReplayDigestReport, { digest: gates.buildDefaultHandoverSnapshot() }, 'machineReplayDigestStatus', 'pass'],
  ['protected_state_inventory_patch_apply_forbidden_fails', gates.buildProtectedStateInventoryReport, { patchApplied: true }, 'protectedStateInventoryStatus', 'fail'],
  ['protected_state_inventory_stash_pop_forbidden_fails', gates.buildProtectedStateInventoryReport, { stashPopped: true }, 'protectedStateInventoryStatus', 'fail'],
  ['workflow_resume_state_pass', gates.buildWorkflowResumeStateReport, baseResume, 'workflowResumeStateStatus', 'pass'],
  ['workflow_resume_missing_next_action_fails', gates.buildWorkflowResumeStateReport, { ...baseResume, nextPhase: undefined }, 'workflowResumeStateStatus', 'fail'],
  ['workflow_resume_forbidden_scope_fails', gates.buildWorkflowResumeStateReport, { ...baseResume, forbiddenScope: true }, 'workflowResumeStateStatus', 'fail'],
];

const results = CASES.map(([name, builder, input, key, expected]) => {
  const report = builder(input);
  const actual = report[key]?.status || report.status;
  return {
    name,
    status: actual === expected ? 'pass' : 'fail',
    expected,
    actual,
    safeSummaryOnly: true,
  };
});

const failures = results.filter((item) => item.status !== 'pass');
const report = {
  marker: 'CODEX_QUALITY_HARNESS_FILE v1.0.2',
  status: failures.length ? 'fail' : 'pass',
  v102SelfTestStatus: {
    status: failures.length ? 'fail' : 'pass',
    caseCount: results.length,
    failures,
    safeSummaryOnly: true,
  },
  cases: results,
  safeSummaryOnly: true,
};

if (scanObjectForUnsafe(report).length) {
  report.status = 'fail';
  report.v102SelfTestStatus = { status: 'fail', reasonCodes: ['unsafe_value_detected'], safeSummaryOnly: true };
}

writeJsonReport(report, 'CODEX_V102_SELF_TEST_REPORT');
exitFor(report);
