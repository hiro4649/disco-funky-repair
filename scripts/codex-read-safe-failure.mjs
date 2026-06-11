#!/usr/bin/env node
// CODEX_QUALITY_HARNESS_FILE v1.1.7

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeJsonReport, exitFor } from './codex-v080-lib.mjs';
import { pass, fail } from './codex-outcome-contract.mjs';

export const SAFE_FAILURE_READ_ORDER = [
  'codex-decision-capsule.safe.json',
  'codex-artifact-consistency.safe.json',
  'codex-minimal-blockers.safe.json',
  'codex-owner-decision-receipt.safe.json',
  'codex-quality-gate-safe-summary.json',
  'codex-decision-core.safe.json',
  'codex-safe-artifact-index.safe.json',
];

function readJson(file) {
  try {
    if (!file || !fs.existsSync(file)) return null;
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

function findArtifactPath(root, artifactName) {
  try {
    if (!root || !fs.existsSync(root)) return '';
    const stat = fs.statSync(root);
    if (stat.isFile()) return path.basename(root) === artifactName ? root : '';
    const direct = path.join(root, artifactName);
    if (fs.existsSync(direct)) return direct;
    for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const found = findArtifactPath(path.join(root, entry.name), artifactName);
      if (found) return found;
    }
  } catch {
    return '';
  }
  return '';
}

export function pickSafeFailureEvidence(dir = '.', order = SAFE_FAILURE_READ_ORDER) {
  if (dir && typeof dir === 'object' && !Array.isArray(dir)) {
    if (dir.decisionCapsule || dir.decisionArtifact) return { selected: 'codex-decision-capsule.safe.json', decisionArtifact: dir.decisionCapsule || dir.decisionArtifact };
    if (dir.artifactConsistency) return { selected: 'codex-artifact-consistency.safe.json', artifactConsistency: dir.artifactConsistency };
    if (dir.minimalBlockers) return { selected: 'codex-minimal-blockers.safe.json', minimalBlockers: dir.minimalBlockers };
    return { selected: 'none', acceptedEvidence: [], rejectedEvidence: SAFE_FAILURE_READ_ORDER };
  }
  const accepted = [];
  const rejected = [];
  for (const artifact of order) {
    const value = readJson(findArtifactPath(dir, artifact));
    if (value) accepted.push({ artifact, value });
    else rejected.push(artifact);
  }
  const decision = accepted.find((item) => item.artifact === 'codex-decision-capsule.safe.json')?.value;
  const consistency = accepted.find((item) => item.artifact === 'codex-artifact-consistency.safe.json')?.value;
  const minimal = accepted.find((item) => item.artifact === 'codex-minimal-blockers.safe.json')?.value;
  const summary = accepted.find((item) => item.artifact === 'codex-quality-gate-safe-summary.json')?.value;
  return {
    selected: accepted[0]?.artifact || 'none',
    decisionArtifact: decision || null,
    artifactConsistency: consistency || null,
    minimalBlockers: minimal || null,
    safeSummary: summary || null,
    acceptedEvidence: accepted.map((item) => item.artifact),
    rejectedEvidence: rejected,
  };
}

function classifyStaleSummaryConsistency(summary = {}, consistency = {}) {
  const embedded = summary.artifactConsistencyStatus;
  const finalStatus = consistency.artifactConsistencyStatus;
  if (!embedded || !finalStatus) return null;
  const embeddedCompact = {
    status: embedded.status,
    primaryClass: embedded.primaryClass,
    head: embedded.head,
  };
  const finalCompact = {
    status: finalStatus.status,
    primaryClass: finalStatus.primaryClass,
    head: finalStatus.head || consistency.head,
  };
  if (JSON.stringify(embeddedCompact) === JSON.stringify(finalCompact)) return null;
  if (finalStatus.status === 'pass' && embedded.status === 'fail') {
    return {
      primaryClass: 'safe_summary_uses_stale_artifact_consistency_snapshot',
      safeNextAction: 'safe_summary_rehydration_required',
    };
  }
  return {
    primaryClass: finalStatus.primaryClass || 'final_artifact_consistency_authoritative',
    safeNextAction: finalStatus.safeNextAction || 'owner_decision_or_state_delta',
  };
}

export function renderSafeFailureLines(input = {}) {
  const decision = input.decisionArtifact || input.decisionCapsule || {};
  const consistency = input.artifactConsistency || {};
  const minimal = input.minimalBlockers || {};
  const summary = input.safeSummary || {};
  const staleSummary = classifyStaleSummaryConsistency(summary, consistency);
  const concretePrimaryClass = [
    staleSummary?.primaryClass,
    decision.primaryClass,
    consistency.artifactConsistencyStatus?.primaryClass,
    consistency.primaryClass,
    minimal.primary_blocker,
    input.primaryClass,
  ].find((value) => value && value !== 'safe_detail_unavailable');
  const primaryClass = concretePrimaryClass || decision.primaryClass || consistency.primaryClass || input.primaryClass || 'unknown';
  const safeNextAction = [
    primaryClass === staleSummary?.primaryClass ? staleSummary.safeNextAction : '',
    primaryClass === decision.primaryClass ? decision.safeNextAction : '',
    minimal.safe_next_action,
    consistency.safeNextAction,
    input.safeNextAction,
  ].find(Boolean) || 'owner_decision_or_state_delta';
  const lines = [
    `decision: ${decision.decision || input.decision || 'blocked'}`,
    `head: ${decision.head || consistency.head || input.head || 'unknown'}`,
    `primaryClass: ${primaryClass}`,
    `blockingArtifact: ${consistency.artifactName || decision.detailsRef || input.blockingArtifact || 'unknown'}`,
    `acceptedEvidence: ${(input.acceptedEvidence || []).slice(0, 5).join(',') || 'none'}`,
    `rejectedEvidence: ${(input.rejectedEvidence || []).slice(0, 5).join(',') || 'none'}`,
    `repairType: ${decision.repairType || consistency.repairType || input.repairType || 'unknown'}`,
    `repairTargetFile: ${input.repairTargetFile || consistency.repairTargetFile || 'unknown'}`,
    `safeNextAction: ${safeNextAction}`,
    `rawLogsRead: ${decision.rawLogsRead === true || input.rawLogsRead === true ? 'true' : 'false'}`,
  ];
  return lines.slice(0, 20);
}

export function validateSafeFailureReader(input = {}) {
  const order = input.readOrder || SAFE_FAILURE_READ_ORDER;
  const lines = renderSafeFailureLines({
    decisionArtifact: {
      decision: 'blocked',
      head: 'HEAD_SHA',
      primaryClass: 'artifact_index_consistency_failure',
      repairType: 'target_workflow_artifact_contract',
      safeNextAction: 'owner artifact-contract scope decision',
      rawLogsRead: false,
    },
    acceptedEvidence: order.slice(0, 2),
    rejectedEvidence: order.slice(2),
  });
  const reasonCodes = [];
  if (input.rawLogFallbackAttempted === true) reasonCodes.push('safe_failure_reader_raw_log_fallback');
  if (JSON.stringify(order) !== JSON.stringify(SAFE_FAILURE_READ_ORDER)) reasonCodes.push('safe_failure_reader_read_order_changed');
  if (lines.length > 20) reasonCodes.push('safe_failure_reader_output_too_long');
  if (lines.some((line) => /secret|token=|password|BEGIN PRIVATE/i.test(line))) reasonCodes.push('unsafe_failure_reader_output');
  return reasonCodes.length ? fail(reasonCodes, { lineCount: lines.length }) : pass({ readOrder: order, lineCount: lines.length });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const dir = process.argv[2] || '.';
  const evidence = pickSafeFailureEvidence(dir);
  const lines = renderSafeFailureLines(evidence);
  console.log(lines.join('\n'));
  const report = {
    safeFailureReaderStatus: lines.length <= 20 ? pass({ lineCount: lines.length }) : fail('safe_failure_reader_output_too_long'),
    safeSummaryOnly: true,
  };
  writeJsonReport(report, 'CODEX_SAFE_FAILURE_READER_REPORT');
  exitFor(report);
}
