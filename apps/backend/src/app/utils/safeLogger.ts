type SafeLogValue = string | number | boolean | null | undefined;
type SafeLogMetadata = Record<string, SafeLogValue>;

const URL_PATTERN = /\b(?:https?|wss?|postgres(?:ql)?):\/\/[^\s"'<>]+/gi;
const SECRET_QUERY_PATTERN =
  /([?&;\s](?:api[_-]?key|apikey|key|token|access[_-]?token|authorization|jwt|secret|private[_-]?key|password|signature)=)[^&;\s"']+/gi;
const BEARER_PATTERN = /\bBearer\s+[A-Za-z0-9._~+/=-]+/gi;
const JWT_PATTERN = /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g;
const PRIVATE_KEY_PATTERN = /\b0x[a-fA-F0-9]{64}\b/g;

export const sanitizeLogText = (value: string): string =>
  value
    .replace(URL_PATTERN, '[redacted-url]')
    .replace(SECRET_QUERY_PATTERN, '$1[redacted]')
    .replace(BEARER_PATTERN, 'Bearer [redacted]')
    .replace(JWT_PATTERN, '[redacted-jwt]')
    .replace(PRIVATE_KEY_PATTERN, '[redacted-private-key]');

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
