#!/usr/bin/env node

// CODEX_QUALITY_HARNESS_FILE v1.0.7

import fs from 'node:fs';

import { fileURLToPath } from 'node:url';

import { scanObjectForUnsafe, simpleStatus, writeJsonReport, exitFor } from './codex-v080-lib.mjs';
import { currentVersion } from './codex-harness-version.mjs';

const HARNESS_VERSION = currentVersion;



const RAW_LOOKING = /raw|stdout|stderr|payload|diff|secret|token|endpoint|private/i;

const PRIMARY_HUMAN_ARTIFACTS = [

  'codex-diagnostic-consolidated-summary.json',

  'codex-quality-gate-safe-summary.json',

  'codex-failure-reasons.json',

];

const REQUIRED_ARTIFACTS = [

  'codex-diagnostic-consolidated-summary.json',

  'codex-quality-gate-safe-summary.json',

  'codex-failure-reasons.json',

  'codex-safe-artifact-index.json',

];

const DEFAULT_ARTIFACT_BUDGET = 16;

export const V127_REQUIRED_SAFE_ARTIFACTS = [
  'codex-quality-gate-safe-summary.json',
  'codex-final-decision.safe.json',
  'codex-orchestration-capsule.safe.json',
  'codex-worker-proof.safe.json',
  'codex-owner-decision-brief.safe.json',
  'codex-evidence-capsule.safe.json',
  'codex-decision-capsule.safe.json',
  'codex-artifact-consistency.safe.json',
  'codex-minimal-blockers.safe.json',
  'codex-safe-artifact-index.json',
  'codex-diagnostic-consolidated-summary.json',
];

export const V127_CANONICAL_OPTIONAL_SAFE_ARTIFACTS = [
  'codex-evidence-pack.normalized.json',
  'codex-self-test-cases.safe.json',
  'codex-failure-reasons.json',
  'codex-invalid-report-recovery-summary.json',
  'codex-target-quality-summary.json',
  'codex-source-final-summary.json',
  'codex-target-final-summary.json',
  'codex-safe-artifact-classification.safe.json',
  'codex-pr-evidence-rendered.safe.json',
  'codex-evidence-auto-repair-hint.safe.json',
  'codex-same-head-artifact-evidence.safe.json',
  'codex-docker-smoke-artifact.safe.json',
  'codex-pr-evidence-compact.safe.json',
  'codex-product-context-safe-artifact.safe.json',
  'codex-product-baseline-continuity.safe.json',
  'codex-false-positive-budget.safe.json',
  'codex-agent-session-governance.safe.json',
  'codex-evidence-minimality.safe.json',
  'codex-safe-artifact-next-action.safe.json',
  'codex-skill-evidence-link.safe.json',
  'codex-workflow-preflight.safe.json',
  'codex-test-metrics.safe.json',
  'codex-dataset-audit-v2.safe.json',
  'codex-browser-smoke-json-artifact.safe.json',
  'codex-runtime-latency-measurement.safe.json',
  'codex-owner-decision-digest.safe.json',
];

function isValidHeadSha(value) {
  return /^[A-Fa-f0-9]{40}$/.test(String(value || '').trim());
}

function safeReadJson(file) {
  try {
    const text = fs.readFileSync(file, 'utf8');
    return { status: 'pass', value: JSON.parse(text), byteLength: Buffer.byteLength(text) };
  } catch {
    return { status: 'fail', value: null, byteLength: 0 };
  }
}

function extractArtifactHead(value = {}) {
  return String(value.head || value.headSha || value.decisionCapsule?.head || value.decisionCapsule?.headSha || value.finalDecision?.headSha || '').trim();
}

function physicalCodexArtifacts(directory) {
  try {
    return fs.readdirSync(directory)
      .filter((name) => /^codex-/.test(name) && /\.(json|safe\.json)$/.test(name))
      .filter((name) => fs.statSync(`${directory}/${name}`).isFile())
      .sort();
  } catch {
    return [];
  }
}

export function buildPhysicalSafeArtifactIndex(directory = process.cwd(), options = {}) {
  const mode = options.mode || process.env.CODEX_HARNESS_MODE || 'target';
  const expectedHeadSha = String(options.head || options.headSha || process.env.CODEX_PR_HEAD_SHA || process.env.GITHUB_SHA || '').trim();
  const requiredArtifacts = options.requiredArtifacts || V127_REQUIRED_SAFE_ARTIFACTS;
  const canonicalOptionalArtifacts = options.canonicalOptionalArtifacts || V127_CANONICAL_OPTIONAL_SAFE_ARTIFACTS;
  const physical = physicalCodexArtifacts(directory);
  const physicalSet = new Set(physical);
  const allCanonical = [...new Set([...requiredArtifacts, ...canonicalOptionalArtifacts, ...physical])].sort();
  const duplicateArtifacts = allCanonical.filter((name, index) => allCanonical.indexOf(name) !== index);
  const physicalButUnindexed = physical.filter((name) => !allCanonical.includes(name));
  const artifacts = allCanonical.map((artifactName) => {
    const file = `${directory}/${artifactName}`;
    const physicalFilePresent = physicalSet.has(artifactName);
    const parsed = physicalFilePresent ? safeReadJson(file) : { status: 'not_applicable', value: null, byteLength: 0 };
    const loadBearing = requiredArtifacts.includes(artifactName);
    const canonicalOptional = canonicalOptionalArtifacts.includes(artifactName);
    const observedHeadSha = parsed.value ? extractArtifactHead(parsed.value) : '';
    const headRequired = loadBearing;
    const headMatchStatus = headRequired
      ? (isValidHeadSha(expectedHeadSha) && observedHeadSha === expectedHeadSha ? 'pass' : 'fail')
      : 'not_required_with_reason';
    const safeOutputScanStatus = physicalFilePresent && parsed.status === 'pass' && parsed.value?.safeSummaryOnly !== false && scanObjectForUnsafe(parsed.value).length === 0
      ? 'pass'
      : (physicalFilePresent ? 'fail' : 'not_applicable');
    const reasonCodes = [
      ...(!physicalFilePresent && loadBearing ? ['artifact_required_missing'] : []),
      ...(physicalFilePresent && parsed.byteLength <= 0 ? ['artifact_empty'] : []),
      ...(physicalFilePresent && parsed.status !== 'pass' ? ['artifact_json_parse_failed'] : []),
      ...(physicalFilePresent && safeOutputScanStatus !== 'pass' ? ['safe_output_scan_failed'] : []),
      ...(headRequired && headMatchStatus !== 'pass' ? ['artifact_head_mismatch'] : []),
    ];
    const present = physicalFilePresent
      && parsed.byteLength > 0
      && parsed.status === 'pass'
      && safeOutputScanStatus === 'pass'
      && (!headRequired || headMatchStatus === 'pass');
    return {
      artifactName,
      path: artifactName,
      artifactClass: loadBearing ? 'load_bearing' : (canonicalOptional ? 'canonical_optional' : 'auxiliary'),
      producer: artifactName === 'codex-quality-gate-safe-summary.json' ? 'codex-local-quality-gate' : 'codex-safe-artifact-writer',
      status: present ? 'present' : (physicalFilePresent ? 'missing' : (loadBearing ? 'missing' : 'not_applicable')),
      physicalFilePresent,
      jsonParseStatus: physicalFilePresent ? parsed.status : 'not_applicable',
      safeOutputScanStatus,
      loadBearing,
      expectedHeadSha: expectedHeadSha || null,
      observedHeadSha: observedHeadSha || null,
      headMatchStatus,
      mode,
      safeSummaryOnly: true,
      reasonCodes,
    };
  });
  const presentPaths = new Set(artifacts.filter((item) => item.status === 'present').map((item) => item.path || item.artifactName));
  const indexedPresentButAbsent = [...presentPaths].filter((name) => !physicalSet.has(name));
  const missingArtifacts = artifacts.filter((item) => item.loadBearing && item.status !== 'present').map((item) => item.artifactName);
  const invalidJsonArtifacts = artifacts.filter((item) => item.physicalFilePresent && item.jsonParseStatus !== 'pass').map((item) => item.artifactName);
  const safeOutputFailures = artifacts.filter((item) => item.physicalFilePresent && item.safeOutputScanStatus !== 'pass').map((item) => item.artifactName);
  const headMismatches = artifacts.filter((item) => item.loadBearing && item.headMatchStatus !== 'pass').map((item) => item.artifactName);
  const status = physicalButUnindexed.length
    || indexedPresentButAbsent.length
    || missingArtifacts.length
    || duplicateArtifacts.length
    || invalidJsonArtifacts.length
    || safeOutputFailures.length
    || headMismatches.length
    ? 'fail'
    : 'pass';
  return {
    schemaVersion: '1.2.7',
    harnessVersion: HARNESS_VERSION,
    mode,
    head: expectedHeadSha || null,
    headSha: expectedHeadSha || null,
    artifactCountPopulation: 'canonical_root_safe_artifacts',
    artifactCount: artifacts.length,
    physicalCanonicalFileCount: physical.length,
    indexedPresentFileCount: presentPaths.size,
    physicalButUnindexedCount: physicalButUnindexed.length,
    indexedPresentButAbsentCount: indexedPresentButAbsent.length,
    duplicateBasenameCount: duplicateArtifacts.length,
    missingRequiredArtifactCount: missingArtifacts.length,
    invalidJsonArtifactCount: invalidJsonArtifacts.length,
    safeOutputFailureCount: safeOutputFailures.length,
    headMismatchCount: headMismatches.length,
    loadBearingArtifacts: requiredArtifacts,
    canonicalOptionalArtifacts,
    auxiliaryArtifacts: artifacts.filter((item) => item.artifactClass === 'auxiliary').map((item) => item.artifactName),
    notApplicableArtifacts: artifacts.filter((item) => item.status === 'not_applicable').map((item) => item.artifactName),
    physicalButUnindexed,
    indexedPresentButAbsent,
    missingArtifacts,
    duplicateArtifacts,
    invalidJsonArtifacts,
    safeOutputFailures,
    headMismatches,
    artifacts,
    status,
    reasonCodes: [
      ...(physicalButUnindexed.length ? ['physical_canonical_file_unindexed'] : []),
      ...(indexedPresentButAbsent.length ? ['indexed_present_artifact_absent'] : []),
      ...(missingArtifacts.length ? ['artifact_required_missing'] : []),
      ...(duplicateArtifacts.length ? ['artifact_duplicate_basename'] : []),
      ...(invalidJsonArtifacts.length ? ['artifact_json_parse_failed'] : []),
      ...(safeOutputFailures.length ? ['safe_output_scan_failed'] : []),
      ...(headMismatches.length ? ['artifact_head_mismatch'] : []),
    ],
    safeSummaryOnly: true,
  };
}



export function buildSafeArtifactIndex(artifacts = [], mode = process.env.CODEX_HARNESS_MODE || 'source', options = {}) {

  const entries = artifacts.map((item) => ({

    artifactName: String(item.artifactName || item.name || '').slice(0, 100),

    path: String(item.path || '').replace(/\\/g, '/').slice(0, 180),

    producer: String(item.producer || 'codex-workflow-quality-runner').slice(0, 80),

    status: ['present', 'missing', 'not_applicable'].includes(item.status) ? item.status : 'present',

    mode,

    safeSummaryOnly: item.safeSummaryOnly !== false,

    rawLogIncluded: false,

    containsSecrets: false,

    containsEndpointValues: false,

    nextAction: String(item.nextAction || '').slice(0, 160),

    reasonCodes: Array.isArray(item.reasonCodes) ? item.reasonCodes.slice(0, 10) : [],

  }));

  const names = entries.map((item) => item.artifactName);

  const missingArtifacts = options.enforceRequired

    ? REQUIRED_ARTIFACTS.filter((name) => !names.includes(name) && !artifacts.some((item) => item.artifactName === name && item.status === 'not_applicable'))

    : [];

  const duplicateArtifacts = names.filter((name, index) => names.indexOf(name) !== index);

  const primaryHumanArtifacts = entries.filter((item) => PRIMARY_HUMAN_ARTIFACTS.includes(item.artifactName)).map((item) => item.artifactName);

  const machineArtifacts = entries.filter((item) => !PRIMARY_HUMAN_ARTIFACTS.includes(item.artifactName)).map((item) => item.artifactName);

  const maxArtifacts = Number(options.maxArtifacts || process.env.CODEX_ARTIFACT_BUDGET || DEFAULT_ARTIFACT_BUDGET);

  const artifactBudget = {

    maxArtifacts,

    maxPrimaryHumanArtifacts: 3,

    artifactCount: entries.length,

    budgetExceeded: entries.length > maxArtifacts,

  };

  const unsafePath = entries.some((item) => RAW_LOOKING.test(item.path) && !/safe-summary|failure-reasons|normalized|safe\.json|final-summary|artifact-index|preflight|target-quality|target-quality-blocker-digest|diagnostic-consolidated-summary|reason-summary|test-metrics|quality-gate|self-test-cases|same-head-artifact-evidence|same-head-evidence-refresh|docker-smoke-artifact|pr-evidence-compact|pr-evidence-auto-repair-hint|product-context-safe-artifact|product-baseline-continuity|false-positive-budget|agent-session-governance|evidence-minimality|safe-artifact-next-action|safe-artifact-bundle-completeness|skill-evidence-link|owner-summary-compact|browser-smoke-artifact|failure-to-repair-plan|human-review-digest|remote-product-evidence|remote-npm-diagnostic-normalization|five-line-owner-digest|browser-smoke-visual|runtime-latency-safe-metric|live2d-dataset-row-audit-runner|trusted-loader-evidence-enforcer|avatar-ux-safety-runner|formal-evidence-precedence|lifeboat-semantics|placeholder-only-evidence|actions-blocker-recovery|pr-context-rerun-assistant|dataset-audit-v2-p0|game-tool-adapter-fixture-readiness|beloved-avatar-safety-readiness/i.test(item.path));

  const unsafe = unsafePath || entries.some((item) => scanObjectForUnsafe(item).length || !item.safeSummaryOnly || item.rawLogIncluded || item.containsSecrets || item.containsEndpointValues);

  const requiredMissing = missingArtifacts.length > 0;

  return {

    schemaVersion: '0.8.4',

    harnessVersion: HARNESS_VERSION,

    mode,

    artifacts: entries,

    artifactBudget,

    requiredArtifacts: REQUIRED_ARTIFACTS,

    optionalArtifacts: entries.map((item) => item.artifactName).filter((name) => !REQUIRED_ARTIFACTS.includes(name)),

    missingArtifacts,

    duplicateArtifacts: [...new Set(duplicateArtifacts)],

    primaryHumanArtifacts,

    machineArtifacts,

    status: unsafe || requiredMissing ? 'fail' : artifactBudget.budgetExceeded ? 'warning' : 'pass',

    reasonCodes: [

      ...(unsafe ? ['safe_artifact_index_invalid'] : []),

      ...(requiredMissing ? ['artifact_required_missing'] : []),

      ...(artifactBudget.budgetExceeded ? ['artifact_budget_exceeded'] : []),

    ],

    safeSummaryOnly: true,

  };

}



function defaultArtifacts(mode) {

  const names = [

    'codex-diagnostic-consolidated-summary.json',

    'codex-quality-gate-safe-summary.json',

    'codex-failure-reasons.json',

    'codex-evidence-pack.normalized.json',

    'codex-self-test-cases.safe.json',

    'codex-safe-artifact-index.json',

    'codex-safe-artifact-classification.safe.json',

    'codex-pr-evidence-rendered.safe.json',

    'codex-evidence-auto-repair-hint.safe.json',

    'codex-same-head-artifact-evidence.safe.json',

    'codex-docker-smoke-artifact.safe.json',

    'codex-pr-evidence-compact.safe.json',

    'codex-product-context-safe-artifact.safe.json',

    'codex-product-baseline-continuity.safe.json',

    'codex-false-positive-budget.safe.json',

    'codex-agent-session-governance.safe.json',

    'codex-evidence-minimality.safe.json',

    'codex-safe-artifact-next-action.safe.json',

    'codex-skill-evidence-link.safe.json',

    'codex-owner-summary-compact.safe.json',

    'codex-browser-smoke-artifact.safe.json',

    'codex-failure-to-repair-plan.safe.json',

    'codex-human-review-digest.safe.json',

    mode === 'target' ? 'codex-target-quality-summary.json' : 'codex-source-final-summary.json',

    mode === 'target' ? 'codex-target-final-summary.json' : '',

    'codex-workflow-preflight.safe.json',

    'codex-test-metrics.safe.json',

  ].filter(Boolean);

  return names.map((name) => ({

    artifactName: name,

    path: name,

    status: fs.existsSync(name) ? 'present' : 'missing',

    reasonCodes: fs.existsSync(name) ? [] : ['safe_artifact_missing'],

      nextAction: fs.existsSync(name) ? '' : 'Artifact was not generated in this run.',

      safeSummaryOnly: true,

    }));

}



export function buildSafeArtifactIndexReport(env = process.env) {

  const mode = env.CODEX_HARNESS_MODE || (fs.existsSync('CODEX_SOURCE_HARNESS_MANIFEST.json') ? 'source' : 'target');

  if (!env.CODEX_SAFE_ARTIFACT_INDEX_INPUT && env.CODEX_WORKFLOW_ARTIFACT_CONTEXT !== '1' && !fs.existsSync('codex-quality-gate-safe-summary.json')) {

    return simpleStatus('safeArtifactIndexStatus', 'not_applicable', { reasonCodes: ['safe_artifact_index_not_requested'] });

  }

  let artifacts = defaultArtifacts(mode);

  if (env.CODEX_SAFE_ARTIFACT_INDEX_INPUT) {

    try {

      artifacts = JSON.parse(env.CODEX_SAFE_ARTIFACT_INDEX_INPUT);

    } catch {

      return simpleStatus('safeArtifactIndexStatus', 'fail', { reasonCodes: ['safe_artifact_index_invalid'] });

    }

  }

  const index = buildSafeArtifactIndex(artifacts, mode, { enforceRequired: true });

  return simpleStatus('safeArtifactIndexStatus', index.status, {

    reasonCodes: index.reasonCodes,

    artifactCount: index.artifacts.length,

    index,

  });

}



if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {

  try {
    if (process.argv.includes('--validate-physical-bundle')) {
      const directoryFlagIndex = process.argv.indexOf('--dir');
      const headFlagIndex = process.argv.indexOf('--head');
      const directory = directoryFlagIndex >= 0 ? process.argv[directoryFlagIndex + 1] : process.cwd();
      const head = headFlagIndex >= 0 ? process.argv[headFlagIndex + 1] : undefined;
      const index = buildPhysicalSafeArtifactIndex(directory, { head });
      if (process.argv.includes('--write-artifact')) {
        fs.writeFileSync(`${directory}/codex-safe-artifact-index.json`, JSON.stringify(index, null, 2));
      }
      const report = simpleStatus('safeArtifactIndexStatus', index.status, {
        reasonCodes: index.reasonCodes,
        physicalCanonicalFileCount: index.physicalCanonicalFileCount,
        indexedPresentFileCount: index.indexedPresentFileCount,
        physicalButUnindexedCount: index.physicalButUnindexedCount,
        indexedPresentButAbsentCount: index.indexedPresentButAbsentCount,
        missingRequiredArtifactCount: index.missingRequiredArtifactCount,
        duplicateBasenameCount: index.duplicateBasenameCount,
        invalidJsonArtifactCount: index.invalidJsonArtifactCount,
        safeOutputFailureCount: index.safeOutputFailureCount,
        headMismatchCount: index.headMismatchCount,
        index,
      });
      writeJsonReport(report, 'CODEX_SAFE_ARTIFACT_INDEX_REPORT');
      process.exit(index.status === 'pass' ? 0 : 1);
    }

    const report = buildSafeArtifactIndexReport();

    if (process.argv.includes('--write-artifact')) {

      fs.writeFileSync('codex-safe-artifact-index.json', JSON.stringify(report.safeArtifactIndexStatus.index, null, 2));

    }

    writeJsonReport(report, 'CODEX_SAFE_ARTIFACT_INDEX_REPORT');

    exitFor(report);

  } catch {

    const report = simpleStatus('safeArtifactIndexStatus', 'fail', { reasonCodes: ['safe_artifact_index_invalid'] });

    writeJsonReport(report, 'CODEX_SAFE_ARTIFACT_INDEX_REPORT');

    process.exit(1);

  }

}
