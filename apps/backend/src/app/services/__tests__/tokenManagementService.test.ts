const USER_ADDRESS = '0x0000000000000000000000000000000000000001';
const TIER_UPDATER_ADDRESS = '0x0000000000000000000000000000000000000002';
const ADMIN_KEY = 'test-admin-private-key';
const TIER_RELAYER_KEY = 'test-tier-relayer-private-key';
const RAW_SECRET_LIKE_ERROR = `raw failure ${TIER_RELAYER_KEY} https://rpc.invalid`;

const mockPrisma = {
  feeChangeHistory: {
    create: jest.fn()
  }
};

type EnvOverrides = Record<string, string | undefined>;

const loadService = (envOverrides: EnvOverrides = {}, syncError?: Error) => {
  jest.resetModules();
  mockPrisma.feeChangeHistory.create.mockResolvedValue({});

  const wait = jest.fn().mockResolvedValue({ hash: '0xTierReceipt' });
  const syncHoldingDate = jest.fn().mockImplementation(() => {
    if (syncError) {
      throw syncError;
    }
    return { wait };
  });
  (syncHoldingDate as any).estimateGas = jest.fn().mockResolvedValue(111n);

  const syncHoldingDateWithReason = jest.fn().mockImplementation(() => {
    if (syncError) {
      throw syncError;
    }
    return { wait };
  });
  (syncHoldingDateWithReason as any).estimateGas = jest.fn().mockResolvedValue(222n);

  const tierUpdaterContract = {
    holdingDate: jest.fn().mockResolvedValue(31n),
    syncHoldingDate,
    syncHoldingDateWithReason
  };

  const provider = {};
  const JsonRpcProvider = jest.fn(() => provider);
  const Wallet = jest.fn((privateKey: string) => ({ address: '0xRelayer', privateKey }));
  const Contract = jest.fn(() => tierUpdaterContract);
  const id = jest.fn(() => '0x' + '1'.repeat(64));

  jest.doMock('ethers', () => ({
    ethers: {
      JsonRpcProvider,
      Wallet,
      Contract,
      id
    }
  }));
  jest.doMock('../../db/prisma_client', () => mockPrisma);
  jest.doMock('../../config/env', () => ({
    QUICKNODE_HTTP_RPC_URL: 'https://rpc.invalid',
    ADMIN_PRIVATE_KEY: ADMIN_KEY,
    TIER_RELAYER_PRIVATE_KEY: TIER_RELAYER_KEY,
    TIER_UPDATER_CONTRACT_ADDRESS: TIER_UPDATER_ADDRESS,
    ...envOverrides
  }));

  const { TokenManagementService } = require('../tokenManagementService');
  return {
    TokenManagementService,
    Wallet,
    Contract,
    tierUpdaterContract,
    syncHoldingDate,
    syncHoldingDateWithReason
  };
};

describe('TokenManagementService tier relayer key separation', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    jest.resetModules();
  });

  it('uses TIER_RELAYER_PRIVATE_KEY for tier updates', async () => {
    const { TokenManagementService, Wallet, Contract, syncHoldingDate } = loadService();

    const result = await TokenManagementService.updateUserHoldingDate(USER_ADDRESS, 91, 'admin');

    expect(result).toEqual({ success: true, txHash: '0xTierReceipt' });
    expect(Wallet).toHaveBeenCalledWith(TIER_RELAYER_KEY, expect.any(Object));
    expect(Wallet).not.toHaveBeenCalledWith(ADMIN_KEY, expect.any(Object));
    expect(Contract).toHaveBeenCalledWith(
      TIER_UPDATER_ADDRESS,
      expect.any(Array),
      expect.objectContaining({ privateKey: TIER_RELAYER_KEY })
    );
    expect(syncHoldingDate).toHaveBeenCalled();
  });

  it('does not send a tier update when only ADMIN_PRIVATE_KEY is configured', async () => {
    const { TokenManagementService, Wallet, Contract, syncHoldingDate } = loadService({
      TIER_RELAYER_PRIVATE_KEY: undefined
    });

    const result = await TokenManagementService.updateUserHoldingDate(USER_ADDRESS, 91, 'admin');

    expect(result).toEqual({
      success: false,
      error: 'Tier relayer private key is not configured'
    });
    expect(Wallet).not.toHaveBeenCalled();
    expect(Contract).not.toHaveBeenCalled();
    expect(syncHoldingDate).not.toHaveBeenCalled();
  });

  it('does not send a tier update when TIER_UPDATER_CONTRACT_ADDRESS is missing', async () => {
    const { TokenManagementService, Wallet, Contract, syncHoldingDate } = loadService({
      TIER_UPDATER_CONTRACT_ADDRESS: undefined
    });

    const result = await TokenManagementService.updateUserHoldingDate(USER_ADDRESS, 91, 'admin');

    expect(result).toEqual({
      success: false,
      error: 'Tier updater contract is not configured'
    });
    expect(Wallet).not.toHaveBeenCalled();
    expect(Contract).not.toHaveBeenCalled();
    expect(syncHoldingDate).not.toHaveBeenCalled();
  });

  it('does not return or log raw secret-like tier update errors', async () => {
    const { TokenManagementService } = loadService({}, new Error(RAW_SECRET_LIKE_ERROR));

    const result = await TokenManagementService.updateUserHoldingDate(USER_ADDRESS, 91, 'admin');
    const logged = JSON.stringify(consoleErrorSpy.mock.calls);

    expect(result).toEqual({
      success: false,
      error: 'Tier update failed'
    });
    expect(logged).not.toContain(TIER_RELAYER_KEY);
    expect(logged).not.toContain('https://rpc.invalid');
    expect(logged).not.toContain(RAW_SECRET_LIKE_ERROR);
  });

  it('does not send governance txs with ADMIN_PRIVATE_KEY for DEX registration', async () => {
    const { TokenManagementService, Wallet, Contract, syncHoldingDate } = loadService({
      TIER_RELAYER_PRIVATE_KEY: undefined
    });

    const result = await TokenManagementService.addDexToContract(
      '0x0000000000000000000000000000000000000003',
      'admin'
    );

    expect(result).toEqual({
      success: false,
      code: 'MANUAL_REVIEW_REQUIRED',
      error: 'Governance, fee, DEX, and pair management transactions are disabled in the backend. Use the governance runbook and multisig/timelock process.'
    });
    expect(Wallet).not.toHaveBeenCalled();
    expect(Contract).not.toHaveBeenCalled();
    expect(syncHoldingDate).not.toHaveBeenCalled();
  });

  it('does not send governance txs or write DB records for fee changes', async () => {
    const { TokenManagementService, Wallet, Contract } = loadService();

    const result = await TokenManagementService.updateFeePercentage(31, '200', 'admin');

    expect(result).toEqual({
      success: false,
      code: 'MANUAL_REVIEW_REQUIRED',
      error: 'Governance, fee, DEX, and pair management transactions are disabled in the backend. Use the governance runbook and multisig/timelock process.'
    });
    expect(Wallet).not.toHaveBeenCalled();
    expect(Contract).not.toHaveBeenCalled();
    expect(mockPrisma.feeChangeHistory.create).not.toHaveBeenCalled();
  });

  it('does not send governance txs for fee recipient changes', async () => {
    const { TokenManagementService, Wallet, Contract } = loadService();

    const result = await TokenManagementService.updateFeeRecipient(
      '0x0000000000000000000000000000000000000004',
      'admin'
    );

    expect(result).toEqual({
      success: false,
      code: 'MANUAL_REVIEW_REQUIRED',
      error: 'Governance, fee, DEX, and pair management transactions are disabled in the backend. Use the governance runbook and multisig/timelock process.'
    });
    expect(Wallet).not.toHaveBeenCalled();
    expect(Contract).not.toHaveBeenCalled();
  });
});
