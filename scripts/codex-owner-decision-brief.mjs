#!/usr/bin/env node
// CODEX_QUALITY_HARNESS_FILE v1.2.0

import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { writeJsonReport, exitFor } from './codex-v080-lib.mjs';
import { pass, fail } from './codex-outcome-contract.mjs';

function bounded(values = [], limit = 8) {
  return Array.isArray(values) ? values.slice(0, limit).map(String) : [];
}

const DELEGATED_CONTINUATION_ACTIONS = new Set(['commit', 'push', 'createPr', 'rerunCi', 'fixCi', 'merge']);
const NON_DELEGABLE_ACTIONS = new Set(['release', 'publish', 'secretAccess', 'walletRpcDeployAccess', 'deploy', 'fundedTransaction', 'governanceTransaction', 'bscScanVerification']);
const RECOMMENDATIONS = new Set(['merge', 'repair', 'preserve', 'stop', 'owner_merge_decision_only_after_same_head_remote_pass']);
const OWNER_MERGE_AFTER_SAME_HEAD_PASS = 'owner_merge_after_same_head_pass';
const NON_OVERRIDABLE_STATUS_KEYS = [
  'productEvidenceStatus',
  'finalDecisionStatus',
  'safeOutputScanStatus',
  'secretScanStatus',
  'scopeBoundaryStatus',
];

function escalationSummary(input = {}) {
  return {
    typedBlocker: input.typedBlocker || 'none',
    highestTierUsed: input.highestTierUsed === true,
    reviewerCount: Math.min(Number(input.reviewerCount || 0), 3),
    highTierRepairPlanAvailable: input.highTierRepairPlanAvailable === true,
    deEscalationReady: input.deEscalationReady === true,
  };
}

export function buildOwnerDecisionBrief(input = {}) {
  const ownerDecisionReceipt = input.currentHeadOwnerDecision || validateCurrentHeadOwnerDecision(input.ownerDecisionInput || {});
  const currentHeadDecisionAccepted = ownerDecisionReceipt.status === 'pass';
  return {
    ownerDecisionBriefVersion: '1',
    decisionReady: currentHeadDecisionAccepted || input.decisionReady === true,
    itemUrl: input.itemUrl || null,
    whatChanges: input.whatChanges || 'source_harness_v120_body_only',
    whoBenefits: input.whoBenefits || 'maintainer_and_worker_context_reduction',
    whyOwnerDecisionNeededNow: currentHeadDecisionAccepted
      ? 'current_head_owner_merge_instruction_accepted'
      : input.whyOwnerDecisionNeededNow || 'owner_merge_instruction_not_provided',
    proofCompleted: bounded(
      currentHeadDecisionAccepted
        ? [...(input.proofCompleted || []), 'current_head_owner_merge_instruction']
        : input.proofCompleted,
      8
    ),
    proofMissing: bounded(
      currentHeadDecisionAccepted
        ? (input.proofMissing || []).filter((item) => item !== 'owner_merge_instruction')
        : input.proofMissing || ['same_head_remote_quality_gate'],
      8
    ),
    residualRisks: bounded(
      currentHeadDecisionAccepted
        ? (input.residualRisks || []).filter((item) => item !== 'owner_merge_instruction_not_provided' && item !== 'owner_merge_instruction_required')
        : input.residualRisks || ['owner_merge_instruction_required'],
      3
    ),
    recommendation: input.recommendation || 'owner_merge_decision_only_after_same_head_remote_pass',
    exactChoices: bounded(input.exactChoices || ['approve_merge_after_same_head_pass', 'request_narrow_repair', 'leave_pr_open'], 3),
    escalationSummary: escalationSummary(input.escalationSummary || input),
    remainingOwnerOnlyChoices: bounded(input.remainingOwnerOnlyChoices || ['merge_after_same_head_pass'], 3),
    ownerOnlyDecision: true,
    nextImplementableSlice: {
      available: input.nextImplementableSliceAvailable === true,
      summary: input.nextImplementableSliceSummary || 'none',
      requiresOwnerScope: input.nextImplementableSliceRequiresOwnerScope !== false,
    },
    delegatedContinuation: {
      enabled: input.delegatedContinuationEnabled === true,
      delegateRole: input.delegateRole || 'technical_reviewer',
      technicalAcceptance: input.technicalAcceptance === true,
      autoContinueAllowed: input.autoContinueAllowed === true,
      allowedActions: bounded(input.delegatedAllowedActions || [], 8),
      blockedActions: bounded(input.delegatedBlockedActions || ['release', 'publish', 'walletRpcDeployAccess', 'secretAccess'], 8),
      remainingOwnerOnlyChoices: bounded(input.remainingOwnerOnlyChoices || ['release', 'publish', 'walletRpcDeployAccess', 'secretAccess'], 3),
      safeNextAction: input.delegatedSafeNextAction || 'owner_delegation_or_owner_decision_required',
    },
    safeNextAction: input.safeNextAction || 'owner_merge_decision_only',
    ownerDecisionReceipt,
    rawLogsRead: false,
    eightSessionUsed: false,
    safeSummaryOnly: true,
  };
}

function compactReasonCodes(values = []) {
  return Array.from(new Set(values.filter(Boolean).map(String))).sort().slice(0, 12);
}

function statusPassOrUnknown(value) {
  const status = value && typeof value === 'object' ? value.status : value;
  return status === undefined || status === null || status === 'pass' || status === 'not_applicable' || status === 'not_required' || status === 'not_required_with_reason';
}

export function validateCurrentHeadOwnerDecision(input = {}) {
  const text = String(input.text || '');
  const currentHeadSha = String(input.currentHeadSha || '').trim();
  const prNumber = input.prNumber === undefined || input.prNumber === null ? '' : String(input.prNumber).trim();
  const reasonCodes = [];
  const normalized = text.replace(/\s+/g, ' ').trim();
  const lower = normalized.toLowerCase();
  const currentHeadPattern = new RegExp(`current head\\s+${currentHeadSha.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i');
  const prPattern = prNumber ? new RegExp(`pr\\s*#?${prNumber}\\b`, 'i') : null;

  if (!currentHeadSha || !/^[a-f0-9]{40}$/i.test(currentHeadSha)) reasonCodes.push('owner_decision_current_head_sha_missing');
  if (!normalized) reasonCodes.push('owner_decision_text_missing');
  if (!lower.includes(`owner decision: ${OWNER_MERGE_AFTER_SAME_HEAD_PASS}`)) reasonCodes.push('owner_decision_choice_missing');
  if (currentHeadSha && !currentHeadPattern.test(normalized)) reasonCodes.push('owner_decision_current_head_mismatch');
  if (prPattern && !prPattern.test(normalized)) reasonCodes.push('owner_decision_pr_scope_missing');

  const mentionedHeads = Array.from(normalized.matchAll(/current head\s+([a-f0-9]{40})/gi)).map((match) => match[1].toLowerCase());
  if (mentionedHeads.some((sha) => sha !== currentHeadSha.toLowerCase())) reasonCodes.push('owner_decision_stale_head_detected');

  for (const key of NON_OVERRIDABLE_STATUS_KEYS) {
    if (!statusPassOrUnknown(input[key])) reasonCodes.push(`owner_decision_non_overridable_${key}_not_pass`);
  }

  return {
    status: reasonCodes.length ? 'fail' : 'pass',
    ownerDecision: reasonCodes.length ? 'not_accepted' : OWNER_MERGE_AFTER_SAME_HEAD_PASS,
    currentHeadSha: currentHeadSha || null,
    prNumber: prNumber || null,
    reasonCodes: compactReasonCodes(reasonCodes),
    createsGithubApprovalReview: false,
    createsReadinessAuthority: false,
    overridesNonOverridableFailures: false,
    safeSummaryOnly: true,
  };
}

export function validateOwnerDecisionBrief(brief = {}) {
  const reasons = [];
  if (brief.ownerOnlyDecision !== true) reasons.push('owner_decision_brief_owner_only_required');
  if (!RECOMMENDATIONS.has(brief.recommendation)) reasons.push('owner_decision_brief_recommendation_invalid');
  if (!Array.isArray(brief.exactChoices) || brief.exactChoices.length > 3) reasons.push('owner_decision_brief_max_three_choices');
  if (!Array.isArray(brief.residualRisks) || brief.residualRisks.length > 3) reasons.push('owner_decision_brief_max_three_risks');
  if (!Array.isArray(brief.remainingOwnerOnlyChoices) || brief.remainingOwnerOnlyChoices.length > 3) reasons.push('owner_decision_brief_max_three_remaining_owner_choices');
  if (!Array.isArray(brief.proofCompleted) || brief.proofCompleted.length > 8 || !Array.isArray(brief.proofMissing) || brief.proofMissing.length > 8) reasons.push('owner_decision_brief_max_eight_proof_items');
  if (!brief.whatChanges || !brief.whyOwnerDecisionNeededNow || !brief.recommendation) reasons.push('owner_decision_brief_required_before_owner_question');
  const delegated = brief.delegatedContinuation || {};
  if (delegated.enabled === true) {
    if (delegated.autoContinueAllowed === true && delegated.technicalAcceptance !== true) reasons.push('delegated_auto_continue_requires_technical_acceptance');
    if (!Array.isArray(delegated.remainingOwnerOnlyChoices) || delegated.remainingOwnerOnlyChoices.length > 3) reasons.push('delegated_continuation_remaining_owner_choices_required');
    for (const action of delegated.allowedActions || []) {
      if (!DELEGATED_CONTINUATION_ACTIONS.has(action)) reasons.push(`delegated_continuation_action_not_allowed_${action}`);
      if (NON_DELEGABLE_ACTIONS.has(action)) reasons.push(`delegated_continuation_forbidden_${action}`);
    }
  }
  if (brief.rawLogsRead === true) reasons.push('raw_logs_forbidden_in_owner_decision_brief');
  return reasons.length ? fail(reasons) : pass({ decisionReady: brief.decisionReady === true });
}

export function buildOwnerDecisionBriefReport(input = {}) {
  const brief = buildOwnerDecisionBrief(input);
  return {
    ownerDecisionBrief: brief,
    ownerDecisionBriefStatus: validateOwnerDecisionBrief(brief),
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const report = buildOwnerDecisionBriefReport();
  if (process.env.CODEX_OWNER_DECISION_BRIEF_PATH) {
    fs.writeFileSync(process.env.CODEX_OWNER_DECISION_BRIEF_PATH, JSON.stringify(report.ownerDecisionBrief, null, 2));
  }
  writeJsonReport({ ...report, status: report.ownerDecisionBriefStatus.status, safeSummaryOnly: true }, 'CODEX_OWNER_DECISION_BRIEF_REPORT');
  exitFor({ status: report.ownerDecisionBriefStatus.status });
}
