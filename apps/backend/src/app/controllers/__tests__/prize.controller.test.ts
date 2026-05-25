const fs = require('fs');
const path = require('path');

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn()
  },
  prize: {
    findMany: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn()
  },
  prizeTransactions: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn()
  },
  tokenDetail: {
    findUnique: jest.fn()
  },
  lotteryTickets: {
    findFirst: jest.fn(),
    update: jest.fn(),
    create: jest.fn()
  },
  $transaction: jest.fn()
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma)
}));

jest.mock('../../utils/tokenHeplers', () => ({
  calculateTokenQuantity: jest.fn(),
  fetchTokenBalance: jest.fn(),
  getPrizeTransferReceiptEvidence: jest.fn(),
  isPrizeTransferTokenAllowed: jest.fn(),
  sendTokensToWallet: jest.fn()
}));

jest.mock('../../lib/getDiscoNFTEVM', () => jest.fn());
jest.mock('../../lib/trialNftService', () => ({
  getTotalNFTCount: jest.fn()
}));

import { getPrizeTransferReceiptEvidence, isPrizeTransferTokenAllowed, sendTokensToWallet } from '../../utils/tokenHeplers';
import getDiscoNFTEVM from '../../lib/getDiscoNFTEVM';
import { PrizeController } from '../prize.controller';

let consoleErrorSpy: jest.SpyInstance;

const createResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const authenticatedUser = {
  user_id: 1,
  address: '0xuser'
};

const createRequest = (overrides: any = {}) => ({
  cookies: { userAuth: 'user-token' },
  user: authenticatedUser,
  ...overrides,
  params: { prize_id: '7', ...(overrides.params ?? {}) }
} as any);

const createDrawRequest = (overrides: any = {}) => ({
  user: authenticatedUser,
  ...overrides,
  params: { user_id: '1', ...(overrides.params ?? {}) }
} as any);

const createPrizeTransactionsRequest = (overrides: any = {}) => ({
  user: authenticatedUser,
  ...overrides,
  params: { user_id: '1', ...(overrides.params ?? {}) }
} as any);

const createWithdrawRequest = (overrides: any = {}) => ({
  user: authenticatedUser,
  ...overrides,
  params: { user_id: '1', prize_id: '7', ...(overrides.params ?? {}) }
} as any);

const createFinalizeRequest = () => ({
  params: { prize_id: '7' }
} as any);

const fakeEvmAddress = (seed: string) => `0x${seed.padStart(40, '0')}`;
const VALID_ASSET_CONTRACT = fakeEvmAddress('1');
const BLOCKED_ASSET_CONTRACT = fakeEvmAddress('2');
const SECOND_ELIGIBLE_ASSET_CONTRACT = fakeEvmAddress('2');
const INVALID_ASSET_CONTRACT = ['not', 'a', 'token', 'address'].join('-');
const FIXED_TRANSFER_AMOUNT = '50000000000000000000';
const FIXED_TRANSFER_AMOUNT_2 = '25000000000000000000';
const RECEIPT_TIME = new Date('2026-05-19T00:00:00.000Z');

const receiptEvidence = (overrides: Record<string, unknown> = {}) => ({
  txHash: '0xTx',
  chainId: 97,
  from: '0xHotWallet',
  to: '0xuser',
  contractAddress: VALID_ASSET_CONTRACT,
  blockNumber: '123',
  receiptStatus: 1,
  receiptTimestamp: RECEIPT_TIME,
  publicAmount: FIXED_TRANSFER_AMOUNT,
  ...overrides
});

const broadcastEvidence = (overrides: Record<string, unknown> = {}) => receiptEvidence({
  blockNumber: null,
  receiptStatus: null,
  receiptTimestamp: null,
  ...overrides
});

const receiptEvidenceUpdate = (overrides: Record<string, unknown> = {}) => ({
  tx_hash: '0xTx',
  tx_chain_id: 97,
  tx_from: '0xHotWallet',
  tx_to: '0xuser',
  tx_contract_address: VALID_ASSET_CONTRACT,
  tx_block_number: 123n,
  tx_receipt_status: 1,
  tx_receipt_timestamp: RECEIPT_TIME,
  tx_public_amount: FIXED_TRANSFER_AMOUNT,
  tx_evidence_updated_at: expect.any(Date),
  ...overrides
});

const readyPrizeTransaction = () => ({
  id: 7,
  userId: 1,
  prizeId: 3,
  tx_hash: null,
  transfer_token_address: VALID_ASSET_CONTRACT,
  transfer_amount: FIXED_TRANSFER_AMOUNT,
  reservation_released_at: null,
  status: 'READY',
  end_time: new Date(Date.now() + 60 * 60 * 1000),
  prize: {
    quantity: 999,
    price: 999,
    decimals: 18,
    ca: VALID_ASSET_CONTRACT
  }
});

describe('PrizeController safe logging', () => {
  const controllerSourcePath = path.join(__dirname, '../prize.controller.ts');

  it('does not keep direct console calls in prize.controller.ts', () => {
    const source = fs.readFileSync(controllerSourcePath, 'utf8');

    expect(source).not.toMatch(/console\.(?:error|log|warn)/);
  });
});

describe('PrizeController.editPrize validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('updates only whitelisted admin prize fields with normalized values', async () => {
    mockPrisma.prize.update.mockResolvedValue({ id: 7, token_name: 'FUNKY' });
    const req = createRequest({
      body: {
        ranking: '2',
        token_name: ' FUNKY ',
        symbol: ' FUN ',
        quantity: '10',
        price: '0.5',
        real_probability: '12.5',
        probability: '13.5',
        fake_probability: '14.5',
        earned_pts: '250',
        flag: 'false',
        dance: 'true',
        ca: VALID_ASSET_CONTRACT,
        telegram: 'https://t.me/funky',
        twitter: '',
        discord: 'https://discord.gg/funky',
        listed_dex: 'PancakeSwap',
        default_image: 'chain-logo.svg'
      }
    });
    const res = createResponse();

    await PrizeController.editPrize(req, res);

    expect(mockPrisma.prize.update).toHaveBeenCalledWith({
      where: { id: 7 },
      data: {
        ranking: 2,
        token_name: 'FUNKY',
        symbol: 'FUN',
        quantity: 10,
        price: 0.5,
        real_probability: 12.5,
        probability: 13.5,
        fake_probability: 14.5,
        earned_pts: 250,
        flag: false,
        dance: true,
        ca: VALID_ASSET_CONTRACT,
        telegram: 'https://t.me/funky',
        twitter: '',
        discord: 'https://discord.gg/funky',
        listed_DEX: 'PancakeSwap',
        default_image: 'chain-logo.svg'
      }
    });
    const updateData = mockPrisma.prize.update.mock.calls[0][0].data;
    expect(updateData).not.toHaveProperty('listed_dex');
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it.each([
    'id',
    'createdAt',
    'updatedAt',
    'reserved_amount',
    'balance_amount',
    'balance',
    'saved_probability',
    'status',
    'tx_hash',
    'tx_receipt_status',
    'userId',
    'transfer_amount',
    'localImagePath'
  ])('rejects mass assignment field %s', async (fieldName) => {
    const req = createRequest({
      body: {
        quantity: '1',
        [fieldName]: 'unsafe'
      }
    });
    const res = createResponse();

    await PrizeController.editPrize(req, res);

    expect(mockPrisma.prize.update).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Invalid prize update payload'
    });
  });

  it.each([
    ['negative integer', { quantity: '-1' }],
    ['NaN integer', { earned_pts: Number.NaN }],
    ['infinite decimal', { price: 'Infinity' }],
    ['huge integer', { ranking: '2147483648' }],
    ['probability over 100', { real_probability: '100.01' }]
  ])('rejects invalid numeric update values: %s', async (_caseName, body) => {
    const req = createRequest({ body });
    const res = createResponse();

    await PrizeController.editPrize(req, res);

    expect(mockPrisma.prize.update).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Invalid prize update payload'
    });
  });

  it.each([
    ['invalid EVM address', { ca: 'not-an-address' }],
    ['invalid URL', { twitter: 'not-a-url' }],
    ['conflicting DEX aliases', { listed_dex: 'A', listed_DEX: 'B' }]
  ])('rejects invalid structured field: %s', async (_caseName, body) => {
    const req = createRequest({ body });
    const res = createResponse();

    await PrizeController.editPrize(req, res);

    expect(mockPrisma.prize.update).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Invalid prize update payload'
    });
  });

  it('does not expose raw database errors in the response', async () => {
    const prizeUpdateConsoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    try {
      mockPrisma.prize.update.mockRejectedValue(new Error('raw database failure detail'));
      const req = createRequest({ body: { quantity: '1' } });
      const res = createResponse();

      await PrizeController.editPrize(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Prize not found or invalid data' });
      expect(JSON.stringify(res.json.mock.calls)).not.toContain('raw database failure detail');
      expect(JSON.stringify(prizeUpdateConsoleErrorSpy.mock.calls)).not.toContain('raw database failure detail');
    } finally {
      prizeUpdateConsoleErrorSpy.mockRestore();
    }
  });
});

describe('PrizeController.getPrize public catalog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma.prize.findMany.mockResolvedValue([
      {
        id: 3,
        ranking: 1,
        token_name: 'FUNKY',
        symbol: 'FUNKY',
        quantity: 10,
        price: 1,
        probability: 0.1,
        fake_probability: 0.2,
        ca: VALID_ASSET_CONTRACT,
        telegram: 'https://t.me/example',
        twitter: 'https://x.com/example',
        discord: 'https://discord.gg/example',
        icon: '/icon.png',
        default_image: '/default.png',
        listed_DEX: 'pancake',
        balance_amount: '1000000000000000000',
        reserved_amount: '0',
        transfer_token_address: VALID_ASSET_CONTRACT,
        transfer_amount: FIXED_TRANSFER_AMOUNT,
        reservation_released_at: null,
        txHash: '0xinternal',
        real_probability: 0.5,
        saved_probability: 0.5,
        earned_pts: 999,
        decimals: 18,
        flag: true
      }
    ]);
    mockPrisma.tokenDetail.findUnique.mockResolvedValue({
      token_symbol: 'FUNKY',
      price: 1,
      fdv: 1000,
      market_cap: 900,
      scarcityScore: 7,
      volume_24h: 10,
      liquidity: 20,
      txns_24h: 30,
      ca: VALID_ASSET_CONTRACT,
      holders: 123,
      total_supply: '1000000'
    });
  });

  it('queries only public prize catalog fields and omits inventory/admin fields from response', async () => {
    const res = createResponse();

    await PrizeController.getPrize({} as any, res);

    expect(mockPrisma.prize.findMany).toHaveBeenCalledWith({
      where: { flag: true },
      select: {
        id: true,
        ranking: true,
        token_name: true,
        symbol: true,
        quantity: true,
        price: true,
        probability: true,
        fake_probability: true,
        ca: true,
        telegram: true,
        twitter: true,
        discord: true,
        icon: true,
        default_image: true,
        listed_DEX: true
      },
      orderBy: [
        {
          ranking: 'asc'
        }
      ]
    });
    const prizeSelect = mockPrisma.prize.findMany.mock.calls[0][0].select;
    expect(prizeSelect).not.toHaveProperty('balance');
    expect(prizeSelect).not.toHaveProperty('balance_amount');
    expect(prizeSelect).not.toHaveProperty('reserved_amount');
    expect(prizeSelect).not.toHaveProperty('transfer_token_address');
    expect(prizeSelect).not.toHaveProperty('transfer_amount');
    expect(prizeSelect).not.toHaveProperty('reservation_released_at');
    expect(prizeSelect).not.toHaveProperty('txHash');
    expect(prizeSelect).not.toHaveProperty('real_probability');
    expect(prizeSelect).not.toHaveProperty('saved_probability');
    expect(prizeSelect).not.toHaveProperty('earned_pts');
    expect(prizeSelect).not.toHaveProperty('decimals');

    expect(mockPrisma.tokenDetail.findUnique).toHaveBeenCalledWith({
      where: { ca: VALID_ASSET_CONTRACT },
      select: {
        token_symbol: true,
        price: true,
        fdv: true,
        market_cap: true,
        scarcityScore: true,
        volume_24h: true,
        liquidity: true,
        txns_24h: true
      }
    });
    const assetDetailSelect = mockPrisma.tokenDetail.findUnique.mock.calls[0][0].select;
    expect(assetDetailSelect).not.toHaveProperty('ca');
    expect(assetDetailSelect).not.toHaveProperty('holders');
    expect(assetDetailSelect).not.toHaveProperty('total_supply');

    const responsePrize = res.json.mock.calls[0][0].data[0];
    expect(responsePrize).not.toHaveProperty('balance_amount');
    expect(responsePrize).not.toHaveProperty('reserved_amount');
    expect(responsePrize).not.toHaveProperty('transfer_token_address');
    expect(responsePrize).not.toHaveProperty('transfer_amount');
    expect(responsePrize).not.toHaveProperty('reservation_released_at');
    expect(responsePrize).not.toHaveProperty('txHash');
    expect(responsePrize).not.toHaveProperty('real_probability');
    expect(responsePrize).not.toHaveProperty('saved_probability');
    expect(responsePrize).not.toHaveProperty('earned_pts');
    expect(responsePrize).not.toHaveProperty('decimals');
    expect(responsePrize.tokenDetail).not.toHaveProperty('ca');
    expect(responsePrize.tokenDetail).not.toHaveProperty('holders');
    expect(responsePrize.tokenDetail).not.toHaveProperty('total_supply');
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

const winningPrize = () => ({
  id: 3,
  ca: VALID_ASSET_CONTRACT,
  quantity: 100,
  price: 2,
  decimals: 18,
  probability: 1,
  real_probability: 1,
  balance_amount: FIXED_TRANSFER_AMOUNT,
  reserved_amount: '0'
});

const smallerEligiblePrize = () => ({
  id: 4,
  ca: SECOND_ELIGIBLE_ASSET_CONTRACT,
  quantity: 50,
  price: 2,
  decimals: 18,
  probability: 0.5,
  real_probability: 1,
  balance_amount: FIXED_TRANSFER_AMOUNT_2,
  reserved_amount: '0'
});

describe('PrizeController.sendToWallet', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    mockPrisma.$transaction.mockImplementation(async (callback: any) => callback(mockPrisma));
    mockPrisma.user.findUnique.mockResolvedValue({ id: 1, wallet_address: '0xuser' });
    mockPrisma.user.update.mockResolvedValue({});
    mockPrisma.user.updateMany.mockResolvedValue({ count: 1 });
    mockPrisma.prize.findMany.mockResolvedValue([winningPrize()]);
    mockPrisma.prize.update.mockResolvedValue({});
    mockPrisma.prize.updateMany.mockResolvedValue({ count: 1 });
    mockPrisma.prizeTransactions.create.mockResolvedValue({});
    mockPrisma.prizeTransactions.findMany.mockResolvedValue([]);
    mockPrisma.prizeTransactions.findFirst.mockResolvedValue(readyPrizeTransaction());
    mockPrisma.prizeTransactions.updateMany.mockResolvedValue({ count: 1 });
    mockPrisma.prizeTransactions.update.mockResolvedValue({});
    (isPrizeTransferTokenAllowed as jest.Mock).mockReturnValue(true);
    (sendTokensToWallet as jest.Mock).mockResolvedValue({
      txHash: '0xTx',
      evidence: broadcastEvidence()
    });
    (getPrizeTransferReceiptEvidence as jest.Mock).mockResolvedValue({
      status: 'RECEIVED',
      evidence: receiptEvidence({ txHash: '0xExistingTx' })
    });
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('broadcasts transfer only after READY to SENDING conditional update succeeds', async () => {
    const res = createResponse();

    await PrizeController.sendToWallet(createRequest(), res);

    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 1 }
    });
    expect(mockPrisma.prizeTransactions.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 7, userId: 1 }
    }));
    expect(mockPrisma.prizeTransactions.updateMany).toHaveBeenCalledWith({
      where: {
        id: 7,
        userId: 1,
        status: 'READY',
        tx_hash: null
      },
      data: { status: 'SENDING' }
    });
    expect(sendTokensToWallet).toHaveBeenCalledTimes(1);
    expect(sendTokensToWallet).toHaveBeenCalledWith(
      '0xuser',
      BigInt(FIXED_TRANSFER_AMOUNT),
      VALID_ASSET_CONTRACT
    );
    expect(mockPrisma.prizeTransactions.updateMany).toHaveBeenNthCalledWith(2, {
      where: {
        id: 7,
        userId: 1,
        status: 'SENDING',
        tx_hash: null
      },
      data: {
        status: 'BROADCASTED',
        ...receiptEvidenceUpdate({
          tx_receipt_status: null,
          tx_receipt_timestamp: null,
          tx_block_number: null
        })
      }
    });
    expect(mockPrisma.prize.updateMany).not.toHaveBeenCalled();
    expect(mockPrisma.prizeTransactions.update).not.toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ status: 'RECEIVED' })
    }));
    expect(res.status).toHaveBeenCalledWith(202);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      status: 'BROADCASTED',
      txHash: '0xTx',
      receiptVerified: false,
      correlationId: expect.any(String)
    }));
  });

  it('does not send without an authenticated user context', async () => {
    const res = createResponse();

    await PrizeController.sendToWallet(createRequest({ user: undefined }), res);

    expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
    expect(mockPrisma.prizeTransactions.findFirst).not.toHaveBeenCalled();
    expect(sendTokensToWallet).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('does not send another user prize transaction', async () => {
    mockPrisma.prizeTransactions.findFirst.mockResolvedValue(null);
    const res = createResponse();

    await PrizeController.sendToWallet(createRequest({ params: { prize_id: '999' } }), res);

    expect(mockPrisma.prizeTransactions.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 999, userId: 1 }
    }));
    expect(sendTokensToWallet).not.toHaveBeenCalled();
    expect(mockPrisma.prizeTransactions.updateMany).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('does not send a new transfer when conditional READY update fails', async () => {
    mockPrisma.prizeTransactions.updateMany.mockResolvedValue({ count: 0 });
    const res = createResponse();

    await PrizeController.sendToWallet(createRequest(), res);

    expect(sendTokensToWallet).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(409);
  });

  it('prevents double send when another request already reserved the READY row', async () => {
    mockPrisma.prizeTransactions.updateMany.mockResolvedValueOnce({ count: 0 });
    const res = createResponse();

    await PrizeController.sendToWallet(createRequest(), res);

    expect(mockPrisma.prizeTransactions.updateMany).toHaveBeenCalledWith({
      where: {
        id: 7,
        userId: 1,
        status: 'READY',
        tx_hash: null
      },
      data: { status: 'SENDING' }
    });
    expect(sendTokensToWallet).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(409);
  });

  it('does not recalculate transfer amount from changed Prize settings', async () => {
    mockPrisma.prizeTransactions.findFirst.mockResolvedValue({
      ...readyPrizeTransaction(),
      transfer_amount: '123450000000000000000',
      transfer_token_address: VALID_ASSET_CONTRACT,
      prize: {
        quantity: 1,
        price: 999999,
        decimals: 18,
        ca: VALID_ASSET_CONTRACT
      }
    });
    const res = createResponse();

    await PrizeController.sendToWallet(createRequest(), res);

    expect(sendTokensToWallet).toHaveBeenCalledWith(
      '0xuser',
      123450000000000000000n,
      VALID_ASSET_CONTRACT
    );
  });

  it('resumes receipt confirmation instead of resending when tx_hash already exists', async () => {
    mockPrisma.prizeTransactions.findFirst.mockResolvedValue({
      ...readyPrizeTransaction(),
      status: 'MANUAL_REVIEW',
      tx_hash: '0xExistingTx'
    });
    const res = createResponse();

    await PrizeController.sendToWallet(createRequest(), res);

    expect(sendTokensToWallet).not.toHaveBeenCalled();
    expect(getPrizeTransferReceiptEvidence).toHaveBeenCalledWith('0xExistingTx', {
      recipientAddress: '0xuser',
      tokenAddress: VALID_ASSET_CONTRACT,
      publicAmount: FIXED_TRANSFER_AMOUNT
    });
    expect(mockPrisma.prizeTransactions.update).toHaveBeenCalledWith({
      where: { id: 7 },
      data: {
        status: 'RECEIVED',
        ...receiptEvidenceUpdate({ tx_hash: '0xExistingTx' })
      }
    });
    expect(mockPrisma.prize.updateMany).toHaveBeenCalledWith({
      where: {
        id: 3,
        balance_amount: { gte: FIXED_TRANSFER_AMOUNT },
        reserved_amount: { gte: FIXED_TRANSFER_AMOUNT }
      },
      data: {
        balance_amount: {
          decrement: FIXED_TRANSFER_AMOUNT
        },
        reserved_amount: {
          decrement: FIXED_TRANSFER_AMOUNT
        }
      }
    });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('does not release reserved amount twice after receipt retry', async () => {
    mockPrisma.prizeTransactions.findFirst.mockResolvedValue({
      ...readyPrizeTransaction(),
      status: 'MANUAL_REVIEW',
      tx_hash: '0xExistingTx'
    });
    mockPrisma.prizeTransactions.updateMany.mockResolvedValue({ count: 0 });
    const res = createResponse();

    await PrizeController.sendToWallet(createRequest(), res);

    expect(sendTokensToWallet).not.toHaveBeenCalled();
    expect(getPrizeTransferReceiptEvidence).toHaveBeenCalledWith('0xExistingTx', {
      recipientAddress: '0xuser',
      tokenAddress: VALID_ASSET_CONTRACT,
      publicAmount: FIXED_TRANSFER_AMOUNT
    });
    expect(mockPrisma.prize.update).not.toHaveBeenCalled();
    expect(mockPrisma.prize.updateMany).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('does not downgrade RECEIVED during existing tx_hash receipt-check failure', async () => {
    (getPrizeTransferReceiptEvidence as jest.Mock).mockRejectedValue(new Error('temporary rpc failure'));
    mockPrisma.prizeTransactions.findFirst
      .mockResolvedValueOnce({
        ...readyPrizeTransaction(),
        status: 'BROADCASTED',
        tx_hash: '0xExistingTx'
      })
      .mockResolvedValueOnce({
        ...readyPrizeTransaction(),
        status: 'RECEIVED',
        tx_hash: '0xSavedTx',
        tx_chain_id: 97,
        tx_from: '0xSavedHotWallet',
        tx_to: '0xuser',
        tx_contract_address: VALID_ASSET_CONTRACT,
        tx_block_number: 123n,
        tx_receipt_status: 1,
        tx_receipt_timestamp: RECEIPT_TIME,
        tx_public_amount: FIXED_TRANSFER_AMOUNT
      });
    const res = createResponse();

    await PrizeController.sendToWallet(createRequest(), res);

    expect(sendTokensToWallet).not.toHaveBeenCalled();
    expect(mockPrisma.prizeTransactions.update).not.toHaveBeenCalled();
    expect(mockPrisma.prizeTransactions.updateMany).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      txHash: '0xSavedTx'
    });
  });

  it('preserves tx_hash and receipt evidence when existing tx_hash receipt fallback sees RECEIVED', async () => {
    (getPrizeTransferReceiptEvidence as jest.Mock).mockRejectedValue(new Error('temporary rpc failure'));
    mockPrisma.prizeTransactions.findFirst
      .mockResolvedValueOnce({
        ...readyPrizeTransaction(),
        status: 'BROADCASTED',
        tx_hash: '0xExistingTx'
      })
      .mockResolvedValueOnce({
        ...readyPrizeTransaction(),
        status: 'RECEIVED',
        tx_hash: '0xSavedTx',
        tx_chain_id: 97,
        tx_from: '0xSavedHotWallet',
        tx_to: '0xuser',
        tx_contract_address: VALID_ASSET_CONTRACT,
        tx_block_number: 123n,
        tx_receipt_status: 1,
        tx_receipt_timestamp: RECEIPT_TIME,
        tx_public_amount: FIXED_TRANSFER_AMOUNT
      });
    const res = createResponse();

    await PrizeController.sendToWallet(createRequest(), res);

    expect(mockPrisma.prizeTransactions.update).not.toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        status: 'MANUAL_REVIEW'
      })
    }));
    expect(mockPrisma.prizeTransactions.updateMany).not.toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        tx_hash: expect.any(String)
      })
    }));
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('moves non-final existing tx_hash receipt-check failures to MANUAL_REVIEW only', async () => {
    (getPrizeTransferReceiptEvidence as jest.Mock).mockRejectedValue(new Error('temporary rpc failure'));
    mockPrisma.prizeTransactions.findFirst
      .mockResolvedValueOnce({
        ...readyPrizeTransaction(),
        status: 'BROADCASTED',
        tx_hash: '0xExistingTx'
      })
      .mockResolvedValueOnce({
        ...readyPrizeTransaction(),
        status: 'BROADCASTED',
        tx_hash: '0xExistingTx',
        tx_chain_id: 97,
        tx_receipt_status: null,
        tx_public_amount: FIXED_TRANSFER_AMOUNT
      });
    const res = createResponse();

    await PrizeController.sendToWallet(createRequest(), res);

    expect(mockPrisma.prizeTransactions.updateMany).toHaveBeenCalledWith({
      where: {
        id: 7,
        userId: 1,
        status: { in: ['READY', 'SENDING', 'BROADCASTED', 'MANUAL_REVIEW'] }
      },
      data: { status: 'MANUAL_REVIEW' }
    });
    expect(res.status).toHaveBeenCalledWith(202);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      msg: 'Prize transfer requires manual review.',
      correlationId: expect.any(String)
    }));
  });

  it('does not store fake receipt evidence during existing tx_hash receipt-check failure', async () => {
    (getPrizeTransferReceiptEvidence as jest.Mock).mockRejectedValue(new Error('temporary rpc failure'));
    mockPrisma.prizeTransactions.findFirst
      .mockResolvedValueOnce({
        ...readyPrizeTransaction(),
        status: 'SENDING',
        tx_hash: '0xExistingTx'
      })
      .mockResolvedValueOnce({
        ...readyPrizeTransaction(),
        status: 'SENDING',
        tx_hash: '0xExistingTx'
      });
    const res = createResponse();

    await PrizeController.sendToWallet(createRequest(), res);

    expect(mockPrisma.prizeTransactions.updateMany).toHaveBeenCalledWith({
      where: {
        id: 7,
        userId: 1,
        status: { in: ['READY', 'SENDING', 'BROADCASTED', 'MANUAL_REVIEW'] }
      },
      data: { status: 'MANUAL_REVIEW' }
    });
    expect(mockPrisma.prizeTransactions.updateMany).not.toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        tx_receipt_status: expect.any(Number)
      })
    }));
    expect(res.status).toHaveBeenCalledWith(202);
  });

  it('treats RECEIVED race during existing tx_hash receipt fallback as idempotent', async () => {
    (getPrizeTransferReceiptEvidence as jest.Mock).mockRejectedValue(new Error('temporary rpc failure'));
    mockPrisma.prizeTransactions.findFirst
      .mockResolvedValueOnce({
        ...readyPrizeTransaction(),
        status: 'BROADCASTED',
        tx_hash: '0xExistingTx'
      })
      .mockResolvedValueOnce({
        ...readyPrizeTransaction(),
        status: 'BROADCASTED',
        tx_hash: '0xExistingTx'
      })
      .mockResolvedValueOnce({
        ...readyPrizeTransaction(),
        status: 'RECEIVED',
        tx_hash: '0xSavedTx'
      });
    mockPrisma.prizeTransactions.updateMany.mockResolvedValueOnce({ count: 0 });
    const res = createResponse();

    await PrizeController.sendToWallet(createRequest(), res);

    expect(mockPrisma.prizeTransactions.updateMany).toHaveBeenCalledWith({
      where: {
        id: 7,
        userId: 1,
        status: { in: ['READY', 'SENDING', 'BROADCASTED', 'MANUAL_REVIEW'] }
      },
      data: { status: 'MANUAL_REVIEW' }
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      txHash: '0xSavedTx'
    });
  });

  it('does not change inventory again when reservation was already released', async () => {
    mockPrisma.prizeTransactions.findFirst.mockResolvedValue({
      ...readyPrizeTransaction(),
      reservation_released_at: new Date()
    });
    const res = createResponse();

    await PrizeController.sendToWallet(createRequest(), res);

    expect(sendTokensToWallet).toHaveBeenCalledTimes(1);
    expect(mockPrisma.prize.update).not.toHaveBeenCalled();
    expect(mockPrisma.prize.updateMany).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(202);
  });

  it('does not release inventory while a broadcasted transfer awaits receipt confirmation', async () => {
    mockPrisma.prize.updateMany.mockResolvedValue({ count: 0 });
    const res = createResponse();

    await PrizeController.sendToWallet(createRequest(), res);

    expect(sendTokensToWallet).toHaveBeenCalledTimes(1);
    expect(mockPrisma.prize.updateMany).not.toHaveBeenCalled();
    expect(mockPrisma.prizeTransactions.update).not.toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ status: 'RECEIVED' })
    }));
    expect(res.status).toHaveBeenCalledWith(202);
  });

  it('does not send legacy prize transactions missing a fixed transfer amount', async () => {
    mockPrisma.prizeTransactions.findFirst.mockResolvedValue({
      ...readyPrizeTransaction(),
      transfer_amount: null,
      transfer_token_address: null
    });
    const res = createResponse();

    await PrizeController.sendToWallet(createRequest(), res);

    expect(sendTokensToWallet).not.toHaveBeenCalled();
    expect(mockPrisma.prizeTransactions.update).toHaveBeenCalledWith({
      where: { id: 7 },
      data: { status: 'MANUAL_REVIEW' }
    });
    expect(mockPrisma.prizeTransactions.updateMany).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(202);
  });

  it('does not send when the fixed transfer amount is zero', async () => {
    mockPrisma.prizeTransactions.findFirst.mockResolvedValue({
      ...readyPrizeTransaction(),
      transfer_amount: '0'
    });
    const res = createResponse();

    await PrizeController.sendToWallet(createRequest(), res);

    expect(sendTokensToWallet).not.toHaveBeenCalled();
    expect(mockPrisma.prizeTransactions.update).toHaveBeenCalledWith({
      where: { id: 7 },
      data: { status: 'MANUAL_REVIEW' }
    });
    expect(mockPrisma.prizeTransactions.updateMany).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(202);
  });

  it('does not send when the fixed transfer token address is invalid', async () => {
    mockPrisma.prizeTransactions.findFirst.mockResolvedValue({
      ...readyPrizeTransaction(),
      transfer_token_address: INVALID_ASSET_CONTRACT
    });
    const res = createResponse();

    await PrizeController.sendToWallet(createRequest(), res);

    expect(sendTokensToWallet).not.toHaveBeenCalled();
    expect(mockPrisma.prizeTransactions.update).toHaveBeenCalledWith({
      where: { id: 7 },
      data: { status: 'MANUAL_REVIEW' }
    });
    expect(mockPrisma.prizeTransactions.updateMany).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(202);
  });

  it('does not send when the fixed transfer token is not allowlisted', async () => {
    (isPrizeTransferTokenAllowed as jest.Mock).mockReturnValue(false);
    const res = createResponse();

    await PrizeController.sendToWallet(createRequest(), res);

    expect(sendTokensToWallet).not.toHaveBeenCalled();
    expect(mockPrisma.prizeTransactions.update).toHaveBeenCalledWith({
      where: { id: 7 },
      data: { status: 'MANUAL_REVIEW' }
    });
    expect(mockPrisma.prizeTransactions.updateMany).not.toHaveBeenCalledWith({
      where: {
        id: 7,
        userId: 1,
        status: 'READY',
        tx_hash: null
      },
      data: { status: 'SENDING' }
    });
    expect(res.status).toHaveBeenCalledWith(202);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      msg: 'Prize transfer token is not approved and requires manual review.',
      correlationId: expect.any(String)
    }));
  });

  it('does not send when the linked Prize token is not allowlisted', async () => {
    (isPrizeTransferTokenAllowed as jest.Mock).mockImplementation(
      (address: string) => address.toLowerCase() === VALID_ASSET_CONTRACT.toLowerCase()
    );
    mockPrisma.prizeTransactions.findFirst.mockResolvedValue({
      ...readyPrizeTransaction(),
      prize: {
        ...readyPrizeTransaction().prize,
        ca: BLOCKED_ASSET_CONTRACT
      }
    });
    const res = createResponse();

    await PrizeController.sendToWallet(createRequest(), res);

    expect(isPrizeTransferTokenAllowed).toHaveBeenCalledWith(VALID_ASSET_CONTRACT);
    expect(isPrizeTransferTokenAllowed).toHaveBeenCalledWith(BLOCKED_ASSET_CONTRACT);
    expect(sendTokensToWallet).not.toHaveBeenCalled();
    expect(mockPrisma.prizeTransactions.update).toHaveBeenCalledWith({
      where: { id: 7 },
      data: { status: 'MANUAL_REVIEW' }
    });
    expect(res.status).toHaveBeenCalledWith(202);
  });

  it('does not return to READY when transfer was broadcasted but confirmation failed', async () => {
    const broadcastError = Object.assign(new Error('raw rpc failure'), { txHash: '0xBroadcastedTx' });
    (sendTokensToWallet as jest.Mock).mockRejectedValue(broadcastError);
    mockPrisma.prizeTransactions.findFirst
      .mockResolvedValueOnce(readyPrizeTransaction())
      .mockResolvedValueOnce({
        ...readyPrizeTransaction(),
        status: 'SENDING'
      });
    const res = createResponse();

    await PrizeController.sendToWallet(createRequest(), res);

    expect(mockPrisma.prizeTransactions.updateMany).toHaveBeenNthCalledWith(2, {
      where: {
        id: 7,
        userId: 1,
        status: { in: ['READY', 'SENDING', 'BROADCASTED', 'MANUAL_REVIEW'] }
      },
      data: {
        status: 'MANUAL_REVIEW',
        tx_hash: '0xBroadcastedTx'
      }
    });
    expect(mockPrisma.prizeTransactions.updateMany).not.toHaveBeenCalledWith(expect.objectContaining({
      data: { status: 'READY' }
    }));
    expect(res.status).toHaveBeenCalledWith(202);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      msg: 'Prize transfer was broadcasted and requires manual review.',
      correlationId: expect.any(String)
    }));
    expect(JSON.stringify(res.json.mock.calls[0][0])).not.toContain('raw rpc failure');
  });

  it('does not downgrade a RECEIVED transaction during broadcast fallback', async () => {
    const broadcastError = Object.assign(new Error('raw rpc failure'), {
      txHash: '0xBroadcastedTx',
      evidence: receiptEvidence({ txHash: '0xBroadcastedTx' })
    });
    (sendTokensToWallet as jest.Mock).mockRejectedValue(broadcastError);
    mockPrisma.prizeTransactions.findFirst
      .mockResolvedValueOnce(readyPrizeTransaction())
      .mockResolvedValueOnce({
        ...readyPrizeTransaction(),
        status: 'RECEIVED',
        tx_hash: '0xSavedTx',
        tx_chain_id: 97,
        tx_receipt_status: 1,
        tx_public_amount: FIXED_TRANSFER_AMOUNT
      });
    const res = createResponse();

    await PrizeController.sendToWallet(createRequest(), res);

    expect(mockPrisma.prizeTransactions.update).not.toHaveBeenCalled();
    expect(mockPrisma.prizeTransactions.updateMany).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      txHash: '0xSavedTx'
    });
  });

  it('preserves saved tx_hash and receipt evidence during broadcast fallback', async () => {
    const broadcastError = Object.assign(new Error('raw rpc failure'), {
      txHash: '0xBroadcastedTx',
      evidence: receiptEvidence({ txHash: '0xBroadcastedTx' })
    });
    (sendTokensToWallet as jest.Mock).mockRejectedValue(broadcastError);
    mockPrisma.prizeTransactions.findFirst
      .mockResolvedValueOnce(readyPrizeTransaction())
      .mockResolvedValueOnce({
        ...readyPrizeTransaction(),
        status: 'SENDING',
        tx_hash: '0xSavedTx',
        tx_chain_id: 97,
        tx_from: '0xSavedHotWallet',
        tx_to: '0xuser',
        tx_contract_address: VALID_ASSET_CONTRACT,
        tx_block_number: 123n,
        tx_receipt_status: 1,
        tx_receipt_timestamp: RECEIPT_TIME,
        tx_public_amount: FIXED_TRANSFER_AMOUNT
      });
    const res = createResponse();

    await PrizeController.sendToWallet(createRequest(), res);

    expect(mockPrisma.prizeTransactions.updateMany).toHaveBeenNthCalledWith(2, {
      where: {
        id: 7,
        userId: 1,
        status: { in: ['READY', 'SENDING', 'BROADCASTED', 'MANUAL_REVIEW'] }
      },
      data: {
        status: 'MANUAL_REVIEW'
      }
    });
    expect(res.status).toHaveBeenCalledWith(202);
  });

  it('moves only non-final SENDING rows to MANUAL_REVIEW after broadcast failure', async () => {
    const broadcastError = Object.assign(new Error('raw rpc failure'), {
      txHash: '0xBroadcastedTx',
      evidence: receiptEvidence({ txHash: '0xBroadcastedTx' })
    });
    (sendTokensToWallet as jest.Mock).mockRejectedValue(broadcastError);
    mockPrisma.prizeTransactions.findFirst
      .mockResolvedValueOnce(readyPrizeTransaction())
      .mockResolvedValueOnce({
        ...readyPrizeTransaction(),
        status: 'SENDING',
        tx_hash: null
      });
    const res = createResponse();

    await PrizeController.sendToWallet(createRequest(), res);

    expect(mockPrisma.prizeTransactions.updateMany).toHaveBeenNthCalledWith(2, {
      where: {
        id: 7,
        userId: 1,
        status: { in: ['READY', 'SENDING', 'BROADCASTED', 'MANUAL_REVIEW'] }
      },
      data: {
        status: 'MANUAL_REVIEW',
        ...receiptEvidenceUpdate({ tx_hash: '0xBroadcastedTx' })
      }
    });
    expect(res.status).toHaveBeenCalledWith(202);
  });

  it('treats RECEIVED finalization race during broadcast fallback as idempotent', async () => {
    const broadcastError = Object.assign(new Error('raw rpc failure'), {
      txHash: '0xBroadcastedTx',
      evidence: receiptEvidence({ txHash: '0xBroadcastedTx' })
    });
    (sendTokensToWallet as jest.Mock).mockRejectedValue(broadcastError);
    mockPrisma.prizeTransactions.findFirst
      .mockResolvedValueOnce(readyPrizeTransaction())
      .mockResolvedValueOnce({
        ...readyPrizeTransaction(),
        status: 'SENDING',
        tx_hash: null
      })
      .mockResolvedValueOnce({
        ...readyPrizeTransaction(),
        status: 'RECEIVED',
        tx_hash: '0xSavedTx'
      });
    mockPrisma.prizeTransactions.updateMany
      .mockResolvedValueOnce({ count: 1 })
      .mockResolvedValueOnce({ count: 0 });
    const res = createResponse();

    await PrizeController.sendToWallet(createRequest(), res);

    expect(mockPrisma.prizeTransactions.updateMany).toHaveBeenNthCalledWith(2, {
      where: {
        id: 7,
        userId: 1,
        status: { in: ['READY', 'SENDING', 'BROADCASTED', 'MANUAL_REVIEW'] }
      },
      data: {
        status: 'MANUAL_REVIEW',
        ...receiptEvidenceUpdate({ tx_hash: '0xBroadcastedTx' })
      }
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      txHash: '0xSavedTx'
    });
  });

  it('returns to READY only when transfer fails before txHash is available', async () => {
    (sendTokensToWallet as jest.Mock).mockRejectedValue(new Error('raw rpc failure'));
    const res = createResponse();

    await PrizeController.sendToWallet(createRequest(), res);

    expect(mockPrisma.prizeTransactions.updateMany).toHaveBeenLastCalledWith({
      where: {
        id: 7,
        userId: 1,
        status: 'SENDING',
        tx_hash: null
      },
      data: { status: 'READY' }
    });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      msg: 'Prize transfer could not be started.',
      correlationId: expect.any(String)
    }));
    expect(JSON.stringify(res.json.mock.calls[0][0])).not.toContain('raw rpc failure');
  });

  it('moves provider chainId mismatch to MANUAL_REVIEW without marking RECEIVED', async () => {
    (sendTokensToWallet as jest.Mock).mockRejectedValue(
      Object.assign(new Error('Provider chainId mismatch'), {
        name: 'PrizeChainIdMismatchError'
      })
    );
    const res = createResponse();

    await PrizeController.sendToWallet(createRequest(), res);

    expect(mockPrisma.prizeTransactions.updateMany).toHaveBeenNthCalledWith(1, {
      where: {
        id: 7,
        userId: 1,
        status: 'READY',
        tx_hash: null
      },
      data: { status: 'SENDING' }
    });
    expect(mockPrisma.prizeTransactions.updateMany).toHaveBeenNthCalledWith(2, {
      where: {
        id: 7,
        userId: 1,
        status: 'SENDING',
        tx_hash: null
      },
      data: { status: 'MANUAL_REVIEW' }
    });
    expect(mockPrisma.prizeTransactions.update).not.toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        status: 'RECEIVED'
      })
    }));
    expect(res.status).toHaveBeenCalledWith(202);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      msg: 'Prize transfer chain mismatch requires manual review.',
      correlationId: expect.any(String)
    }));
    expect(JSON.stringify(res.json.mock.calls[0][0])).not.toContain('Provider chainId mismatch');
  });
});

describe('PrizeController unpaid prize reservation finalization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    mockPrisma.$transaction.mockImplementation(async (callback: any) => callback(mockPrisma));
    mockPrisma.prize.updateMany.mockResolvedValue({ count: 1 });
    mockPrisma.prizeTransactions.findFirst.mockResolvedValue(readyPrizeTransaction());
    mockPrisma.prizeTransactions.findMany
      .mockResolvedValueOnce([
        {
          ...readyPrizeTransaction(),
          end_time: new Date(Date.now() - 60 * 1000)
        }
      ])
      .mockResolvedValueOnce([
        {
          ...readyPrizeTransaction(),
          status: 'EXPIRED',
          reservation_released_at: new Date(),
          end_time: new Date(Date.now() - 60 * 1000)
        }
      ]);
    mockPrisma.prizeTransactions.update.mockResolvedValue({});
    mockPrisma.prizeTransactions.updateMany.mockResolvedValue({ count: 1 });
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('releases reserved amount once when a READY prize transaction expires', async () => {
    const res = createResponse();

    await PrizeController.getPrizeTransactions(createPrizeTransactionsRequest(), res);

    expect(mockPrisma.prizeTransactions.updateMany).toHaveBeenCalledWith({
      where: {
        id: 7,
        status: { in: ['READY', 'EXPIRED'] },
        tx_hash: null,
        reservation_released_at: null
      },
      data: {
        status: 'EXPIRED',
        reservation_released_at: expect.any(Date)
      }
    });
    expect(mockPrisma.prize.updateMany).toHaveBeenCalledWith({
      where: {
        id: 3,
        reserved_amount: { gte: FIXED_TRANSFER_AMOUNT }
      },
      data: {
        reserved_amount: {
          decrement: FIXED_TRANSFER_AMOUNT
        }
      }
    });
    expect(sendTokensToWallet).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('releases reserved amount once when a READY prize transaction is cancelled', async () => {
    const res = createResponse();

    await PrizeController.cancelPrizeTransaction(createFinalizeRequest(), res);

    expect(mockPrisma.prizeTransactions.updateMany).toHaveBeenCalledWith({
      where: {
        id: 7,
        status: { in: ['READY', 'CANCELLED'] },
        tx_hash: null,
        reservation_released_at: null
      },
      data: {
        status: 'CANCELLED',
        reservation_released_at: expect.any(Date)
      }
    });
    expect(mockPrisma.prize.updateMany).toHaveBeenCalledWith({
      where: {
        id: 3,
        reserved_amount: { gte: FIXED_TRANSFER_AMOUNT }
      },
      data: {
        reserved_amount: {
          decrement: FIXED_TRANSFER_AMOUNT
        }
      }
    });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('releases reserved amount once when a tx_hash-free prize transaction is marked failed', async () => {
    const res = createResponse();

    await PrizeController.failPrizeTransaction(createFinalizeRequest(), res);

    expect(mockPrisma.prizeTransactions.updateMany).toHaveBeenCalledWith({
      where: {
        id: 7,
        status: { in: ['READY', 'FAILED'] },
        tx_hash: null,
        reservation_released_at: null
      },
      data: {
        status: 'FAILED',
        reservation_released_at: expect.any(Date)
      }
    });
    expect(mockPrisma.prize.updateMany).toHaveBeenCalledWith({
      where: {
        id: 3,
        reserved_amount: { gte: FIXED_TRANSFER_AMOUNT }
      },
      data: {
        reserved_amount: {
          decrement: FIXED_TRANSFER_AMOUNT
        }
      }
    });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('does not auto-release tx_hash-present failed prize transactions', async () => {
    mockPrisma.prizeTransactions.findFirst.mockResolvedValue({
      ...readyPrizeTransaction(),
      status: 'FAILED',
      tx_hash: '0xBroadcastedTx'
    });
    const res = createResponse();

    await PrizeController.failPrizeTransaction(createFinalizeRequest(), res);

    expect(mockPrisma.prizeTransactions.update).toHaveBeenCalledWith({
      where: { id: 7 },
      data: { status: 'MANUAL_REVIEW' }
    });
    expect(mockPrisma.prizeTransactions.updateMany).not.toHaveBeenCalled();
    expect(mockPrisma.prize.updateMany).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(202);
  });

  it('does not change reserved amount again when reservation was already released', async () => {
    mockPrisma.prizeTransactions.findFirst.mockResolvedValue({
      ...readyPrizeTransaction(),
      status: 'CANCELLED',
      reservation_released_at: new Date()
    });
    const res = createResponse();

    await PrizeController.cancelPrizeTransaction(createFinalizeRequest(), res);

    expect(mockPrisma.prizeTransactions.updateMany).not.toHaveBeenCalled();
    expect(mockPrisma.prize.updateMany).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('does not release reservations for RECEIVED prize transactions', async () => {
    mockPrisma.prizeTransactions.findFirst.mockResolvedValue({
      ...readyPrizeTransaction(),
      status: 'RECEIVED',
      tx_hash: '0xReceivedTx'
    });
    const res = createResponse();

    await PrizeController.cancelPrizeTransaction(createFinalizeRequest(), res);

    expect(mockPrisma.prizeTransactions.update).not.toHaveBeenCalled();
    expect(mockPrisma.prizeTransactions.updateMany).not.toHaveBeenCalled();
    expect(mockPrisma.prize.updateMany).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(409);
  });
});

describe('PrizeController.drawPrize', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    mockPrisma.$transaction.mockImplementation(async (callback: any) => callback(mockPrisma));
    mockPrisma.user.findUnique.mockResolvedValue({ id: 1, tickets: 1 });
    mockPrisma.user.update.mockResolvedValue({});
    mockPrisma.user.updateMany.mockResolvedValue({ count: 1 });
    mockPrisma.prize.findMany.mockResolvedValue([winningPrize()]);
    mockPrisma.prize.updateMany.mockResolvedValue({ count: 1 });
    mockPrisma.prizeTransactions.create.mockResolvedValue({});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('stores fixed token address and amount when creating a prize transaction', async () => {
    const res = createResponse();

    await PrizeController.drawPrize(createDrawRequest(), res);

    expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
    expect(mockPrisma.prizeTransactions.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        prizeId: 3,
        userId: 1,
        transfer_token_address: VALID_ASSET_CONTRACT,
        transfer_amount: FIXED_TRANSFER_AMOUNT
      })
    });
    expect(mockPrisma.prize.updateMany).toHaveBeenCalledWith({
      where: {
        id: 3,
        reserved_amount: '0'
      },
      data: {
        reserved_amount: FIXED_TRANSFER_AMOUNT
      }
    });
    expect(mockPrisma.user.updateMany).toHaveBeenCalledWith({
      where: { id: 1, tickets: { gt: 0 } },
      data: {
        tickets: {
          decrement: 1
        }
      }
    });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('does not draw for a different route user id', async () => {
    const res = createResponse();

    await PrizeController.drawPrize(createDrawRequest({ params: { user_id: '2' } }), res);

    expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    expect(mockPrisma.user.updateMany).not.toHaveBeenCalled();
    expect(mockPrisma.prizeTransactions.create).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('excludes prizes without enough available inventory', async () => {
    mockPrisma.prize.findMany.mockResolvedValue([
      {
        ...winningPrize(),
        balance_amount: FIXED_TRANSFER_AMOUNT,
        reserved_amount: FIXED_TRANSFER_AMOUNT
      },
      smallerEligiblePrize()
    ]);
    const res = createResponse();

    await PrizeController.drawPrize(createDrawRequest(), res);

    expect(mockPrisma.prizeTransactions.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        prizeId: 4,
        transfer_token_address: smallerEligiblePrize().ca,
        transfer_amount: FIXED_TRANSFER_AMOUNT_2
      })
    });
    expect(mockPrisma.prize.updateMany).toHaveBeenCalledWith({
      where: {
        id: 4,
        reserved_amount: '0'
      },
      data: {
        reserved_amount: FIXED_TRANSFER_AMOUNT_2
      }
    });
  });

  it('does not create a READY prize transaction when reservation update loses a race', async () => {
    mockPrisma.prize.updateMany.mockResolvedValue({ count: 0 });
    const res = createResponse();

    await PrizeController.drawPrize(createDrawRequest(), res);

    expect(mockPrisma.prizeTransactions.create).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(409);
  });

  it('creates only one READY prize transaction when two draws compete for one reservation', async () => {
    mockPrisma.prize.updateMany
      .mockResolvedValueOnce({ count: 1 })
      .mockResolvedValueOnce({ count: 0 });
    const firstRes = createResponse();
    const secondRes = createResponse();

    await PrizeController.drawPrize(createDrawRequest(), firstRes);
    await PrizeController.drawPrize(createDrawRequest(), secondRes);

    expect(mockPrisma.prizeTransactions.create).toHaveBeenCalledTimes(1);
    expect(firstRes.status).toHaveBeenCalledWith(200);
    expect(secondRes.status).toHaveBeenCalledWith(409);
  });

  it('uses string integer inventory amounts for reservation checks', async () => {
    const largeReservedAmount = '9007199254740993000000';
    const largeBalanceAmount = (BigInt(largeReservedAmount) + BigInt(FIXED_TRANSFER_AMOUNT)).toString();
    mockPrisma.prize.findMany.mockResolvedValue([
      {
        ...winningPrize(),
        balance_amount: largeBalanceAmount,
        reserved_amount: largeReservedAmount
      }
    ]);
    const res = createResponse();

    await PrizeController.drawPrize(createDrawRequest(), res);

    expect(mockPrisma.prize.updateMany).toHaveBeenCalledWith({
      where: {
        id: 3,
        reserved_amount: largeReservedAmount
      },
      data: {
        reserved_amount: largeBalanceAmount
      }
    });
    expect(mockPrisma.prizeTransactions.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        transfer_amount: FIXED_TRANSFER_AMOUNT
      })
    });
  });

  it('does not recreate available inventory after a confirmed send without token tracking', async () => {
    mockPrisma.user.findUnique
      .mockResolvedValueOnce({ id: 1, wallet_address: '0xuser' })
      .mockResolvedValueOnce({ id: 1, tickets: 1 });
    mockPrisma.prizeTransactions.findFirst.mockResolvedValue(readyPrizeTransaction());
    mockPrisma.prizeTransactions.updateMany.mockResolvedValue({ count: 1 });
    (sendTokensToWallet as jest.Mock).mockResolvedValue({
      txHash: '0xTx',
      evidence: broadcastEvidence()
    });

    const sendRes = createResponse();
    await PrizeController.sendToWallet(createRequest(), sendRes);

    mockPrisma.prize.findMany.mockResolvedValue([
      {
        ...winningPrize(),
        balance_amount: '0',
        reserved_amount: '0'
      }
    ]);
    const drawRes = createResponse();

    await PrizeController.drawPrize(createDrawRequest(), drawRes);

    expect(sendRes.status).toHaveBeenCalledWith(202);
    expect(mockPrisma.prizeTransactions.create).not.toHaveBeenCalledWith({
      data: expect.objectContaining({
        prizeId: 3,
        transfer_amount: FIXED_TRANSFER_AMOUNT
      })
    });
    expect(drawRes.status).toHaveBeenCalledWith(404);
  });
});

describe('PrizeController user-owned prize authorization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    mockPrisma.$transaction.mockImplementation(async (callback: any) => callback(mockPrisma));
    mockPrisma.user.findUnique.mockResolvedValue({ id: 1, wallet_address: '0xuser' });
    mockPrisma.prizeTransactions.findMany.mockResolvedValue([]);
    mockPrisma.prizeTransactions.findFirst.mockResolvedValue(readyPrizeTransaction());
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('does not expire or read another user prize history', async () => {
    const res = createResponse();

    await PrizeController.getPrizeTransactions(createPrizeTransactionsRequest({ params: { user_id: '2' } }), res);

    expect(mockPrisma.prizeTransactions.findMany).not.toHaveBeenCalled();
    expect(mockPrisma.prizeTransactions.updateMany).not.toHaveBeenCalled();
    expect(mockPrisma.prize.updateMany).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('withdraw lookup is scoped to the authenticated user', async () => {
    const res = createResponse();

    await PrizeController.withDrawPrizeToken(createWithdrawRequest(), res);

    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 1 }
    });
    expect(mockPrisma.prizeTransactions.findFirst).toHaveBeenCalledWith({
      where: { id: 7, userId: 1 }
    });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('does not withdraw another user prize transaction', async () => {
    const res = createResponse();

    await PrizeController.withDrawPrizeToken(createWithdrawRequest({ params: { user_id: '2', prize_id: '7' } }), res);

    expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
    expect(mockPrisma.prizeTransactions.findFirst).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });
});

describe('PrizeController.distributeTicketToAllUser safe logging', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma.user.findMany.mockResolvedValue([
      { id: 1, wallet_address: '0xuser' }
    ]);
    mockPrisma.lotteryTickets.findFirst.mockResolvedValue(null);
    mockPrisma.lotteryTickets.create.mockResolvedValue({});
    mockPrisma.lotteryTickets.update.mockResolvedValue({});
    (getDiscoNFTEVM as jest.Mock).mockResolvedValue(1);
  });

  it('does not expose raw error.message when ticket distribution fails before processing users', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    mockPrisma.user.findMany.mockRejectedValueOnce(new Error('raw distribution failure'));
    const res = createResponse();

    await PrizeController.distributeTicketToAllUser({} as any, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(JSON.stringify(res.json.mock.calls[0][0])).not.toContain('raw distribution failure');
    expect(res.json).toHaveBeenCalledWith({
      error: 'An error occurred while distributing tickets'
    });
    consoleErrorSpy.mockRestore();
  });

  it('continues per-user distribution failures without exposing raw errors in the response', async () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    (getDiscoNFTEVM as jest.Mock).mockRejectedValueOnce(new Error('raw per-user failure'));
    const res = createResponse();

    await PrizeController.distributeTicketToAllUser({} as any, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(JSON.stringify(res.json.mock.calls[0][0])).not.toContain('raw per-user failure');
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Tickets distributed successfully'
    });
    consoleWarnSpy.mockRestore();
  });
});
