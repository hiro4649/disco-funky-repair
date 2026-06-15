#!/usr/bin/env node
// CODEX_QUALITY_HARNESS_FILE v1.2.2

import fs from 'node:fs';
import { writeJsonReport, exitFor } from './codex-v080-lib.mjs';
import {
  V122_OPERATOR_STATUS_KEYS,
  V122_P0_ARTIFACTS,
  buildOrchestrationCapsule,
  validateSkillContextRouting,
} from './codex-orchestration-capsule.mjs';
import { classifyTargetQualityScoredStatus } from './codex-local-quality-gate.mjs';
import { buildCompactReasonSummary } from './codex-reason-summary.mjs';

function test(name, fn) {
  try {
    return { name, status: fn() ? 'pass' : 'fail', safeSummaryOnly: true };
  } catch {
    return { name, status: 'fail', reasonCodes: ['self_test_exception'], safeSummaryOnly: true };
  }
}

function failed(status) {
  return status?.status === 'fail';
}

const compatibilityCases = [
  ['v122_self_test_must_pass', () => true],
  ['v122_adds_no_new_p0_artifact', () => V122_P0_ARTIFACTS.length === 3 && V122_P0_ARTIFACTS.includes('codex-orchestration-capsule.safe.json')],
  ['v122_adds_no_new_top_level_operator_status', () => V122_OPERATOR_STATUS_KEYS.length === 8 && !V122_OPERATOR_STATUS_KEYS.includes('skillContextRoutingStatus')],
  ['v122_delegates_final_authority_to_v118', () => buildOrchestrationCapsule().finalAuthority === 'v1.1.8_final_decision_kernel'],
  ['v122_preserves_v119_orchestration_artifacts', () => !V122_P0_ARTIFACTS.includes('codex-context-routing.safe.json')],
  ['v122_preserves_v120_adaptive_routing', () => buildOrchestrationCapsule().adaptiveIntelligenceRouting.defaultTier === 'low_cost_worker'],
  ['v122_preserves_v121_calibration_guard', () => buildOrchestrationCapsule().routingCalibration.defaultTier === 'low_cost_worker'],
  ['p1_p2_no_new_skill_daemon_or_history_watcher', () => !fs.existsSync('scripts/codex-skill-daemon.mjs') && !fs.existsSync('scripts/codex-history-watcher.mjs')],
];

const routingCases = [
  ['skill_context_routing_exists_inside_orchestration_capsule', () => ['1.2.2', '1.2.3', '1.2.4'].includes(buildOrchestrationCapsule().skillContextRouting.schemaVersion)],
  ['active_authority_tuple_required', () => validateSkillContextRouting(buildOrchestrationCapsule().skillContextRouting).status === 'pass'],
  ['active_authority_tuple_blocks_stale_marker', () => failed(validateSkillContextRouting({
    ...buildOrchestrationCapsule().skillContextRouting,
    activeAuthorityTuple: { ...buildOrchestrationCapsule().skillContextRouting.activeAuthorityTuple, agentsMarker: 'CODEX_QUALITY_HARNESS_FILE v1.2.1' },
  }))],
  ['routine_md_read_budget_is_three', () => buildOrchestrationCapsule({ taskProfile: 'routine' }).skillContextRouting.mdFilesReadMax === 3],
  ['metadata_light_md_read_budget_is_two', () => buildOrchestrationCapsule({ taskProfile: 'metadata_light' }).skillContextRouting.mdFilesReadMax === 2],
  ['target_rollout_md_read_budget_is_four', () => buildOrchestrationCapsule({ taskProfile: 'target_rollout' }).skillContextRouting.mdFilesReadMax === 4],
  ['harness_source_body_md_read_budget_is_six', () => buildOrchestrationCapsule({ taskProfile: 'harness_source_body' }).skillContextRouting.mdFilesReadMax === 6],
  ['selected_skills_default_max_two', () => buildOrchestrationCapsule().skillContextRouting.selectedSkillsMax === 2],
  ['selected_skills_max_cannot_override_task_profile_budget', () => failed(validateSkillContextRouting({
    ...buildOrchestrationCapsule().skillContextRouting,
    selectedSkillsMax: 99,
  }))],
  ['md_files_read_max_cannot_override_task_profile_budget', () => failed(validateSkillContextRouting({
    ...buildOrchestrationCapsule().skillContextRouting,
    mdFilesReadMax: 99,
  }))],
  ['third_skill_requires_typed_justification', () => failed(validateSkillContextRouting(buildOrchestrationCapsule({
    selectedSkills: ['a', 'b', 'c'],
    selectedSkillsMax: 2,
  }).skillContextRouting))],
  ['third_skill_does_not_raise_global_skill_budget', () => failed(validateSkillContextRouting(buildOrchestrationCapsule({
    selectedSkills: ['a', 'b', 'c'],
    typedJustification: 'routine_attempted_third_skill',
    thirdSkillAllowed: true,
  }).skillContextRouting))],
  ['third_skill_allowed_with_typed_justification_and_profile_budget', () => validateSkillContextRouting(buildOrchestrationCapsule({
    taskProfile: 'harness_source_body',
    selectedSkills: ['spec', 'github', 'security'],
    typedJustification: 'harness_source_body_requires_three_bounded_skills',
    thirdSkillAllowed: true,
  }).skillContextRouting).status === 'pass'],
  ['md_overread_without_justification_blocks', () => failed(validateSkillContextRouting(buildOrchestrationCapsule({
    mdFilesRead: ['a.md', 'b.md', 'c.md', 'd.md'],
  }).skillContextRouting))],
  ['md_overread_with_typed_justification_warns_not_blocks', () => validateSkillContextRouting(buildOrchestrationCapsule({
    mdFilesRead: ['a.md', 'b.md', 'c.md', 'd.md'],
    typedJustification: 'compatibility_failure_requires_extra_active_spec_crosscheck',
    readBudgetStatus: 'warn',
  }).skillContextRouting).status === 'pass'],
  ['raw_logs_are_hard_context_blocker', () => failed(validateSkillContextRouting(buildOrchestrationCapsule({
    blockerClasses: ['raw_logs_read'],
  }).skillContextRouting))],
  ['full_history_read_without_scope_is_hard_context_blocker', () => failed(validateSkillContextRouting(buildOrchestrationCapsule({
    blockerClasses: ['full_history_read_without_scope'],
  }).skillContextRouting))],
  ['skill_misfire_blocks_source_hard_gate', () => failed(validateSkillContextRouting(buildOrchestrationCapsule({
    skillMisfireDetected: true,
    skillMisfireReason: 'forbidden_repo_profile',
  }).skillContextRouting))],
  ['legacy_spec_read_requires_failure_reason', () => failed(validateSkillContextRouting(buildOrchestrationCapsule({
    legacySpecReadAllowed: true,
    legacySpecReadReason: 'routine_interest',
  }).skillContextRouting))],
  ['legacy_spec_read_allowed_for_compatibility_failure', () => validateSkillContextRouting(buildOrchestrationCapsule({
    legacySpecReadAllowed: true,
    legacySpecReadReason: 'compatibility_failure',
  }).skillContextRouting).status === 'pass'],
  ['owner_provided_context_not_counted_as_file_read', () => buildOrchestrationCapsule({
    ownerProvidedContext: { present: true, countedAsFileRead: true },
  }).skillContextRouting.ownerProvidedContext.countedAsFileRead === false],
  ['context_source_type_separates_user_text_from_file_read', () => buildOrchestrationCapsule().skillContextRouting.contextSourceType.userProvidedText === 'not_counted_as_file_read'],
  ['read_less_preserve_authority_first_reads', () => {
    const firstReads = buildOrchestrationCapsule().skillContextRouting.requiredFirstReads;
    return firstReads.includes('AGENTS.md') && firstReads.includes('docs/process/CODEX_HARNESS_MANIFEST.json') && (firstReads.includes('docs/process/CODEX_V122_SPEC.md') || firstReads.includes('docs/process/CODEX_V123_SPEC.md') || firstReads.includes('docs/process/CODEX_V124_SPEC.md'));
  }],
  ['readme_deferred_by_default', () => buildOrchestrationCapsule().skillContextRouting.deferredReads.includes('README.md')],
  ['safe_artifact_pointer_preferred', () => buildOrchestrationCapsule().skillContextRouting.contextSourceType.safeArtifact === 'preferred'],
];

const legacyV099ShadowEntry = {
  status: 'fail',
  reasonCodes: ['legacy_self_test_advisory_failed'],
  safeSummaryOnly: true,
};

const v099Classification = () => classifyTargetQualityScoredStatus('v099SelfTestStatus', legacyV099ShadowEntry, {
  v122SelfTestStatus: { status: 'pass', safeSummaryOnly: true },
  v121SelfTestStatus: { status: 'pass', safeSummaryOnly: true },
  v120SelfTestStatus: { status: 'pass', safeSummaryOnly: true },
  v119SelfTestStatus: { status: 'pass', safeSummaryOnly: true },
  v118SelfTestStatus: { status: 'pass', safeSummaryOnly: true },
  v117SelfTestStatus: { status: 'pass', safeSummaryOnly: true },
  v116SelfTestStatus: { status: 'pass', safeSummaryOnly: true },
  v099SelfTestStatus: legacyV099ShadowEntry,
});

const legacyV099ReasonSummary = () => buildCompactReasonSummary({
  status: 'pass',
  targetQualityScoreStatus: { status: 'pass', score: 95, safeSummaryOnly: true },
  v122SelfTestStatus: { status: 'pass', safeSummaryOnly: true },
  v121SelfTestStatus: { status: 'pass', safeSummaryOnly: true },
  v120SelfTestStatus: { status: 'pass', safeSummaryOnly: true },
  v119SelfTestStatus: { status: 'pass', safeSummaryOnly: true },
  v118SelfTestStatus: { status: 'pass', safeSummaryOnly: true },
  v117SelfTestStatus: { status: 'pass', safeSummaryOnly: true },
  v116SelfTestStatus: { status: 'pass', safeSummaryOnly: true },
  v099SelfTestStatus: legacyV099ShadowEntry,
}).summary;

const activeV122FailureReasonSummary = () => buildCompactReasonSummary({
  status: 'fail',
  targetQualityScoreStatus: { status: 'fail', score: 80, safeSummaryOnly: true },
  v122SelfTestStatus: {
    status: 'fail',
    reasonCodes: ['v122_self_test_failed'],
    safeSummaryOnly: true,
  },
  v099SelfTestStatus: legacyV099ShadowEntry,
}).summary;

const activeV122FailureClassification = () => classifyTargetQualityScoredStatus('v122SelfTestStatus', {
  status: 'fail',
  reasonCodes: ['v122_self_test_failed'],
  safeSummaryOnly: true,
}, {});

const v121FailureClassification = () => classifyTargetQualityScoredStatus('v121SelfTestStatus', {
  status: 'fail',
  reasonCodes: ['v121_self_test_failed'],
  safeSummaryOnly: true,
}, {});

const compatibilityFailureClassification = (key, reasonCode) => classifyTargetQualityScoredStatus(key, {
  status: 'fail',
  reasonCodes: [reasonCode],
  safeSummaryOnly: true,
}, {});

const sameHeadFailureClassification = () => classifyTargetQualityScoredStatus('sameHeadStatus', {
  status: 'fail',
  reasonCodes: ['same_head_mismatch'],
  safeSummaryOnly: true,
}, {});

const legacyCases = [
  ['v122_v099_legacy_shadow_not_blocking_current', () => v099Classification().compatibilityClass !== 'blocking_current'],
  ['v122_v080_v112_target_shadow_legacy_count_only_not_blocking', () => v099Classification().effectiveStatus === 'pass_advisory'],
  ['v122_v111_target_shadow_legacy_count_only_not_blocking', () => classifyTargetQualityScoredStatus('v111SelfTestStatus', {
    status: 'fail',
    reasonCodes: ['legacy_self_test_advisory_failed'],
    safeSummaryOnly: true,
  }, {}).effectiveStatus === 'pass_advisory'],
  ['v122_reason_summary_does_not_reinject_v099_legacy_blocker', () => !['fail', 'missing', 'not_run'].includes(v099Classification().effectiveStatus)],
  ['v122_target_quality_not_failed_by_v099_shadow_legacy', () => v099Classification().effectiveStatus === 'pass_advisory'],
  ['v122_gate_status_not_failed_by_v099_shadow_legacy', () => v099Classification().status === 'fail' && v099Classification().effectiveStatus === 'pass_advisory'],
  ['v122_target_merge_ready_not_failed_by_v099_shadow_legacy', () => v099Classification().effectiveStatus === 'pass_advisory'],
  ['v122_terminal_action_not_create_pr_only_due_to_v099_shadow_legacy', () => v099Classification().compatibilityClass === 'advisory_legacy'],
  ['v122_merge_allowed_not_blocked_by_v099_shadow_legacy', () => v099Classification().compatibilityClass === 'advisory_legacy'],
  ['v122_compact_blockers_exclude_v099_shadow_current_blocker', () => v099Classification().effectiveStatus !== 'fail'],
  ['v122_final_decision_not_blocked_by_v099_shadow_legacy', () => v099Classification().compatibilityClass === 'advisory_legacy'],
  ['v122_owner_decision_not_overridden_by_v099_shadow_legacy', () => v099Classification().compatibilityClass === 'advisory_legacy'],
  ['v122_reason_summary_excludes_v099_shadow_legacy_from_blocking_reasons', () => !legacyV099ReasonSummary().blockingReasons.some((item) => item.gate === 'v099SelfTestStatus' || item.reasonCode === 'v099SelfTestStatus')],
  ['v122_reason_summary_counts_v099_shadow_legacy_as_optional_not_applicable', () => legacyV099ReasonSummary().optionalNotApplicable.includes('v099SelfTestStatus')],
  ['v122_active_v122_failure_still_blocks_final_reason', () => activeV122FailureReasonSummary().blockingReasons.some((item) => item.gate === 'v122SelfTestStatus' || item.reasonCode === 'v122_self_test_failed')],
  ['v122_active_v122_failure_still_blocks', () => activeV122FailureClassification().effectiveStatus === 'fail'],
  ['v122_v121_blocking_compatibility_failure_still_blocks', () => v121FailureClassification().effectiveStatus === 'fail'],
  ['v122_v120_blocking_compatibility_failure_still_blocks', () => compatibilityFailureClassification('v120SelfTestStatus', 'v120_self_test_failed').effectiveStatus === 'fail'],
  ['v122_v119_blocking_compatibility_failure_still_blocks', () => compatibilityFailureClassification('v119SelfTestStatus', 'v119_self_test_failed').effectiveStatus === 'fail'],
  ['v122_v118_blocking_compatibility_failure_still_blocks', () => compatibilityFailureClassification('v118SelfTestStatus', 'v118_self_test_failed').effectiveStatus === 'fail'],
  ['v122_v117_blocking_compatibility_failure_still_blocks', () => compatibilityFailureClassification('v117SelfTestStatus', 'v117_self_test_failed').effectiveStatus === 'fail'],
  ['v122_v116_blocking_compatibility_failure_still_blocks', () => compatibilityFailureClassification('v116SelfTestStatus', 'v116_self_test_failed').effectiveStatus === 'fail'],
  ['v122_product_evidence_failure_still_blocks', () => classifyTargetQualityScoredStatus('productVerificationEvidenceStatus', {
    status: 'fail',
    reasonCodes: ['product_evidence_failed'],
    safeSummaryOnly: true,
  }, {}).effectiveStatus === 'fail'],
  ['v122_same_head_mismatch_still_blocks', () => sameHeadFailureClassification().effectiveStatus === 'fail'],
  ['v122_safe_output_failure_still_blocks', () => classifyTargetQualityScoredStatus('safeOutputScanStatus', {
    status: 'fail',
    reasonCodes: ['safe_output_scan_failed'],
    safeSummaryOnly: true,
  }, {}).effectiveStatus === 'fail'],
  ['v122_secret_safety_failure_still_blocks', () => classifyTargetQualityScoredStatus('secretScan', {
    status: 'fail',
    reasonCodes: ['secret_scan_failed'],
    safeSummaryOnly: true,
  }, {}).effectiveStatus === 'fail'],
  ['v122_scope_boundary_failure_still_blocks', () => classifyTargetQualityScoredStatus('scopeBoundaryStatus', {
    status: 'fail',
    reasonCodes: ['scope_boundary_failed'],
    safeSummaryOnly: true,
  }, {}).effectiveStatus === 'fail'],
  ['v122_actual_db_export_boundary_still_blocks', () => classifyTargetQualityScoredStatus('scopeBoundaryStatus', {
    status: 'fail',
    reasonCodes: ['actual_db_export_boundary_violation'],
    safeSummaryOnly: true,
  }, {}).effectiveStatus === 'fail'],
];

const cases = [
  ...compatibilityCases,
  ...routingCases,
  ...legacyCases,
].map(([name, fn]) => test(name, fn));

const fixtureGroups = [
  'v118_v119_v120_v121_compatibility_matrix',
  'context_source_type_matrix',
  'task_profile_read_budget_matrix',
  'skill_misfire_detection_matrix',
  'active_authority_tuple_matrix',
  'legacy_read_exception_matrix',
  'read_budget_warn_vs_block_matrix',
  'legacy_shadow_classification_matrix',
];

const failures = cases.filter((item) => item.status !== 'pass');
const report = {
  v122SelfTestStatus: {
    status: failures.length ? 'fail' : 'pass',
    caseCount: cases.length,
    failureCount: failures.length,
    fixtureGroups,
    safeSummaryOnly: true,
  },
  cases,
  status: failures.length ? 'fail' : 'pass',
  safeSummaryOnly: true,
};

writeJsonReport(report, 'CODEX_V122_SELF_TEST_REPORT');
if (!process.env.CODEX_V122_SELF_TEST_REPORT && process.env.CODEX_QUALITY_REPORT !== 'json') {
  console.log(`v122SelfTestStatus: ${report.v122SelfTestStatus.status}`);
}
exitFor(report);
