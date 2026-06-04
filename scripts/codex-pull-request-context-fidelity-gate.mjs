#!/usr/bin/env node
// CODEX_QUALITY_HARNESS_FILE v1.0.5
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { isPrContext, scanObjectForUnsafe, simpleStatus, writeJsonReport, exitFor } from './codex-v080-lib.mjs';

function parseJson(value) {
  if (!value) return null;
  try { return JSON.parse(value); } catch { return { invalidInput: true }; }
}
function parseBool(value) { return value === true || value === '1' || value === 'true'; }
function parseList(value) {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  return String(value || '').split(/[\r\n,]+/).map((item) => item.trim()).filter(Boolean);
}
function uniq(values) { return [...new Set(values.filter(Boolean))]; }
function readGithubEvent(env) {
  if (!env.GITHUB_EVENT_PATH) return {};
  try {
    return JSON.parse(fs.readFileSync(env.GITHUB_EVENT_PATH, 'utf8'));
  } catch {
    return {};
  }
}
function safe(statusKey, status, payload) {
  const out = simpleStatus(statusKey, status, { ...payload, reasonCodes: uniq(payload.reasonCodes || []), safeSummaryOnly: true });
  return scanObjectForUnsafe(out).length ? simpleStatus(statusKey, 'fail', { reasonCodes: ['unsafe_value_detected'], safeSummaryOnly: true }) : out;
}

export function buildPullRequestContextFidelityReport(input = parseJson(process.env.CODEX_PULL_REQUEST_CONTEXT_FIDELITY_JSON) || {}, env = process.env) {
  const event = readGithubEvent(env);
  const pullRequest = event.pull_request || {};
  const prNumber = input.prNumber || env.CODEX_PR_NUMBER || pullRequest.number || event.number;
  const headSha = input.headSha || env.CODEX_PR_HEAD_SHA || env.GITHUB_SHA || pullRequest.head?.sha;
  const baseSha = input.baseSha || env.CODEX_PR_BASE_SHA || pullRequest.base?.sha;
  const changedFiles = parseList(input.changedFiles ?? env.CODEX_CHANGED_FILES);
  const pr = isPrContext(env) || parseBool(input.isPullRequest) || Boolean(pullRequest.number || event.number);
  if (!pr && !parseBool(input.forceCheck) && !parseBool(input.workflowDispatchTreatedAsPrCheck)) return safe('pullRequestContextFidelityStatus', 'not_applicable', { reasonCodes: ['local_non_pr_context_not_required'] });
  const reasonCodes = [];
  if (input.invalidInput) reasonCodes.push('pull_request_context_missing');
  if (!prNumber) reasonCodes.push('pull_request_context_missing');
  if (!headSha) reasonCodes.push('pull_request_context_missing');
  if (!baseSha) reasonCodes.push('pull_request_context_missing');
  if (changedFiles.length === 0 && !parseBool(input.changedFilesUnavailableFallbackPresent)) reasonCodes.push('pull_request_context_missing');
  if (parseBool(input.statusCheckRollupUnavailable) && !parseBool(input.statusCheckFallbackPresent)) reasonCodes.push('pull_request_context_missing');
  if (parseBool(input.workflowDispatchTreatedAsPrCheck)) reasonCodes.push('workflow_dispatch_not_pr_substitute');
  if (parseBool(input.rerunOnStaleHead) || parseBool(input.artifactHeadMismatch)) reasonCodes.push('same_head_artifact_mismatch');
  if (parseBool(input.mergeReady) && parseBool(input.sameHeadEvidenceMissing)) reasonCodes.push('same_head_artifact_missing');
  return safe('pullRequestContextFidelityStatus', reasonCodes.length ? 'fail' : 'pass', {
    reasonCodes,
    pullRequestContext: pr,
    changedFileCount: changedFiles.length,
    prNumberPresent: Boolean(prNumber),
    headShaPresent: Boolean(headSha),
    baseShaPresent: Boolean(baseSha),
  });
}


if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const report = buildPullRequestContextFidelityReport();
  writeJsonReport(report, 'CODEX_PULL_REQUEST_CONTEXT_FIDELITY_REPORT');
  exitFor(report);
}
