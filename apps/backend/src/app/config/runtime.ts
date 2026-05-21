import { isIP } from 'net';

const DEVELOPMENT_CORS_ORIGINS = [
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

export const DEFAULT_REQUEST_BODY_LIMIT = '5mb';
const STRICT_CORS_ENVIRONMENTS = new Set(['production', 'staging']);
const normalizeRuntimeEnv = (value: string | undefined): string => value?.trim().toLowerCase() ?? '';

const parseCsv = (value: string | undefined): string[] =>
  (value ?? '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);

export const requiresStrictCors = (env: NodeJS.ProcessEnv): boolean =>
  STRICT_CORS_ENVIRONMENTS.has(normalizeRuntimeEnv(env.NODE_ENV)) ||
  normalizeRuntimeEnv(env.APP_ENV) === 'staging' ||
  normalizeRuntimeEnv(env.BACKEND_APP_ENV) === 'staging';

const validateStrictCorsOrigin = (origin: string): string | null => {
  try {
    const parsed = new URL(origin);
    const hostname = parsed.hostname.toLowerCase();
    const normalizedOrigin = origin.endsWith('/') ? origin.slice(0, -1) : origin;

    if (parsed.protocol !== 'https:') {
      return 'BACKEND_CORS_ORIGINS must use https origins';
    }
    if (parsed.origin !== normalizedOrigin || parsed.pathname !== '/' || parsed.search || parsed.hash) {
      return 'BACKEND_CORS_ORIGINS entries must be origins without path, query, or hash';
    }
    if (['localhost', '127.0.0.1', '0.0.0.0', '::1', '[::1]'].includes(hostname) || isIP(hostname) !== 0) {
      return 'BACKEND_CORS_ORIGINS must not contain localhost or raw IP origins';
    }
    if (hostname === 'example.com' || hostname.endsWith('.example.com') || hostname.endsWith('.invalid')) {
      return 'BACKEND_CORS_ORIGINS must not contain example or invalid hosts';
    }
    return null;
  } catch {
    return 'BACKEND_CORS_ORIGINS must contain valid URL origins';
  }
};

export const getCorsOrigins = (env: NodeJS.ProcessEnv = process.env): string[] => {
  const configuredOrigins = parseCsv(env.BACKEND_CORS_ORIGINS);
  const strictCors = requiresStrictCors(env);

  if (configuredOrigins.length > 0) {
    if (strictCors) {
      for (const origin of configuredOrigins) {
        const error = validateStrictCorsOrigin(origin);
        if (error) {
          throw new Error(error);
        }
      }
    }
    return configuredOrigins;
  }

  if (strictCors) {
    throw new Error('BACKEND_CORS_ORIGINS is required for production or staging runtime');
  }

  return DEVELOPMENT_CORS_ORIGINS;
};

export const getRequestBodyLimit = (env: NodeJS.ProcessEnv = process.env): string =>
  env.REQUEST_BODY_LIMIT?.trim() || DEFAULT_REQUEST_BODY_LIMIT;
