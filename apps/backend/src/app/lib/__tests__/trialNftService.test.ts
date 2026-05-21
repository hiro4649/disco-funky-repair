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
    create: jest.fn()
  },
  user: {
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
import { claimTrialNFT } from '../trialNftService';
import { safeLogError } from '../../utils/safeLogger';

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
});
