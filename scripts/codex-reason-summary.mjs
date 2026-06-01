#!/usr/bin/env node
// CODEX_QUALITY_HARNESS_FILE v1.0.2
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { HARNESS_VERSION, marker, readJson, scanObjectForUnsafe, simpleStatus, writeJsonReport, exitFor } from './codex-v080-lib.mjs';

function loadCatalog() {
  const parsed = readJson('docs/process/CODEX_FAILURE_REASON_CATALOG.json');
  if (!parsed.ok) return new Map();
  return new Map((parsed.value.reasonCodes || []).map((item) => [item.reasonCode, item]));
}

function safeCode(value) {
  return String(value || 'unknown_reason').replace(/[^A-Za-z0-9_.:-]/g, '_').slice(0, 120);
}

function isLegacySelfTestAdvisoryStatus(gate, report = {}) {
  const activeSelfTestKey = report.activeSelfTestRegistryStatus?.activeStatusKey || 'v102SelfTestStatus';
  return [
    'v085SelfTestStatus',
    'v098SelfTestStatus',
    'v099SelfTestStatus',
    'v100SelfTestStatus',
    'v101SelfTestStatus',
  ].includes(gate) && gate !== activeSelfTestKey;
}

function targetQualityPassed(report = {}) {
  return report.targetQualityScoreStatus?.status === 'pass';
}

function staleSelfTestFailureResolved(failure, report = {}) {
  if (!targetQualityPassed(report)) return false;
  const reason = String(failure?.id || failure?.reasonCode || '');
  const activeSelfTestKey = report.activeSelfTestRegistryStatus?.activeStatusKey || 'v102SelfTestStatus';
  const selfTestMatch = reason.match(/\b(v(?:085|098|099|100|101|102)SelfTestStatus)\.failed\b/);
  if (!selfTestMatch) return false;
  const key = selfTestMatch[1];
  if (isLegacySelfTestAdvisoryStatus(key, report)) return true;
  return key === activeSelfTestKey && report[key]?.status === 'pass';
}

export function buildCompactReasonSummary(report = {}, options = {}) {
  const catalog = loadCatalog();
  const mode = report.targetQualityScoreStatus ? 'target' : 'source';
  const score = report.targetQualityScoreStatus?.score ?? report.qualityScoreStatus?.score ?? null;
  const statusEntries = Object.entries(report).filter(([, value]) => value && typeof value === 'object' && typeof value.status === 'string');
  const blockingReasons = [];
  const manualReasons = [];
  const optionalNotApplicable = [];
  for (const [gate, value] of statusEntries) {
    const reasonCodes = value.reasonCodes?.length ? value.reasonCodes : [gate];
    if (value.status === 'fail' || value.status === 'missing') {
      if (value.status === 'fail' && isLegacySelfTestAdvisoryStatus(gate, report)) {
        optionalNotApplicable.push(gate);
        continue;
      }
      for (const code of reasonCodes) blockingReasons.push({ reasonCode: safeCode(code), gate });
    } else if (['manual_confirmation_required', 'warning'].includes(value.status)) {
      for (const code of reasonCodes) manualReasons.push({ reasonCode: safeCode(code), gate });
    } else if (value.status === 'not_applicable') {
      optionalNotApplicable.push(gate);
    }
  }
  for (const failure of report.failures || []) {
    if (staleSelfTestFailureResolved(failure, report)) continue;
    blockingReasons.push({ reasonCode: safeCode(failure.id || failure.reasonCode), gate: 'localQualityGate' });
  }
  const summaryStatus = blockingReasons.length ? 'fail'
    : manualReasons.length ? 'manual_confirmation_required'
      : targetQualityPassed(report) ? 'pass'
        : report.status || options.status || 'unknown';
  const nextActions = [...blockingReasons, ...manualReasons].slice(0, 5).map((item) => {
    const known = catalog.get(item.reasonCode);
    return known?.nextBestFix || `Review ${item.gate} safe reason ${item.reasonCode}.`;
  });
  const summary = {
    status: summaryStatus,
    mode,
    score,
    blockingReasons: blockingReasons.slice(0, 10),
    manualReasons: manualReasons.slice(0, 10),
    optionalNotApplicable: optionalNotApplicable.slice(0, 20),
    topNextActions: nextActions,
    safeSummaryOnly: true,
  };
  if (scanObjectForUnsafe(summary).length) {
    return { status: 'fail', reasonCodes: ['reason_summary_invalid'], summary: null };
  }
  return { status: 'pass', reasonCodes: [], summary };
}

export function buildReasonSummaryReport(report = {}) {
  const result = buildCompactReasonSummary(report);
  return simpleStatus('reasonSummaryStatus', result.status, {
    reasonCodes: result.reasonCodes,
    summary: result.summary,
  });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  try {
    const file = process.argv[2] || process.env.CODEX_REASON_SUMMARY_REPORT_PATH;
    const report = file ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
    const out = buildReasonSummaryReport(report);
    writeJsonReport(out, 'CODEX_REASON_SUMMARY_REPORT');
    exitFor(out);
  } catch {
    const out = simpleStatus('reasonSummaryStatus', 'fail', { reasonCodes: ['reason_summary_invalid'] });
    writeJsonReport(out, 'CODEX_REASON_SUMMARY_REPORT');
    process.exit(1);
  }
}
