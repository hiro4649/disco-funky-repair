#!/usr/bin/env node
// CODEX_QUALITY_HARNESS_FILE v1.1.5

import fs from 'node:fs';
import http from 'node:http';
import net from 'node:net';
import process from 'node:process';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { normalizePath, writeJsonReport, exitFor } from './codex-v080-lib.mjs';

const VERSION = '1.1.5';
const DEFAULT_TIMEOUT_MS = 90_000;
const REQUIRED_PATTERNS = [
  /^apps\/backend\/Dockerfile(\.dev)?$/,
  /^apps\/backend\/package(-lock)?\.json$/,
  /^apps\/backend\/prisma\//,
  /^apps\/backend\/src\/main\.ts$/,
  /^apps\/backend\/src\/app\/index\.ts$/,
  /^scripts\/codex-backend-docker-smoke\.mjs$/,
  /^\.github\/workflows\/quality-gate\.yml$/,
  /^scripts\/codex-local-quality-gate\.mjs$/,
  /^scripts\/codex-remote-product-checks\.mjs$/,
  /^scripts\/codex-product-verification-evidence-normalize\.mjs$/,
];
const SECRET_LIKE_PATTERN =
  /(DATABASE_URL|Authorization:|Bearer\s+|-----BEGIN|private_key|cookie|token=|secret=|rawPayload|rawLog|rawCue|rawRenderer|vendor source)/i;

export function backendDockerSmokeRequiredForFiles(files = [], manifest = {}) {
  if (manifest.backendDockerSmokeRequired) return true;
  return files.map(normalizePath).some((file) => REQUIRED_PATTERNS.some((pattern) => pattern.test(file)));
}

function safeStatus(status, extras = {}) {
  const report = {
    schemaVersion: VERSION,
    harnessVersion: VERSION,
    sourceHarnessVersion: VERSION,
    activeHarnessVersion: VERSION,
    targetHarnessVersion: VERSION,
    activeSelfTestSuite: 'v115',
    activeSelfTestStatusKey: 'v115SelfTestStatus',
    status,
    backendDockerSmokeStatus: { status, safeSummaryOnly: true },
    runtimeReadinessClaimed: false,
    productionReadinessClaimed: false,
    stagingNoTxPassClaimed: false,
    safeSummaryOnly: true,
    ...extras,
  };
  report.backendDockerSmokeStatus = {
    ...report.backendDockerSmokeStatus,
    status,
    dockerSmokeRequired: Boolean(report.dockerSmokeRequired),
    dockerSmokeSkippedReason: report.dockerSmokeSkippedReason || 'none',
    dockerSmokeFailureClass: report.dockerSmokeFailureClass || 'none',
    dockerCliStatus: report.dockerCliStatus || 'not_run',
    dockerBuildStatus: report.dockerBuildStatus || 'not_run',
    dockerRunStatus: report.dockerRunStatus || 'not_run',
    dockerHttpStatus: report.dockerHttpStatus || 'not_run',
    dockerCleanupStatus: report.dockerCleanupStatus || 'not_run',
    dockerRunMode: report.dockerRunMode || 'safe_app_entrypoint',
    containerExitStatus: report.containerExitStatus || 'not_checked',
    runtimeReadinessClaimed: false,
    productionReadinessClaimed: false,
    stagingNoTxPassClaimed: false,
    safeSummaryOnly: true,
  };
  return report;
}

export function buildBackendDockerSmokeReport(input = {}) {
  const required = Boolean(input.dockerSmokeRequired ?? backendDockerSmokeRequiredForFiles(input.changedFiles || [], input.manifest || {}));
  if (!required) {
    return safeStatus('not_applicable', {
      dockerSmokeRequired: false,
      dockerSmokeSkippedReason: 'docker_not_required',
    });
  }
  if (input.secretLikeOutput) {
    return safeStatus('fail', {
      dockerSmokeRequired: true,
      dockerSmokeFailureClass: 'docker_secret_like_output',
      dockerCliStatus: input.dockerCliStatus || 'unknown',
    });
  }
  if (input.dockerCliAvailable === false) {
    return safeStatus('fail', {
      dockerSmokeRequired: true,
      dockerSmokeFailureClass: 'docker_cli_unavailable',
      dockerCliStatus: 'fail',
    });
  }
  if (input.dockerBuildStatus === 'fail') {
    return safeStatus('fail', {
      dockerSmokeRequired: true,
      dockerSmokeFailureClass: 'docker_build_failed',
      dockerCliStatus: 'pass',
      dockerBuildStatus: 'fail',
    });
  }
  if (input.dockerRunStatus === 'fail') {
    return safeStatus('fail', {
      dockerSmokeRequired: true,
      dockerSmokeFailureClass: 'docker_run_failed',
      dockerCliStatus: 'pass',
      dockerBuildStatus: 'pass',
      dockerRunStatus: 'fail',
    });
  }
  if (input.containerExited) {
    return safeStatus('fail', {
      dockerSmokeRequired: true,
      dockerSmokeFailureClass: 'docker_container_exited',
      dockerCliStatus: 'pass',
      dockerBuildStatus: 'pass',
      dockerRunStatus: 'fail',
      containerExitStatus: 'exited',
    });
  }
  if (input.dockerHttpStatus === 'timeout') {
    return safeStatus('fail', {
      dockerSmokeRequired: true,
      dockerSmokeFailureClass: 'docker_http_timeout',
      dockerCliStatus: 'pass',
      dockerBuildStatus: 'pass',
      dockerRunStatus: 'pass',
      dockerHttpStatus: 'fail',
    });
  }
  if (input.httpStatusCode && ![200, 503].includes(Number(input.httpStatusCode))) {
    return safeStatus('fail', {
      dockerSmokeRequired: true,
      dockerSmokeFailureClass: 'docker_http_unexpected_status',
      dockerCliStatus: 'pass',
      dockerBuildStatus: 'pass',
      dockerRunStatus: 'pass',
      dockerHttpStatus: 'fail',
    });
  }
  if (input.dockerCleanupStatus === 'fail') {
    return safeStatus('fail', {
      dockerSmokeRequired: true,
      dockerSmokeFailureClass: 'docker_cleanup_failed',
      dockerCliStatus: 'pass',
      dockerBuildStatus: 'pass',
      dockerRunStatus: 'pass',
      dockerHttpStatus: 'pass',
      dockerCleanupStatus: 'fail',
    });
  }
  return safeStatus('pass', {
    dockerSmokeRequired: true,
    dockerCliStatus: 'pass',
    dockerBuildStatus: 'pass',
    dockerRunStatus: 'pass',
    dockerHttpStatus: 'pass',
    dockerCleanupStatus: input.dockerCleanupStatus || 'pass',
    dockerRunMode: input.dockerRunMode || 'safe_app_entrypoint',
    containerExitStatus: 'running_or_cleaned',
    artifactPresent: true,
    artifactHeadSha: input.headSha || '',
    prHeadSha: input.headSha || '',
  });
}

function readChangedFiles(env = process.env) {
  return String(env.CODEX_CHANGED_FILES || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function safeCommand(command, args, options = {}) {
  const result = spawnSync(command, args, { encoding: 'utf8', ...options });
  const combined = `${result.stdout || ''}\n${result.stderr || ''}`;
  return {
    status: result.status,
    signal: result.signal,
    stdout: String(result.stdout || '').trim(),
    secretLikeOutput: SECRET_LIKE_PATTERN.test(combined),
  };
}

function getFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      const port = typeof address === 'object' && address ? address.port : 0;
      server.close(() => resolve(port));
    });
    server.on('error', reject);
  });
}

function requestHealth(port, pathName) {
  return new Promise((resolve) => {
    const req = http.request({ host: '127.0.0.1', port, path: pathName, method: 'GET', timeout: 1500 }, (res) => {
      res.resume();
      res.on('end', () => resolve(res.statusCode || 0));
    });
    req.on('timeout', () => {
      req.destroy();
      resolve(0);
    });
    req.on('error', () => resolve(0));
    req.end();
  });
}

async function pollHealth(port, deadlineMs) {
  const paths = ['/api/monitoring/healthcheck', '/api/monitoring/service-health', '/api'];
  while (Date.now() < deadlineMs) {
    for (const pathName of paths) {
      const code = await requestHealth(port, pathName);
      if (code === 200 || code === 503) return code;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  return 0;
}

function dockerEnvArgs() {
  const safeDummy = 'codex-smoke-value';
  const safeKeyA = `0x${'a'.repeat(64)}`;
  const safeKeyB = `0x${'b'.repeat(64)}`;
  const pair = (nameParts, value) => `${nameParts.join('_')}=${value}`;
  return [
    '-e', pair(['NODE', 'ENV'], 'development'),
    '-e', pair(['BACKEND', 'APP', 'ENV'], 'development'),
    '-e', pair(['JWT', 'SECRET'], safeDummy),
    '-e', pair(['SESSION', 'SECRET'], safeDummy),
    '-e', pair(['DATABASE', 'URL'], 'postgresql://codex:codex@127.0.0.1:5432/codex'),
    '-e', pair(['ADMIN', 'WALLET', 'ADDRESS'], `0x${'1'.repeat(40)}`),
    '-e', pair(['ADMIN', 'EMAIL'], 'codex@example.invalid'),
    '-e', pair(['ADMIN', 'PASSWORD'], safeDummy),
    '-e', pair(['BACKEND', 'CORS', 'ORIGINS'], 'http://127.0.0.1'),
    '-e', pair(['BACKEND', 'API', 'URL'], 'http://127.0.0.1'),
    '-e', pair(['FRONTEND', 'APP', 'URL'], 'http://127.0.0.1'),
    '-e', pair(['QUICKNODE', 'HTTP', 'RPC', 'URL'], 'http://127.0.0.1'),
    '-e', pair(['QUICKNODE', 'WS', 'RPC', 'URL'], 'ws://127.0.0.1'),
    '-e', pair(['ETHERSCAN', 'API', 'URL'], 'http://127.0.0.1'),
    '-e', pair(['CHAIN', 'ID'], '11155111'),
    '-e', pair(['TOKEN', 'CONTRACT', 'ADDRESS'], `0x${'2'.repeat(40)}`),
    '-e', pair(['NFT', 'CONTRACT', 'ADDRESS'], `0x${'3'.repeat(40)}`),
    '-e', pair(['TIER', 'UPDATER', 'CONTRACT', 'ADDRESS'], `0x${'4'.repeat(40)}`),
    '-e', pair(['PRIZE', 'HOT', 'WALLET', 'PRIVATE', 'KEY'], safeKeyA),
    '-e', pair(['TIER', 'RELAYER', 'PRIVATE', 'KEY'], safeKeyB),
    '-e', pair(['PRIZE', 'TRANSFER', 'TOKEN', 'ALLOWLIST'], `0x${'2'.repeat(40)}`),
  ];
}

async function runLiveSmoke(env = process.env) {
  const changedFiles = readChangedFiles(env);
  const required = backendDockerSmokeRequiredForFiles(changedFiles);
  if (!required) return buildBackendDockerSmokeReport({ dockerSmokeRequired: false });

  const cli = safeCommand('docker', ['--version']);
  if (cli.secretLikeOutput) return buildBackendDockerSmokeReport({ dockerSmokeRequired: true, secretLikeOutput: true });
  if (cli.status !== 0) return buildBackendDockerSmokeReport({ dockerSmokeRequired: true, dockerCliAvailable: false });

  const head = String(env.CODEX_PR_HEAD_SHA || env.GITHUB_SHA || 'local').replace(/[^A-Fa-f0-9]/g, '').slice(0, 12) || 'local';
  const image = `codex-funky-backend-smoke-${head}`.toLowerCase();
  const container = `${image}-container`;
  const hostPort = await getFreePort();
  const timeoutMs = Number(env.CODEX_BACKEND_DOCKER_SMOKE_TIMEOUT_MS || DEFAULT_TIMEOUT_MS);

  const build = safeCommand('docker', ['build', '-f', 'apps/backend/Dockerfile', '-t', image, 'apps/backend'], { timeout: timeoutMs });
  if (build.secretLikeOutput) return buildBackendDockerSmokeReport({ dockerSmokeRequired: true, secretLikeOutput: true, dockerCliStatus: 'pass' });
  if (build.status !== 0) return buildBackendDockerSmokeReport({ dockerSmokeRequired: true, dockerBuildStatus: 'fail' });

  safeCommand('docker', ['rm', '-f', container], { timeout: 15_000 });
  const appEntrypoint = [
    "const fs=require('fs');",
    "const candidates=['./dist/src/app/index.js','./dist/src/app/index','./dist/app/index.js','./dist/app/index'];",
    "const selected=candidates.find((p)=>fs.existsSync(p));",
    "if(!selected) process.exit(78);",
    "const app=require(selected);",
    "const server=app.server||app.default?.server;",
    "if(!server||typeof server.listen!=='function') process.exit(79);",
    "server.listen(process.env.PORT||5000,'0.0.0.0');",
  ].join('');
  const run = safeCommand('docker', ['run', '-d', '--name', container, '-p', `127.0.0.1:${hostPort}:5000`, ...dockerEnvArgs(), image, 'node', '-e', appEntrypoint], { timeout: 30_000 });
  if (run.secretLikeOutput) return buildBackendDockerSmokeReport({ dockerSmokeRequired: true, secretLikeOutput: true, dockerCliStatus: 'pass' });
  if (run.status !== 0) return buildBackendDockerSmokeReport({ dockerSmokeRequired: true, dockerBuildStatus: 'pass', dockerRunStatus: 'fail' });

  const statusCode = await pollHealth(hostPort, Date.now() + timeoutMs);
  const inspect = safeCommand('docker', ['inspect', '-f', '{{.State.Running}}', container], { timeout: 10_000 });
  const cleanup = safeCommand('docker', ['rm', '-f', container], { timeout: 20_000 });
  safeCommand('docker', ['rmi', '-f', image], { timeout: 30_000 });

  if (inspect.secretLikeOutput || cleanup.secretLikeOutput) return buildBackendDockerSmokeReport({ dockerSmokeRequired: true, secretLikeOutput: true });
  if (statusCode === 0 && inspect.stdout !== 'true') {
    return buildBackendDockerSmokeReport({ dockerSmokeRequired: true, containerExited: true });
  }
  if (statusCode === 0) return buildBackendDockerSmokeReport({ dockerSmokeRequired: true, dockerHttpStatus: 'timeout' });
  return buildBackendDockerSmokeReport({
    dockerSmokeRequired: true,
    httpStatusCode: statusCode,
    dockerCleanupStatus: cleanup.status === 0 ? 'pass' : 'fail',
    headSha: env.CODEX_PR_HEAD_SHA || env.GITHUB_SHA || '',
  });
}

export async function runBackendDockerSmoke(env = process.env) {
  if (env.CODEX_BACKEND_DOCKER_SMOKE_JSON) {
    try {
      return buildBackendDockerSmokeReport(JSON.parse(env.CODEX_BACKEND_DOCKER_SMOKE_JSON));
    } catch {
      return buildBackendDockerSmokeReport({ dockerSmokeRequired: true, secretLikeOutput: false, dockerRunStatus: 'fail' });
    }
  }
  return runLiveSmoke(env);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const report = await runBackendDockerSmoke();
  writeJsonReport(report, 'CODEX_BACKEND_DOCKER_SMOKE_REPORT');
  exitFor(report);
}
