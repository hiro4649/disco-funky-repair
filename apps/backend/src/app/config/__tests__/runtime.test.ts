import { DEFAULT_REQUEST_BODY_LIMIT, getCorsOrigins, getRequestBodyLimit } from '../runtime';

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
  });

  it('uses a bounded default request body limit', () => {
    expect(getRequestBodyLimit({})).toBe(DEFAULT_REQUEST_BODY_LIMIT);
    expect(getRequestBodyLimit({ REQUEST_BODY_LIMIT: '1mb' })).toBe('1mb');
  });
});
