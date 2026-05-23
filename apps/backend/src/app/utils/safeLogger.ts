type SafeLogValue = string | number | boolean | null | undefined;
type SafeLogMetadata = Record<string, SafeLogValue>;

const URL_PATTERN = /\b(?:https?|wss?|postgres(?:ql)?):\/\/[^\s"'<>]+/gi;
const CREDENTIAL_ASSIGNMENT_PATTERN =
  /\b(?:authorization|cookie|set-cookie|adminauth|userauth|jwt|token|access[_-]?token|api[_-]?key|apikey|secret|session[_-]?secret|private[_-]?key|database[_-]?url|db[_-]?url|password)\b\s*[:=]\s*[^\s"',}]+/gi;
const SECRET_QUERY_PATTERN =
  /([?&;\s](?:api[_-]?key|apikey|key|token|access[_-]?token|authorization|jwt|secret|session[_-]?secret|private[_-]?key|database[_-]?url|db[_-]?url|password|signature)=)[^&;\s"']+/gi;
const BEARER_PATTERN = /\bBearer\s+[A-Za-z0-9._~+/=-]+/gi;
const JWT_PATTERN = /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g;
const PRIVATE_KEY_PATTERN = /\b0x[a-fA-F0-9]{64}\b/g;
const CREDENTIAL_LABEL_PATTERN = /\b(?:jwt|adminAuth|userAuth|SESSION_SECRET|PRIVATE_KEY|DATABASE_URL)\b/gi;
const WINDOWS_PATH_PATTERN = /\b[A-Za-z]:\\(?:[^\\\r\n"'<>|]+\\)*[^\\\r\n"'<>|]*/g;
const UNC_PATH_PATTERN = /\\\\[^\\\s"'<>|]+\\[^\\\s"'<>|]+(?:\\[^\\\s"'<>|]+)*/g;
const UNIX_PATH_PATTERN = /(^|[\s"'(=:])\/(?:Users|home|var|tmp|app|workspace|mnt|opt|srv|etc|root|data)(?:\/[^\s"',)]+)+/g;

export const sanitizeLogText = (value: string): string =>
  value
    .replace(CREDENTIAL_ASSIGNMENT_PATTERN, '[redacted-credential]')
    .replace(URL_PATTERN, '[redacted-url]')
    .replace(SECRET_QUERY_PATTERN, '$1[redacted]')
    .replace(BEARER_PATTERN, '[redacted-credential]')
    .replace(JWT_PATTERN, '[redacted-credential]')
    .replace(PRIVATE_KEY_PATTERN, '[redacted-credential]')
    .replace(WINDOWS_PATH_PATTERN, '[redacted-path]')
    .replace(UNC_PATH_PATTERN, '[redacted-path]')
    .replace(UNIX_PATH_PATTERN, '$1[redacted-path]')
    .replace(CREDENTIAL_LABEL_PATTERN, '[redacted-credential]');

const sanitizeMetadata = (metadata?: SafeLogMetadata): SafeLogMetadata => {
  if (!metadata) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(metadata).map(([key, value]) => [
      key,
      typeof value === 'string' ? sanitizeLogText(value) : value
    ])
  );
};

const getErrorProperty = (error: unknown, property: 'code' | 'status' | 'statusCode'): string | number | undefined => {
  if (!error || typeof error !== 'object') {
    return undefined;
  }

  const value = (error as Record<string, unknown>)[property];
  return typeof value === 'string' || typeof value === 'number' ? value : undefined;
};

export const getSafeErrorMetadata = (
  error: unknown,
  metadata?: SafeLogMetadata
): SafeLogMetadata => {
  const errorName = error instanceof Error ? error.name : typeof error;
  const errorMessage = error instanceof Error
    ? sanitizeLogText(error.message)
    : typeof error === 'string'
      ? sanitizeLogText(error)
      : undefined;

  return {
    ...sanitizeMetadata(metadata),
    errorName,
    errorCode: getErrorProperty(error, 'code'),
    statusCode: getErrorProperty(error, 'statusCode') ?? getErrorProperty(error, 'status'),
    errorMessage
  };
};

export const safeLogError = (
  operation: string,
  error: unknown,
  metadata?: SafeLogMetadata
): void => {
  console.error(`${operation} failed`, getSafeErrorMetadata(error, {
    operation,
    ...metadata
  }));
};

export const safeLogWarn = (
  operation: string,
  error: unknown,
  metadata?: SafeLogMetadata
): void => {
  console.warn(`${operation} warning`, getSafeErrorMetadata(error, {
    operation,
    ...metadata
  }));
};
