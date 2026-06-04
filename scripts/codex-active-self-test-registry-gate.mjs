#!/usr/bin/env node
// CODEX_QUALITY_HARNESS_FILE v1.0.5
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { HARNESS_VERSION, readText, scanObjectForUnsafe, simpleStatus, writeJsonReport, exitFor } from './codex-v080-lib.mjs';

function manifestText() {
  return readText('CODEX_SOURCE_HARNESS_MANIFEST.json') ||
    readText('docs/process/CODEX_HARNESS_MANIFEST.json') ||
    '';
}

function activeSuite(version = HARNESS_VERSION) {
  const compact = String(version || '').replace(/\./g, '');
  return {
    activeStatusKey: `v${compact}SelfTestStatus`,
    activeScriptName: `codex-v${compact}-self-test.mjs`,
    registeredVersion: String(version || ''),
  };
}

export function buildActiveSelfTestRegistryReport(input = {}, env = process.env) {
  const version = input.registeredVersion || env.CODEX_ACTIVE_HARNESS_VERSION || HARNESS_VERSION;
  const suite = activeSuite(version);
  const reasons = [];
  const manifest = manifestText();
  if (!manifest.includes(suite.activeScriptName)) reasons.push('active_self_test_registry_missing');
  if (!fs.existsSync(`scripts/${suite.activeScriptName}`)) reasons.push('active_self_test_registry_missing');
  if (!readText('scripts/codex-local-quality-gate.mjs').includes(suite.activeStatusKey)) {
    reasons.push('active_self_test_registry_missing');
  }
  const report = simpleStatus('activeSelfTestRegistryStatus', reasons.length ? 'fail' : 'pass', {
    reasonCodes: [...new Set(reasons)],
    activeStatusKey: suite.activeStatusKey,
    registeredVersion: suite.registeredVersion,
    safeSummaryOnly: true,
  });
  return scanObjectForUnsafe(report).length
    ? simpleStatus('activeSelfTestRegistryStatus', 'fail', { reasonCodes: ['unsafe_value_detected'], safeSummaryOnly: true })
    : report;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const report = buildActiveSelfTestRegistryReport();
  writeJsonReport(report, 'CODEX_ACTIVE_SELF_TEST_REGISTRY_REPORT');
  exitFor(report);
}
