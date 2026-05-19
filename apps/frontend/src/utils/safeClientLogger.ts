type SafeClientLogValue = string | number | boolean | null | undefined;
type SafeClientLogMetadata = Record<string, SafeClientLogValue>;

const SENSITIVE_TEXT_PATTERN =
  /\b(?:authorization|cookie|set-cookie|adminauth|userauth|jwt|token|access[_-]?token|api[_-]?key|apikey|secret|session[_-]?secret|private[_-]?key|database[_-]?url|db[_-]?url|password)\b\s*[:=]\s*[^\s"',}]+/gi;
const BEARER_PATTERN = /\bBearer\s+[A-Za-z0-9._~+/=-]+/gi;
const JWT_PATTERN = /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g;
const CREDENTIAL_LABEL_PATTERN = /\b(?:jwt|adminAuth|userAuth|SESSION_SECRET|PRIVATE_KEY|DATABASE_URL)\b/gi;

const sanitizeText = (value: string): string =>
  value
    .replace(SENSITIVE_TEXT_PATTERN, '[redacted-credential]')
    .replace(BEARER_PATTERN, '[redacted-credential]')
    .replace(JWT_PATTERN, '[redacted-credential]')
    .replace(CREDENTIAL_LABEL_PATTERN, '[redacted-credential]');

const sanitizeMetadata = (metadata?: SafeClientLogMetadata): SafeClientLogMetadata => {
  if (!metadata) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(metadata).map(([key, value]) => [
      key,
      typeof value === 'string' ? sanitizeText(value) : value
    ])
  );
};

const getProperty = (value: unknown, property: string): unknown => {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  return (value as Record<string, unknown>)[property];
};

export const getSafeClientErrorMetadata = (
  error: unknown,
  metadata?: SafeClientLogMetadata
): SafeClientLogMetadata => {
  const response = getProperty(error, 'response');
  const status = getProperty(response, 'status') ?? getProperty(error, 'status');
  const errorName = error instanceof Error ? error.name : typeof error;

  return {
    ...sanitizeMetadata(metadata),
    errorName,
    status: typeof status === 'string' || typeof status === 'number' ? status : undefined
  };
};

export const safeClientLogError = (
  operation: string,
  error: unknown,
  metadata?: SafeClientLogMetadata
): void => {
  console.error(`${operation} failed`, getSafeClientErrorMetadata(error, {
    operation,
    ...metadata
  }));
};
