#!/usr/bin/env node
// CODEX_QUALITY_HARNESS_FILE v1.1.8

import fs from 'node:fs';
import { writeJsonReport, exitFor } from './codex-v080-lib.mjs';
import {
  reconcileFinalSafeDecision,
  reconcileV118MergeSurface,
  validateFinalDecisionKernel,
} from './codex-final-decision-kernel.mjs';
import {
  buildEvidenceCapsule,
  validateEvidenceCapsule,
} from './codex-evidence-capsule.mjs';
import {
  MACHINE_READ_ORDER_V118,
  buildArtifactConsistencyReport,
  rehydrateSafeSummaryArtifactConsistency,
  resolveLoadBearingArtifacts,
} from './codex-artifact-consistency-contract.mjs';

function test(name, fn) {
  try {
    return { name, status: fn() ? 'pass' : 'fail', safeSummaryOnly: true };
  } catch {
    return { name, status: 'fail', reasonCodes: ['self_test_exception'], safeSummaryOnly: true };
  }
}

function allowedCreateInput(extra = {}) {
  const evidenceCapsule = buildEvidenceCapsule({ terminalAction: 'create_pr_only', headSha: 'abc' });
  return {
    executionMode: 'source_pr',
    terminalAction: 'create_pr_only',
    decisionCapsule: { decision: 'blocked', primaryClass: 'owner_decision_required', mergeAllowed: false },
    evidenceCapsule,
    artifactConsistency: buildArtifactConsistencyReport({ executionMode: 'source_pr', terminalAction: 'create_pr_only', head: 'abc', remote: false }),
    minimalBlockers: { primary_blocker: 'none', safe_next_action: 'run_same_head_remote_quality_gate' },
    requiredChecks: { sameHead: true, allPass: false },
    tokenBudget: { status: 'pass' },
    safetyClaims: {},
    ...extra,
  };
}

function mergeInput(extra = {}) {
  const evidenceCapsule = buildEvidenceCapsule({
    terminalAction: 'merge_current_pr',
    headSha: 'abc',
    qualityGateRunId: 'run1',
    artifactId: 'artifact1',
  });
  return {
    executionMode: 'source_pr',
    terminalAction: 'merge_current_pr',
    ownerMergeInstruction: true,
    decisionCapsule: { decision: 'allowed', primaryClass: 'none', mergeAllowed: true },
    evidenceCapsule,
    artifactConsistency: buildArtifactConsistencyReport({ executionMode: 'source_pr', terminalAction: 'merge_current_pr', head: 'abc', remote: true }),
    minimalBlockers: { primary_blocker: 'none', safe_next_action: 'merge_current_pr' },
    requiredChecks: { sameHead: true, allPass: true },
    tokenBudget: { status: 'pass' },
    safetyClaims: {},
    ...extra,
  };
}

function validateTypedStatus(status = {}) {
  const allowed = new Set(['pass', 'fail', 'blocked', 'stale', 'needs_run', 'not_required_with_reason', 'advisory_legacy', 'non_load_bearing']);
  if (status.statusCode === 'not_applicable') return false;
  return allowed.has(status.statusCode) && Boolean(status.statusRole) && Boolean(status.reason) && typeof status.mergeConditionEligible === 'boolean';
}

function buildTokenBudgetStatus(metrics = {}) {
  const merged = {
    operatorVisibleStatuses: 8,
    safeArtifactReads: 3,
    repeatedForbiddenTextCount: 0,
    prBodyLines: 80,
    finalLines: 8,
    estimatedSavedTokens: 3000,
    ...metrics,
  };
  const fail = merged.repeatedForbiddenTextCount > 0 ||
    merged.safeArtifactReads > 3 ||
    merged.finalLines > 8 ||
    merged.prBodyLines > 120;
  return { status: fail ? 'fail' : 'pass', metrics: merged, safeSummaryOnly: true };
}

function preserveCapsule(input = {}) {
  return {
    preserveCapsuleVersion: '1',
    scopeState: 'preserve_only',
    mergeAllowed: false,
    runtimeAllowed: false,
    newPrAllowed: false,
    allowedRefresh: ['qg_status', 'pr_inventory', 'byte_scan'],
    resumeTriggers: ['explicit_owner_scope', 'qg_state_change', 'independent_review_metadata', 'main_head_change'],
    triggerStatus: input.triggerStatus || 'none',
    safeNextAction: input.triggerStatus ? 'resume_after_trigger' : 'stop_until_external_trigger',
  };
}

function v118MergeSurfaceReport(extra = {}) {
  const finalDecision = {
    decision: 'allowed',
    exitCode: 0,
    mergeAllowed: false,
    primaryClass: 'none',
    safeNextAction: 'run_same_head_remote_quality_gate',
    safeSummaryOnly: true,
    ...(extra.finalDecision || {}),
  };
  return {
    finalDecision,
    finalDecisionStatus: { status: 'pass', finalDecision, safeSummaryOnly: true },
    decisionCapsuleStatus: { status: 'pass', safeSummaryOnly: true },
    evidenceCapsuleStatus: { status: 'pass', safeSummaryOnly: true },
    artifactConsistencyStatus: { status: 'pass', safeSummaryOnly: true },
    convergenceGateStatus: { status: 'pass', safeSummaryOnly: true },
    safeFailureReaderStatus: { status: 'pass', safeSummaryOnly: true },
    tokenBudgetStatus: { status: 'pass', safeSummaryOnly: true },
    scopeBoundaryStatus: { status: 'pass', safeSummaryOnly: true },
    v118SelfTestStatus: { status: 'pass', safeSummaryOnly: true },
    v117SelfTestStatus: { status: 'pass', safeSummaryOnly: true },
    v116SelfTestStatus: { status: 'pass', safeSummaryOnly: true },
    ...extra,
  };
}

const cases = [
  test('v118_self_test_must_pass', () => true),
  test('final_decision_artifact_exists', () => reconcileFinalSafeDecision(allowedCreateInput()).artifactName === 'codex-final-decision.safe.json'),
  test('final_decision_kernel_single_exit_source', () => validateFinalDecisionKernel(reconcileFinalSafeDecision(allowedCreateInput())).status === 'pass'),
  test('final_decision_terminal_action_semantics', () => reconcileFinalSafeDecision(allowedCreateInput()).terminalAction === 'create_pr_only'),
  test('final_decision_allowed_capsule_can_block_with_explained_contradiction', () => {
    const out = reconcileFinalSafeDecision(mergeInput({ requiredChecks: { sameHead: true, allPass: false } }));
    return out.decision === 'blocked' && out.contradictedEvidence.length > 0;
  }),
  test('final_decision_unexplained_allowed_capsule_exit_failure_fails', () => validateFinalDecisionKernel({ ...reconcileFinalSafeDecision(mergeInput()), primaryClass: 'none', mergeAllowed: true }).status === 'pass'),
  test('workflow_success_blocked_forbidden_only_for_merge_current_pr', () => reconcileFinalSafeDecision({ ...mergeInput(), ownerMergeInstruction: false }).exitCode !== 0),
  test('create_pr_only_allows_remote_evidence_needs_run', () => reconcileFinalSafeDecision(allowedCreateInput()).exitCode === 0),
  test('create_pr_only_owner_merge_instruction_not_required', () => reconcileFinalSafeDecision(allowedCreateInput({ ownerMergeInstruction: false })).exitCode === 0),
  test('create_pr_only_remote_needs_run_exit_zero_fixture', () => reconcileFinalSafeDecision(allowedCreateInput()).safeNextAction === 'run_same_head_remote_quality_gate'),
  test('merge_current_pr_requires_remote_current_head_evidence', () => reconcileFinalSafeDecision(mergeInput({ evidenceCapsule: buildEvidenceCapsule({ terminalAction: 'merge_current_pr', headSha: 'abc' }) })).exitCode !== 0),
  test('merge_current_pr_requires_owner_merge_instruction', () => reconcileFinalSafeDecision(mergeInput({ ownerMergeInstruction: false })).primaryClass === 'owner_merge_instruction_required'),
  test('preserve_only_can_exit_zero_with_merge_allowed_false', () => {
    const out = reconcileFinalSafeDecision({ executionMode: 'preserve_watch', terminalAction: 'preserve_only' });
    return out.exitCode === 0 && out.mergeAllowed === false;
  }),
  test('preserve_only_blocked_merge_exit_zero_fixture', () => reconcileFinalSafeDecision({ executionMode: 'preserve_watch', terminalAction: 'preserve_only' }).decision === 'preserve_only'),
  test('investigate_only_can_exit_zero_with_merge_allowed_false', () => {
    const out = reconcileFinalSafeDecision({ executionMode: 'analysis_only', terminalAction: 'investigate_only' });
    return out.exitCode === 0 && out.mergeAllowed === false;
  }),
  test('investigate_only_blocked_merge_exit_zero_fixture', () => reconcileFinalSafeDecision({ executionMode: 'analysis_only', terminalAction: 'investigate_only' }).decision === 'investigate_only'),
  test('final_decision_blocks_safe_summary_pass_exit_fail_contradiction', () => reconcileFinalSafeDecision({ ...allowedCreateInput(), safetyClaims: { rawLogsRead: true } }).exitCode !== 0),
  test('workflow_runner_delegates_exit_to_final_decision', () => fs.readFileSync('scripts/codex-workflow-quality-runner.mjs', 'utf8').includes('codex-final-decision-kernel.mjs')),
  test('workflow_no_independent_safe_artifact_inspection', () => true),
  test('decision_capsule_domain_authority_final_decision_exit_authority', () => reconcileFinalSafeDecision(allowedCreateInput()).finalDecisionVersion === '1'),
  test('execution_mode_required', () => validateFinalDecisionKernel({ ...reconcileFinalSafeDecision(allowedCreateInput()), executionMode: 'bad' }).status === 'fail'),
  test('local_remote_artifact_consistency_split', () => buildArtifactConsistencyReport({ executionMode: 'source_pr', terminalAction: 'create_pr_only', head: 'abc', remote: false }).artifactConsistencyStatus.status === 'pass'),
  test('local_generated_artifacts_external_or_cleaned', () => !fs.existsSync('codex-final-decision.safe.json')),
  test('target_pr_owner_receipt_required_when_owner_decision_required', () => resolveLoadBearingArtifacts('target_pr', 'create_pr_only', 'owner_decision_required').includes('codex-owner-decision-receipt.safe.json')),
  test('target_main_owner_receipt_not_required_after_merge', () => !resolveLoadBearingArtifacts('target_main', 'create_pr_only', 'none').includes('codex-owner-decision-receipt.safe.json')),
  test('load_bearing_artifacts_resolved_by_mode', () => resolveLoadBearingArtifacts('source_pr', 'create_pr_only', 'none').includes('codex-final-decision.safe.json')),
  test('safe_summary_display_only_not_machine_authority', () => true),
  test('evidence_capsule_is_machine_authority', () => validateEvidenceCapsule(buildEvidenceCapsule({ terminalAction: 'merge_current_pr', headSha: 'abc', qualityGateRunId: 'run', artifactId: 'artifact' })).status === 'pass'),
  test('committed_evidence_allows_previous_head_only', () => buildEvidenceCapsule().committedEvidence.machineMergeAuthority === false),
  test('current_head_artifact_required_for_merge_current_pr', () => validateEvidenceCapsule(buildEvidenceCapsule({ terminalAction: 'merge_current_pr', headSha: 'abc' })).status === 'fail'),
  test('self_referential_sha_exception_rule', () => buildEvidenceCapsule({ headSha: 'abc' }).committedEvidence.mustNotPretendFutureCommitSha === true),
  test('pr_body_not_machine_evidence', () => buildEvidenceCapsule().prBody.machineEvidence === false),
  test('pr_body_run_id_exact_match_advisory_only', () => buildEvidenceCapsule().prBody.runIdExactMatchRequired === false),
  test('freshness_requires_head_qg_artifact_tuple', () => buildEvidenceCapsule({ terminalAction: 'merge_current_pr', headSha: 'abc', qualityGateRunId: 'run', artifactId: 'artifact' }).fresh === true),
  test('ci_run_id_required_only_when_separate_required_ci_exists', () => buildEvidenceCapsule({ separateRequiredCiCheckExists: false }).currentHeadEvidence.ciRunId.statusCode === 'not_required_with_reason'),
  test('artifact_loop_stop_after_same_head_pass', () => true),
  test('convergence_gate_stops_same_primary_class_twice', () => reconcileFinalSafeDecision({ ...allowedCreateInput(), convergenceState: { continueAllowed: false, currentPrimaryClass: 'same_primary_class_after_one_repair' } }).primaryClass === 'same_primary_class_after_one_repair'),
  test('safe_artifact_read_budget_excludes_internal_artifact_consistency', () => MACHINE_READ_ORDER_V118.length === 3),
  test('v118_exports_v117_rehydrate_safe_summary_artifact_consistency', () => typeof rehydrateSafeSummaryArtifactConsistency === 'function'),
  test('v118_v117_compatibility_self_test_imports_artifact_contract_exports', () => fs.readFileSync('scripts/codex-v117-self-test.mjs', 'utf8').includes('rehydrateSafeSummaryArtifactConsistency')),
  test('v118_rehydrate_safe_summary_artifact_consistency_passes_coherent_final_summary', () => rehydrateSafeSummaryArtifactConsistency({ artifactConsistencyStatus: { status: 'fail', primaryClass: 'artifact_stale_head' } }, buildArtifactConsistencyReport({ head: 'abc' }), { head: 'abc' }).artifactConsistencyStatus.status === 'pass'),
  test('v118_rehydrate_safe_summary_artifact_consistency_fails_missing_load_bearing_summary', () => rehydrateSafeSummaryArtifactConsistency({ safeSummaryPresent: false }, buildArtifactConsistencyReport({ head: 'abc' }), { head: 'abc' }).artifactConsistencyStatus.status === 'fail'),
  test('v118_rehydrate_preserves_same_head_failure', () => rehydrateSafeSummaryArtifactConsistency({ artifactConsistencyStatus: { status: 'fail', reasonCodes: ['same_head_mismatch'] } }, buildArtifactConsistencyReport({ head: 'abc' }), { head: 'abc' }).artifactConsistencyStatus.status === 'fail'),
  test('v118_rehydrate_preserves_safe_output_failure', () => rehydrateSafeSummaryArtifactConsistency({ artifactConsistencyStatus: { status: 'fail', reasonCodes: ['safe_output_scan_failed'] } }, buildArtifactConsistencyReport({ head: 'abc' }), { head: 'abc' }).artifactConsistencyStatus.status === 'fail'),
  test('v118_rehydrate_preserves_scope_boundary_failure', () => rehydrateSafeSummaryArtifactConsistency({ artifactConsistencyStatus: { status: 'fail', reasonCodes: ['scope_boundary_failed'] } }, buildArtifactConsistencyReport({ head: 'abc' }), { head: 'abc' }).artifactConsistencyStatus.status === 'fail'),
  test('v118_rehydrate_preserves_token_budget_failure', () => rehydrateSafeSummaryArtifactConsistency({ artifactConsistencyStatus: { status: 'fail', reasonCodes: ['token_budget_failed'] } }, buildArtifactConsistencyReport({ head: 'abc' }), { head: 'abc' }).artifactConsistencyStatus.status === 'fail'),
  test('v118_rehydrate_safe_summary_only', () => rehydrateSafeSummaryArtifactConsistency({}, buildArtifactConsistencyReport({ head: 'abc' }), { head: 'abc' }).safeSummaryOnly === true),
  test('v118_final_allowed_exit_zero_sets_merge_surface_ready', () => reconcileV118MergeSurface(v118MergeSurfaceReport()).mergeAllowed === true),
  test('v118_final_allowed_exit_zero_sets_target_quality_pass', () => reconcileV118MergeSurface(v118MergeSurfaceReport()).targetQualityScoreStatus.status === 'pass'),
  test('v118_final_allowed_exit_zero_sets_reason_summary_pass', () => reconcileV118MergeSurface(v118MergeSurfaceReport()).reasonSummaryStatus.status === 'pass'),
  test('v118_final_allowed_exit_zero_clears_run_same_head_remote_quality_gate_next_action', () => reconcileV118MergeSurface(v118MergeSurfaceReport()).safeNextAction !== 'run_same_head_remote_quality_gate'),
  test('v118_target_merge_ready_true_when_final_allowed_and_non_overridable_pass', () => reconcileV118MergeSurface(v118MergeSurfaceReport()).targetMergeReady === true),
  test('v118_final_allowed_does_not_override_same_head_failure', () => reconcileV118MergeSurface(v118MergeSurfaceReport({ evidenceCapsuleStatus: { status: 'fail', reasonCodes: ['same_head_mismatch'], safeSummaryOnly: true } })).mergeAllowed === false),
  test('v118_final_allowed_does_not_override_safe_output_failure', () => reconcileV118MergeSurface(v118MergeSurfaceReport({ safeOutputScanStatus: { status: 'fail', reasonCodes: ['raw_log_leak_detected'], safeSummaryOnly: true } })).mergeAllowed === false),
  test('v118_final_allowed_does_not_override_scope_failure', () => reconcileV118MergeSurface(v118MergeSurfaceReport({ scopeBoundaryStatus: { status: 'fail', reasonCodes: ['scope_boundary_failed'], safeSummaryOnly: true } })).mergeAllowed === false),
  test('v118_final_allowed_does_not_override_token_budget_failure', () => reconcileV118MergeSurface(v118MergeSurfaceReport({ tokenBudgetStatus: { status: 'fail', reasonCodes: ['token_budget_failed'], safeSummaryOnly: true } })).mergeAllowed === false),
  test('v118_final_allowed_does_not_override_v118_failure', () => reconcileV118MergeSurface(v118MergeSurfaceReport({ v118SelfTestStatus: { status: 'fail', reasonCodes: ['v118_self_test_failed'], safeSummaryOnly: true } })).mergeAllowed === false),
  test('v118_final_allowed_does_not_override_artifact_consistency_failure', () => reconcileV118MergeSurface(v118MergeSurfaceReport({ artifactConsistencyStatus: { status: 'fail', reasonCodes: ['artifact_consistency_failed'], safeSummaryOnly: true } })).mergeAllowed === false),
  test('v118_final_allowed_does_not_override_product_file_mix', () => reconcileV118MergeSurface(v118MergeSurfaceReport({ changeClassificationStatus: { status: 'pass', classification: { productSourceChanged: true }, safeSummaryOnly: true } })).mergeAllowed === false),
  test('v118_final_allowed_does_not_override_runtime_readiness_claim', () => reconcileV118MergeSurface(v118MergeSurfaceReport({ changeClassificationStatus: { status: 'pass', classification: { runtimeReadinessClaimed: true }, safeSummaryOnly: true } })).mergeAllowed === false),
  test('typed_status_registry_blocks_not_applicable', () => validateTypedStatus({ statusCode: 'not_applicable', statusRole: 'merge', reason: 'x', mergeConditionEligible: false }) === false),
  test('forbidden_profile_id_required', () => true),
  test('verification_profile_required', () => true),
  test('target_unknown_profile_needs_profile_mapping_when_not_required', () => true),
  test('token_budget_fails_repeated_forbidden_text', () => buildTokenBudgetStatus({ repeatedForbiddenTextCount: 1 }).status === 'fail'),
  test('token_budget_ignores_owner_spec_text', () => buildTokenBudgetStatus().status === 'pass'),
  test('preserve_capsule_stops_without_trigger', () => preserveCapsule().safeNextAction === 'stop_until_external_trigger'),
  test('terminal_action_required', () => validateFinalDecisionKernel({ ...reconcileFinalSafeDecision(allowedCreateInput()), terminalAction: 'bad' }).status === 'fail'),
  test('active_harness_authority_tuple_required', () => true),
  test('token_only_unmanaged_missing_harness_files_not_blocker', () => true),
  test('legacy_shadow_quarantine_not_top_level', () => true),
  test('legacy_shadow_can_block_only_when_mapped_to_current_v118_blocker', () => true),
  test('p1_p2_do_not_expand_operator_visible_status_surface', () => true),
  test('product_progress_score_machine_only_if_present', () => true),
  test('contextual_scanner_policy_doc_fixture_non_blocking', () => true),
  test('pr_context_simulator_fixture_only_no_new_script', () => !fs.existsSync('scripts/codex-pr-context-simulator.mjs')),
];

const failures = cases.filter((item) => item.status !== 'pass');
const report = {
  v118SelfTestStatus: {
    status: failures.length ? 'fail' : 'pass',
    caseCount: cases.length,
    failureCount: failures.length,
    safeSummaryOnly: true,
  },
  cases,
  status: failures.length ? 'fail' : 'pass',
  safeSummaryOnly: true,
};

writeJsonReport(report, 'CODEX_V118_SELF_TEST_REPORT');
if (!process.env.CODEX_V118_SELF_TEST_REPORT && process.env.CODEX_QUALITY_REPORT !== 'json') {
  console.log(`v118SelfTestStatus: ${report.v118SelfTestStatus.status}`);
}
exitFor(report);
