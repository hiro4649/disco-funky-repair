export type SafePrimitiveSnapshot = string | number | boolean | null;

const UNSAFE_SAFE_SUMMARY_PATTERNS = [
  /raw[\s_-]*(secret|env|log|payload|endpoint)/i,
  /private[\s_-]*(key|path|identifier)/i,
  /local[\s_-]*(file[\s_-]*)?path/i,
  /authorization\s*[:=]/i,
  /bearer\s+[a-z0-9._-]+/i,
  /jwt\s*[:=]/i,
  /cookie\s*[:=]/i,
  /database_url\s*[:=]/i,
  /postgres(?:ql)?:\/\//i,
  /rpc[\s_-]*secret/i,
  /runtime[\s_-]*ready|production[\s_-]*ready|staging[\s_-]*ready|export[\s_-]*ready|actual[\s_-]*source[\s_-]*ready/i,
  /https?:\/\//i,
  /0x[a-f0-9]{40}/i,
  /[a-z]:[\\/]/i,
  /(^|[\s"'])(\/(?:users|home|var|etc|tmp)\/[^\s"']*)/i,
  /\.\.[\\/]/
];

export function isPlainDataRecord(value: unknown): value is Record<string, unknown> {
  try {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
    const proto = Object.getPrototypeOf(value);
    return proto === Object.prototype || proto === null;
  } catch {
    return false;
  }
}

export function hasOwnDataProperty(record: object, key: string): boolean {
  try {
    const descriptor = Object.getOwnPropertyDescriptor(record, key);
    return !!descriptor && 'value' in descriptor;
  } catch {
    return false;
  }
}

export function readOwnDataProperty(record: object, key: string): unknown {
  try {
    const descriptor = Object.getOwnPropertyDescriptor(record, key);
    if (!descriptor || !('value' in descriptor)) return undefined;
    return descriptor.value;
  } catch {
    return undefined;
  }
}

export function listOwnEnumerableDataKeys(record: object): string[] | null {
  try {
    const keys = Object.keys(record);
    for (const key of keys) {
      if (!hasOwnDataProperty(record, key)) return null;
    }
    return keys;
  } catch {
    return null;
  }
}

export function isSafeLowerToken(value: unknown, max = 128): value is string {
  return typeof value === 'string'
    && value.length <= max
    && /^[a-z0-9][a-z0-9_-]{2,127}$/.test(value);
}

export function isSafeSourceHeadSha(value: unknown): value is string {
  return typeof value === 'string' && /^[a-f0-9]{40}$/.test(value);
}

export function isSafeSha256Label(value: unknown): value is string {
  return typeof value === 'string' && /^sha256:[a-f0-9]{64}$/.test(value);
}

export function containsUnsafeSafeSummaryString(value: unknown): boolean {
  if (typeof value === 'string') return UNSAFE_SAFE_SUMMARY_PATTERNS.some((pattern) => pattern.test(value));
  if (Array.isArray(value)) return value.some(containsUnsafeSafeSummaryString);
  if (!isPlainDataRecord(value)) return false;
  const keys = listOwnEnumerableDataKeys(value);
  if (!keys) return true;
  return keys.some((key) => containsUnsafeSafeSummaryString(readOwnDataProperty(value, key)));
}

export function reduceForbiddenBooleanFlags<T extends string>(
  sources: Array<Partial<Record<T, boolean>>>,
  forbiddenFlags: readonly T[]
): Record<T, boolean> {
  const result = Object.fromEntries(forbiddenFlags.map((flag) => [flag, false])) as Record<T, boolean>;
  for (const source of sources) {
    for (const flag of forbiddenFlags) {
      if (source[flag] === true) result[flag] = true;
    }
  }
  return result;
}

export function normalizeGenericBlockerPresence(
  value: unknown,
  addBlocker: (blocker: string) => void,
  invalidCode = 'upstream_blockers_invalid',
  presentCode = 'upstream_blocker_present'
): void {
  if (!Array.isArray(value)) {
    addBlocker(invalidCode);
    return;
  }
  if (value.length > 0) addBlocker(presentCode);
}

export function normalizeAllowlistedReviewReasons(
  value: unknown,
  allowlist: ReadonlySet<string> | readonly string[],
  addBlocker: (blocker: string) => void,
  addReviewReason: (reason: string) => void,
  invalidCode = 'needs_review_reasons_invalid',
  redactedCode = 'upstream_review_reason_redacted'
): void {
  if (!Array.isArray(value)) {
    addBlocker(invalidCode);
    return;
  }
  const allowed = allowlist instanceof Set ? allowlist : new Set(allowlist);
  for (const reason of value) {
    if (typeof reason === 'string' && allowed.has(reason)) addReviewReason(reason);
    else addReviewReason(redactedCode);
  }
}

export function strictOrderedStringArrayEqual(actual: unknown, expected: readonly string[]): boolean {
  return Array.isArray(actual)
    && actual.length === expected.length
    && actual.every((value, index) => typeof value === 'string' && value === expected[index]);
}

export function safePrimitiveSnapshot(value: unknown): SafePrimitiveSnapshot | undefined {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  return undefined;
}

export function safeJsonByteLength(value: unknown, maxBytes?: number): { ok: true; byteLength: number } | { ok: false; byteLength: 0 } {
  try {
    JSON.stringify(value);
    const byteLength = Buffer.byteLength(JSON.stringify(value), 'utf8');
    if (maxBytes !== undefined && byteLength > maxBytes) return { ok: false, byteLength: 0 };
    return { ok: true, byteLength };
  } catch {
    return { ok: false, byteLength: 0 };
  }
}
