import type { Express } from 'express';

const createMiddleware = (name: string, options?: unknown) => ({ name, options });

jest.mock('helmet', () => {
  const helmetMock = jest.fn((options?: unknown) => createMiddleware('helmet', options));

  Object.assign(helmetMock, {
    contentSecurityPolicy: jest.fn((options?: unknown) => createMiddleware('contentSecurityPolicy', options)),
    xssFilter: jest.fn(() => createMiddleware('xssFilter')),
    frameguard: jest.fn((options?: unknown) => createMiddleware('frameguard', options)),
    noSniff: jest.fn(() => createMiddleware('noSniff')),
    hidePoweredBy: jest.fn(() => createMiddleware('hidePoweredBy')),
    hsts: jest.fn((options?: unknown) => createMiddleware('hsts', options))
  });

  return helmetMock;
});

jest.mock('express-session', () => jest.fn((options?: unknown) => createMiddleware('session', options)));

const helmet = require('helmet') as jest.Mock & {
  contentSecurityPolicy: jest.Mock;
};
const session = require('express-session') as jest.Mock;
const { configureSecurityMiddleware } = require('../security') as typeof import('../security');

type MockExpress = Express & {
  use: jest.Mock;
};

const ORIGINAL_ENV = process.env;

const createApp = (): MockExpress => ({
  use: jest.fn()
} as unknown as MockExpress);

const setEnv = (env: NodeJS.ProcessEnv) => {
  process.env = { ...ORIGINAL_ENV, ...env };
  for (const [name, value] of Object.entries(env)) {
    if (value === undefined) {
      delete process.env[name];
    }
  }
};

describe('configureSecurityMiddleware strict runtime behavior', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setEnv({
      NODE_ENV: 'test',
      SESSION_SECRET: 'redacted-test-session-secret',
      COOKIE_DOMAIN: '.staging.funky.fan'
    });
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it.each([
    ['NODE_ENV=staging', { NODE_ENV: 'staging' }],
    ['APP_ENV=staging', { NODE_ENV: 'development', APP_ENV: 'staging' }],
    ['BACKEND_APP_ENV=staging', { NODE_ENV: 'development', BACKEND_APP_ENV: 'staging' }]
  ])('uses production-equivalent security settings for %s', (_label, env) => {
    setEnv({
      SESSION_SECRET: 'redacted-test-session-secret',
      COOKIE_DOMAIN: '.staging.funky.fan',
      ...env
    });

    configureSecurityMiddleware(createApp());

    expect(helmet).toHaveBeenCalledWith();
    expect(helmet.contentSecurityPolicy).toHaveBeenCalledTimes(1);
    expect(helmet.contentSecurityPolicy.mock.calls[0][0]).toMatchObject({
      directives: {
        connectSrc: ["'self'"]
      }
    });

    expect(session).toHaveBeenCalledTimes(1);
    expect(session.mock.calls[0][0]).toMatchObject({
      cookie: {
        secure: true,
        sameSite: 'strict',
        domain: '.staging.funky.fan'
      }
    });
  });

  it('requires SESSION_SECRET in staging before session middleware is installed', () => {
    setEnv({ NODE_ENV: 'staging', SESSION_SECRET: undefined });

    expect(() => configureSecurityMiddleware(createApp())).toThrow('SESSION_SECRET is required');
    expect(session).not.toHaveBeenCalled();
  });

  it('keeps development session cookies non-strict and host-only', () => {
    setEnv({
      NODE_ENV: 'development',
      SESSION_SECRET: 'redacted-test-session-secret',
      COOKIE_DOMAIN: '.staging.funky.fan'
    });

    configureSecurityMiddleware(createApp());

    expect(session.mock.calls[0][0]).toMatchObject({
      cookie: {
        secure: false,
        sameSite: 'lax',
        domain: undefined
      }
    });
  });
});
