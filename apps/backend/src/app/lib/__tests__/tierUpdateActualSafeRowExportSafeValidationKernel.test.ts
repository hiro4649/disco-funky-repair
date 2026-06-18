import {
  containsUnsafeSafeSummaryString,
  hasOwnDataProperty,
  isPlainDataRecord,
  isSafeLowerToken,
  isSafeSha256Label,
  isSafeSourceHeadSha,
  listOwnEnumerableDataKeys,
  normalizeAllowlistedReviewReasons,
  normalizeGenericBlockerPresence,
  readOwnDataProperty,
  reduceForbiddenBooleanFlags,
  safeJsonByteLength,
  safePrimitiveSnapshot,
  strictOrderedStringArrayEqual
} from '../tierUpdateActualSafeRowExportSafeValidationKernel';

describe('tierUpdateActualSafeRowExportSafeValidationKernel', () => {
  it('accepts plain data records and rejects null arrays and class instances', () => {
    class Box {
      value = 'x';
    }

    expect(isPlainDataRecord({ a: 1 })).toBe(true);
    expect(isPlainDataRecord(Object.create(null))).toBe(true);
    expect(isPlainDataRecord(null)).toBe(false);
    expect(isPlainDataRecord([])).toBe(false);
    expect(isPlainDataRecord(new Box())).toBe(false);
  });

  it('does not execute getters while checking or reading own data properties', () => {
    let touched = false;
    const record = Object.defineProperty({}, 'secret', {
      enumerable: true,
      get() {
        touched = true;
        throw new Error('raw getter must not run');
      }
    });

    expect(hasOwnDataProperty(record, 'secret')).toBe(false);
    expect(readOwnDataProperty(record, 'secret')).toBeUndefined();
    expect(listOwnEnumerableDataKeys(record)).toBeNull();
    expect(touched).toBe(false);
  });

  it('treats proxy traps as safe failure instead of exposing raw errors', () => {
    const proxy = new Proxy({}, {
      getPrototypeOf() {
        throw new Error('raw proto');
      },
      getOwnPropertyDescriptor() {
        throw new Error('raw trap');
      },
      ownKeys() {
        throw new Error('raw keys');
      }
    });

    expect(isPlainDataRecord(proxy)).toBe(false);
    expect(hasOwnDataProperty(proxy, 'x')).toBe(false);
    expect(readOwnDataProperty(proxy, 'x')).toBeUndefined();
    expect(listOwnEnumerableDataKeys(proxy)).toBeNull();
  });

  it('reads own data properties and enumerable data keys only', () => {
    const record = { safe: 'value' };
    expect(hasOwnDataProperty(record, 'safe')).toBe(true);
    expect(readOwnDataProperty(record, 'safe')).toBe('value');
    expect(listOwnEnumerableDataKeys(record)).toEqual(['safe']);
  });

  it('validates safe tokens, source head sha, and sha256 labels', () => {
    expect(isSafeLowerToken('safe_label_01', 32)).toBe(true);
    expect(isSafeLowerToken('BadLabel', 32)).toBe(false);
    expect(isSafeLowerToken('ab', 32)).toBe(false);
    expect(isSafeLowerToken('safe_label_01', 5)).toBe(false);
    expect(isSafeSourceHeadSha('a'.repeat(40))).toBe(true);
    expect(isSafeSourceHeadSha('A'.repeat(40))).toBe(false);
    expect(isSafeSha256Label(`sha256:${'b'.repeat(64)}`)).toBe(true);
    expect(isSafeSha256Label(`sha256:${'B'.repeat(64)}`)).toBe(false);
  });

  it('detects unsafe safe summary strings without requiring raw output', () => {
    expect(containsUnsafeSafeSummaryString('fixture only')).toBe(false);
    expect(containsUnsafeSafeSummaryString('DATABASE_URL=hidden')).toBe(true);
    expect(containsUnsafeSafeSummaryString({ nested: ['runtime_ready'] })).toBe(true);
  });

  it('reduces forbidden boolean flags where true survives later false', () => {
    expect(reduceForbiddenBooleanFlags([{ a: true }, { a: false, b: true }], ['a', 'b'])).toEqual({
      a: true,
      b: true
    });
  });

  it('normalizes generic blocker presence without echoing blocker values', () => {
    const blockers: string[] = [];
    normalizeGenericBlockerPresence(['raw secret text'], (blocker) => blockers.push(blocker));
    expect(blockers).toEqual(['upstream_blocker_present']);
  });

  it('keeps allowlisted review reasons and redacts unsafe values', () => {
    const blockers: string[] = [];
    const reviewReasons: string[] = [];
    normalizeAllowlistedReviewReasons(
      ['known_safe_reason', 'DATABASE_URL=hidden'],
      ['known_safe_reason'],
      (blocker) => blockers.push(blocker),
      (reason) => reviewReasons.push(reason)
    );
    expect(blockers).toEqual([]);
    expect(reviewReasons).toEqual(['known_safe_reason', 'upstream_review_reason_redacted']);
  });

  it('compares ordered string arrays exactly', () => {
    expect(strictOrderedStringArrayEqual(['a', 'b'], ['a', 'b'])).toBe(true);
    expect(strictOrderedStringArrayEqual(['b', 'a'], ['a', 'b'])).toBe(false);
    expect(strictOrderedStringArrayEqual(['a'], ['a', 'b'])).toBe(false);
    expect(strictOrderedStringArrayEqual(['a', 'b', 'b'], ['a', 'b'])).toBe(false);
  });

  it('snapshots safe primitives and rejects bigint function symbol and cyclic values', () => {
    expect(safePrimitiveSnapshot('safe')).toBe('safe');
    expect(safePrimitiveSnapshot(1)).toBe(1);
    expect(safePrimitiveSnapshot(null)).toBeNull();
    expect(safePrimitiveSnapshot(1n)).toBeUndefined();
    expect(safePrimitiveSnapshot(Symbol('x'))).toBeUndefined();
    expect(safePrimitiveSnapshot(() => null)).toBeUndefined();
    const cyclic: Record<string, unknown> = {};
    cyclic.self = cyclic;
    expect(safePrimitiveSnapshot(cyclic)).toBeUndefined();
  });

  it('returns byte length for safe JSON and rejects oversize or cyclic values without raw errors', () => {
    expect(safeJsonByteLength({ safe: 'value' }, 64)).toEqual({ ok: true, byteLength: 16 });
    expect(safeJsonByteLength({ safe: 'value' }, 5)).toEqual({ ok: false, byteLength: 0 });
    const cyclic: Record<string, unknown> = {};
    cyclic.self = cyclic;
    expect(safeJsonByteLength(cyclic)).toEqual({ ok: false, byteLength: 0 });
  });
});
