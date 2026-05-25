const mockFetchJsonWithTimeout = jest.fn();
const mockWaitForRateLimit = jest.fn();

jest.mock('../../utils/externalCallTimeout', () => ({
  fetchJsonWithTimeout: mockFetchJsonWithTimeout
}));

jest.mock('../../utils/rateLimiter', () => ({
  etherscanRateLimiter: {
    waitForRateLimit: mockWaitForRateLimit
  }
}));

jest.mock('../../config/env', () => ({
  ETHERSCAN_API_URL: 'https://explorer.example.invalid/api?chainid=97',
  ETHERSCAN_API_KEY: 'test-api-key'
}));

jest.mock('../../utils/safeLogger', () => ({
  safeLogError: jest.fn()
}));

import getTokenBalance from '../getToken';

describe('getTokenBalance precision', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockWaitForRateLimit.mockResolvedValue(undefined);
  });

  it('returns Etherscan base-unit balances as bigint above Number.MAX_SAFE_INTEGER', async () => {
    mockFetchJsonWithTimeout.mockResolvedValue({
      status: '1',
      result: '9007199254740993'
    });

    await expect(
      getTokenBalance(
        '0x0000000000000000000000000000000000000001',
        '0x0000000000000000000000000000000000000002'
      )
    ).resolves.toBe(9007199254740993n);
  });

  it('rejects non-integer token balance payloads without returning rounded values', async () => {
    mockFetchJsonWithTimeout.mockResolvedValue({
      status: '1',
      result: '9007199254740993.1'
    });

    await expect(
      getTokenBalance(
        '0x0000000000000000000000000000000000000001',
        '0x0000000000000000000000000000000000000002'
      )
    ).rejects.toThrow('Error fetching ERC20 token balance');
  });
});
