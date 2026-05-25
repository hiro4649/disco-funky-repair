import * as fs from 'fs';
import * as path from 'path';

const mockPrisma = {
  trialNft: {
    findFirst: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn()
  },
  trialNftTemplate: {
    findFirst: jest.fn(),
    updateMany: jest.fn(),
    fields: {
      maxMints: 'maxMints'
    }
  },
  pointHistory: {
    findFirst: jest.fn(),
    create: jest.fn()
  },
  user: {
    findMany: jest.fn(),
    update: jest.fn()
  },
  $transaction: jest.fn()
};

jest.mock('../../db/prisma_client', () => ({
  __esModule: true,
  default: mockPrisma
}));

jest.mock('../getDiscoNFTEVM', () => jest.fn());
jest.mock('../../utils/safeLogger', () => ({
  safeLogError: jest.fn()
}));

import { Prisma } from '@prisma/client';
import { claimTrialNFT, expireOldTrialNFTs, processDailyNFTHolderBonus } from '../trialNftService';
import getDiscoNFTEVM from '../getDiscoNFTEVM';
import { safeLogError } from '../../utils/safeLogger';

const mockGetDiscoNFTEVM = getDiscoNFTEVM as jest.MockedFunction<typeof getDiscoNFTEVM>;

const template = {
  id: 2,
  name: 'Trial Template',
  description: 'Trial template description',
  image: 'https://example.invalid/trial.png',
  validDays: 5,
  maxMints: 3,
  mintCount: 1,
  isAvailable: true
};

const existingNft = {
  id: 10,
  userId: 1,
  templateId: 2,
  name: 'Existing Trial NFT',
  isActive: true,
  receivedDate: new Date('2026-05-01T00:00:00.000Z'),
  expiresAt: new Date('2026-05-06T00:00:00.000Z')
};

const createdNft = {
  id: 11,
  userId: 1,
  templateId: 2,
  name: template.name,
  isActive: true
};

const mockNoExistingClaim = () => {
  mockPrisma.trialNft.findFirst
    .mockResolvedValueOnce(null)
    .mockResolvedValueOnce(null);
};

describe('trialNftService.claimTrialNFT claim safety', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma.$transaction.mockImplementation(async (callback: any, _options: any) => callback(mockPrisma));
    mockPrisma.trialNftTemplate.findFirst.mockResolvedValue(template);
    mockPrisma.trialNftTemplate.updateMany.mockResolvedValue({ count: 1 });
    mockPrisma.trialNft.create.mockResolvedValue(createdNft);
    mockPrisma.pointHistory.create.mockResolvedValue({});
    mockPrisma.user.update.mockResolvedValue({});
  });

  it('returns an existing monthly claim without creating another record', async () => {
    mockPrisma.trialNft.findFirst.mockResolvedValueOnce(existingNft);

    const result = await claimTrialNFT(1, 2);

    expect(result).toEqual({
      success: false,
      message: 'You have already claimed a Trial NFT this month',
      data: existingNft
    });
    expect(mockPrisma.trialNftTemplate.findFirst).not.toHaveBeenCalled();
    expect(mockPrisma.trialNftTemplate.updateMany).not.toHaveBeenCalled();
    expect(mockPrisma.trialNft.create).not.toHaveBeenCalled();
    expect(mockPrisma.pointHistory.create).not.toHaveBeenCalled();
    expect(mockPrisma.user.update).not.toHaveBeenCalled();
  });

  it('returns an active claim without creating another record on reclaim', async () => {
    mockPrisma.trialNft.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(existingNft);

    const result = await claimTrialNFT(1, 2);

    expect(result).toEqual({
      success: false,
      message: 'You already have an active Trial NFT',
      data: existingNft
    });
    expect(mockPrisma.trialNftTemplate.updateMany).not.toHaveBeenCalled();
    expect(mockPrisma.trialNft.create).not.toHaveBeenCalled();
  });

  it('creates one claim in a serializable transaction after reserving template mint capacity', async () => {
    mockNoExistingClaim();

    const result = await claimTrialNFT(1, 2);

    expect(result).toEqual({
      success: true,
      data: createdNft,
      message: 'Trial NFT claimed successfully! +1 Fan Point'
    });
    expect(mockPrisma.$transaction).toHaveBeenCalledWith(expect.any(Function), {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable
    });
    expect(mockPrisma.trialNftTemplate.updateMany).toHaveBeenCalledWith({
      where: {
        id: template.id,
        isAvailable: true,
        mintCount: { lt: template.maxMints }
      },
      data: { mintCount: { increment: 1 } }
    });
    expect(mockPrisma.trialNft.create).toHaveBeenCalledTimes(1);
    expect(mockPrisma.pointHistory.create).toHaveBeenCalledTimes(1);
    expect(mockPrisma.user.update).toHaveBeenCalledTimes(1);
  });

  it('does not create when the template is already at maxMints', async () => {
    mockNoExistingClaim();
    mockPrisma.trialNftTemplate.findFirst.mockResolvedValue({
      ...template,
      maxMints: 1,
      mintCount: 1
    });

    const result = await claimTrialNFT(1, 2);

    expect(result).toEqual({
      success: false,
      message: 'This Trial NFT template has reached maximum mints'
    });
    expect(mockPrisma.trialNftTemplate.updateMany).not.toHaveBeenCalled();
    expect(mockPrisma.trialNft.create).not.toHaveBeenCalled();
  });

  it('does not create when a concurrent claim wins the template mint reservation', async () => {
    mockNoExistingClaim();
    mockPrisma.trialNftTemplate.findFirst.mockResolvedValue({
      ...template,
      maxMints: 1,
      mintCount: 0
    });
    mockPrisma.trialNftTemplate.updateMany.mockResolvedValue({ count: 0 });

    const result = await claimTrialNFT(1, 2);

    expect(result).toEqual({
      success: false,
      message: 'This Trial NFT template has reached maximum mints'
    });
    expect(mockPrisma.trialNft.create).not.toHaveBeenCalled();
    expect(mockPrisma.pointHistory.create).not.toHaveBeenCalled();
    expect(mockPrisma.user.update).not.toHaveBeenCalled();
  });

  it('returns the existing claim after a serializable transaction conflict', async () => {
    mockPrisma.$transaction.mockRejectedValueOnce({ code: 'P2034' });
    mockPrisma.trialNft.findFirst.mockResolvedValueOnce(existingNft);

    const result = await claimTrialNFT(1, 2);

    expect(result).toEqual({
      success: false,
      message: 'You have already claimed a Trial NFT this month',
      data: existingNft
    });
    expect(mockPrisma.trialNft.create).not.toHaveBeenCalled();
  });

  it('returns a generic failure and safe logs metadata when claim fails', async () => {
    const rawMessage = 'RAW_TRIAL_NFT_TRANSACTION_FAILURE';
    mockPrisma.$transaction.mockRejectedValueOnce(new Error(rawMessage));

    const result = await claimTrialNFT(1, 2);

    expect(result).toEqual({
      success: false,
      message: 'Failed to claim trial NFT'
    });
    expect(JSON.stringify(result)).not.toContain(rawMessage);
    expect(safeLogError).toHaveBeenCalledWith('trial_nft_claim', expect.any(Error), {
      userId: 1,
      templateId: 2
    });
  });

  it('does not leave console.error calls in Trial NFT controller or service files', () => {
    const files = [
      path.resolve(__dirname, '../../controllers/trialNft.controller.ts'),
      path.resolve(__dirname, '../trialNftService.ts')
    ];

    for (const file of files) {
      expect(fs.readFileSync(file, 'utf8')).not.toContain('console.error');
    }
  });

  it('keeps Trial NFT scheduler failures observable through safe logging', () => {
    const scheduler = fs.readFileSync(path.resolve(__dirname, '../trialNftScheduler.ts'), 'utf8');

    expect(scheduler).toContain("safeLogError('trial_nft_daily_bonus_scheduler'");
    expect(scheduler).toContain("safeLogError('trial_nft_expiration_scheduler'");
    expect(scheduler).toContain("withPostgresAdvisoryJobLock(");
    expect(scheduler).toContain("'trial_nft_expiration_daily'");
  });
});

describe('trialNftService.processDailyNFTHolderBonus idempotency', () => {
  beforeEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
    mockPrisma.$transaction.mockImplementation(async (callback: any) => callback(mockPrisma));
    mockPrisma.user.findMany.mockResolvedValue([
      { id: 1, wallet_address: '0xuser' }
    ]);
    mockPrisma.user.update.mockResolvedValue({});
    mockPrisma.pointHistory.findFirst.mockResolvedValue(null);
    mockPrisma.pointHistory.create.mockResolvedValue({});
    mockPrisma.trialNft.findFirst.mockResolvedValue(null);
    mockPrisma.trialNft.update.mockResolvedValue({});
    mockGetDiscoNFTEVM.mockResolvedValue(0);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('awards a real NFT daily bonus once per user and day', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-05-24T00:10:00.000Z'));
    mockGetDiscoNFTEVM.mockResolvedValue(2);
    mockPrisma.pointHistory.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: 9001 });

    const firstResult = await processDailyNFTHolderBonus();
    const secondResult = await processDailyNFTHolderBonus();

    expect(firstResult).toEqual({
      processedUsers: 1,
      totalRealNFTBonus: 2,
      totalTrialNFTBonus: 0,
      skippedAlreadyAwarded: 0,
      errors: 0
    });
    expect(secondResult).toEqual({
      processedUsers: 0,
      totalRealNFTBonus: 0,
      totalTrialNFTBonus: 0,
      skippedAlreadyAwarded: 1,
      errors: 0
    });
    expect(mockPrisma.pointHistory.create).toHaveBeenCalledTimes(1);
    expect(mockPrisma.pointHistory.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 1,
        point: 2,
        reason: 3,
        dailyWindowKey: '2026-05-24'
      })
    });
    expect(mockPrisma.user.update).toHaveBeenCalledTimes(1);
    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: {
        fan_points: { increment: 2 }
      }
    });
  });

  it('awards a trial NFT daily bonus once per user and day', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-05-24T00:10:00.000Z'));
    const activeTrialNft = {
      id: 301,
      userId: 1,
      isActive: true,
      receivedDate: new Date('2026-05-22T23:00:00.000Z'),
      expiresAt: new Date('2026-05-27T00:00:00.000Z')
    };
    mockPrisma.trialNft.findFirst.mockResolvedValue(activeTrialNft);
    mockPrisma.pointHistory.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: 9002 });

    const firstResult = await processDailyNFTHolderBonus();
    const secondResult = await processDailyNFTHolderBonus();

    expect(firstResult).toEqual({
      processedUsers: 1,
      totalRealNFTBonus: 0,
      totalTrialNFTBonus: 2,
      skippedAlreadyAwarded: 0,
      errors: 0
    });
    expect(secondResult).toEqual({
      processedUsers: 0,
      totalRealNFTBonus: 0,
      totalTrialNFTBonus: 0,
      skippedAlreadyAwarded: 1,
      errors: 0
    });
    expect(mockPrisma.pointHistory.create).toHaveBeenCalledTimes(1);
    expect(mockPrisma.pointHistory.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 1,
        point: 2,
        reason: 5,
        dailyWindowKey: '2026-05-24'
      })
    });
    expect(mockPrisma.trialNft.update).toHaveBeenCalledTimes(1);
    expect(mockPrisma.trialNft.update).toHaveBeenCalledWith({
      where: { id: 301 },
      data: {
        bonusApplied: { increment: 2 }
      }
    });
    expect(mockPrisma.user.update).toHaveBeenCalledTimes(1);
  });

  it('skips fan point updates when a concurrent daily bonus already created history', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-05-24T00:10:00.000Z'));
    mockGetDiscoNFTEVM.mockResolvedValue(1);
    mockPrisma.pointHistory.findFirst.mockResolvedValue(null);
    mockPrisma.pointHistory.create.mockRejectedValueOnce({ code: 'P2002' });

    const result = await processDailyNFTHolderBonus();

    expect(result).toEqual({
      processedUsers: 0,
      totalRealNFTBonus: 0,
      totalTrialNFTBonus: 0,
      skippedAlreadyAwarded: 1,
      errors: 0
    });
    expect(mockPrisma.user.update).not.toHaveBeenCalled();
    expect(mockPrisma.trialNft.update).not.toHaveBeenCalled();
  });

  it('allows a new daily NFT bonus on a different day', async () => {
    mockGetDiscoNFTEVM.mockResolvedValue(1);
    mockPrisma.pointHistory.findFirst.mockResolvedValue(null);

    jest.useFakeTimers().setSystemTime(new Date('2026-05-24T00:10:00.000Z'));
    const firstResult = await processDailyNFTHolderBonus();

    jest.setSystemTime(new Date('2026-05-25T00:10:00.000Z'));
    const secondResult = await processDailyNFTHolderBonus();

    expect(firstResult.totalRealNFTBonus).toBe(1);
    expect(secondResult.totalRealNFTBonus).toBe(1);
    expect(mockPrisma.pointHistory.create).toHaveBeenCalledTimes(2);
    expect(mockPrisma.pointHistory.create).toHaveBeenNthCalledWith(1, {
      data: expect.objectContaining({
        reason: 3,
        dailyWindowKey: '2026-05-24'
      })
    });
    expect(mockPrisma.pointHistory.create).toHaveBeenNthCalledWith(2, {
      data: expect.objectContaining({
        reason: 3,
        dailyWindowKey: '2026-05-25'
      })
    });
    expect(mockPrisma.user.update).toHaveBeenCalledTimes(2);
  });

  it('safe logs daily bonus user failures without raw response payloads', async () => {
    const rawMessage = 'RAW_DAILY_NFT_BONUS_FAILURE';
    mockGetDiscoNFTEVM.mockRejectedValueOnce(new Error(rawMessage));

    const result = await processDailyNFTHolderBonus();

    expect(result).toEqual({
      processedUsers: 0,
      totalRealNFTBonus: 0,
      totalTrialNFTBonus: 0,
      skippedAlreadyAwarded: 0,
      errors: 1
    });
    expect(JSON.stringify(result)).not.toContain(rawMessage);
    expect(safeLogError).toHaveBeenCalledWith('trial_nft_daily_bonus_user', expect.any(Error), {
      userId: 1
    });
  });
});

describe('trialNftService.expireOldTrialNFTs advisory lock transaction support', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('uses the provided transaction client when expiring rows under a scheduler lock', async () => {
    const transactionClient = {
      trialNft: {
        findMany: jest.fn().mockResolvedValue([{ id: 501 }]),
        updateMany: jest.fn().mockResolvedValue({ count: 1 })
      }
    };

    const result = await expireOldTrialNFTs(transactionClient as any);

    expect(result).toBe(1);
    expect(transactionClient.trialNft.findMany).toHaveBeenCalledTimes(1);
    expect(transactionClient.trialNft.updateMany).toHaveBeenCalledTimes(1);
    expect(mockPrisma.trialNft.findMany).not.toHaveBeenCalled();
    expect(mockPrisma.trialNft.updateMany).not.toHaveBeenCalled();
  });
});
