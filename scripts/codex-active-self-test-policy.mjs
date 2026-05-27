#!/usr/bin/env node
// CODEX_QUALITY_HARNESS_FILE v0.9.3

export const SELF_TEST_STATUS_KEYS = [
  'v080SelfTestStatus',
  'v081SelfTestStatus',
  'v082SelfTestStatus',
  'v083SelfTestStatus',
  'v084SelfTestStatus',
  'v085SelfTestStatus',
  'v086SelfTestStatus',
  'v087SelfTestStatus',
  'v088SelfTestStatus',
  'v089SelfTestStatus',
  'v090SelfTestStatus',
  'v092SelfTestStatus',
  'v093SelfTestStatus',
];

const ACTIVE_SELF_TEST_BY_VERSION = {
  '0.8.0': 'v080SelfTestStatus',
  '0.8.1': 'v081SelfTestStatus',
  '0.8.2': 'v082SelfTestStatus',
  '0.8.3': 'v083SelfTestStatus',
  '0.8.4': 'v084SelfTestStatus',
  '0.8.5': 'v085SelfTestStatus',
  '0.8.6': 'v086SelfTestStatus',
  '0.8.7': 'v087SelfTestStatus',
  '0.8.8': 'v088SelfTestStatus',
  '0.8.9': 'v089SelfTestStatus',
  '0.9.0': 'v090SelfTestStatus',
  '0.9.2': 'v092SelfTestStatus',
  '0.9.3': 'v093SelfTestStatus',
};

export function activeSelfTestStatusKey(harnessVersion) {
  return ACTIVE_SELF_TEST_BY_VERSION[String(harnessVersion || '').trim()] || null;
}

export function isSelfTestStatusKey(key) {
  return SELF_TEST_STATUS_KEYS.includes(key);
}

export function effectiveSelfTestStatus(key, status, harnessVersion) {
  if (!isSelfTestStatusKey(key)) return status || 'missing';
  const activeKey = activeSelfTestStatusKey(harnessVersion);
  if (!activeKey) return status || 'missing';
  if (key === activeKey) {
    return status === 'not_applicable' ? 'missing' : (status || 'missing');
  }
  return status === 'pass' ? 'pass' : 'pass_legacy_advisory';
}

export function buildLegacyCompatibilitySelfTestStatus(report = {}, harnessVersion) {
  const activeKey = activeSelfTestStatusKey(harnessVersion);
  const legacyStatuses = SELF_TEST_STATUS_KEYS
    .filter((key) => key !== activeKey)
    .filter((key) => report[key])
    .map((key) => ({
      key,
      status: report[key]?.status || 'missing',
      advisory: report[key]?.status !== 'pass',
      safeSummaryOnly: true,
    }));
  const failing = legacyStatuses.filter((item) => item.advisory);
  return {
    status: 'pass',
    activeSelfTestStatusKey: activeKey,
    legacyFailureCount: failing.length,
    legacyStatuses,
    reasonCodes: failing.length ? ['legacy_self_test_failure_advisory'] : [],
    safeSummaryOnly: true,
  };
}
