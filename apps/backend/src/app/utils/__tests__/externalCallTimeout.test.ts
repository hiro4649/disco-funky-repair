import axios from 'axios';
import {
  EXTERNAL_HTTP_TIMEOUT_MS,
  ExternalCallTimeoutError,
  axiosGetWithTimeout,
  fetchJsonWithTimeout,
  withExternalTimeout
} from '../externalCallTimeout';

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn()
  }
}));

describe('external API/RPC timeout helpers', () => {
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('rejects unresolved external calls with a safe timeout error', async () => {
    jest.useFakeTimers();

    const promise = withExternalTimeout(
      new Promise(() => undefined),
      25,
      'unit_test_external_call'
    );

    jest.advanceTimersByTime(25);
    await Promise.resolve();

    await expect(promise).rejects.toMatchObject({
      name: 'ExternalCallTimeoutError',
      code: 'external_timeout',
      operation: 'unit_test_external_call',
      timeoutMs: 25
    });
  });

  it('aborts hanging fetch calls and returns a safe timeout error', async () => {
    jest.useFakeTimers();
    const fetchMock = jest.fn((_url: string, init?: RequestInit) => new Promise((_resolve, reject) => {
      init?.signal?.addEventListener('abort', () => reject(new Error('aborted by timeout')));
    }));
    jest.spyOn(global, 'fetch').mockImplementation(fetchMock as any);

    const promise = fetchJsonWithTimeout(
      'https://example.invalid/api',
      {},
      25,
      'unit_test_fetch'
    );

    jest.advanceTimersByTime(25);
    await Promise.resolve();

    await expect(promise).rejects.toBeInstanceOf(ExternalCallTimeoutError);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://example.invalid/api',
      expect.objectContaining({
        signal: expect.any(Object)
      })
    );
  });

  it('passes an explicit timeout budget to axios calls', async () => {
    const mockedAxios = axios as jest.Mocked<typeof axios>;
    mockedAxios.get.mockResolvedValue({ status: 200, data: { ok: true } } as any);

    await axiosGetWithTimeout('https://example.invalid/dex', EXTERNAL_HTTP_TIMEOUT_MS);

    expect(mockedAxios.get).toHaveBeenCalledWith(
      'https://example.invalid/dex',
      expect.objectContaining({
        timeout: EXTERNAL_HTTP_TIMEOUT_MS
      })
    );
  });
});
