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
  inspectOwnProperty,
  strictOrderedPrimitiveArrayEqual,
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

  it('inspects own properties without executing accessors', () => {
    let touched = false;
    const record = Object.defineProperty({ data: 1 }, 'accessor', {
      enumerable: true,
      get() {
        touched = true;
        return true;
      }
    });
    expect(inspectOwnProperty(record, 'missing')).toEqual({ kind: 'absent' });
    expect(inspectOwnProperty(record, 'data')).toEqual({ kind: 'data', value: 1 });
    expect(inspectOwnProperty(record, 'accessor')).toEqual({ kind: 'accessor' });
    expect(touched).toBe(false);
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

  it('treats cyclic, deep, node-heavy, and non-plain unsafe values as unsafe without throwing', () => {
    const cyclicObject: Record<string, unknown> = {};
    cyclicObject.self = cyclicObject;
    const cyclicArray: unknown[] = [];
    cyclicArray.push(cyclicArray);
    const a: Record<string, unknown> = {};
    const b: Record<string, unknown> = { a };
    a.b = b;
    let deep: Record<string, unknown> = {};
    let cursor = deep;
    for (let index = 0; index < 18; index += 1) {
      cursor.next = {};
      cursor = cursor.next as Record<string, unknown>;
    }
    const manyNodes = Object.fromEntries(Array.from({ length: 520 }, (_, index) => [`k${index}`, 'safe']));

    class Box {
      value = 'safe';
    }

    expect(containsUnsafeSafeSummaryString({ nested: { ok: ['safe', 1, false, null] } })).toBe(false);
    expect(containsUnsafeSafeSummaryString({ nested: { bad: 'raw_payload=hidden' } })).toBe(true);
    expect(containsUnsafeSafeSummaryString(cyclicObject)).toBe(true);
    expect(containsUnsafeSafeSummaryString(cyclicArray)).toBe(true);
    expect(containsUnsafeSafeSummaryString(a)).toBe(true);
    expect(containsUnsafeSafeSummaryString(deep)).toBe(true);
    expect(containsUnsafeSafeSummaryString(manyNodes)).toBe(true);
    expect(containsUnsafeSafeSummaryString(new Date())).toBe(true);
    expect(containsUnsafeSafeSummaryString(Buffer.from('safe'))).toBe(true);
    expect(containsUnsafeSafeSummaryString(new Box())).toBe(true);
    expect(containsUnsafeSafeSummaryString(1n)).toBe(true);
    expect(containsUnsafeSafeSummaryString(() => null)).toBe(true);
    expect(containsUnsafeSafeSummaryString(Symbol('x'))).toBe(true);
  });

  it('does not execute array accessors or proxy traps while detecting unsafe strings', () => {
    let touched = false;
    const array: unknown[] = [];
    Object.defineProperty(array, '0', {
      enumerable: true,
      get() {
        touched = true;
        return 'safe';
      }
    });
    const proxy = new Proxy({ safe: 'value' }, {
      ownKeys() {
        throw new Error('raw trap');
      }
    });

    expect(containsUnsafeSafeSummaryString(array)).toBe(true);
    expect(containsUnsafeSafeSummaryString(proxy)).toBe(true);
    expect(touched).toBe(false);
  });

  it('reduces forbidden boolean flags where true survives later false', () => {
    expect(reduceForbiddenBooleanFlags([{ a: true }, { a: false, b: true }], ['a', 'b'])).toEqual({
      a: true,
      b: true
    });
  });

  it('reduces forbidden flags through descriptors and reports malformed sources', () => {
    const malformed: Array<string | null> = [];
    let touched = false;
    const accessor = Object.defineProperty({}, 'a', {
      enumerable: true,
      get() {
        touched = true;
        return true;
      }
    });
    class Box {
      a = true;
    }
    const proxy = new Proxy({}, {
      getOwnPropertyDescriptor() {
        throw new Error('raw trap');
      }
    });

    expect(reduceForbiddenBooleanFlags([{ a: true }, { a: false, b: false }], ['a', 'b'], (flag) => malformed.push(flag))).toEqual({ a: true, b: false });
    expect(reduceForbiddenBooleanFlags([null, undefined, { a: false }], ['a'], (flag) => malformed.push(flag))).toEqual({ a: false });
    reduceForbiddenBooleanFlags([{ a: 'true' } as never, accessor as never, proxy as never, new Box() as never], ['a'], (flag) => malformed.push(flag));
    expect(malformed).toEqual(['a', 'a', 'a', null]);
    expect(touched).toBe(false);
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

  it('compares ordered primitive arrays without coercion', () => {
    expect(strictOrderedPrimitiveArrayEqual(['a', 1, true, null], ['a', 1, true, null])).toBe(true);
    expect(strictOrderedPrimitiveArrayEqual(['1'], [1])).toBe(false);
    expect(strictOrderedPrimitiveArrayEqual([NaN], [NaN])).toBe(false);
    expect(strictOrderedPrimitiveArrayEqual([{}], [{} as never])).toBe(false);
    expect(strictOrderedPrimitiveArrayEqual([Symbol('x')], [Symbol('x') as never])).toBe(false);
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

  it('safe JSON byte length snapshots untrusted data without executing getters or toJSON', () => {
    let getterTouched = false;
    let toJsonTouched = false;
    const withGetter = Object.defineProperty({}, 'secret', {
      enumerable: true,
      get() {
        getterTouched = true;
        return 'safe';
      }
    });
    const withToJson = {
      safe: 'value',
      toJSON() {
        toJsonTouched = true;
        return { leaked: true };
      }
    };
    const cyclicArray: unknown[] = [];
    cyclicArray.push(cyclicArray);
    class Box {
      value = 'safe';
    }
    let deep: Record<string, unknown> = {};
    let cursor = deep;
    for (let index = 0; index < 18; index += 1) {
      cursor.next = {};
      cursor = cursor.next as Record<string, unknown>;
    }
    const manyNodes = Object.fromEntries(Array.from({ length: 520 }, (_, index) => [`k${index}`, 'safe']));
    const proxy = new Proxy({ safe: 'value' }, {
      ownKeys() {
        throw new Error('raw trap');
      }
    });

    expect(safeJsonByteLength(['safe', 1, false, null]).ok).toBe(true);
    expect(safeJsonByteLength(1n)).toEqual({ ok: false, byteLength: 0 });
    expect(safeJsonByteLength(() => null)).toEqual({ ok: false, byteLength: 0 });
    expect(safeJsonByteLength(Symbol('x'))).toEqual({ ok: false, byteLength: 0 });
    expect(safeJsonByteLength(undefined)).toEqual({ ok: false, byteLength: 0 });
    expect(safeJsonByteLength(new Date())).toEqual({ ok: false, byteLength: 0 });
    expect(safeJsonByteLength(Buffer.from('safe'))).toEqual({ ok: false, byteLength: 0 });
    expect(safeJsonByteLength(new Box())).toEqual({ ok: false, byteLength: 0 });
    expect(safeJsonByteLength(withGetter)).toEqual({ ok: false, byteLength: 0 });
    expect(safeJsonByteLength(withToJson)).toEqual({ ok: false, byteLength: 0 });
    expect(safeJsonByteLength(cyclicArray)).toEqual({ ok: false, byteLength: 0 });
    expect(safeJsonByteLength(deep)).toEqual({ ok: false, byteLength: 0 });
    expect(safeJsonByteLength(manyNodes)).toEqual({ ok: false, byteLength: 0 });
    expect(safeJsonByteLength(proxy)).toEqual({ ok: false, byteLength: 0 });
    expect(getterTouched).toBe(false);
    expect(toJsonTouched).toBe(false);
  });
});
