const mockPrisma = {
  user: {
    findUnique: jest.fn(),
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
  $transaction: jest.fn()
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma)
}));

jest.mock('jwt-decode', () => ({
  jwtDecode: jest.fn()
}));

jest.mock('../../utils/tokenHeplers', () => ({
  calculateTokenQuantity: jest.fn(),
  fetchTokenBalance: jest.fn(),
  getTransactionReceiptStatus: jest.fn(),
  sendTokensToWallet: jest.fn()
}));

jest.mock('../../lib/getDiscoNFTEVM', () => jest.fn());
jest.mock('../../lib/trialNftService', () => ({
  getTotalNFTCount: jest.fn()
}));

import { jwtDecode } from 'jwt-decode';
import { getTransactionReceiptStatus, sendTokensToWallet } from '../../utils/tokenHeplers';
import { PrizeController } from '../prize.controller';

let consoleErrorSpy: jest.SpyInstance;

const createResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const createRequest = () => ({
  cookies: { userAuth: 'user-token' },
  params: { prize_id: '7' }
} as any);

const createDrawRequest = () => ({
  params: { user_id: '1' }
} as any);

const createFinalizeRequest = () => ({
  params: { prize_id: '7' }
} as any);

const VALID_TOKEN_ADDRESS = '0x0000000000000000000000000000000000000001';
const FIXED_TRANSFER_AMOUNT = '50000000000000000000';
const FIXED_TRANSFER_AMOUNT_2 = '25000000000000000000';

const readyPrizeTransaction = () => ({
  id: 7,
  userId: 1,
  prizeId: 3,
  tx_hash: null,
  transfer_token_address: VALID_TOKEN_ADDRESS,
  transfer_amount: FIXED_TRANSFER_AMOUNT,
  reservation_released_at: null,
  status: 'READY',
  end_time: new Date(Date.now() + 60 * 60 * 1000),
  prize: {
    quantity: 999,
    price: 999,
    decimals: 18,
    ca: '0x0000000000000000000000000000000000000999'
  }
});

const winningPrize = () => ({
  id: 3,
  ca: VALID_TOKEN_ADDRESS,
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
  ca: '0x0000000000000000000000000000000000000002',
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
    (jwtDecode as jest.Mock).mockReturnValue({ address: '0xUser' });
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
    (sendTokensToWallet as jest.Mock).mockResolvedValue('0xTx');
    (getTransactionReceiptStatus as jest.Mock).mockResolvedValue('RECEIVED');
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('starts transfer only after READY to SENDING conditional update succeeds', async () => {
    const res = createResponse();

    await PrizeController.sendToWallet(createRequest(), res);

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
      VALID_TOKEN_ADDRESS
    );
    expect(mockPrisma.prizeTransactions.update).toHaveBeenCalledWith({
      where: { id: 7 },
      data: { status: 'RECEIVED', tx_hash: '0xTx' }
    });
    expect(mockPrisma.prizeTransactions.updateMany).toHaveBeenCalledWith({
      where: {
        id: 7,
        reservation_released_at: null
      },
      data: {
        reservation_released_at: expect.any(Date)
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

  it('does not send a new transfer when conditional READY update fails', async () => {
    mockPrisma.prizeTransactions.updateMany.mockResolvedValue({ count: 0 });
    const res = createResponse();

    await PrizeController.sendToWallet(createRequest(), res);

    expect(sendTokensToWallet).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(409);
  });

  it('does not recalculate transfer amount from changed Prize settings', async () => {
    mockPrisma.prizeTransactions.findFirst.mockResolvedValue({
      ...readyPrizeTransaction(),
      transfer_amount: '123450000000000000000',
      transfer_token_address: VALID_TOKEN_ADDRESS,
      prize: {
        quantity: 1,
        price: 999999,
        decimals: 18,
        ca: '0x0000000000000000000000000000000000000002'
      }
    });
    const res = createResponse();

    await PrizeController.sendToWallet(createRequest(), res);

    expect(sendTokensToWallet).toHaveBeenCalledWith(
      '0xuser',
      123450000000000000000n,
      VALID_TOKEN_ADDRESS
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
    expect(getTransactionReceiptStatus).toHaveBeenCalledWith('0xExistingTx');
    expect(mockPrisma.prizeTransactions.update).toHaveBeenCalledWith({
      where: { id: 7 },
      data: { status: 'RECEIVED' }
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
    expect(getTransactionReceiptStatus).toHaveBeenCalledWith('0xExistingTx');
    expect(mockPrisma.prize.update).not.toHaveBeenCalled();
    expect(mockPrisma.prize.updateMany).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('does not change inventory again when reservation was already released', async () => {
    mockPrisma.prizeTransactions.findFirst.mockResolvedValue({
      ...readyPrizeTransaction(),
      reservation_released_at: new Date()
    });
    mockPrisma.prizeTransactions.updateMany
      .mockResolvedValueOnce({ count: 1 })
      .mockResolvedValueOnce({ count: 0 });
    const res = createResponse();

    await PrizeController.sendToWallet(createRequest(), res);

    expect(sendTokensToWallet).toHaveBeenCalledTimes(1);
    expect(mockPrisma.prize.update).not.toHaveBeenCalled();
    expect(mockPrisma.prize.updateMany).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('moves confirmed transfers to manual review when inventory is below transfer amount', async () => {
    mockPrisma.prize.updateMany.mockResolvedValue({ count: 0 });
    const res = createResponse();

    await PrizeController.sendToWallet(createRequest(), res);

    expect(sendTokensToWallet).toHaveBeenCalledTimes(1);
    expect(mockPrisma.prizeTransactions.update).toHaveBeenCalledWith({
      where: { id: 7 },
      data: {
        status: 'MANUAL_REVIEW',
        tx_hash: '0xTx'
      }
    });
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
      transfer_token_address: 'not-a-token-address'
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

  it('does not return to READY when transfer was broadcasted but confirmation failed', async () => {
    const broadcastError = Object.assign(new Error('raw rpc failure'), { txHash: '0xBroadcastedTx' });
    (sendTokensToWallet as jest.Mock).mockRejectedValue(broadcastError);
    const res = createResponse();

    await PrizeController.sendToWallet(createRequest(), res);

    expect(mockPrisma.prizeTransactions.update).toHaveBeenCalledWith({
      where: { id: 7 },
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

    await PrizeController.getPrizeTransactions({ params: { user_id: '1' } } as any, res);

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
        transfer_token_address: VALID_TOKEN_ADDRESS,
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
    (jwtDecode as jest.Mock).mockReturnValue({ address: '0xUser' });
    mockPrisma.user.findUnique
      .mockResolvedValueOnce({ id: 1, wallet_address: '0xuser' })
      .mockResolvedValueOnce({ id: 1, tickets: 1 });
    mockPrisma.prizeTransactions.findFirst.mockResolvedValue(readyPrizeTransaction());
    mockPrisma.prizeTransactions.updateMany.mockResolvedValue({ count: 1 });
    (sendTokensToWallet as jest.Mock).mockResolvedValue('0xTx');

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

    expect(sendRes.status).toHaveBeenCalledWith(200);
    expect(mockPrisma.prizeTransactions.create).not.toHaveBeenCalledWith({
      data: expect.objectContaining({
        prizeId: 3,
        transfer_amount: FIXED_TRANSFER_AMOUNT
      })
    });
    expect(drawRes.status).toHaveBeenCalledWith(404);
  });
});
