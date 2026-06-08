#!/usr/bin/env node
// CODEX_QUALITY_HARNESS_FILE v1.0.7
import { prBodyText, isPrContext, readJson, simpleStatus, writeJsonReport, exitFor } from './codex-v080-lib.mjs';
import { currentVersion } from './codex-harness-version.mjs';

const HARNESS_VERSION = currentVersion;
const marker = `CODEX_QUALITY_HARNESS_FILE v${HARNESS_VERSION}`;

function currentStatus(field, status, extras = {}) {
  return { ...simpleStatus(field, status, extras), marker, harnessVersion: HARNESS_VERSION };
}

function parseJsonValue(value) {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function readJsonValueOrFile(value) {
  const inline = parseJsonValue(value);
  if (inline) return inline;
  if (!value) return null;
  const parsed = readJson(value);
  return parsed.ok ? parsed.value : null;
}

function docsOnly(body) {
  return /\b(docs-only|policy-only|documentation only|harness-only)\b/i.test(body) &&
    !/\bbug fix|behavior change|refactor|migration|implementation change\b/i.test(body);
}

function requiresTestEvidence(body) {
  return /\bbug fix|behavior change|refactor|migration|implementation change|changed behavior\b/i.test(body) && !docsOnly(body);
}

function hasTestEvidence(body) {
  const hasSection = /(^|\n)\s*(?:#{1,6}\s*)?Test Coverage Evidence\s*:?\s*$/im.test(body) ||
    /Test Coverage Evidence:/i.test(body);
  return hasSection &&
    /changed area/i.test(body) &&
    /test command/i.test(body) &&
    /what the test covers/i.test(body) &&
    /edge cases|failure paths|reason if no test/i.test(body);
}

function formalProductEvidencePass(env = process.env) {
  const evidence = readJsonValueOrFile(env.CODEX_PRODUCT_VERIFICATION_EVIDENCE_JSON);
  const productVerification = readJsonValueOrFile(env.CODEX_PRODUCT_VERIFICATION_JSON);
  const evidenceStatus = evidence?.status || evidence?.productVerificationEvidenceStatus?.status;
  const verificationStatus = productVerification?.status || productVerification?.productVerificationStatus?.status;
  return evidenceStatus === 'pass' && (!verificationStatus || verificationStatus === 'pass');
}

export function buildReport(env = process.env) {
  const body = prBodyText(env);
  if (!isPrContext(env) && !body.trim()) {
    return currentStatus('testCoverageEvidenceStatus', 'not_applicable', { reasonCodes: ['non_pr_context'] });
  }
  if (!requiresTestEvidence(body)) {
    return currentStatus('testCoverageEvidenceStatus', 'not_applicable', { reasonCodes: ['test_coverage_not_required'] });
  }
  if (formalProductEvidencePass(env)) {
    return currentStatus('testCoverageEvidenceStatus', 'pass', {
      reasonCodes: ['formal_product_evidence_pass'],
      source: 'formal_product_evidence',
    });
  }
  const status = hasTestEvidence(body) ? 'pass' : 'fail';
  return currentStatus('testCoverageEvidenceStatus', status, {
    reasonCodes: status === 'pass' ? [] : ['test_coverage_evidence_missing'],
  });
}

try {
  const report = buildReport();
  writeJsonReport(report, 'CODEX_TEST_COVERAGE_EVIDENCE_REPORT');
  exitFor(report);
} catch {
  const report = {
    marker,
    harnessVersion: HARNESS_VERSION,
    testCoverageEvidenceStatus: { status: 'fail', reasonCodes: ['unexpected_error'], safeSummaryOnly: true },
    valuesPrinted: false,
    status: 'fail',
  };
  writeJsonReport(report, 'CODEX_TEST_COVERAGE_EVIDENCE_REPORT');
  process.exit(1);
}
