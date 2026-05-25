import { Prisma } from '@prisma/client';

const mockPrisma = {
  user: {
    findMany: jest.fn(),
    update: jest.fn()
  },
  holdDateHistory: {
    deleteMany: jest.fn(),
    createMany: jest.fn()
  },
  airdropTokens: {
    findFirst: jest.fn()
  },
  lotteryTickets: {
    findFirst: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
    delete: jest.fn()
  },
  ownedToken: {
    findUnique: jest.fn(),
    upsert: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn()
  },
  referralRewards: {
    findFirst: jest.fn(),
    update: jest.fn()
  },
  pointHistory: {
    createMany: jest.fn()
  },
  $transaction: jest.fn()
};

jest.mock('../../db/prisma_client', () => ({
  __esModule: true,
  default: mockPrisma
}));

jest.mock('../../config/env', () => ({
  TOKEN_CONTRACT_ADDRESS: '0xtoken',
  ETHERSCAN_API_KEY: 'test-api-key',
  ETHERSCAN_API_URL: 'https://etherscan.example.invalid/api?chainid=97'
}));

jest.mock('../../utils/rateLimiter', () => ({
  etherscanRateLimiter: {
    waitForRateLimit: jest.fn().mockResolvedValue(undefined)
  }
}));

jest.mock('../quicknodeRpcService', () => ({
  tokenBalanceService: {
    getTokenBalance: jest.fn(),
    getTokenTransactions: jest.fn(),
    logStatus: jest.fn()
  }
}));

jest.mock('../../utils/safeLogger', () => ({
  safeLogError: jest.fn(),
  safeLogWarn: jest.fn()
}));

import {
  calculateMinimumBalance,
  calculateWeightedAverageHoldingDate,
  checkingHoldingDateFromOnChain,
  persistHoldDateRecalculation
} from '../trackingTokenBalanceEthereum';
import { safeLogError } from '../../utils/safeLogger';

type FakeState = {
  user: {
    holdingDate: number;
    held_amount: number;
  };
  history: Array<{
    userId: number;
    tx_hash: string;
    purchase_amount: Prisma.Decimal;
    purchase_date: Date;
  }>;
};

const createTransactionalClient = (state: FakeState, options: { failCreate?: boolean } = {}) => {
  const operations: string[] = [];

  const client = {
    $transaction: jest.fn(async (callback: any) => {
      const staged: FakeState = {
        user: { ...state.user },
        history: state.history.map((entry) => ({ ...entry }))
      };

      const tx = {
        user: {
          update: jest.fn(async ({ data }: any) => {
            operations.push('user.update');
            staged.user = {
              ...staged.user,
              ...data
            };
            return staged.user;
          })
        },
        holdDateHistory: {
          deleteMany: jest.fn(async () => {
            operations.push('holdDateHistory.deleteMany');
            staged.history = [];
            return { count: state.history.length };
          }),
          createMany: jest.fn(async ({ data }: any) => {
            operations.push('holdDateHistory.createMany');
            if (options.failCreate) {
              throw new Error('create history failed after delete');
            }
            staged.history.push(...data);
            return { count: data.length };
          })
        }
      };

      const result = await callback(tx);
      state.user = staged.user;
      state.history = staged.history;
      return result;
    })
  };

  return { client, operations };
};

const makeHistoryRow = (tx_hash: string) => ({
  userId: 7,
  tx_hash,
  purchase_amount: new Prisma.Decimal('1.25'),
  purchase_date: new Date('2026-05-24T00:00:00.000Z')
});

describe('token amount precision helpers', () => {
  it('keeps minimum-balance transaction flow in bigint base units above Number.MAX_SAFE_INTEGER', () => {
    const walletAddress = '0xUserWallet';
    const minimumBalance = calculateMinimumBalance(
      9007199254740993n,
      [
        {
          from: '0xsender',
          to: '0xuserwallet',
          value: '9007199254740993',
          tokenDecimal: '0',
          timeStamp: '1779580800'
        }
      ],
      walletAddress
    );

    expect(minimumBalance).toBe(0n);
  });

  it('applies FIFO reductions without parseFloat rounding token values', () => {
    const currentTimeMs = new Date('2026-05-25T00:00:00.000Z').getTime();
    const result = calculateWeightedAverageHoldingDate(
      [
        {
          hash: '0xbig',
          from: '0xsender',
          to: '0xuserwallet',
          value: '9007199254740993',
          tokenDecimal: '0',
          timeStamp: '1779580800'
        },
        {
          hash: '0xsale',
          from: '0xuserwallet',
          to: '0xreceiver',
          value: '1',
          tokenDecimal: '0',
          timeStamp: '1779580900'
        }
      ],
      '0xUserWallet',
      currentTimeMs
    );

    expect(result.fifoAdjustedPurchases).toHaveLength(1);
    expect(result.fifoAdjustedPurchases[0].amount).toBe('9007199254740992');
  });
});

describe('persistHoldDateRecalculation transaction safety', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('persists user summary and FIFO history replacement inside one transaction', async () => {
    const state: FakeState = {
      user: {
        holdingDate: 3,
        held_amount: 3.5
      },
      history: [makeHistoryRow('0xold')]
    };
    const { client, operations } = createTransactionalClient(state);
    const newRows = [makeHistoryRow('0xnew')];

    await persistHoldDateRecalculation(
      client as any,
      7,
      {
        holdingDate: 9,
        held_amount: 9.75
      },
      newRows
    );

    expect(client.$transaction).toHaveBeenCalledTimes(1);
    expect(operations).toEqual([
      'user.update',
      'holdDateHistory.deleteMany',
      'holdDateHistory.createMany'
    ]);
    expect(state.user).toEqual({
      holdingDate: 9,
      held_amount: 9.75
    });
    expect(state.history).toEqual(newRows);
  });

  it('does not commit summary changes or delete old FIFO history when createMany fails', async () => {
    const oldRow = makeHistoryRow('0xold');
    const state: FakeState = {
      user: {
        holdingDate: 3,
        held_amount: 3.5
      },
      history: [oldRow]
    };
    const { client, operations } = createTransactionalClient(state, { failCreate: true });

    await expect(
      persistHoldDateRecalculation(
        client as any,
        7,
        {
          holdingDate: 9,
          held_amount: 9.75
        },
        [makeHistoryRow('0xnew')]
      )
    ).rejects.toThrow('create history failed after delete');

    expect(operations).toEqual([
      'user.update',
      'holdDateHistory.deleteMany',
      'holdDateHistory.createMany'
    ]);
    expect(state.user).toEqual({
      holdingDate: 3,
      held_amount: 3.5
    });
    expect(state.history).toEqual([oldRow]);
  });
});

describe('checkingHoldingDateFromOnChain transaction boundary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma.user.findMany.mockResolvedValue([
      {
        id: 7,
        wallet_address: '0xUserWallet'
      }
    ]);
    mockPrisma.$transaction.mockImplementation(async (callback: any) => callback(mockPrisma));
    mockPrisma.user.update.mockResolvedValue({});
    mockPrisma.holdDateHistory.deleteMany.mockResolvedValue({ count: 1 });
    mockPrisma.holdDateHistory.createMany.mockResolvedValue({ count: 1 });
    (global as any).fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        status: '1',
        result: [
          {
            hash: '0xtx1',
            from: '0xsender',
            to: '0xuserwallet',
            value: '1000000000000000000',
            tokenDecimal: '18',
            timeStamp: '1779580800'
          },
          {
            hash: '0xtx2',
            from: '0xuserwallet',
            to: '0xreceiver',
            value: '0',
            tokenDecimal: '18',
            timeStamp: '1779580900'
          }
        ]
      })
    });
  });

  it('fetches token history and calculates FIFO rows before opening the DB transaction', async () => {
    const events: string[] = [];
    (global as any).fetch.mockImplementation(async () => {
      events.push('fetch-token-history');
      return {
        json: jest.fn().mockResolvedValue({
          status: '1',
          result: [
            {
              hash: '0xtx1',
              from: '0xsender',
              to: '0xuserwallet',
              value: '1000000000000000000',
              tokenDecimal: '18',
              timeStamp: '1779580800'
            },
            {
              hash: '0xtx2',
              from: '0xuserwallet',
              to: '0xreceiver',
              value: '0',
              tokenDecimal: '18',
              timeStamp: '1779580900'
            }
          ]
        })
      };
    });
    mockPrisma.$transaction.mockImplementation(async (callback: any) => {
      events.push('db-transaction');
      return callback(mockPrisma);
    });

    await checkingHoldingDateFromOnChain();

    expect(events).toEqual(['fetch-token-history', 'db-transaction']);
    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: 7 },
      data: expect.objectContaining({
        holdingDate: expect.any(Number),
        held_amount: expect.any(Number)
      })
    });
    expect(mockPrisma.holdDateHistory.deleteMany).toHaveBeenCalledWith({
      where: { userId: 7 }
    });
    expect(mockPrisma.holdDateHistory.createMany).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({
          userId: 7,
          tx_hash: '0xtx1',
          purchase_amount: expect.any(Prisma.Decimal),
          purchase_date: expect.any(Date)
        })
      ],
      skipDuplicates: true
    });
  });

  it('safe logs failed persistence with minimal metadata and no response surface', async () => {
    mockPrisma.$transaction.mockRejectedValueOnce(new Error('raw hold history persistence failure'));

    await checkingHoldingDateFromOnChain();

    expect(safeLogError).toHaveBeenCalledWith(
      'update_holding_days_from_chain_user',
      expect.any(Error),
      {
        userId: 7,
        historyRowCount: 1
      }
    );
  });
});
