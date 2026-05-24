#!/usr/bin/env node
// CODEX_QUALITY_HARNESS_FILE v0.8.2
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { HARNESS_VERSION, marker, scanObjectForUnsafe, writeJsonReport } from './codex-v080-lib.mjs';
import { evaluateWorkflowReport } from './codex-workflow-quality-runner.mjs';
import { classifyChange, loadClassificationRules } from './codex-change-classification-gate.mjs';
import { buildProductVerificationReport } from './codex-product-verification-gate.mjs';
import { buildProductVerificationEvidenceReport } from './codex-product-verification-evidence-normalize.mjs';
import { buildTestMetricsReport } from './codex-test-metrics-collect.mjs';
import { buildStalePrAuditReport } from './codex-stale-pr-audit-gate.mjs';
import { buildCompactReasonSummary } from './codex-reason-summary.mjs';
import { buildStagingEvidenceReport } from './codex-staging-evidence-gate.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.dirname(here);

function run(script, options = {}) {
  const result = spawnSync(process.execPath, [path.join(repo, script), '--json'], {
    cwd: options.cwd || repo,
    env: { ...process.env, ...(options.env || {}) },
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  try {
    return { code: result.status, parsed: JSON.parse(result.stdout || '{}') };
  } catch {
    return { code: result.status, parsed: null };
  }
}

function write(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

function assertCase(name, ok, failures, cases, status = ok ? 'pass' : 'fail') {
  cases.push({ name, status });
  if (!ok) failures.push(name);
}

function passStatus(status = 'pass') {
  return { status, safeSummaryOnly: true, reasonCodes: [] };
}

function runWorkflowRunner(reportFile, cwd) {
  return spawnSync(process.execPath, [path.join(repo, 'scripts', 'codex-workflow-quality-runner.mjs'), '--report', reportFile, '--gate-exit', '1'], {
    cwd,
    env: { ...process.env, CODEX_QUALITY_REPORT: 'json' },
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function safeArtifactFilesExist(dir) {
  return [
    'codex-quality-gate-safe-summary.json',
    'codex-failure-reasons.json',
    'codex-evidence-pack.normalized.json',
    'codex-target-quality-summary.json',
  ].every((name) => fs.existsSync(path.join(dir, name)));
}

function sourcePassReport() {
  const report = {
    status: 'pass',
    mergeReady: true,
    humanReviewRequired: false,
    qualityScoreStatus: { status: 'pass', score: 100, safeSummaryOnly: true },
  };
  for (const key of [
    'sourceHarnessValidationStatus',
    'profileTemplateCompatibilityStatus',
    'genericHarnessCoreStatus',
    'agentsContextStatus',
    'environmentReadinessStatus',
    'goldenSetStatus',
    'changeClassificationStatus',
    'productVerificationStatus',
    'productVerificationEvidenceStatus',
    'testMetricsStatus',
    'stalePrAuditStatus',
    'stagingEvidenceStatus',
    'reasonSummaryStatus',
    'bestOfNEvidenceStatus',
    'taskQueueLiteStatus',
    'safeTraceSchemaStatus',
    'curatorReportStatus',
    'offlineEvolutionProposalStatus',
    'testCoverageEvidenceStatus',
    'performanceEvidenceStatus',
    'agentMemoryPolicyStatus',
    'skillLifecyclePolicyStatus',
    'curatorSuggestionStatus',
    'selfEvolutionPolicyStatus',
    'safeArtifactValidation',
    'outputShapeStatus',
    'openaiCodexMethodStatus',
    'methodSupportStatus',
    'productionReadinessStatus',
    'evidenceIntegrityStatus',
    'hermesInvariantStatus',
    'evidencePackStatus',
    'humanConfirmationObjectStatus',
    'safeOutputScanStatus',
    'ciReplayStatus',
    'prBodyLintStatus',
    'failureReasonCatalogStatus',
    'v071SelfTestStatus',
    'v072SelfTestStatus',
    'v080SelfTestStatus',
    'v081SelfTestStatus',
    'v082SelfTestStatus',
  ]) report[key] = passStatus();
  return report;
}

function targetPassReport() {
  const report = {
    status: 'pass',
    mergeReady: true,
    targetMergeReady: true,
    targetQualityScoreStatus: { status: 'pass', score: 100, safeSummaryOnly: true },
  };
  for (const key of [
    'targetManifestStatus',
    'secretScan',
    'agentsContextStatus',
    'environmentReadinessStatus',
    'changeClassificationStatus',
    'productVerificationStatus',
    'productVerificationEvidenceStatus',
    'testMetricsStatus',
    'stalePrAuditStatus',
    'stagingEvidenceStatus',
    'reasonSummaryStatus',
    'safeOutputScanStatus',
    'v080SelfTestStatus',
    'v081SelfTestStatus',
    'v082SelfTestStatus',
    'safeArtifactValidation',
    'outputShapeStatus',
  ]) report[key] = passStatus();
  return report;
}

function withRulesTmp(callback) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'codex-v082-'));
  fs.mkdirSync(path.join(tmp, 'docs', 'process'), { recursive: true });
  fs.copyFileSync(path.join(repo, 'docs', 'process', 'CODEX_CHANGE_CLASSIFICATION_RULES.json'), path.join(tmp, 'docs', 'process', 'CODEX_CHANGE_CLASSIFICATION_RULES.json'));
  return callback(tmp);
}

function statusEvidence(status = 'PASS') {
  return { status, evidenceRef: `${status.toLowerCase()}_safe_evidence_ref` };
}

function stagingEvidence(overrides = {}) {
  const base = {
    marker,
    schemaVersion: '1.0.0',
    profile: 'funky',
    environment: 'staging',
    evidenceType: 'no_tx_smoke',
    headSha: '2222222222222222222222222222222222222222',
    checkedAt: '2026-01-01T00:00:00Z',
    checkedByRole: 'release-manager',
    overallStatus: 'PASS',
    stagingFrontendUrlStatus: statusEvidence(),
    stagingBackendUrlStatus: statusEvidence(),
    httpsStatus: statusEvidence(),
    dnsStatus: statusEvidence(),
    nginxStatus: statusEvidence(),
    backendRuntimeEnvPresence: statusEvidence(),
    corsOriginSummary: statusEvidence(),
    cookieDomainSummary: statusEvidence(),
    frontendPublicEnvSummary: statusEvidence(),
    deployedMainSha: statusEvidence(),
    noTxSmokeSummary: statusEvidence(),
    runtimeLogInspectionSummary: statusEvidence(),
    secretsIncluded: false,
    rawLogsIncluded: false,
    txExecuted: false,
    fundedTxExecuted: false,
    residualRisks: ['safe summary residual risk'],
    nextActions: ['safe summary next action'],
  };
  return { ...base, ...overrides };
}

function stagingEnv(evidence, extra = {}) {
  return {
    CODEX_EVENT_NAME: 'pull_request',
    CODEX_PR_HEAD_SHA: '2222222222222222222222222222222222222222',
    CODEX_CHANGED_FILES: 'docs/process/FUNKY_STAGING_NO_TX_PREFLIGHT_EVIDENCE.json',
    CODEX_STAGING_EVIDENCE_INLINE_JSON: JSON.stringify(evidence),
    CODEX_PR_BODY: 'Staging readiness claimed: no.',
    ...extra,
  };
}

function buildReport() {
  const failures = [];
  const cases = [];

  let result = evaluateWorkflowReport(sourcePassReport(), { eventName: 'workflow_dispatch' });
  assertCase('workflow runner accepts source pass report', result.status === 'pass', failures, cases, result.status);
  const failedSource = sourcePassReport();
  failedSource.agentsContextStatus = passStatus('fail');
  result = evaluateWorkflowReport(failedSource, { eventName: 'pull_request' });
  assertCase('workflow runner rejects source fail report', result.status === 'fail', failures, cases, result.status);
  result = evaluateWorkflowReport(targetPassReport(), { eventName: 'pull_request' });
  assertCase('workflow runner accepts target pass report', result.status === 'pass', failures, cases, result.status);
  const manualSource = sourcePassReport();
  manualSource.humanConfirmationObjectStatus = passStatus('manual_confirmation_required');
  result = evaluateWorkflowReport(manualSource, { eventName: 'pull_request' });
  assertCase('workflow runner preserves manual_confirmation_required', result.status === 'fail', failures, cases, result.status);
  assertCase('workflow runner scanner allows internal npm skip reason label', scanObjectForUnsafe({
    productVerificationStatus: { reasonCodes: ['npm_skip_not_allowed_for_product_change'] },
  }).length === 0, failures, cases);
  const unsafeNpmTokenFixture = ['npm', 'actualunsafevalue1234567890'].join('_');
  assertCase('workflow runner scanner still blocks token-like unsafe values', scanObjectForUnsafe({
    productVerificationStatus: { safeSummary: unsafeNpmTokenFixture },
  }).length > 0, failures, cases);
  const invalidRunnerTmp = fs.mkdtempSync(path.join(os.tmpdir(), 'codex-v082-runner-'));
  const invalidJsonPath = path.join(invalidRunnerTmp, 'invalid.json');
  write(invalidJsonPath, '{ invalid json');
  let runnerResult = runWorkflowRunner(invalidJsonPath, invalidRunnerTmp);
  assertCase('workflow runner writes safe artifacts for invalid JSON report', runnerResult.status !== 0 && safeArtifactFilesExist(invalidRunnerTmp), failures, cases, runnerResult.status !== 0 ? 'pass' : 'fail');
  const unsafeReportTmp = fs.mkdtempSync(path.join(os.tmpdir(), 'codex-v082-runner-'));
  const unsafeReportPath = path.join(unsafeReportTmp, 'unsafe.json');
  write(unsafeReportPath, JSON.stringify({ status: 'fail', targetQualityScoreStatus: { status: 'fail' }, safeSummary: unsafeNpmTokenFixture }));
  runnerResult = runWorkflowRunner(unsafeReportPath, unsafeReportTmp);
  const unsafeArtifactText = safeArtifactFilesExist(unsafeReportTmp)
    ? fs.readFileSync(path.join(unsafeReportTmp, 'codex-failure-reasons.json'), 'utf8')
    : '';
  assertCase('workflow runner writes safe artifacts for unsafe report without unsafe value', runnerResult.status !== 0 && safeArtifactFilesExist(unsafeReportTmp) && !unsafeArtifactText.includes(unsafeNpmTokenFixture), failures, cases, runnerResult.status !== 0 ? 'pass' : 'fail');
  const missingReportTmp = fs.mkdtempSync(path.join(os.tmpdir(), 'codex-v082-runner-'));
  runnerResult = runWorkflowRunner(path.join(missingReportTmp, 'missing.json'), missingReportTmp);
  assertCase('workflow runner writes safe artifacts for missing report', runnerResult.status !== 0 && safeArtifactFilesExist(missingReportTmp), failures, cases, runnerResult.status !== 0 ? 'pass' : 'fail');

  result = withRulesTmp((tmp) => loadClassificationRules({ CODEX_CHANGE_CLASSIFICATION_RULES_PATH: path.join(tmp, 'docs', 'process', 'CODEX_CHANGE_CLASSIFICATION_RULES.json') }));
  assertCase('change classification rules JSON loads', result.ok, failures, cases, result.ok ? 'pass' : result.reasonCode);
  result = loadClassificationRules({ CODEX_CHANGE_CLASSIFICATION_RULES_PATH: path.join(os.tmpdir(), 'missing-rules.json') });
  assertCase('missing classification rules JSON fails in PR context', result.ok === false && result.reasonCode === 'classification_rules_missing', failures, cases, result.reasonCode);

  let classified = classifyChange(['scripts/run-tests.js'], { CODEX_EVENT_NAME: 'pull_request' });
  assertCase('scripts/run-tests.js classified as verification-relevant', classified.productRelevantChanged, failures, cases, classified.status);
  classified = classifyChange(['package-lock.json'], { CODEX_EVENT_NAME: 'pull_request' });
  assertCase('package-lock file is package/lock relevant', classified.packageOrLockfileChanged, failures, cases, classified.status);
  classified = classifyChange(['unknown.safe'], { CODEX_EVENT_NAME: 'pull_request' });
  assertCase('unknown file fails in PR context', classified.status === 'fail', failures, cases, classified.status);
  classified = classifyChange(['scripts/codex-local-quality-gate.mjs'], { CODEX_EVENT_NAME: 'pull_request' });
  assertCase('harness-only changed files classify as harnessOnly', classified.classification.harnessOnly, failures, cases, classified.status);
  classified = classifyChange(['README.md'], { CODEX_EVENT_NAME: 'pull_request' });
  assertCase('docs-only changed files classify as docsOnly', classified.classification.docsOnly, failures, cases, classified.status);
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'codex-v082-override-'));
  write(path.join(tmp, 'docs', 'process', 'CODEX_CHANGE_CLASSIFICATION_RULES.json'), fs.readFileSync(path.join(repo, 'docs', 'process', 'CODEX_CHANGE_CLASSIFICATION_RULES.json'), 'utf8'));
  write(path.join(tmp, 'docs', 'process', 'CODEX_CHANGE_CLASSIFICATION_RULES.local.json'), JSON.stringify({
    authorityFiles: ['PROJECT_AUTHORITY.md'],
  }, null, 2));
  const oldCwd = process.cwd();
  process.chdir(tmp);
  classified = classifyChange(['PROJECT_AUTHORITY.md'], { CODEX_EVENT_NAME: 'pull_request' });
  process.chdir(oldCwd);
  assertCase('local override can add a repo-specific authority file safely', classified.classification.authorityChanged, failures, cases, classified.status);

  result = buildProductVerificationEvidenceReport({
    CODEX_EVENT_NAME: 'pull_request',
    CODEX_SKIP_NPM: '1',
    CODEX_CHANGED_FILES: 'scripts/codex-local-quality-gate.mjs',
    CODEX_NPM_SKIP_REASON: 'harness-only',
  });
  assertCase('harness-only change with CODEX_SKIP_NPM=1 passes through normalized evidence', result.productVerificationEvidenceStatus.status === 'pass', failures, cases, result.productVerificationEvidenceStatus.status);
  result = buildProductVerificationReport({
    CODEX_EVENT_NAME: 'pull_request',
    CODEX_SKIP_NPM: '1',
    CODEX_CHANGED_FILES: 'src/app.js',
  });
  assertCase('product src change with CODEX_SKIP_NPM=1 fails through normalized evidence', result.productVerificationStatus.status === 'fail', failures, cases, result.productVerificationStatus.status);
  result = buildProductVerificationReport({
    CODEX_EVENT_NAME: 'pull_request',
    CODEX_SKIP_NPM: '1',
    CODEX_CHANGED_FILES: 'scripts/codex-local-quality-gate.mjs',
    CODEX_PR_BODY: 'Runtime readiness claimed: yes.',
  });
  assertCase('runtime readiness claim with CODEX_SKIP_NPM=1 fails', result.productVerificationStatus.status === 'fail', failures, cases, result.productVerificationStatus.status);
  result = buildProductVerificationReport({
    CODEX_EVENT_NAME: 'pull_request',
    CODEX_CHANGED_FILES: 'package-lock.json',
  });
  assertCase('package/lockfile change without evidence fails', result.productVerificationStatus.status === 'fail', failures, cases, result.productVerificationStatus.status);
  result = buildProductVerificationReport({
    CODEX_EVENT_NAME: 'pull_request',
    CODEX_CHANGED_FILES: 'src/app.js',
    CODEX_PRODUCT_VERIFICATION_COMMANDS: 'npm test',
    CODEX_PRODUCT_VERIFICATION_RESULT: 'pass',
  });
  assertCase('npm test pass evidence with duration/testCount normalizes to pass', result.productVerificationStatus.status === 'pass', failures, cases, result.productVerificationStatus.status);
  result = buildProductVerificationReport({
    CODEX_EVENT_NAME: 'pull_request',
    CODEX_CHANGED_FILES: 'apps/backend/src/app/routes/userManage.routes.ts\napps/backend/src/app/routes/__tests__/disabledScope.routes.test.ts',
    CODEX_PRODUCT_VERIFICATION_COMMANDS: 'apps/backend npm ci,apps/backend build,apps/backend test',
    CODEX_PRODUCT_VERIFICATION_RESULT: 'pass',
    CODEX_PR_BODY: 'Runtime readiness claimed: no.',
  });
  assertCase('backend product change with product checks passes target product verification', result.productVerificationStatus.status === 'pass', failures, cases, result.productVerificationStatus.status);
  result = buildProductVerificationEvidenceReport({
    CODEX_EVENT_NAME: 'pull_request',
    CODEX_CHANGED_FILES: 'apps/backend/src/app/routes/userManage.routes.ts',
    CODEX_PRODUCT_VERIFICATION_COMMANDS: 'apps/backend test',
    CODEX_PRODUCT_VERIFICATION_RESULT: 'pass',
    CODEX_PR_BODY: 'Runtime readiness claimed: no.',
  });
  assertCase('backend product change with product checks passes product evidence status', result.productVerificationEvidenceStatus.status === 'pass', failures, cases, result.productVerificationEvidenceStatus.status);
  result = buildProductVerificationReport({
    CODEX_EVENT_NAME: 'pull_request',
    CODEX_CHANGED_FILES: 'apps/backend/src/app/routes/userManage.routes.ts',
    CODEX_PRODUCT_VERIFICATION_COMMANDS: 'apps/backend test',
    CODEX_PRODUCT_VERIFICATION_RESULT: 'fail',
  });
  assertCase('failed product verification command blocks product change', result.productVerificationStatus.status === 'fail', failures, cases, result.productVerificationStatus.status);
  result = buildProductVerificationReport({
    CODEX_EVENT_NAME: 'pull_request',
    CODEX_CHANGED_FILES: 'README.md',
    CODEX_SKIP_NPM: '1',
    CODEX_NPM_SKIP_REASON: 'docs-only',
  });
  assertCase('docs-only change with CODEX_SKIP_NPM=1 and reason passes product verification', result.productVerificationStatus.status === 'pass', failures, cases, result.productVerificationStatus.status);
  result = buildProductVerificationReport({
    CODEX_EVENT_NAME: 'pull_request',
    CODEX_CHANGED_FILES: 'scripts/codex-local-quality-gate.mjs',
    CODEX_SKIP_NPM: '1',
    CODEX_NPM_SKIP_REASON: 'harness-only',
  });
  assertCase('harness-only change with CODEX_SKIP_NPM=1 passes product verification', result.productVerificationStatus.status === 'pass', failures, cases, result.productVerificationStatus.status);
  result = buildProductVerificationReport({
    CODEX_EVENT_NAME: 'pull_request',
    CODEX_CHANGED_FILES: 'apps/backend/src/app/routes/userManage.routes.ts',
    CODEX_PR_BODY: 'Runtime readiness claimed: yes.',
  });
  assertCase('runtime readiness claim without product checks fails', result.productVerificationStatus.status === 'fail', failures, cases, result.productVerificationStatus.status);
  const unsafeEvidence = path.join(os.tmpdir(), `codex-unsafe-evidence-${Date.now()}.json`);
  write(unsafeEvidence, JSON.stringify({ rawLogs: 'stored output' }));
  result = buildProductVerificationEvidenceReport({ CODEX_PRODUCT_VERIFICATION_EVIDENCE_PATH: unsafeEvidence });
  assertCase('unsafe evidence field fails safe output', result.productVerificationEvidenceStatus.status === 'fail', failures, cases, result.productVerificationEvidenceStatus.status);

  result = buildStagingEvidenceReport(stagingEnv(stagingEvidence({
    overallStatus: 'BLOCKED',
    checkedByRole: 'implementation-reviewer',
    stagingFrontendUrlStatus: { status: 'BLOCKED', summary: 'domain not confirmed' },
  })));
  assertCase('valid BLOCKED staging evidence is not a readiness pass', result.stagingEvidenceStatus.status === 'not_applicable' && result.stagingEvidenceStatus.liveBlockedOrUnknown, failures, cases, result.stagingEvidenceStatus.status);
  result = buildStagingEvidenceReport(stagingEnv(stagingEvidence()));
  assertCase('valid PASS no-tx staging evidence passes with required fields', result.stagingEvidenceStatus.status === 'pass', failures, cases, result.stagingEvidenceStatus.status);
  result = buildStagingEvidenceReport(stagingEnv(stagingEvidence({
    stagingFrontendUrlStatus: { status: 'BLOCKED', summary: 'domain missing' },
  })));
  assertCase('PASS staging evidence with missing domain fails', result.stagingEvidenceStatus.status === 'fail', failures, cases, result.stagingEvidenceStatus.status);
  result = buildStagingEvidenceReport(stagingEnv(stagingEvidence({ secretsIncluded: true })));
  assertCase('staging evidence with secretsIncluded true fails', result.stagingEvidenceStatus.status === 'fail', failures, cases, result.stagingEvidenceStatus.status);
  result = buildStagingEvidenceReport(stagingEnv(stagingEvidence({ rawLogsIncluded: true })));
  assertCase('staging evidence with rawLogsIncluded true fails', result.stagingEvidenceStatus.status === 'fail', failures, cases, result.stagingEvidenceStatus.status);
  result = buildStagingEvidenceReport(stagingEnv(stagingEvidence({ txExecuted: true })));
  assertCase('no-tx staging evidence with txExecuted true fails', result.stagingEvidenceStatus.status === 'fail', failures, cases, result.stagingEvidenceStatus.status);
  result = buildStagingEvidenceReport(stagingEnv(stagingEvidence({ headSha: '3333333333333333333333333333333333333333' })));
  assertCase('stale staging evidence head fails', result.stagingEvidenceStatus.status === 'fail', failures, cases, result.stagingEvidenceStatus.status);
  result = buildStagingEvidenceReport({
    CODEX_EVENT_NAME: 'pull_request',
    CODEX_PR_BODY: 'Production Go/No-Go: GO',
    CODEX_PR_HEAD_SHA: '2222222222222222222222222222222222222222',
    CODEX_CHANGED_FILES: 'docs/process/README.md',
  });
  assertCase('release GO claim without staging evidence fails', result.stagingEvidenceStatus.status === 'fail', failures, cases, result.stagingEvidenceStatus.status);
  result = buildStagingEvidenceReport({
    CODEX_EVENT_NAME: 'pull_request',
    CODEX_PR_BODY: 'Staging readiness claimed: no.',
    CODEX_CHANGED_FILES: 'docs/process/README.md',
  });
  assertCase('normal docs-only PR without staging claim does not require staging evidence', result.stagingEvidenceStatus.status === 'not_applicable', failures, cases, result.stagingEvidenceStatus.status);

  const metricsFile = path.join(os.tmpdir(), `codex-safe-metrics-${Date.now()}.json`);
  write(metricsFile, JSON.stringify({ command: 'npm test', result: 'pass', durationMs: 123, testCount: 4, safeSummary: 'safe metrics' }));
  result = buildTestMetricsReport({ CODEX_TEST_METRICS_INPUT_PATH: metricsFile });
  assertCase('safe npm metrics pass', result.testMetricsStatus.status === 'pass', failures, cases, result.testMetricsStatus.status);
  const unsafeMetricsFile = path.join(os.tmpdir(), `codex-unsafe-metrics-${Date.now()}.json`);
  write(unsafeMetricsFile, JSON.stringify({ command: 'npm test', result: 'pass', rawLogs: 'stored raw output' }));
  result = buildTestMetricsReport({ CODEX_TEST_METRICS_INPUT_PATH: unsafeMetricsFile });
  assertCase('metrics with raw logs fail', result.testMetricsStatus.status === 'fail', failures, cases, result.testMetricsStatus.status);

  result = run('scripts/codex-performance-evidence-gate.mjs', { env: { CODEX_EVENT_NAME: 'pull_request', CODEX_PR_BODY: 'This change is faster.' } });
  assertCase('performance claim without baseline/new metrics fails', result.parsed?.performanceEvidenceStatus?.status === 'fail', failures, cases, result.parsed?.performanceEvidenceStatus?.status);
  const perfMetricsFile = path.join(os.tmpdir(), `codex-perf-metrics-${Date.now()}.json`);
  write(perfMetricsFile, JSON.stringify({ baselineSummary: 'old safe baseline', newMeasurementSummary: 'new safe measurement' }));
  result = run('scripts/codex-performance-evidence-gate.mjs', { env: { CODEX_EVENT_NAME: 'pull_request', CODEX_PR_BODY: 'This change is faster.', CODEX_TEST_METRICS_PATH: perfMetricsFile } });
  assertCase('performance claim with safe baseline/new metrics passes', result.parsed?.performanceEvidenceStatus?.status === 'pass', failures, cases, result.parsed?.performanceEvidenceStatus?.status);

  const staleBody = 'BEGIN_CODEX_MANUAL_CONFIRMATION_JSON\n{\"codexManualConfirmation\":{\"headSha\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\"}}\nEND_CODEX_MANUAL_CONFIRMATION_JSON';
  result = buildStalePrAuditReport({ CODEX_EVENT_NAME: 'pull_request', CODEX_PR_HEAD_SHA: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb', CODEX_PR_BODY: staleBody });
  assertCase('stale confirmation fails', result.stalePrAuditStatus.status === 'fail', failures, cases, result.stalePrAuditStatus.status);
  result = buildStalePrAuditReport({ CODEX_EVENT_NAME: 'pull_request', CODEX_PR_HEAD_SHA: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb', CODEX_PR_BODY: '"headSha":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"' });
  assertCase('stale evidence fails', result.stalePrAuditStatus.status === 'fail', failures, cases, result.stalePrAuditStatus.status);
  result = buildStalePrAuditReport({ CODEX_EVENT_NAME: 'pull_request', CODEX_PR_HEAD_SHA: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb', CODEX_PR_BODY: '"headSha":"bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"' });
  assertCase('fresh current-head evidence passes', result.stalePrAuditStatus.status === 'pass', failures, cases, result.stalePrAuditStatus.status);
  result = buildStalePrAuditReport({});
  assertCase('no PR context returns not_applicable', result.stalePrAuditStatus.status === 'not_applicable', failures, cases, result.stalePrAuditStatus.status);

  result = buildCompactReasonSummary({ status: 'fail', targetQualityScoreStatus: { status: 'fail', score: 70 }, failures: [{ id: 'workflow_runner_failed', message: 'safe failure' }] });
  assertCase('compact reason summary contains no unsafe values', result.status === 'pass' && result.summary.safeSummaryOnly, failures, cases, result.status);

  result = run('scripts/codex-v081-self-test.mjs', { env: { CODEX_QUALITY_REPORT: 'json', CODEX_SKIP_V082_SELF_TEST: '1' } });
  assertCase('v0.8.1 core behavior still passes', result.parsed?.v081SelfTestStatus?.status === 'pass', failures, cases, result.parsed?.v081SelfTestStatus?.status);

  return {
    marker,
    harnessVersion: HARNESS_VERSION,
    v082SelfTestStatus: { status: failures.length ? 'fail' : 'pass', cases, failures, safeSummaryOnly: true },
    valuesPrinted: false,
    status: failures.length ? 'fail' : 'pass',
    safeSummary: failures.length ? 'v0.8.2 self-test failed; see safe labels.' : 'v0.8.2 self-test passed.',
  };
}

try {
  const report = buildReport();
  writeJsonReport(report, 'CODEX_V082_SELF_TEST_REPORT');
  process.exit(report.status === 'fail' ? 1 : 0);
} catch {
  const report = {
    marker,
    harnessVersion: HARNESS_VERSION,
    v082SelfTestStatus: { status: 'fail', failures: ['unexpected_error'], safeSummaryOnly: true },
    valuesPrinted: false,
    status: 'fail',
  };
  writeJsonReport(report, 'CODEX_V082_SELF_TEST_REPORT');
  process.exit(1);
}
