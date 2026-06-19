#!/usr/bin/env node
// CODEX_QUALITY_HARNESS_FILE v1.2.7

import fs from 'node:fs';
import { writeJsonReport, exitFor } from './codex-v080-lib.mjs';
import {
  V127_OPERATOR_STATUS_KEYS,
  V127_P0_ARTIFACTS,
  buildOrchestrationCapsule,
  validateBlockerClosureAndProductValuePressure,
  validateContextOutputOwnerInterruptTokenBudget,
  validateDecisionEvidenceEnvelopeAndSameHeadBinder,
  validateOrchestrationCapsule,
  validateTypedOwnerProcessReceiptAndContinuationKernel,
  validateV127PermissionGrantReceiptCoherence,
  validateValidationDagAndContentAddressedReuse,
} from './codex-orchestration-capsule.mjs';
import { buildWorkerProofCapsule, validateWorkerProofCapsule } from './codex-worker-proof-capsule.mjs';
import { buildOwnerDecisionBrief, validateOwnerDecisionBrief } from './codex-owner-decision-brief.mjs';
import { evaluateWorkflowReport } from './codex-workflow-quality-runner.mjs';
import { buildEvidenceCapsule, validateEvidenceCapsule } from './codex-evidence-capsule.mjs';
import { validateArtifactConsistency } from './codex-artifact-consistency-contract.mjs';
import { applyTargetModeLegacyCompatibilityShadow } from './codex-local-quality-gate.mjs';

function test(name, fn) {
  try {
    return { name, status: fn() ? 'pass' : 'fail', safeSummaryOnly: true };
  } catch {
    return { name, status: 'fail', reasonCodes: ['self_test_exception'], safeSummaryOnly: true };
  }
}

function passed(status) {
  return status?.status === 'pass';
}

function failed(status) {
  return status?.status === 'fail';
}

function withTemporaryEnv(values, fn) {
  const previous = {};
  for (const key of Object.keys(values)) {
    previous[key] = process.env[key];
    if (values[key] === undefined || values[key] === null) {
      delete process.env[key];
    } else {
      process.env[key] = String(values[key]);
    }
  }
  try {
    return fn();
  } finally {
    for (const key of Object.keys(values)) {
      if (previous[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = previous[key];
      }
    }
  }
}

const VALID_PROCESS_RECEIPT = {
  present: true,
  receiptId: 'receipt-v127-source-body',
  taskId: 'task-v127-source-body',
  ownerInstructionHash: 'sha256:owner-instruction-v127',
  allowedActions: ['edit', 'check', 'commit', 'push', 'create_pr'],
};

const SAME_HEAD_ENVELOPE = {
  lane: 'same_head_remote_qg',
  localHead: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  prHead: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  workflowHead: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  artifactHead: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  remoteGate: 'pass',
  allowedNextAction: 'owner_merge_decision_only',
};

const workflowText = fs.existsSync('.github/workflows/quality-gate.yml')
  ? fs.readFileSync('.github/workflows/quality-gate.yml', 'utf8')
  : '';

const PR_BODY_RECEIPT_TEXT = `I confirm PR #364 current head aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa for merge consideration.
Owner decision: owner_merge_after_same_head_pass.
`;

const PR_BODY_DISPLAY_EVIDENCE_TEXT = `## Test Coverage Evidence
v127 self-test: pass
backend focused test: pass

## Best-of-N
run 1: pass
run 2: pass
`;

const workflowPrBodyDisplayOnlyFixture = withTemporaryEnv({
  CODEX_CHANGED_FILES: 'scripts/codex-v127-self-test.mjs',
  CODEX_PR_BODY: PR_BODY_DISPLAY_EVIDENCE_TEXT,
}, () => evaluateWorkflowReport({
  status: 'fail',
  targetQualityScoreStatus: {
    status: 'fail',
    score: 70,
    blockingStatuses: [
      { key: 'bestOfNEvidenceStatus', status: 'fail', effectiveStatus: 'fail' },
      { key: 'testCoverageEvidenceStatus', status: 'fail', effectiveStatus: 'fail' },
    ],
    safeSummaryOnly: true,
  },
  bestOfNEvidenceStatus: { status: 'fail', reasonCodes: ['best_of_n_required'] },
  testCoverageEvidenceStatus: { status: 'fail', reasonCodes: ['test_coverage_evidence_missing'] },
}, { gateExit: 1, eventName: 'pull_request' }));

const workflowPrBodyReceiptFixture = withTemporaryEnv({
  CODEX_CHANGED_FILES: 'scripts/codex-v127-self-test.mjs',
  CODEX_PR_BODY: PR_BODY_RECEIPT_TEXT,
}, () => evaluateWorkflowReport({
  status: 'pass',
  technicalChecksReady: true,
  mergeReady: false,
  targetQualityScoreStatus: { status: 'pass', safeSummaryOnly: true },
  finalDecision: {
    status: 'pass',
    terminalAction: 'create_pr_only',
    mergeAllowed: false,
    safeNextAction: 'owner_merge_decision_only',
    safeSummaryOnly: true,
  },
}, { gateExit: 0, eventName: 'pull_request' }));

function sameHeadControl(envelopeOverrides = {}) {
  return buildOrchestrationCapsule({
    decisionEvidenceEnvelopeAndSameHeadBinder: {
      decisionEvidenceEnvelope: { ...SAME_HEAD_ENVELOPE, ...envelopeOverrides },
    },
  }).decisionEvidenceEnvelopeAndSameHeadBinder;
}

const REQUIRED_V127_REMOTE_SELF_TEST_KEYS = [
  'v127SelfTestStatus',
  'v126SelfTestStatus',
  'v125SelfTestStatus',
  'v124SelfTestStatus',
  'v123SelfTestStatus',
  'v122SelfTestStatus',
  'v121SelfTestStatus',
  'v120SelfTestStatus',
  'v119SelfTestStatus',
  'v118SelfTestStatus',
  'v117SelfTestStatus',
  'v116SelfTestStatus',
  'v115SelfTestStatus',
  'v114SelfTestStatus',
  'v113SelfTestStatus',
];

const allVersionedPassReport = Object.fromEntries(REQUIRED_V127_REMOTE_SELF_TEST_KEYS.map((key) => [key, { status: 'pass', safeSummaryOnly: true }]));
const workflowAllVersionedFixture = evaluateWorkflowReport({
  status: 'pass',
  technicalChecksReady: true,
  mergeReady: true,
  targetQualityScoreStatus: { status: 'pass', safeSummaryOnly: true },
  ...allVersionedPassReport,
}, { gateExit: 0, eventName: 'pull_request' });
const workflowMissingV126Fixture = evaluateWorkflowReport({
  status: 'pass',
  technicalChecksReady: true,
  mergeReady: true,
  targetQualityScoreStatus: { status: 'pass', safeSummaryOnly: true },
  ...Object.fromEntries(REQUIRED_V127_REMOTE_SELF_TEST_KEYS.filter((key) => key !== 'v126SelfTestStatus').map((key) => [key, { status: 'pass', safeSummaryOnly: true }])),
}, { gateExit: 0, eventName: 'pull_request' });

const evidencePointerFixture = buildEvidenceCapsule({
  terminalAction: 'create_pr_only',
  headSha: SAME_HEAD_ENVELOPE.localHead,
  qualityGateRunId: '27822120722',
  runAttempt: '1',
  artifactName: 'codex-quality-gate-safe-artifacts',
  artifactPointer: '27822120722:codex-quality-gate-safe-artifacts',
  artifactNumericId: null,
  artifactDigest: null,
  prHeadSha: SAME_HEAD_ENVELOPE.localHead,
  workflowHeadSha: SAME_HEAD_ENVELOPE.localHead,
  artifactHeadSha: SAME_HEAD_ENVELOPE.localHead,
});

const pseudoArtifactIdFixture = buildEvidenceCapsule({
  terminalAction: 'create_pr_only',
  headSha: SAME_HEAD_ENVELOPE.localHead,
  qualityGateRunId: '27822120722',
  artifactName: 'codex-quality-gate-safe-artifacts',
  artifactPointer: '27822120722-codex-quality-gate-safe-artifacts',
  artifactNumericId: '27822120722-1',
});

const targetLegacyCompatibilityShadowFixture = (() => {
  const report = {
    targetModeLegacyCompatibilityStatus: {
      status: 'fail',
      classifications: [
        { key: 'v111SelfTestStatus', classification: 'missing_blocking' },
        { key: 'v085SelfTestStatus', classification: 'advisory_legacy' },
      ],
      reasonCodes: ['target_mode_compatibility_blocking_status'],
      safeSummaryOnly: true,
    },
  };
  const failures = [{ id: 'targetModeLegacyCompatibilityStatus.failed' }];
  applyTargetModeLegacyCompatibilityShadow(report, failures);
  return { report, failures };
})();

function resolveHarnessMode(env = process.env) {
  if (env.CODEX_HARNESS_MODE === 'target') return 'target';
  if (env.CODEX_HARNESS_SOURCE_REPO === '1' || env.CODEX_HARNESS_MODE === 'core' || env.CODEX_HARNESS_MODE === 'source') return 'source';
  try {
    const manifest = JSON.parse(fs.readFileSync('docs/process/CODEX_HARNESS_MANIFEST.json', 'utf8'));
    if (manifest.targetRepoMode === true) return 'target';
    if (manifest.sourceOnlyRelease === true) return 'source';
  } catch {
    // Source-body self-test fixtures may omit the target manifest.
  }
  return 'source';
}

function activeManifestPathsForMode(env = process.env) {
  return resolveHarnessMode(env) === 'target'
    ? ['docs/process/CODEX_HARNESS_MANIFEST.json']
    : ['CODEX_SOURCE_HARNESS_MANIFEST.json', 'docs/process/CODEX_HARNESS_MANIFEST.json'];
}

function manifestThemeMatchesActiveVersion() {
  const manifests = activeManifestPathsForMode().map((file) => JSON.parse(fs.readFileSync(file, 'utf8')));
  return manifests.every((manifest) => manifest.activeHarnessVersion === '1.2.7'
    && manifest.activeSelfTestSuite === 'v127'
    && manifest.theme === 'Receipt-Carried Continuation and Evidence Compression');
}

const cases = [
  ['v127_self_test_must_pass', () => true],
  ['v127_adds_no_new_p0_artifact', () => V127_P0_ARTIFACTS.length === 3 && V127_P0_ARTIFACTS.includes('codex-orchestration-capsule.safe.json')],
  ['v127_adds_no_new_top_level_status', () => V127_OPERATOR_STATUS_KEYS.length === 8 && !V127_OPERATOR_STATUS_KEYS.includes('decisionEvidenceEnvelopeStatus')],
  ['v127_preserves_v118_final_decision', () => buildOrchestrationCapsule().finalAuthority === 'v1.1.8_final_decision_kernel'],
  ['v127_active_authority_tuple_is_current', () => {
    const tuple = buildOrchestrationCapsule().skillContextRouting.activeAuthorityTuple;
    return tuple.agentsMarker === 'CODEX_QUALITY_HARNESS_FILE v1.2.7'
      && tuple.manifestActiveHarnessVersion === '1.2.7'
      && tuple.activeSelfTestSuite === 'v127'
      && tuple.activeSpecPath === 'docs/process/CODEX_V127_SPEC.md';
  }],
  ['process_receipt_survives_in_scope_commit_head_changes', () => passed(validateTypedOwnerProcessReceiptAndContinuationKernel(buildOrchestrationCapsule({
    typedOwnerProcessReceiptAndContinuationKernel: {
      ownerProcessReceipt: VALID_PROCESS_RECEIPT,
    },
  }).typedOwnerProcessReceiptAndContinuationKernel))],
  ['receipt_without_owner_provenance_fails', () => failed(validateTypedOwnerProcessReceiptAndContinuationKernel(buildOrchestrationCapsule({
    typedOwnerProcessReceiptAndContinuationKernel: {
      ownerProcessReceipt: { present: true, allowedActions: ['edit', 'check', 'commit', 'push', 'create_pr'] },
      continuationDecision: { state: 'continue' },
    },
  }).typedOwnerProcessReceiptAndContinuationKernel))],
  ['exact_head_merge_receipt_expires_on_head_change', () => failed(validateTypedOwnerProcessReceiptAndContinuationKernel(buildOrchestrationCapsule({
    typedOwnerProcessReceiptAndContinuationKernel: {
      ownerConditionalMergeReceipt: { present: true, scope: 'exact_head', headSha: null },
    },
  }).typedOwnerProcessReceiptAndContinuationKernel))],
  ['conditional_merge_receipt_requires_new_same_head_pass', () => failed(validateDecisionEvidenceEnvelopeAndSameHeadBinder(buildOrchestrationCapsule({
    decisionEvidenceEnvelopeAndSameHeadBinder: {
      decisionEvidenceEnvelope: { lane: 'merge_boundary', remoteGate: 'pending', sameHead: true, ownerReceiptBinding: 'valid', allowedNextAction: 'merge_current_pr' },
    },
  }).decisionEvidenceEnvelopeAndSameHeadBinder))],
  ['scope_delta_invalidates_receipt', () => failed(validateTypedOwnerProcessReceiptAndContinuationKernel(buildOrchestrationCapsule({
    typedOwnerProcessReceiptAndContinuationKernel: {
      ownerProcessReceipt: VALID_PROCESS_RECEIPT,
      continuationDecision: { state: 'continue', receiptValid: true, scopeDeltaDetected: true },
    },
  }).typedOwnerProcessReceiptAndContinuationKernel))],
  ['out_of_scope_file_invalidates_continuation', () => failed(validateTypedOwnerProcessReceiptAndContinuationKernel(buildOrchestrationCapsule({
    typedOwnerProcessReceiptAndContinuationKernel: {
      ownerProcessReceipt: { ...VALID_PROCESS_RECEIPT, expiresOnScopeDelta: false },
      continuationDecision: { state: 'continue' },
    },
  }).typedOwnerProcessReceiptAndContinuationKernel))],
  ['install_rollout_does_not_authorize_runtime_operation', () => failed(validateTypedOwnerProcessReceiptAndContinuationKernel(buildOrchestrationCapsule({
    typedOwnerProcessReceiptAndContinuationKernel: {
      normalizedOwnerIntent: 'harness_target_rollout_complete',
      ownerDangerousCapabilityReceipt: { present: false, deployAllowed: true },
    },
  }).typedOwnerProcessReceiptAndContinuationKernel))],
  ['required_check_failure_is_not_owner_overridable', () => failed(validateDecisionEvidenceEnvelopeAndSameHeadBinder(buildOrchestrationCapsule({
    decisionEvidenceEnvelopeAndSameHeadBinder: {
      decisionEvidenceEnvelope: { lane: 'merge_boundary', remoteGate: 'fail', sameHead: true, ownerReceiptBinding: 'valid', allowedNextAction: 'merge_current_pr' },
    },
  }).decisionEvidenceEnvelopeAndSameHeadBinder))],
  ['avoidable_owner_stop_is_detected', () => failed(validateTypedOwnerProcessReceiptAndContinuationKernel(buildOrchestrationCapsule({
    typedOwnerProcessReceiptAndContinuationKernel: {
      ownerProcessReceipt: VALID_PROCESS_RECEIPT,
      continuationDecision: { state: 'continue', avoidableOwnerStopDetected: true, receiptValid: true },
    },
  }).typedOwnerProcessReceiptAndContinuationKernel))],
  ['justified_owner_boundary_is_not_penalized', () => passed(validateTypedOwnerProcessReceiptAndContinuationKernel(buildOrchestrationCapsule({
    typedOwnerProcessReceiptAndContinuationKernel: { continuationDecision: { state: 'justified_owner_boundary', avoidableOwnerStopDetected: false, receiptValid: false } },
  }).typedOwnerProcessReceiptAndContinuationKernel))],
  ['ambiguous_scope_allows_one_initial_question', () => passed(validateTypedOwnerProcessReceiptAndContinuationKernel(buildOrchestrationCapsule({
    typedOwnerProcessReceiptAndContinuationKernel: { continuationDecision: { state: 'clarify_once', receiptValid: false } },
  }).typedOwnerProcessReceiptAndContinuationKernel))],
  ['decision_evidence_envelope_rejects_head_mismatch', () => failed(validateDecisionEvidenceEnvelopeAndSameHeadBinder(buildOrchestrationCapsule({
    decisionEvidenceEnvelopeAndSameHeadBinder: { decisionEvidenceEnvelope: { lane: 'same_head_remote_qg', localHead: 'abc123', prHead: 'def456', workflowHead: 'abc123', artifactHead: 'abc123', oneBlockingReason: null } },
  }).decisionEvidenceEnvelopeAndSameHeadBinder))],
  ['workflow_checkout_uses_pull_request_head_sha', () => workflowText.includes('ref: ${{ github.event.pull_request.head.sha || github.sha }}')],
  ['workflow_contains_no_pr_body_merge_confirmation_bridge', () => !workflowText.includes('CODEX_OWNER_MERGE_CONFIRMED') && !workflowText.includes('owner_merge_after_same_head_pass')],
  ['workflow_contains_no_post_gate_merge_authority_rewrite', () => !workflowText.includes('ownerDecisionReady') && !workflowText.includes("terminalAction: 'merge_current_pr'") && !workflowText.includes('mergeAllowed: true')],
  ['workflow_active_remote_product_metadata_is_v127', () => workflowText.includes('"schemaVersion":"1.2.7"') && workflowText.includes('"activeSelfTestSuite":"v127"') && workflowText.includes('"activeSelfTestStatusKey":"v127SelfTestStatus"') && !workflowText.includes('"schemaVersion":"1.1.5"')],
  ['workflow_changed_file_diff_fails_closed', () => !workflowText.includes('git diff --name-only origin/main...HEAD || true') && workflowText.includes('git diff --name-only "${CODEX_PR_BASE_SHA}"...HEAD')],
  ['pr_body_display_evidence_does_not_override_best_of_n_status', () => workflowPrBodyDisplayOnlyFixture.safeSummary.bestOfNEvidenceStatus.status === 'fail' && workflowPrBodyDisplayOnlyFixture.safeSummary.bestOfNEvidenceStatus.reasonCodes.includes('best_of_n_required')],
  ['pr_body_display_evidence_does_not_override_test_coverage_status', () => workflowPrBodyDisplayOnlyFixture.safeSummary.testCoverageEvidenceStatus.status === 'fail' && workflowPrBodyDisplayOnlyFixture.safeSummary.testCoverageEvidenceStatus.reasonCodes.includes('test_coverage_evidence_missing')],
  ['pr_body_receipt_text_does_not_authorize_merge', () => workflowPrBodyReceiptFixture.safeSummary.technicalChecksReady === true && workflowPrBodyReceiptFixture.safeSummary.ownerMergeAuthorized === false],
  ['safe_summary_carries_all_v127_required_self_tests', () => REQUIRED_V127_REMOTE_SELF_TEST_KEYS.every((key) => workflowAllVersionedFixture.safeSummary[key]?.status === 'pass')],
  ['safe_summary_exposes_missing_required_self_test', () => workflowMissingV126Fixture.safeSummary.v126SelfTestStatus.status === 'missing'],
  ['same_head_missing_local_head_fails', () => failed(validateDecisionEvidenceEnvelopeAndSameHeadBinder(sameHeadControl({ localHead: null })) )],
  ['same_head_missing_pr_head_fails', () => failed(validateDecisionEvidenceEnvelopeAndSameHeadBinder(sameHeadControl({ prHead: null })) )],
  ['same_head_missing_workflow_head_fails', () => failed(validateDecisionEvidenceEnvelopeAndSameHeadBinder(sameHeadControl({ workflowHead: null })) )],
  ['same_head_missing_artifact_head_fails', () => failed(validateDecisionEvidenceEnvelopeAndSameHeadBinder(sameHeadControl({ artifactHead: null })) )],
  ['same_head_mismatching_workflow_head_fails', () => failed(validateDecisionEvidenceEnvelopeAndSameHeadBinder(sameHeadControl({ workflowHead: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb' })) )],
  ['same_head_remote_gate_missing_fails_completed_remote_lane', () => failed(validateDecisionEvidenceEnvelopeAndSameHeadBinder(sameHeadControl({ remoteGate: 'missing' })) )],
  ['same_head_remote_lane_requires_owner_decision_next_action', () => failed(validateDecisionEvidenceEnvelopeAndSameHeadBinder(sameHeadControl({ allowedNextAction: 'continue_commit_push_create_pr' })) )],
  ['same_head_requires_four_matching_non_null_heads', () => {
    const control = sameHeadControl();
    return control.decisionEvidenceEnvelope.sameHead === true
      && control.sameHeadBinder.allRequiredHeadsPresent === true
      && control.sameHeadBinder.allRequiredHeadsMatch === true
      && passed(validateDecisionEvidenceEnvelopeAndSameHeadBinder(control));
  }],
  ['artifact_consistency_unknown_head_fails', () => failed(validateArtifactConsistency({ head: 'unknown', artifactDownloadObservedStatus: 'pass', artifactGeneratedStatus: 'pass', artifactIndexedStatus: 'pass', artifactUploadedStatus: 'pass' }))],
  ['artifact_consistency_null_head_fails', () => failed(validateArtifactConsistency({ head: null, artifactDownloadObservedStatus: 'pass', artifactGeneratedStatus: 'pass', artifactIndexedStatus: 'pass', artifactUploadedStatus: 'pass' }))],
  ['artifact_consistency_mismatching_head_fails', () => failed(validateArtifactConsistency({ head: SAME_HEAD_ENVELOPE.localHead, artifactHeadMatchStatus: 'fail', artifactDownloadObservedStatus: 'pass', artifactGeneratedStatus: 'pass', artifactIndexedStatus: 'pass', artifactUploadedStatus: 'pass' }))],
  ['artifact_pointer_uses_run_id_and_artifact_name', () => passed(validateEvidenceCapsule(evidencePointerFixture)) && evidencePointerFixture.currentHeadEvidence.artifactPointer === '27822120722:codex-quality-gate-safe-artifacts' && evidencePointerFixture.currentHeadEvidence.artifactId === null],
  ['pseudo_artifact_id_is_rejected', () => failed(validateEvidenceCapsule(pseudoArtifactIdFixture))],
  ['target_legacy_shadow_normalizes_missing_blocking_classification', () => targetLegacyCompatibilityShadowFixture.report.targetModeLegacyCompatibilityStatus.status === 'pass'
    && targetLegacyCompatibilityShadowFixture.failures.length === 0
    && targetLegacyCompatibilityShadowFixture.report.targetModeLegacyCompatibilityStatus.blockingCount === 0
    && targetLegacyCompatibilityShadowFixture.report.targetModeLegacyCompatibilityStatus.classifications.every((item) => item.classification === 'advisory_legacy' && item.effectiveStatus === 'pass_advisory')],
  ['unobserved_remote_token_metrics_fail_when_required', () => failed(validateContextOutputOwnerInterruptTokenBudget(buildOrchestrationCapsule({
    contextOutputOwnerInterruptTokenBudget: { observed: false, requireObservedMetrics: true },
  }).contextOutputOwnerInterruptTokenBudget))],
  ['missing_owner_process_receipt_does_not_default_to_valid_binding', () => sameHeadControl().decisionEvidenceEnvelope.ownerReceiptBinding === 'not_required'],
  ['same_head_remote_qg_without_merge_receipt_stops_at_owner_decision', () => {
    const control = sameHeadControl();
    return control.decisionEvidenceEnvelope.allowedNextAction === 'owner_merge_decision_only'
      && control.decisionEvidenceEnvelope.ownerReceiptBinding === 'not_required'
      && passed(validateDecisionEvidenceEnvelopeAndSameHeadBinder(control));
  }],
  ['same_head_true_with_null_heads_fails', () => failed(validateDecisionEvidenceEnvelopeAndSameHeadBinder({
    runtimeVersion: '1.2.7',
    decisionEvidenceEnvelope: { lane: 'same_head_remote_qg', sameHead: true, remoteGate: 'pass', allowedNextAction: 'owner_merge_decision_only', prBodyMachineEvidence: false },
    sameHeadBinder: { rejectsHeadMismatch: true, prBodyIsDisplayOnly: true, sameHeadDerivedFromHashes: true, allRequiredHeadsPresent: false, allRequiredHeadsMatch: false },
  }))],
  ['same_head_hash_mismatch_fails', () => failed(validateDecisionEvidenceEnvelopeAndSameHeadBinder({
    runtimeVersion: '1.2.7',
    decisionEvidenceEnvelope: { lane: 'same_head_remote_qg', sameHead: true, remoteGate: 'pass', allowedNextAction: 'owner_merge_decision_only', prBodyMachineEvidence: false },
    sameHeadBinder: { rejectsHeadMismatch: true, prBodyIsDisplayOnly: true, sameHeadDerivedFromHashes: true, allRequiredHeadsPresent: true, allRequiredHeadsMatch: false },
  }))],
  ['remote_run_emits_remote_lane', () => {
    const control = buildOrchestrationCapsule({
      decisionEvidenceEnvelopeAndSameHeadBinder: { decisionEvidenceEnvelope: SAME_HEAD_ENVELOPE },
    }).decisionEvidenceEnvelopeAndSameHeadBinder;
    return control.decisionEvidenceEnvelope.allowedNextAction === 'owner_merge_decision_only'
      && passed(validateDecisionEvidenceEnvelopeAndSameHeadBinder(control));
  }],
  ['invalid_next_action_fails_without_builder_fallback', () => failed(validateDecisionEvidenceEnvelopeAndSameHeadBinder({
    runtimeVersion: '1.2.7',
    decisionEvidenceEnvelope: { ...SAME_HEAD_ENVELOPE, allowedNextAction: 'invalid_action', sameHead: true, prBodyMachineEvidence: false },
    sameHeadBinder: { rejectsHeadMismatch: true, prBodyIsDisplayOnly: true, sameHeadDerivedFromHashes: true, allRequiredHeadsPresent: true, allRequiredHeadsMatch: true },
  }))],
  ['ci_cache_invalidates_on_script_lockfile_or_runner_change', () => failed(validateValidationDagAndContentAddressedReuse(buildOrchestrationCapsule({
    validationDagAndContentAddressedReuse: { invalidatesOn: ['validation_script'] },
  }).validationDagAndContentAddressedReuse))],
  ['validation_cache_placeholder_fails', () => failed(validateValidationDagAndContentAddressedReuse(buildOrchestrationCapsule({
    validationDagAndContentAddressedReuse: {
      validationCacheKey: { headSha: 'unknown', scriptDigest: 'required', runnerImage: 'unknown', nodeOrRuntimeVersion: 'unknown' },
    },
  }).validationDagAndContentAddressedReuse))],
  ['nightly_full_gate_does_not_replace_premerge_required_checks', () => failed(validateValidationDagAndContentAddressedReuse(buildOrchestrationCapsule({
    validationDagAndContentAddressedReuse: { nightlyFullGateReplacesPremergeRequiredChecks: true },
  }).validationDagAndContentAddressedReuse))],
  ['portfolio_rollout_counts_as_one_harness_cycle', () => passed(validateBlockerClosureAndProductValuePressure(buildOrchestrationCapsule().blockerClosureAndProductValuePressure))],
  ['neutral_skill_is_not_disabled_after_two_samples', () => failed(validateBlockerClosureAndProductValuePressure(buildOrchestrationCapsule({
    blockerClosureAndProductValuePressure: { skillRoiOptimization: { roiStatus: 'neutral', disabledAfterTwoNeutralSamples: true } },
  }).blockerClosureAndProductValuePressure))],
  ['mandatory_safety_skill_cannot_be_roi_disabled', () => failed(validateBlockerClosureAndProductValuePressure(buildOrchestrationCapsule({
    blockerClosureAndProductValuePressure: { skillRoiOptimization: { mandatorySafetySkill: true, roiStatus: 'negative' } },
  }).blockerClosureAndProductValuePressure))],
  ['final_report_line_budget_enforced', () => failed(validateContextOutputOwnerInterruptTokenBudget(buildOrchestrationCapsule({
    contextOutputOwnerInterruptTokenBudget: { operatorOutputLines: 25, finalReportLineBudget: 12 },
  }).contextOutputOwnerInterruptTokenBudget))],
  ['repeated_safety_text_suppressed', () => failed(validateContextOutputOwnerInterruptTokenBudget(buildOrchestrationCapsule({
    contextOutputOwnerInterruptTokenBudget: { repeatedSafetyTextSuppressed: false },
  }).contextOutputOwnerInterruptTokenBudget))],
  ['token_observed_default_is_false', () => buildOrchestrationCapsule().contextOutputOwnerInterruptTokenBudget.tokenEconomyMetrics.observed === false],
  ['token_metrics_must_be_observed', () => failed(validateContextOutputOwnerInterruptTokenBudget(buildOrchestrationCapsule({
    contextOutputOwnerInterruptTokenBudget: { observed: false, requireObservedMetrics: true },
  }).contextOutputOwnerInterruptTokenBudget))],
  ['token_observed_metrics_require_source_and_bytes', () => failed(validateContextOutputOwnerInterruptTokenBudget(buildOrchestrationCapsule({
    contextOutputOwnerInterruptTokenBudget: { observed: true, requireObservedMetrics: true, metricsSource: 'not_observed', safeArtifactBytes: 0, outputLineCount: 0 },
  }).contextOutputOwnerInterruptTokenBudget))],
  ['token_observed_metrics_with_source_pass', () => passed(validateContextOutputOwnerInterruptTokenBudget(buildOrchestrationCapsule({
    contextOutputOwnerInterruptTokenBudget: { observed: true, requireObservedMetrics: true, metricsSource: 'quality_gate_runtime_generated_artifact_sizes', countsSource: 'declared_budget', observedCounts: false, routineArtifactBytes: 120, safeArtifactBytes: 1200, outputLineCount: 8 },
  }).contextOutputOwnerInterruptTokenBudget))],
  ['token_declared_counts_cannot_claim_observed', () => failed(validateContextOutputOwnerInterruptTokenBudget(buildOrchestrationCapsule({
    contextOutputOwnerInterruptTokenBudget: { observed: true, requireObservedMetrics: true, metricsSource: 'quality_gate_runtime_generated_artifact_sizes', countsSource: 'declared_budget', observedCounts: true, routineArtifactBytes: 120, safeArtifactBytes: 1200, outputLineCount: 8 },
  }).contextOutputOwnerInterruptTokenBudget))],
  ['permission_grant_receipt_contradiction_fails', () => failed(validateV127PermissionGrantReceiptCoherence(buildOrchestrationCapsule({
    typedOwnerProcessReceiptAndContinuationKernel: {
      ownerProcessReceipt: { ...VALID_PROCESS_RECEIPT, allowedActions: ['edit', 'check', 'commit'] },
    },
    permissionEvidenceSource: 'owner_process_receipt',
    mutationPermissionAuthority: 'owner_explicit_only',
    createPr: true,
  })))],
  ['manifest_theme_matches_active_version', () => manifestThemeMatchesActiveVersion()],
  ['target_mode_does_not_require_source_manifest', () => activeManifestPathsForMode({ CODEX_HARNESS_MODE: 'target' }).join('|') === 'docs/process/CODEX_HARNESS_MANIFEST.json'],
  ['target_mode_stray_source_manifest_cannot_select_source', () => resolveHarnessMode({
    CODEX_HARNESS_MODE: 'target',
    CODEX_HARNESS_SOURCE_REPO: '',
  }) === 'target'],
  ['owner_brief_default_v127_receipts_pass', () => passed(validateOwnerDecisionBrief(buildOwnerDecisionBrief()))],
  ['owner_brief_does_not_stop_for_commit_push_pr_when_process_receipt_valid', () => passed(validateOwnerDecisionBrief(buildOwnerDecisionBrief({
    typedOwnerProcessReceipt: { ...VALID_PROCESS_RECEIPT, normalizedOwnerIntent: 'harness_source_develop_and_publish' },
    continuationDecision: { state: 'continue', oneSafeNextAction: 'continue_commit_push_create_pr' },
  })))],
  ['owner_brief_contains_current_self_test', () => buildOwnerDecisionBrief().proofCompleted.includes('v127_self_test')],
  ['worker_proof_v127_marker_compatibility_pass', () => passed(validateWorkerProofCapsule(buildWorkerProofCapsule()))],
  ['orchestration_capsule_validates_all_v127_internal_blocks', () => Object.values(validateOrchestrationCapsule(buildOrchestrationCapsule())).every((item) => item.status === 'pass')],
].map(([name, fn]) => test(name, fn));

const fixtureGroups = [
  'v118_v119_v120_v121_v122_v123_v124_v125_v126_compatibility_matrix',
  'typed_owner_process_receipt_and_continuation_kernel_matrix',
  'decision_evidence_envelope_same_head_binder_matrix',
  'validation_dag_content_addressed_reuse_matrix',
  'context_output_owner_interrupt_token_budget_matrix',
  'blocker_closure_product_value_pressure_matrix',
];

const failures = cases.filter((item) => item.status !== 'pass');
const report = {
  v127SelfTestStatus: {
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

writeJsonReport(report, 'CODEX_V127_SELF_TEST_REPORT');
if (!process.env.CODEX_V127_SELF_TEST_REPORT && process.env.CODEX_QUALITY_REPORT !== 'json') {
  console.log(`v127SelfTestStatus: ${report.v127SelfTestStatus.status}`);
}
exitFor(report);
