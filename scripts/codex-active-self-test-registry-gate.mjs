#!/usr/bin/env node
// CODEX_QUALITY_HARNESS_FILE v1.0.6
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { readJson, readText, scanObjectForUnsafe, simpleStatus, writeJsonReport, exitFor } from './codex-v080-lib.mjs';

const ACTIVE_HARNESS_VERSION = '1.0.6';
const ACTIVE_MARKER = `CODEX_QUALITY_HARNESS_FILE v${ACTIVE_HARNESS_VERSION}`;
const ACTIVE_STATUS_KEY = 'v106SelfTestStatus';
const ACTIVE_SELF_TEST_FILE = 'scripts/codex-v106-self-test.mjs';
const TARGET_MANIFEST = 'docs/process/CODEX_HARNESS_MANIFEST.json';
const SOURCE_MANIFEST = 'CODEX_SOURCE_HARNESS_MANIFEST.json';

function parseJson(value) {
  if (!value) return null;
  try { return JSON.parse(value); } catch { return { invalidInput: true }; }
}

function parseBool(value) {
  return value === true || value === '1' || value === 'true' || value === 'yes';
}

function uniq(values) {
  return [...new Set((values || []).filter(Boolean))];
}

function safe(status, payload = {}) {
  const out = simpleStatus('activeSelfTestRegistryStatus', status, {
    ...payload,
    reasonCodes: uniq(payload.reasonCodes),
    safeSummaryOnly: true,
  });
  out.marker = ACTIVE_MARKER;
  out.harnessVersion = ACTIVE_HARNESS_VERSION;
  if (scanObjectForUnsafe(out).length) {
    const report = simpleStatus('activeSelfTestRegistryStatus', 'fail', { reasonCodes: ['unsafe_value_detected'], safeSummaryOnly: true });
    report.marker = ACTIVE_MARKER;
    report.harnessVersion = ACTIVE_HARNESS_VERSION;
    return report;
  }
  return out;
}

function manifestPath(env = process.env) {
  if (env.CODEX_HARNESS_MODE === 'target' && fs.existsSync(TARGET_MANIFEST)) return TARGET_MANIFEST;
  if (fs.existsSync(SOURCE_MANIFEST)) return SOURCE_MANIFEST;
  return TARGET_MANIFEST;
}

function manifestIncludesActiveSelfTest(manifest) {
  const values = [
    manifest.activeSelfTestSuite,
    manifest.activeSelfTestStatusKey,
    ...(manifest.requiredStatuses || []),
    ...(manifest.scriptNames || []),
  ].map(String);
  return values.includes('v106')
    || values.includes(ACTIVE_STATUS_KEY)
    || values.includes(ACTIVE_SELF_TEST_FILE)
    || values.includes(ACTIVE_SELF_TEST_FILE.replace('scripts/', ''));
}

export function buildActiveSelfTestRegistryReport(input = parseJson(process.env.CODEX_ACTIVE_SELF_TEST_REGISTRY_JSON) || {}, env = process.env) {
  const reasonCodes = [];
  const manifestFile = input.manifestPath || manifestPath(env);
  const manifestJson = input.manifest || readJson(manifestFile);
  const manifest = manifestJson?.ok ? manifestJson.value : manifestJson;
  const expectedVersion = input.expectedVersion || ACTIVE_HARNESS_VERSION;
  const activeStatusKey = input.activeStatusKey || manifest?.activeSelfTestStatusKey || ACTIVE_STATUS_KEY;
  const registeredVersion = input.registeredVersion || manifest?.harnessVersion || manifest?.sourceHarnessVersion || ACTIVE_HARNESS_VERSION;
  const selfTestFilePresent = input.selfTestFilePresent ?? fs.existsSync(ACTIVE_SELF_TEST_FILE);
  const localGateHasStatus = input.localGateHasStatus ?? (readText('scripts/codex-local-quality-gate.mjs') || '').includes(ACTIVE_STATUS_KEY);
  const manifestHasSelfTest = input.manifestHasSelfTest ?? (manifest && manifestIncludesActiveSelfTest(manifest));

  if (input.invalidInput || !manifest) reasonCodes.push('active_self_test_registry_missing');
  if (registeredVersion !== expectedVersion) reasonCodes.push('active_self_test_registry_missing');
  if (activeStatusKey !== ACTIVE_STATUS_KEY) reasonCodes.push('active_self_test_registry_missing');
  if (!parseBool(selfTestFilePresent)) reasonCodes.push('active_self_test_registry_missing');
  if (!parseBool(manifestHasSelfTest)) reasonCodes.push('active_self_test_registry_missing');
  if (!parseBool(localGateHasStatus)) reasonCodes.push('active_self_test_registry_missing');
  if (parseBool(input.legacyActive) || activeStatusKey === 'v105SelfTestStatus') reasonCodes.push('legacy_self_test_misclassified');

  return safe(reasonCodes.length ? 'fail' : 'pass', {
    reasonCodes,
    activeStatusKey,
    registeredVersion,
    expectedVersion,
    activeSelfTestFile: ACTIVE_SELF_TEST_FILE,
    manifestSource: manifestFile,
  });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const report = buildActiveSelfTestRegistryReport();
  writeJsonReport(report, 'CODEX_ACTIVE_SELF_TEST_REGISTRY_REPORT');
  exitFor(report);
}
