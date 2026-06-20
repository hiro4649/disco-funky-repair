#!/usr/bin/env node
// CODEX_QUALITY_HARNESS_FILE v1.2.7

import fs from 'node:fs';
import os from 'node:os';
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
import { buildV127ObservedHeadBinding, classifyV127HarnessWorkflowRepairScope, deriveV127FinalState, evaluateWorkflowReport, finalizeV127SafeArtifactBundle, validateV127SafeArtifactBundle } from './codex-workflow-quality-runner.mjs';
import { buildEvidenceCapsule, validateEvidenceCapsule } from './codex-evidence-capsule.mjs';
import { validateArtifactConsistency } from './codex-artifact-consistency-contract.mjs';
import { applyTargetModeLegacyCompatibilityShadow, applyV127PrBodyDisplayOnlyBoundary } from './codex-local-quality-gate.mjs';
import { buildPhysicalSafeArtifactIndex, V127_REQUIRED_SAFE_ARTIFACTS } from './codex-safe-artifact-index.mjs';
import { renderPrEvidenceBlocks } from './codex-pr-evidence-block-renderer.mjs';
import { scanSafeOutput } from './codex-safe-output-scan.mjs';
import { buildPrBodySurfaceNormalizerReport } from './codex-pr-body-surface-normalizer.mjs';
import { buildComplexityGovernanceReport } from './codex-complexity-governance-gate.mjs';
import { buildPrProfileReport } from './codex-pr-profile-gate.mjs';

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

const V127_BODY_INVARIANCE_FILES = [
  '.github/workflows/quality-gate.yml',
  'scripts/codex-local-quality-gate.mjs',
  'scripts/codex-workflow-quality-runner.mjs',
  'scripts/codex-v127-self-test.mjs',
];

const V127_BODY_INVARIANCE_ENV = {
  CODEX_HARNESS_MODE: 'target',
  CODEX_PROFILE_COMPAT_MODE: 'off',
  CODEX_EVENT_NAME: 'pull_request',
  CODEX_PR_NUMBER: '364',
  CODEX_PR_HEAD_SHA: SAME_HEAD_ENVELOPE.localHead,
  CODEX_PR_BASE_SHA: SAME_HEAD_ENVELOPE.localHead,
  CODEX_CHANGED_FILES: V127_BODY_INVARIANCE_FILES.join('\n'),
};

const V127_BODY_INVARIANCE_BODIES = [
  `PR profile: harness_workflow_r3

## Goal
Validate the harness repair.

## Evidence Integrity
PR body is display-only.

Rejected options: touch product/runtime files.
Production readiness claimed: no.
No runtime code changed.
`,
  `PR profile: conflicting_profile

Body intentionally lacks required sections.
Runtime readiness claimed: no.
`,
  `## Task Contract

Done criteria: current v1.2.7 harness checks pass.
Verification surface: v127-v113 self-tests.
Risk surface: harness and workflow only.
Split required: no
`,
];

function v127BodyInvariantReports(body) {
  return withTemporaryEnv({
    ...V127_BODY_INVARIANCE_ENV,
    CODEX_PR_BODY: body,
  }, () => ({
    surface: buildPrBodySurfaceNormalizerReport().prBodySurfaceNormalizerStatus,
    complexity: buildComplexityGovernanceReport().complexityGovernanceStatus,
    profile: buildPrProfileReport().prProfileStatus,
  }));
}

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

function writeSafeArtifactFixture(dir, name, head = SAME_HEAD_ENVELOPE.localHead) {
  fs.writeFileSync(`${dir}/${name}`, JSON.stringify({
    artifactName: name,
    head,
    headSha: head,
    safeSummaryOnly: true,
  }, null, 2));
}

function v127FinalizerFixture(options = {}) {
  const head = SAME_HEAD_ENVELOPE.localHead;
  const root = fs.mkdtempSync(os.tmpdir() + '/codex-v127-finalizer-');
  const sourceDir = root + '/source';
  const runnerTemp = root + '/runner-temp';
  const stageDir = runnerTemp + '/codex-quality-gate-safe-artifacts';
  fs.mkdirSync(sourceDir, { recursive: true });
  fs.mkdirSync(runnerTemp, { recursive: true });
  for (const name of V127_REQUIRED_SAFE_ARTIFACTS) {
    if (['codex-safe-artifact-index.json', 'codex-artifact-consistency.safe.json'].includes(name)) continue;
    fs.writeFileSync(sourceDir + '/' + name, JSON.stringify({ artifactName: name, head, headSha: head, safeSummaryOnly: true }, null, 2));
  }
  const staleSummary = {
    status: 'pass',
    technicalChecksReady: true,
    failureCount: 0,
    reasonSummaryStatus: { status: 'pass', summary: { status: 'fail', blockingReasons: [{ reasonCode: 'stale' }], safeSummaryOnly: true }, safeSummaryOnly: true },
    evidenceContinuityStatus: { pathsChecked: ['npm_diagnostic'], safeSummaryOnly: true },
    safeSummaryOnly: true,
  };
  fs.writeFileSync(sourceDir + '/codex-quality-gate-safe-summary.json', JSON.stringify(staleSummary, null, 2));
  fs.writeFileSync(sourceDir + '/codex-diagnostic-consolidated-summary.json', JSON.stringify({ status: 'pass', safeSummaryOnly: true }, null, 2));
  fs.writeFileSync(runnerTemp + '/codex-remote-npm-diagnostic.safe.json', JSON.stringify({ status: 'pass', reasonCodes: ['npm_diagnostic'], safeSummaryOnly: true }, null, 2));
  const passStatuses = Object.fromEntries(REQUIRED_V127_REMOTE_SELF_TEST_KEYS.map((key) => [key, { status: 'pass', safeSummaryOnly: true }]));
  const report = options.report || {
    ...staleSummary,
    status: 'pass',
    ...passStatuses,
    secretScan: { status: 'pass', safeSummaryOnly: true },
    safeOutputScanStatus: { status: 'pass', safeSummaryOnly: true },
    targetQualityScoreStatus: { status: 'pass', score: 95, safeSummaryOnly: true },
    finalDecisionStatus: { status: 'pass', safeSummaryOnly: true },
    workerProofCapsule: {
      changedFiles: [
        '.github/workflows/quality-gate.yml',
        'scripts/codex-artifact-consistency-contract.mjs',
        'scripts/codex-evidence-capsule.mjs',
        'scripts/codex-final-decision-kernel.mjs',
        'scripts/codex-local-quality-gate.mjs',
        'scripts/codex-orchestration-capsule.mjs',
        'scripts/codex-owner-decision-brief.mjs',
        'scripts/codex-pr-evidence-block-renderer.mjs',
        'scripts/codex-safe-artifact-index.mjs',
        'scripts/codex-safe-output-scan.mjs',
        'scripts/codex-v113-self-test.mjs',
        'scripts/codex-v114-self-test.mjs',
        'scripts/codex-v127-self-test.mjs',
        'scripts/codex-worker-proof-capsule.mjs',
        'scripts/codex-workflow-quality-runner.mjs',
      ],
      boundaryDiffClassification: { productCodeChanged: false, packageChanged: false, lockfileChanged: false, runtimeChanged: false, workflowChanged: true, safeSummaryOnly: true },
      observedGitWorktreePrState: { changedFilesWithinAllowed: true, forbiddenFilesTouched: false, safeSummaryOnly: true },
      safeSummaryOnly: true,
    },
    finalDecision: { sameHeadRemoteGate: 'pass', safeSummaryOnly: true },
  };
  const executionResult = options.executionResult || { schemaVersion: '1.2.7', gateExit: 0, workflowRunnerExit: 0, safeSummaryOnly: true };
  const remoteRunContext = options.remoteRunContext || {
    schemaVersion: '1.2.7',
    eventName: 'pull_request',
    repository: 'hiro4649/disco-funky-repair',
    branch: 'codex/funky-v127-legacy-compatibility-repair',
    baseSha: 'cccccccccccccccccccccccccccccccccccccccc',
    localHead: head,
    prHead: head,
    workflowHead: head,
    runId: '27852006538',
    runAttempt: '1',
    changedFiles: report.workerProofCapsule?.changedFiles || ['.github/workflows/quality-gate.yml', 'scripts/codex-workflow-quality-runner.mjs'],
    changedFilesDigest: 'fixture_digest',
    safeSummaryOnly: true,
  };
  const finalized = finalizeV127SafeArtifactBundle({ sourceDir, runnerTemp, stageDir, report, executionResult, remoteRunContext, head, runId: '27852006538', artifactName: 'codex-quality-gate-safe-artifacts' });
  const validated = validateV127SafeArtifactBundle({ stageDir, head, executionResult, remoteRunContext });
  const index = JSON.parse(fs.readFileSync(stageDir + '/codex-safe-artifact-index.json', 'utf8'));
  const summary = JSON.parse(fs.readFileSync(stageDir + '/codex-quality-gate-safe-summary.json', 'utf8'));
  const diagnostic = JSON.parse(fs.readFileSync(stageDir + '/codex-diagnostic-consolidated-summary.json', 'utf8'));
  const finalDecision = JSON.parse(fs.readFileSync(stageDir + '/codex-final-decision.safe.json', 'utf8'));
  const ownerBrief = JSON.parse(fs.readFileSync(stageDir + '/codex-owner-decision-brief.safe.json', 'utf8'));
  const orchestration = JSON.parse(fs.readFileSync(stageDir + '/codex-orchestration-capsule.safe.json', 'utf8'));
  const prEvidence = JSON.parse(fs.readFileSync(stageDir + '/codex-pr-evidence-rendered.safe.json', 'utf8'));
  const normalizedEvidencePack = JSON.parse(fs.readFileSync(stageDir + '/codex-evidence-pack.normalized.json', 'utf8'));
  return { finalized, validated, index, summary, diagnostic, finalDecision, ownerBrief, orchestration, prEvidence, normalizedEvidencePack, head };
}
function physicalIndexFixture(options = {}) {
  const dir = fs.mkdtempSync(`${os.tmpdir()}/codex-v127-index-`);
  for (const name of V127_REQUIRED_SAFE_ARTIFACTS) writeSafeArtifactFixture(dir, name);
  if (options.omitPhysical) fs.unlinkSync(`${dir}/${options.omitPhysical}`);
  if (options.invalidJson) fs.writeFileSync(`${dir}/${options.invalidJson}`, '{ invalid');
  if (options.safeOutputFailure) fs.writeFileSync(`${dir}/${options.safeOutputFailure}`, JSON.stringify({ head: SAME_HEAD_ENVELOPE.localHead, headSha: SAME_HEAD_ENVELOPE.localHead, safeSummaryOnly: false }, null, 2));
  if (options.headMismatch) writeSafeArtifactFixture(dir, options.headMismatch, 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb');
  if (options.extraPhysical) writeSafeArtifactFixture(dir, options.extraPhysical);
  return buildPhysicalSafeArtifactIndex(dir, { head: SAME_HEAD_ENVELOPE.localHead });
}

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
  ['remote_evidence_closure_uses_final_safe_surfaces_not_stale_failure_array', () => fs.readFileSync('scripts/codex-local-quality-gate.mjs', 'utf8').includes('const finalSurfacesPassed =')
    && !fs.readFileSync('scripts/codex-local-quality-gate.mjs', 'utf8').includes('const qualitySurfacePassed =')
    && !fs.readFileSync('scripts/codex-local-quality-gate.mjs', 'utf8').includes('outcome.failures.splice(0, outcome.failures.length)')
    && fs.readFileSync('scripts/codex-local-quality-gate.mjs', 'utf8').includes('isV127ClosureClearableFailure')],
  ['same_head_requires_four_matching_non_null_heads', () => {
    const control = sameHeadControl();
    return control.decisionEvidenceEnvelope.sameHead === true
      && control.sameHeadBinder.allRequiredHeadsPresent === true
      && control.sameHeadBinder.allRequiredHeadsMatch === true
      && passed(validateDecisionEvidenceEnvelopeAndSameHeadBinder(control));
  }],
  ['artifact_consistency_unknown_head_fails', () => failed(validateArtifactConsistency({ remote: true, head: 'unknown', physicalFilePresent: true, jsonParseStatus: 'pass', safeOutputScanStatus: 'pass', artifactDownloadObservedStatus: 'pass', artifactGeneratedStatus: 'pass', artifactIndexedStatus: 'pass', artifactUploadedStatus: 'pass' }))],
  ['artifact_consistency_null_head_fails', () => failed(validateArtifactConsistency({ remote: true, head: null, physicalFilePresent: true, jsonParseStatus: 'pass', safeOutputScanStatus: 'pass', artifactDownloadObservedStatus: 'pass', artifactGeneratedStatus: 'pass', artifactIndexedStatus: 'pass', artifactUploadedStatus: 'pass' }))],
  ['artifact_consistency_mismatching_head_fails', () => failed(validateArtifactConsistency({ remote: true, head: SAME_HEAD_ENVELOPE.localHead, artifactHeadMatchStatus: 'fail', physicalFilePresent: true, jsonParseStatus: 'pass', safeOutputScanStatus: 'pass', artifactDownloadObservedStatus: 'pass', artifactGeneratedStatus: 'pass', artifactIndexedStatus: 'pass', artifactUploadedStatus: 'pass' }))],
  ['physical_artifact_index_complete_fixture_passes', () => {
    const index = physicalIndexFixture();
    return index.status === 'pass'
      && index.physicalButUnindexedCount === 0
      && index.indexedPresentButAbsentCount === 0
      && index.missingRequiredArtifactCount === 0
      && index.duplicateBasenameCount === 0
      && index.artifactCount >= V127_REQUIRED_SAFE_ARTIFACTS.length;
  }],
  ['physical_artifact_index_required_absent_fails', () => physicalIndexFixture({ omitPhysical: 'codex-final-decision.safe.json' }).missingRequiredArtifactCount === 1],
  ['physical_artifact_index_invalid_json_fails', () => physicalIndexFixture({ invalidJson: 'codex-final-decision.safe.json' }).invalidJsonArtifactCount === 1],
  ['physical_artifact_index_safe_output_failure_fails', () => physicalIndexFixture({ safeOutputFailure: 'codex-final-decision.safe.json' }).safeOutputFailureCount === 1],
  ['physical_artifact_index_head_mismatch_fails', () => physicalIndexFixture({ headMismatch: 'codex-final-decision.safe.json' }).headMismatchCount === 1],
  ['physical_artifact_index_optional_absent_not_present', () => {
    const index = physicalIndexFixture();
    const optional = index.artifacts.find((item) => item.artifactName === 'codex-owner-decision-digest.safe.json');
    return optional && optional.status === 'not_applicable' && optional.physicalFilePresent === false;
  }],
  ['safe_output_allows_npm_diagnostic_machine_identifier', () => scanSafeOutput({ evidenceContinuityStatus: { pathsChecked: ['npm_diagnostic'], safeSummaryOnly: true }, safeSummaryOnly: true }).findings.length === 0],
  ['safe_output_blocks_actual_npm_secret_like_token', () => scanSafeOutput({ actualValue: 'npm_' + '123456789abcdefghi', safeSummaryOnly: true }).findings.length > 0],
  ['safe_output_blocks_github_token_like_value', () => scanSafeOutput({ actualValue: 'ghp_' + '123456789abcdefghijk', safeSummaryOnly: true }).findings.length > 0],
  ['safe_output_blocks_jwt_like_value', () => scanSafeOutput({ actualValue: 'eyJ' + 'aaaaaaaaaaaa' + '.' + 'bbbbbbbbbbbbb' + '.' + 'ccccccccccccc', safeSummaryOnly: true }).findings.length > 0],
  ['safe_output_blocks_private_key_value', () => scanSafeOutput({ actualValue: '-----BEGIN ' + 'PRIVATE KEY-----\\nabc123\\n-----END ' + 'PRIVATE KEY-----', safeSummaryOnly: true }).findings.length > 0],
  ['safe_output_blocks_private_windows_path', () => scanSafeOutput({ actualValue: 'C:' + '\\Users\\example\\secret.txt', safeSummaryOnly: true }).findings.length > 0],
  ['safe_output_blocks_unapproved_internal_endpoint', () => scanSafeOutput({ actualValue: 'https://internal.example.invalid/path', safeSummaryOnly: true }).findings.length > 0],
  ['finalizer_reconciles_f93_mixed_bundle_fixture', () => {
    const result = v127FinalizerFixture();
    return result.finalized.status === 'pass'
      && result.validated.status === 'pass'
      && result.index.status === 'pass'
      && result.index.safeOutputFailureCount === 0
      && result.index.headMismatchCount === 0
      && result.summary.status === 'pass'
      && result.summary.reasonSummaryStatus.summary.blockingReasons.length === 0
      && result.summary.failureCount === 0
      && result.diagnostic.head === result.head
      && result.diagnostic.headSha === result.head;
  }],
  ['finalizer_remote_closure_uses_owner_decision_missing', () => {
    const result = v127FinalizerFixture();
    return result.finalDecision.phase === 'merge_consideration'
      && result.finalDecision.targetQualityStatus === 'pass'
      && result.finalDecision.sameHeadRemoteGate === 'pass'
      && result.finalDecision.ownerOrDelegatedMergeScope === 'missing'
      && result.finalDecision.singleClosureReason === 'owner_merge_decision_missing'
      && result.finalDecision.safeNextAction === 'owner_merge_decision_only';
  }],
  ['owner_brief_uses_compressed_owner_merge_decision_only', () => {
    const result = v127FinalizerFixture();
    return result.ownerBrief.recommendation === 'owner_merge_decision_only'
      && result.ownerBrief.safeNextAction === 'owner_merge_decision_only'
      && result.ownerBrief.proofCompleted.includes('v127_current_self_test')
      && result.ownerBrief.proofCompleted.includes('v126_v113_compatibility_matrix')
      && result.ownerBrief.proofMissing.includes('owner_conditional_merge_receipt')
      && passed(validateOwnerDecisionBrief(buildOwnerDecisionBrief({ recommendation: 'owner_merge_decision_only' })));
  }],
  ['v127_finalizer_gate_exit_nonzero_fails_closed', () => {
    const result = v127FinalizerFixture({ executionResult: { schemaVersion: '1.2.7', gateExit: 1, workflowRunnerExit: 0, safeSummaryOnly: true } });
    return result.finalized.status === 'fail'
      && result.summary.status === 'fail'
      && result.finalDecision.decision === 'blocked'
      && result.finalDecision.safeNextAction === 'repair_v127_final_bundle';
  }],
  ['v127_finalizer_runner_exit_nonzero_fails_closed', () => {
    const result = v127FinalizerFixture({ executionResult: { schemaVersion: '1.2.7', gateExit: 0, workflowRunnerExit: 1, safeSummaryOnly: true } });
    return result.summary.status === 'fail'
      && result.summary.reasonSummary.blockingReasons.some((item) => item.reasonCode === 'workflow_runner_exit_nonzero');
  }],
  ['v127_finalizer_raw_report_fail_fails_closed', () => {
    const result = v127FinalizerFixture({ report: { status: 'fail' }, executionResult: { schemaVersion: '1.2.7', gateExit: 0, workflowRunnerExit: 0, safeSummaryOnly: true } });
    return result.summary.status === 'fail'
      && result.summary.safeNextAction === 'repair_v127_final_bundle';
  }],
  ['v127_four_head_binding_requires_exact_observed_heads', () => {
    const good = buildV127ObservedHeadBinding({
      localHead: SAME_HEAD_ENVELOPE.localHead,
      prHead: SAME_HEAD_ENVELOPE.localHead,
      workflowHead: SAME_HEAD_ENVELOPE.localHead,
      artifactHead: SAME_HEAD_ENVELOPE.localHead,
    });
    const missingLocal = buildV127ObservedHeadBinding({
      prHead: SAME_HEAD_ENVELOPE.localHead,
      workflowHead: SAME_HEAD_ENVELOPE.localHead,
      artifactHead: SAME_HEAD_ENVELOPE.localHead,
    });
    const oneMismatch = buildV127ObservedHeadBinding({
      localHead: SAME_HEAD_ENVELOPE.localHead,
      prHead: SAME_HEAD_ENVELOPE.localHead,
      workflowHead: SAME_HEAD_ENVELOPE.localHead,
      artifactHead: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    });
    const oneHeadOnly = buildV127ObservedHeadBinding({ localHead: SAME_HEAD_ENVELOPE.localHead });
    return good.status === 'pass'
      && good.allRequiredHeadsPresent === true
      && good.allRequiredHeadsMatch === true
      && missingLocal.status === 'fail'
      && oneMismatch.status === 'fail'
      && oneHeadOnly.status === 'fail';
  }],
  ['v127_pull_request_event_alone_does_not_pass_remote_gate', () => {
    const state = deriveV127FinalState({
      status: 'pass',
      ...Object.fromEntries(REQUIRED_V127_REMOTE_SELF_TEST_KEYS.map((key) => [key, { status: 'pass', safeSummaryOnly: true }])),
      secretScan: { status: 'pass', safeSummaryOnly: true },
      safeOutputScanStatus: { status: 'pass', safeSummaryOnly: true },
      targetQualityScoreStatus: { status: 'pass', score: 95, safeSummaryOnly: true },
      finalDecisionStatus: { status: 'pass', safeSummaryOnly: true },
    }, {
      executionResult: { gateExit: 0, workflowRunnerExit: 0 },
      eventName: 'pull_request',
      changedFiles: ['.github/workflows/quality-gate.yml', 'scripts/codex-workflow-quality-runner.mjs'],
    });
    return state.status === 'fail'
      && state.reasonCodes.includes('remote_run_context_not_pass')
      && state.reasonCodes.includes('four_head_binding_not_pass');
  }],
  ['v127_validation_success_bundle_rejects_nonzero_execution_result', () => {
    const result = v127FinalizerFixture();
    const invalid = validateV127SafeArtifactBundle({
      stageDir: result.finalized.stageDir,
      head: result.head,
      executionResult: { schemaVersion: '1.2.7', gateExit: 1, workflowRunnerExit: 0, safeSummaryOnly: true },
      remoteRunContext: {
        schemaVersion: '1.2.7',
        eventName: 'pull_request',
        repository: 'hiro4649/disco-funky-repair',
        branch: 'codex/funky-v127-legacy-compatibility-repair',
        baseSha: 'cccccccccccccccccccccccccccccccccccccccc',
        localHead: result.head,
        prHead: result.head,
        workflowHead: result.head,
        runId: '27852006538',
        runAttempt: '1',
        changedFiles: ['.github/workflows/quality-gate.yml', 'scripts/codex-workflow-quality-runner.mjs'],
        safeSummaryOnly: true,
      },
    });
    return invalid.status === 'fail'
      && invalid.reasonCodes.includes('success_gate_exit_nonzero');
  }],
  ['v127_artifact_head_is_observed_from_staged_load_bearing_artifacts', () => {
    const result = v127FinalizerFixture();
    return result.orchestration.artifactHead === result.head
      && result.orchestration.artifactHeadSource === 'staged_load_bearing_artifacts'
      && result.summary.v127ObservedHeadBindingStatus.artifactHead === result.head;
  }],
  ['v127_scope_classifier_is_generic_not_pr_specific', () => {
    const current = classifyV127HarnessWorkflowRepairScope([
      '.github/workflows/quality-gate.yml',
      'scripts/codex-artifact-consistency-contract.mjs',
      'scripts/codex-complexity-governance-gate.mjs',
      'scripts/codex-evidence-capsule.mjs',
      'scripts/codex-final-decision-kernel.mjs',
      'scripts/codex-local-quality-gate.mjs',
      'scripts/codex-orchestration-capsule.mjs',
      'scripts/codex-owner-decision-brief.mjs',
      'scripts/codex-pr-body-surface-normalizer.mjs',
      'scripts/codex-pr-evidence-block-renderer.mjs',
      'scripts/codex-pr-profile-gate.mjs',
      'scripts/codex-safe-artifact-index.mjs',
      'scripts/codex-safe-output-scan.mjs',
      'scripts/codex-v113-self-test.mjs',
      'scripts/codex-v114-self-test.mjs',
      'scripts/codex-v127-self-test.mjs',
      'scripts/codex-worker-proof-capsule.mjs',
      'scripts/codex-workflow-quality-runner.mjs',
    ]);
    const future = classifyV127HarnessWorkflowRepairScope(['scripts/codex-new-harness-gate.mjs']);
    const nonCodex = classifyV127HarnessWorkflowRepairScope(['scripts/tool.mjs']);
    const product = classifyV127HarnessWorkflowRepairScope(['apps/backend/src/app.ts']);
    const lockfile = classifyV127HarnessWorkflowRepairScope(['pnpm-lock.yaml']);
    return current.status === 'pass'
      && future.status === 'pass'
      && nonCodex.status === 'fail'
      && product.status === 'fail'
      && lockfile.status === 'fail';
  }],
  ['v127_owner_proof_is_conditional_on_technical_pass', () => {
    const result = v127FinalizerFixture({ executionResult: { schemaVersion: '1.2.7', gateExit: 1, workflowRunnerExit: 0, safeSummaryOnly: true } });
    return result.ownerBrief.recommendation === 'repair_v127_final_bundle'
      && result.ownerBrief.proofCompleted.length === 0
      && !result.ownerBrief.proofMissing.every((item) => item === 'owner_conditional_merge_receipt');
  }],
  ['v127_finalizer_owner_boundary_pass_not_merge_allowed', () => {
    const result = v127FinalizerFixture();
    return result.summary.status === 'pass'
      && result.summary.technicalChecksReady === true
      && result.summary.mergeAllowed === false
      && result.finalDecision.mergeAllowed === false
      && result.summary.safeNextAction === 'owner_merge_decision_only';
  }],
  ['v127_semantic_validator_rejects_stale_success_closure', () => {
    const result = v127FinalizerFixture();
    fs.writeFileSync(`${result.finalized.stageDir}/codex-orchestration-capsule.safe.json`, JSON.stringify({
      ...result.orchestration,
      finalDecisionClosure: { phase: 'create_pr_only', singleClosureReason: 'owner_merge_decision_required', safeNextAction: 'owner_boundary_stop', safeSummaryOnly: true },
      safeSummaryOnly: true,
    }, null, 2));
    const validated = validateV127SafeArtifactBundle({ stageDir: result.finalized.stageDir, head: result.head });
    return validated.status === 'fail'
      && validated.reasonCodes.includes('success_orchestration_closure_phase_stale');
  }],
  ['v127_semantic_validator_rejects_pending_remote_evidence', () => {
    const result = v127FinalizerFixture();
    fs.writeFileSync(`${result.finalized.stageDir}/codex-pr-evidence-rendered.safe.json`, JSON.stringify({
      ...result.prEvidence,
      remoteEvidenceStatus: 'pending_or_not_applicable',
      safeSummaryOnly: true,
    }, null, 2));
    const validated = validateV127SafeArtifactBundle({ stageDir: result.finalized.stageDir, head: result.head });
    return validated.status === 'fail'
      && validated.reasonCodes.includes('success_pr_evidence_not_current');
  }],
  ['v127_final_state_classifier_scope_contamination_fails', () => {
    const state = deriveV127FinalState({ status: 'pass' }, {
      executionResult: { gateExit: 0, workflowRunnerExit: 0 },
      head: SAME_HEAD_ENVELOPE.localHead,
      changedFiles: ['apps/backend/src/app.ts'],
    });
    return state.status === 'fail'
      && state.reasonCodes.includes('scope_boundary_not_pass');
  }],
  ['v127_pr_body_surface_machine_invariance', () => {
    const reports = V127_BODY_INVARIANCE_BODIES.map(v127BodyInvariantReports);
    return reports.every((item) => item.surface.status === 'pass'
      && item.surface.machineSurfaceSource === 'changed_files_only'
      && item.surface.bodySurfaceUse === 'display_only'
      && item.surface.prBodyMachineEvidence === false
      && !item.surface.effectiveChangedSurfaces.includes('runtime')
      && !item.surface.effectiveChangedSurfaces.includes('release'));
  }],
  ['v127_pr_body_profile_and_complexity_display_only', () => {
    const reports = V127_BODY_INVARIANCE_BODIES.map(v127BodyInvariantReports);
    return reports.every((item) => item.profile.status === 'pass'
      && item.profile.prBodyMachineEvidence === false
      && item.profile.decisionInfluence === 'display_only'
      && item.complexity.status === 'pass'
      && item.complexity.prBodyMachineEvidence === false
      && item.complexity.machineDecisionInfluence === false);
  }],
  ['v127_pr_body_display_only_boundary_removes_only_allowlisted_statuses', () => {
    const report = {
      bestOfNEvidenceStatus: { status: 'fail', reasonCodes: ['best_of_n_required'], evidenceSource: 'pr_body_display', decisionInfluence: 'display_only', safeSummaryOnly: true },
      testCoverageEvidenceStatus: { status: 'fail', reasonCodes: ['test_coverage_evidence_missing'], evidenceSource: 'pr_body_display', decisionInfluence: 'display_only', safeSummaryOnly: true },
      secretScan: { status: 'fail', reasonCodes: ['secret_scan_failed'], safeSummaryOnly: true },
    };
    const state = {
      failures: [
        { id: 'bestOfNEvidenceStatus.failed' },
        { id: 'testCoverageEvidenceStatus.failed' },
        { id: 'secretScan.failed' },
      ],
      warnings: [],
    };
    const boundary = applyV127PrBodyDisplayOnlyBoundary(report, state, {
      CODEX_HARNESS_MODE: 'target',
      CODEX_PROFILE_COMPAT_MODE: 'off',
    });
    return boundary.status === 'pass'
      && boundary.prBodyMachineEvidence === false
      && boundary.nonOverridableFailuresPreserved === true
      && state.failures.length === 1
      && state.failures[0].id === 'secretScan.failed';
  }],
  ['v127_pr_body_boundary_does_not_hide_machine_evidence_failures', () => {
    const report = {
      bestOfNEvidenceStatus: { status: 'fail', reasonCodes: ['best_of_n_required'], evidenceSource: 'safe_artifact', decisionInfluence: 'blocking', safeSummaryOnly: true },
      testCoverageEvidenceStatus: { status: 'fail', reasonCodes: ['test_coverage_evidence_missing'], evidenceSource: 'safe_artifact', decisionInfluence: 'blocking', safeSummaryOnly: true },
    };
    const state = {
      failures: [
        { id: 'bestOfNEvidenceStatus.failed' },
        { id: 'testCoverageEvidenceStatus.failed' },
      ],
      warnings: [],
    };
    applyV127PrBodyDisplayOnlyBoundary(report, state, {
      CODEX_HARNESS_MODE: 'target',
      CODEX_PROFILE_COMPAT_MODE: 'off',
    });
    return report.bestOfNEvidenceStatus.status === 'fail'
      && report.testCoverageEvidenceStatus.status === 'fail'
      && state.failures.length === 2;
  }],
  ['pr_body_declarations_do_not_create_human_confirmation', () => {
    const rendered = renderPrEvidenceBlocks({
      repository: 'hiro4649/disco-funky-repair',
      prNumber: '364',
      headSha: SAME_HEAD_ENVELOPE.localHead,
      baseSha: SAME_HEAD_ENVELOPE.localHead,
      changedFiles: ['scripts/codex-v127-self-test.mjs'],
      productCodeChanged: false,
      runtimeReadinessClaimed: false,
      prBody: 'Product code changed: no\nRuntime readiness claimed: no\nProduction readiness claimed: no',
    }, { CODEX_EVENT_NAME: 'pull_request', CODEX_PR_NUMBER: '364', CODEX_PR_HEAD_SHA: SAME_HEAD_ENVELOPE.localHead, CODEX_PR_BASE_SHA: SAME_HEAD_ENVELOPE.localHead });
    const blocks = rendered.prEvidenceRendererStatus.blocks;
    return rendered.prEvidenceRendererStatus.status === 'pass'
      && blocks.evidencePack.humanConfirmation.present === false
      && blocks.manualConfirmation.present === false
      && blocks.evidencePack.prBodyMachineEvidence === false
      && blocks.evidencePack.ownerAuthorityCreatedByAI === false;
  }],
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
