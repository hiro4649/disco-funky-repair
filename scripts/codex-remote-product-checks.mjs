#!/usr/bin/env node
// CODEX_QUALITY_HARNESS_FILE v0.8.4
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { HARNESS_VERSION, marker, normalizePath, writeJsonReport } from './codex-v080-lib.mjs';
import { classifyChange, changedFiles } from './codex-change-classification-gate.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.dirname(here);
const dummyDbEnv = {
  DATABASE_URL: 'postgresql://codex_harness:codex_harness@127.0.0.1:5432/codex_harness?schema=public',
};

function git(args, cwd = repo) {
  return spawnSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}

function safeNow() {
  return new Date().toISOString();
}

function expiresAt(days = 14) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

function outputDir(env = process.env) {
  return env.RUNNER_TEMP || env.TMPDIR || env.TEMP || repo;
}

function appendGitHubEnv(key, value, env = process.env) {
  if (!env.GITHUB_ENV) return;
  const text = String(value ?? '');
  if (text.includes('\n')) {
    fs.appendFileSync(env.GITHUB_ENV, `${key}<<CODEX_EOF\n${text}\nCODEX_EOF\n`);
  } else {
    fs.appendFileSync(env.GITHUB_ENV, `${key}=${text}\n`);
  }
}

function changedFilesForPr(env = process.env) {
  if (env.CODEX_CHANGED_FILES) {
    return String(env.CODEX_CHANGED_FILES).split(/\r?\n|,/).map(normalizePath).filter(Boolean);
  }
  if (env.CODEX_PR_BASE_SHA && env.CODEX_PR_HEAD_SHA) {
    const result = git(['diff', '--name-only', env.CODEX_PR_BASE_SHA, env.CODEX_PR_HEAD_SHA]);
    if (result.status === 0) {
      return String(result.stdout || '').split(/\r?\n/).map(normalizePath).filter(Boolean);
    }
  }
  return changedFiles(env);
}

export function productScopesForFiles(files = []) {
  const normalized = [...new Set(files.map(normalizePath).filter(Boolean))].sort();
  const scopes = {
    backend: false,
    frontend: false,
    contracts: false,
    rootPackage: false,
    productRelevant: false,
    files: normalized,
  };
  for (const file of normalized) {
    if (file.startsWith('apps/backend/')) scopes.backend = true;
    if (file.startsWith('apps/frontend/')) scopes.frontend = true;
    if (file.startsWith('contracts/')) scopes.contracts = true;
    if ([
      'package.json',
      'package-lock.json',
      'npm-shrinkwrap.json',
      'yarn.lock',
      'pnpm-lock.yaml',
      'tsconfig.json',
    ].includes(file)) scopes.rootPackage = true;
  }
  scopes.productRelevant = scopes.backend || scopes.frontend || scopes.contracts || scopes.rootPackage ||
    normalized.some((file) => /(^|\/)(__tests__|test|tests)\//.test(file) || /(^|\/)(src|lib|server|client|packages)\//.test(file));
  return scopes;
}

function commandEnv(extra = {}) {
  return { ...process.env, ...extra };
}

function runCommand({ cwd, name, command, args, env = {} }) {
  const started = Date.now();
  const result = spawnSync(command, args, {
    cwd,
    env: commandEnv(env),
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    timeout: 20 * 60 * 1000,
  });
  return {
    name,
    required: true,
    result: result.status === 0 ? 'pass' : 'fail',
    source: 'remote',
    durationMs: Date.now() - started,
    testCount: null,
    safeSummary: result.status === 0 ? 'remote product check completed' : 'remote product check failed',
  };
}

function runPackageChecks(root, scopes) {
  const commands = [];
  const run = (relativeCwd, name, command, args, env = {}) => {
    const evidence = runCommand({ cwd: path.join(root, relativeCwd), name, command, args, env });
    commands.push(evidence);
    return evidence.result === 'pass';
  };

  if (scopes.rootPackage && fs.existsSync(path.join(root, 'package.json'))) {
    if (!run('.', 'root:npm ci', 'npm', ['ci'])) return commands;
    run('.', 'root:npm test', 'npm', ['test']);
    run('.', 'root:npm run build', 'npm', ['run', 'build']);
  }

  if (scopes.backend && fs.existsSync(path.join(root, 'apps', 'backend', 'package.json'))) {
    if (!run('apps/backend', 'backend:npm ci', 'npm', ['ci'])) return commands;
    if (!run('apps/backend', 'backend:npm run prisma:validate', 'npm', ['run', 'prisma:validate'], dummyDbEnv)) return commands;
    if (!run('apps/backend', 'backend:npm run build', 'npm', ['run', 'build'], dummyDbEnv)) return commands;
    run('apps/backend', 'backend:npm test -- --runInBand', 'npm', ['test', '--', '--runInBand'], dummyDbEnv);
  }

  if (scopes.frontend && fs.existsSync(path.join(root, 'apps', 'frontend', 'package.json'))) {
    if (!run('apps/frontend', 'frontend:npm ci', 'npm', ['ci'])) return commands;
    if (fs.existsSync(path.join(root, 'apps', 'frontend', 'env.validation.test.mjs'))) {
      if (!run('apps/frontend', 'frontend:node env.validation.test.mjs', process.execPath, ['env.validation.test.mjs'])) return commands;
    }
    run('apps/frontend', 'frontend:npm run build', 'npm', ['run', 'build']);
  }

  if (scopes.contracts && fs.existsSync(path.join(root, 'contracts', 'package.json'))) {
    if (!run('contracts', 'contracts:npm ci', 'npm', ['ci'])) return commands;
    if (!run('contracts', 'contracts:npm run compile', 'npm', ['run', 'compile'])) return commands;
    if (!run('contracts', 'contracts:npm test', 'npm', ['test'])) return commands;
    if (!run('contracts', 'contracts:npm run compile:nft', 'npm', ['run', 'compile:nft'])) return commands;
    run('contracts', 'contracts:npm run test:nft', 'npm', ['run', 'test:nft']);
  }

  return commands;
}

function resultFor(commands) {
  if (!commands.length) return 'warning';
  return commands.every((item) => item.result === 'pass') ? 'pass' : 'fail';
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function evidenceObject({ env, commands, scopes }) {
  return {
    schemaVersion: '0.8.3',
    harnessVersion: HARNESS_VERSION,
    repository: env.CODEX_REPOSITORY || '',
    prNumber: env.CODEX_PR_NUMBER || '',
    headSha: env.CODEX_PR_HEAD_SHA || '',
    classification: {
      productRelevantChanged: scopes.productRelevant,
      backend: scopes.backend,
      frontend: scopes.frontend,
      contracts: scopes.contracts,
      rootPackage: scopes.rootPackage,
    },
    commands,
    safeSummaryOnly: true,
  };
}

function baselineObject({ env, commands }) {
  const result = resultFor(commands);
  return {
    schemaVersion: '0.8.3',
    harnessVersion: HARNESS_VERSION,
    repository: env.CODEX_REPOSITORY || '',
    baseSha: env.CODEX_PR_BASE_SHA || '',
    baselineType: 'remote_product_checks',
    commands: commands.map((item) => ({ name: item.name, result: item.result, source: 'remote' })),
    result,
    date: safeNow(),
    source: 'github_actions_base_worktree',
    safeSummary: 'remote product baseline checks completed',
    knownFailures: result === 'fail' ? ['remote_product_baseline_check_failed'] : [],
    expiresAt: expiresAt(),
    rawValuesStored: false,
    safeSummaryOnly: true,
  };
}

function safeReport({ status, files, scopes, baselineResult, candidateResult, reasonCodes = [] }) {
  return {
    marker,
    harnessVersion: HARNESS_VERSION,
    remoteProductChecksStatus: {
      status,
      changedFileCount: files.length,
      scopes: {
        backend: scopes.backend,
        frontend: scopes.frontend,
        contracts: scopes.contracts,
        rootPackage: scopes.rootPackage,
        productRelevant: scopes.productRelevant,
      },
      baselineResult: baselineResult || null,
      candidateResult: candidateResult || null,
      reasonCodes,
      safeSummaryOnly: true,
    },
    valuesPrinted: false,
    status,
  };
}

function removeWorktree(worktreePath) {
  git(['worktree', 'remove', '--force', worktreePath]);
}

export function buildRemoteProductCheckPlan(env = process.env) {
  const files = changedFilesForPr(env);
  const classified = classifyChange(files, { ...env, CODEX_CHANGED_FILES: files.join('\n') });
  const scopes = productScopesForFiles(files);
  const productRequired = Boolean(scopes.productRelevant || classified.productRelevantChanged || classified.packageOrLockfileChanged || classified.runtimeReadinessClaimed);
  return { files, scopes, classified, productRequired };
}

export function runRemoteProductChecks(env = process.env) {
  const outDir = outputDir(env);
  fs.mkdirSync(outDir, { recursive: true });
  const plan = buildRemoteProductCheckPlan(env);
  appendGitHubEnv('CODEX_CHANGED_FILES', plan.files.join('\n'), env);

  if (!plan.productRequired) {
    appendGitHubEnv('CODEX_SKIP_NPM', '1', env);
    appendGitHubEnv('CODEX_NPM_SKIP_REASON', 'non_product_change_without_runtime_claim', env);
    const report = safeReport({ status: 'not_applicable', files: plan.files, scopes: plan.scopes, reasonCodes: ['remote_product_checks_not_required'] });
    writeJson(path.join(outDir, 'codex-remote-product-checks.safe.json'), report);
    return report;
  }

  appendGitHubEnv('CODEX_SKIP_NPM', '0', env);
  appendGitHubEnv('CODEX_NPM_SKIP_REASON', '', env);

  const baselinePath = path.join(outDir, 'codex-remote-product-baseline.json');
  const evidencePath = path.join(outDir, 'codex-product-verification-evidence.remote.json');
  let baselineCommands = [];
  let baselineResult = 'fail';
  const baseSha = env.CODEX_PR_BASE_SHA;
  if (baseSha) {
    const baseWorktree = fs.mkdtempSync(path.join(os.tmpdir(), 'codex-product-base-'));
    fs.rmSync(baseWorktree, { recursive: true, force: true });
    const added = git(['worktree', 'add', '--detach', baseWorktree, baseSha]);
    if (added.status === 0) {
      try {
        baselineCommands = runPackageChecks(baseWorktree, plan.scopes);
      } finally {
        removeWorktree(baseWorktree);
      }
      baselineResult = resultFor(baselineCommands);
    } else {
      baselineCommands = [{
        name: 'remote baseline worktree checkout',
        required: true,
        result: 'fail',
        source: 'remote',
        durationMs: null,
        testCount: null,
        safeSummary: 'remote baseline worktree checkout failed',
      }];
    }
  } else {
    baselineCommands = [{
      name: 'remote baseline sha presence',
      required: true,
      result: 'fail',
      source: 'remote',
      durationMs: null,
      testCount: null,
      safeSummary: 'remote baseline sha missing',
    }];
  }

  const candidateCommands = runPackageChecks(repo, plan.scopes);
  const candidateResult = resultFor(candidateCommands);
  writeJson(baselinePath, baselineObject({ env, commands: baselineCommands }));
  writeJson(evidencePath, evidenceObject({ env, commands: candidateCommands, scopes: plan.scopes }));
  appendGitHubEnv('CODEX_REMOTE_PRODUCT_BASELINE_PATH', baselinePath, env);
  appendGitHubEnv('CODEX_PRODUCT_VERIFICATION_EVIDENCE_PATH', evidencePath, env);
  appendGitHubEnv('CODEX_PRODUCT_VERIFICATION_COMMANDS', candidateCommands.map((item) => item.name).join(','), env);
  appendGitHubEnv('CODEX_PRODUCT_VERIFICATION_RESULT', candidateResult, env);
  appendGitHubEnv('CODEX_PRODUCT_VERIFICATION_SOURCE', 'remote', env);

  const status = candidateResult === 'pass' && baselineResult === 'pass' ? 'pass' : 'fail';
  const reasonCodes = [];
  if (baselineResult !== 'pass') reasonCodes.push('remote_product_baseline_failing');
  if (candidateResult !== 'pass') reasonCodes.push('remote_product_checks_failed');
  const report = safeReport({ status, files: plan.files, scopes: plan.scopes, baselineResult, candidateResult, reasonCodes });
  writeJson(path.join(outDir, 'codex-remote-product-checks.safe.json'), report);
  return report;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  try {
    const report = runRemoteProductChecks();
    writeJsonReport(report, 'CODEX_REMOTE_PRODUCT_CHECKS_REPORT');
    process.exit(0);
  } catch {
    const report = safeReport({
      status: 'fail',
      files: [],
      scopes: { backend: false, frontend: false, contracts: false, rootPackage: false, productRelevant: false },
      reasonCodes: ['remote_product_checks_unexpected_error'],
    });
    writeJsonReport(report, 'CODEX_REMOTE_PRODUCT_CHECKS_REPORT');
    process.exit(0);
  }
}
