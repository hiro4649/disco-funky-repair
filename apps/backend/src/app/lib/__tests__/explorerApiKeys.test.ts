import { getExplorerApiKeys, getPrimaryExplorerApiKey } from '../../config/explorerApiKeys';

describe('explorer API key resolution', () => {
  it('uses BSCSCAN_API_KEY when ETHERSCAN_API_KEY is not configured', () => {
    const env = {
      ETHERSCAN_API_KEY: '',
      BSCSCAN_API_KEY: 'bscscan-primary'
    } as NodeJS.ProcessEnv;

    expect(getPrimaryExplorerApiKey(env)).toBe('bscscan-primary');
    expect(getExplorerApiKeys(env)).toEqual(['bscscan-primary']);
  });

  it('uses the documented key priority and removes duplicate values', () => {
    const env = {
      ETHERSCAN_API_KEY: 'etherscan-primary',
      BSCSCAN_API_KEY: 'bscscan-primary',
      ETHERSCAN_API_KEY1: 'etherscan-one',
      ETHERSCAN_API_KEY2: 'etherscan-primary',
      BSCSCAN_API_KEY1: 'bscscan-one',
      BSCSCAN_API_KEY2: 'bscscan-two'
    } as NodeJS.ProcessEnv;

    expect(getExplorerApiKeys(env)).toEqual([
      'etherscan-primary',
      'bscscan-primary',
      'etherscan-one',
      'bscscan-one',
      'bscscan-two'
    ]);
  });

  it('lets the runtime key manager use a BSCSCAN_API_KEY-only configuration', async () => {
    const originalEnv = process.env;

    try {
      jest.resetModules();
      process.env = {
        ...originalEnv,
        ETHERSCAN_API_KEY: '',
        BSCSCAN_API_KEY: 'bscscan-runtime',
        ETHERSCAN_API_KEY1: '',
        ETHERSCAN_API_KEY2: '',
        BSCSCAN_API_KEY1: '',
        BSCSCAN_API_KEY2: ''
      };

      const { DualApiKeyManager } = await import('../dualApiKeyManager');
      const manager = new DualApiKeyManager();

      await expect(manager.getNextApiKey()).resolves.toBe('bscscan-runtime');
      expect(manager.getStats()).toEqual({
        totalKeys: 1,
        stats: [{ key: 'Key 1', requestCount: 1 }]
      });
    } finally {
      process.env = originalEnv;
      jest.resetModules();
    }
  });

  it('keeps the runtime key manager import safe without explorer API keys', async () => {
    const originalEnv = process.env;
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    try {
      jest.resetModules();
      process.env = {
        ...originalEnv,
        ETHERSCAN_API_KEY: '',
        BSCSCAN_API_KEY: '',
        ETHERSCAN_API_KEY1: '',
        ETHERSCAN_API_KEY2: '',
        BSCSCAN_API_KEY1: '',
        BSCSCAN_API_KEY2: ''
      };

      const module = await import('../dualApiKeyManager');
      const manager = new module.DualApiKeyManager();

      expect(manager.getStats()).toEqual({
        totalKeys: 0,
        stats: []
      });
      await expect(manager.getNextApiKey()).rejects.toThrow('No explorer API keys configured!');
    } finally {
      process.env = originalEnv;
      warnSpy.mockRestore();
      jest.resetModules();
    }
  });
});
