#!/usr/bin/env node
// CODEX_QUALITY_HARNESS_FILE v0.9.5

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
  buildAgentsDoctrineReport,
  buildSkillRoutingReport,
  buildSkillLoadBudgetReport,
  buildSkillDriftReport,
  buildAgentSessionGovernanceReport,
  buildAgentContainmentBoundaryReport,
  buildEvalTraceHarvestReport,
  buildOperatorVisibleDeltaReport,
  buildTraceToEvalCandidateReport,
  buildSubagentGovernanceReport,
  buildSubagentReviewMatrixReport,
  buildPrismaStateMachineSchemaReport,
  buildStateTransitionHelperReport,
  buildReceiptEvidenceSchemaReport,
  buildWorkerReadinessSequenceReport,
  buildEvidenceMinimalityReport,
  buildEvidenceDedupReport,
  buildSafeArtifactNextActionReport,
  buildSkillEvidenceLinkReport,
} from './codex-v095-gate-lib.mjs';

function assertCase(id, condition, failures, cases, actualStatus = 'pass', reasonCodes = []) {
  cases.push({ id, status: condition ? 'pass' : 'fail', actualStatus, reasonCodes, safeSummaryOnly: true });
  if (!condition) failures.push(id);
}

function statusOf(report, key) {
  return report[key]?.status || report.status || 'missing';
}

function reasonsOf(report, key) {
  return report[key]?.reasonCodes || [];
}

export function buildV095SelfTestReport() {
  const failures = [];
  const cases = [];
  let report;

  assertCase('active_v095_self_test_selected', activeSelfTestStatusKey('0.9.5') === 'v095SelfTestStatus', failures, cases, activeSelfTestStatusKey('0.9.5'), []);
  assertCase('legacy_v085_failure_advisory_for_v095', effectiveSelfTestStatus('v085SelfTestStatus', 'fail', '0.9.5') === 'pass_legacy_advisory', failures, cases, effectiveSelfTestStatus('v085SelfTestStatus', 'fail', '0.9.5'), []);
  assertCase('legacy_v094_failure_advisory_for_v095', effectiveSelfTestStatus('v094SelfTestStatus', 'fail', '0.9.5') === 'pass_legacy_advisory', failures, cases, effectiveSelfTestStatus('v094SelfTestStatus', 'fail', '0.9.5'), []);
  assertCase('active_v095_failure_still_blocks', effectiveSelfTestStatus('v095SelfTestStatus', 'fail', '0.9.5') === 'fail', failures, cases, effectiveSelfTestStatus('v095SelfTestStatus', 'fail', '0.9.5'), []);
  assertCase('v094_active_self_test_selected_when_harness_094', activeSelfTestStatusKey('0.9.4') === 'v094SelfTestStatus', failures, cases, activeSelfTestStatusKey('0.9.4'), []);
  assertCase('active_v094_failure_still_blocks_when_harness_094', effectiveSelfTestStatus('v094SelfTestStatus', 'fail', '0.9.4') === 'fail', failures, cases, effectiveSelfTestStatus('v094SelfTestStatus', 'fail', '0.9.4'), []);
  report = buildLegacyCompatibilitySelfTestStatus({
    v085SelfTestStatus: { status: 'fail' },
    v094SelfTestStatus: { status: 'fail' },
    v095SelfTestStatus: { status: 'pass' },
  }, '0.9.5');
  assertCase('legacy_compatibility_records_advisory_failures', report.status === 'pass' && report.legacyFailureCount === 2 && report.reasonCodes.includes('legacy_self_test_failure_advisory'), failures, cases, report.status, report.reasonCodes);

  const workflowText = fs.readFileSync(fileURLToPath(new URL('../.github/workflows/quality-gate.yml', import.meta.url)), 'utf8');
  const tierStateMachineFiles = [
    'apps/backend/prisma/schema.prisma',
    'apps/backend/prisma/migrations/20260528090000_add_scheduled_tier_update_state_machine/migration.sql',
    'apps/backend/src/app/lib/tierUpdateState.ts',
    'apps/backend/src/app/lib/__tests__/tierUpdateState.test.ts',
  ];
  const productDecision = buildRemoteProductCheckDecision({ CODEX_CHANGED_FILES: tierStateMachineFiles.join('\n') });
  const schemaDecision = buildRemoteProductCheckDecision({ CODEX_CHANGED_FILES: 'apps/backend/prisma/schema.prisma' });
  const migrationDecision = buildRemoteProductCheckDecision({ CODEX_CHANGED_FILES: 'apps/backend/prisma/migrations/20260528090000_add_scheduled_tier_update_state_machine/migration.sql' });
  const helperDecision = buildRemoteProductCheckDecision({ CODEX_CHANGED_FILES: 'apps/backend/src/app/lib/tierUpdateState.ts' });
  const docsDecision = buildRemoteProductCheckDecision({ CODEX_CHANGED_FILES: 'docs/process/FUNKY_TIER_SCHEDULER_TX_PATH_AUDIT.md' });
  const harnessDecision = buildRemoteProductCheckDecision({ CODEX_CHANGED_FILES: '.github/workflows/quality-gate.yml\nscripts/codex-v095-self-test.mjs' });
  assertCase('prepare_target_product_verification_step_present', /name:\s*Prepare target product verification/.test(workflowText) && /codex-remote-product-checks\.mjs/.test(workflowText), failures, cases);
  assertCase('prepare_target_product_verification_pull_request_only', /if:\s*\$\{\{\s*github\.event_name\s*==\s*'pull_request'\s*\}\}/.test(workflowText), failures, cases);
  assertCase('product_pr_schema_change_requires_remote_product_checks', schemaDecision.productRequired && schemaDecision.skipNpm === '0', failures, cases, schemaDecision.reasonCode, []);
  assertCase('product_pr_migration_change_requires_remote_product_checks', migrationDecision.productRequired && migrationDecision.skipNpm === '0', failures, cases, migrationDecision.reasonCode, []);
  assertCase('product_pr_lib_helper_change_requires_remote_product_checks', helperDecision.productRequired && helperDecision.skipNpm === '0', failures, cases, helperDecision.reasonCode, []);
  assertCase('product_pr_generates_remote_baseline', productDecision.willGenerateBaseline === true, failures, cases, String(productDecision.willGenerateBaseline), []);
  assertCase('product_pr_generates_product_verification_evidence', productDecision.willGenerateEvidence === true, failures, cases, String(productDecision.willGenerateEvidence), []);
  assertCase('product_pr_skip_npm_fails_closed', productDecision.productRequired && productDecision.skipNpm === '0', failures, cases, productDecision.skipNpm, []);
  assertCase('product_relevant_pr_context_not_empty', productDecision.plan.files.length === tierStateMachineFiles.length, failures, cases, String(productDecision.plan.files.length), []);
  assertCase('docs_only_pr_remote_product_checks_skip_allowed', !docsDecision.productRequired && docsDecision.skipNpm === '1', failures, cases, docsDecision.reasonCode, []);
  assertCase('harness_only_pr_skip_npm_with_reason_passes', !harnessDecision.productRequired && harnessDecision.skipNpm === '1', failures, cases, harnessDecision.reasonCode, []);
  report = buildRemoteProductBaselineReport({
    CODEX_EVENT_NAME: 'pull_request',
    CODEX_CHANGED_FILES: tierStateMachineFiles.join('\n'),
  });
  assertCase('baseline_missing_fails_for_product_pr', statusOf(report, 'remoteProductBaselineStatus') === 'fail' && reasonsOf(report, 'remoteProductBaselineStatus').includes('remote_product_baseline_missing'), failures, cases, statusOf(report, 'remoteProductBaselineStatus'), reasonsOf(report, 'remoteProductBaselineStatus'));
  const validBaseline = {
    schemaVersion: '0.8.3',
    harnessVersion: HARNESS_VERSION,
    repository: 'hiro4649/disco-funky-repair',
    baseSha: '32924d095cbacb2256285bef288ce30c3d53df38',
    baselineType: 'remote_product_checks',
    commands: [{ name: 'backend:npm run build', result: 'pass', source: 'remote' }],
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
    CODEX_CHANGED_FILES: tierStateMachineFiles.join('\n'),
    CODEX_REMOTE_PRODUCT_BASELINE_JSON: JSON.stringify(validBaseline),
  });
  assertCase('remote_product_baseline_present_passes_for_product_pr', statusOf(report, 'remoteProductBaselineStatus') === 'pass', failures, cases, statusOf(report, 'remoteProductBaselineStatus'), reasonsOf(report, 'remoteProductBaselineStatus'));
  report = buildProductVerificationEvidenceReport({
    CODEX_EVENT_NAME: 'pull_request',
    CODEX_REPOSITORY: validBaseline.repository,
    CODEX_PR_BASE_SHA: validBaseline.baseSha,
    CODEX_CHANGED_FILES: tierStateMachineFiles.join('\n'),
    CODEX_REMOTE_PRODUCT_BASELINE_JSON: JSON.stringify(validBaseline),
    CODEX_SKIP_NPM: '0',
    CODEX_PRODUCT_VERIFICATION_COMMANDS: 'backend:npm run build',
    CODEX_PRODUCT_VERIFICATION_RESULT: 'pass',
    CODEX_PRODUCT_VERIFICATION_SOURCE: 'remote',
  });
  assertCase('valid_product_verification_evidence_passes_for_product_pr', statusOf(report, 'productVerificationEvidenceStatus') === 'pass', failures, cases, statusOf(report, 'productVerificationEvidenceStatus'), reasonsOf(report, 'productVerificationEvidenceStatus'));

  report = buildAgentsDoctrineReport({ doctrineSectionExists: true, routingMapExists: true, docsProcessLinksExist: true, size: 1800 });
  assertCase('agents_doctrine_short_map_pass', statusOf(report, 'agentsDoctrineStatus') === 'pass', failures, cases, statusOf(report, 'agentsDoctrineStatus'), reasonsOf(report, 'agentsDoctrineStatus'));
  report = buildAgentsDoctrineReport({ doctrineSectionExists: true, routingMapExists: true, docsProcessLinksExist: true, largeManual: true });
  assertCase('agents_doctrine_large_manual_fails', statusOf(report, 'agentsDoctrineStatus') === 'fail', failures, cases, statusOf(report, 'agentsDoctrineStatus'), reasonsOf(report, 'agentsDoctrineStatus'));
  report = buildAgentsDoctrineReport({ doctrineSectionExists: true, routingMapExists: true, docsProcessLinksExist: true, policyBodyInAgents: false });
  assertCase('agents_doctrine_policy_in_docs_pass', statusOf(report, 'agentsDoctrineStatus') === 'pass', failures, cases, statusOf(report, 'agentsDoctrineStatus'), reasonsOf(report, 'agentsDoctrineStatus'));

  report = buildSkillRoutingReport({ taskMode: 'target_rollout', selectedSkills: ['target-harness', 'evidence-integrity'] });
  assertCase('skill_routing_harness_rollout_limited_skills_pass', statusOf(report, 'skillRoutingStatus') === 'pass', failures, cases, statusOf(report, 'skillRoutingStatus'), reasonsOf(report, 'skillRoutingStatus'));
  report = buildSkillRoutingReport({ selectedSkills: ['a', 'b', 'c', 'd', 'e', 'f'] });
  assertCase('skill_routing_too_many_skills_fails', statusOf(report, 'skillRoutingStatus') === 'fail', failures, cases, statusOf(report, 'skillRoutingStatus'), reasonsOf(report, 'skillRoutingStatus'));
  report = buildSkillRoutingReport({ riskClasses: ['runtime_relevant'], selectedSkills: ['evidence-integrity'] });
  assertCase('skill_routing_runtime_pr_requires_runtime_safety', statusOf(report, 'skillRoutingStatus') === 'fail', failures, cases, statusOf(report, 'skillRoutingStatus'), reasonsOf(report, 'skillRoutingStatus'));

  report = buildSkillLoadBudgetReport({ loadedSkillCount: 6 });
  assertCase('skill_load_budget_more_than_five_fails', statusOf(report, 'skillLoadBudgetStatus') === 'fail', failures, cases, statusOf(report, 'skillLoadBudgetStatus'), reasonsOf(report, 'skillLoadBudgetStatus'));
  report = buildSkillDriftReport({ oldHarnessVersion: true });
  assertCase('skill_drift_old_marker_fails', statusOf(report, 'skillDriftStatus') === 'fail', failures, cases, statusOf(report, 'skillDriftStatus'), reasonsOf(report, 'skillDriftStatus'));
  report = buildSkillDriftReport({ targetHotfixPreserved: true });
  assertCase('skill_drift_target_hotfix_preserved_pass', statusOf(report, 'skillDriftStatus') === 'pass', failures, cases, statusOf(report, 'skillDriftStatus'), reasonsOf(report, 'skillDriftStatus'));

  report = buildAgentSessionGovernanceReport({ forceCheck: true, sameBranchMultiplePushers: true });
  assertCase('agent_session_parallel_same_branch_fails', statusOf(report, 'agentSessionGovernanceStatus') === 'fail', failures, cases, statusOf(report, 'agentSessionGovernanceStatus'), reasonsOf(report, 'agentSessionGovernanceStatus'));
  report = buildAgentSessionGovernanceReport({ forceCheck: true, needsInputMerged: true });
  assertCase('agent_session_needs_input_merge_fails', statusOf(report, 'agentSessionGovernanceStatus') === 'fail', failures, cases, statusOf(report, 'agentSessionGovernanceStatus'), reasonsOf(report, 'agentSessionGovernanceStatus'));

  report = buildAgentContainmentBoundaryReport({});
  assertCase('agent_containment_external_content_untrusted_pass', statusOf(report, 'agentContainmentBoundaryStatus') === 'pass', failures, cases, statusOf(report, 'agentContainmentBoundaryStatus'), reasonsOf(report, 'agentContainmentBoundaryStatus'));
  report = buildAgentContainmentBoundaryReport({ egressCapabilityMissing: true });
  assertCase('agent_containment_egress_capability_missing_fails', statusOf(report, 'agentContainmentBoundaryStatus') === 'fail', failures, cases, statusOf(report, 'agentContainmentBoundaryStatus'), reasonsOf(report, 'agentContainmentBoundaryStatus'));
  report = buildAgentContainmentBoundaryReport({ writePermissionForReadOnly: true });
  assertCase('agent_containment_write_permission_for_readonly_fails', statusOf(report, 'agentContainmentBoundaryStatus') === 'fail', failures, cases, statusOf(report, 'agentContainmentBoundaryStatus'), reasonsOf(report, 'agentContainmentBoundaryStatus'));

  report = buildEvalTraceHarvestReport({ forceCheck: true, observedBehavior: 'observed', safeScope: 'harness', doNotTouchList: ['src'] });
  assertCase('eval_trace_expected_observed_pair_required', statusOf(report, 'evalTraceHarvestStatus') === 'fail', failures, cases, statusOf(report, 'evalTraceHarvestStatus'), reasonsOf(report, 'evalTraceHarvestStatus'));
  report = buildEvalTraceHarvestReport({ forceCheck: true, observedBehavior: 'observed', expectedBehavior: 'expected', safeScope: 'harness', doNotTouchList: ['src'], rawProductionDataIncluded: true });
  assertCase('eval_trace_raw_production_data_fails', statusOf(report, 'evalTraceHarvestStatus') === 'fail', failures, cases, statusOf(report, 'evalTraceHarvestStatus'), reasonsOf(report, 'evalTraceHarvestStatus'));

  report = buildOperatorVisibleDeltaReport({ productVisibleChange: true });
  assertCase('operator_visible_delta_product_change_required', statusOf(report, 'operatorVisibleDeltaStatus') === 'fail', failures, cases, statusOf(report, 'operatorVisibleDeltaStatus'), reasonsOf(report, 'operatorVisibleDeltaStatus'));
  report = buildOperatorVisibleDeltaReport({ harnessOnly: true });
  assertCase('operator_visible_delta_harness_only_not_applicable', statusOf(report, 'operatorVisibleDeltaStatus') === 'not_applicable', failures, cases, statusOf(report, 'operatorVisibleDeltaStatus'), reasonsOf(report, 'operatorVisibleDeltaStatus'));

  report = buildTraceToEvalCandidateReport({ forceCheck: true, sourceEvidence: 'safe evidence', observedFailure: 'failure', expectedBehavior: 'expected', regressionEvalCommand: 'node test', safeScope: 'harness', doNotTouchList: ['src'] });
  assertCase('trace_to_eval_candidate_requires_targeted_eval', statusOf(report, 'traceToEvalCandidateStatus') === 'fail', failures, cases, statusOf(report, 'traceToEvalCandidateStatus'), reasonsOf(report, 'traceToEvalCandidateStatus'));
  report = buildTraceToEvalCandidateReport({ forceCheck: true, sourceEvidence: 'safe evidence', observedFailure: 'failure', expectedBehavior: 'expected', targetedEvalCommand: 'node test', safeScope: 'harness', doNotTouchList: ['src'] });
  assertCase('trace_to_eval_candidate_requires_regression_eval', statusOf(report, 'traceToEvalCandidateStatus') === 'fail', failures, cases, statusOf(report, 'traceToEvalCandidateStatus'), reasonsOf(report, 'traceToEvalCandidateStatus'));

  report = buildSubagentGovernanceReport({ riskClasses: ['security_relevant'], roles: ['evidence_integrity'] });
  assertCase('subagent_security_required_for_security_pr', statusOf(report, 'subagentGovernanceStatus') === 'fail', failures, cases, statusOf(report, 'subagentGovernanceStatus'), reasonsOf(report, 'subagentGovernanceStatus'));
  report = buildSubagentGovernanceReport({ riskClasses: ['runtime_relevant'], roles: ['evidence_integrity'] });
  assertCase('subagent_runtime_required_for_runtime_pr', statusOf(report, 'subagentGovernanceStatus') === 'fail', failures, cases, statusOf(report, 'subagentGovernanceStatus'), reasonsOf(report, 'subagentGovernanceStatus'));
  report = buildSubagentGovernanceReport({ forceCheck: true, rawOutputIncluded: true });
  assertCase('subagent_raw_output_forbidden', statusOf(report, 'subagentGovernanceStatus') === 'fail', failures, cases, statusOf(report, 'subagentGovernanceStatus'), reasonsOf(report, 'subagentGovernanceStatus'));
  report = buildSubagentGovernanceReport({ riskClasses: ['docs_only'], roles: [] });
  assertCase('subagent_docs_only_light_pass', statusOf(report, 'subagentGovernanceStatus') === 'pass', failures, cases, statusOf(report, 'subagentGovernanceStatus'), reasonsOf(report, 'subagentGovernanceStatus'));

  report = buildPrismaStateMachineSchemaReport({ forceCheck: true, processedBooleanOnly: true });
  assertCase('state_machine_processed_boolean_only_fails', statusOf(report, 'stateMachineSchemaStatus') === 'fail', failures, cases, statusOf(report, 'stateMachineSchemaStatus'), reasonsOf(report, 'stateMachineSchemaStatus'));
  report = buildPrismaStateMachineSchemaReport({ runtimeReadinessClaimed: true, fields: ['status', 'attempt', 'lockedBy', 'updatedAt'] });
  assertCase('state_machine_schema_fields_pass', statusOf(report, 'stateMachineSchemaStatus') === 'pass', failures, cases, statusOf(report, 'stateMachineSchemaStatus'), reasonsOf(report, 'stateMachineSchemaStatus'));

  report = buildStateTransitionHelperReport({ stateFieldsAdded: true });
  assertCase('state_transition_helper_missing_fails', statusOf(report, 'stateTransitionHelperStatus') === 'fail', failures, cases, statusOf(report, 'stateTransitionHelperStatus'), reasonsOf(report, 'stateTransitionHelperStatus'));
  report = buildStateTransitionHelperReport({ stateFieldsAdded: true, helperPresent: true, helperMutatesDbDirectly: true, transitionTestPresent: true, invalidTransitionTested: true, safeErrorStatesPresent: true });
  assertCase('state_transition_helper_mutates_db_fails', statusOf(report, 'stateTransitionHelperStatus') === 'fail', failures, cases, statusOf(report, 'stateTransitionHelperStatus'), reasonsOf(report, 'stateTransitionHelperStatus'));

  report = buildReceiptEvidenceSchemaReport({ forceCheck: true, privateKeyIncluded: true });
  assertCase('receipt_evidence_private_key_fails', statusOf(report, 'receiptEvidenceSchemaStatus') === 'fail', failures, cases, statusOf(report, 'receiptEvidenceSchemaStatus'), reasonsOf(report, 'receiptEvidenceSchemaStatus'));
  report = buildReceiptEvidenceSchemaReport({ receiptEvidencePresent: true, chainIdPresent: true, storagePolicyPresent: true });
  assertCase('receipt_evidence_safe_public_fields_pass', statusOf(report, 'receiptEvidenceSchemaStatus') === 'pass', failures, cases, statusOf(report, 'receiptEvidenceSchemaStatus'), reasonsOf(report, 'receiptEvidenceSchemaStatus'));

  report = buildWorkerReadinessSequenceReport({ workerRelevant: true, workerEntrypointBeforeSchemaHelper: true });
  assertCase('worker_readiness_wrong_sequence_fails', statusOf(report, 'workerReadinessSequenceStatus') === 'fail', failures, cases, statusOf(report, 'workerReadinessSequenceStatus'), reasonsOf(report, 'workerReadinessSequenceStatus'));
  report = buildWorkerReadinessSequenceReport({ workerRelevant: true });
  assertCase('worker_readiness_schema_first_pass', statusOf(report, 'workerReadinessSequenceStatus') === 'pass', failures, cases, statusOf(report, 'workerReadinessSequenceStatus'), reasonsOf(report, 'workerReadinessSequenceStatus'));

  report = buildEvidenceMinimalityReport({ rawLogsInPrBody: true });
  assertCase('evidence_minimality_raw_log_fails', statusOf(report, 'evidenceMinimalityStatus') === 'fail', failures, cases, statusOf(report, 'evidenceMinimalityStatus'), reasonsOf(report, 'evidenceMinimalityStatus'));
  report = buildEvidenceMinimalityReport({ harnessOnly: true });
  assertCase('evidence_minimality_harness_only_compact_pass', statusOf(report, 'evidenceMinimalityStatus') === 'pass', failures, cases, statusOf(report, 'evidenceMinimalityStatus'), reasonsOf(report, 'evidenceMinimalityStatus'));

  report = buildEvidenceDedupReport({ conflictingHeadSha: true });
  assertCase('evidence_dedup_conflicting_head_fails', statusOf(report, 'evidenceDedupStatus') === 'fail', failures, cases, statusOf(report, 'evidenceDedupStatus'), reasonsOf(report, 'evidenceDedupStatus'));
  report = buildSafeArtifactNextActionReport({ failureArtifact: true });
  assertCase('safe_artifact_next_action_missing_fails', statusOf(report, 'safeArtifactNextActionStatus') === 'fail', failures, cases, statusOf(report, 'safeArtifactNextActionStatus'), reasonsOf(report, 'safeArtifactNextActionStatus'));
  report = buildSafeArtifactNextActionReport({ failureArtifact: true, classification: 'body_only_repair' });
  assertCase('safe_artifact_next_action_body_only_pass', statusOf(report, 'safeArtifactNextActionStatus') === 'pass', failures, cases, statusOf(report, 'safeArtifactNextActionStatus'), reasonsOf(report, 'safeArtifactNextActionStatus'));

  report = buildSkillEvidenceLinkReport({ missingLink: true });
  assertCase('skill_evidence_link_missing_fails', statusOf(report, 'skillEvidenceLinkStatus') === 'fail', failures, cases, statusOf(report, 'skillEvidenceLinkStatus'), reasonsOf(report, 'skillEvidenceLinkStatus'));
  report = buildSkillEvidenceLinkReport({ oldEvidence: true });
  assertCase('skill_evidence_obsolete_warning', statusOf(report, 'skillEvidenceLinkStatus') === 'warning', failures, cases, statusOf(report, 'skillEvidenceLinkStatus'), reasonsOf(report, 'skillEvidenceLinkStatus'));

  report = buildSkillRoutingReport({ taskMode: 'harness_change', selectedSkills: ['harness', 'evidence'] });
  assertCase('source_harness_only_v095_fixture_pass', statusOf(report, 'skillRoutingStatus') === 'pass', failures, cases, statusOf(report, 'skillRoutingStatus'), reasonsOf(report, 'skillRoutingStatus'));
  report = buildSkillRoutingReport({ taskMode: 'target_rollout', selectedSkills: ['target-harness', 'evidence-integrity'] });
  assertCase('target_harness_rollout_v095_fixture_pass', statusOf(report, 'skillRoutingStatus') === 'pass', failures, cases, statusOf(report, 'skillRoutingStatus'), reasonsOf(report, 'skillRoutingStatus'));

  const unsafe = scanObjectForUnsafe(cases);
  const status = failures.length || unsafe.length ? 'fail' : 'pass';
  return {
    marker,
    harnessVersion: HARNESS_VERSION,
    status,
    v095SelfTestStatus: {
      status,
      suite: 'v095',
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
  const report = buildV095SelfTestReport();
  writeJsonReport(report, 'CODEX_V095_SELF_TEST_REPORT');
  exitFor(report);
}
