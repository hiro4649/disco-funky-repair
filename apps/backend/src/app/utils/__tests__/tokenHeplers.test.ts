const ALLOWED_TOKEN = '0x0000000000000000000000000000000000000001';
const BLOCKED_TOKEN = '0x0000000000000000000000000000000000000002';
const RECIPIENT = '0x0000000000000000000000000000000000000003';

type TokenHelpersModule = typeof import('../tokenHeplers');

const loadTokenHelpers = (envOverrides: Record<string, string | undefined> = {}) => {
  jest.resetModules();

  const transfer = jest.fn().mockResolvedValue({
    hash: '0xTransferTx',
    wait: jest.fn().mockResolvedValue({ status: 1, hash: '0xReceiptTx' })
  });
  (transfer as any).estimateGas = jest.fn().mockResolvedValue(21000n);

  const provider = {
    getBalance: jest.fn().mockResolvedValue(1n),
    getFeeData: jest.fn().mockResolvedValue({ gasPrice: 1n })
  };
  const wallet = { address: '0x0000000000000000000000000000000000000004' };
  const contract = {
    balanceOf: jest.fn().mockResolvedValue(100n),
    transfer
  };
  const JsonRpcProvider = jest.fn(() => provider);
  const Wallet = jest.fn(() => wallet);
  const Contract = jest.fn(() => contract);
  const isAddress = jest.fn((address: string) => /^0x[0-9a-fA-F]{40}$/.test(address));

  jest.doMock('ethers', () => ({
    ethers: {
      JsonRpcProvider,
      Wallet,
      Contract,
      isAddress
    }
  }));
  jest.doMock('../../lib/getToken', () => jest.fn());
  jest.doMock('../../lib/getTokenPrice', () => jest.fn());
  jest.doMock('../../db/prisma_client', () => ({}));
  jest.doMock('../../config/env', () => ({
    adminWalletAddress: '0x0000000000000000000000000000000000000005',
    ADMIN_PRIVATE_KEY: 'test-admin-private-key',
    PRIZE_HOT_WALLET_PRIVATE_KEY: 'test-prize-hot-wallet-private-key',
    PRIZE_TRANSFER_TOKEN_ALLOWLIST: ALLOWED_TOKEN,
    QUICKNODE_HTTP_RPC_URL: 'https://rpc.invalid',
    TOKEN_CONTRACT_ADDRESS: ALLOWED_TOKEN,
    ...envOverrides
  }));

  const helpers = require('../tokenHeplers') as TokenHelpersModule;
  return { helpers, JsonRpcProvider, Wallet, Contract, contract, provider, transfer };
};

describe('sendTokensToWallet prize hot wallet separation', () => {
  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('uses PRIZE_HOT_WALLET_PRIVATE_KEY for prize transfers', async () => {
    const { helpers, Wallet } = loadTokenHelpers();

    await helpers.sendTokensToWallet(RECIPIENT, 10n, ALLOWED_TOKEN);

    expect(Wallet).toHaveBeenCalledWith(
      'test-prize-hot-wallet-private-key',
      expect.any(Object)
    );
    expect(Wallet).not.toHaveBeenCalledWith(
      'test-admin-private-key',
      expect.any(Object)
    );
  });

  it('does not fall back to ADMIN_PRIVATE_KEY when the prize hot wallet key is missing', async () => {
    const { helpers, Wallet, Contract } = loadTokenHelpers({
      PRIZE_HOT_WALLET_PRIVATE_KEY: undefined
    });

    await expect(
      helpers.sendTokensToWallet(RECIPIENT, 10n, ALLOWED_TOKEN)
    ).rejects.toThrow('Prize hot wallet private key is not configured');

    expect(Wallet).not.toHaveBeenCalled();
    expect(Contract).not.toHaveBeenCalled();
  });

  it('does not call transfer for a token outside PRIZE_TRANSFER_TOKEN_ALLOWLIST', async () => {
    const { helpers, Contract, transfer } = loadTokenHelpers();

    await expect(
      helpers.sendTokensToWallet(RECIPIENT, 10n, BLOCKED_TOKEN)
    ).rejects.toThrow('Prize transfer token is not allowlisted');

    expect(Contract).not.toHaveBeenCalled();
    expect(transfer).not.toHaveBeenCalled();
  });

  it('continues the transfer flow for an allowlisted token', async () => {
    const { helpers, Contract, transfer } = loadTokenHelpers();

    const txHash = await helpers.sendTokensToWallet(RECIPIENT, 10n, ALLOWED_TOKEN);

    expect(Contract).toHaveBeenCalledWith(
      ALLOWED_TOKEN,
      expect.any(Array),
      expect.any(Object)
    );
    expect(transfer).toHaveBeenCalledWith(RECIPIENT, 10n, {
      gasLimit: 21000n,
      gasPrice: 1n
    });
    expect(txHash).toBe('0xReceiptTx');
  });
});
