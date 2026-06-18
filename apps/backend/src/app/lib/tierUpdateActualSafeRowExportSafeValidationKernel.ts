export type SafePrimitiveSnapshot = string | number | boolean | null;
export type OwnPropertyInspection =
  | { kind: 'absent' }
  | { kind: 'data'; value: unknown }
  | { kind: 'accessor' }
  | { kind: 'error' };
export type SafeOwnDataArrayResult<T> =
  | { ok: true; values: T[] }
  | {
      ok: false;
      reason:
        | 'not_array'
        | 'length_invalid'
        | 'too_long'
        | 'sparse'
        | 'accessor'
        | 'descriptor_error'
        | 'invalid_item';
    };

export type PropertyPresenceInspection = 'absent' | 'data' | 'accessor' | 'error';

type TraversalState = {
  visited: WeakSet<object>;
  nodeCount: number;
  maxDepth: number;
  maxNodes: number;
};

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
  return inspectOwnProperty(record, key).kind === 'data';
}

export function readOwnDataProperty(record: object, key: string): unknown {
  const inspection = inspectOwnProperty(record, key);
  return inspection.kind === 'data' ? inspection.value : undefined;
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

export function inspectOwnProperty(record: object, key: string): OwnPropertyInspection {
  try {
    const descriptor = Object.getOwnPropertyDescriptor(record, key);
    if (!descriptor) return { kind: 'absent' };
    if (!('value' in descriptor)) return { kind: 'accessor' };
    return { kind: 'data', value: descriptor.value };
  } catch {
    return { kind: 'error' };
  }
}

export function inspectPropertyPresence(record: object, key: string): PropertyPresenceInspection {
  return inspectOwnProperty(record, key).kind;
}

export function hasOwnPropertySafely(record: object, key: string): boolean {
  const inspection = inspectOwnProperty(record, key);
  return inspection.kind === 'data' || inspection.kind === 'accessor';
}

export function readDenseOwnDataArray<T>(
  value: unknown,
  options: {
    maxLength: number;
    minLength?: number;
    validateItem: (value: unknown, index: number) => value is T;
  }
): SafeOwnDataArrayResult<T> {
  if (!Array.isArray(value)) return { ok: false, reason: 'not_array' };
  const lengthInspection = inspectOwnProperty(value, 'length');
  if (lengthInspection.kind === 'accessor') return { ok: false, reason: 'accessor' };
  if (lengthInspection.kind === 'error') return { ok: false, reason: 'descriptor_error' };
  if (lengthInspection.kind !== 'data'
    || typeof lengthInspection.value !== 'number'
    || !Number.isFinite(lengthInspection.value)
    || !Number.isInteger(lengthInspection.value)
    || lengthInspection.value < (options.minLength ?? 0)) {
    return { ok: false, reason: 'length_invalid' };
  }
  if (lengthInspection.value > options.maxLength) return { ok: false, reason: 'too_long' };

  const values: T[] = [];
  for (let index = 0; index < lengthInspection.value; index += 1) {
    const inspection = inspectOwnProperty(value, String(index));
    if (inspection.kind === 'absent') return { ok: false, reason: 'sparse' };
    if (inspection.kind === 'accessor') return { ok: false, reason: 'accessor' };
    if (inspection.kind === 'error') return { ok: false, reason: 'descriptor_error' };
    if (!options.validateItem(inspection.value, index)) return { ok: false, reason: 'invalid_item' };
    values.push(inspection.value);
  }
  return { ok: true, values };
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
  return containsUnsafeSafeSummaryStringInner(value, {
    visited: new WeakSet<object>(),
    nodeCount: 0,
    maxDepth: 16,
    maxNodes: 512
  }, 0);
}

function containsUnsafeSafeSummaryStringInner(value: unknown, state: TraversalState, depth: number): boolean {
  state.nodeCount += 1;
  if (state.nodeCount > state.maxNodes || depth > state.maxDepth) return true;
  if (typeof value === 'string') return UNSAFE_SAFE_SUMMARY_PATTERNS.some((pattern) => pattern.test(value));
  if (value === undefined || value === null || typeof value === 'number' || typeof value === 'boolean') return false;
  if (typeof value === 'bigint' || typeof value === 'function' || typeof value === 'symbol') return true;
  if (!value || typeof value !== 'object') return false;
  if (state.visited.has(value)) return true;
  state.visited.add(value);
  if (Array.isArray(value)) {
    let keys: string[];
    try {
      keys = Object.keys(value);
    } catch {
      return true;
    }
    for (const key of keys) {
      const inspection = inspectOwnProperty(value, key);
      if (inspection.kind !== 'data') return true;
      if (containsUnsafeSafeSummaryStringInner(inspection.value, state, depth + 1)) return true;
    }
    return false;
  }
  if (!isPlainDataRecord(value)) return true;
  const keys = listOwnEnumerableDataKeys(value);
  if (!keys) return true;
  return keys.some((key) => containsUnsafeSafeSummaryStringInner(readOwnDataProperty(value, key), state, depth + 1));
}

export function reduceForbiddenBooleanFlags<T extends string>(
  sources: Array<Partial<Record<T, boolean>> | null | undefined>,
  forbiddenFlags: readonly T[],
  onMalformed?: (flag: T | null) => void
): Record<T, boolean> {
  const result = Object.fromEntries(forbiddenFlags.map((flag) => [flag, false])) as Record<T, boolean>;
  for (const source of sources) {
    if (source === null || source === undefined) continue;
    if (!isPlainDataRecord(source)) {
      onMalformed?.(null);
      continue;
    }
    for (const flag of forbiddenFlags) {
      const inspection = inspectOwnProperty(source, flag);
      if (inspection.kind === 'absent') continue;
      if (inspection.kind === 'accessor' || inspection.kind === 'error' || typeof inspection.value !== 'boolean') {
        onMalformed?.(flag);
        continue;
      }
      if (inspection.value === true) result[flag] = true;
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
  const array = readDenseOwnDataArray(value, {
    maxLength: 128,
    validateItem: (item): item is string => typeof item === 'string'
  });
  if (!array.ok) {
    addBlocker(invalidCode);
    return;
  }
  if (array.values.length > 0) addBlocker(presentCode);
}

export function normalizeAllowlistedReviewReasons(
  value: unknown,
  allowlist: ReadonlySet<string> | readonly string[],
  addBlocker: (blocker: string) => void,
  addReviewReason: (reason: string) => void,
  invalidCode = 'needs_review_reasons_invalid',
  redactedCode = 'upstream_review_reason_redacted'
): void {
  const array = readDenseOwnDataArray(value, {
    maxLength: 128,
    validateItem: (item): item is string => typeof item === 'string'
  });
  if (!array.ok) {
    addBlocker(invalidCode);
    return;
  }
  const allowed = allowlist instanceof Set ? allowlist : new Set(allowlist);
  for (const reason of array.values) {
    if (allowed.has(reason)) addReviewReason(reason);
    else addReviewReason(redactedCode);
  }
}

export function strictOrderedStringArrayEqual(actual: unknown, expected: readonly string[]): boolean {
  const array = readDenseOwnDataArray(actual, {
    maxLength: expected.length,
    validateItem: (item): item is string => typeof item === 'string'
  });
  if (!array.ok || array.values.length !== expected.length) return false;
  for (let index = 0; index < expected.length; index += 1) {
    if (array.values[index] !== expected[index]) return false;
    for (let seenIndex = 0; seenIndex < index; seenIndex += 1) {
      if (array.values[seenIndex] === array.values[index]) return false;
    }
  }
  return true;
}

export function isNonEmptyTrimmedString(value: unknown, max?: number): value is string {
  return typeof value === 'string' && value.trim() !== '' && (max === undefined || value.length <= max);
}

export function strictOrderedPrimitiveArrayEqual(
  actual: unknown,
  expected: readonly (string | number | boolean | null)[]
): boolean {
  const array = readDenseOwnDataArray(actual, {
    maxLength: expected.length,
    validateItem: (item): item is string | number | boolean | null => item === null
      || typeof item === 'string'
      || typeof item === 'boolean'
      || (typeof item === 'number' && Number.isFinite(item))
  });
  if (!array.ok || array.values.length !== expected.length) return false;
  for (let index = 0; index < expected.length; index += 1) {
    const value = array.values[index];
    const valid = value === null
      || typeof value === 'string'
      || typeof value === 'boolean'
      || (typeof value === 'number' && Number.isFinite(value));
    if (!valid || value !== expected[index]) return false;
    for (let seenIndex = 0; seenIndex < index; seenIndex += 1) {
      if (array.values[seenIndex] === value) return false;
    }
  }
  return true;
}

export function safePrimitiveSnapshot(value: unknown): SafePrimitiveSnapshot | undefined {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  return undefined;
}

export function safeJsonByteLength(value: unknown, maxBytes?: number): { ok: true; byteLength: number } | { ok: false; byteLength: 0 } {
  const snapshot = buildSafeJsonSnapshot(value, {
    visited: new WeakSet<object>(),
    nodeCount: 0,
    maxDepth: 16,
    maxNodes: 512
  }, 0);
  if (!snapshot.ok) return { ok: false, byteLength: 0 };
  try {
    const json = JSON.stringify(snapshot.value);
    if (typeof json !== 'string') return { ok: false, byteLength: 0 };
    const byteLength = Buffer.byteLength(json, 'utf8');
    if (maxBytes !== undefined && byteLength > maxBytes) return { ok: false, byteLength: 0 };
    return { ok: true, byteLength };
  } catch {
    return { ok: false, byteLength: 0 };
  }
}

function buildSafeJsonSnapshot(
  value: unknown,
  state: TraversalState,
  depth: number
): { ok: true; value: unknown } | { ok: false } {
  state.nodeCount += 1;
  if (state.nodeCount > state.maxNodes || depth > state.maxDepth) return { ok: false };
  const primitive = safePrimitiveSnapshot(value);
  if (primitive !== undefined) return { ok: true, value: primitive };
  if (value === undefined || typeof value === 'bigint' || typeof value === 'function' || typeof value === 'symbol') return { ok: false };
  if (!value || typeof value !== 'object') return { ok: false };
  if (state.visited.has(value)) return { ok: false };
  state.visited.add(value);
  if (Array.isArray(value)) {
    let keys: string[];
    try {
      keys = Object.keys(value);
    } catch {
      return { ok: false };
    }
    const snapshot: unknown[] = [];
    for (const key of keys) {
      if (!/^(0|[1-9][0-9]*)$/.test(key)) return { ok: false };
      const inspection = inspectOwnProperty(value, key);
      if (inspection.kind !== 'data') return { ok: false };
      const item = buildSafeJsonSnapshot(inspection.value, state, depth + 1);
      if (!item.ok) return { ok: false };
      snapshot[Number(key)] = item.value;
    }
    return { ok: true, value: snapshot };
  }
  if (!isPlainDataRecord(value)) return { ok: false };
  if (hasOwnPropertySafely(value, 'toJSON')) return { ok: false };
  const keys = listOwnEnumerableDataKeys(value);
  if (!keys) return { ok: false };
  const snapshot: Record<string, unknown> = {};
  for (const key of keys) {
    const item = buildSafeJsonSnapshot(readOwnDataProperty(value, key), state, depth + 1);
    if (!item.ok) return { ok: false };
    snapshot[key] = item.value;
  }
  return { ok: true, value: snapshot };
}
