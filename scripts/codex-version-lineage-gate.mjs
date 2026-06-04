#!/usr/bin/env node
// CODEX_QUALITY_HARNESS_FILE v1.0.6
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readJson, scanObjectForUnsafe, simpleStatus, writeJsonReport, exitFor, normalizePath } from './codex-v080-lib.mjs';

const HARNESS_VERSION = '1.0.6';
const marker = `CODEX_QUALITY_HARNESS_FILE v${HARNESS_VERSION}`;

function stamp(report) {
  report.marker = marker;
  report.harnessVersion = HARNESS_VERSION;
  return report;
}

function readText(file) {
  try {
    return fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '');
  } catch {
    return '';
  }
}

function firstMarkerVersion(file) {
  const match = readText(file).match(/CODEX_QUALITY_HARNESS_FILE v([0-9]+\.[0-9]+\.[0-9]+)/);
  return match ? match[1] : '';
}

function listRepoFiles(dir = '.') {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['.git', 'node_modules', 'dist', 'build'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    const normalized = normalizePath(full);
    if (normalized.startsWith('profiles/')) continue;
    if (entry.isDirectory()) out.push(...listRepoFiles(full));
    else out.push(normalized);
  }
  return out;
}

function isActiveHarnessManagedMarkerFile(file) {
  return file === 'CODEX_SOURCE_HARNESS_MANIFEST.json'
    || file === 'docs/process/CODEX_HARNESS_MANIFEST.json'
    || file === '.github/workflows/quality-gate.yml'
    || /^scripts\/codex-.*\.mjs$/.test(file);
}

function manifestPath(env = process.env) {
  if (env.CODEX_HARNESS_MODE === 'target' && fs.existsSync('docs/process/CODEX_HARNESS_MANIFEST.json')) {
    return 'docs/process/CODEX_HARNESS_MANIFEST.json';
  }
  if (fs.existsSync('CODEX_SOURCE_HARNESS_MANIFEST.json')) return 'CODEX_SOURCE_HARNESS_MANIFEST.json';
  return 'docs/process/CODEX_HARNESS_MANIFEST.json';
}

function requiredPaths(env = process.env) {
  const target = env.CODEX_HARNESS_MODE === 'target' && fs.existsSync('docs/process/CODEX_HARNESS_MANIFEST.json');
  return [
    ...(target ? ['docs/process/CODEX_HARNESS_MANIFEST.json'] : ['README.md', 'CODEX_SOURCE_HARNESS_MANIFEST.json']),
    'docs/process/CODEX_KNOWLEDGE_MAP.json',
    'scripts/codex-v080-lib.mjs',
    'scripts/codex-local-quality-gate.mjs',
    'scripts/codex-v106-self-test.mjs',
    'scripts/codex-v106-gate-lib.mjs',
    '.github/workflows/quality-gate.yml',
  ];
}

export function buildVersionLineageReport(env = process.env) {
  const failures = [];
  const warnings = [];
  const paths = requiredPaths(env);
  const manifestFile = manifestPath(env);
  const manifestJson = readJson(manifestFile);

  if (!manifestJson.ok) failures.push('version_lineage_manifest_missing');
  else {
    const manifest = manifestJson.value;
    if (manifest.marker !== marker) failures.push('active_marker_version_mismatch');
    if (manifest.harnessVersion !== HARNESS_VERSION) failures.push('version_lineage_failed');
    if (manifest.sourceHarnessVersion && manifest.sourceHarnessVersion !== HARNESS_VERSION) failures.push('version_lineage_failed');
    if (manifest.activeSelfTestSuite !== 'v106') failures.push('version_lineage_active_suite_mismatch');
    if (manifest.activeSelfTestStatusKey !== 'v106SelfTestStatus') failures.push('version_lineage_active_status_key_mismatch');
    const legacy = manifest.legacySelfTests || {};
    for (const suite of ['v092', 'v093', 'v094', 'v095']) {
      if (!fs.existsSync(`scripts/codex-${suite}-self-test.mjs`) && legacy[suite] !== 'blocking') {
        warnings.push(`legacy_${suite}_self_test_absent_not_applicable`);
      }
    }
  }

  const missing = paths.filter((file) => !fs.existsSync(file));
  for (const file of missing) failures.push(`missing:${file}`);

  const readme = readText('README.md');
  if (fs.existsSync('README.md') && !readme.includes(`Version: v${HARNESS_VERSION}`)) failures.push('version_lineage_readme_mismatch');

  const localGate = readText('scripts/codex-local-quality-gate.mjs');
  const lib = readText('scripts/codex-v080-lib.mjs');
  if (!localGate.includes(`HARNESS_VERSION = '${HARNESS_VERSION}'`)) failures.push('version_lineage_local_gate_mismatch');
  if (!lib.includes(`HARNESS_VERSION = '${HARNESS_VERSION}'`)) warnings.push('compatibility_lib_version_constant_advisory');

  for (const file of paths.filter((item) => fs.existsSync(item))) {
    const version = firstMarkerVersion(file);
    if (version && version !== HARNESS_VERSION) failures.push(`active_marker_version_mismatch:${file}`);
  }

  for (const file of listRepoFiles()) {
    if (!isActiveHarnessManagedMarkerFile(file)) continue;
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) continue;
    const version = firstMarkerVersion(file);
    if (!version) continue;
    if (version !== HARNESS_VERSION) {
      if (/archive|historical|past-pr|AGENTS\.md/i.test(file)) warnings.push(`archived_marker:${file}`);
      else failures.push(`active_marker_version_mismatch:${file}`);
    }
  }

  const status = failures.length ? 'fail' : 'pass';
  const report = stamp(simpleStatus('versionLineageStatus', status, {
    reasonCodes: [...new Set(failures.map((item) => item.split(':')[0]))],
    warnings,
    checkedFiles: paths.length,
  }));
  if (scanObjectForUnsafe(report).length) return stamp(simpleStatus('versionLineageStatus', 'fail', { reasonCodes: ['version_lineage_failed'] }));
  return report;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const report = buildVersionLineageReport();
  writeJsonReport(report, 'CODEX_VERSION_LINEAGE_REPORT');
  exitFor(report);
}
