const ALLOWED_TOKEN = '0x0000000000000000000000000000000000000001';
const BLOCKED_TOKEN = '0x0000000000000000000000000000000000000002';
const RECIPIENT = '0x0000000000000000000000000000000000000003';
const HOT_WALLET = '0x0000000000000000000000000000000000000004';
const ERC20_TRANSFER_EVENT_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

type TokenHelpersModule = typeof import('../tokenHeplers');

const addressTopic = (address: string) => `0x${address.slice(2).padStart(64, '0')}`;
const uint256Data = (amount: bigint) => `0x${amount.toString(16).padStart(64, '0')}`;
const transferLog = (
  recipient: string = RECIPIENT,
  amount: bigint = 10n,
  tokenAddress: string = ALLOWED_TOKEN
) => ({
  address: tokenAddress,
  topics: [
    ERC20_TRANSFER_EVENT_TOPIC,
    addressTopic(HOT_WALLET),
    addressTopic(recipient)
  ],
  data: uint256Data(amount)
});

const loadTokenHelpers = (envOverrides: Record<string, string | undefined> = {}) => {
  jest.resetModules();

  const transfer = jest.fn().mockResolvedValue({
    hash: '0xTransferTx',
    wait: jest.fn().mockResolvedValue({
      status: 1,
      hash: '0xReceiptTx',
      blockNumber: 123,
      from: HOT_WALLET,
      logs: [transferLog()]
    })
  });
  (transfer as any).estimateGas = jest.fn().mockResolvedValue(21000n);

  const provider = {
    getBalance: jest.fn().mockResolvedValue(1n),
    getFeeData: jest.fn().mockResolvedValue({ gasPrice: 1n }),
    getNetwork: jest.fn().mockResolvedValue({ chainId: 97n }),
    getBlock: jest.fn().mockResolvedValue({ timestamp: 1770000000 }),
    getTransactionReceipt: jest.fn().mockResolvedValue({
      status: 1,
      hash: '0xExistingTx',
      blockNumber: 456,
      from: HOT_WALLET,
      logs: [transferLog()]
    })
  };
  const wallet = { address: HOT_WALLET };
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
    CHAIN_ID: '97',
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

    const result = await helpers.sendTokensToWallet(RECIPIENT, 10n, ALLOWED_TOKEN);

    expect(Contract).toHaveBeenCalledWith(
      ALLOWED_TOKEN,
      expect.any(Array),
      expect.any(Object)
    );
    expect(transfer).toHaveBeenCalledWith(RECIPIENT, 10n, {
      gasLimit: 21000n,
      gasPrice: 1n
    });
    expect(result).toEqual({
      txHash: '0xReceiptTx',
      evidence: {
        txHash: '0xReceiptTx',
        chainId: 97,
        from: '0x0000000000000000000000000000000000000004',
        to: RECIPIENT,
        contractAddress: ALLOWED_TOKEN,
        blockNumber: '123',
        receiptStatus: 1,
        receiptTimestamp: new Date(1770000000 * 1000),
        publicAmount: '10'
      }
    });
  });

  it('does not build or send a transfer when provider chainId differs from CHAIN_ID', async () => {
    const { helpers, provider, Contract, transfer } = loadTokenHelpers();
    provider.getNetwork.mockResolvedValueOnce({ chainId: 56n });

    await expect(
      helpers.sendTokensToWallet(RECIPIENT, 10n, ALLOWED_TOKEN)
    ).rejects.toMatchObject({ name: 'PrizeChainIdMismatchError' });

    expect(Contract).not.toHaveBeenCalled();
    expect(transfer).not.toHaveBeenCalled();
  });

  it('returns receipt evidence for an existing broadcast tx', async () => {
    const { helpers, provider } = loadTokenHelpers();

    const result = await helpers.getPrizeTransferReceiptEvidence('0xExistingTx', {
      recipientAddress: RECIPIENT,
      tokenAddress: ALLOWED_TOKEN,
      publicAmount: 10n
    });

    expect(provider.getTransactionReceipt).toHaveBeenCalledWith('0xExistingTx');
    expect(result).toEqual({
      status: 'RECEIVED',
      evidence: {
        txHash: '0xExistingTx',
        chainId: 97,
        from: '0x0000000000000000000000000000000000000004',
        to: RECIPIENT,
        contractAddress: ALLOWED_TOKEN,
        blockNumber: '456',
        receiptStatus: 1,
        receiptTimestamp: new Date(1770000000 * 1000),
        publicAmount: '10'
      }
    });
  });

  it('returns manual review when provider chainId differs while checking receipt evidence', async () => {
    const { helpers, provider } = loadTokenHelpers();
    provider.getNetwork.mockResolvedValueOnce({ chainId: 56n });

    const result = await helpers.getPrizeTransferReceiptEvidence('0xExistingTx', {
      recipientAddress: RECIPIENT,
      tokenAddress: ALLOWED_TOKEN,
      publicAmount: 10n
    });

    expect(result.status).toBe('MANUAL_REVIEW');
    expect(result.evidence).toEqual(expect.objectContaining({
      txHash: '0xExistingTx',
      chainId: 56,
      to: RECIPIENT,
      contractAddress: ALLOWED_TOKEN,
      publicAmount: '10'
    }));
  });

  it('returns manual review when receipt transfer log does not match the expected recipient', async () => {
    const { helpers, provider } = loadTokenHelpers();
    provider.getTransactionReceipt.mockResolvedValueOnce({
      status: 1,
      hash: '0xExistingTx',
      blockNumber: 456,
      from: HOT_WALLET,
      logs: [transferLog(BLOCKED_TOKEN)]
    });

    const result = await helpers.getPrizeTransferReceiptEvidence('0xExistingTx', {
      recipientAddress: RECIPIENT,
      tokenAddress: ALLOWED_TOKEN,
      publicAmount: 10n
    });

    expect(result.status).toBe('MANUAL_REVIEW');
    expect(result.evidence).toEqual(expect.objectContaining({
      txHash: '0xExistingTx',
      chainId: 97,
      to: RECIPIENT,
      contractAddress: ALLOWED_TOKEN,
      publicAmount: '10'
    }));
  });

  it('keeps non-secret broadcast evidence when receipt is not mined yet', async () => {
    const { helpers, provider } = loadTokenHelpers();
    provider.getTransactionReceipt.mockResolvedValueOnce(null);

    const result = await helpers.getPrizeTransferReceiptEvidence('0xPendingTx', {
      recipientAddress: RECIPIENT,
      tokenAddress: ALLOWED_TOKEN,
      publicAmount: 10n
    });

    expect(result).toEqual({
      status: 'BROADCASTED',
      evidence: {
        txHash: '0xPendingTx',
        chainId: 97,
        from: null,
        to: RECIPIENT,
        contractAddress: ALLOWED_TOKEN,
        blockNumber: null,
        receiptStatus: null,
        receiptTimestamp: null,
        publicAmount: '10'
      }
    });
  });
});
