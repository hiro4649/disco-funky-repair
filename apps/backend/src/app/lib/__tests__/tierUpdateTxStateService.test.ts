import fs from 'fs';
import path from 'path';
import {
  buildTierUpdateReceiptEvidence,
  findPendingReceiptTierUpdates,
  findTierUpdateByTxHash,
  recordTierUpdateConfirmed,
  recordTierUpdateFailed,
  recordTierUpdateTxSent,
  type TierUpdateTxStatePrismaClient
} from '../tierUpdateTxStateService';
import { SCHEDULED_TIER_UPDATE_STATUSES } from '../tierUpdateState';

const txHash = `0x${'a'.repeat(64)}`;
const otherTxHash = `0x${'b'.repeat(64)}`;
const batchId = `0x${'c'.repeat(64)}`;
const contractAddress = '0x0000000000000000000000000000000000000001';
const fromAddress = '0x0000000000000000000000000000000000000002';
const toAddress = '0x0000000000000000000000000000000000000003';

const backendRoot = path.resolve(__dirname, '../../../../');
const tierSchedulerPath = path.join(backendRoot, 'src/app/lib/tierScheduler.ts');
const tierSyncPath = path.join(backendRoot, 'src/app/lib/tierSync.ts');

const buildMockPrisma = (): {
  prisma: TierUpdateTxStatePrismaClient;
  update: jest.Mock;
  findUnique: jest.Mock;
  findFirst: jest.Mock;
  findMany: jest.Mock;
} => {
  const update = jest.fn();
  const findUnique = jest.fn();
  const findFirst = jest.fn();
  const findMany = jest.fn();

  return {
    prisma: {
      scheduledTierUpdate: {
        update,
        findUnique,
        findFirst,
        findMany
      }
    },
    update,
    findUnique,
    findFirst,
    findMany
  };
};

describe('tierUpdateTxStateService', () => {
  it('imports without DB, RPC, wallet, contract, tx, or scheduler side effects', () => {
    const { update, findUnique, findFirst, findMany } = buildMockPrisma();

    expect(update).not.toHaveBeenCalled();
    expect(findUnique).not.toHaveBeenCalled();
    expect(findFirst).not.toHaveBeenCalled();
    expect(findMany).not.toHaveBeenCalled();
  });

  it('records TX_SENT evidence without marking the row processed', async () => {
    const { prisma, update } = buildMockPrisma();
    const sentAt = new Date('2026-05-28T00:01:00.000Z');

    await recordTierUpdateTxSent({
      prisma,
      scheduledTierUpdateId: 12,
      txHash,
      txChainId: 56,
      txContractAddress: contractAddress,
      txFrom: fromAddress,
      txTo: toAddress,
      batchId,
      sentAt
    });

    expect(update).toHaveBeenCalledWith({
      where: { id: 12 },
      data: expect.objectContaining({
        status: SCHEDULED_TIER_UPDATE_STATUSES.TX_SENT,
        txHash,
        txChainId: 56,
        txContractAddress: contractAddress,
        txFrom: fromAddress,
        txTo: toAddress,
        batchId,
        sentAt,
        heartbeatAt: sentAt
      })
    });
    expect(update.mock.calls[0][0].data).not.toHaveProperty('processed');
  });

  it('rejects unsafe tx sent evidence before writing', async () => {
    const { prisma, update } = buildMockPrisma();
    const sentAt = new Date('2026-05-28T00:01:00.000Z');

    await expect(recordTierUpdateTxSent({
      prisma,
      scheduledTierUpdateId: 12,
      txHash: 'not-a-hash',
      txChainId: 56,
      txContractAddress: contractAddress,
      txFrom: fromAddress,
      txTo: toAddress,
      batchId,
      sentAt
    })).rejects.toThrow('invalid_tier_update_tx_hash');

    await expect(recordTierUpdateTxSent({
      prisma,
      scheduledTierUpdateId: 12,
      txHash,
      txChainId: 1,
      txContractAddress: contractAddress,
      txFrom: fromAddress,
      txTo: toAddress,
      batchId,
      sentAt
    })).rejects.toThrow('invalid_tier_update_chain_id');

    await expect(recordTierUpdateTxSent({
      prisma,
      scheduledTierUpdateId: 12,
      txHash,
      txChainId: 56,
      txContractAddress: '0x1234',
      txFrom: fromAddress,
      txTo: toAddress,
      batchId,
      sentAt
    })).rejects.toThrow('invalid_tier_update_contract_address');

    expect(update).not.toHaveBeenCalled();
  });

  it('builds receipt evidence from safe public receipt fields only', () => {
    const receiptTimestamp = new Date('2026-05-28T00:02:00.000Z');

    expect(buildTierUpdateReceiptEvidence({
      txHash,
      txReceiptStatus: 1,
      txBlockNumber: '123456',
      txReceiptTimestamp: receiptTimestamp,
      txGasUsed: 21000n
    })).toEqual({
      txHash,
      txReceiptStatus: 1,
      txBlockNumber: 123456n,
      txReceiptTimestamp: receiptTimestamp,
      txGasUsed: '21000'
    });

    expect(() => buildTierUpdateReceiptEvidence({
      txHash,
      txReceiptStatus: 2,
      txBlockNumber: '123456',
      txReceiptTimestamp: receiptTimestamp,
      txGasUsed: 21000n
    })).toThrow('invalid_tier_update_receipt_status');
  });

  it('records confirmation only for a row that already has the same txHash', async () => {
    const { prisma, update, findUnique } = buildMockPrisma();
    const receiptTimestamp = new Date('2026-05-28T00:02:00.000Z');
    const confirmedAt = new Date('2026-05-28T00:03:00.000Z');
    findUnique.mockResolvedValue({ id: 12, txHash });

    await recordTierUpdateConfirmed({
      prisma,
      scheduledTierUpdateId: 12,
      txHash,
      txReceiptStatus: 1,
      txBlockNumber: 123456n,
      txReceiptTimestamp: receiptTimestamp,
      txGasUsed: '21000',
      confirmedAt
    });

    expect(findUnique).toHaveBeenCalledWith({
      where: { id: 12 },
      select: { id: true, txHash: true }
    });
    expect(update).toHaveBeenCalledWith({
      where: { id: 12 },
      data: expect.objectContaining({
        status: SCHEDULED_TIER_UPDATE_STATUSES.CONFIRMED,
        processed: true,
        txReceiptStatus: 1,
        txBlockNumber: 123456n,
        txReceiptTimestamp: receiptTimestamp,
        txGasUsed: '21000',
        confirmedAt,
        heartbeatAt: confirmedAt
      })
    });
  });

  it('does not confirm rows without matching txHash evidence', async () => {
    const { prisma, update, findUnique } = buildMockPrisma();
    const receiptTimestamp = new Date('2026-05-28T00:02:00.000Z');
    const confirmedAt = new Date('2026-05-28T00:03:00.000Z');
    findUnique.mockResolvedValueOnce({ id: 12, txHash: null });

    await expect(recordTierUpdateConfirmed({
      prisma,
      scheduledTierUpdateId: 12,
      txHash,
      txReceiptStatus: 1,
      txBlockNumber: 123456n,
      txReceiptTimestamp: receiptTimestamp,
      txGasUsed: '21000',
      confirmedAt
    })).rejects.toThrow('tier_update_tx_hash_required_for_confirmation');

    findUnique.mockResolvedValueOnce({ id: 12, txHash: otherTxHash });

    await expect(recordTierUpdateConfirmed({
      prisma,
      scheduledTierUpdateId: 12,
      txHash,
      txReceiptStatus: 1,
      txBlockNumber: 123456n,
      txReceiptTimestamp: receiptTimestamp,
      txGasUsed: '21000',
      confirmedAt
    })).rejects.toThrow('tier_update_tx_hash_mismatch');

    expect(update).not.toHaveBeenCalled();
  });

  it('records failed evidence with safe classifications and no raw error payload', async () => {
    const { prisma, update } = buildMockPrisma();
    const failedAt = new Date('2026-05-28T00:04:00.000Z');

    await recordTierUpdateFailed({
      prisma,
      scheduledTierUpdateId: 12,
      safeErrorKind: 'tx_receipt_timeout',
      safeSummary: {
        reason: 'receipt_not_observed',
        retryable: true
      },
      failedAt,
      status: SCHEDULED_TIER_UPDATE_STATUSES.MANUAL_REVIEW
    });

    expect(update).toHaveBeenCalledWith({
      where: { id: 12 },
      data: expect.objectContaining({
        status: SCHEDULED_TIER_UPDATE_STATUSES.MANUAL_REVIEW,
        safeErrorKind: 'tx_receipt_timeout',
        safeSummary: {
          reason: 'receipt_not_observed',
          retryable: true
        },
        failedAt,
        heartbeatAt: failedAt
      })
    });

    await expect(recordTierUpdateFailed({
      prisma,
      scheduledTierUpdateId: 12,
      safeErrorKind: 'unknown',
      safeSummary: {
        errorMessage: 'raw provider details must not be stored'
      },
      failedAt
    })).rejects.toThrow('unsafe_tier_update_safe_summary');
  });

  it('finds tx rows by txHash and pending receipt rows without runtime polling', async () => {
    const { prisma, findFirst, findMany } = buildMockPrisma();

    await findTierUpdateByTxHash({ prisma, txHash });
    expect(findFirst).toHaveBeenCalledWith({
      where: { txHash }
    });

    await findPendingReceiptTierUpdates({ prisma, limit: 10 });
    expect(findMany).toHaveBeenCalledWith({
      where: {
        status: SCHEDULED_TIER_UPDATE_STATUSES.TX_SENT,
        txHash: { not: null }
      },
      orderBy: [
        { sentAt: 'asc' },
        { id: 'asc' }
      ],
      take: 10
    });
  });

  it('keeps runtime scheduler and tx send modules disconnected from this service', () => {
    const tierScheduler = fs.readFileSync(tierSchedulerPath, 'utf8');
    const tierSync = fs.readFileSync(tierSyncPath, 'utf8');

    expect(tierScheduler).not.toContain('tierUpdateTxStateService');
    expect(tierScheduler).not.toContain('recordTierUpdateTxSent');
    expect(tierScheduler).not.toContain('recordTierUpdateConfirmed');
    expect(tierScheduler).not.toContain('findPendingReceiptTierUpdates');
    expect(tierSync).not.toContain('tierUpdateTxStateService');
    expect(tierSync).not.toContain('recordTierUpdateTxSent');
  });
});
