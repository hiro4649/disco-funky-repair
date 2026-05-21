import { DEFAULT_REQUEST_BODY_LIMIT, getCorsOrigins, getRequestBodyLimit, requiresStrictCors } from '../runtime';

describe('runtime config', () => {
  it('uses development CORS defaults only outside strict runtimes', () => {
    expect(getCorsOrigins({ NODE_ENV: 'development' })).toEqual([
      'http://localhost:3000',
      'http://127.0.0.1:3000'
    ]);
  });

  it('requires explicit CORS origins in production and staging runtimes', () => {
    expect(() => getCorsOrigins({ NODE_ENV: 'production' })).toThrow(/BACKEND_CORS_ORIGINS/);
    expect(() => getCorsOrigins({ NODE_ENV: 'staging' })).toThrow(/BACKEND_CORS_ORIGINS/);
    expect(() => getCorsOrigins({ APP_ENV: 'staging' })).toThrow(/BACKEND_CORS_ORIGINS/);
    expect(() => getCorsOrigins({ BACKEND_APP_ENV: 'staging' })).toThrow(/BACKEND_CORS_ORIGINS/);
  });

  it('uses the same strict runtime criteria for production and staging markers', () => {
    expect(requiresStrictCors({ NODE_ENV: 'production' })).toBe(true);
    expect(requiresStrictCors({ NODE_ENV: 'staging' })).toBe(true);
    expect(requiresStrictCors({ NODE_ENV: 'development', APP_ENV: 'staging' })).toBe(true);
    expect(requiresStrictCors({ NODE_ENV: 'development', BACKEND_APP_ENV: 'staging' })).toBe(true);
    expect(requiresStrictCors({ NODE_ENV: 'development' })).toBe(false);
  });

  it('rejects unsafe CORS origins in staging runtime', () => {
    expect(() =>
      getCorsOrigins({
        NODE_ENV: 'staging',
        BACKEND_CORS_ORIGINS: 'https://localhost:3000'
      })
    ).toThrow(/localhost or raw IP/);

    expect(() =>
      getCorsOrigins({
        NODE_ENV: 'staging',
        BACKEND_CORS_ORIGINS: 'https://153.127.192.241'
      })
    ).toThrow(/localhost or raw IP/);
  });

  it('accepts explicit safe CORS origins in staging runtime', () => {
    expect(
      getCorsOrigins({
        NODE_ENV: 'staging',
        BACKEND_CORS_ORIGINS: 'https://staging.funky.fan,https://api-staging.funky.fan'
      })
    ).toEqual(['https://staging.funky.fan', 'https://api-staging.funky.fan']);

    expect(
      getCorsOrigins({
        BACKEND_APP_ENV: 'staging',
        BACKEND_CORS_ORIGINS: 'https://staging.funky.fan'
      })
    ).toEqual(['https://staging.funky.fan']);
  });

  it('uses a bounded default request body limit', () => {
    expect(getRequestBodyLimit({})).toBe(DEFAULT_REQUEST_BODY_LIMIT);
    expect(getRequestBodyLimit({ REQUEST_BODY_LIMIT: '1mb' })).toBe('1mb');
  });
});
