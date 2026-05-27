#!/usr/bin/env node
// CODEX_QUALITY_HARNESS_FILE v0.9.3
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  HARNESS_VERSION,
  marker,
  isPrContext,
  normalizePath,
  prBodyText,
  readJson,
  scanObjectForUnsafe,
  writeJsonReport,
  exitFor,
} from './codex-v080-lib.mjs';

const STATUS_VALUES = new Set(['PASS', 'FAIL', 'BLOCKED', 'UNKNOWN']);
const PASS_ROLES = new Set(['operator', 'release-manager', 'asset-security-reviewer']);
const ALLOWED_ROLES = new Set([...PASS_ROLES, 'implementation-reviewer', 'project-owner']);
const REQUIRED_PASS_FIELDS = [
  'stagingFrontendUrlStatus',
  'stagingBackendUrlStatus',
  'httpsStatus',
  'dnsStatus',
  'nginxStatus',
  'backendRuntimeEnvPresence',
  'corsOriginSummary',
  'cookieDomainSummary',
  'frontendPublicEnvSummary',
  'deployedMainSha',
  'noTxSmokeSummary',
  'runtimeLogInspectionSummary',
];
const REQUIRED_FIELDS = [
  'marker',
  'schemaVersion',
  'profile',
  'environment',
  'evidenceType',
  'headSha',
  'checkedAt',
  'checkedByRole',
  'overallStatus',
  ...REQUIRED_PASS_FIELDS,
  'secretsIncluded',
  'rawLogsIncluded',
  'txExecuted',
  'fundedTxExecuted',
  'residualRisks',
  'nextActions',
];
const VALID_EVIDENCE_TYPES = new Set([
  'no_tx_preflight',
  'no_tx_smoke',
  'funded_tx_smoke',
  'runtime_log_inspection',
  'staging_readiness',
]);
const EXAMPLE_FILE_RE = /CODEX_STAGING_EVIDENCE_EXAMPLE\./;

function gitLines(args) {
  const result = spawnSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  if (result.status !== 0) return [];
  return String(result.stdout || '').split(/\r?\n/).map(normalizePath).filter(Boolean);
}

function gitHeadSha() {
  const value = gitLines(['rev-parse', 'HEAD'])[0] || '';
  return /^[a-f0-9]{40}$/i.test(value) ? value.toLowerCase() : '';
}

export function changedFiles(env = process.env) {
  if (env.CODEX_CHANGED_FILES) {
    return [...new Set(String(env.CODEX_CHANGED_FILES).split(/\r?\n|,/).map(normalizePath).filter(Boolean))].sort();
  }
  return [...new Set([
    ...gitLines(['diff', '--name-only', 'origin/main...HEAD']),
    ...gitLines(['diff', '--name-only']),
    ...gitLines(['diff', '--cached', '--name-only']),
    ...gitLines(['ls-files', '--others', '--exclude-standard']),
  ])].sort();
}

function repoFiles() {
  return [...new Set([
    ...gitLines(['ls-files']),
    ...gitLines(['ls-files', '--others', '--exclude-standard']),
  ])].sort();
}

function splitFiles(value) {
  return [...new Set(String(value || '').split(/\r?\n|,/).map(normalizePath).filter(Boolean))].sort();
}

function expectedHeadSha(env = process.env) {
  return String(env.CODEX_PR_HEAD_SHA || env.GITHUB_SHA || gitHeadSha() || '').toLowerCase();
}

function isIsoDateTime(value) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(String(value || ''))) return false;
  return !Number.isNaN(Date.parse(value));
}

function statusValue(value) {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object') return value.status;
  return undefined;
}

function hasEvidenceHint(value) {
  if (!value || typeof value !== 'object') return false;
  return Boolean(String(value.evidenceRef || value.summary || '').trim());
}

function safeStringArray(value) {
  return Array.isArray(value) && value.every((item) => typeof item === 'string' && item.length <= 240);
}

function lineIsNegative(line) {
  return /\b(no|not|none|false|blocked|unknown|no-go|not claimed|not applicable)\b/i.test(line);
}

function lineClaims(line, patterns) {
  const text = String(line || '').trim();
  if (!text || lineIsNegative(text)) return false;
  return patterns.some((pattern) => pattern.test(text));
}

export function detectReadinessClaims(body = '') {
  const lines = String(body || '').split(/\r?\n/);
  const runtimeReadyPattern = new RegExp(`\\b${['runtime', 'ready'].join('\\s+')}\\b`, 'i');
  const productionReadyPattern = new RegExp(`\\b${['production', 'ready'].join('\\s+')}\\b`, 'i');
  const staging = lines.some((line) => lineClaims(line, [
    /\bstaging readiness claimed\s*:\s*yes\b/i,
    /\bstaging (?:no[- ]tx )?ready\b/i,
    /\bno[- ]tx ready\b/i,
    /\bstaging smoke (?:passed|pass|ready)\b/i,
  ]));
  const runtime = lines.some((line) => lineClaims(line, [
    /\bruntime readiness claimed\s*:\s*yes\b/i,
    runtimeReadyPattern,
    /\bdeployment ready\b/i,
  ]));
  const releaseGoDecision = lines.some((line) =>
    /\bproduction go\/no-go\s*:\s*go\b/i.test(line) ||
    /\bgo\s*(?:\/|-|\s+)no\s*(?:\/|-|\s+)go\s*:\s*go\b/i.test(line));
  const release = releaseGoDecision || lines.some((line) => lineClaims(line, [
    /\brelease readiness claimed\s*:\s*yes\b/i,
    /\brelease ready\b/i,
    productionReadyPattern,
  ]));
  return {
    staging,
    runtime,
    release,
    any: staging || runtime || release,
  };
}

function stagingTouched(files) {
  const changed = files.filter((file) =>
    /^docs\/process\/FUNKY_STAGING_/.test(file) ||
    /^docs\/process\/CODEX_STAGING_EVIDENCE_/.test(file));
  return {
    touched: changed.length > 0,
    schemaOrExampleOnly: changed.length > 0 && changed.every((file) =>
      /^docs\/process\/CODEX_STAGING_EVIDENCE_(POLICY\.md|SCHEMA\.json|EXAMPLE\.)/.test(file)),
    changedCount: changed.length,
  };
}

function candidateEvidenceFiles(env = process.env) {
  const explicit = splitFiles(env.CODEX_STAGING_EVIDENCE_FILES);
  if (explicit.length) return explicit;
  const files = [...new Set([...repoFiles(), ...changedFiles(env)])].sort();
  return files.filter((file) =>
    /^docs\/process\/CODEX_STAGING_EVIDENCE_(?!SCHEMA\.json$).*\.json$/.test(file) ||
    /^docs\/process\/FUNKY_STAGING_.*EVIDENCE.*\.json$/.test(file));
}

function parseInlineEvidence(env = process.env) {
  if (!env.CODEX_STAGING_EVIDENCE_INLINE_JSON) return [];
  try {
    const parsed = JSON.parse(env.CODEX_STAGING_EVIDENCE_INLINE_JSON);
    return [{ ok: true, file: 'inline', value: parsed, exampleOnly: Boolean(parsed?.exampleOnly) }];
  } catch {
    return [{ ok: false, file: 'inline', reasonCodes: ['staging_evidence_invalid'] }];
  }
}

function readEvidenceFiles(env = process.env) {
  const inline = parseInlineEvidence(env);
  if (inline.length) return inline;
  return candidateEvidenceFiles(env).map((file) => {
    const parsed = readJson(file);
    return parsed.ok
      ? { ok: true, file, value: parsed.value, exampleOnly: Boolean(parsed.value?.exampleOnly) || EXAMPLE_FILE_RE.test(file) }
      : { ok: false, file, reasonCodes: ['staging_evidence_invalid'] };
  });
}

export function validateStagingEvidence(evidence, options = {}) {
  const reasonCodes = [];
  const expectedHead = String(options.expectedHeadSha || '').toLowerCase();
  if (!evidence || typeof evidence !== 'object' || Array.isArray(evidence)) {
    return { status: 'fail', reasonCodes: ['staging_evidence_invalid'], overallStatus: 'UNKNOWN' };
  }
  for (const field of REQUIRED_FIELDS) {
    if (!(field in evidence)) reasonCodes.push('staging_evidence_invalid');
  }
  if (evidence.marker !== marker) reasonCodes.push('staging_evidence_invalid');
  if (evidence.schemaVersion !== '1.0.0') reasonCodes.push('staging_evidence_invalid');
  if (evidence.profile !== 'funky') reasonCodes.push('staging_evidence_invalid');
  if (evidence.environment !== 'staging') reasonCodes.push('staging_evidence_invalid');
  if (!VALID_EVIDENCE_TYPES.has(evidence.evidenceType)) reasonCodes.push('staging_evidence_invalid');
  if (!/^[a-f0-9]{40}$/i.test(String(evidence.headSha || ''))) reasonCodes.push('staging_evidence_invalid');
  if (!evidence.exampleOnly && expectedHead && String(evidence.headSha || '').toLowerCase() !== expectedHead) {
    reasonCodes.push('staging_evidence_stale');
  }
  if (!isIsoDateTime(evidence.checkedAt)) reasonCodes.push('staging_evidence_invalid');
  if (!ALLOWED_ROLES.has(evidence.checkedByRole)) reasonCodes.push('staging_evidence_invalid');
  if (!STATUS_VALUES.has(evidence.overallStatus)) reasonCodes.push('staging_evidence_invalid');
  if (evidence.secretsIncluded !== false) reasonCodes.push('staging_secret_like_value_present');
  if (evidence.rawLogsIncluded !== false) reasonCodes.push('staging_raw_logs_present');
  if (evidence.evidenceType && evidence.evidenceType.startsWith('no_tx') && evidence.txExecuted !== false) {
    reasonCodes.push('staging_no_tx_claim_has_tx');
  }
  if (evidence.evidenceType && evidence.evidenceType.startsWith('no_tx') && evidence.fundedTxExecuted !== false) {
    reasonCodes.push('staging_no_tx_claim_has_tx');
  }
  if (!safeStringArray(evidence.residualRisks) || !safeStringArray(evidence.nextActions)) {
    reasonCodes.push('staging_evidence_invalid');
  }
  for (const field of REQUIRED_PASS_FIELDS) {
    const status = statusValue(evidence[field]);
    if (!STATUS_VALUES.has(status)) reasonCodes.push('staging_evidence_invalid');
    if (evidence.overallStatus === 'PASS' && status !== 'PASS') {
      reasonCodes.push('staging_pass_without_required_fields');
    }
    if (evidence.overallStatus === 'PASS' && !hasEvidenceHint(evidence[field])) {
      reasonCodes.push('staging_pass_without_required_fields');
    }
  }
  if (evidence.overallStatus === 'PASS' && !PASS_ROLES.has(evidence.checkedByRole)) {
    reasonCodes.push('staging_pass_without_required_fields');
  }
  if (scanObjectForUnsafe(evidence).length) reasonCodes.push('staging_secret_like_value_present');

  const uniqueReasons = [...new Set(reasonCodes)];
  const status = uniqueReasons.length ? 'fail' : evidence.overallStatus === 'PASS' ? 'pass' : 'not_applicable';
  return {
    status,
    reasonCodes: uniqueReasons,
    overallStatus: evidence.overallStatus || 'UNKNOWN',
    exampleOnly: Boolean(evidence.exampleOnly),
  };
}

export function buildStagingEvidenceReport(env = process.env) {
  const body = prBodyText(env);
  const files = changedFiles(env);
  const claims = detectReadinessClaims(body);
  const touched = stagingTouched(files);
  const expectedHead = expectedHeadSha(env);
  const evidenceEntries = readEvidenceFiles(env);
  const validations = evidenceEntries.map((entry) => entry.ok
    ? { file: entry.file, ...validateStagingEvidence(entry.value, { expectedHeadSha: expectedHead }) }
    : { file: entry.file, status: 'fail', reasonCodes: entry.reasonCodes || ['staging_evidence_invalid'], overallStatus: 'UNKNOWN' });
  const liveValidations = validations.filter((item) => !item.exampleOnly && item.file !== 'inline-example');
  const nonExampleEvidence = evidenceEntries.filter((item) => item.ok && !item.exampleOnly);
  const failures = [];
  const reasonCodes = [];

  for (const item of validations) {
    if (item.status === 'fail') reasonCodes.push(...(item.reasonCodes || ['staging_evidence_invalid']));
  }

  const livePass = liveValidations.some((item) => item.status === 'pass' && item.overallStatus === 'PASS');
  const liveBlockedOrUnknown = liveValidations.some((item) => ['BLOCKED', 'UNKNOWN'].includes(item.overallStatus));
  const strictRequired = claims.any || touched.touched;
  const examplesOnly = evidenceEntries.length > 0 && nonExampleEvidence.length === 0;

  if (claims.release && !livePass) reasonCodes.push('production_ready_without_staging_evidence');
  if (claims.any && !nonExampleEvidence.length) reasonCodes.push('staging_claim_without_evidence');
  if (claims.any && liveBlockedOrUnknown) reasonCodes.push('staging_claim_without_evidence');
  if (claims.any && nonExampleEvidence.length && !livePass) reasonCodes.push('staging_evidence_missing');
  if (strictRequired && !evidenceEntries.length) reasonCodes.push('staging_evidence_missing');

  const uniqueReasons = [...new Set(reasonCodes)];
  if (uniqueReasons.some((code) => [
    'staging_evidence_invalid',
    'staging_evidence_stale',
    'staging_claim_without_evidence',
    'staging_pass_without_required_fields',
    'staging_secret_like_value_present',
    'staging_raw_logs_present',
    'staging_no_tx_claim_has_tx',
    'production_ready_without_staging_evidence',
  ].includes(code))) {
    failures.push(...uniqueReasons);
  }

  let status = 'not_applicable';
  if (failures.length) status = 'fail';
  else if (livePass) status = 'pass';
  else if (strictRequired && liveBlockedOrUnknown) status = 'not_applicable';
  else if (strictRequired && examplesOnly && !claims.any) status = 'not_applicable';
  else if (!strictRequired) status = 'not_applicable';

  const statusReasonCodes = uniqueReasons.length
    ? uniqueReasons
    : status === 'pass'
    ? []
    : strictRequired
    ? [touched.schemaOrExampleOnly ? 'staging_schema_change_no_readiness_claim' : 'staging_evidence_blocked']
    : ['staging_evidence_not_required'];

  return {
    marker,
    harnessVersion: HARNESS_VERSION,
    stagingEvidenceStatus: {
      status,
      reasonCodes: statusReasonCodes,
      readinessClaimed: claims,
      strictRequired,
      changedStagingFiles: touched.changedCount,
      evidenceFileCount: evidenceEntries.length,
      liveEvidenceFileCount: nonExampleEvidence.length,
      exampleEvidenceFileCount: evidenceEntries.length - nonExampleEvidence.length,
      livePass,
      liveBlockedOrUnknown,
      expectedHeadKnown: Boolean(expectedHead),
      safeSummaryOnly: true,
    },
    valuesPrinted: false,
    status,
    safeSummary: status === 'fail'
      ? 'Staging evidence gate failed; see safe reason codes only.'
      : 'Staging evidence gate completed with safe summary only.',
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  try {
    const report = buildStagingEvidenceReport();
    writeJsonReport(report, 'CODEX_STAGING_EVIDENCE_REPORT');
    exitFor(report);
  } catch {
    const report = {
      marker,
      harnessVersion: HARNESS_VERSION,
      stagingEvidenceStatus: {
        status: 'fail',
        reasonCodes: ['staging_evidence_invalid'],
        safeSummaryOnly: true,
      },
      valuesPrinted: false,
      status: 'fail',
      safeSummary: 'Staging evidence gate failed with an internal error.',
    };
    writeJsonReport(report, 'CODEX_STAGING_EVIDENCE_REPORT');
    process.exit(1);
  }
}
