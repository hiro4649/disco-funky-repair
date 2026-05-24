import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

export const EXTERNAL_HTTP_TIMEOUT_MS = 10_000;
export const RPC_READ_TIMEOUT_MS = 10_000;
export const RPC_WRITE_TIMEOUT_MS = 20_000;
export const TOKEN_PRICE_MAX_ATTEMPTS = 3;

export class ExternalCallTimeoutError extends Error {
  readonly code = 'external_timeout';
  readonly operation: string;
  readonly timeoutMs: number;

  constructor(operation: string, timeoutMs: number) {
    super(`${operation} timed out`);
    this.name = 'ExternalCallTimeoutError';
    this.operation = operation;
    this.timeoutMs = timeoutMs;
  }
}

export const withExternalTimeout = async <T>(
  promise: PromiseLike<T>,
  timeoutMs: number,
  operation: string
): Promise<T> => {
  let timer: NodeJS.Timeout | undefined;

  try {
    return await Promise.race([
      Promise.resolve(promise),
      new Promise<never>((_resolve, reject) => {
        timer = setTimeout(() => {
          reject(new ExternalCallTimeoutError(operation, timeoutMs));
        }, timeoutMs);
      })
    ]);
  } finally {
    if (timer) {
      clearTimeout(timer);
    }
  }
};

export const fetchWithTimeout = async (
  url: string,
  options: RequestInit = {},
  timeoutMs = EXTERNAL_HTTP_TIMEOUT_MS,
  operation = 'external_fetch'
): Promise<Response> => {
  const controller = new AbortController();
  let timer: NodeJS.Timeout | undefined;

  try {
    timer = setTimeout(() => controller.abort(), timeoutMs);
    return await fetch(url, {
      ...options,
      signal: controller.signal
    });
  } catch (error) {
    if (controller.signal.aborted) {
      throw new ExternalCallTimeoutError(operation, timeoutMs);
    }
    throw error;
  } finally {
    if (timer) {
      clearTimeout(timer);
    }
  }
};

export const fetchJsonWithTimeout = async <T>(
  url: string,
  options: RequestInit = {},
  timeoutMs = EXTERNAL_HTTP_TIMEOUT_MS,
  operation = 'external_fetch_json'
): Promise<T> => {
  const controller = new AbortController();
  let timer: NodeJS.Timeout | undefined;

  try {
    timer = setTimeout(() => controller.abort(), timeoutMs);
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    return await response.json() as T;
  } catch (error) {
    if (controller.signal.aborted) {
      throw new ExternalCallTimeoutError(operation, timeoutMs);
    }
    throw error;
  } finally {
    if (timer) {
      clearTimeout(timer);
    }
  }
};

export const axiosGetWithTimeout = async <T>(
  url: string,
  timeoutMs = EXTERNAL_HTTP_TIMEOUT_MS,
  config: AxiosRequestConfig = {}
): Promise<AxiosResponse<T>> => axios.get<T>(url, {
  ...config,
  timeout: timeoutMs
});

export const withRpcReadTimeout = <T>(
  promise: PromiseLike<T>,
  operation: string,
  timeoutMs = RPC_READ_TIMEOUT_MS
): Promise<T> => withExternalTimeout(promise, timeoutMs, operation);

export const withRpcWriteTimeout = <T>(
  promise: PromiseLike<T>,
  operation: string,
  timeoutMs = RPC_WRITE_TIMEOUT_MS
): Promise<T> => withExternalTimeout(promise, timeoutMs, operation);
