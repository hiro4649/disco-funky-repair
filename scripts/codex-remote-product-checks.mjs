#!/usr/bin/env node
// CODEX_QUALITY_HARNESS_FILE v1.0.2
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  HARNESS_VERSION,
  marker,
  normalizePath,
  scanObjectForUnsafe,
  simpleStatus,
  writeJsonReport,
  exitFor,
} from './codex-v080-lib.mjs';
import { classifyChange, changedFiles } from './codex-change-classification-gate.mjs';

function parseJson(value) {
  if (!value) return null;
  try { return JSON.parse(value); } catch { return { invalidInput: true }; }
}

function parseBool(value) {
  return value === true || value === '1' || value === 'true' || value === 'yes';
}

function parseList(value) {
  if (Array.isArray(value)) return value.map((item) => normalizePath(item)).filter(Boolean);
  return String(value || '').split(/[\r\n,]+/).map((item) => normalizePath(item)).filter(Boolean);
}

function inputFromEnv(env = process.env) {
  return parseJson(env.CODEX_REMOTE_PRODUCT_CHECKS_JSON) || {};
}

function boolOrFile(inputValue, file) {
  if (inputValue !== undefined) return parseBool(inputValue);
  return fs.existsSync(file);
}

function safeRelative(value, fallback = '') {
  const normalized = normalizePath(value);
  if (!normalized) return fallback;
  if (normalized === '.') return '.';
  if (/^(?:[A-Za-z]:|\/)/.test(normalized)) return fallback;
  if (normalized.split('/').some((part) => part === '..')) return fallback;
  if (!/^[A-Za-z0-9._/-]+$/.test(normalized)) return fallback;
  return normalized;
}

function safeToken(value, fallback = 'unknown') {
  const text = String(value || '').slice(0, 80);
  return /^[A-Za-z0-9_.-]+$/.test(text) ? text : fallback;
}

function productRelevantFromInput(input, files, env) {
  if (input.productRelevant !== undefined) return parseBool(input.productRelevant);
  const classified = classifyChange(files.length ? files : changedFiles(env), env);
  return Boolean(classified.productRelevantChanged || classified.packageOrLockfileChanged || classified.runtimeReadinessClaimed);
}

export function buildRemoteProductCheckPlan(input = inputFromEnv(), env = process.env) {
  const files = parseList(input.changedFiles ?? input.changed_files ?? env.CODEX_CHANGED_FILES);
  const productRelevant = productRelevantFromInput(input, files, env);
  const backendProduct = parseBool(input.backendProduct) || files.some((file) => file === 'apps/backend' || file.startsWith('apps/backend/'));
  const contractsProduct = parseBool(input.contractsProduct) || files.some((file) => file === 'contracts' || file.startsWith('contracts/'));
  const rootPackagePresent = boolOrFile(input.rootPackagePresent, 'package.json');
  const backendPackagePresent = boolOrFile(input.backendPackagePresent, 'apps/backend/package.json');
  const contractsPackagePresent = boolOrFile(input.contractsPackagePresent, 'contracts/package.json');
  const reasonCodes = [];
  const warnings = [];

  let status = 'not_applicable';
  let command = '';
  let cwd = '';
  let packageScope = '';
  let commandClass = '';
  let failureClass = '';

  if (!productRelevant) {
    reasonCodes.push('remote_product_checks_not_required');
  } else if (backendProduct && backendPackagePresent) {
    status = 'pass';
    command = 'npm test -- --runInBand';
    cwd = 'apps/backend';
    packageScope = 'apps/backend';
    commandClass = 'backend_npm_test';
  } else if (contractsProduct && contractsPackagePresent) {
    status = 'pass';
    command = 'npm test';
    cwd = 'contracts';
    packageScope = 'contracts';
    commandClass = 'contracts_npm_test';
  } else if (!backendProduct && !contractsProduct && rootPackagePresent) {
    status = 'pass';
    command = 'npm test';
    cwd = '.';
    packageScope = 'root';
    commandClass = 'root_npm_test';
  } else {
    status = 'fail';
    command = 'not_run';
    commandClass = 'command_scope_mismatch';
    failureClass = 'command_scope_mismatch';
    reasonCodes.push('remote_product_command_scope_mismatch');
    if (backendProduct && !backendPackagePresent) reasonCodes.push('backend_package_scope_missing');
    if (contractsProduct && !contractsPackagePresent) reasonCodes.push('contracts_package_scope_missing');
    if (!backendProduct && !contractsProduct && !rootPackagePresent) reasonCodes.push('root_package_missing');
  }

  const plan = {
    marker,
    schemaVersion: '1.0.0',
    harnessVersion: HARNESS_VERSION,
    phase: 'remote product checks',
    status,
    productRelevant,
    backendProduct,
    contractsProduct,
    rootPackagePresent,
    backendPackagePresent,
    contractsPackagePresent,
    command: command ? String(command).slice(0, 80) : '',
    cwd: safeRelative(cwd),
    packageScope: safeRelative(packageScope || cwd || ''),
    commandClass: commandClass ? safeToken(commandClass) : '',
    failureClass: failureClass ? safeToken(failureClass) : '',
    reasonCodes: [...new Set(reasonCodes)],
    warnings: [...new Set(warnings)],
    safeSummaryOnly: true,
  };

  if (scanObjectForUnsafe(plan).length) {
    return {
      marker,
      schemaVersion: '1.0.0',
      harnessVersion: HARNESS_VERSION,
      phase: 'remote product checks',
      status: 'fail',
      productRelevant,
      backendProduct,
      contractsProduct,
      rootPackagePresent,
      backendPackagePresent,
      contractsPackagePresent,
      command: '',
      cwd: '',
      packageScope: '',
      commandClass: '',
      failureClass: 'unsafe_value_detected',
      reasonCodes: ['unsafe_value_detected'],
      warnings: [],
      safeSummaryOnly: true,
    };
  }
  return plan;
}

export function buildRemoteProductCheckPlanReport(input = inputFromEnv(), env = process.env) {
  const plan = buildRemoteProductCheckPlan(input, env);
  return simpleStatus('remoteProductCheckPlanStatus', plan.status, {
    reasonCodes: plan.reasonCodes,
    warnings: plan.warnings,
    plan,
  });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const plan = buildRemoteProductCheckPlan();
  if (process.argv.includes('--plan-json')) {
    process.stdout.write(`${JSON.stringify(plan, null, 2)}\n`);
    process.exit(plan.status === 'fail' ? 1 : 0);
  }
  if (process.argv.includes('--write-artifact')) {
    const outPath = process.env.CODEX_REMOTE_PRODUCT_CHECKS_PATH || 'codex-remote-product-checks.safe.json';
    fs.writeFileSync(outPath, JSON.stringify(plan, null, 2));
  }
  const report = buildRemoteProductCheckPlanReport();
  writeJsonReport(report, 'CODEX_REMOTE_PRODUCT_CHECKS_REPORT');
  exitFor(report);
}
