#!/usr/bin/env node
// CODEX_QUALITY_HARNESS_FILE v0.9.7
import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { HARNESS_VERSION, marker, normalizePath, writeJsonReport } from './codex-v080-lib.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.dirname(here);
const backendRoot = path.join(repo, 'apps', 'backend');
const HEALTHCHECK_ACCEPTED_STATUSES = new Set([200, 503]);

export function backendDockerSmokeRequiredForFiles(files = []) {
  return files.map(normalizePath).some((file) => (
    file === 'apps/backend/Dockerfile' ||
    file === 'apps/backend/Dockerfile.dev' ||
    file === 'apps/backend/package.json' ||
    file === 'apps/backend/package-lock.json' ||
    file === 'apps/backend/src/main.ts' ||
    file === 'apps/backend/src/app/index.ts' ||
    file === 'apps/backend/src/app/middlewares/security.ts' ||
    file === 'scripts/codex-backend-docker-smoke.mjs' ||
    file === '.github/workflows/quality-gate.yml' ||
    file.startsWith('apps/backend/prisma/')
  ));
}

export function isAllowedBackendDockerHealthStatus(statusCode) {
  return HEALTHCHECK_ACCEPTED_STATUSES.has(Number(statusCode));
}

function reportPath(env = process.env) {
  if (env.CODEX_BACKEND_DOCKER_SMOKE_REPORT_PATH) return env.CODEX_BACKEND_DOCKER_SMOKE_REPORT_PATH;
  const phase = String(env.CODEX_BACKEND_DOCKER_SMOKE_PHASE || 'candidate').replace(/[^a-z0-9_.-]/gi, '_');
  const outDir = env.RUNNER_TEMP || env.TMPDIR || env.TEMP || repo;
  return path.join(outDir, `codex-backend-docker-smoke.${phase}.safe.json`);
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function evidence(name, result, durationMs, safeSummary) {
  return {
    name,
    required: true,
    result,
    source: 'remote',
    durationMs,
    testCount: null,
    safeSummary,
  };
}

function runCommand(name, command, args, options = {}) {
  const started = Date.now();
  const result = spawnSync(command, args, {
    cwd: options.cwd || repo,
    env: { ...process.env, ...(options.env || {}) },
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    timeout: options.timeoutMs || 120_000,
  });
  return {
    ok: result.status === 0,
    evidence: evidence(
      name,
      result.status === 0 ? 'pass' : 'fail',
      Date.now() - started,
      result.status === 0 ? 'backend Docker smoke step completed' : 'backend Docker smoke step failed'
    ),
  };
}

function buildSafeFailure(reasonCodes, commands, safeSummary) {
  return {
    marker,
    harnessVersion: HARNESS_VERSION,
    status: 'fail',
    backendDockerSmokeStatus: {
      status: 'fail',
      required: true,
      dockerAvailable: false,
      buildResult: commands.find((item) => item.name === 'backend:docker build')?.result || 'not_run',
      prismaClientImportResult: commands.find((item) => item.name === 'backend:docker prisma client import')?.result || 'not_run',
      containerStartResult: commands.find((item) => item.name === 'backend:docker container start')?.result || 'not_run',
      healthcheckResult: commands.find((item) => item.name === 'backend:docker healthcheck')?.result || 'not_run',
      acceptedHealthcheckStatuses: [200, 503],
      reasonCodes: [...new Set(reasonCodes)],
      safeSummary,
      safeSummaryOnly: true,
    },
    commands,
    valuesPrinted: false,
    safeSummaryOnly: true,
  };
}

export function buildBackendDockerSmokeUnavailableReport(reasonCode = 'docker_cli_unavailable') {
  const commands = [
    evidence('backend:docker availability', 'fail', null, 'Docker availability check failed'),
  ];
  return buildSafeFailure([reasonCode], commands, 'Docker is unavailable for backend Docker smoke');
}

function smokeDatabaseUrl() {
  return [
    'postgresql://',
    'codex_user',
    ':',
    'codex_pass',
    '@',
    '127.0.0.1',
    ':5432/',
    'codex_smoke',
  ].join('');
}

function smokeEnv() {
  return {
    NODE_ENV: 'development',
    PORT: '5000',
    JWT_SECRET: 'codex-smoke-jwt-secret',
    SESSION_SECRET: 'codex-smoke-session-secret',
    ETHERSCAN_API_KEY: 'codex-smoke-explorer-key',
    DATABASE_URL: smokeDatabaseUrl(),
  };
}

function dockerEnvArgs(env) {
  return Object.entries(env).flatMap(([key, value]) => ['-e', `${key}=${value}`]);
}

function findOpenPort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      const port = typeof address === 'object' && address ? address.port : null;
      server.close(() => {
        if (port) resolve(port);
        else reject(new Error('port_unavailable'));
      });
    });
  });
}

async function waitForHealthcheck(port, timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs;
  let lastStatus = null;
  while (Date.now() < deadline) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2_000);
      const response = await fetch(`http://127.0.0.1:${port}/api/monitoring/healthcheck`, {
        signal: controller.signal,
      });
      clearTimeout(timeout);
      lastStatus = response.status;
      if (isAllowedBackendDockerHealthStatus(response.status)) {
        return { ok: true, statusCode: response.status };
      }
    } catch {
      lastStatus = null;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  return { ok: false, statusCode: lastStatus };
}

function runContainerHealthcheck(containerName) {
  const accepted = JSON.stringify([...HEALTHCHECK_ACCEPTED_STATUSES]);
  return runCommand(
    'backend:docker in-container healthcheck',
    'docker',
    [
      'exec',
      containerName,
      'node',
      '-e',
      [
        "fetch('http://127.0.0.1:5000/api/monitoring/healthcheck')",
        `.then((response) => process.exit(${accepted}.includes(response.status) ? 0 : 1))`,
        '.catch(() => process.exit(1))',
      ].join(''),
    ],
    { timeoutMs: 10_000 }
  );
}

export async function runBackendDockerSmoke(env = process.env) {
  const commands = [];
  const reasonCodes = [];
  if (env.CODEX_BACKEND_DOCKER_SMOKE_FORCE_DOCKER_UNAVAILABLE === '1') {
    const report = buildBackendDockerSmokeUnavailableReport('docker_cli_unavailable');
    writeJson(reportPath(env), report);
    return report;
  }

  const dockerVersion = runCommand('backend:docker availability', 'docker', ['--version'], { timeoutMs: 30_000 });
  commands.push(dockerVersion.evidence);
  if (!dockerVersion.ok) {
    reasonCodes.push('docker_cli_unavailable');
    const report = buildSafeFailure(reasonCodes, commands, 'Docker CLI is unavailable for backend Docker smoke');
    writeJson(reportPath(env), report);
    return report;
  }

  const dockerInfo = runCommand('backend:docker daemon availability', 'docker', ['info'], { timeoutMs: 30_000 });
  commands.push(dockerInfo.evidence);
  if (!dockerInfo.ok) {
    reasonCodes.push('docker_daemon_unavailable');
    const report = buildSafeFailure(reasonCodes, commands, 'Docker daemon is unavailable for backend Docker smoke');
    writeJson(reportPath(env), report);
    return report;
  }

  const suffix = `${Date.now()}-${process.pid}-${Math.random().toString(16).slice(2)}`.toLowerCase();
  const imageName = `codex-funky-backend-smoke:${suffix}`;
  const containerName = `codex-funky-backend-smoke-${suffix}`.replace(/[^a-z0-9_.-]/g, '-');

  try {
    const build = runCommand(
      'backend:docker build',
      'docker',
      ['build', '-f', 'Dockerfile', '-t', imageName, '.'],
      { cwd: backendRoot, timeoutMs: 20 * 60 * 1000 }
    );
    commands.push(build.evidence);
    if (!build.ok) reasonCodes.push('backend_docker_build_failed');

    if (build.ok) {
      const prismaImport = runCommand(
        'backend:docker prisma client import',
        'docker',
        ['run', '--rm', imageName, 'node', '-e', "require('@prisma/client'); process.stdout.write('ok')"],
        { timeoutMs: 120_000 }
      );
      commands.push(prismaImport.evidence);
      if (!prismaImport.ok) reasonCodes.push('backend_docker_prisma_client_import_failed');
    }

    if (build.ok && !reasonCodes.includes('backend_docker_prisma_client_import_failed')) {
      const port = await findOpenPort();
      const start = runCommand(
        'backend:docker container start',
        'docker',
        [
          'run',
          '-d',
          '--name',
          containerName,
          '-p',
          `127.0.0.1:${port}:5000`,
          ...dockerEnvArgs(smokeEnv()),
          imageName,
          'node',
          './dist/src/main.js',
        ],
        { timeoutMs: 120_000 }
      );
      commands.push(start.evidence);
      if (!start.ok) reasonCodes.push('backend_docker_container_start_failed');

      if (start.ok) {
        const healthStarted = Date.now();
        const health = await waitForHealthcheck(port);
        let healthOk = health.ok;
        let healthSummary = health.ok
          ? 'backend Docker container responded to published healthcheck'
          : 'backend Docker container did not respond to published healthcheck';

        if (!health.ok) {
          const containerHealth = runContainerHealthcheck(containerName);
          commands.push(containerHealth.evidence);
          healthOk = containerHealth.ok;
          healthSummary = containerHealth.ok
            ? 'backend Docker container responded to in-container healthcheck'
            : 'backend Docker container did not respond to healthcheck';
        }

        commands.push(evidence(
          'backend:docker healthcheck',
          healthOk ? 'pass' : 'fail',
          Date.now() - healthStarted,
          healthSummary
        ));
        if (!healthOk) reasonCodes.push('backend_docker_healthcheck_failed');
      }
    }
  } finally {
    runCommand('backend:docker cleanup container', 'docker', ['rm', '-f', containerName], { timeoutMs: 60_000 });
    runCommand('backend:docker cleanup image', 'docker', ['image', 'rm', '-f', imageName], { timeoutMs: 60_000 });
  }

  const status = reasonCodes.length ? 'fail' : 'pass';
  const report = {
    marker,
    harnessVersion: HARNESS_VERSION,
    status,
    backendDockerSmokeStatus: {
      status,
      required: true,
      dockerAvailable: true,
      buildResult: commands.find((item) => item.name === 'backend:docker build')?.result || 'not_run',
      prismaClientImportResult: commands.find((item) => item.name === 'backend:docker prisma client import')?.result || 'not_run',
      containerStartResult: commands.find((item) => item.name === 'backend:docker container start')?.result || 'not_run',
      healthcheckResult: commands.find((item) => item.name === 'backend:docker healthcheck')?.result || 'not_run',
      acceptedHealthcheckStatuses: [200, 503],
      reasonCodes: [...new Set(reasonCodes)],
      safeSummary: status === 'pass'
        ? 'backend Docker build/run smoke completed'
        : 'backend Docker build/run smoke failed',
      safeSummaryOnly: true,
    },
    commands,
    valuesPrinted: false,
    safeSummaryOnly: true,
  };
  writeJson(reportPath(env), report);
  return report;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const report = await runBackendDockerSmoke();
  writeJsonReport(report, 'CODEX_BACKEND_DOCKER_SMOKE_REPORT');
  process.exit(report.status === 'fail' ? 1 : 0);
}
