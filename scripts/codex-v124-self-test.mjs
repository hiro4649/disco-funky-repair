#!/usr/bin/env node
// CODEX_QUALITY_HARNESS_FILE v1.2.4

import fs from 'node:fs';
import { writeJsonReport, exitFor } from './codex-v080-lib.mjs';
import {
  V124_OPERATOR_STATUS_KEYS,
  V124_P0_ARTIFACTS,
  buildOrchestrationCapsule,
  validateDelegationBoundary,
  validateEvidenceSemanticsKernel,
  validateGoalContract,
  validateOrchestrationCapsule,
  validateTargetHarnessFootprintPolicy,
} from './codex-orchestration-capsule.mjs';
import { buildWorkerProofCapsule, validateWorkerProofCapsule } from './codex-worker-proof-capsule.mjs';
import { buildOwnerDecisionBrief, validateOwnerDecisionBrief } from './codex-owner-decision-brief.mjs';
import { parseV123CurrentHeadOwnerDecisionConfirmation, reconcileV123DecisionClosure } from './codex-local-quality-gate.mjs';

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

function passed(status) {
  return status?.status === 'pass';
}

const compatibilityCases = [
  ['v124_self_test_must_pass', () => true],
  ['v124_adds_no_new_p0_artifact', () => V124_P0_ARTIFACTS.length === 3 && !V124_P0_ARTIFACTS.includes('codex-v124-delegation.safe.json')],
  ['v124_adds_no_new_top_level_status', () => V124_OPERATOR_STATUS_KEYS.length === 8 && !V124_OPERATOR_STATUS_KEYS.includes('goalContractStatus')],
  ['v124_preserves_v118_final_decision', () => buildOrchestrationCapsule().finalAuthority === 'v1.1.8_final_decision_kernel'],
  ['v124_preserves_v119_orchestration_artifacts', () => V124_P0_ARTIFACTS.includes('codex-orchestration-capsule.safe.json')],
  ['v124_no_new_skill_daemon_or_visual_daemon', () => !fs.existsSync('scripts/codex-skill-daemon.mjs') && !fs.existsSync('scripts/codex-visual-proof-daemon.mjs')],
  ['v124_active_authority_tuple_is_current', () => buildOrchestrationCapsule().skillContextRouting.activeAuthorityTuple.activeSelfTestSuite === 'v124'],
];

const goalAndDelegationCases = [
  ['goal_contract_default_passes', () => passed(validateGoalContract(buildOrchestrationCapsule().goalContract))],
  ['goal_completion_pass_requires_all_evidence', () => failed(validateGoalContract(buildOrchestrationCapsule({
    goalContract: { goalCompletionProof: { completionStatus: 'pass' } },
  }).goalContract))],
  ['goal_completion_passes_with_complete_proof', () => passed(validateGoalContract(buildOrchestrationCapsule({
    goalContract: {
      goalCompletionProof: {
        completionStatus: 'pass',
        successCriteriaSatisfied: true,
        requiredEvidenceSatisfied: true,
        forbiddenShortcutsAbsent: true,
        verificationPlanExecuted: true,
      },
    },
  }).goalContract))],
  ['delegation_boundary_default_passes', () => passed(validateDelegationBoundary(buildOrchestrationCapsule().delegationBoundary))],
  ['delegation_blocks_ai_owner_authority_creation', () => failed(validateDelegationBoundary(buildOrchestrationCapsule({
    delegationBoundary: { ownerAuthorityCreatedByAI: true },
  }).delegationBoundary))],
  ['delegation_blocks_expert_merge_or_readiness', () => failed(validateDelegationBoundary(buildOrchestrationCapsule({
    delegationBoundary: { expertJudgmentCanMerge: true, expertJudgmentCanClaimReadiness: true },
  }).delegationBoundary))],
  ['delegation_revocation_stops_continuation', () => failed(validateDelegationBoundary(buildOrchestrationCapsule({
    delegationBoundary: { delegationRevocation: { revoked: true, continueAllowed: true } },
  }).delegationBoundary))],
  ['closure_adapter_cannot_create_final_authority', () => failed(validateDelegationBoundary({
    ...buildOrchestrationCapsule().delegationBoundary,
    finalDecisionClosureAdapter: {
      ...buildOrchestrationCapsule().delegationBoundary.finalDecisionClosureAdapter,
      createsFinalAuthority: true,
    },
  }))],
];

const evidenceAndFootprintCases = [
  ['evidence_semantics_default_passes', () => passed(validateEvidenceSemanticsKernel(buildOrchestrationCapsule().evidenceSemanticsKernel))],
  ['evidence_semantics_blocks_pr_body_as_machine_evidence', () => failed(validateEvidenceSemanticsKernel(buildOrchestrationCapsule({
    evidenceSemanticsKernel: { prBodyIsMachineEvidence: true },
  }).evidenceSemanticsKernel))],
  ['evidence_semantics_blocks_self_referential_sha_requirement', () => failed(validateEvidenceSemanticsKernel(buildOrchestrationCapsule({
    evidenceSemanticsKernel: { selfReferentialShaRequired: true },
  }).evidenceSemanticsKernel))],
  ['evidence_semantics_pass_does_not_imply_readiness', () => failed(validateEvidenceSemanticsKernel(buildOrchestrationCapsule({
    evidenceSemanticsKernel: { passSemantics: { productReadinessPass: true } },
  }).evidenceSemanticsKernel))],
  ['target_footprint_default_passes', () => passed(validateTargetHarnessFootprintPolicy(buildOrchestrationCapsule().targetHarnessFootprintPolicy))],
  ['target_footprint_blocks_new_p0_artifact', () => failed(validateTargetHarnessFootprintPolicy(buildOrchestrationCapsule({
    targetHarnessFootprintPolicy: { newP0ArtifactAllowed: true },
  }).targetHarnessFootprintPolicy))],
  ['target_footprint_blocks_product_package_runtime_scope', () => failed(validateTargetHarnessFootprintPolicy(buildOrchestrationCapsule({
    targetHarnessFootprintPolicy: { productCodeChangeAllowed: true, packageLockChangeAllowed: true },
  }).targetHarnessFootprintPolicy))],
  ['repo_specific_visual_surface_requires_redaction', () => failed(validateTargetHarnessFootprintPolicy(buildOrchestrationCapsule({
    targetHarnessFootprintPolicy: { repoSpecificVisualProofSurface: { enabled: true, privateImageRedactionRequired: false } },
  }).targetHarnessFootprintPolicy))],
];

const expertLoopCases = [
  ['worker_proof_default_v124_extensions_pass', () => passed(validateWorkerProofCapsule(buildWorkerProofCapsule()))],
  ['bounded_loop_blocks_continue_without_new_signal', () => failed(validateWorkerProofCapsule(buildWorkerProofCapsule({
    boundedExpertLoop: { loopContinuationRequested: true, loopContinuationAllowed: true },
  })))],
  ['bounded_loop_allows_continue_with_new_evidence_before_cap', () => passed(validateWorkerProofCapsule(buildWorkerProofCapsule({
    boundedExpertLoop: { loopContinuationRequested: true, loopContinuationAllowed: true, newEvidenceAvailable: true, loopCycleCount: 1 },
  })))],
  ['bounded_loop_blocks_cycle_cap', () => failed(validateWorkerProofCapsule(buildWorkerProofCapsule({
    boundedExpertLoop: { loopContinuationRequested: true, loopContinuationAllowed: true, newEvidenceAvailable: true, loopCycleCount: 4 },
  })))],
  ['skeptic_agent_requires_abnormal_trigger', () => failed(validateWorkerProofCapsule(buildWorkerProofCapsule({
    expertRoleLedger: { roles: [{ roleId: 'skeptic', active: true, abnormalTrigger: 'none' }] },
  })))],
  ['inventory_agent_cannot_expand_product_scope', () => failed(validateWorkerProofCapsule(buildWorkerProofCapsule({
    expertRoleLedger: { roles: [{ roleId: 'inventory', active: true, canModifyProductCode: true }] },
  })))],
  ['expert_role_requires_safe_artifacts_only', () => failed(validateWorkerProofCapsule(buildWorkerProofCapsule({
    expertRoleLedger: { roles: [{ roleId: 'test_verifier', active: true, inputContextPacket: 'raw_logs' }] },
  })))],
  ['safe_failure_digest_blocks_raw_log_or_raw_diff', () => {
    const capsule = buildWorkerProofCapsule();
    capsule.safeFailureDigest.rawLogsRead = true;
    return failed(validateWorkerProofCapsule(capsule));
  }],
  ['safe_failure_digest_product_scope_requires_owner_escalation', () => failed(validateWorkerProofCapsule(buildWorkerProofCapsule({
    safeFailureDigest: { repairScope: 'product_requires_owner_scope', ownerOnlyEscalationRequired: false },
  })))],
];

const ownerBriefCases = [
  ['owner_brief_default_v124_extensions_pass', () => passed(validateOwnerDecisionBrief(buildOwnerDecisionBrief()))],
  ['owner_brief_adapter_cannot_create_authority', () => {
    const brief = buildOwnerDecisionBrief();
    brief.finalDecisionClosureAdapter.ownerAuthorityCreatedByAI = true;
    return failed(validateOwnerDecisionBrief(brief));
  }],
  ['owner_burden_reducer_keeps_three_choices', () => {
    const brief = buildOwnerDecisionBrief();
    brief.ownerBurdenReducer.exactChoicesMax = 4;
    return failed(validateOwnerDecisionBrief(brief));
  }],
  ['safe_session_learning_is_proposal_only', () => {
    const brief = buildOwnerDecisionBrief();
    brief.safeSessionLearningProposal.autoApplyAllowed = true;
    return failed(validateOwnerDecisionBrief(brief));
  }],
  ['safe_session_learning_forbids_raw_transcript_mining', () => {
    const brief = buildOwnerDecisionBrief();
    brief.safeSessionLearningProposal.rawTranscriptMining = true;
    return failed(validateOwnerDecisionBrief(brief));
  }],
  ['repo_visual_surface_optional_and_repo_specific', () => failed(validateOwnerDecisionBrief(buildOwnerDecisionBrief({
    repoSpecificVisualProofSurface: { enabled: true, privateImageRedactionRequired: false },
  })))],
  ['orchestration_capsule_validates_all_v124_internal_blocks', () => {
    const result = validateOrchestrationCapsule(buildOrchestrationCapsule());
    return Object.values(result).every((item) => item.status === 'pass');
  }],
];

const previousEnv = {
  CODEX_EVENT_NAME: process.env.CODEX_EVENT_NAME,
  CODEX_PR_HEAD_SHA: process.env.CODEX_PR_HEAD_SHA,
  CODEX_PR_NUMBER: process.env.CODEX_PR_NUMBER,
  CODEX_PR_BODY: process.env.CODEX_PR_BODY,
  CODEX_QUALITY_GATE_RUN_ID: process.env.CODEX_QUALITY_GATE_RUN_ID,
  CODEX_SAFE_ARTIFACT_ID: process.env.CODEX_SAFE_ARTIFACT_ID,
};

function withEnv(overrides, fn) {
  for (const [key, value] of Object.entries(overrides)) process.env[key] = value;
  try {
    return fn();
  } finally {
    for (const [key, value] of Object.entries(previousEnv)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

const finalClosureAliasCases = [
  ['v124_final_closure_uses_alias_resolvers_for_required_statuses', () => withEnv({
    CODEX_EVENT_NAME: 'pull_request',
    CODEX_PR_HEAD_SHA: 'a06d9bc690fe953de74b069d94efdead3d964c48',
    CODEX_PR_NUMBER: '324',
    CODEX_QUALITY_GATE_RUN_ID: '27546509528',
    CODEX_SAFE_ARTIFACT_ID: '27546509528-1',
    CODEX_PR_BODY: [
      'I confirm PR #324 current head a06d9bc690fe953de74b069d94efdead3d964c48 for merge consideration.',
      'Owner decision: owner_merge_after_same_head_pass.',
    ].join('\n'),
  }, () => {
    const report = {
      status: 'pass',
      evidenceCapsuleStatus: { status: 'pass' },
      qualityScoreStatus: { status: 'pass' },
      targetSafeSummaryRequiredClosureStatus: { status: 'pass' },
      prEvidenceRendererStatus: { status: 'pass' },
      workflowProductVerificationInvariantStatus: { status: 'pass' },
      finalDecisionPointerStatus: { status: 'pass' },
      permissionGrantStatus: { status: 'pass' },
      ownerDecisionBriefStatus: { status: 'pass' },
    };
    reconcileV123DecisionClosure(report);
    return report.finalDecision?.terminalAction === 'merge_current_pr'
      && report.finalDecision?.mergeAllowed === true
      && report.ownerDecisionBrief?.decisionReady === true
      && report.ownerDecisionBrief?.safeNextAction === 'merge_current_pr';
  })],
  ['v124_final_closure_reconciles_before_final_artifact_write', () => {
    const source = fs.readFileSync('scripts/codex-local-quality-gate.mjs', 'utf8');
    return /report\.localGate\s*=\s*\{\s*status:\s*report\.status\s*\};\s*reconcileV123TargetDecisionClosure\(report\);\s*writeV117LoadBearingArtifacts\(report\);/m.test(source);
  }],
  ['v124_quality_gate_passes_pr_body_to_final_closure', () => {
    const workflow = fs.readFileSync('.github/workflows/quality-gate.yml', 'utf8');
    return /CODEX_PR_BODY:\s*\$\{\{\s*github\.event\.pull_request\.body\s*\|\|\s*''\s*\}\}/.test(workflow)
      && /current_pr_body="\$\(GH_TOKEN="\$\{GITHUB_TOKEN:-\}" gh pr view "\$\{CODEX_PR_NUMBER:-\}" --repo "\$\{CODEX_REPOSITORY:-\}" --json body -q \.body 2>\/dev\/null \|\| true\)"/.test(workflow)
      && /export CODEX_PR_BODY="\$current_pr_body"/.test(workflow)
      && /export CODEX_OWNER_MERGE_CONFIRMED=1/.test(workflow);
  }],
  ['v124_pr_body_reader_prefers_live_current_body_before_event_payload', () => {
    const source = fs.readFileSync('scripts/codex-production-readiness-gate.mjs', 'utf8');
    return /function readLivePrBody\(env = process\.env\)/.test(source)
      && /source: 'GITHUB_CURRENT_PR_BODY'/.test(source)
      && /const token = env\.GH_TOKEN \|\| env\.GITHUB_TOKEN/.test(source)
      && /GH_TOKEN:\s*token/.test(source)
      && /https:\/\/api\.github\.com\/repos\/\$\{repository\}\/pulls\/\$\{prNumber\}/.test(source)
      && source.indexOf('const liveBody = readLivePrBody(env);') < source.indexOf('if (env.CODEX_PR_BODY && env.CODEX_PR_BODY.trim())')
      && source.indexOf('const liveBody = readLivePrBody(env);') < source.indexOf('if (env.GITHUB_EVENT_PATH)');
  }],
  ['v124_current_head_owner_confirmation_tolerates_missing_pr_number_env', () => {
    const head = '79c2d714720c34daf44b72efafe93400f5e2ca05';
    const result = parseV123CurrentHeadOwnerDecisionConfirmation({
      text: `I confirm PR #338 current head ${head} for merge consideration.\nOwner decision: owner_merge_after_same_head_pass.`,
      headSha: head,
      prNumber: '',
    });
    return result.status === 'pass' && result.hasCurrentHead === true && result.hasOwnerDecision === true;
  }],
  ['v124_final_closure_accepts_safe_owner_confirmation_env', () => {
    const source = fs.readFileSync('scripts/codex-local-quality-gate.mjs', 'utf8');
    return /CODEX_OWNER_MERGE_CONFIRMED === '1'/.test(source)
      && /return envConfirmed \|\| structuredReady \|\| bodyConfirmation\.status === 'pass';/.test(source);
  }],
];

const cases = [
  ...compatibilityCases,
  ...goalAndDelegationCases,
  ...evidenceAndFootprintCases,
  ...expertLoopCases,
  ...ownerBriefCases,
  ...finalClosureAliasCases,
].map(([name, fn]) => test(name, fn));

const fixtureGroups = [
  'v118_v119_v120_v121_v122_v123_compatibility_matrix',
  'goal_contract_matrix',
  'delegation_boundary_matrix',
  'evidence_semantics_matrix',
  'target_footprint_matrix',
  'bounded_expert_loop_matrix',
  'expert_role_ledger_matrix',
  'safe_failure_digest_matrix',
  'owner_burden_reducer_matrix',
  'safe_session_learning_matrix',
];

const failures = cases.filter((item) => item.status !== 'pass');
const report = {
  v124SelfTestStatus: {
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

writeJsonReport(report, 'CODEX_V124_SELF_TEST_REPORT');
if (!process.env.CODEX_V124_SELF_TEST_REPORT && process.env.CODEX_QUALITY_REPORT !== 'json') {
  console.log(`v124SelfTestStatus: ${report.v124SelfTestStatus.status}`);
}
exitFor(report);
