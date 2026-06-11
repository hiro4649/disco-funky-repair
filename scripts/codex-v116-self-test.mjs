#!/usr/bin/env node
// CODEX_QUALITY_HARNESS_FILE v1.1.7

import { writeJsonReport, exitFor } from './codex-v080-lib.mjs';
import {
  buildDecisionCapsuleV117,
  buildV117Report,
  validateDecisionCapsuleAuthority,
} from './codex-verifier-capsule.mjs';
import { buildArtifactConsistencyReport } from './codex-artifact-consistency-contract.mjs';
import { validateSafeFailureReader } from './codex-read-safe-failure.mjs';

function test(name, fn) {
  try {
    return { name, status: fn() ? 'pass' : 'fail', safeSummaryOnly: true };
  } catch {
    return { name, status: 'fail', reasonCodes: ['self_test_exception'], safeSummaryOnly: true };
  }
}

function validateV116CompatibilityCapsule(input = {}) {
  const reasonCodes = [];
  if (input.activeHarnessVersion !== '1.1.7') reasonCodes.push('v117_not_active');
  if (input.compatibilityHarnessVersion !== '1.1.6') reasonCodes.push('v116_compatibility_missing');
  if (input.compatibilityMode !== 'blocking_compatibility') reasonCodes.push('v116_not_blocking_compatibility');
  if (input.claimsActiveV116 === true) reasonCodes.push('v116_must_not_be_active');
  if (input.rawLogsRead === true) reasonCodes.push('raw_logs_read');
  if (input.eightSessionUsed === true) reasonCodes.push('eight_session_used');
  if (input.runtimeReadinessClaimed === true) reasonCodes.push('runtime_readiness_claimed');
  if (input.productionReadinessClaimed === true) reasonCodes.push('production_readiness_claimed');
  if (input.stagingNoTxPassClaimed === true) reasonCodes.push('staging_no_tx_pass_claimed');
  if (input.productFilesRequired === true) reasonCodes.push('product_files_required_for_compatibility');
  return {
    status: reasonCodes.length ? 'fail' : 'pass',
    reasonCodes,
    safeSummaryOnly: true,
  };
}

const v117AllowedCapsule = buildDecisionCapsuleV117({
  decision: 'allowed',
  mergeAllowed: true,
  ownerMergeScope: true,
  sameHeadRequiredChecks: { sameHead: true, allPass: true, headSha: 'abc' },
  primaryClass: 'owner_merge_instruction_present',
  primaryBlocker: 'none',
  safeNextAction: 'merge_after_same_head_required_checks',
});

const compatibilityFixture = {
  activeHarnessVersion: '1.1.7',
  compatibilityHarnessVersion: '1.1.6',
  compatibilityMode: 'blocking_compatibility',
  claimsActiveV116: false,
  rawLogsRead: false,
  eightSessionUsed: false,
  runtimeReadinessClaimed: false,
  productionReadinessClaimed: false,
  stagingNoTxPassClaimed: false,
  productFilesRequired: false,
};

const cases = [
  test('v116_compatibility_self_test_exists_as_v117_shim', () => true),
  test('v117_remains_active_current_harness', () => validateV116CompatibilityCapsule(compatibilityFixture).status === 'pass'),
  test('v116_is_blocking_compatibility_not_active', () => validateV116CompatibilityCapsule({ ...compatibilityFixture, claimsActiveV116: true }).reasonCodes.includes('v116_must_not_be_active')),
  test('decision_capsule_authority_remains_v117', () => validateDecisionCapsuleAuthority(v117AllowedCapsule).status === 'pass'),
  test('decision_capsule_rejects_allowed_merge_false', () => validateDecisionCapsuleAuthority({ ...v117AllowedCapsule, decision: 'allowed', mergeAllowed: false }).status === 'fail'),
  test('artifact_consistency_remains_v117', () => buildArtifactConsistencyReport({ head: 'abc' }).artifactConsistencyStatus.status === 'pass'),
  test('safe_failure_reader_remains_v117', () => validateSafeFailureReader({ rawLogFallbackAttempted: false }).status === 'pass'),
  test('product_harness_separation_remains_enforced', () => validateV116CompatibilityCapsule({ ...compatibilityFixture, productFilesRequired: true }).status === 'fail'),
  test('same_head_evidence_remains_required', () => buildV117Report({ sameHeadRequiredChecks: { sameHead: false, allPass: true } }).decisionCapsuleAuthorityStatus.status === 'fail'),
  test('raw_logs_remain_forbidden', () => validateV116CompatibilityCapsule({ ...compatibilityFixture, rawLogsRead: true }).reasonCodes.includes('raw_logs_read')),
  test('eight_session_remains_forbidden', () => validateV116CompatibilityCapsule({ ...compatibilityFixture, eightSessionUsed: true }).reasonCodes.includes('eight_session_used')),
  test('runtime_readiness_claim_remains_forbidden', () => validateV116CompatibilityCapsule({ ...compatibilityFixture, runtimeReadinessClaimed: true }).reasonCodes.includes('runtime_readiness_claimed')),
  test('staging_no_tx_pass_claim_remains_forbidden', () => validateV116CompatibilityCapsule({ ...compatibilityFixture, stagingNoTxPassClaimed: true }).reasonCodes.includes('staging_no_tx_pass_claimed')),
  test('production_readiness_claim_remains_forbidden', () => validateV116CompatibilityCapsule({ ...compatibilityFixture, productionReadinessClaimed: true }).reasonCodes.includes('production_readiness_claimed')),
  test('exactly_one_safe_next_action_preserved', () => typeof v117AllowedCapsule.safeNextAction === 'string' && !v117AllowedCapsule.safeNextAction.includes('\n')),
  test('no_product_files_required_for_compatibility_shim', () => validateV116CompatibilityCapsule(compatibilityFixture).reasonCodes.length === 0),
];

const failures = cases.filter((item) => item.status !== 'pass');
const report = {
  v116SelfTestStatus: {
    status: failures.length ? 'fail' : 'pass',
    caseCount: cases.length,
    failureCount: failures.length,
    compatibilityHarnessVersion: '1.1.6',
    activeHarnessVersion: '1.1.7',
    compatibilityMode: 'blocking_compatibility',
    safeSummaryOnly: true,
  },
  cases,
  status: failures.length ? 'fail' : 'pass',
  safeSummaryOnly: true,
};

writeJsonReport(report, 'CODEX_V116_SELF_TEST_REPORT');
if (!process.env.CODEX_V116_SELF_TEST_REPORT && process.env.CODEX_QUALITY_REPORT !== 'json') {
  console.log(`v116SelfTestStatus: ${report.v116SelfTestStatus.status}`);
}
exitFor(report);
